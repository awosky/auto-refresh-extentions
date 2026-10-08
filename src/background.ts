type RefreshRule = {
  tabId: number;
  url: string;
  seconds: number;
  running: boolean;
  startedAt: number | null;
};

const getRules = async (): Promise<RefreshRule[]> => {
  const data = await chrome.storage.local.get("rules");

  return (data.rules as RefreshRule[]) ?? [];
};

const saveRules = async (rules: RefreshRule[]) => {
  await chrome.storage.local.set({ rules });
};

const getRule = (rules: RefreshRule[], tabId: number) => {
  return rules.find((rule) => rule.tabId === tabId);
};

const removeRule = async (tabId: number) => {
  const rules = await getRules();

  const filtered = rules.filter((rule) => rule.tabId !== tabId);

  await saveRules(filtered);

  await chrome.alarms.clear(`refresh-${tabId}`);

  await chrome.action.setBadgeText({
    tabId,
    text: "",
  });
};

const updateBadges = async () => {
  const rules = await getRules();

  for (const rule of rules) {
    if (!rule.running || !rule.startedAt) {
      await chrome.action.setBadgeText({
        tabId: rule.tabId,
        text: "",
      });

      continue;
    }

    const elapsed = (Date.now() - rule.startedAt) / 1000;

    const remaining = rule.seconds - (elapsed % rule.seconds);

    await chrome.action.setBadgeText({
      tabId: rule.tabId,
      text: `${Math.ceil(remaining)}`,
    });
  }
};

setInterval(() => {
  updateBadges();
}, 1000);

chrome.runtime.onMessage.addListener(async (message) => {
  const rules = await getRules();

  if (message.type === "ADD_RULE") {
    const rule: RefreshRule = {
      tabId: message.tabId,
      url: message.url,
      seconds: message.seconds,
      running: true,
      startedAt: Date.now(),
    };

    const filtered = rules.filter((item) => item.tabId !== message.tabId);

    filtered.push(rule);

    await saveRules(filtered);

    await chrome.alarms.clear(`refresh-${message.tabId}`);

    await chrome.alarms.create(`refresh-${message.tabId}`, {
      periodInMinutes: message.seconds / 60,
    });
  }

  if (message.type === "PAUSE_RULE") {
    const rule = getRule(rules, message.tabId);

    if (!rule) return;

    rule.running = false;
    rule.startedAt = null;

    await saveRules(rules);

    await chrome.alarms.clear(`refresh-${message.tabId}`);
  }

  if (message.type === "RESUME_RULE") {
    const rule = getRule(rules, message.tabId);

    if (!rule) return;

    rule.running = true;
    rule.startedAt = Date.now();

    await saveRules(rules);

    await chrome.alarms.clear(`refresh-${message.tabId}`);

    await chrome.alarms.create(`refresh-${message.tabId}`, {
      periodInMinutes: rule.seconds / 60,
    });
  }

  if (message.type === "REMOVE_RULE") {
    const filtered = rules.filter((rule) => rule.tabId !== message.tabId);

    await saveRules(filtered);

    await chrome.alarms.clear(`refresh-${message.tabId}`);

    await chrome.action.setBadgeText({
      tabId: message.tabId,
      text: "",
    });
  }

  if (message.type === "UPDATE_RULE") {
    const rule = getRule(rules, message.tabId);

    if (!rule) return;

    rule.seconds = message.seconds;

    if (rule.running) {
      rule.startedAt = Date.now();

      await chrome.alarms.clear(`refresh-${message.tabId}`);

      await chrome.alarms.create(`refresh-${message.tabId}`, {
        periodInMinutes: message.seconds / 60,
      });
    }

    await saveRules(rules);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("refresh-")) {
    return;
  }

  const tabId = Number(alarm.name.replace("refresh-", ""));

  const rules = await getRules();

  const rule = getRule(rules, tabId);

  if (!rule || !rule.running) {
    return;
  }

  try {
    await chrome.tabs.reload(tabId);

    rule.startedAt = Date.now();

    await chrome.action.setBadgeText({
      tabId,
      text: `${rule.seconds}`,
    });

    await saveRules(rules);
  } catch {
    await removeRule(tabId);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await removeRule(tabId);
});
