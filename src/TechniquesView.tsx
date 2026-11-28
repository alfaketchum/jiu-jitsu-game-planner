import { useMemo, useState } from "react";
import { AttireChip, TechniqueInsights } from "./LibraryView";
import { DESTINATIONS, LIBRARY, techniqueFamilies, visibleIn, type AttireMode, type TechType, type TechniqueFamily } from "./library";

const TYPE_LABEL: Record<TechType, string> = {
  sweep: "Sweeps",
  submission: "Submissions",
  transition: "Transitions & back takes",
  takedown: "Takedowns & wrestle-ups",
  pass: "Passes",
  escape: "Escapes",
};
const TYPE_ORDER: TechType[] = ["submission", "sweep", "transition", "takedown", "pass", "escape"];

function visibleFamily(f: TechniqueFamily, mode: AttireMode): TechniqueFamily | null {
  const variants = f.variants.filter((v) => visibleIn(mode, v.position.gi) && visibleIn(mode, v.technique.gi));
  return variants.length ? { ...f, variants } : null;
}

const insightCount = (f: TechniqueFamily) => f.variants.reduce((n, v) => n + (v.technique.insights?.length ?? 0), 0);

export function Techniques({ mode, openPosition }: { mode: AttireMode; openPosition: (key: string) => void }) {
  const all = useMemo(() => techniqueFamilies(), []);
  const [type, setType] = useState<TechType | "all">("submission");
  const [query, setQuery] = useState("");
  const [onlySourced, setOnlySourced] = useState(false);
  const families = all
    .map((f) => visibleFamily(f, mode))
    .filter((f): f is TechniqueFamily => !!f)
    .filter((f) => type === "all" || f.type === type)
    .filter((f) => !onlySourced || insightCount(f) > 0)
    .filter((f) => {
      const q = query.trim().toLowerCase();
      return !q || f.name.toLowerCase().includes(q) || f.variants.some((v) => v.position.name.toLowerCase().includes(q));
    });
  const [selected, setSelected] = useState<string>("kimura");
  const current = families.find((f) => f.key === selected) ?? families[0];
  const counts = (t: TechType | "all") =>
    all.map((f) => visibleFamily(f, mode)).filter((f) => f && (t === "all" || f.type === t)).length;

  return (
    <main className="layout">
      <aside className="sidebar">
        <label className="filter">
          Search
          <input id="technique-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kimura, triangle, half guard…" />
        </label>
        <div className="type-chips" role="group" aria-label="Technique type">
          {(["all", ...TYPE_ORDER] as (TechType | "all")[])
            .filter((t) => counts(t) > 0)
            .map((t) => (
              <button key={t} className={type === t ? "chip on" : "chip"} onClick={() => setType(t)}>
                {t === "all" ? "All" : TYPE_LABEL[t]} <span className="muted">{counts(t)}</span>
              </button>
            ))}
        </div>
        <label className="check small">
          <input id="only-sourced" type="checkbox" checked={onlySourced} onChange={(e) => setOnlySourced(e.target.checked)} /> Only with practitioner insights
        </label>
        <ul className="family-list">
          {families.map((f) => (
            <li key={f.key}>
              <button className={`pos${current?.key === f.key ? " active" : ""}`} onClick={() => setSelected(f.key)}>
                <span>{f.name}</span>
                <span className="count">
                  {f.variants.length > 1 ? `${f.variants.length} positions` : ""}
                  {insightCount(f) > 0 && <span className="has-insights" title="Has practitioner insights"> ●</span>}
                </span>
              </button>
            </li>
          ))}
          {!families.length && <li className="muted small">No techniques match.</li>}
        </ul>
      </aside>
      <div className="main-pane">
        {current ? <FamilyPage family={current} mode={mode} openPosition={openPosition} /> : <p className="empty">Pick a technique.</p>}
      </div>
    </main>
  );
}

function FamilyPage({ family, mode, openPosition }: { family: TechniqueFamily; mode: AttireMode; openPosition: (key: string) => void }) {
  const dest = (key: string) => {
    const lib = LIBRARY.find((l) => l.key === key);
    return lib ? (
      <button className="link" onClick={() => openPosition(lib.key)}>
        {lib.name}
      </button>
    ) : (
      <span>{DESTINATIONS[key]?.name ?? key}</span>
    );
  };
  return (
    <div className="detail">
      <div className="detail-head">
        <h2 className="lib-title">{family.name}</h2>
        <span className="badge">{family.type}</span>
      </div>
      <p className="muted">
        {family.variants.length === 1
          ? "Done from one position."
          : `Done from ${family.variants.length} positions. Each version has its own trigger and its own details.`}
      </p>
      <div className="variants-grid">
        {family.variants.map(({ position, technique }) => (
          <section key={position.key + technique.name} className="variant-card">
            <header>
              <button className="link variant-pos" onClick={() => openPosition(position.key)}>
                {position.name}
              </button>
              <AttireChip gi={technique.gi ?? position.gi} />
              {technique.from && <span className={`badge from-${technique.from}`}>from {technique.from}</span>}
            </header>
            <div className="small muted">{technique.name}</div>
            <div className="variant-when">
              <b>When:</b> {technique.trigger}
            </div>
            {technique.to && <div className="small">Lands in: {dest(technique.to)}</div>}
            {technique.insights && technique.insights.length > 0 ? (
              <TechniqueInsights insights={technique.insights.filter((i) => visibleIn(mode, i.gi))} mode={mode} />
            ) : (
              <div className="small muted">No practitioner insights yet.</div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
