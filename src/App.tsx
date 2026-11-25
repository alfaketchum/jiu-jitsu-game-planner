import { useEffect, useState } from "react";
import { Library } from "./LibraryView";
import { Techniques } from "./TechniquesView";
import { loadNotebook, saveNotebook, type Notebook } from "./knowledge";
import type { AttireMode } from "./library";

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

export default function App() {
  const [notebook, setNotebook] = useState<Notebook>(loadNotebook);
  const [mode, setMode] = useState<AttireMode>(loadMode);
  const [tab, setTab] = useState<"positions" | "techniques">(() => (location.hash === "#techniques" ? "techniques" : "positions"));
  // Position to open when coming from the Techniques tab; also used as a key to reset the Library's selection.
  const [openKey, setOpenKey] = useState<string | undefined>();
  const showTab = (t: "positions" | "techniques") => {
    setTab(t);
    try {
      history.replaceState(null, "", t === "techniques" ? "#techniques" : "#positions");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => saveNotebook(notebook), [notebook]);
  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>🥋 Jiu Jitsu Game Planner</h1>
        <div className="attire-switch" role="radiogroup" aria-label="Gi or no-gi">
          {(["both", "gi", "no-gi"] as AttireMode[]).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m === "both" ? "Both" : m === "gi" ? "Gi" : "No-gi"}
            </button>
          ))}
        </div>
      </header>
      <nav className="tabs" aria-label="Sections">
        <button className={tab === "positions" ? "active" : ""} onClick={() => showTab("positions")}>
          Positions
        </button>
        <button className={tab === "techniques" ? "active" : ""} onClick={() => showTab("techniques")}>
          Techniques
        </button>
      </nav>
      {tab === "positions" ? (
        <Library key={openKey} initialKey={openKey} notebook={notebook} setNotebook={setNotebook} mode={mode} />
      ) : (
        <Techniques
          mode={mode}
          openPosition={(key) => {
            setOpenKey(key);
            showTab("positions");
          }}
        />
      )}
    </div>
  );
}
