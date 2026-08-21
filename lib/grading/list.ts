import type { ListFieldTally } from "@/lib/domain/grading";

/**
 * Grades a list field by identity key (normalized name for contacts,
 * normalized text for action items) — sub-field differences (a contact's
 * role, an action item's due date) don't affect this tally; presence is what
 * a CRM record needs first.
 */
export function gradeListField<T>(
  extracted: T[],
  groundTruth: T[],
  keyFn: (item: T) => string,
): ListFieldTally {
  const remaining = groundTruth.map(keyFn);
  let matched = 0;
  let falsePositive = 0;

  for (const item of extracted) {
    const key = keyFn(item);
    const index = remaining.indexOf(key);
    if (index >= 0) {
      matched++;
      remaining.splice(index, 1);
    } else {
      falsePositive++;
    }
  }

  return { matched, missed: remaining.length, falsePositive };
}
