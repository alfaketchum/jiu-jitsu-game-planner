import { useRef, useState } from "react";
import { PRIORITIES, PRIORITY_LABEL, type GamePlan, type Position, type Priority } from "./model";
import {
  addFromLibrary,
  DESTINATIONS,
  findPlanPosition,
  GROUPS,
  insightTarget,
  LIBRARY,
  missingTechniques,
  TOPICS,
  type Group,
  type Insight,
  type LibraryPosition,
  type Role,
  type Topic,
} from "./library";
import {
  addInsight,
  addPosition,
  allPositions,
  insightsFor,
  removeInsight,
  removePosition,
  sources,
  validateNotebook,
  type Notebook,
} from "./knowledge";

type Updater = (fn: (p: GamePlan) => GamePlan) => void;
type NotebookUpdater = (fn: (n: Notebook) => Notebook) => void;

const ROLE_TITLE: Record<Role, string> = { control: "Control", escape: "Escapes" };
const ROLE_HINT: Record<Role, string> = { control: "attacking side", escape: "defending side" };

export function Library({
  plan,
  update,
  notebook,
  setNotebook,
  openInPlan,
  initialKey,
}: {
  plan: GamePlan;
  update: Updater;
  notebook: Notebook;
  setNotebook: NotebookUpdater;
  openInPlan: (id: string) => void;
  initialKey?: string;
}) {
  const positions = allPositions(notebook);
  const [key, setKey] = useState(initialKey && positions.some((p) => p.key === initialKey) ? initialKey : LIBRARY[0].key);
  const [source, setSource] = useState("");
  const [adding, setAdding] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const entry = positions.find((p) => p.key === key) ?? LIBRARY[0];
  const allSources = sources(notebook);

  const countFor = (k: string) =>
    source ? [...insightsFor(notebook, k, "control"), ...insightsFor(notebook, k, "escape")].filter((i) => i.source === source).length : 0;

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jiu-jitsu-library-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const incoming = validateNotebook(JSON.parse(await file.text()));
      setNotebook((n) => ({
        insights: [...n.insights, ...incoming.insights.filter((i) => !n.insights.some((x) => x.id === i.id))],
        positions: [...n.positions, ...incoming.positions.filter((p) => !n.positions.some((x) => x.key === p.key))],
      }));
    } catch (err) {
      alert(`Couldn't import: ${(err as Error).message}`);
    }
  };

  return (
    <main className="layout">
      <aside className="sidebar">
        <label className="filter">
          Practitioner
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All sources</option>
            {allSources.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
        </label>
        {GROUPS.map((g) => {
          const list = positions.filter((p) => p.group === g);
          if (!list.length) return null;
          return (
            <div key={g} className="side-group">
              <h3>{g}</h3>
              <ul>
                {list.map((l) => {
                  const n = countFor(l.key);
                  return (
                    <li key={l.key}>
                      <button
                        className={`pos${l.key === key ? " active" : ""}${source && !n ? " dim" : ""}`}
                        onClick={() => setKey(l.key)}
                      >
                        <span>{l.name}</span>
                        <span className="count">
                          {source ? (n || "") : findPlanPosition(plan, l.key) ? <span title="In your plan">✓</span> : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {adding ? (
          <NewPositionForm
            onCancel={() => setAdding(false)}
            onSave={(p) => {
              const r = addPosition(notebook, p);
              setNotebook(() => r.notebook);
              setAdding(false);
              setKey(r.key);
            }}
          />
        ) : (
          <button className="wide-btn" onClick={() => setAdding(true)}>
            + New position
          </button>
        )}
        <div className="row notes-io">
          <button onClick={exportNotes}>Export notes</button>
          <button onClick={() => fileInput.current?.click()}>Import notes</button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={importNotes} />
        </div>
        <p className="muted small">
          Insights tagged with a name come from that practitioner; untagged ones are common coaching. Add your own with a source as you collect them.
        </p>
      </aside>
      <div className="main-pane">
        <PositionPage
          entry={entry}
          plan={plan}
          update={update}
          notebook={notebook}
          setNotebook={setNotebook}
          openInPlan={openInPlan}
          onSelect={setKey}
          source={source}
          onDeleted={() => setKey(LIBRARY[0].key)}
        />
      </div>
    </main>
  );
}

function PositionPage({
  entry,
  plan,
  update,
  notebook,
  setNotebook,
  openInPlan,
  onSelect,
  source,
  onDeleted,
}: {
  entry: LibraryPosition;
  plan: GamePlan;
  update: Updater;
  notebook: Notebook;
  setNotebook: NotebookUpdater;
  openInPlan: (id: string) => void;
  onSelect: (key: string) => void;
  source: string;
  onDeleted: () => void;
}) {
  const inPlan = findPlanPosition(plan, entry.key);
  const all = allPositions(notebook);
  const nameOf = (k: string) => all.find((p) => p.key === k)?.name ?? k;

  return (
    <div className="detail library">
      <div className="detail-head">
        <h2 className="lib-title">{entry.name}</h2>
        <span className="badge">{entry.family === "guard" ? "guard" : "top pin"}</span>
        {entry.gi && <span className="badge">{entry.gi} only</span>}
        {entry.user && <span className="badge">yours</span>}
        <span className="spacer" />
        {inPlan && (
          <button className="link" onClick={() => openInPlan(inPlan.id)}>
            Open in plan
          </button>
        )}
        {entry.user && (
          <button
            className="danger"
            onClick={() => {
              if (!confirm(`Delete ${entry.name} and your insights on it?`)) return;
              setNotebook((n) => removePosition(n, entry.key));
              onDeleted();
            }}
          >
            Delete
          </button>
        )}
      </div>
      {entry.summary && <p>{entry.summary}</p>}
      {entry.related.length > 0 && (
        <p className="related">
          Related:{" "}
          {entry.related.map((k) => (
            <button key={k} className="chip" onClick={() => onSelect(k)}>
              {nameOf(k)}
            </button>
          ))}
        </p>
      )}

      <div className="roles">
        {(["control", "escape"] as Role[]).map((role) => (
          <RoleColumn
            key={role}
            entry={entry}
            role={role}
            notebook={notebook}
            setNotebook={setNotebook}
            source={source}
          />
        ))}
      </div>

      {entry.techniques.length > 0 && <Attacks entry={entry} plan={plan} update={update} />}
    </div>
  );
}

function RoleColumn({
  entry,
  role,
  notebook,
  setNotebook,
  source,
  compact,
}: {
  entry: LibraryPosition;
  role: Role;
  notebook: Notebook;
  setNotebook?: NotebookUpdater;
  source?: string;
  compact?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const insights = insightsFor(notebook, entry.key, role);
  const shown = source ? insights.filter((i) => i.source === source) : insights;
  const byTopic = TOPICS.map((t) => [t, shown.filter((i) => i.topic === t)] as const).filter(([, l]) => l.length);
  const who = role === "control" ? entry.controller : entry.escaper;

  return (
    <section className={`role role-${role}`}>
      <header>
        <h3>{ROLE_TITLE[role]}</h3>
        <span className="muted small">
          {who} · {ROLE_HINT[role]}
        </span>
      </header>
      {byTopic.length === 0 && (
        <p className="empty small">{source ? `Nothing from ${source} here yet.` : "No insights yet. Add the first one."}</p>
      )}
      {byTopic.map(([topic, list]) => (
        <div key={topic} className="topic">
          <h4>{topic}</h4>
          <ul>
            {list.map((i) => (
              <InsightItem key={i.id} insight={i} onRemove={setNotebook && i.user ? () => setNotebook((n) => removeInsight(n, i.id)) : undefined} />
            ))}
          </ul>
        </div>
      ))}
      {setNotebook && !compact &&
        (adding ? (
          <InsightForm
            sources={sources(notebook).map((s) => s.name)}
            defaultSource={source}
            onCancel={() => setAdding(false)}
            onSave={(v) => {
              setNotebook((n) => addInsight(n, { ...v, position: entry.key, role }));
              setAdding(false);
            }}
          />
        ) : (
          <button className="small-btn" onClick={() => setAdding(true)}>
            + Add {role === "control" ? "control" : "escape"} insight
          </button>
        ))}
    </section>
  );
}

function InsightItem({ insight, onRemove }: { insight: Insight; onRemove?: () => void }) {
  return (
    <li className={insight.topic === "mistake" ? "insight mistake" : "insight"}>
      {insight.text}{" "}
      {insight.source && <span className="source">— {insight.source}</span>}
      {insight.user && <span className="badge mine">yours</span>}
      {onRemove && (
        <button className="x" title="Remove" onClick={onRemove}>
          ✕
        </button>
      )}
    </li>
  );
}

function InsightForm({
  sources,
  defaultSource,
  onSave,
  onCancel,
}: {
  sources: string[];
  defaultSource?: string;
  onSave: (v: { topic: Topic; text: string; source?: string }) => void;
  onCancel: () => void;
}) {
  const [topic, setTopic] = useState<Topic>("key idea");
  const [text, setText] = useState("");
  const [source, setSource] = useState(defaultSource ?? "");
  const listId = useRef(`src-${Math.random().toString(36).slice(2)}`).current;
  return (
    <form
      className="tech-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSave({ topic, text, source });
      }}
    >
      <textarea autoFocus value={text} placeholder="The insight, in your words" onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="grow">
          Source (practitioner, instructional, class)
          <input list={listId} value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. coach, seminar, DVD" />
          <datalist id={listId}>
            {sources.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
      </div>
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

function NewPositionForm({
  onSave,
  onCancel,
}: {
  onSave: (p: { name: string; group: Group; family: "guard" | "top"; side: "top" | "bottom"; gi?: "gi" | "no-gi"; summary: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [family, setFamily] = useState<"guard" | "top">("guard");
  const [group, setGroup] = useState<Group>("Other");
  const [gi, setGi] = useState<"" | "gi" | "no-gi">("");
  const [summary, setSummary] = useState("");
  return (
    <form
      className="tech-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim())
          onSave({ name, group, family, side: family === "guard" ? "bottom" : "top", gi: gi || undefined, summary });
      }}
    >
      <input autoFocus value={name} placeholder="Position name" onChange={(e) => setName(e.target.value)} />
      <select value={family} onChange={(e) => setFamily(e.target.value as "guard" | "top")}>
        <option value="guard">Guard (controlled from bottom)</option>
        <option value="top">Top pin (controlled from top)</option>
      </select>
      <select value={group} onChange={(e) => setGroup(e.target.value as Group)}>
        {GROUPS.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <select value={gi} onChange={(e) => setGi(e.target.value as "" | "gi" | "no-gi")}>
        <option value="">Gi and no-gi</option>
        <option value="gi">Gi only</option>
        <option value="no-gi">No-gi only</option>
      </select>
      <textarea value={summary} placeholder="What it is, in a sentence or two" onChange={(e) => setSummary(e.target.value)} />
      <div className="row">
        <button type="submit" className="primary">
          Add
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

const destName = (key: string | null) => (key ? (LIBRARY.find((l) => l.key === key)?.name ?? DESTINATIONS[key]?.name ?? key) : null);

function Attacks({ entry, plan, update }: { entry: LibraryPosition; plan: GamePlan; update: Updater }) {
  const [priority, setPriority] = useState<Priority>("learning");
  const missing = missingTechniques(plan, entry.key);
  const add = (only?: string[]) => update((p) => addFromLibrary(p, entry.key, priority, only).plan);

  return (
    <details className="attacks">
      <summary>What this control sets up ({entry.techniques.length})</summary>
      <div className="lib-add">
        <label>
          Add to plan as
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        {missing.length > 0 ? (
          <button onClick={() => add()}>
            {findPlanPosition(plan, entry.key) ? `Add ${missing.length} missing` : "Add position + all"}
          </button>
        ) : (
          <span className="finish">All in your plan.</span>
        )}
      </div>
      <ul className="techs compact">
        {entry.techniques.map((t) => (
          <li key={t.name}>
            <span className={`badge type-${t.type}`}>{t.type}</span>
            <strong>{t.name}</strong> {t.to ? <span className="muted">→ {destName(t.to)}</span> : <span className="finish">✓</span>}
            <span className="muted"> — {t.trigger}</span>{" "}
            {missing.includes(t) ? (
              <button className="small-btn" onClick={() => add([t.name])}>
                + Add
              </button>
            ) : (
              <span className="muted small">in plan</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Insight panel on a plan position that matches a library entry. Shows your side first. */
export function Insights({
  pos,
  notebook,
  openLibrary,
}: {
  pos: Position;
  notebook: Notebook;
  openLibrary: (key: string) => void;
}) {
  const target = insightTarget(pos);
  if (!target) return null;
  const entry = allPositions(notebook).find((p) => p.key === target.key);
  if (!entry) return null;
  const roles: Role[] = target.role === "control" ? ["control", "escape"] : ["escape", "control"];

  return (
    <details className="insight-panel">
      <summary>
        {entry.name} insights{" "}
        <span className="muted">· you're on the {target.role === "control" ? "control" : "escape"} side</span>
      </summary>
      <div className="roles">
        {roles.map((r) => (
          <RoleColumn key={r} entry={entry} role={r} notebook={notebook} compact />
        ))}
      </div>
      <button className="link" onClick={() => openLibrary(entry.key)}>
        Open in library to add insights →
      </button>
    </details>
  );
}
