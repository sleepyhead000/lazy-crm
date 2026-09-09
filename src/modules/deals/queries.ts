import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function getDeals(workspaceId: string) {
  return prisma.deal.findMany({
    where: { workspaceId, archivedAt: null },
    include: {
      stage: true,
      pipeline: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
      contacts: { include: { contact: { select: { id: true, firstName: true, lastName: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDealById(workspaceId: string, dealId: string) {
  return prisma.deal.findFirst({
    where: { id: dealId, workspaceId },
    include: {
      stage: true,
      pipeline: true,
      owner: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } },
      contacts: {
        include: { contact: { select: { id: true, firstName: true, lastName: true, email: true } } },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
        include: { creator: { select: { name: true } } },
      },
      tasks: {
        where: { status: "open" },
        orderBy: { dueDate: "asc" },
      },
      tags: { include: { tag: true } },
    },
  });
}

export async function getPipelines(workspaceId: string) {
  return prisma.pipeline.findMany({
    where: { workspaceId },
    include: {
      stages: { orderBy: { order: "asc" } },
    },
  });
}

export async function getBoardData(workspaceId: string, pipelineId?: string) {
  const pipeline = pipelineId
    ? await prisma.pipeline.findFirst({ where: { id: pipelineId, workspaceId } })
    : await prisma.pipeline.findFirst({ where: { workspaceId, isDefault: true } });

  if (!pipeline) return null;

  const [stages, deals] = await Promise.all([
    prisma.pipelineStage.findMany({
      where: { pipelineId: pipeline.id },
      orderBy: { order: "asc" },
    }),
    prisma.deal.findMany({
      where: { pipelineId: pipeline.id, workspaceId, archivedAt: null },
      include: {
        owner: { select: { name: true } },
        company: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { pipeline, stages, deals };
}
