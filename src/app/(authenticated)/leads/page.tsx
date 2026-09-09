import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { getLeads } from "@/modules/leads/queries";
import Link from "next/link";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const params = await searchParams;
  const data = await getLeads(workspace.id, {
    search: params.search,
    status: params.status,
    page: Number(params.page) || 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Leads
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{data.total} leads</p>
        </div>
        <Link href="/leads/new"><Button>New lead</Button></Link>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Company</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-[var(--color-text-secondary)]">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {data.leads.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-[var(--color-text-muted)]">No leads found.</td></tr>
            ) : (
              data.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors" onClick={() => window.location.href = `/leads/${lead.id}`}>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{lead.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{lead.companyName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={lead.status === "qualified" ? "success" : lead.status === "converted" ? "default" : "default"}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{lead.owner.name || lead.owner.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
