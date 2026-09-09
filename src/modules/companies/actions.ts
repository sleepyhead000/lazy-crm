"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { requirePermission } from "@/server/permissions";
import { createCompanySchema, updateCompanySchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createCompany(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const { name, domain, industry, size, location } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        workspaceId: workspace.id,
        name,
        domain: domain || null,
        industry: industry || null,
        size: size || null,
        location: location || null,
        ownerId: session.user.id,
      },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "create",
        entityType: "company",
        entityId: company.id,
        after: JSON.stringify(company),
      },
    });

    return company;
  });

  revalidatePath("/companies");
  return { success: true as const, data: result };
}

export async function updateCompany(companyId: string, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const existing = await prisma.company.findFirst({
    where: { id: companyId, workspaceId: workspace.id },
  });
  if (!existing) return { success: false as const, error: "Not found" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:update");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = updateCompanySchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.update({
      where: { id: companyId },
      data: {
        ...parsed.data,
        domain: parsed.data.domain || null,
      },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "update",
        entityType: "company",
        entityId: companyId,
        before: JSON.stringify(existing),
        after: JSON.stringify(company),
      },
    });

    return company;
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { success: true as const, data: result };
}

export async function archiveCompany(companyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:archive");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: { archivedAt: new Date() },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "archive",
        entityType: "company",
        entityId: companyId,
      },
    });
  });

  revalidatePath("/companies");
  return { success: true as const };
}

export async function restoreCompany(companyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:restore");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: { archivedAt: null },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "restore",
        entityType: "company",
        entityId: companyId,
      },
    });
  });

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { success: true as const };
}
