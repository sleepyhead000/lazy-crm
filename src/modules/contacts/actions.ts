"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { requirePermission } from "@/server/permissions";
import { createContactSchema, updateContactSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createContact(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = createContactSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const { companyIds, ...data } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        workspaceId: workspace.id,
        ...data,
        email: data.email || null,
        ownerId: session.user.id,
      },
    });

    if (companyIds?.length) {
      await tx.companyContact.createMany({
        data: companyIds.map((companyId) => ({
          companyId,
          contactId: contact.id,
        })),
      });
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "create",
        entityType: "contact",
        entityId: contact.id,
        after: JSON.stringify(contact),
      },
    });

    return contact;
  });

  revalidatePath("/contacts");
  return { success: true as const, data: result };
}

export async function updateContact(contactId: string, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const existing = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId: workspace.id },
  });
  if (!existing) return { success: false as const, error: "Not found" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:update");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = updateContactSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const { companyIds, ...data } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.update({
      where: { id: contactId },
      data: {
        ...data,
        email: data.email || null,
      },
    });

    if (companyIds !== undefined) {
      await tx.companyContact.deleteMany({ where: { contactId } });
      if (companyIds.length) {
        await tx.companyContact.createMany({
          data: companyIds.map((companyId) => ({ companyId, contactId })),
        });
      }
    }

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "update",
        entityType: "contact",
        entityId: contactId,
        before: JSON.stringify(existing),
        after: JSON.stringify(contact),
      },
    });

    return contact;
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true as const, data: result };
}

export async function archiveContact(contactId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:archive");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id: contactId },
      data: { archivedAt: new Date() },
    });
    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "archive",
        entityType: "contact",
        entityId: contactId,
      },
    });
  });

  revalidatePath("/contacts");
  return { success: true as const };
}

export async function restoreContact(contactId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:restore");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id: contactId },
      data: { archivedAt: null },
    });
    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "restore",
        entityType: "contact",
        entityId: contactId,
      },
    });
  });

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true as const };
}
