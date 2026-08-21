import { describe, expect, it } from "vitest";
import { gradeRecord } from "./record";
import { makeExtractedRecord } from "@/lib/domain/fixtures";
import type { GroundTruthRecord } from "@/lib/domain/meeting";

const emptyGroundTruth: GroundTruthRecord = {
  contacts: [],
  dealStage: null,
  actionItems: [],
  companyMentioned: null,
};

describe("gradeRecord", () => {
  it("grades an all-null extraction against an all-null ground truth as perfect", () => {
    const grade = gradeRecord(makeExtractedRecord(), emptyGroundTruth);
    expect(grade.fieldAccuracy).toBe(100);
    expect(grade.dealStageMatch).toBe("correct");
    expect(grade.companyMatch).toBe("correct");
  });

  it("matches contacts by normalized name, ignoring role/email differences", () => {
    const extracted = makeExtractedRecord({
      contacts: [
        { value: { name: "Priya Chen", role: "VP", email: null }, confidence: "high", evidence: [] },
      ],
    });
    const groundTruth: GroundTruthRecord = {
      ...emptyGroundTruth,
      contacts: [{ name: "priya chen", role: "Different Role", email: "x@y.com" }],
    };
    const grade = gradeRecord(extracted, groundTruth);
    expect(grade.contactsTally).toEqual({ matched: 1, missed: 0, falsePositive: 0 });
  });

  it("is reproducible: grading twice from scratch gives byte-identical output", () => {
    const extracted = makeExtractedRecord({
      dealStage: { value: "demo", confidence: "high", evidence: [] },
    });
    const groundTruth: GroundTruthRecord = { ...emptyGroundTruth, dealStage: "demo" };
    const a = gradeRecord(extracted, groundTruth);
    const b = gradeRecord(extracted, groundTruth);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
