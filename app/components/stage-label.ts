import type { DealStage } from "@/lib/domain/meeting";

export const STAGE_LABEL: Record<DealStage, string> = {
  discovery: "Discovery",
  demo: "Demo",
  proposal: "Proposal",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
};
