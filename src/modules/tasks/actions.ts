"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { requirePermission } from "@/server/permissions";
import { createTaskSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createTask(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const { dueDate, ...data } = parsed.data;

  const result = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      ...data,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  return { success: true as const, data: result };
}

export async function completeTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const task = await prisma.task.findFirst({ where: { id: taskId, workspaceId: workspace.id } });
  if (!task) return { success: false as const, error: "Not found" };

  if (task.assigneeId !== session.user.id) {
    const perm = await requirePermission(workspace.id, session.user.id, "records:update");
    if (!perm.ok) return { success: false as const, error: "Forbidden" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "completed", completedAt: new Date(), completedById: session.user.id },
  });

  revalidatePath("/tasks");
  return { success: true as const };
}

export async function cancelTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "canceled" },
  });

  revalidatePath("/tasks");
  return { success: true as const };
}
