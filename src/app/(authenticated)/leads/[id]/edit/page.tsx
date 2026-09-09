import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect, notFound } from "next/navigation";
import { LeadForm } from "@/modules/leads/components/lead-form";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;
  const lead = await prisma.lead.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!lead) notFound();

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>Edit lead</h1>
      </div>
      <LeadForm
        initialData={{ id: lead.id, name: lead.name, email: lead.email, phone: lead.phone, companyName: lead.companyName, status: lead.status, qualificationNotes: lead.qualificationNotes, ownerId: lead.ownerId }}
        owners={members.map((m) => m.user)}
      />
    </div>
  );
}
