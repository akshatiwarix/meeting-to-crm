import type { ExtractedRecord } from "@/lib/domain/extraction";
import type { MeetingGrade } from "@/lib/domain/grading";
import { STAGE_LABEL } from "./stage-label";
import { ConfidenceBadge } from "./confidence-badge";
import { GradeBadge } from "./grade-badge";

function EvidenceList({ evidence }: { evidence: { lineIndex: number; quote: string }[] }) {
  if (evidence.length === 0) {
    return <p className="mt-1 text-xs italic text-ink-dim">No supporting line found.</p>;
  }
  return (
    <ul className="mt-1 space-y-0.5">
      {evidence.map((e) => (
        <li key={e.lineIndex} className="text-xs text-ink-dim">
          &ldquo;{e.quote}&rdquo; <span className="text-ink-dim/70">(line {e.lineIndex + 1})</span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  value,
  confidence,
  match,
  evidence,
}: {
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
  match?: "correct" | "missed" | "false-positive" | "incorrect";
  evidence: { lineIndex: number; quote: string }[];
}) {
  return (
    <div className="border-b border-line py-3 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-ink-dim">{label}</span>
        <span className="flex items-center gap-1.5">
          <ConfidenceBadge confidence={confidence} />
          {match && <GradeBadge match={match} />}
        </span>
      </div>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
      <EvidenceList evidence={evidence} />
    </div>
  );
}

export function ExtractedRecordPanel({
  extracted,
  grade,
}: {
  extracted: ExtractedRecord;
  /** Omit for ungraded input (Try It Yourself) — there is no ground truth to grade arbitrary text against. */
  grade?: MeetingGrade;
}) {
  return (
    <div>
      <Field
        label="Company"
        value={extracted.companyMentioned.value ?? "Not found"}
        confidence={extracted.companyMentioned.confidence}
        match={grade?.companyMatch}
        evidence={extracted.companyMentioned.evidence}
      />
      <Field
        label="Deal stage"
        value={extracted.dealStage.value ? STAGE_LABEL[extracted.dealStage.value] : "Unclear"}
        confidence={extracted.dealStage.confidence}
        match={grade?.dealStageMatch}
        evidence={extracted.dealStage.evidence}
      />

      <div className="border-b border-line py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-ink-dim">
            Contacts ({extracted.contacts.length})
          </span>
          {grade && (
            <span className="text-xs text-ink-dim">
              {grade.contactsTally.matched} matched · {grade.contactsTally.missed} missed
              {grade.contactsTally.falsePositive > 0 ? ` · ${grade.contactsTally.falsePositive} unexpected` : ""}
            </span>
          )}
        </div>
        {extracted.contacts.length === 0 ? (
          <p className="mt-1 text-sm italic text-ink-dim">None found.</p>
        ) : (
          extracted.contacts.map((contact, i) => (
            <div key={i} className="mt-2 rounded-md border border-line p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">
                  {contact.value.name}
                  {contact.value.role ? ` — ${contact.value.role}` : ""}
                </p>
                <ConfidenceBadge confidence={contact.confidence} />
              </div>
              {contact.value.email && <p className="text-xs text-ink-dim">{contact.value.email}</p>}
              <EvidenceList evidence={contact.evidence} />
            </div>
          ))
        )}
      </div>

      <div className="py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-ink-dim">
            Action items ({extracted.actionItems.length})
          </span>
          {grade && (
            <span className="text-xs text-ink-dim">
              {grade.actionItemsTally.matched} matched · {grade.actionItemsTally.missed} missed
              {grade.actionItemsTally.falsePositive > 0
                ? ` · ${grade.actionItemsTally.falsePositive} unexpected`
                : ""}
            </span>
          )}
        </div>
        {extracted.actionItems.length === 0 ? (
          <p className="mt-1 text-sm italic text-ink-dim">None found.</p>
        ) : (
          extracted.actionItems.map((item, i) => (
            <div key={i} className="mt-2 rounded-md border border-line p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{item.value.text}</p>
                <ConfidenceBadge confidence={item.confidence} />
              </div>
              <p className="text-xs text-ink-dim">
                {item.value.owner ?? "No owner stated"}
                {item.value.dueHint ? ` · ${item.value.dueHint}` : ""}
              </p>
              <EvidenceList evidence={item.evidence} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
