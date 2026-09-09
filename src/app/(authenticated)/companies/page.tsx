import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { getCompanies } from "@/modules/companies/queries";
import { CompanyTable } from "@/modules/companies/components/company-table";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const params = await searchParams;
  const page = Number(params.page) || 1;

  const data = await getCompanies(workspace.id, {
    search: params.search,
    page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Companies
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your company records.
        </p>
      </div>

      <CompanyTable
        companies={data.companies}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
      />
    </div>
  );
}
