import type { MeetingCrmResult } from "@/lib/domain/result";
import { CorpusAccuracyPanel } from "./corpus-accuracy-panel";
import { MeetingTable } from "./meeting-table";

export function MeetingLibrary({ result }: { result: MeetingCrmResult }) {
  return (
    <div className="space-y-8">
      <CorpusAccuracyPanel accuracy={result.corpusAccuracy} />
      <MeetingTable meetings={result.meetings} />
    </div>
  );
}
