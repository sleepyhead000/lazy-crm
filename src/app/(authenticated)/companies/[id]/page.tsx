import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect, notFound } from "next/navigation";
import { getCompanyById } from "@/modules/companies/queries";
import { CompanyDetail } from "@/modules/companies/components/company-detail";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;
  const company = await getCompanyById(workspace.id, id);
  if (!company) notFound();

  return <CompanyDetail company={company} />;
}
