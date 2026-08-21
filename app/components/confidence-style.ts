import type { FieldConfidence } from "@/lib/domain/extraction";

export const CONFIDENCE_COLOR: Record<FieldConfidence, string> = {
  high: "var(--confidence-high)",
  medium: "var(--confidence-medium)",
  low: "var(--confidence-low)",
};

export const CONFIDENCE_DIM: Record<FieldConfidence, string> = {
  high: "var(--confidence-high-dim)",
  medium: "var(--confidence-medium-dim)",
  low: "var(--confidence-low-dim)",
};
