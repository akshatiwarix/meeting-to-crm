import { z } from "zod";

export const FIELD_MATCHES = ["correct", "missed", "false-positive", "incorrect"] as const;
export type FieldMatch = (typeof FIELD_MATCHES)[number];

export const ListFieldTallySchema = z.object({
  matched: z.number().int().nonnegative(),
  missed: z.number().int().nonnegative(),
  falsePositive: z.number().int().nonnegative(),
});
export type ListFieldTally = z.infer<typeof ListFieldTallySchema>;

export const MeetingGradeSchema = z.object({
  dealStageMatch: z.enum(FIELD_MATCHES),
  companyMatch: z.enum(FIELD_MATCHES),
  contactsTally: ListFieldTallySchema,
  actionItemsTally: ListFieldTallySchema,
  fieldAccuracy: z.number().int().min(0).max(100),
});
export type MeetingGrade = z.infer<typeof MeetingGradeSchema>;

export const FIELD_ACCURACY_WEIGHTS = {
  dealStage: 0.3,
  company: 0.15,
  contacts: 0.3,
  actionItems: 0.25,
} as const;
