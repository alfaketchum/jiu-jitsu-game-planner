import { addInsight, addPosition, emptyNotebook, insightsFor, removeInsight, removePosition, sources, validateNotebook } from "./knowledge";

describe("notebook", () => {
  it("adds user insights next to the built-in ones", () => {
    const before = insightsFor(emptyNotebook(), "mount", "escape").length;
    const n = addInsight(emptyNotebook(), { position: "mount", role: "escape", topic: "key idea", text: "  Hide your elbows  ", source: " My coach " });
    const list = insightsFor(n, "mount", "escape");
    expect(list).toHaveLength(before + 1);
    const mine = list.find((i) => i.user)!;
    expect(mine.text).toBe("Hide your elbows");
    expect(mine.source).toBe("My coach");
    expect(insightsFor(n, "mount", "control").some((i) => i.user)).toBe(false);
    expect(insightsFor(removeInsight(n, mine.id), "mount", "escape")).toHaveLength(before);
  });

  it("ignores empty insights and treats a blank source as none", () => {
    expect(addInsight(emptyNotebook(), { position: "mount", role: "control", topic: "grips", text: "   " }).insights).toEqual([]);
    const n = addInsight(emptyNotebook(), { position: "mount", role: "control", topic: "grips", text: "x", source: "  " });
    expect(n.insights[0].source).toBeUndefined();
  });

  it("counts sources across built-in and user insights", () => {
    const n = addInsight(emptyNotebook(), { position: "mount", role: "control", topic: "grips", text: "x", source: "Marcelo Garcia" });
    const marcelo = sources(n).find((s) => s.name === "Marcelo Garcia")!;
    expect(marcelo.count).toBe(sources(emptyNotebook()).find((s) => s.name === "Marcelo Garcia")!.count + 1);
  });

  it("creates custom positions with unique keys and removes their insights with them", () => {
    let { notebook, key } = addPosition(emptyNotebook(), { name: "Worm guard", group: "Other", family: "guard", side: "bottom", gi: "gi", summary: "" });
    const second = addPosition(notebook, { name: "Worm guard", group: "Other", family: "guard", side: "bottom", summary: "" });
    expect(second.key).not.toBe(key);
    notebook = addInsight(second.notebook, { position: key, role: "control", topic: "grips", text: "Lapel feed" });
    const after = removePosition(notebook, key);
    expect(after.positions.map((p) => p.key)).toEqual([second.key]);
    expect(after.insights).toEqual([]);
  });

  it("rejects files that aren't notes and drops malformed entries", () => {
    expect(() => validateNotebook({ foo: 1 })).toThrow();
    const n = validateNotebook({ insights: [{ text: "ok", position: "mount", role: "control", topic: "nonsense" }, { text: 3 }], positions: [] });
    expect(n.insights).toHaveLength(1);
    expect(n.insights[0].topic).toBe("key idea");
  });
});
