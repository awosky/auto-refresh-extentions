import { useState } from "react";
import type { RefreshRule } from "../types";

type Props = {
  rules: RefreshRule[];
  now: number;
  getRemaining: (rule: RefreshRule, currentTime: number) => number;
  removeRule: (tabId: number) => void;
  loadRules: () => Promise<void>;
};

const ActiveRules = ({ rules, now, getRemaining, removeRule, loadRules }: Props) => {
  const [editingTabId, setEditingTabId] = useState<number | null>(null);
  const [editingSeconds, setEditingSeconds] = useState(30);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Active rules</h3>

        <span className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
          {rules.length} {rules.length === 1 ? "tab" : "tabs"}
        </span>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center">
          <div className="mb-2 text-2xl">◷</div>
          <p className="text-sm font-medium text-slate-300">No active rules yet</p>
          <p className="mt-1 text-xs text-slate-500">Add the current tab to start refreshing.</p>
        </div>
      ) : (
        <div className="max-h-75 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {rules.map((rule) => {
            const remaining = getRemaining(rule, now);

            return (
              <div
                key={rule.tabId}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"
              >
                {/* Rule header */}
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      rule.running ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200" title={rule.url}>
                      {rule.url}
                    </p>

                    <span
                      className={`mt-1 inline-block text-[11px] font-medium ${
                        rule.running ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {rule.running ? "Refreshing" : "Paused"}
                    </span>
                  </div>

                  <button
                    onClick={() => removeRule(rule.tabId)}
                    title="Remove rule"
                    aria-label="Remove rule"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>

                {/* Countdown */}
                <div className="my-4 rounded-xl bg-slate-950 px-3 py-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Next refresh</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                        {remaining}
                        <span className="ml-1 text-sm font-medium text-slate-500">sec</span>
                      </p>
                    </div>

                    <span className="mb-1 rounded-lg border border-slate-800 px-2 py-1 text-xs text-slate-400">
                      Every {rule.seconds}s
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await chrome.runtime.sendMessage({
                        type: rule.running ? "PAUSE_RULE" : "RESUME_RULE",
                        tabId: rule.tabId,
                      });

                      await loadRules();
                    }}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                      rule.running
                        ? "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {rule.running ? "Ⅱ Pause" : "▶ Resume"}
                  </button>

                  <button
                    onClick={() => {
                      setEditingTabId(rule.tabId);
                      setEditingSeconds(rule.seconds);
                    }}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 active:scale-95"
                  >
                    Edit
                  </button>
                </div>

                {/* Edit interval */}
                {editingTabId === rule.tabId && (
                  <div className="mt-3 border-t border-slate-800 pt-3">
                    <label className="mb-2 block text-xs text-slate-400">New interval (seconds)</label>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={editingSeconds}
                        onChange={(e) => setEditingSeconds(Number(e.target.value))}
                        className="min-w-0 appearance-none flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />

                      <button
                        onClick={async () => {
                          await chrome.runtime.sendMessage({
                            type: "UPDATE_RULE",
                            tabId: rule.tabId,
                            seconds: editingSeconds,
                          });

                          setEditingTabId(null);
                          await loadRules();
                        }}
                        disabled={!Number.isFinite(editingSeconds) || editingSeconds < 1}
                        className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingTabId(null)}
                        className="rounded-xl px-2 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ActiveRules;
