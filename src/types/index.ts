export type RefreshRule = {
  tabId: number;
  url: string;
  seconds: string;
  running: boolean;
  startedAt: number | null;
};
