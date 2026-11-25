/* List positions whose content changed since their last changelog entry: npm run log:status */
import { LIBRARY } from "../src/library";
import { latestOf, positionHash } from "../src/versioning";

const stale = LIBRARY.filter((p) => latestOf(p.key)?.hash !== positionHash(p));
if (!stale.length) console.log("All positions are logged.");
for (const p of stale) {
  const last = latestOf(p.key);
  console.log(`${p.key}: changed since ${last ? `v${last.version} (${last.date})` : "never logged"}`);
}
process.exit(stale.length ? 1 : 0);
