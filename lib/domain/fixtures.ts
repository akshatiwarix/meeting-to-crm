import type { Meeting } from "./meeting";
import type { TranscriptLine } from "./transcript";
import type { ExtractedRecord } from "./extraction";

export function makeTranscriptLine(overrides: Partial<TranscriptLine> = {}): TranscriptLine {
  return {
    speaker: "rep",
    speakerName: "Sam",
    text: "Thanks for hopping on the call today.",
    ...overrides,
  };
}

export function makeMeeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id: "meeting-1",
    date: "2026-01-15",
    ambiguityProfile: "clean",
    transcript: [makeTranscriptLine()],
    groundTruth: {
      contacts: [],
      dealStage: null,
      actionItems: [],
      companyMentioned: null,
    },
    ...overrides,
  };
}

export function makeExtractedRecord(overrides: Partial<ExtractedRecord> = {}): ExtractedRecord {
  return {
    contacts: [],
    dealStage: { value: null, confidence: "low", evidence: [] },
    actionItems: [],
    companyMentioned: { value: null, confidence: "low", evidence: [] },
    summary: "Test summary.",
    ...overrides,
  };
}
