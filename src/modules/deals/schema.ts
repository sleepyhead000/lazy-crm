import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  value: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  expectedCloseDate: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  ownerId: z.string().min(1, "Owner is required"),
  pipelineId: z.string().min(1, "Pipeline is required"),
  stageId: z.string().min(1, "Stage is required"),
  companyId: z.string().optional(),
  contactIds: z.array(z.string()).optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const moveDealStageSchema = z.object({
  stageId: z.string().min(1),
  winReason: z.string().optional(),
  lossReason: z.string().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type MoveDealStageInput = z.infer<typeof moveDealStageSchema>;
