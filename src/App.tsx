import { useEffect, useState } from "react";

type RefreshRule = {
  tabId: number;
  url: string;
  seconds: number;
  running: boolean;
  startedAt: number | null;
};

function App() {
  const [now, setNow] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [rules, setRules] = useState<RefreshRule[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [editingTabId, setEditingTabId] = useState<number | null>(null);
  const [editingSeconds, setEditingSeconds] = useState(30);

  const loadRules = async () => {
    const data = await chrome.storage.local.get("rules");

    setRules((data.rules as RefreshRule[]) ?? []);
  };

  const getRemaining = (rule: RefreshRule, currentTime: number) => {
    if (!rule.running || !rule.startedAt || currentTime === 0) {
      return rule.seconds;
    }

    const elapsed = (currentTime - rule.startedAt) / 1000;

    const remaining = rule.seconds - (elapsed % rule.seconds);

    return Math.ceil(remaining);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chrome.storage.local.get("rules", (data) => {
      setRules((data.rules as RefreshRule[]) ?? []);
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => setCurrentTab(tab ?? null),
    );
  }, []);

  const addRule = async () => {
    if (!currentTab?.id || !currentTab.url) {
      return;
    }

    await chrome.runtime.sendMessage({
      type: "ADD_RULE",
      tabId: currentTab.id,
      url: currentTab.url,
      seconds,
    });

    await loadRules();
  };

  const removeRule = async (tabId: number) => {
    await chrome.runtime.sendMessage({
      type: "REMOVE_RULE",
      tabId,
    });

    await loadRules();
  };

  return (
    <div
      style={{
        width: 350,
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <h2>Auto Refresh</h2>

      <div>
        <strong>Current tab</strong>

        <div
          style={{
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          {currentTab?.title ?? "Unknown"}
        </div>

        <input type="number" min="30" value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} />

        <span> seconds </span>

        <button onClick={addRule}>Add</button>
      </div>

      <hr />

      <h3>Active rules</h3>

      {rules.length === 0 && <p>No active refresh rules.</p>}

      {rules.map((rule) => {
        const remaining = getRemaining(rule, now);

        return (
          <div
            key={rule.tabId}
            style={{
              padding: 12,
              marginBottom: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <div>
              {rule.running ? "🟢" : "⏸️"} {rule.url}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              {remaining}s
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
              }}
            >
              {rule.running ? (
                <button
                  onClick={async () => {
                    await chrome.runtime.sendMessage({
                      type: "PAUSE_RULE",
                      tabId: rule.tabId,
                    });

                    await loadRules();
                  }}
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await chrome.runtime.sendMessage({
                      type: "RESUME_RULE",
                      tabId: rule.tabId,
                    });

                    await loadRules();
                  }}
                >
                  Resume
                </button>
              )}

              <button onClick={() => removeRule(rule.tabId)}>Remove</button>
            </div>

            {editingTabId === rule.tabId ? (
              <>
                <input
                  type="number"
                  min="30"
                  value={editingSeconds}
                  onChange={(e) => setEditingSeconds(Number(e.target.value))}
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
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditingTabId(rule.tabId);
                  setEditingSeconds(rule.seconds);
                }}
              >
                Edit
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
