"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MeetingResult } from "@/lib/domain/result";
import { DEAL_STAGES, type DealStage, type AmbiguityProfile } from "@/lib/domain/meeting";
import { ConfidenceBadge } from "./confidence-badge";

type SortColumn = "accuracy" | "stage" | "date";
const ALL = "All" as const;
const UNCLEAR = "unclear" as const;

const SORT_LABEL: Record<SortColumn, string> = {
  accuracy: "accuracy",
  stage: "stage",
  date: "date",
};

const STAGE_LABEL: Record<DealStage, string> = {
  discovery: "Discovery",
  demo: "Demo",
  proposal: "Proposal",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
};

export function MeetingTable({ meetings }: { meetings: MeetingResult[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("accuracy");
  const [stageFilter, setStageFilter] = useState<DealStage | typeof UNCLEAR | typeof ALL>(ALL);
  const [profileFilter, setProfileFilter] = useState<AmbiguityProfile | typeof ALL>(ALL);

  const filtered = useMemo(
    () =>
      meetings.filter((m) => {
        const stageOk =
          stageFilter === ALL ||
          (stageFilter === UNCLEAR
            ? m.extracted.dealStage.value === null
            : m.extracted.dealStage.value === stageFilter);
        const profileOk = profileFilter === ALL || m.meeting.ambiguityProfile === profileFilter;
        return stageOk && profileOk;
      }),
    [meetings, stageFilter, profileFilter],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortColumn === "accuracy") {
        const diff = b.grade.fieldAccuracy - a.grade.fieldAccuracy;
        if (diff !== 0) return diff;
      } else if (sortColumn === "stage") {
        const diff = (a.extracted.dealStage.value ?? "").localeCompare(b.extracted.dealStage.value ?? "");
        if (diff !== 0) return diff;
      } else {
        const diff = b.meeting.date.localeCompare(a.meeting.date);
        if (diff !== 0) return diff;
      }
      return a.meeting.id.localeCompare(b.meeting.id);
    });
  }, [filtered, sortColumn]);

  return (
    <section aria-labelledby="table-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="table-heading" className="font-display text-2xl italic text-ink">
          Meeting Library
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            aria-label="Filter by deal stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as DealStage | typeof UNCLEAR | typeof ALL)}
            className="rounded-md border border-line bg-paper-raised px-2 py-1"
          >
            <option value={ALL}>All stages</option>
            {DEAL_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </option>
            ))}
            <option value={UNCLEAR}>Unclear</option>
          </select>
          <select
            aria-label="Filter by ambiguity profile"
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value as AmbiguityProfile | typeof ALL)}
            className="rounded-md border border-line bg-paper-raised px-2 py-1"
          >
            <option value={ALL}>All meetings</option>
            <option value="clean">Clean</option>
            <option value="ambiguous">Ambiguous</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-ink-dim">
        Showing {sorted.length} of {meetings.length} meetings, sorted by{" "}
        <span className="font-medium text-ink">{SORT_LABEL[sortColumn]}</span>. Sort by{" "}
        {(["accuracy", "stage", "date"] as const).map((column, i) => (
          <span key={column}>
            {i > 0 && " · "}
            <button
              type="button"
              onClick={() => setSortColumn(column)}
              className={
                sortColumn === column
                  ? "font-medium text-ink underline decoration-line-strong underline-offset-2"
                  : "underline decoration-line-strong underline-offset-2 hover:decoration-ink"
              }
            >
              {SORT_LABEL[column]}
            </button>
          </span>
        ))}
        .
      </p>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-raised text-left text-xs uppercase tracking-wide text-ink-dim">
              <th className="px-3 py-2">Meeting</th>
              <th className="px-3 py-2">Contacts</th>
              <th className="px-3 py-2">Deal stage</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Field accuracy</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((result) => (
              <tr key={result.meeting.id} className="border-b border-line last:border-0 hover:bg-paper-raised">
                <td className="px-3 py-2">
                  <Link
                    href={`/meetings/${result.meeting.id}`}
                    className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
                  >
                    {result.meeting.date}
                  </Link>
                  <div className="mt-0.5 text-xs text-ink-dim capitalize">{result.meeting.ambiguityProfile}</div>
                </td>
                <td className="max-w-[220px] px-3 py-2 text-xs text-ink-dim">
                  {result.extracted.contacts.length > 0
                    ? result.extracted.contacts.map((c) => c.value.name).join(", ")
                    : "None found"}
                </td>
                <td className="px-3 py-2 text-ink">
                  {result.extracted.dealStage.value ? STAGE_LABEL[result.extracted.dealStage.value] : "Unclear"}
                </td>
                <td className="px-3 py-2">
                  <ConfidenceBadge confidence={result.extracted.dealStage.confidence} />
                </td>
                <td className="px-3 py-2">
                  <span className="tabular font-mono text-base font-semibold text-ink">
                    {result.grade.fieldAccuracy}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
