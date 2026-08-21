import { describe, expect, it } from "vitest";
import { computeFieldAccuracy } from "./accuracy";

describe("computeFieldAccuracy", () => {
  it("scores 100 when every category is fully correct", () => {
    const score = computeFieldAccuracy({
      dealStageMatch: "correct",
      companyMatch: "correct",
      contactsTally: { matched: 2, missed: 0, falsePositive: 0 },
      actionItemsTally: { matched: 1, missed: 0, falsePositive: 0 },
    });
    expect(score).toBe(100);
  });

  it("scores 0 when every category is fully wrong", () => {
    const score = computeFieldAccuracy({
      dealStageMatch: "incorrect",
      companyMatch: "missed",
      contactsTally: { matched: 0, missed: 2, falsePositive: 0 },
      actionItemsTally: { matched: 0, missed: 1, falsePositive: 0 },
    });
    expect(score).toBe(0);
  });

  it("weights deal stage, company, contacts, and action items as documented (30/15/30/25)", () => {
    // Only companyMatch wrong: contributes 0 * 0.15, everything else 100.
    const score = computeFieldAccuracy({
      dealStageMatch: "correct",
      companyMatch: "incorrect",
      contactsTally: { matched: 1, missed: 0, falsePositive: 0 },
      actionItemsTally: { matched: 1, missed: 0, falsePositive: 0 },
    });
    expect(score).toBe(85);
  });
});
