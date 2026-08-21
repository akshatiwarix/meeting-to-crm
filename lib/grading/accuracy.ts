import type { FieldMatch, ListFieldTally } from "@/lib/domain/grading";
import { FIELD_ACCURACY_WEIGHTS } from "@/lib/domain/grading";

function scalarScore(match: FieldMatch): number {
  return match === "correct" ? 100 : 0;
}

function listScore(tally: ListFieldTally): number {
  const total = tally.matched + tally.missed + tally.falsePositive;
  if (total === 0) return 100;
  return Math.round((100 * tally.matched) / total);
}

export function computeFieldAccuracy(grade: {
  dealStageMatch: FieldMatch;
  companyMatch: FieldMatch;
  contactsTally: ListFieldTally;
  actionItemsTally: ListFieldTally;
}): number {
  return Math.round(
    FIELD_ACCURACY_WEIGHTS.dealStage * scalarScore(grade.dealStageMatch) +
      FIELD_ACCURACY_WEIGHTS.company * scalarScore(grade.companyMatch) +
      FIELD_ACCURACY_WEIGHTS.contacts * listScore(grade.contactsTally) +
      FIELD_ACCURACY_WEIGHTS.actionItems * listScore(grade.actionItemsTally),
  );
}
