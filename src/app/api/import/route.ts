import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/permissions";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 10_000;
const VALID_ENTITY_TYPES = ["company", "contact", "lead"] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const perm = await requirePermission(workspace.id, session.user.id, "import:execute");
  if (!perm.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const entityType = formData.get("entityType") as string;

  if (!file || !entityType) {
    return NextResponse.json({ error: "File and entity type required" }, { status: 400 });
  }

  if (!(VALID_ENTITY_TYPES as readonly string[]).includes(entityType)) {
    return NextResponse.json({ error: `Invalid entity type. Must be one of: ${VALID_ENTITY_TYPES.join(", ")}` }, { status: 400 });
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split("\n").filter((l) => l.trim());
  const headers = lines[0]?.split(",").map((h) => h.trim()) ?? [];
  const rows = lines.slice(1);

  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows. Maximum is ${MAX_ROWS} rows per import` }, { status: 400 });
  }

  const job = await prisma.importJob.create({
    data: {
      workspaceId: workspace.id,
      entityType,
      fileName: file.name,
      status: "processing",
      totalRows: rows.length,
      createdById: session.user.id,
    },
  });

  let successRows = 0;
  let errorRows = 0;
  const errors: { row: number; field: string; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const values = rows[i].split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    headers.forEach((h, j) => {
      record[h] = values[j] || "";
    });

    try {
      if (entityType === "company" && record.name) {
        await prisma.company.create({
          data: {
            workspaceId: workspace.id,
            name: record.name,
            domain: record.domain || null,
            industry: record.industry || null,
            size: record.size || null,
            location: record.location || null,
            ownerId: session.user.id,
          },
        });
        successRows++;
      } else if (entityType === "contact" && record.firstName && record.lastName) {
        await prisma.contact.create({
          data: {
            workspaceId: workspace.id,
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email || null,
            phone: record.phone || null,
            title: record.title || null,
            ownerId: session.user.id,
          },
        });
        successRows++;
      } else if (entityType === "lead" && record.name) {
        await prisma.lead.create({
          data: {
            workspaceId: workspace.id,
            name: record.name,
            email: record.email || null,
            phone: record.phone || null,
            companyName: record.companyName || null,
            ownerId: session.user.id,
          },
        });
        successRows++;
      } else {
        errorRows++;
        errors.push({ row: i + 2, field: "all", message: "Missing required fields" });
      }
    } catch (err) {
      errorRows++;
      errors.push({ row: i + 2, field: "all", message: String(err) });
    }
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: errorRows === rows.length ? "failed" : "completed",
      successRows,
      errorRows,
      errors: errors.length ? JSON.stringify(errors) : null,
    },
  });

  return NextResponse.json({
    ok: true,
    job: { id: job.id, totalRows: rows.length, successRows, errorRows },
  });
}
