import { DESTINATIONS, LIBRARY } from "./library";


describe("library content", () => {
  it("covers the requested guards and top positions", () => {
    const keys = LIBRARY.map((l) => l.key);
    for (const k of [
      "closed-guard", "half-guard-bottom", "butterfly-guard", "spider-guard", "lasso-guard", "spider-dlr",
      "dlr-lasso", "sit-up-guard", "seated-guard", "spider-shin-to-shin", "side-control-top", "mount", "north-south",
      "de-la-riva", "x-guard", "single-leg-x", "back", "ashi-garami", "outside-ashi", "inside-sankaku", "fifty-fifty",
      "deep-half", "reverse-half", "inverted-half", "half-butterfly", "high-knee-shield", "low-knee-shield", "lockdown",
    ]) {
      expect(keys).toContain(k);
    }
  });

  it("gives every position both a control side and an escape side", () => {
    for (const l of LIBRARY) {
      expect(l.insights.filter((i) => i.role === "control").length, l.key).toBeGreaterThanOrEqual(4);
      expect(l.insights.filter((i) => i.role === "escape").length, l.key).toBeGreaterThanOrEqual(3);
    }
  });

  it("has unique insight ids and only points related links at real positions", () => {
    const ids = LIBRARY.flatMap((l) => l.insights.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
    const keys = new Set(LIBRARY.map((l) => l.key));
    for (const l of LIBRARY) for (const r of l.related) expect(keys.has(r), `${l.key} -> ${r}`).toBe(true);
  });

  it("has unique keys, and every sub-guard's parent exists in the same group", () => {
    const keys = LIBRARY.map((l) => l.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const l of LIBRARY.filter((x) => x.parent)) {
      const parent = LIBRARY.find((p) => p.key === l.parent);
      expect(parent, l.key).toBeDefined();
      expect(parent!.group).toBe(l.group);
    }
  });

  it("marks spider and lasso guards gi only, and leg entanglements carry the rules note", () => {
    for (const k of ["spider-guard", "lasso-guard", "spider-dlr", "dlr-lasso", "spider-shin-to-shin"]) {
      expect(LIBRARY.find((l) => l.key === k)!.gi, k).toBe("gi");
    }
    for (const l of LIBRARY.filter((x) => x.family === "legs")) expect(l.rules, l.key).toBeTruthy();
  });

  it("only lands techniques in known positions", () => {
    const known = new Set([...LIBRARY.map((l) => l.key), ...Object.keys(DESTINATIONS)]);
    for (const l of LIBRARY) for (const t of l.techniques) {
      if (t.type === "submission") expect(t.to).toBeNull();
      else expect(known.has(t.to!)).toBe(true);
    }
  });
});

describe("sourced insights", () => {
  it("all land on real positions, with an https link and a 'via'", async () => {
    const { SOURCED } = await import("./sourced");
    const keys = new Set(LIBRARY.map((l) => l.key));
    expect(SOURCED.length).toBeGreaterThan(60);
    for (const i of SOURCED) {
      expect(keys.has(i.position), i.position).toBe(true);
      expect(i.url).toMatch(/^https:\/\//);
      expect(i.via).toBeTruthy();
      expect(i.source).toBeTruthy();
    }
    const ids = SOURCED.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("techniques", () => {
  it("every built-in position has at least two", () => {
    for (const l of LIBRARY) expect(l.techniques.length, l.key).toBeGreaterThanOrEqual(2);
  });

  it("links submission variants across positions", async () => {
    const { techniqueFamily, techniqueVariants } = await import("./library");
    expect(techniqueFamily("Kimura from half guard")).toBe("kimura");
    const kimura = techniqueVariants("closed-guard", "Kimura").map((p) => p.key);
    expect(kimura).toEqual(expect.arrayContaining(["half-guard-bottom", "side-control-top", "north-south", "high-knee-shield"]));
    expect(kimura).not.toContain("closed-guard");
    // A sweep unique to one guard has no variants.
    expect(techniqueVariants("deep-half", "Waiter sweep")).toEqual([]);
  });
});
