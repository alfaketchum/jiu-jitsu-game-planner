import { useRef, useState } from "react";
import { ConfirmButton } from "./ConfirmButton";
import { sourceById } from "./sources";
import { historyOf } from "./versioning";
import {
  GROUPS,
  LIBRARY,
  TOPIC_LABEL,
  TOPICS,
  visibleIn,
  type Attire,
  type AttireMode,
  type Family,
  type Group,
  type Insight,
  type LibraryPosition,
  type Role,
  type Topic,
  DESTINATIONS,
  techniqueVariants,
  type TechType,
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

type NotebookUpdater = (fn: (n: Notebook) => Notebook) => void;

const ROLE_TITLE: Record<Role, string> = { control: "Control", escape: "Escapes" };
const ROLE_HINT: Record<Role, string> = { control: "attacking side", escape: "defending side" };
const FAMILY_LABEL: Record<Family, string> = { guard: "guard", pin: "pin", back: "back", legs: "leg entanglement" };

export function AttireChip({ gi }: { gi?: Attire }) {
  if (!gi) return null;
  return <span className={`chip-attire attire-${gi}`}>{gi === "gi" ? "gi only" : "no-gi"}</span>;
}

export function Library({
  notebook,
  setNotebook,
  mode,
  initialKey,
}: {
  notebook: Notebook;
  setNotebook: NotebookUpdater;
  mode: AttireMode;
  initialKey?: string;
}) {
  const positions = allPositions(notebook);
  const visible = positions.filter((p) => visibleIn(mode, p.gi));
  const hidden = positions.length - visible.length;
  const [key, setKey] = useState(initialKey ?? LIBRARY[0].key);
  const [source, setSource] = useState("");
  const [adding, setAdding] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const entry = positions.find((p) => p.key === key) ?? LIBRARY[0];
  const allSources = sources(notebook);

  const countFor = (k: string) =>
    source
      ? [...insightsFor(notebook, k, "control", mode), ...insightsFor(notebook, k, "escape", mode)].filter((i) => i.source === source).length
      : 0;

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
      setImportError(`Couldn't import that file: ${(err as Error).message}`);
    }
  };

  const item = (l: LibraryPosition, child: boolean) => {
    const n = countFor(l.key);
    return (
      <li key={l.key}>
        <button
          className={`pos${child ? " child" : ""}${l.key === key ? " active" : ""}${source && !n ? " dim" : ""}`}
          onClick={() => setKey(l.key)}
        >
          <span>
            {child && <span className="branch">└ </span>}
            {l.name}
            {mode !== "gi" && <AttireChip gi={l.gi === "gi" ? "gi" : undefined} />}
          </span>
          <span className="count">
            {source ? n || "" : ""}
          </span>
        </button>
      </li>
    );
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
        {hidden > 0 && (
          <p className="muted small">
            {hidden} {mode === "no-gi" ? "gi-only" : "no-gi-only"} position{hidden === 1 ? "" : "s"} hidden.
          </p>
        )}
        {GROUPS.map((g) => {
          const inGroup = visible.filter((p) => p.group === g);
          const roots = inGroup.filter((p) => !p.parent || !inGroup.some((x) => x.key === p.parent));
          if (!roots.length) return null;
          return (
            <div key={g} className="side-group">
              <h3>{g}</h3>
              <ul>
                {roots.flatMap((r) => [item(r, false), ...inGroup.filter((c) => c.parent === r.key).map((c) => item(c, true))])}
              </ul>
            </div>
          );
        })}
        {adding ? (
          <NewPositionForm
            parents={positions}
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
            + New position or sub-guard
          </button>
        )}
        <div className="row notes-io">
          <button onClick={exportNotes}>Export notes</button>
          <button onClick={() => fileInput.current?.click()}>Import notes</button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={importNotes} />
        </div>
        {importError && (
          <p className="callout error small" role="alert">
            {importError}
          </p>
        )}
        <p className="muted small">
          Control and Escapes hold general coaching. Named practitioners are listed under each position with their own insights. Add an insight with a source and it goes under that person.
        </p>
      </aside>
      <div className="main-pane">
        <PositionPage
          entry={entry}
          notebook={notebook}
          setNotebook={setNotebook}
          onSelect={setKey}
          source={source}
          mode={mode}
          onDeleted={() => setKey(LIBRARY[0].key)}
        />
      </div>
    </main>
  );
}

function PositionPage({
  entry,
  notebook,
  setNotebook,
  onSelect,
  source,
  mode,
  onDeleted,
}: {
  entry: LibraryPosition;
  notebook: Notebook;
  setNotebook: NotebookUpdater;
  onSelect: (key: string) => void;
  source: string;
  mode: AttireMode;
  onDeleted: () => void;
}) {
  const all = allPositions(notebook);
  const nameOf = (k: string) => all.find((p) => p.key === k)?.name ?? k;
  const parent = entry.parent ? all.find((p) => p.key === entry.parent) : undefined;
  const variations = all.filter((p) => p.parent === entry.key);
  const offMode = !visibleIn(mode, entry.gi);

  const chips = (keys: string[]) =>
    keys.map((k) => (
      <button key={k} className="chip" onClick={() => onSelect(k)}>
        {nameOf(k)}
      </button>
    ));

  return (
    <div className="detail library">
      <div className="detail-head">
        <h2 className="lib-title">{entry.name}</h2>
        <span className="badge">{FAMILY_LABEL[entry.family]}</span>
        <AttireChip gi={entry.gi} />
        {entry.user && <span className="badge">yours</span>}
        <span className="spacer" />
        {entry.user && (
          <ConfirmButton
            label="Delete"
            confirmLabel={`Delete ${entry.name} and your insights?`}
            onConfirm={() => {
              setNotebook((n) => removePosition(n, entry.key));
              onDeleted();
            }}
          />
        )}
      </div>
      {entry.aka && entry.aka.length > 0 && <p className="aka">Also called: {entry.aka.join(" · ")}</p>}
      <VersionLine positionKey={entry.key} />
      {offMode && <p className="callout">This is a {entry.gi} position; you're viewing {mode}.</p>}
      {entry.summary && <p>{entry.summary}</p>}
      {entry.rules && <p className="callout">⚖ {entry.rules}</p>}
      {parent && <p className="related">Variation of: {chips([parent.key])}</p>}
      {variations.length > 0 && <p className="related">Variations: {chips(variations.map((v) => v.key))}</p>}
      {entry.related.length > 0 && <p className="related">Related: {chips(entry.related)}</p>}

      <div className="roles">
        {(["control", "escape"] as Role[]).map((role) => (
          <RoleColumn key={role} entry={entry} role={role} notebook={notebook} setNotebook={setNotebook} source={source} mode={mode} />
        ))}
      </div>

      <TechniqueSection entry={entry} mode={mode} onSelect={onSelect} />

      <PeopleSection entry={entry} notebook={notebook} setNotebook={setNotebook} only={source} mode={mode} />

      <History positionKey={entry.key} />

    </div>
  );
}

function RoleColumn({
  entry,
  role,
  notebook,
  setNotebook,
  source,
  mode,
}: {
  entry: LibraryPosition;
  role: Role;
  notebook: Notebook;
  setNotebook?: NotebookUpdater;
  /** Pre-fills the source field when adding (the practitioner filter). */
  source?: string;
  mode: AttireMode;
}) {
  const [adding, setAdding] = useState(false);
  // Named practitioners are listed separately below the position (PeopleSection).
  const shown = insightsFor(notebook, entry.key, role, mode).filter((i) => !i.source);
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
        <p className="empty small">No general insights yet. Add the first one.</p>
      )}
      {byTopic.map(([topic, list]) => (
        <div key={topic} className="topic">
          <h4>{TOPIC_LABEL[topic]}</h4>
          <ul>
            {list.map((i) => (
              <InsightItem
                key={i.id}
                insight={i}
                showAttire={mode === "both"}
                onRemove={setNotebook && i.user ? () => setNotebook((n) => removeInsight(n, i.id)) : undefined}
              />
            ))}
          </ul>
        </div>
      ))}
      {setNotebook &&
        (adding ? (
          <InsightForm
            sources={sources(notebook).map((s) => s.name)}
            defaultSource={source}
            defaultAttire={mode === "both" ? undefined : mode}
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

function InsightItem({ insight, showAttire, onRemove }: { insight: Insight; showAttire: boolean; onRemove?: () => void }) {
  return (
    <li className={insight.topic === "mistake" ? "insight mistake" : "insight"}>
      {showAttire && <AttireChip gi={insight.gi} />}
      {insight.text} {insight.source && (
        <span className="source">
          —{" "}
          {insight.url ? (
            <a href={insight.url} target="_blank" rel="noreferrer noopener">
              {insight.source}
            </a>
          ) : (
            insight.source
          )}
          {insight.via && <span className="via"> · via {insight.via}</span>}
        </span>
      )}
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
  defaultAttire,
  onSave,
  onCancel,
}: {
  sources: string[];
  defaultSource?: string;
  defaultAttire?: Attire;
  onSave: (v: { topic: Topic; text: string; source?: string; url?: string; gi?: Attire }) => void;
  onCancel: () => void;
}) {
  const [topic, setTopic] = useState<Topic>("key idea");
  const [text, setText] = useState("");
  const [source, setSource] = useState(defaultSource ?? "");
  const [gi, setGi] = useState<"" | Attire>("");
  const [url, setUrl] = useState("");
  const listId = useRef(`src-${Math.random().toString(36).slice(2)}`).current;
  return (
    <form
      className="tech-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSave({ topic, text, source, url, gi: gi || undefined });
      }}
    >
      <textarea autoFocus value={text} placeholder="The insight, in your words" onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {TOPIC_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Applies to
          <select value={gi} onChange={(e) => setGi(e.target.value as "" | Attire)}>
            <option value="">Gi and no-gi</option>
            <option value="gi">Gi only</option>
            <option value="no-gi">No-gi only</option>
          </select>
        </label>
        <label className="grow">
          Source (practitioner, instructional, class)
          <input list={listId} value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. coach, seminar, instructional" />
          <datalist id={listId}>
            {sources.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
      </div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link to the source (optional): video, instructional, interview" type="url" />
      {defaultAttire && !gi && <p className="muted small">Tip: you're viewing {defaultAttire}. Mark it {defaultAttire} only if it doesn't apply to both.</p>}
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
  parents,
  onSave,
  onCancel,
}: {
  parents: LibraryPosition[];
  onSave: (p: { name: string; group: Group; family: Family; side: "top" | "bottom"; gi?: Attire; parent?: string; summary: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [family, setFamily] = useState<Family>("guard");
  const [group, setGroup] = useState<Group>("Other");
  const [gi, setGi] = useState<"" | Attire>("");
  const [summary, setSummary] = useState("");

  const pickParent = (k: string) => {
    setParent(k);
    const p = parents.find((x) => x.key === k);
    if (p) {
      setFamily(p.family);
      setGroup(p.group);
      if (p.gi) setGi(p.gi);
    }
  };

  return (
    <form
      className="tech-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim())
          onSave({
            name,
            group,
            family,
            side: family === "pin" || family === "back" ? "top" : "bottom",
            gi: gi || undefined,
            parent: parent || undefined,
            summary,
          });
      }}
    >
      <input autoFocus value={name} placeholder="Position name" onChange={(e) => setName(e.target.value)} />
      <select value={parent} onChange={(e) => pickParent(e.target.value)} aria-label="Variation of">
        <option value="">Not a variation</option>
        {parents.map((p) => (
          <option key={p.key} value={p.key}>
            Variation of {p.name}
          </option>
        ))}
      </select>
      <select value={family} onChange={(e) => setFamily(e.target.value as Family)}>
        <option value="guard">Guard (controlled from bottom)</option>
        <option value="pin">Pin (controlled from top)</option>
        <option value="back">Back</option>
        <option value="legs">Leg entanglement</option>
      </select>
      <select value={group} onChange={(e) => setGroup(e.target.value as Group)}>
        {GROUPS.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <select value={gi} onChange={(e) => setGi(e.target.value as "" | Attire)}>
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

/** Each named practitioner, listed under the position with their own control and escape insights. */
function PeopleSection({
  entry,
  notebook,
  setNotebook,
  only,
  mode,
}: {
  entry: LibraryPosition;
  notebook: Notebook;
  setNotebook?: NotebookUpdater;
  only?: string;
  mode: AttireMode;
}) {
  const named = [...insightsFor(notebook, entry.key, "control", mode), ...insightsFor(notebook, entry.key, "escape", mode)].filter(
    (i) => i.source && (!only || i.source === only),
  );
  if (!named.length) {
    return only ? <p className="empty small people-empty">Nothing from {only} on this position yet.</p> : null;
  }
  const people = new Map<string, Insight[]>();
  for (const i of named) people.set(i.source!, [...(people.get(i.source!) ?? []), i]);
  const ordered = [...people].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <section className="people">
      <h3>From practitioners</h3>
      {ordered.map(([name, list]) => (
        <details key={name} className="person" open={!!only}>
          <summary>
            <strong>{name}</strong> <span className="muted small">· {list.length} insight{list.length === 1 ? "" : "s"}</span>
          </summary>
          {(["control", "escape"] as Role[]).map((role) => {
            const mine = list.filter((i) => i.role === role);
            if (!mine.length) return null;
            return (
              <div key={role} className={`person-role person-${role}`}>
                <h4>
                  {ROLE_TITLE[role]} <span className="muted">· {role === "control" ? entry.controller : entry.escaper}</span>
                </h4>
                <ul>
                  {mine.map((i) => (
                    <li key={i.id} className={i.topic === "mistake" ? "insight mistake" : "insight"}>
                      {mode === "both" && <AttireChip gi={i.gi} />}
                      {i.text}{" "}
                      {i.url && (
                        <a className="source-link" href={i.url} target="_blank" rel="noreferrer noopener">
                          source
                        </a>
                      )}
                      {i.sourceStatus === "pending" ? (
                        <span className="pending" title="Attributed but not yet checked against a source">source pending</span>
                      ) : (
                        i.via && <span className="via"> · {i.via}</span>
                      )}
                      {i.user && <span className="badge mine">yours</span>}
                      {setNotebook && i.user && (
                        <button className="x" title="Remove" onClick={() => setNotebook((n) => removeInsight(n, i.id))}>
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </details>
      ))}
    </section>
  );
}

const TECH_GROUPS: { types: TechType[]; label: string }[] = [
  { types: ["sweep"], label: "Sweeps" },
  { types: ["submission"], label: "Submissions" },
  { types: ["transition"], label: "Transitions & back takes" },
  { types: ["takedown"], label: "Takedowns & wrestle-ups" },
  { types: ["pass"], label: "Passes" },
  { types: ["escape"], label: "Escapes" },
];

/** The techniques this position sets up, grouped by type, with links to the same technique on other positions. */
function TechniqueSection({ entry, mode, onSelect }: { entry: LibraryPosition; mode: AttireMode; onSelect: (key: string) => void }) {
  const techniques = entry.techniques.filter((t) => visibleIn(mode, t.gi));
  if (!techniques.length) return null;
  const destination = (key: string) => {
    const lib = LIBRARY.find((l) => l.key === key);
    return lib ? (
      <button className="link" onClick={() => onSelect(lib.key)}>
        {lib.name}
      </button>
    ) : (
      <span>{DESTINATIONS[key]?.name ?? key}</span>
    );
  };

  return (
    <section className="techniques">
      <h3>Techniques</h3>
      <div className="tech-groups">
        {TECH_GROUPS.map((g) => {
          const list = techniques.filter((t) => g.types.includes(t.type));
          if (!list.length) return null;
          return (
            <div key={g.label} className="tech-group">
              <h4>{g.label}</h4>
              <ul>
                {list.map((t) => {
                  const variants = techniqueVariants(entry.key, t.name).filter((v) => visibleIn(mode, v.gi));
                  return (
                    <li key={t.name}>
                      <div className="tech-line">
                        <strong>{t.name}</strong>
                        {mode === "both" && <AttireChip gi={t.gi} />}
                        {t.from && <span className={`badge from-${t.from}`}>from {t.from}</span>}
                        {t.to && <span className="muted"> → {destination(t.to)}</span>}
                      </div>
                      <div className="muted small">When: {t.trigger}</div>
                      {t.insights && t.insights.length > 0 && <TechniqueInsights insights={t.insights.filter((i) => visibleIn(mode, i.gi))} mode={mode} />}
                      {variants.length > 0 && (
                        <div className="variants small">
                          Also from:{" "}
                          {variants.map((v) => (
                            <button key={v.key} className="chip" onClick={() => onSelect(v.key)}>
                              {v.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function VersionLine({ positionKey }: { positionKey: string }) {
  const h = historyOf(positionKey);
  if (!h.length) return null;
  const last = h[h.length - 1];
  return (
    <p className="version-line">
      v{last.version} · updated {formatDate(last.date)}
    </p>
  );
}

/** Every logged update to this position, newest first, with the sources it used. */
function History({ positionKey }: { positionKey: string }) {
  const h = historyOf(positionKey);
  if (!h.length) return null;
  return (
    <details className="history">
      <summary>
        History <span className="muted small">· {h.length} version{h.length === 1 ? "" : "s"}</span>
      </summary>
      <ol reversed>
        {[...h].reverse().map((e) => (
          <li key={e.version}>
            <div>
              <strong>v{e.version}</strong> <span className="muted small">· {formatDate(e.date)}</span>
              {e.backfilled && (
                <span className="muted small" title="Reconstructed from git history">
                  {" "}
                  · backfilled
                </span>
              )}
            </div>
            <div>{e.summary}</div>
            {e.sources.length > 0 && (
              <div className="history-sources small">
                {e.sources.map((id) => {
                  const src = sourceById(id);
                  if (!src) return null;
                  const label = `${src.practitioner}: ${src.title}`;
                  return src.url ? (
                    <a key={id} href={src.url} target="_blank" rel="noreferrer noopener">
                      {label}
                    </a>
                  ) : (
                    <span key={id} className="pending-source">
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

/** A technique's own sourced insights: how to do it, and how to defend it. */
export function TechniqueInsights({ insights, mode }: { insights: Insight[]; mode: AttireMode }) {
  if (!insights.length) return null;
  const groups: [Role, string][] = [
    ["control", "Doing it"],
    ["escape", "Defending it"],
  ];
  return (
    <details className="tech-insights">
      <summary>
        {insights.length} insight{insights.length === 1 ? "" : "s"} ·{" "}
        {[...new Set(insights.map((i) => i.source).filter(Boolean))].join(", ")}
      </summary>
      {groups.map(([role, label]) => {
        const list = insights.filter((i) => i.role === role);
        if (!list.length) return null;
        return (
          <div key={role} className={`tech-insight-group ${role}`}>
            <h5>{label}</h5>
            <ul>
              {list.map((i) => (
                <li key={i.id}>
                  {mode === "both" && <AttireChip gi={i.gi} />}
                  {i.text}{" "}
                  <span className="who">
                    — {i.url ? (
                      <a href={i.url} target="_blank" rel="noreferrer noopener">
                        {i.source}
                      </a>
                    ) : (
                      i.source
                    )}
                    {i.via && <span className="via"> · {i.via}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </details>
  );
}
