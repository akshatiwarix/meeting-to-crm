import type { CorpusAccuracy } from "@/lib/domain/result";

export function CorpusAccuracyPanel({ accuracy }: { accuracy: CorpusAccuracy }) {
  return (
    <section aria-labelledby="accuracy-heading" className="rounded-lg border border-line bg-paper-raised p-4">
      <h2 id="accuracy-heading" className="font-display text-xl italic text-ink">
        Extraction accuracy
      </h2>
      <p className="mt-1 text-sm text-ink-dim">
        Every extraction below is graded against a hidden ground-truth answer key the corpus
        generator wrote in — this is a measured number, not a self-reported one.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
        <Stat label="Overall" value={accuracy.overallFieldAccuracy} />
        <Stat label="Clean meetings" value={accuracy.byAmbiguityProfile.clean} />
        <Stat label="Ambiguous meetings" value={accuracy.byAmbiguityProfile.ambiguous} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="tabular font-mono text-3xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-ink-dim">{label}</div>
    </div>
  );
}
