import type { Meeting } from "@/lib/domain/meeting";
import type { MeetingResult, CorpusAccuracy, MeetingCrmResult } from "@/lib/domain/result";
import { extractRecord } from "@/lib/extraction/record";
import { gradeRecord } from "@/lib/grading/record";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function computeCorpusAccuracy(results: MeetingResult[]): CorpusAccuracy {
  const clean = results.filter((r) => r.meeting.ambiguityProfile === "clean");
  const ambiguous = results.filter((r) => r.meeting.ambiguityProfile === "ambiguous");

  return {
    meetingCount: results.length,
    overallFieldAccuracy: average(results.map((r) => r.grade.fieldAccuracy)),
    byAmbiguityProfile: {
      clean: average(clean.map((r) => r.grade.fieldAccuracy)),
      ambiguous: average(ambiguous.map((r) => r.grade.fieldAccuracy)),
    },
  };
}

/**
 * Runs extraction + grading for every meeting and assembles the full result.
 * `generatedAt` is a parameter, never read from the clock internally, so the
 * pipeline stays byte-identical for the same corpus across runs.
 */
export function buildMeetingCrmResult(meetings: Meeting[], generatedAt: string): MeetingCrmResult {
  const meetingResults: MeetingResult[] = meetings.map((meeting) => {
    const extracted = extractRecord(meeting.transcript);
    const grade = gradeRecord(extracted, meeting.groundTruth);
    return { meeting, extracted, grade };
  });

  return {
    generatedAt,
    meetingCount: meetings.length,
    meetings: meetingResults,
    corpusAccuracy: computeCorpusAccuracy(meetingResults),
  };
}
