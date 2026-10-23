export type RefreshRule = {
  tabId: number;
  url: string;
  title: string;
  seconds: string;
  running: boolean;
  startedAt: number | null;
};
