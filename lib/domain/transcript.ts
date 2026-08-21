import { z } from "zod";

export const SPEAKERS = ["rep", "prospect"] as const;
export type Speaker = (typeof SPEAKERS)[number];

export const TranscriptLineSchema = z.object({
  speaker: z.enum(SPEAKERS),
  speakerName: z.string(),
  text: z.string(),
});
export type TranscriptLine = z.infer<typeof TranscriptLineSchema>;
