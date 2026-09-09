import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  const pipeline = await prisma.pipeline.upsert({
    where: { id: "default-pipeline" },
    update: {},
    create: {
      id: "default-pipeline",
      workspaceId: workspace.id,
      name: "Sales Pipeline",
      isDefault: true,
    },
  });

  const stages = [
    { name: "Qualification", order: 1, type: "active" },
    { name: "Discovery", order: 2, type: "active" },
    { name: "Proposal", order: 3, type: "active" },
    { name: "Negotiation", order: 4, type: "active" },
    { name: "Closed Won", order: 5, type: "won" },
    { name: "Closed Lost", order: 6, type: "lost" },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { pipelineId_name: { pipelineId: pipeline.id, name: stage.name } },
      update: { order: stage.order, type: stage.type },
      create: { ...stage, pipelineId: pipeline.id },
    });
  }

  console.log("Seed complete:", { workspaceId: workspace.id, pipelineId: pipeline.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
