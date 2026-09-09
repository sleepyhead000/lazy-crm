import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { getTasks } from "@/modules/tasks/queries";
import { completeTask, cancelTask } from "@/modules/tasks/actions";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const params = await searchParams;
  const data = await getTasks(workspace.id, {
    status: params.status || "open",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Tasks
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {data.total} {params.status === "completed" ? "completed" : "open"} tasks
        </p>
      </div>

      <div className="flex gap-2">
        <a href="/tasks?status=open">
          <Button variant={!params.status || params.status === "open" ? "primary" : "secondary"} size="sm">Open</Button>
        </a>
        <a href="/tasks?status=completed">
          <Button variant={params.status === "completed" ? "primary" : "secondary"} size="sm">Completed</Button>
        </a>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] divide-y divide-[var(--color-border-subtle)]">
        {data.tasks.length === 0 ? (
          <div className="px-4 py-12 text-center text-[var(--color-text-muted)]">No tasks.</div>
        ) : (
          data.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {task.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                ) : task.dueDate && new Date(task.dueDate) < new Date() ? (
                  <Clock className="w-4 h-4 text-[var(--color-danger)]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border)]" />
                )}
                <div>
                  <p className={`text-sm font-medium ${task.status === "completed" ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)]"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.dueDate && (
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "completed" ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}`}>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.company && <span className="text-xs text-[var(--color-text-muted)]">· {task.company.name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}>
                  {task.priority}
                </Badge>
                {task.status === "open" && (
                  <form action={completeTask.bind(null, task.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
