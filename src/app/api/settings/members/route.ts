import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/permissions";

const VALID_ROLES = ["admin", "manager", "sales_rep", "read_only"] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const perm = await requirePermission(workspace.id, session.user.id, "users:invite");
  if (!perm.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const assignedRole = (role as string) || "sales_rep";
  if (!(VALID_ROLES as readonly string[]).includes(assignedRole)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No account found with this email. They must register first." }, { status: 404 });
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: assignedRole,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const perm = await requirePermission(workspace.id, session.user.id, "users:manage");
  if (!perm.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { memberId, role } = await req.json();
  if (!memberId || !role) {
    return NextResponse.json({ error: "MemberId and role required" }, { status: 400 });
  }

  if (!(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
  });

  return NextResponse.json({ ok: true });
}
