import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { getPipelines } from "@/modules/deals/queries";
import { DealForm } from "@/modules/deals/components/deal-form";

export default async function NewDealPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const [pipelines, members, companies, contacts] = await Promise.all([
    getPipelines(workspace.id),
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.company.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New deal
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Create a new deal in your pipeline.
        </p>
      </div>

      <DealForm
        pipelines={pipelines}
        owners={members.map((m) => m.user)}
        companies={companies}
        contacts={contacts}
      />
    </div>
  );
}
