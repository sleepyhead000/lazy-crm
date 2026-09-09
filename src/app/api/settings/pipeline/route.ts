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

  const perm = await requirePermission(workspace.id, session.user.id, "pipeline:manage");
  if (!perm.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pipelineId, stages } = await req.json();
  if (!pipelineId || !stages) {
    return NextResponse.json({ error: "PipelineId and stages required" }, { status: 400 });
  }

  const pipeline = await prisma.pipeline.findFirst({
    where: { id: pipelineId, workspaceId: workspace.id },
  });
  if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const existingStageIds = stages
      .filter((s: { id?: string }) => s.id && !s.id.startsWith("temp-"))
      .map((s: { id: string }) => s.id);

    await tx.pipelineStage.deleteMany({
      where: {
        pipelineId,
        id: { notIn: existingStageIds },
      },
    });

    for (const stage of stages) {
      if (stage.id && !stage.id.startsWith("temp-")) {
        await tx.pipelineStage.update({
          where: { id: stage.id },
          data: { name: stage.name, order: stage.order, type: stage.type },
        });
      } else {
        await tx.pipelineStage.create({
          data: {
            pipelineId,
            name: stage.name,
            order: stage.order,
            type: stage.type || "active",
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
