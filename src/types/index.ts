export type RefreshRule = {
  tabId: number;
  url: string;
  seconds: number;
  running: boolean;
  startedAt: number | null;
};
