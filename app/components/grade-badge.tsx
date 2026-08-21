import type { FieldMatch } from "@/lib/domain/grading";
import { CONFIDENCE_COLOR, CONFIDENCE_DIM } from "./confidence-style";

const GRADE_LABEL: Record<FieldMatch, string> = {
  correct: "correct",
  missed: "missed",
  "false-positive": "unexpected",
  incorrect: "incorrect",
};

/** Reuses the confidence palette: correct reads as settled (green), any miss as flagged (red) — one consistent "needs attention" visual language across the page. */
export function GradeBadge({ match }: { match: FieldMatch }) {
  const tone = match === "correct" ? "high" : "low";
  return (
    <span
      className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
      style={{ background: CONFIDENCE_DIM[tone], color: CONFIDENCE_COLOR[tone] }}
    >
      {GRADE_LABEL[match]}
    </span>
  );
}
