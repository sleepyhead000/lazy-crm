import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { requirePermission } from "@/server/permissions";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const perm = await requirePermission(workspace.id, session.user.id, "workspace:manage");
  if (!perm.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { name },
  });

  return NextResponse.json({ ok: true });
}
