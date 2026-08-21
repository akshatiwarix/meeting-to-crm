import { describe, expect, it } from "vitest";
import { TranscriptLineSchema } from "./transcript";
import { MeetingSchema, ContactFactSchema, ActionItemFactSchema, GroundTruthRecordSchema } from "./meeting";
import { ExtractedRecordSchema, extractedFieldSchema } from "./extraction";
import { MeetingGradeSchema, ListFieldTallySchema } from "./grading";
import { MeetingResultSchema, CorpusAccuracySchema, MeetingCrmResultSchema } from "./result";
import { z } from "zod";
import { makeMeeting, makeTranscriptLine, makeExtractedRecord } from "./fixtures";

describe("domain schemas", () => {
  it("accepts a well-formed TranscriptLine", () => {
    expect(() => TranscriptLineSchema.parse(makeTranscriptLine())).not.toThrow();
  });

  it("rejects a TranscriptLine with an invalid speaker", () => {
    expect(() =>
      TranscriptLineSchema.parse({ ...makeTranscriptLine(), speaker: "narrator" }),
    ).toThrow();
  });

  it("accepts a well-formed ContactFact and ActionItemFact", () => {
    expect(() =>
      ContactFactSchema.parse({ name: "Priya", role: "VP Engineering", email: null }),
    ).not.toThrow();
    expect(() =>
      ActionItemFactSchema.parse({ text: "Send pricing", owner: "Sam", dueHint: "by Friday" }),
    ).not.toThrow();
  });

  it("accepts a well-formed GroundTruthRecord with nullable fields", () => {
    expect(() =>
      GroundTruthRecordSchema.parse({
        contacts: [],
        dealStage: null,
        actionItems: [],
        companyMentioned: null,
      }),
    ).not.toThrow();
  });

  it("accepts a well-formed Meeting", () => {
    expect(() => MeetingSchema.parse(makeMeeting())).not.toThrow();
  });

  it("rejects a Meeting with an empty transcript", () => {
    expect(() => MeetingSchema.parse(makeMeeting({ transcript: [] }))).toThrow();
  });

  it("extractedFieldSchema wraps an arbitrary value schema with confidence and evidence", () => {
    const schema = extractedFieldSchema(z.string().nullable());
    expect(() =>
      schema.parse({ value: "Acme", confidence: "high", evidence: [{ lineIndex: 0, quote: "at Acme" }] }),
    ).not.toThrow();
    expect(() => schema.parse({ value: "Acme", confidence: "extreme", evidence: [] })).toThrow();
  });

  it("accepts a well-formed ExtractedRecord", () => {
    expect(() => ExtractedRecordSchema.parse(makeExtractedRecord())).not.toThrow();
  });

  it("accepts a well-formed ListFieldTally and MeetingGrade", () => {
    expect(() =>
      ListFieldTallySchema.parse({ matched: 1, missed: 0, falsePositive: 0 }),
    ).not.toThrow();
    expect(() =>
      MeetingGradeSchema.parse({
        dealStageMatch: "correct",
        companyMatch: "correct",
        contactsTally: { matched: 1, missed: 0, falsePositive: 0 },
        actionItemsTally: { matched: 0, missed: 0, falsePositive: 0 },
        fieldAccuracy: 100,
      }),
    ).not.toThrow();
  });

  it("rejects a MeetingGrade with fieldAccuracy over 100", () => {
    expect(() =>
      MeetingGradeSchema.parse({
        dealStageMatch: "correct",
        companyMatch: "correct",
        contactsTally: { matched: 1, missed: 0, falsePositive: 0 },
        actionItemsTally: { matched: 0, missed: 0, falsePositive: 0 },
        fieldAccuracy: 101,
      }),
    ).toThrow();
  });

  it("accepts a well-formed MeetingResult, CorpusAccuracy, and MeetingCrmResult", () => {
    const meeting = makeMeeting();
    const extracted = makeExtractedRecord();
    const grade = {
      dealStageMatch: "correct" as const,
      companyMatch: "correct" as const,
      contactsTally: { matched: 0, missed: 0, falsePositive: 0 },
      actionItemsTally: { matched: 0, missed: 0, falsePositive: 0 },
      fieldAccuracy: 100,
    };
    const meetingResult = { meeting, extracted, grade };
    expect(() => MeetingResultSchema.parse(meetingResult)).not.toThrow();

    const corpusAccuracy = {
      meetingCount: 1,
      overallFieldAccuracy: 100,
      byAmbiguityProfile: { clean: 100, ambiguous: 100 },
    };
    expect(() => CorpusAccuracySchema.parse(corpusAccuracy)).not.toThrow();

    expect(() =>
      MeetingCrmResultSchema.parse({
        generatedAt: new Date().toISOString(),
        meetingCount: 1,
        meetings: [meetingResult],
        corpusAccuracy,
      }),
    ).not.toThrow();
  });
});
