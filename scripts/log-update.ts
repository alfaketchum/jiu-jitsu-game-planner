/*
 * Log an update to one position:
 *   npm run log -- <position-key> "<what changed>" [source-id ...]
 * Appends a changelog entry with the next version, today's date and the position's
 * current content fingerprint. Run it after editing src/positions.ts or src/sourced.ts.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { LIBRARY } from "../src/library";
import { sourceById } from "../src/sources";
import { positionHash, type ChangeEntry } from "../src/versioning";

const file = fileURLToPath(new URL("../src/data/changelog.json", import.meta.url));
const [key, summary, ...sources] = process.argv.slice(2).filter((a) => a !== "--");

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

if (!key || !summary) fail('Usage: npm run log -- <position-key> "<what changed>" [source-id ...]');
const position = LIBRARY.find((p) => p.key === key);
if (!position) fail(`Unknown position "${key}". Known: ${LIBRARY.map((p) => p.key).join(", ")}`);
const unknown = sources.filter((s) => !sourceById(s));
if (unknown.length) fail(`Unknown source id(s): ${unknown.join(", ")}. Add them to src/sources.ts first.`);

const log = JSON.parse(readFileSync(file, "utf8")) as Record<string, ChangeEntry[]>;
const history = log[key] ?? [];
const hash = positionHash(position);
if (history.length && history[history.length - 1].hash === hash) fail(`${key} hasn't changed since v${history.length}. Nothing to log.`);

const d = new Date();
const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const entry: ChangeEntry = { version: history.length + 1, date, summary, sources, hash };
log[key] = [...history, entry];
writeFileSync(file, JSON.stringify(log, null, 2) + "\n");
console.log(`${key} → v${entry.version} (${date}): ${summary}`);
