import { buildChains, findGaps, validatePlan, type GamePlan } from "./model";
import { samplePlan } from "./sample";

function plan(partial: Partial<GamePlan>): GamePlan {
  return { id: "x", name: "t", ruleset: "", startPosition: null, positions: [], techniques: [], updatedAt: 0, ...partial };
}

describe("buildChains", () => {
  it("follows transitions and stops at submissions", () => {
    const sample = samplePlan();
    const chains = buildChains(sample, "closed-guard", { priorities: ["A"] });
    const names = chains.map((c) => c.technique.name);
    expect(names).toContain("Hip bump sweep");
    const bump = chains.find((c) => c.technique.name === "Hip bump sweep")!;
    expect(bump.children.map((c) => c.technique.name)).toContain("Cross collar choke");
    const kimura = chains.find((c) => c.technique.name === "Kimura")!;
    expect(kimura.children).toEqual([]);
  });

  it("marks loops instead of recursing forever", () => {
    const p = plan({
      positions: [
        { id: "a", name: "A", side: "bottom", notes: "" },
        { id: "b", name: "B", side: "bottom", notes: "" },
      ],
      techniques: [
        { id: "1", name: "a→b", type: "transition", from: "a", to: "b", priority: "A", trigger: "", notes: "" },
        { id: "2", name: "b→a", type: "transition", from: "b", to: "a", priority: "A", trigger: "", notes: "" },
      ],
    });
    const chains = buildChains(p, "a");
    expect(chains[0].children[0].loops).toBe(true);
  });
});

describe("findGaps", () => {
  it("flags dead ends, bottom positions with no way out and no finishes", () => {
    const p = plan({
      startPosition: "a",
      positions: [
        { id: "a", name: "Guard", side: "bottom", notes: "" },
        { id: "b", name: "Mount", side: "top", notes: "" },
        { id: "c", name: "Turtle", side: "bottom", notes: "" },
      ],
      techniques: [
        { id: "1", name: "pull", type: "transition", from: "a", to: "b", priority: "A", trigger: "", notes: "" },
      ],
    });
    const kinds = findGaps(p).map((g) => `${g.kind}:${g.positionId}`);
    expect(kinds).toContain("dead-end:b");
    expect(kinds).toContain("dead-end:c");
    expect(kinds).toContain("no-escape:a");
    expect(kinds).toContain("no-finish:a");
  });

  it("knows a position can finish through a chain", () => {
    const gaps = findGaps(samplePlan());
    expect(gaps.find((g) => g.kind === "no-finish" && g.positionId === "standing")).toBeUndefined();
  });
});

describe("validatePlan", () => {
  it("rejects techniques pointing at missing positions", () => {
    const bad = plan({
      positions: [{ id: "a", name: "A", side: "top", notes: "" }],
      techniques: [{ id: "1", name: "x", type: "pass", from: "a", to: "zzz", priority: "A", trigger: "", notes: "" }],
    });
    expect(() => validatePlan(bad)).toThrow(/doesn't exist/);
  });
});
