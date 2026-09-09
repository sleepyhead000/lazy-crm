import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { PipelineEditor } from "@/modules/settings/components/pipeline-editor";

export default async function SettingsPipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  let pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId: workspace.id, isDefault: true },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        workspaceId: workspace.id,
        name: "Sales Pipeline",
        isDefault: true,
        stages: {
          create: [
            { name: "Qualification", order: 1, type: "active" },
            { name: "Discovery", order: 2, type: "active" },
            { name: "Proposal", order: 3, type: "active" },
            { name: "Negotiation", order: 4, type: "active" },
            { name: "Closed Won", order: 5, type: "won" },
            { name: "Closed Lost", order: 6, type: "lost" },
          ],
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Pipeline
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Configure your sales pipeline stages.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">{pipeline.name}</h2>
        <PipelineEditor pipeline={pipeline} />
      </div>
    </div>
  );
}
