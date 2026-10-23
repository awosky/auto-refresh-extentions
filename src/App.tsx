import { useEffect, useState } from "react";
import type { RefreshRule } from "./types";
import Header from "./components/Header";
import CurrentTab from "./components/CurrentTab";
import Footer from "./components/Footer";
import ActiveRules from "./components/ActiveRules";
import WakeLockToggle from "./components/WakeLockToggle";

function App() {
  const [now, setNow] = useState(0);
  const [seconds, setSeconds] = useState("30");
  const [rules, setRules] = useState<RefreshRule[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  const loadRules = async () => {
    const data = await chrome.storage.local.get("rules");

    setRules((data.rules as RefreshRule[]) ?? []);
  };

  const getRemaining = (rule: RefreshRule, currentTime: number) => {
    if (!rule.running || !rule.startedAt || currentTime === 0) {
      return Number(rule.seconds);
    }

    const elapsed = (currentTime - rule.startedAt) / 1000;
    const remaining = Number(rule.seconds) - (elapsed % Number(rule.seconds));

    return Math.min(Math.ceil(remaining), Number(rule.seconds));
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
      title: currentTab.title,
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
    <div className="w-87.5 bg-slate-950 p-5 text-slate-100">
      <Header />
      <CurrentTab currentTab={currentTab} seconds={seconds} setSeconds={setSeconds} addRule={addRule} />
      <WakeLockToggle />
      <ActiveRules rules={rules} now={now} getRemaining={getRemaining} removeRule={removeRule} loadRules={loadRules} />
      <Footer />
    </div>
  );
}

export default App;
