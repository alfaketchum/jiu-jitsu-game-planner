import { useEffect, useState } from "react";
import { Library } from "./LibraryView";
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
      <Library notebook={notebook} setNotebook={setNotebook} mode={mode} />
    </div>
  );
}
