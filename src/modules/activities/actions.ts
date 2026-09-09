"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { revalidatePath } from "next/cache";

interface LogActivityInput {
  type: "call" | "meeting" | "email" | "note" | "other";
  description: string;
  duration?: number;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
}

export async function logActivity(input: LogActivityInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  if (!input.description?.trim()) {
    return { success: false as const, error: "Description is required" };
  }

  const activity = await prisma.activity.create({
    data: {
      workspaceId: workspace.id,
      type: input.type,
      description: input.description,
      duration: input.duration ?? null,
      companyId: input.companyId ?? null,
      contactId: input.contactId ?? null,
      dealId: input.dealId ?? null,
      leadId: input.leadId ?? null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/overview");
  if (input.companyId) revalidatePath(`/companies/${input.companyId}`);
  if (input.contactId) revalidatePath(`/contacts/${input.contactId}`);
  if (input.dealId) revalidatePath(`/deals/${input.dealId}`);
  if (input.leadId) revalidatePath(`/leads/${input.leadId}`);

  return { success: true as const, data: activity };
}
