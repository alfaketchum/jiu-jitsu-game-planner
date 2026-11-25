import { useState } from "react";
import { PRIORITIES, PRIORITY_LABEL, type GamePlan, type Priority } from "./model";
import {
  addFromLibrary,
  DESTINATIONS,
  findPlanPosition,
  libraryEntry,
  LIBRARY,
  missingTechniques,
  type LibraryPosition,
} from "./library";

type Updater = (fn: (p: GamePlan) => GamePlan) => void;

const destName = (key: string | null) =>
  key ? (libraryEntry(key)?.name ?? DESTINATIONS[key]?.name ?? key) : null;

export function Library({ plan, update, openInPlan }: { plan: GamePlan; update: Updater; openInPlan: (id: string) => void }) {
  const [key, setKey] = useState(LIBRARY[0].key);
  const entry = libraryEntry(key)!;

  return (
    <main className="layout">
      <aside className="sidebar">
        {(["guard", "top"] as const).map((fam) => (
          <div key={fam} className="side-group">
            <h3>{fam === "guard" ? "Guards" : "Top positions"}</h3>
            <ul>
              {LIBRARY.filter((l) => l.family === fam).map((l) => (
                <li key={l.key}>
                  <button className={l.key === key ? "pos active" : "pos"} onClick={() => setKey(l.key)}>
                    <span>{l.name}</span>
                    {findPlanPosition(plan, l.key) && <span className="count" title="In your plan">✓</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="muted small">
          General starting points, not the last word. Your coach's details beat these.
        </p>
      </aside>
      <div className="main-pane">
        <LibraryDetail entry={entry} plan={plan} update={update} openInPlan={openInPlan} />
      </div>
    </main>
  );
}

function LibraryDetail({
  entry,
  plan,
  update,
  openInPlan,
}: {
  entry: LibraryPosition;
  plan: GamePlan;
  update: Updater;
  openInPlan: (id: string) => void;
}) {
  const [priority, setPriority] = useState<Priority>("learning");
  const [status, setStatus] = useState("");
  const inPlan = findPlanPosition(plan, entry.key);
  const missing = missingTechniques(plan, entry.key);

  const add = (only?: string[]) => {
    let msg = "";
    update((p) => {
      const r = addFromLibrary(p, entry.key, priority, only);
      msg = `Added ${r.addedTechniques} technique(s)${r.addedPositions ? ` and ${r.addedPositions} position(s)` : ""}.`;
      return r.plan;
    });
    setStatus(msg);
  };

  return (
    <div className="detail library">
      <div className="detail-head">
        <h2 className="lib-title">{entry.name}</h2>
        <span className="badge">{entry.side}</span>
        {entry.gi && <span className="badge">{entry.gi} only</span>}
      </div>
      <p>{entry.summary}</p>

      <div className="lib-add">
        <label>
          Add as
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        {missing.length > 0 ? (
          <button className="primary" onClick={() => add()}>
            {inPlan ? `Add ${missing.length} missing technique(s)` : "Add position + techniques to plan"}
          </button>
        ) : (
          <span className="finish">Everything here is in your plan.</span>
        )}
        {inPlan && (
          <button className="link" onClick={() => openInPlan(inPlan.id)}>
            Open in plan
          </button>
        )}
        {status && <span className="muted">{status}</span>}
      </div>

      <InsightSections entry={entry} />

      <h3>Techniques</h3>
      <ul className="techs">
        {entry.techniques.map((t) => {
          const have = !missing.includes(t);
          return (
            <li key={t.name} className="tech">
              <div className="tech-main">
                <span className={`badge type-${t.type}`}>{t.type}</span>
                <strong>{t.name}</strong>
                {t.to ? <span className="muted">→ {destName(t.to)}</span> : <span className="finish">✓ finish</span>}
                <span className="spacer" />
                {have ? (
                  <span className="muted small">in plan</span>
                ) : (
                  <button className="small-btn" onClick={() => add([t.name])}>
                    + Add
                  </button>
                )}
              </div>
              <div className="trigger">When: {t.trigger}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InsightSections({ entry }: { entry: LibraryPosition }) {
  return (
    <div className="insights">
      <section>
        <h3>Goals</h3>
        <ul>{entry.goals.map((g) => <li key={g}>{g}</li>)}</ul>
      </section>
      <section>
        <h3>Grips & connections</h3>
        <ul>{entry.grips.map((g) => <li key={g}>{g}</li>)}</ul>
      </section>
      <section>
        <h3>Principles</h3>
        <ul>{entry.principles.map((g) => <li key={g}>{g}</li>)}</ul>
      </section>
      <section>
        <h3>Common mistakes</h3>
        <ul>{entry.mistakes.map((g) => <li key={g}>{g}</li>)}</ul>
      </section>
      <section className="wide">
        <h3>{entry.family === "guard" ? "How they'll try to pass, and your answer" : "How they'll try to escape, and your answer"}</h3>
        <table className="threats">
          <tbody>
            {entry.threats.map((t) => (
              <tr key={t.threat}>
                <td>{t.threat}</td>
                <td>{t.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** Collapsible insight panel shown on a plan position that matches a library entry. */
export function Insights({ plan, libraryKey, update }: { plan: GamePlan; libraryKey: string; update: Updater }) {
  const entry = libraryEntry(libraryKey);
  const [open, setOpen] = useState(false);
  if (!entry) return null;
  const missing = missingTechniques(plan, libraryKey);

  return (
    <details className="insight-panel" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        Position insights{missing.length > 0 && <span className="muted"> · {missing.length} suggested technique(s) not in your plan</span>}
      </summary>
      <InsightSections entry={entry} />
      {missing.length > 0 && (
        <>
          <h3>Suggested from the library</h3>
          <ul className="techs compact">
            {missing.map((t) => (
              <li key={t.name}>
                <span className={`badge type-${t.type}`}>{t.type}</span>
                <strong>{t.name}</strong> <span className="muted">— {t.trigger}</span>{" "}
                <button
                  className="small-btn"
                  onClick={() => update((p) => addFromLibrary(p, libraryKey, "learning", [t.name]).plan)}
                >
                  + Add as Learning
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </details>
  );
}
