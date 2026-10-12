import type { RefreshRule } from "../types";

export const getRules = async (): Promise<RefreshRule[]> => {
  const data = await chrome.storage.local.get("rules");

  return (data.rules as RefreshRule[]) ?? [];
};

export const saveRules = async (rules: RefreshRule[]) => {
  await chrome.storage.local.set({ rules });
};

export const getRule = (rules: RefreshRule[], tabId: number) => {
  return rules.find((rule) => rule.tabId === tabId);
};

export const removeRule = async (tabId: number) => {
  const rules = await getRules();

  const filtered = rules.filter((rule) => rule.tabId !== tabId);

  await saveRules(filtered);

  await chrome.alarms.clear(`refresh-${tabId}`);

  await chrome.action.setBadgeText({
    tabId,
    text: "",
  });
};

export const updateBadges = async () => {
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
