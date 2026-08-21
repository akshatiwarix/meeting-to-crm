import { z } from "zod";
import { TranscriptLineSchema } from "./transcript";

export const DEAL_STAGES = [
  "discovery",
  "demo",
  "proposal",
  "negotiation",
  "closed-won",
  "closed-lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const AMBIGUITY_PROFILES = ["clean", "ambiguous"] as const;
export type AmbiguityProfile = (typeof AMBIGUITY_PROFILES)[number];

export const ContactFactSchema = z.object({
  name: z.string(),
  role: z.string().nullable(),
  email: z.string().nullable(),
});
export type ContactFact = z.infer<typeof ContactFactSchema>;

export const ActionItemFactSchema = z.object({
  text: z.string(),
  owner: z.string().nullable(),
  dueHint: z.string().nullable(),
});
export type ActionItemFact = z.infer<typeof ActionItemFactSchema>;

export const GroundTruthRecordSchema = z.object({
  contacts: z.array(ContactFactSchema),
  dealStage: z.enum(DEAL_STAGES).nullable(),
  actionItems: z.array(ActionItemFactSchema),
  companyMentioned: z.string().nullable(),
});
export type GroundTruthRecord = z.infer<typeof GroundTruthRecordSchema>;

export const MeetingSchema = z.object({
  id: z.string(),
  date: z.string(),
  ambiguityProfile: z.enum(AMBIGUITY_PROFILES),
  transcript: z.array(TranscriptLineSchema).min(1),
  groundTruth: GroundTruthRecordSchema,
});
export type Meeting = z.infer<typeof MeetingSchema>;
