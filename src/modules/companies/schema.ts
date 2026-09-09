import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  domain: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"]).optional(),
  location: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
