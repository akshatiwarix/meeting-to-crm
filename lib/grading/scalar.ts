import type { FieldMatch } from "@/lib/domain/grading";

/**
 * Grades a single nullable scalar field against its ground truth. Both null
 * counts as a correct abstention — the honest answer to a genuinely
 * unstatable field is to say nothing, not to guess.
 */
export function gradeScalarField<T>(extracted: T | null, groundTruth: T | null): FieldMatch {
  if (groundTruth === null && extracted === null) return "correct";
  if (groundTruth !== null && extracted === null) return "missed";
  if (groundTruth === null && extracted !== null) return "false-positive";
  return extracted === groundTruth ? "correct" : "incorrect";
}
