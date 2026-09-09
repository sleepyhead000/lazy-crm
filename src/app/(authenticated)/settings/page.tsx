import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/modules/settings/components/workspace-form";
import { PasswordChangeForm } from "@/modules/settings/components/password-change-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  const hasPassword = !!user?.password;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your workspace settings.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Workspace</h2>
        <WorkspaceForm workspace={workspace} />
      </div>

      {hasPassword && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-4">Security</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Change your account password.
          </p>
          <PasswordChangeForm />
        </div>
      )}
    </div>
  );
}
