import { auth } from "@/server/auth";
import { getActiveWorkspace } from "@/server/workspaces";
import { prisma } from "@/server/db";
import { redirect, notFound } from "next/navigation";
import { ContactForm } from "@/modules/contacts/components/contact-form";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) redirect("/login");

  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { companies: { select: { companyId: true } } },
  });
  if (!contact) notFound();

  const [members, companies] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.company.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Edit contact
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Update {contact.firstName} {contact.lastName}.
        </p>
      </div>

      <ContactForm
        initialData={{
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          location: contact.location,
          lifecycle: contact.lifecycle,
          ownerId: contact.ownerId,
        }}
        owners={members.map((m) => m.user)}
        companies={companies}
        selectedCompanyIds={contact.companies.map((c) => c.companyId)}
      />
    </div>
  );
}
