import type { TranscriptLine } from "@/lib/domain/transcript";
import type { ExtractedRecord } from "@/lib/domain/extraction";
import { extractContacts } from "./contacts";
import { extractDealStage } from "./deal-stage";
import { extractActionItems } from "./action-items";
import { extractCompany } from "./company";
import { extractSummary } from "./summary";

/**
 * The single extraction entry point — runs unmodified in the browser (Try It
 * Yourself) and on the server (precomputed library + API route). No React,
 * HTTP, or DOM API may ever be imported into this module or anything it
 * calls.
 */
export function extractRecord(transcript: TranscriptLine[]): ExtractedRecord {
  const contacts = extractContacts(transcript);
  const dealStage = extractDealStage(transcript);
  const actionItems = extractActionItems(transcript);
  const companyMentioned = extractCompany(transcript);
  const summary = extractSummary(dealStage.value, contacts.length);

  return { contacts, dealStage, actionItems, companyMentioned, summary };
}
