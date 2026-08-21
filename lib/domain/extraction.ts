import { z } from "zod";
import { ContactFactSchema, ActionItemFactSchema, DEAL_STAGES } from "./meeting";

export const FIELD_CONFIDENCES = ["high", "medium", "low"] as const;
export type FieldConfidence = (typeof FIELD_CONFIDENCES)[number];

export const EvidenceSchema = z.object({
  lineIndex: z.number().int().nonnegative(),
  quote: z.string(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export function extractedFieldSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema,
    confidence: z.enum(FIELD_CONFIDENCES),
    evidence: z.array(EvidenceSchema),
  });
}
export type ExtractedField<T> = {
  value: T;
  confidence: FieldConfidence;
  evidence: Evidence[];
};

export const ExtractedRecordSchema = z.object({
  contacts: z.array(extractedFieldSchema(ContactFactSchema)),
  dealStage: extractedFieldSchema(z.enum(DEAL_STAGES).nullable()),
  actionItems: z.array(extractedFieldSchema(ActionItemFactSchema)),
  companyMentioned: extractedFieldSchema(z.string().nullable()),
  summary: z.string(),
});
export type ExtractedRecord = z.infer<typeof ExtractedRecordSchema>;
