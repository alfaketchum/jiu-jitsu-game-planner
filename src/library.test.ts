import { addFromLibrary, DESTINATIONS, insightTarget, LIBRARY, missingTechniques } from "./library";
import { findGaps, type GamePlan } from "./model";
import { samplePlan } from "./sample";

const empty = (): GamePlan => ({ id: "p", name: "t", ruleset: "", startPosition: null, positions: [], techniques: [], updatedAt: 0 });

describe("library content", () => {
  it("covers the requested guards and top positions", () => {
    const keys = LIBRARY.map((l) => l.key);
    for (const k of [
      "closed-guard", "half-guard-bottom", "butterfly-guard", "spider-guard", "lasso-guard", "spider-dlr",
      "dlr-lasso", "sit-up-guard", "seated-guard", "spider-shin-to-shin", "side-control-top", "mount", "north-south",
    ]) {
      expect(keys).toContain(k);
    }
  });

  it("gives every position both a control side and an escape side", () => {
    for (const l of LIBRARY) {
      expect(l.insights.filter((i) => i.role === "control").length, l.key).toBeGreaterThanOrEqual(4);
      expect(l.insights.filter((i) => i.role === "escape").length, l.key).toBeGreaterThanOrEqual(4);
    }
  });

  it("has unique insight ids and only points related links at real positions", () => {
    const ids = LIBRARY.flatMap((l) => l.insights.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
    const keys = new Set(LIBRARY.map((l) => l.key));
    for (const l of LIBRARY) for (const r of l.related) expect(keys.has(r), `${l.key} -> ${r}`).toBe(true);
  });

  it("only lands techniques in known positions", () => {
    const known = new Set([...LIBRARY.map((l) => l.key), ...Object.keys(DESTINATIONS)]);
    for (const l of LIBRARY) for (const t of l.techniques) {
      if (t.type === "submission") expect(t.to).toBeNull();
      else expect(known.has(t.to!)).toBe(true);
    }
  });
});

describe("addFromLibrary", () => {
  it("creates the position, its destinations and techniques", () => {
    const r = addFromLibrary(empty(), "side-control-top", "B");
    const names = r.plan.positions.map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(["Side control", "Mount", "North-south", "Knee on belly"]));
    expect(r.addedTechniques).toBe(LIBRARY.find((l) => l.key === "side-control-top")!.techniques.length);
    expect(r.plan.techniques.every((t) => t.priority === "B")).toBe(true);
    expect(r.plan.startPosition).toBe("side-control-top");
  });

  it("reuses positions already in the plan and skips techniques it already has", () => {
    const sample = samplePlan();
    const before = sample.positions.length;
    const r = addFromLibrary(sample, "closed-guard", "learning");
    expect(r.plan.positions.length).toBe(before); // mount and back already exist
    const names = r.plan.techniques.filter((t) => t.from === "closed-guard").map((t) => t.name);
    expect(names.filter((n) => n === "Hip bump sweep")).toHaveLength(1);
    expect(missingTechniques(r.plan, "closed-guard")).toHaveLength(0);
  });

  it("treats a differently named transition to the same place as covered", () => {
    const names = missingTechniques(samplePlan(), "side-control-top").map((t) => t.name);
    expect(names).not.toContain("Slide to mount");
    expect(names).toContain("Walk to north-south");
  });

  it("can add a single technique", () => {
    const r = addFromLibrary(empty(), "mount", "A", ["Americana"]);
    expect(r.plan.techniques.map((t) => t.name)).toEqual(["Americana"]);
  });

  it("a plan built from the whole library has no dead-end guards", () => {
    let plan = empty();
    for (const l of LIBRARY) plan = addFromLibrary(plan, l.key, "A").plan;
    const deadGuards = findGaps(plan).filter((g) => g.kind === "dead-end" && LIBRARY.some((l) => l.key === g.positionId));
    expect(deadGuards).toEqual([]);
  });
});

describe("insightTarget", () => {
  it("maps bottom-of-a-pin positions to that pin's escape side", () => {
    expect(insightTarget({ id: "side-control-bottom", name: "x", side: "bottom", notes: "" })).toEqual({ key: "side-control-top", role: "escape" });
    expect(insightTarget({ id: "closed-guard", name: "x", side: "bottom", notes: "" })).toEqual({ key: "closed-guard", role: "control" });
    expect(insightTarget({ id: "standing", name: "x", side: "neutral", notes: "" })).toBeUndefined();
  });
});
