import type { DealStage } from "@/lib/domain/meeting";

export function extractSummary(dealStage: DealStage | null, contactCount: number): string {
  const stageText = dealStage ?? "unclear";
  const contactText = contactCount === 1 ? "1 contact" : `${contactCount} contacts`;
  return `Call with ${contactText}; deal stage inferred as ${stageText}.`;
}
