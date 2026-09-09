import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function getLeads(
  workspaceId: string,
  opts: { search?: string; status?: string; ownerId?: string; page?: number; pageSize?: number } = {}
) {
  const { search, status, ownerId, page = 1, pageSize = 20 } = opts;

  const where: Prisma.LeadWhereInput = {
    workspaceId,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ],
    }),
    ...(status && { status }),
    ...(ownerId && { ownerId }),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getLeadById(workspaceId: string, leadId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
        include: { creator: { select: { name: true } } },
      },
      tasks: { orderBy: { dueDate: "asc" } },
    },
  });
}
