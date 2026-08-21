import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateCorpus } from "../data/generate";

const corpus = generateCorpus();

const outPath = fileURLToPath(new URL("../data/corpus.json", import.meta.url));
writeFileSync(outPath, JSON.stringify(corpus, null, 2) + "\n");

const ambiguousCount = corpus.meetings.filter((m) => m.ambiguityProfile === "ambiguous").length;

console.log(`meetings: ${corpus.meetings.length}`);
console.log(`ambiguous: ${ambiguousCount}`);
console.log(`clean: ${corpus.meetings.length - ambiguousCount}`);
console.log(`wrote ${outPath}`);
