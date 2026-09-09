import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { Building2, Users, Handshake, CheckSquare } from "lucide-react";
import Link from "next/link";

async function getDashboardData(workspaceId: string) {
  const [
    companyCount,
    contactCount,
    dealCount,
    taskCount,
    recentDeals,
    upcomingTasks,
  ] = await Promise.all([
    prisma.company.count({ where: { workspaceId, archivedAt: null } }),
    prisma.contact.count({ where: { workspaceId, archivedAt: null } }),
    prisma.deal.count({ where: { workspaceId, archivedAt: null } }),
    prisma.task.count({ where: { workspaceId, status: "open" } }),
    prisma.deal.findMany({
      where: { workspaceId, archivedAt: null },
      include: { stage: true, owner: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        workspaceId,
        status: "open",
        dueDate: { not: null },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return {
    companyCount,
    contactCount,
    dealCount,
    taskCount,
    recentDeals,
    upcomingTasks,
  };
}

const stats = [
  { key: "companies", label: "Companies", icon: Building2, color: "var(--color-primary)" },
  { key: "contacts", label: "Contacts", icon: Users, color: "var(--color-success)" },
  { key: "deals", label: "Open Deals", icon: Handshake, color: "var(--color-warning)" },
  { key: "tasks", label: "Open Tasks", icon: CheckSquare, color: "var(--color-danger)" },
] as const;

export default async function OverviewPage() {
  const session = await auth();
  const workspace = await getActiveWorkspace(session!.user.id);

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--color-text-secondary)]">No workspace found.</p>
      </div>
    );
  }

  const data = await getDashboardData(workspace.id);
  const counts = {
    companies: data.companyCount,
    contacts: data.contactCount,
    deals: data.dealCount,
    tasks: data.taskCount,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Overview of your pipeline and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.key}
            className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {s.label}
              </span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p
              className="mt-2 text-3xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {counts[s.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text)]">
              Recent Deals
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {data.recentDeals.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                No deals yet.{" "}
                <Link href="/deals/new" className="text-[var(--color-primary)] hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              data.recentDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-raised)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {deal.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {deal.stage.name}
                    </p>
                  </div>
                  <div className="text-right">
                    {deal.value != null && (
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        ${deal.value.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {deal.owner.name}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text)]">
              Upcoming Tasks
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {data.upcomingTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                No upcoming tasks.
              </div>
            ) : (
              data.upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "urgent"
                        ? "bg-[var(--color-danger-light)] text-[var(--color-danger)]"
                        : task.priority === "high"
                          ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                          : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
