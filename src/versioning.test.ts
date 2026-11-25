import { LIBRARY } from "./library";
import { POSITIONS } from "./positions";
import { SOURCED } from "./sourced";
import { SOURCES, sourceById } from "./sources";
import { CHANGELOG, historyOf, latestOf, positionHash } from "./versioning";

describe("sources", () => {
  it("have unique ids, a practitioner, a title and a read date", () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) {
      expect(s.practitioner, s.id).toBeTruthy();
      expect(s.title, s.id).toBeTruthy();
      expect(s.accessed, s.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (s.status === "verified") expect(s.url, s.id).toMatch(/^https:\/\//);
    }
  });

  it("every practitioner insight cites a known source on a real position", () => {
    const keys = new Set(LIBRARY.map((l) => l.key));
    for (const i of SOURCED) {
      expect(keys.has(i.position), i.position).toBe(true);
      expect(sourceById(i.source), i.source).toBeDefined();
    }
  });

  it("every named built-in insight cites a source id", () => {
    for (const p of POSITIONS) for (const i of p.insights) {
      if (i.source) expect(i.sourceId, `${p.key}: ${i.text.slice(0, 40)}`).toBeTruthy();
    }
  });
});

describe("changelog", () => {
  it("covers every position, and only real positions", () => {
    for (const p of LIBRARY) expect(historyOf(p.key).length, p.key).toBeGreaterThan(0);
    const keys = new Set(LIBRARY.map((l) => l.key));
    for (const k of Object.keys(CHANGELOG)) expect(keys.has(k), k).toBe(true);
  });

  it("numbers versions 1..n with dates in order and known sources", () => {
    for (const [key, entries] of Object.entries(CHANGELOG)) {
      entries.forEach((e, i) => {
        expect(e.version, key).toBe(i + 1);
        expect(e.date, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (i) expect(e.date >= entries[i - 1].date, key).toBe(true);
        expect(e.summary, key).toBeTruthy();
        for (const s of e.sources) expect(sourceById(s), `${key} v${e.version}: ${s}`).toBeDefined();
      });
    }
  });

  it("has an entry for every content change (run `npm run log` after editing a position)", () => {
    const unlogged = LIBRARY.filter((p) => latestOf(p.key)?.hash !== positionHash(p)).map((p) => p.key);
    expect(unlogged, `Changed without a changelog entry: ${unlogged.join(", ")}. Run: npm run log -- <position> "<what changed>" <source ids>`).toEqual([]);
  });

  it("notices when a position's content changes", () => {
    const mount = LIBRARY.find((p) => p.key === "mount")!;
    const edited = { ...mount, insights: [...mount.insights, { ...mount.insights[0], id: "x", text: "new" }] };
    expect(positionHash(edited)).not.toBe(positionHash(mount));
  });
});
