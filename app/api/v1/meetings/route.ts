import { NextResponse } from "next/server";
import { MEETINGS } from "@/data/corpus";
import { buildMeetingCrmResult } from "@/lib/meeting-crm/build-result";
import { MeetingCrmResultSchema, type MeetingCrmResult } from "@/lib/domain/result";

let cached: MeetingCrmResult | null = null;

function getMeetingCrmResult(): MeetingCrmResult {
  if (!cached) {
    const computed = buildMeetingCrmResult(MEETINGS, new Date().toISOString());
    cached = MeetingCrmResultSchema.parse(computed);
  }
  return cached;
}

/** No auth, no persistence, no rate limit, no input to validate. */
export async function GET() {
  return NextResponse.json(getMeetingCrmResult());
}
