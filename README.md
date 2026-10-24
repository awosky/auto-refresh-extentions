# Refresh Mate

Refresh Mate is a Chrome extension for refreshing tabs on a schedule and keeping your screen awake while you browse. Configure refresh rules for individual tabs, monitor their countdowns, and enable the screen wake lock when you need a page to stay visible without the display sleeping.

## Features

- Add an automatic refresh rule for the current tab with an interval in seconds
- Pause, resume, edit, or remove a rule for any tab
- View each rule's status, interval, and countdown to its next refresh
- See the active tab's countdown in the extension badge
- Keep the screen awake on supported pages with the **Keep Screen Awake** toggle
- Store rules and the wake-lock setting in Chrome local extension storage

## How It Works

The popup sends rule changes to the Manifest V3 background service worker. The worker saves rules in `chrome.storage.local` and schedules refreshes with Chrome alarms. When an alarm fires for a running rule, Refresh Mate reloads that tab and resets its countdown. Closing a tab removes its rule.

The **Keep Screen Awake** setting is shared across pages. A content script reads the setting and requests a screen wake lock through the browser's Screen Wake Lock API while an HTTP or HTTPS page is visible. If the browser releases the lock, the script attempts to reacquire it; hidden pages do not hold a lock. This feature depends on browser support and page visibility.

Rules and settings are stored locally, but the extension clears them when Chrome starts. Add your refresh rules again after restarting the browser.

## Requirements

- Google Chrome with support for Manifest V3 extensions
- Node.js and npm to build the extension from source

## Install from Source

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

   The production extension is generated in `dist/`.

4. In Chrome, open `chrome://extensions/` and turn on **Developer mode**.
5. Select **Load unpacked** and choose the generated `dist` folder.

To use a locally built update, rebuild with `npm run build`, then reload the extension from `chrome://extensions/`.

## Development

Start the Vite development server for working on the popup interface:

```bash
npm run dev
```

The development server is for UI development; build the extension and load `dist/` in Chrome to test extension APIs and background behavior.

Run the available lint check with:

```bash
npm run lint
```

Create a production build with type-checking using:

```bash
npm run build
```

## Project Structure

```text
src/
├── background/
│   ├── helper.ts          # Storage, rule lookup, tab cleanup, and badge updates
│   └── index.ts           # Message handling, alarms, and tab lifecycle events
├── components/
│   ├── ActiveRules.tsx    # Rule list, countdowns, and rule controls
│   ├── CurrentTab.tsx     # Current-tab refresh interval form
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── WakeLockToggle.tsx
├── types/
│   └── index.ts           # Refresh rule type
├── App.tsx
├── main.tsx
└── style.css
public/
├── content.js             # Screen Wake Lock API integration
├── manifest.json          # Chrome extension metadata and permissions
├── icons/
└── logo.png
index.html
vite.config.ts
```

## Tech Stack

- React and TypeScript
- Vite
- Tailwind CSS
- Chrome Extensions Manifest V3 APIs (storage, alarms, tabs, and action badge)
- Screen Wake Lock API
