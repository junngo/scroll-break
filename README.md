# Scroll Break

A cross-browser (Chrome + Firefox) extension that helps you take breaks from YouTube Shorts. After watching Shorts for a configurable duration, an overlay appears; after you dismiss it, a cooldown period applies before it can trigger again.

## Features

- **Time limit**: Triggers after watching Shorts for N minutes (default 5).
- **Overlay**: Black screen + modal, or pause video + overlay (configurable).
- **Cooldown**: After dismissing, the overlay won’t show again for N minutes (default 10).
- **Settings**: All options are configurable in the extension popup and stored locally (no external servers).

## Project structure

```
scroll-break/
├── public/
│   └── manifest.json       # MV3 manifest (copied to dist)
├── src/
│   ├── background.ts       # Service worker
│   ├── content.ts          # Injected on YouTube; detects Shorts + overlay
│   ├── content/
│   │   └── overlay.css     # Overlay/modal styles
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts        # Settings UI
│   ├── storage.ts          # chrome.storage helpers
│   └── types.ts            # Shared types + defaults
├── dist/                   # Build output (after npm run build)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Design choices

### How “watching Shorts” time is detected

1. **Shorts page**: The content script checks `window.location.pathname.startsWith('/shorts/')`. Only time on URLs like `youtube.com/shorts/...` is counted.
2. **Video playing**: Every 1 second we check `document.querySelector('video')` and that it is not `paused` and not `ended`. Only when the Short is actually playing do we add 1 second to the accumulated time.
3. **Continuous time**: The counter accumulates while you stay on Shorts and the video is playing. If you leave Shorts (e.g. go to the home page), we reset the counter. When you come back, timing starts again from zero.
4. **Cooldown**: After you dismiss the overlay, we store `lastDismissedAt` in `chrome.storage.local`. Until `cooldownMinutes` have passed, we do not trigger the overlay again and we reset the accumulated time so the next session is a full “5 minutes” after cooldown.

So “5 minutes of watching Shorts” means: 5 minutes of **play time** on Shorts pages only, with overlay and cooldown applied as above.

### Overlay behavior

- **Option A (modal)**: Full-screen black backdrop + centered modal with a “Take a break” button. Video keeps playing behind (covered).
- **Option B (pause and modal)**: Same overlay, but we call `video.pause()` before showing and `video.play()` after dismiss.

Overlay is only shown on Shorts pages and is fully dismissible; state is persisted so cooldown works across reloads.

### Storage

- **Settings** (limit minutes, cooldown minutes, overlay style): `chrome.storage.sync` so they follow the user across devices (where supported).
- **Last dismissed time**: `chrome.storage.local` so it’s per-browser and doesn’t need sync.

### Build

- **Vite** bundles the extension: TypeScript → JS, CSS from content script and popup. No external servers or runtime dependencies.
- **Manifest V3** with a service worker (background), content script, and action popup. The same build works in Chrome and Firefox; Firefox uses `browser_specific_settings.gecko` in the manifest.

## Run instructions

### Prerequisites

- Node.js 18+ and npm.

### Build

```bash
cd c:\Users\lg\work\scroll-break
npm install
npm run build
```

Output is in the `dist/` folder: `manifest.json`, `background.js`, `content.js`, `content.css`, `popup/popup.html`, and popup assets.

### Chrome

1. Open `chrome://extensions/`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the **`dist`** folder inside the project.
5. Go to `https://www.youtube.com/shorts/...` and play Shorts for the configured time to see the overlay.

### Firefox

1. Open `about:debugging`.
2. Click **This Firefox** → **Load Temporary Add-on**.
3. In the project folder, open **`dist`** and choose **`manifest.json`**.
4. Go to `https://www.youtube.com/shorts/...` and play Shorts for the configured time to see the overlay.

Note: The temporary add-on is removed when you close Firefox. For a permanent install, use **about:addons** and “Install Add-on From File…” with a signed `.xpi` (e.g. from AMO or your own signing).

### Configure

Click the extension icon in the toolbar to open the popup. Set:

- **Break after (minutes)** – trigger after this many minutes of watching Shorts.
- **Cooldown after dismiss (minutes)** – time before the overlay can trigger again.
- **Overlay style** – “Black overlay + modal” or “Pause video + overlay”.

Click **Save**. Settings are stored locally and used on the next check (and refreshed periodically in the content script).

## License

MIT.
