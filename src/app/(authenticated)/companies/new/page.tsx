import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { CompanyForm } from "@/modules/companies/components/company-form";

export default async function NewCompanyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const owners = members.map((m) => m.user);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          New company
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Add a new company to your CRM.
        </p>
      </div>

      <CompanyForm owners={owners} />
    </div>
  );
}
