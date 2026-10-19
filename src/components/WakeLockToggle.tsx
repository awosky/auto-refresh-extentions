import { useEffect, useState } from "react";
import { controlWakeLock } from "../wakelock/index";

const WakeLockToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void controlWakeLock("status").then((result) => {
      if (active) {
        setEnabled(result.enabled);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function toggleWakeLock() {
    setBusy(true);
    setError("");

    const action = enabled ? "disable" : "enable";
    const result = await controlWakeLock(action);

    setEnabled(result.enabled);

    if (result.error) {
      setError(result.error);
    }

    setBusy(false);
  }

  return (
    <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${enabled ? "bg-indigo-400" : "bg-slate-600"}`} />
        <h3 className="text-sm font-semibold text-slate-200">Keep Screen Awake</h3>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            {enabled ? "Screen wake lock enabled" : "Prevent screen sleep"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {enabled
              ? "Keeps the screen awake while this tab is visible"
              : "Stop your screen from dimming while browsing"}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleWakeLock}
          disabled={busy}
          aria-pressed={enabled}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
            enabled
              ? "bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-400"
              : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-indigo-500 hover:text-white"
          }`}
        >
          {busy ? "..." : enabled ? "ON" : "OFF"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default WakeLockToggle;
