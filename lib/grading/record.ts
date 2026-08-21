import type { ExtractedRecord } from "@/lib/domain/extraction";
import type { GroundTruthRecord } from "@/lib/domain/meeting";
import type { MeetingGrade } from "@/lib/domain/grading";
import { gradeScalarField } from "./scalar";
import { gradeListField } from "./list";
import { computeFieldAccuracy } from "./accuracy";

const normalizeName = (name: string) => name.trim().toLowerCase();
const normalizeText = (text: string) => text.trim().toLowerCase();

export function gradeRecord(extracted: ExtractedRecord, groundTruth: GroundTruthRecord): MeetingGrade {
  const dealStageMatch = gradeScalarField(extracted.dealStage.value, groundTruth.dealStage);
  const companyMatch = gradeScalarField(extracted.companyMentioned.value, groundTruth.companyMentioned);

  const contactsTally = gradeListField(
    extracted.contacts.map((field) => field.value),
    groundTruth.contacts,
    (contact) => normalizeName(contact.name),
  );

  const actionItemsTally = gradeListField(
    extracted.actionItems.map((field) => field.value),
    groundTruth.actionItems,
    (item) => normalizeText(item.text),
  );

  const fieldAccuracy = computeFieldAccuracy({
    dealStageMatch,
    companyMatch,
    contactsTally,
    actionItemsTally,
  });

  return { dealStageMatch, companyMatch, contactsTally, actionItemsTally, fieldAccuracy };
}
