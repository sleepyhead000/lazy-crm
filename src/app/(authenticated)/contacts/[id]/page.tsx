import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect, notFound } from "next/navigation";
import { getContactById } from "@/modules/contacts/queries";
import { ContactDetail } from "@/modules/contacts/components/contact-detail";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;
  const contact = await getContactById(workspace.id, id);
  if (!contact) notFound();

  return <ContactDetail contact={contact} />;
}
