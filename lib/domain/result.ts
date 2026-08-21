import { z } from "zod";
import { MeetingSchema } from "./meeting";
import { ExtractedRecordSchema } from "./extraction";
import { MeetingGradeSchema } from "./grading";

export const MeetingResultSchema = z.object({
  meeting: MeetingSchema,
  extracted: ExtractedRecordSchema,
  grade: MeetingGradeSchema,
});
export type MeetingResult = z.infer<typeof MeetingResultSchema>;

export const CorpusAccuracySchema = z.object({
  meetingCount: z.number().int().positive(),
  overallFieldAccuracy: z.number().int().min(0).max(100),
  byAmbiguityProfile: z.object({
    clean: z.number().int().min(0).max(100),
    ambiguous: z.number().int().min(0).max(100),
  }),
});
export type CorpusAccuracy = z.infer<typeof CorpusAccuracySchema>;

export const MeetingCrmResultSchema = z.object({
  generatedAt: z.string(),
  meetingCount: z.number().int().positive(),
  meetings: z.array(MeetingResultSchema),
  corpusAccuracy: CorpusAccuracySchema,
});
export type MeetingCrmResult = z.infer<typeof MeetingCrmResultSchema>;
