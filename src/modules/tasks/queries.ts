import { prisma } from "@/server/db";

export async function getTasks(
  workspaceId: string,
  opts: { assigneeId?: string; status?: string; page?: number; pageSize?: number } = {}
) {
  const { assigneeId, status, page = 1, pageSize = 50 } = opts;

  const where = {
    workspaceId,
    ...(assigneeId && { assigneeId }),
    ...(status && { status }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        company: { select: { name: true } },
        deal: { select: { title: true } },
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
