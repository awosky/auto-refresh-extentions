type Props = {
  currentTab: chrome.tabs.Tab | null;
  seconds: string;
  setSeconds: (value: string) => void;
  addRule: () => void;
};

const CurrentTab = ({ currentTab, seconds, setSeconds, addRule }: Props) => {
  return (
    <section className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">Current tab</h3>
      </div>

      <p className="mb-4 truncate text-sm text-slate-400" title={currentTab?.title ?? "Unknown"}>
        {currentTab?.title ?? "Unknown"}
      </p>

      <label htmlFor="refresh-interval" className="mb-2 block text-xs font-medium text-slate-400">
        Refresh interval
      </label>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center rounded-xl border border-slate-700 bg-slate-950 px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <input
            id="refresh-interval"
            type="number"
            min="1"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-full appearance-none bg-transparent py-2.5 text-sm font-semibold text-white outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-xs text-slate-500">sec</span>
        </div>

        <button
          onClick={addRule}
          disabled={
            !currentTab?.id ||
            !currentTab?.url ||
            seconds.trim() === "" ||
            !Number.isFinite(Number(seconds)) ||
            Number(seconds) < 1
          }
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add
        </button>
      </div>
    </section>
  );
};

export default CurrentTab;
