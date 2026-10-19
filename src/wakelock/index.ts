export type WakeLockAction = "enable" | "disable" | "status";

export async function controlWakeLock(action: WakeLockAction): Promise<{ enabled: boolean; error?: string }> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id) {
    return { enabled: false, error: "No active tab found." };
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (requestedAction: WakeLockAction) => {
        type WakeController = {
          enabled: boolean;
          sentinel: WakeLockSentinel | null;
          start: () => Promise<void>;
          stop: () => void;
          acquire: () => Promise<void>;
          onVisibilityChange: () => void;
        };

        const key = "__simpleAutoRefreshWakeLock";
        const root = globalThis as typeof globalThis & {
          __simpleAutoRefreshWakeLock?: WakeController;
        };

        let controller = root[key];

        if (requestedAction === "status") {
          return { enabled: controller?.enabled === true };
        }

        if (requestedAction === "disable") {
          controller?.stop();
          delete root[key];
          return { enabled: false };
        }

        if (!("wakeLock" in navigator)) {
          return {
            enabled: false,
            error: "Screen Wake Lock is not supported on this page.",
          };
        }

        if (!controller) {
          controller = {
            enabled: false,
            sentinel: null,

            acquire: async () => {
              if (!controller?.enabled || document.visibilityState !== "visible") {
                return;
              }

              try {
                const sentinel = await navigator.wakeLock.request("screen");

                if (!controller.enabled) {
                  await sentinel.release();
                  return;
                }

                controller.sentinel = sentinel;

                sentinel.addEventListener(
                  "release",
                  () => {
                    if (controller) {
                      controller.sentinel = null;

                      if (controller.enabled && document.visibilityState === "visible") {
                        void controller.acquire();
                      }
                    }
                  },
                  { once: true },
                );
              } catch {
                throw new Error("The browser could not enable Screen Wake Lock.");
              }
            },

            onVisibilityChange: () => {
              if (document.visibilityState === "visible") {
                void controller?.acquire().catch(console.error);
              }
            },

            start: async () => {
              if (!controller) return;

              controller.enabled = true;
              document.addEventListener("visibilitychange", controller.onVisibilityChange);

              await controller.acquire();
            },

            stop: () => {
              if (!controller) return;

              controller.enabled = false;
              document.removeEventListener("visibilitychange", controller.onVisibilityChange);

              const sentinel = controller.sentinel;
              controller.sentinel = null;

              if (sentinel) void sentinel.release();
            },
          };

          root[key] = controller;
        }

        try {
          await controller.start();
          return { enabled: true };
        } catch (error) {
          controller.stop();
          delete root[key];

          return {
            enabled: false,
            error: error instanceof Error ? error.message : "Could not enable Screen Wake Lock.",
          };
        }
      },
      args: [action],
    });

    return (
      results[0]?.result ?? {
        enabled: false,
        error: "No response from the page.",
      }
    );
  } catch {
    return {
      enabled: false,
      error: "This page does not allow Wake Lock injection. Try a regular website.",
    };
  }
}
