import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "unqualified"]).default("new"),
  qualificationNotes: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
});

export const updateLeadSchema = createLeadSchema.partial();

export const convertLeadSchema = z.object({
  createCompany: z.boolean().default(true),
  companyName: z.string().optional(),
  createDeal: z.boolean().default(false),
  dealTitle: z.string().optional(),
  dealValue: z.number().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
