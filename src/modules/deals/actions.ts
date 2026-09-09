"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { requirePermission } from "@/server/permissions";
import { createDealSchema, moveDealStageSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createDeal(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = createDealSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const { contactIds, expectedCloseDate, ownerId: _ownerId, ...data } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const deal = await tx.deal.create({
      data: {
        workspaceId: workspace.id,
        ...data,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        ownerId: session.user.id,
      },
    });

    if (contactIds?.length) {
      await tx.dealContact.createMany({
        data: contactIds.map((contactId) => ({ dealId: deal.id, contactId })),
      });
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "create",
        entityType: "deal",
        entityId: deal.id,
        after: JSON.stringify(deal),
      },
    });

    return deal;
  });

  revalidatePath("/deals");
  return { success: true as const, data: result };
}

export async function moveDealStage(dealId: string, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:update");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = moveDealStageSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.deal.findFirst({
    where: { id: dealId, workspaceId: workspace.id },
    include: { stage: true },
  });
  if (!existing) return { success: false as const, error: "Not found" };

  const newStage = await prisma.pipelineStage.findFirst({
    where: { id: parsed.data.stageId, pipelineId: existing.pipelineId },
  });
  if (!newStage) return { success: false as const, error: "Invalid stage" };

  const isClosing = newStage.type === "won" || newStage.type === "lost";

  const result = await prisma.$transaction(async (tx) => {
    const deal = await tx.deal.update({
      where: { id: dealId },
      data: {
        stageId: parsed.data.stageId,
        ...(isClosing && { closedAt: new Date() }),
        ...(newStage.type === "won" && { winReason: parsed.data.winReason }),
        ...(newStage.type === "lost" && { lossReason: parsed.data.lossReason }),
      },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "stage_change",
        entityType: "deal",
        entityId: dealId,
        before: JSON.stringify({ stageId: existing.stageId, stageName: existing.stage.name }),
        after: JSON.stringify({ stageId: newStage.id, stageName: newStage.name }),
      },
    });

    return deal;
  });

  revalidatePath("/deals");
  return { success: true as const, data: result };
}

export async function archiveDeal(dealId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:archive");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  await prisma.deal.update({
    where: { id: dealId },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/deals");
  return { success: true as const };
}
