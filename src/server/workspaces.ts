import { auth } from "./auth";
import { prisma } from "./db";
import { cookies } from "next/headers";

export async function getActiveWorkspace(userId: string) {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get("activeWorkspaceId")?.value;

  if (workspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
      include: { workspace: true },
    });
    if (membership) return membership.workspace;
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  return membership?.workspace ?? null;
}

export async function requireWorkspace() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) throw new Error("No workspace");

  return { session, workspace };
}
