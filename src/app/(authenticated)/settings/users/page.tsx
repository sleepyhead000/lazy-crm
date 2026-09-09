import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { UserTable, InviteForm } from "@/modules/settings/components/user-table";

export default async function SettingsUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Users
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage workspace members and roles.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Invite user</h2>
        <InviteForm />
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Members</h2>
        <UserTable members={members} />
      </div>
    </div>
  );
}
