import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect, notFound } from "next/navigation";
import { getDealById } from "@/modules/deals/queries";
import Link from "next/link";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { LogActivityForm } from "@/modules/activities/components/activity-form";
import { Handshake, Pencil, Calendar, Building2, User } from "lucide-react";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;
  const deal = await getDealById(workspace.id, id);
  if (!deal) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
            <Handshake className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deal.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
              <Badge>{deal.stage.name}</Badge>
              {deal.value != null && (
                <span className="font-semibold text-[var(--color-text)]">
                  ${deal.value.toLocaleString()}
                </span>
              )}
              {deal.company && (
                <Link
                  href={`/companies/${deal.company.id}`}
                  className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                >
                  <Building2 className="w-3 h-3" />
                  {deal.company.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        <Link href={`/deals/${deal.id}/edit`}>
          <Button variant="secondary" size="sm">
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {deal.contacts.length > 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-medium text-[var(--color-text)]">Contacts</h2>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {deal.contacts.map(({ contact }) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.email && (
                        <p className="text-xs text-[var(--color-text-muted)]">{contact.email}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <LogActivityForm dealId={deal.id} companyId={deal.companyId ?? undefined} />

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text)]">Activity Timeline</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {deal.activities.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No activity yet.
                </div>
              ) : (
                deal.activities.map((activity) => (
                  <div key={activity.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>{activity.type}</Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          by {activity.creator.name ?? "Unknown"}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {deal.tasks.length > 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-medium text-[var(--color-text)]">Open Tasks</h2>
              </div>
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {deal.tasks.map((task) => (
                  <div key={task.id} className="px-4 py-3 flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text)]">{task.title}</p>
                    {task.dueDate && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Deal Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Stage</span>
                <Badge>{deal.stage.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Pipeline</span>
                <span className="text-[var(--color-text)]">{deal.pipeline.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Owner</span>
                <span className="text-[var(--color-text)]">
                  {deal.owner.name || deal.owner.email}
                </span>
              </div>
              {deal.value != null && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Value</span>
                  <span className="text-[var(--color-text)] font-medium">
                    ${deal.value.toLocaleString()}
                  </span>
                </div>
              )}
              {deal.expectedCloseDate && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Expected close</span>
                  <span className="text-[var(--color-text)]">
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {deal.probability != null && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Probability</span>
                  <span className="text-[var(--color-text)]">{deal.probability}%</span>
                </div>
              )}
              {deal.closedAt && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Closed</span>
                  <span className="text-[var(--color-text)]">
                    {new Date(deal.closedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {deal.winReason && (
            <div className="rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] p-4">
              <h3 className="text-sm font-medium text-[var(--color-success)]">Win reason</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]">{deal.winReason}</p>
            </div>
          )}

          {deal.lossReason && (
            <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4">
              <h3 className="text-sm font-medium text-[var(--color-danger)]">Loss reason</h3>
              <p className="mt-1 text-sm text-[var(--color-text)]">{deal.lossReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
