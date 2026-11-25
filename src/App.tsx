import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildChains,
  findGaps,
  incoming,
  outgoing,
  uid,
  PRIORITIES,
  PRIORITY_LABEL,
  SIDES,
  TECH_TYPES,
  type ChainNode,
  type GamePlan,
  type Position,
  type Priority,
  type Technique,
} from "./model";
import { samplePlan } from "./sample";
import { Insights, Library } from "./LibraryView";
import { loadNotebook, saveNotebook, type Notebook } from "./knowledge";
import type { AttireMode } from "./library";
import { downloadPlan, loadActiveId, loadPlans, readPlanFile, saveActiveId, savePlans } from "./storage";

type View = "plan" | "chains" | "gaps" | "library";

const MODE_KEY = "jjgp.attire.v1";
function loadMode(): AttireMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === "gi" || m === "no-gi" || m === "both") return m;
  } catch {
    /* ignore */
  }
  return "both";
}

function blankPlan(): GamePlan {
  return { id: uid(), name: "New game plan", ruleset: "", startPosition: null, positions: [], techniques: [], updatedAt: Date.now() };
}

export default function App() {
  const [plans, setPlans] = useState<GamePlan[]>(loadPlans);
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = loadActiveId();
    return plans.some((p) => p.id === saved) ? saved! : plans[0].id;
  });
  const [view, setView] = useState<View>("plan");
  const [notebook, setNotebook] = useState<Notebook>(loadNotebook);
  const [libraryKey, setLibraryKey] = useState<string | undefined>();
  const [mode, setMode] = useState<AttireMode>(loadMode);
  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);
  useEffect(() => saveNotebook(notebook), [notebook]);
  const openLibrary = (key: string) => {
    setLibraryKey(key);
    setView("library");
  };
  const [selected, setSelected] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const plan = plans.find((p) => p.id === activeId) ?? plans[0];

  useEffect(() => savePlans(plans), [plans]);
  useEffect(() => saveActiveId(plan.id), [plan.id]);
  useEffect(() => {
    if (!selected || !plan.positions.some((p) => p.id === selected)) {
      setSelected(plan.startPosition ?? plan.positions[0]?.id ?? null);
    }
  }, [plan, selected]);

  const update = (fn: (p: GamePlan) => GamePlan) =>
    setPlans((all) => all.map((p) => (p.id === plan.id ? { ...fn(p), updatedAt: Date.now() } : p)));

  const addPlan = (p: GamePlan) => {
    setPlans((all) => [...all, p]);
    setActiveId(p.id);
    setSelected(null);
  };

  const deletePlan = () => {
    if (!confirm(`Delete "${plan.name}"? Export it first if you want a copy.`)) return;
    const rest = plans.filter((p) => p.id !== plan.id);
    const next = rest.length ? rest : [blankPlan()];
    setPlans(next);
    setActiveId(next[0].id);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = await readPlanFile(file);
      addPlan({ ...imported, id: uid() });
    } catch (err) {
      alert(`Couldn't import: ${(err as Error).message}`);
    }
  };

  const gaps = useMemo(() => findGaps(plan), [plan]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>🥋 Game Planner</h1>
        <select value={plan.id} onChange={(e) => setActiveId(e.target.value)} aria-label="Game plan">
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="attire-switch" role="radiogroup" aria-label="Gi or no-gi">
          {(["both", "gi", "no-gi"] as AttireMode[]).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m === "both" ? "Both" : m === "gi" ? "Gi" : "No-gi"}
            </button>
          ))}
        </div>
        <div className="actions">
          <button onClick={() => addPlan(blankPlan())}>New</button>
          <button onClick={() => addPlan(samplePlan())}>Add sample</button>
          <button onClick={() => downloadPlan(plan)}>Export</button>
          <button onClick={() => fileInput.current?.click()}>Import</button>
          <button className="danger" onClick={deletePlan}>
            Delete
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={onImport} />
        </div>
      </header>

      <section className="plan-meta">
        <label>
          Name
          <input value={plan.name} onChange={(e) => update((p) => ({ ...p, name: e.target.value }))} />
        </label>
        <label>
          Ruleset
          <input
            value={plan.ruleset}
            placeholder="e.g. IBJJF Gi, ADCC, EBI"
            onChange={(e) => update((p) => ({ ...p, ruleset: e.target.value }))}
          />
        </label>
        <label>
          Starting position
          <select
            value={plan.startPosition ?? ""}
            onChange={(e) => update((p) => ({ ...p, startPosition: e.target.value || null }))}
          >
            <option value="">—</option>
            {plan.positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <nav className="tabs">
        {(["plan", "chains", "gaps", "library"] as View[]).map((v) => (
          <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
            {v === "plan" ? "Positions" : v === "chains" ? "Chains" : v === "gaps" ? `Gaps (${gaps.length})` : "Library"}
          </button>
        ))}
      </nav>

      {view === "library" ? (
        <Library
          key={libraryKey}
          initialKey={libraryKey}
          mode={mode}
          notebook={notebook}
          setNotebook={setNotebook}
          plan={plan}
          update={update}
          openInPlan={(id) => {
            setSelected(id);
            setView("plan");
          }}
        />
      ) : (
      <main className="layout">
        <PositionList plan={plan} selected={selected} onSelect={setSelected} update={update} />
        <div className="main-pane">
          {selected && view === "plan" && (
            <PositionDetail
              key={selected}
              plan={plan}
              positionId={selected}
              onSelect={setSelected}
              update={update}
              notebook={notebook}
              openLibrary={openLibrary}
              mode={mode}
            />
          )}
          {selected && view === "chains" && <Chains plan={plan} positionId={selected} onSelect={setSelected} />}
          {view === "gaps" && (
            <Gaps
              plan={plan}
              gaps={gaps}
              onSelect={(id) => {
                setSelected(id);
                setView("plan");
              }}
            />
          )}
          {!selected && view !== "gaps" && (
            <p className="empty">Add a position on the left, or pick one from the Library tab, to start building your game.</p>
          )}
        </div>
      </main>
      )}
    </div>
  );
}

type Updater = (fn: (p: GamePlan) => GamePlan) => void;

function PositionList({
  plan,
  selected,
  onSelect,
  update,
}: {
  plan: GamePlan;
  selected: string | null;
  onSelect: (id: string) => void;
  update: Updater;
}) {
  const [name, setName] = useState("");
  const [side, setSide] = useState<Position["side"]>("bottom");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const pos: Position = { id: uid(), name: name.trim(), side, notes: "" };
    update((p) => ({ ...p, positions: [...p.positions, pos], startPosition: p.startPosition ?? pos.id }));
    onSelect(pos.id);
    setName("");
  };

  return (
    <aside className="sidebar">
      {SIDES.map((s) => {
        const list = plan.positions.filter((p) => p.side === s);
        if (!list.length) return null;
        return (
          <div key={s} className="side-group">
            <h3>{s}</h3>
            <ul>
              {list.map((pos) => (
                <li key={pos.id}>
                  <button className={pos.id === selected ? "pos active" : "pos"} onClick={() => onSelect(pos.id)}>
                    <span>
                      {pos.id === plan.startPosition && <span title="Starting position">▶ </span>}
                      {pos.name}
                    </span>
                    <span className="count">{outgoing(plan, pos.id).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <form onSubmit={add} className="add-pos">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New position…" />
        <select value={side} onChange={(e) => setSide(e.target.value as Position["side"])}>
          {SIDES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
    </aside>
  );
}

function PositionDetail({
  plan,
  positionId,
  onSelect,
  update,
  notebook,
  openLibrary,
  mode,
}: {
  plan: GamePlan;
  positionId: string;
  onSelect: (id: string) => void;
  update: Updater;
  notebook: Notebook;
  openLibrary: (key: string) => void;
  mode: AttireMode;
}) {
  const pos = plan.positions.find((p) => p.id === positionId)!;
  const [editing, setEditing] = useState<Technique | null>(null);
  const out = outgoing(plan, positionId);
  const into = incoming(plan, positionId);
  const nameOf = (id: string | null) => plan.positions.find((p) => p.id === id)?.name ?? "—";

  const setPos = (patch: Partial<Position>) =>
    update((p) => ({ ...p, positions: p.positions.map((x) => (x.id === positionId ? { ...x, ...patch } : x)) }));

  const removePos = () => {
    const n = plan.techniques.filter((t) => t.from === positionId || t.to === positionId).length;
    if (!confirm(`Delete ${pos.name}${n ? ` and the ${n} technique(s) linked to it` : ""}?`)) return;
    update((p) => ({
      ...p,
      positions: p.positions.filter((x) => x.id !== positionId),
      techniques: p.techniques.filter((t) => t.from !== positionId && t.to !== positionId),
      startPosition: p.startPosition === positionId ? null : p.startPosition,
    }));
  };

  const saveTech = (t: Technique) => {
    update((p) => ({
      ...p,
      techniques: p.techniques.some((x) => x.id === t.id)
        ? p.techniques.map((x) => (x.id === t.id ? t : x))
        : [...p.techniques, t],
    }));
    setEditing(null);
  };

  const removeTech = (id: string) => update((p) => ({ ...p, techniques: p.techniques.filter((t) => t.id !== id) }));

  const newTech = (): Technique => ({
    id: uid(),
    name: "",
    type: pos.side === "bottom" ? "sweep" : pos.side === "top" ? "submission" : "takedown",
    from: positionId,
    to: null,
    priority: "A",
    trigger: "",
    notes: "",
  });

  return (
    <div className="detail">
      <div className="detail-head">
        <input className="title" value={pos.name} onChange={(e) => setPos({ name: e.target.value })} />
        <select value={pos.side} onChange={(e) => setPos({ side: e.target.value as Position["side"] })}>
          {SIDES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="danger" onClick={removePos}>
          Delete position
        </button>
      </div>
      <textarea
        value={pos.notes}
        placeholder="Key details, grips, priorities in this position…"
        onChange={(e) => setPos({ notes: e.target.value })}
      />
      <Insights pos={pos} notebook={notebook} openLibrary={openLibrary} mode={mode} />

      <div className="section-head">
        <h2>From here</h2>
        <button onClick={() => setEditing(newTech())}>+ Technique</button>
      </div>
      {editing && editing.from === positionId && (
        <TechniqueForm plan={plan} technique={editing} onSave={saveTech} onCancel={() => setEditing(null)} />
      )}
      {out.length === 0 && !editing && <p className="empty">Nothing yet. What's your first move when you get here?</p>}
      {PRIORITIES.map((pr) => {
        const list = out.filter((t) => t.priority === pr);
        if (!list.length) return null;
        return (
          <div key={pr} className="prio-group">
            <h4 className={`prio prio-${pr}`}>{PRIORITY_LABEL[pr]}</h4>
            <ul className="techs">
              {list.map((t) => (
                <li key={t.id} className="tech">
                  <div className="tech-main">
                    <span className={`badge type-${t.type}`}>{t.type}</span>
                    <strong>{t.name}</strong>
                    {t.to ? (
                      <button className="link" onClick={() => onSelect(t.to!)}>
                        → {nameOf(t.to)}
                      </button>
                    ) : (
                      t.type === "submission" && <span className="finish">✓ finish</span>
                    )}
                  </div>
                  {t.trigger && <div className="trigger">When: {t.trigger}</div>}
                  {t.notes && <div className="notes">{t.notes}</div>}
                  <div className="tech-actions">
                    <button onClick={() => setEditing(t)}>Edit</button>
                    <button className="danger" onClick={() => removeTech(t.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {into.length > 0 && (
        <>
          <h2>How I get here</h2>
          <ul className="techs compact">
            {into.map((t) => (
              <li key={t.id}>
                <button className="link" onClick={() => onSelect(t.from)}>
                  {nameOf(t.from)}
                </button>{" "}
                via <strong>{t.name}</strong> <span className={`badge type-${t.type}`}>{t.type}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TechniqueForm({
  plan,
  technique,
  onSave,
  onCancel,
}: {
  plan: GamePlan;
  technique: Technique;
  onSave: (t: Technique) => void;
  onCancel: () => void;
}) {
  const [t, setT] = useState(technique);
  const set = (patch: Partial<Technique>) => setT((x) => ({ ...x, ...patch }));

  return (
    <form
      className="tech-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (t.name.trim()) onSave({ ...t, name: t.name.trim(), to: t.type === "submission" ? null : t.to });
      }}
    >
      <input autoFocus value={t.name} placeholder="Technique name" onChange={(e) => set({ name: e.target.value })} />
      <div className="row">
        <label>
          Type
          <select value={t.type} onChange={(e) => set({ type: e.target.value as Technique["type"] })}>
            {TECH_TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={t.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
            {PRIORITIES.map((x) => (
              <option key={x} value={x}>
                {PRIORITY_LABEL[x]}
              </option>
            ))}
          </select>
        </label>
        {t.type !== "submission" && (
          <label>
            Lands in
            <select value={t.to ?? ""} onChange={(e) => set({ to: e.target.value || null })}>
              <option value="">—</option>
              {plan.positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <input value={t.trigger} placeholder="When… (the reaction or opening that sets it up)" onChange={(e) => set({ trigger: e.target.value })} />
      <textarea value={t.notes} placeholder="Details, common mistakes, counters to watch for" onChange={(e) => set({ notes: e.target.value })} />
      <div className="row">
        <button type="submit" className="primary">
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Chains({ plan, positionId, onSelect }: { plan: GamePlan; positionId: string; onSelect: (id: string) => void }) {
  const [prios, setPrios] = useState<Priority[]>(["A", "B"]);
  const [depth, setDepth] = useState(4);
  const chains = useMemo(() => buildChains(plan, positionId, { maxDepth: depth, priorities: prios }), [plan, positionId, depth, prios]);
  const nameOf = (id: string | null) => plan.positions.find((p) => p.id === id)?.name ?? "—";

  const toggle = (p: Priority) => setPrios((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const render = (nodes: ChainNode[]) => (
    <ul className="chain">
      {nodes.map((n) => (
        <li key={n.technique.id}>
          <span className={`badge type-${n.technique.type}`}>{n.technique.type}</span>
          <strong>{n.technique.name}</strong>
          {n.technique.trigger && <span className="trigger-inline"> — {n.technique.trigger}</span>}
          {n.technique.to ? (
            <>
              {" "}
              →{" "}
              <button className="link" onClick={() => onSelect(n.technique.to!)}>
                {nameOf(n.technique.to)}
              </button>
              {n.loops && <span className="muted"> (loops back)</span>}
            </>
          ) : (
            n.technique.type === "submission" && <span className="finish"> ✓</span>
          )}
          {n.children.length > 0 && render(n.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="detail">
      <h2>Chains from {nameOf(positionId)}</h2>
      <div className="row filters">
        {PRIORITIES.map((p) => (
          <label key={p} className="check">
            <input type="checkbox" checked={prios.includes(p)} onChange={() => toggle(p)} /> {PRIORITY_LABEL[p]}
          </label>
        ))}
        <label>
          Depth
          <input type="number" min={1} max={8} value={depth} onChange={(e) => setDepth(Math.max(1, Math.min(8, +e.target.value || 1)))} />
        </label>
      </div>
      {chains.length ? render(chains) : <p className="empty">No techniques match these filters from here.</p>}
    </div>
  );
}

function Gaps({ plan, gaps, onSelect }: { plan: GamePlan; gaps: ReturnType<typeof findGaps>; onSelect: (id: string) => void }) {
  if (!plan.positions.length) return <p className="empty">Add positions to check your plan for holes.</p>;
  if (!gaps.length) return <p className="empty">No obvious holes. Go test it on the mats.</p>;
  const label: Record<string, string> = {
    "dead-end": "Dead end",
    "no-escape": "Stuck on bottom",
    "no-finish": "No finish",
    thin: "One option only",
    unreachable: "Unreachable",
  };
  return (
    <div className="detail">
      <h2>Holes in the plan</h2>
      <ul className="gaps">
        {gaps.map((g, i) => (
          <li key={i} className={`gap gap-${g.kind}`}>
            <span className="badge">{label[g.kind]}</span> {g.message}{" "}
            <button className="link" onClick={() => onSelect(g.positionId)}>
              Fix
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
