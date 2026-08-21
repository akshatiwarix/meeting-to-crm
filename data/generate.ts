import { Rng, derive } from "@/lib/rng";
import { DEAL_STAGES, type DealStage, type Meeting, type ContactFact, type ActionItemFact } from "@/lib/domain/meeting";
import type { TranscriptLine } from "@/lib/domain/transcript";

export const SEED = 21;
export const MEETING_COUNT = 50;

// ---------------------------------------------------------------------------
// Word lists
// ---------------------------------------------------------------------------

const NAME_PREFIXES = [
  "Brightline", "Fern", "Cinder", "Loom", "Harbor", "Kestrel", "Maple", "Onyx",
  "Palisade", "Quill", "Rivet", "Sable", "Talon", "Umbra", "Verve", "Wayfarer",
  "Yarrow", "Amber", "Birchwood", "Cobalt",
] as const;

const NAME_SUFFIXES = [
  "Robotics", "Cloud", "Systems", "Analytics", "Health", "Financial",
  "Logistics", "Networks", "Dynamics", "Labs", "Software", "Digital",
  "Industries", "Partners", "Technologies", "Data", "Works", "Group",
  "Solutions", "AI",
] as const;

const CONTACT_FIRST_NAMES = [
  "Priya", "Sam", "Jordan", "Marcus", "Elena", "David", "Rachel", "Tom",
  "Nina", "Carlos", "Aisha", "Ben", "Grace", "Leo", "Maya", "Owen", "Sophia",
  "Ethan", "Zoe", "Ravi",
] as const;

const CONTACT_LAST_NAMES = [
  "Chen", "Patel", "Nguyen", "Garcia", "Kim", "Smith", "Johnson", "Brown",
  "Davis", "Wilson", "Martinez", "Lee", "Clark", "Walker", "Young", "King",
  "Wright", "Lopez", "Hill", "Scott",
] as const;

const REP_NAMES = ["Sam", "Jordan", "Taylor", "Morgan", "Casey", "Alex"] as const;

const ROLES = [
  "VP of Sales", "Head of Marketing", "Director of Engineering",
  "VP of Engineering", "Chief Revenue Officer", "Director of Operations",
  "VP of Product", "Head of Customer Success", "Director of IT",
  "Chief Technology Officer",
] as const;

const DUE_PHRASES = [
  "by Friday", "by end of week", "next Tuesday", "early next week",
  "by Monday", "within 48 hours", "by the end of the month",
] as const;

const ACTION_VERB_PHRASES = [
  "send over the pricing sheet",
  "schedule the follow-up call",
  "loop in the security team",
  "share the case study",
  "send the contract for review",
  "set up the technical deep dive",
  "follow up with procurement",
  "circle back with the finance team",
] as const;

const SCHEDULE_NOUNS = [
  "the technical deep dive",
  "a security review call",
  "time with our procurement team",
  "a kickoff call",
] as const;

// Every family's strong lines contain the exact literal substring the
// extractor's keyword table looks for (see PLAN.md § Method). One is chosen
// at random per meeting for variety.
const STAGE_STRONG_LINES: Record<Exclude<DealStage, "discovery">, string[]> = {
  demo: [
    "Let's schedule a demo for next week.",
    "I'd love to walk you through the product live.",
  ],
  proposal: [
    "Could you send over pricing so we can evaluate?",
    "We're ready to review the proposal in detail.",
  ],
  negotiation: [
    "We're currently in legal review on the contract.",
    "We're working through a few redlines on our side.",
    "There are a couple of contract terms we still need to align on.",
  ],
  "closed-won": [
    "We're ready to sign the contract today.",
    "Let's get started, we're all in.",
    "We're moving forward with you on this.",
  ],
  "closed-lost": [
    "We've decided we're going with someone else.",
    "We are not moving forward at this time.",
    "Unfortunately this is not a fit for us.",
  ],
};

// Paraphrases of the same real stage that deliberately avoid every literal
// keyword substring above, used only by the `weak-stage-language` ambiguity
// flag so the extractor's keyword match genuinely fails.
const STAGE_WEAK_LINES: Record<Exclude<DealStage, "discovery">, string[]> = {
  demo: ["Maybe at some point it'd help to actually see it in action."],
  proposal: ["We'll need some numbers from you before we can make a call."],
  negotiation: ["There's still some internal back-and-forth before we can commit."],
  "closed-won": ["We're feeling really good about this and want to keep the momentum going."],
  "closed-lost": ["This might not end up being the right timing for us."],
};

const DISCOVERY_LINES = [
  "Tell me more about your current workflow and where the friction is.",
  "What does your evaluation process typically look like?",
] as const;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function makeCompanyName(rng: Rng, used: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${rng.pick(NAME_PREFIXES)} ${rng.pick(NAME_SUFFIXES)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = `${rng.pick(NAME_PREFIXES)} ${rng.pick(NAME_SUFFIXES)} ${used.size}`;
  used.add(fallback);
  return fallback;
}

function makeContactName(rng: Rng, used: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const name = `${rng.pick(CONTACT_FIRST_NAMES)} ${rng.pick(CONTACT_LAST_NAMES)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = `${rng.pick(CONTACT_FIRST_NAMES)} ${rng.pick(CONTACT_LAST_NAMES)} ${used.size}`;
  used.add(fallback);
  return fallback;
}

function emailFor(name: string, company: string): string {
  const [first, last] = name.toLowerCase().split(" ");
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${first}.${last}@${slug}.com`;
}

/** Days since epoch offset from a fixed narrative base date, never the real current date. */
function syntheticDate(offsetDays: number): string {
  const base = Date.UTC(2026, 0, 5); // 2026-01-05
  const d = new Date(base + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const AMBIGUITY_FLAGS = [
  "conflicting-stage",
  "weak-stage-language",
  "vague-action-item",
  "unnamed-contact",
  "missing-company-intro",
] as const;
type AmbiguityFlag = (typeof AMBIGUITY_FLAGS)[number];

// ---------------------------------------------------------------------------
// Meeting generation
// ---------------------------------------------------------------------------

type Rngs = {
  company: Rng;
  contactName: Rng;
  contactDetail: Rng;
  rep: Rng;
  stageTarget: Rng;
  stageLine: Rng;
  actionCount: Rng;
  actionDetail: Rng;
  ambiguity: Rng;
  date: Rng;
};

function makeRngs(): Rngs {
  return {
    company: new Rng(derive(SEED, "company-name")),
    contactName: new Rng(derive(SEED, "contact-name")),
    contactDetail: new Rng(derive(SEED, "contact-detail")),
    rep: new Rng(derive(SEED, "rep-name")),
    stageTarget: new Rng(derive(SEED, "stage-target")),
    stageLine: new Rng(derive(SEED, "stage-line")),
    actionCount: new Rng(derive(SEED, "action-count")),
    actionDetail: new Rng(derive(SEED, "action-detail")),
    ambiguity: new Rng(derive(SEED, "ambiguity")),
    date: new Rng(derive(SEED, "date")),
  };
}

function generateMeeting(index: number, rngs: Rngs, usedCompanies: Set<string>, usedContacts: Set<string>): Meeting {
  const id = `meeting-${String(index + 1).padStart(3, "0")}`;
  const date = syntheticDate(rngs.date.intBetween(0, 70));
  const company = makeCompanyName(rngs.company, usedCompanies);
  const repName = rngs.rep.pick(REP_NAMES);

  const isAmbiguous = rngs.ambiguity.bool(0.4);
  const flag: AmbiguityFlag | null = isAmbiguous ? rngs.ambiguity.pick(AMBIGUITY_FLAGS) : null;

  const contactCount = [1, 1, 2, 2, 3][rngs.contactName.weightedIndex([45, 45, 40, 40, 15])] ?? 1;
  const contacts: { name: string; role: string; email: string | null; unnamed: boolean }[] = [];
  for (let c = 0; c < contactCount; c++) {
    const name = makeContactName(rngs.contactName, usedContacts);
    const role = rngs.contactDetail.pick(ROLES);
    const hasEmail = rngs.contactDetail.bool(0.6);
    contacts.push({
      name,
      role,
      email: hasEmail ? emailFor(name, company) : null,
      unnamed: false,
    });
  }
  const unnamedIndex = flag === "unnamed-contact" ? contacts.length - 1 : -1;
  if (unnamedIndex >= 0) contacts[unnamedIndex]!.unnamed = true;

  let targetStage = DEAL_STAGES[rngs.stageTarget.weightedIndex([30, 25, 20, 15, 5, 5])] as DealStage;
  if (flag === "weak-stage-language" && targetStage === "discovery") {
    // Guarantee the flag matters: redraw among the non-discovery stages.
    const nonDiscovery = DEAL_STAGES.filter((s) => s !== "discovery");
    targetStage = rngs.stageTarget.pick(nonDiscovery);
  }

  const actionItemWeights = [15, 35, 35, 15];
  let actionItemCount = rngs.actionCount.weightedIndex(actionItemWeights);
  if (flag === "vague-action-item" && actionItemCount === 0) actionItemCount = 1;

  // ---- Assemble transcript + ground truth in lockstep ----

  const transcript: TranscriptLine[] = [];
  const push = (speaker: TranscriptLine["speaker"], speakerName: string, text: string) => {
    transcript.push({ speaker, speakerName, text });
  };

  push("rep", repName, "Thanks for hopping on the call today, glad we could find the time.");

  const groundTruthContacts: ContactFact[] = [];
  for (const contact of contacts) {
    groundTruthContacts.push({ name: contact.name, role: contact.role, email: contact.email });
    if (contact.unnamed) {
      push("rep", repName, "We've also got someone from your security team joining today, just to listen in.");
      continue;
    }
    const includeCompany = flag !== "missing-company-intro";
    const intro = includeCompany
      ? `This is ${contact.name}, I'm the ${contact.role} here at ${company}.`
      : `This is ${contact.name}, I'm the ${contact.role} here.`;
    push("prospect", contact.name, intro);
    if (contact.email) {
      push("prospect", contact.name, `You can reach me at ${contact.email}.`);
    }
  }

  push("rep", repName, rngs.stageLine.pick(DISCOVERY_LINES));

  let groundTruthStage: DealStage | null = targetStage;
  if (flag === "conflicting-stage") {
    const nonDiscovery = DEAL_STAGES.filter((s) => s !== "discovery");
    const shuffled = [...nonDiscovery].sort(() => rngs.stageLine.next() - 0.5);
    const [familyA, familyB] = [shuffled[0] as Exclude<DealStage, "discovery">, shuffled[1] as Exclude<DealStage, "discovery">];
    push("prospect", contacts[0]!.unnamed ? repName : contacts[0]!.name, rngs.stageLine.pick(STAGE_STRONG_LINES[familyA]));
    push("prospect", contacts[0]!.unnamed ? repName : contacts[0]!.name, rngs.stageLine.pick(STAGE_STRONG_LINES[familyB]));
    groundTruthStage = null;
  } else if (targetStage !== "discovery") {
    const speakerName = contacts[0]!.unnamed ? repName : contacts[0]!.name;
    const lines = flag === "weak-stage-language" ? STAGE_WEAK_LINES[targetStage] : STAGE_STRONG_LINES[targetStage];
    push("prospect", speakerName, rngs.stageLine.pick(lines));
  } else {
    push("prospect", contacts[0]!.unnamed ? repName : contacts[0]!.name, "We're still early, just exploring options right now.");
  }

  const groundTruthActionItems: ActionItemFact[] = [];
  for (let a = 0; a < actionItemCount; a++) {
    const isVague = flag === "vague-action-item" && a === actionItemCount - 1;
    const hasDue = rngs.actionDetail.bool(0.7);
    const duePhrase = hasDue ? rngs.actionDetail.pick(DUE_PHRASES) : null;

    if (isVague) {
      const phrase = rngs.actionDetail.pick(ACTION_VERB_PHRASES);
      push("rep", repName, `Someone should probably ${phrase} at some point.`);
      groundTruthActionItems.push({ text: phrase, owner: null, dueHint: null });
      continue;
    }

    const useSchedulePattern = rngs.actionDetail.bool(0.25);
    if (useSchedulePattern) {
      const noun = rngs.actionDetail.pick(SCHEDULE_NOUNS);
      const dueClause = duePhrase ? ` ${duePhrase}` : "";
      push("rep", repName, `Let's schedule ${noun}${dueClause}.`);
      groundTruthActionItems.push({ text: noun, owner: null, dueHint: duePhrase });
      continue;
    }

    const phrase = rngs.actionDetail.pick(ACTION_VERB_PHRASES);
    const dueClause = duePhrase ? ` ${duePhrase}` : "";
    const ownedByContact = contacts.length > 0 && rngs.actionDetail.bool(0.4);
    if (ownedByContact) {
      const owner = contacts[rngs.actionDetail.int(contacts.length)]!;
      push("rep", repName, `${owner.name} will ${phrase}${dueClause}.`);
      groundTruthActionItems.push({ text: phrase, owner: owner.name, dueHint: duePhrase });
    } else {
      push("rep", repName, `I'll ${phrase}${dueClause}.`);
      groundTruthActionItems.push({ text: phrase, owner: repName, dueHint: duePhrase });
    }
  }

  push("prospect", contacts[0]!.unnamed ? repName : contacts[0]!.name, "Sounds good, appreciate the time today.");

  const groundTruthCompany = company;

  const meeting: Meeting = {
    id,
    date,
    ambiguityProfile: isAmbiguous ? "ambiguous" : "clean",
    transcript,
    groundTruth: {
      contacts: groundTruthContacts,
      dealStage: groundTruthStage,
      actionItems: groundTruthActionItems,
      companyMentioned: groundTruthCompany,
    },
  };
  return meeting;
}

export function generateCorpus(): { meetings: Meeting[] } {
  const rngs = makeRngs();
  const usedCompanies = new Set<string>();
  const usedContacts = new Set<string>();
  const meetings: Meeting[] = [];
  for (let i = 0; i < MEETING_COUNT; i++) {
    meetings.push(generateMeeting(i, rngs, usedCompanies, usedContacts));
  }
  return { meetings };
}
