import { describe, expect, it } from "vitest";
import { gradeScalarField } from "./scalar";

describe("gradeScalarField", () => {
  it("is correct when both are null (a correct abstention)", () => {
    expect(gradeScalarField(null, null)).toBe("correct");
  });

  it("is correct when values are equal", () => {
    expect(gradeScalarField("demo", "demo")).toBe("correct");
  });

  it("is missed when ground truth is set but extraction is null", () => {
    expect(gradeScalarField(null, "demo")).toBe("missed");
  });

  it("is false-positive when extraction is set but ground truth is null", () => {
    expect(gradeScalarField("demo", null)).toBe("false-positive");
  });

  it("is incorrect when both are set but unequal", () => {
    expect(gradeScalarField("demo", "proposal")).toBe("incorrect");
  });
});
