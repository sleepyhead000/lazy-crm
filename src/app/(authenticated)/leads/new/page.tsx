import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { LeadForm } from "@/modules/leads/components/lead-form";

export default async function NewLeadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>New lead</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Capture a new potential relationship.</p>
      </div>
      <LeadForm owners={members.map((m) => m.user)} />
    </div>
  );
}
