import type { FieldConfidence } from "@/lib/domain/extraction";
import { CONFIDENCE_COLOR, CONFIDENCE_DIM } from "./confidence-style";

export function ConfidenceBadge({ confidence }: { confidence: FieldConfidence }) {
  return (
    <span
      className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide"
      style={{ background: CONFIDENCE_DIM[confidence], color: CONFIDENCE_COLOR[confidence] }}
    >
      {confidence}
    </span>
  );
}
