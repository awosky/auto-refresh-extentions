(() => {
  const STORAGE_KEY = "keepAwakeEnabled";

  let wakeLock = null;
  let enabled = false;
  let requesting = false;

  async function releaseWakeLock() {
    const current = wakeLock;
    wakeLock = null;

    if (current) {
      try {
        await current.release();
      } catch (error) {
        console.warn("Could not release wake lock:", error);
      }
    }
  }

  async function requestWakeLock() {
    if (!enabled || requesting || wakeLock || document.visibilityState !== "visible") {
      return;
    }

    if (!("wakeLock" in navigator)) {
      console.warn("Screen Wake Lock API is not supported.");
      return;
    }

    requesting = true;

    try {
      const sentinel = await navigator.wakeLock.request("screen");

      // The setting might have changed while the request was pending.
      if (!enabled || document.visibilityState !== "visible") {
        await sentinel.release();
        return;
      }

      wakeLock = sentinel;

      sentinel.addEventListener(
        "release",
        () => {
          if (wakeLock === sentinel) {
            wakeLock = null;
          }

          // Avoid immediate retry loops if the browser refuses the lock.
          if (enabled && document.visibilityState === "visible") {
            setTimeoutRetry();
          }
        },
        { once: true },
      );

      console.log("Screen Wake Lock acquired.");
    } catch (error) {
      console.warn("Screen Wake Lock request failed:", error);
    } finally {
      requesting = false;
    }
  }

  let retryTimer = null;

  function setTimeoutRetry() {
    if (retryTimer !== null) return;

    retryTimer = setTimeout(() => {
      retryTimer = null;
      void requestWakeLock();
    }, 1000);
  }

  async function updateEnabled(value) {
    enabled = value === true;

    if (enabled) {
      await requestWakeLock();
    } else {
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      await releaseWakeLock();
    }
  }

  // Restore the saved setting on every page load or refresh.
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    void updateEnabled(result[STORAGE_KEY] === true);
  });

  // React to the popup toggle without requiring the popup to stay open.
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[STORAGE_KEY]) {
      void updateEnabled(changes[STORAGE_KEY].newValue === true);
    }
  });

  // The browser can release the lock when a page becomes hidden.
  // Reacquire it when the page becomes visible again.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && enabled) {
      void requestWakeLock();
    }
  });
})();
