import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { ImportUploader } from "@/modules/settings/components/import-uploader";

export default async function SettingsImportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const importJobs = await prisma.importJob.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Import Data
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Upload CSV files to import records into your CRM.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <ImportUploader importJobs={importJobs} />
      </div>
    </div>
  );
}
