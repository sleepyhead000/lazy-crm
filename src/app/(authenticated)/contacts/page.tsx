import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { redirect } from "next/navigation";
import { getContacts } from "@/modules/contacts/queries";
import { ContactTable } from "@/modules/contacts/components/contact-table";

export default async function ContactsPage({
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

  const data = await getContacts(workspace.id, {
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
          Contacts
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your contacts.
        </p>
      </div>

      <ContactTable
        contacts={data.contacts}
        total={data.total}
        page={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
      />
    </div>
  );
}
