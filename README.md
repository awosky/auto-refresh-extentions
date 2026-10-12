# Auto Refresh

A lightweight Chrome extension that automatically reloads a tab on a custom interval so you can keep dashboards, logs, monitoring pages, and other live pages updated without manually refreshing.

## Features

- Set a refresh interval for the active tab
- Start, pause, and resume auto-refresh rules
- Track the remaining time to the next reload
- Remove refresh rules when they are no longer needed
- Persist rules in browser storage so they survive session restarts

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3

## How It Works

The popup UI lets you configure a refresh interval for the current tab. When you add a rule, the extension sends a message to the background service worker, which stores the rule and creates a Chrome alarm. Each time the alarm fires, the tab is reloaded and the countdown is reset.

## Project Structure

```text
src/
├── App.tsx
├── background/
│   ├── helper.ts
│   └── index.ts
├── components/
│   ├── ActiveRules.tsx
│   ├── CurrentTab.tsx
│   ├── Footer.tsx
│   └── Header.tsx
├── main.tsx
├── types/
│   └── index.ts
└── styles (if added later)
public/
├── manifest.json
└── icons/
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Build the extension

```bash
npm run build
```

This generates the production bundle in the `dist` folder.

### Load the extension in Chrome

1. Open `chrome://extensions/`
2. Turn on Developer mode
3. Click `Load unpacked`
4. Select the `dist` folder

## Development

Run the Vite dev server for local UI development:

```bash
npm run dev
```

Run lint checks:

```bash
npm run lint
```

## Notes

This project is designed specifically for browser-based tab refreshing and is best suited for use as a Chrome extension. The extension uses browser alarms and `chrome.tabs.reload()` to handle periodic reloads efficiently.

