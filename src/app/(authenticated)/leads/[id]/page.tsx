import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect, notFound } from "next/navigation";
import { getLeadById } from "@/modules/leads/queries";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { LogActivityForm } from "@/modules/activities/components/activity-form";
import Link from "next/link";
import { ConvertLeadDialog } from "@/modules/leads/components/convert-lead-dialog";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;
  const lead = await getLeadById(workspace.id, id);
  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>{lead.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={lead.status === "qualified" ? "success" : lead.status === "converted" ? "default" : "default"}>{lead.status}</Badge>
            {lead.companyName && <span className="text-sm text-[var(--color-text-secondary)]">{lead.companyName}</span>}
          </div>
        </div>
        {lead.status !== "converted" && (
          <ConvertLeadDialog leadId={lead.id} leadName={lead.name} defaultCompanyName={lead.companyName} />
        )}
      </div>

      {lead.status === "converted" && (
        <div className="p-3 rounded-md bg-[var(--color-success-light)] text-sm text-[var(--color-success)]">
          Converted on {lead.convertedAt ? new Date(lead.convertedAt).toLocaleDateString() : "—"}
          {lead.convertedContactId && <Link href={`/contacts/${lead.convertedContactId}`} className="ml-2 underline">View contact</Link>}
        </div>
      )}

      <LogActivityForm leadId={lead.id} />

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-text)]">Details</h3>
        <div className="space-y-2 text-sm">
          {lead.email && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Email</span><span className="text-[var(--color-text)]">{lead.email}</span></div>}
          {lead.phone && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Phone</span><span className="text-[var(--color-text)]">{lead.phone}</span></div>}
          <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Owner</span><span className="text-[var(--color-text)]">{lead.owner.name || lead.owner.email}</span></div>
          {lead.qualificationNotes && <div><span className="text-[var(--color-text-muted)]">Notes</span><p className="mt-1 text-[var(--color-text)]">{lead.qualificationNotes}</p></div>}
        </div>
      </div>

      <Link href={`/leads/${lead.id}/edit`}>
        <Button variant="secondary">Edit lead</Button>
      </Link>
    </div>
  );
}
