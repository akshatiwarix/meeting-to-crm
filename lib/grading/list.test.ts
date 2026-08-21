import { describe, expect, it } from "vitest";
import { gradeListField } from "./list";

const key = (s: string) => s;

describe("gradeListField", () => {
  it("scores 100% presence as fully matched", () => {
    expect(gradeListField(["a", "b"], ["a", "b"], key)).toEqual({ matched: 2, missed: 0, falsePositive: 0 });
  });

  it("counts a ground-truth item absent from extraction as missed", () => {
    expect(gradeListField(["a"], ["a", "b"], key)).toEqual({ matched: 1, missed: 1, falsePositive: 0 });
  });

  it("counts an extracted item absent from ground truth as a false positive", () => {
    expect(gradeListField(["a", "b"], ["a"], key)).toEqual({ matched: 1, missed: 0, falsePositive: 1 });
  });

  it("scores two empty lists as fully matched (nothing to find, nothing missed)", () => {
    expect(gradeListField([], [], key)).toEqual({ matched: 0, missed: 0, falsePositive: 0 });
  });

  it("handles duplicate keys as a multiset, not a set", () => {
    expect(gradeListField(["a", "a"], ["a"], key)).toEqual({ matched: 1, missed: 0, falsePositive: 1 });
  });
});
