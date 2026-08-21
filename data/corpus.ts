import { z } from "zod";
import { MeetingSchema } from "@/lib/domain/meeting";
import corpusJson from "./corpus.json";

const CorpusSchema = z.object({
  meetings: z.array(MeetingSchema),
});

const corpus = CorpusSchema.parse(corpusJson);

export const MEETINGS = corpus.meetings;
