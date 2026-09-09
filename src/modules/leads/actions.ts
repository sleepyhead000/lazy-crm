"use server";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveWorkspace } from "@/server/workspaces";
import { requirePermission } from "@/server/permissions";
import { createLeadSchema, updateLeadSchema, convertLeadSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createLead(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const result = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: { workspaceId: workspace.id, ...parsed.data, email: parsed.data.email || null, ownerId: session.user.id },
    });
    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "create",
        entityType: "lead",
        entityId: lead.id,
        after: JSON.stringify(lead),
      },
    });
    return lead;
  });

  revalidatePath("/leads");
  return { success: true as const, data: result };
}

export async function updateLead(leadId: string, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:update");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = updateLeadSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const result = await prisma.lead.update({
    where: { id: leadId },
    data: { ...parsed.data, email: parsed.data.email || null },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { success: true as const, data: result };
}

export async function convertLead(leadId: string, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

  const workspace = await getActiveWorkspace(session.user.id);
  if (!workspace) return { success: false as const, error: "No workspace" };

  const perm = await requirePermission(workspace.id, session.user.id, "records:create");
  if (!perm.ok) return { success: false as const, error: "Forbidden" };

  const parsed = convertLeadSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.flatten().fieldErrors };

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId: workspace.id },
  });
  if (!lead) return { success: false as const, error: "Lead not found" };
  if (lead.status === "converted") return { success: false as const, error: "Lead already converted" };

  const pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId: workspace.id, isDefault: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    let company = null;
    if (parsed.data.createCompany) {
      company = await tx.company.create({
        data: {
          workspaceId: workspace.id,
          name: parsed.data.companyName || lead.companyName || lead.name,
          ownerId: lead.ownerId,
        },
      });
    }

    const contact = await tx.contact.create({
      data: {
        workspaceId: workspace.id,
        firstName: lead.name.split(" ")[0] || lead.name,
        lastName: lead.name.split(" ").slice(1).join(" ") || "",
        email: lead.email,
        phone: lead.phone,
        ownerId: lead.ownerId,
        lifecycle: "lead",
      },
    });

    if (company) {
      await tx.companyContact.create({
        data: { companyId: company.id, contactId: contact.id },
      });
    }

    let deal = null;
    if (parsed.data.createDeal && pipeline) {
      const firstStage = await tx.pipelineStage.findFirst({
        where: { pipelineId: pipeline.id },
        orderBy: { order: "asc" },
      });
      if (firstStage) {
        deal = await tx.deal.create({
          data: {
            workspaceId: workspace.id,
            pipelineId: pipeline.id,
            stageId: firstStage.id,
            title: parsed.data.dealTitle || `${lead.name} - Opportunity`,
            value: parsed.data.dealValue,
            ownerId: lead.ownerId,
            companyId: company?.id,
          },
        });
      }
    }

    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "converted",
        convertedAt: new Date(),
        convertedCompanyId: company?.id,
        convertedContactId: contact.id,
        convertedDealId: deal?.id,
      },
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: session.user.id,
        action: "convert",
        entityType: "lead",
        entityId: leadId,
        after: JSON.stringify({ companyId: company?.id, contactId: contact.id, dealId: deal?.id }),
      },
    });

    return { lead: updatedLead, company, contact, deal };
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { success: true as const, data: result };
}
