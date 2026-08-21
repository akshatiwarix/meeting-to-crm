"use client";

import { useMemo, useState } from "react";
import { parseTranscriptText } from "@/lib/extraction/parse-transcript";
import { extractRecord } from "@/lib/extraction/record";
import { TranscriptView } from "./transcript-view";
import { ExtractedRecordPanel } from "./extracted-record-panel";

const EXAMPLE = `Sam (rep): Thanks for hopping on the call today, glad we could find the time.
Priya Chen (prospect): This is Priya Chen, I'm the VP of Engineering here at Northwind Labs.
Priya Chen (prospect): You can reach me at priya.chen@northwindlabs.com.
Sam (rep): Tell me more about your current workflow and where the friction is.
Priya Chen (prospect): We're currently in legal review on the contract.
Sam (rep): I'll send over the pricing sheet by Friday.
Priya Chen (prospect): Sounds good, appreciate the time today.`;

export function TryItForm() {
  const [rawText, setRawText] = useState(EXAMPLE);

  const { transcript, skippedLineCount } = useMemo(() => parseTranscriptText(rawText), [rawText]);
  const extracted = useMemo(() => extractRecord(transcript), [transcript]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-xl italic text-ink">Paste or edit a transcript</h2>
        <p className="mt-1 text-xs text-ink-dim">
          One line per turn: <code className="font-mono">Speaker Name (rep|prospect): what they said.</code>
        </p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={16}
          spellCheck={false}
          aria-label="Transcript text"
          className="mt-3 w-full rounded-lg border border-line bg-paper-raised p-3 font-mono text-sm text-ink"
        />
        {skippedLineCount > 0 && (
          <p className="mt-2 text-xs text-confidence-low">
            {skippedLineCount} line{skippedLineCount === 1 ? "" : "s"} didn&apos;t match the format above
            and {skippedLineCount === 1 ? "was" : "were"} skipped.
          </p>
        )}
        <div className="mt-4 max-h-[300px] overflow-y-auto rounded-lg border border-line bg-paper-raised p-4">
          <TranscriptView transcript={transcript} />
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl italic text-ink">Extracted CRM record</h2>
        <p className="mt-1 text-xs text-ink-dim">
          Runs the exact same extractor as the Meeting Library, live in your browser. No accuracy
          grade here — there&apos;s no ground truth for text you wrote yourself.
        </p>
        <div className="mt-3 rounded-lg border border-line bg-paper-raised p-4">
          <ExtractedRecordPanel extracted={extracted} />
        </div>
      </div>
    </div>
  );
}
