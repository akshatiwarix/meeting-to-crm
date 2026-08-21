import { MEETINGS } from "../data/corpus";
import { generateCorpus, MEETING_COUNT } from "../data/generate";
import { gradeRecord } from "../lib/grading/record";
import { buildMeetingCrmResult } from "../lib/meeting-crm/build-result";

let failures = 0;

function check(name: string, condition: boolean, detail: string): void {
  if (condition) {
    console.log(`  ok  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name} — ${detail}`);
  }
}

console.log("Sweep: nine invariants over the committed corpus + full extraction/grading pipeline\n");

// 1. Corpus size.
check(
  "1. corpus size",
  MEETINGS.length === MEETING_COUNT && new Set(MEETINGS.map((m) => m.id)).size === MEETING_COUNT &&
    MEETINGS.every((m) => m.transcript.length > 0),
  `expected ${MEETING_COUNT} unique meetings with non-empty transcripts, got ${MEETINGS.length}`,
);

// 2. Ambiguity mix.
{
  const clean = MEETINGS.filter((m) => m.ambiguityProfile === "clean").length;
  const ambiguous = MEETINGS.filter((m) => m.ambiguityProfile === "ambiguous").length;
  check(
    "2. ambiguity mix (>=15 of each)",
    clean >= 15 && ambiguous >= 15,
    `clean=${clean} ambiguous=${ambiguous}`,
  );
}

const generatedAt = "2026-01-01T00:00:00.000Z"; // fixed, for determinism checks below
const result = buildMeetingCrmResult(MEETINGS, generatedAt);

// 3. Field bounds.
{
  const confidences = new Set(["high", "medium", "low"]);
  const inBounds = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;
  const fieldConfidencesOk = result.meetings.every((r) => {
    const fields = [r.extracted.dealStage, r.extracted.companyMentioned, ...r.extracted.contacts, ...r.extracted.actionItems];
    return fields.every((f) => confidences.has(f.confidence));
  });
  const gradeAccuracyOk = result.meetings.every((r) => inBounds(r.grade.fieldAccuracy));
  const overallOk = inBounds(result.corpusAccuracy.overallFieldAccuracy);
  check(
    "3. field bounds (confidence enum, fieldAccuracy in [0,100])",
    fieldConfidencesOk && gradeAccuracyOk && overallOk,
    `fieldConfidencesOk=${fieldConfidencesOk} gradeAccuracyOk=${gradeAccuracyOk} overallOk=${overallOk}`,
  );
}

// 4. Evidence traceability.
{
  let ok = true;
  let bad = "";
  for (const r of result.meetings) {
    const fields = [r.extracted.dealStage, r.extracted.companyMentioned, ...r.extracted.contacts, ...r.extracted.actionItems];
    for (const field of fields) {
      for (const evidence of field.evidence) {
        const line = r.meeting.transcript[evidence.lineIndex];
        if (!line || !line.text.includes(evidence.quote)) {
          ok = false;
          bad = `${r.meeting.id} lineIndex=${evidence.lineIndex} quote=${JSON.stringify(evidence.quote)}`;
        }
      }
    }
  }
  check("4. evidence traceability", ok, bad || "n/a");
}

// 5. Grading reproducibility.
{
  const ok = result.meetings.every((r) => {
    const recomputed = gradeRecord(r.extracted, r.meeting.groundTruth);
    return JSON.stringify(recomputed) === JSON.stringify(r.grade);
  });
  check("5. grading reproducibility (recompute matches precomputed)", ok, "a recomputed grade diverged from the precomputed one");
}

// 6. Confidence calibration.
{
  const samples: { confidence: string; correct: boolean }[] = [];
  for (const r of result.meetings) {
    samples.push({ confidence: r.extracted.dealStage.confidence, correct: r.grade.dealStageMatch === "correct" });
    samples.push({ confidence: r.extracted.companyMentioned.confidence, correct: r.grade.companyMatch === "correct" });
  }
  const rate = (level: string) => {
    const subset = samples.filter((s) => s.confidence === level);
    return subset.length === 0 ? 0 : subset.filter((s) => s.correct).length / subset.length;
  };
  const highRate = rate("high");
  const lowRate = rate("low");
  check(
    "6. confidence calibration (high-confidence correctness > low-confidence)",
    highRate > lowRate,
    `highRate=${highRate.toFixed(3)} lowRate=${lowRate.toFixed(3)}`,
  );
}

// 7. Difficulty realism.
{
  const { clean, ambiguous } = result.corpusAccuracy.byAmbiguityProfile;
  check(
    "7. difficulty realism (ambiguous accuracy < clean accuracy)",
    ambiguous < clean,
    `clean=${clean} ambiguous=${ambiguous}`,
  );
}

// 8. Competence floor.
check(
  "8. competence floor (overall field accuracy >= 75)",
  result.corpusAccuracy.overallFieldAccuracy >= 75,
  `overallFieldAccuracy=${result.corpusAccuracy.overallFieldAccuracy}`,
);

// 9. Determinism.
{
  const corpusA = JSON.stringify(generateCorpus());
  const corpusB = JSON.stringify(generateCorpus());
  const pipelineA = JSON.stringify(buildMeetingCrmResult(MEETINGS, generatedAt));
  const pipelineB = JSON.stringify(buildMeetingCrmResult(MEETINGS, generatedAt));
  check(
    "9. determinism (corpus generation + full pipeline, byte-identical across two runs)",
    corpusA === corpusB && pipelineA === pipelineB,
    "two runs over the same seed/inputs differed",
  );
}

console.log(`\n${failures === 0 ? "All nine invariants passed." : `${failures} invariant(s) FAILED.`}`);
if (failures > 0) process.exit(1);

console.log("\nHeadline:");
console.log(
  `  overall field accuracy: ${result.corpusAccuracy.overallFieldAccuracy}  (clean: ${result.corpusAccuracy.byAmbiguityProfile.clean}, ambiguous: ${result.corpusAccuracy.byAmbiguityProfile.ambiguous})`,
);
