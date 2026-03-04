# @dimensional-innovations/electron-background

A TypeScript library that simplifies Electron app initialization through a plugin-based architecture.

## Getting Started

### Installation

```bash
npm install @dimensional-innovations/electron-background
```

### Setup for Vue CLI / Webpack

If you are using the Vue CLI, add the following to your main or background file.

```typescript
import path from 'path';
import {
  init,
  KioskBrowserWindow,
  PrivilegedSchemes,
  StaticFileDir,
  AutoUpdater,
  DevTools,
  DevToolExtensions,
} from '@dimensional-innovations/electron-background';

init({
  windows: [
    () => new KioskBrowserWindow({ 
      appUrl: process.env.WEBPACK_DEV_URL ? process.env.WEBPACK_DEV_URL : 'app://index.html' 
    }),
  ],
  plugins: [
    new PrivilegedSchemes(['app']),
    new StaticFileDir('app', path.join(__dirname, '../renderer')),
    new AutoUpdater({ channel: 'stable' }),
    new DevTools([DevToolExtensions.VUEJS_DEVTOOLS]),
  ],
});
```

### Setup for Vite

If you are using Vite, add the following to your main or background file.

```typescript
import path from 'path';
import {
  init,
  KioskBrowserWindow,
  PrivilegedSchemes,
  StaticFileDir,
  AutoUpdater,
  DevTools,
  DevToolExtensions,
} from '@dimensional-innovations/electron-background';

init({
  windows: [
    () => new KioskBrowserWindow({ 
      appUrl: process.env['ELECTRON_RENDERER_URL']
        ? process.env['ELECTRON_RENDERER_URL']
        : `file://${path.join(__dirname, '../renderer/index.html')`,
    }),
  ],
  plugins: [
    new AutoUpdater({ channel: 'stable' }),
    new DevTools(),
    new KioskBrowserWindow(),
  ]
});
```

---

## Windows

Windows are defined as factory functions in the `windows` array. Each factory is called after `app.whenReady()` resolves, satisfying Electron's requirement that `BrowserWindow` instances are not created before the app is ready.

```typescript
init({
  windows: [
    () => new KioskBrowserWindow({ appUrl: '...' }),
  ],
});
```

### AppBrowserWindow

The base window class. All built-in window classes extend it. Extends Electron's `BrowserWindow` with an `appUrl` constructor option and a `loadApp()` method.

```typescript
() => new AppBrowserWindow({
  appUrl: 'app://index.html',
  width: 1280,
  height: 720,
})
```

All standard `BrowserWindowConstructorOptions` are supported in addition to `appUrl`.

---

### KioskBrowserWindow

Runs the window in kiosk mode when the application is packaged. In development it behaves as a normal window, making it easy to inspect and resize.

```typescript
() => new KioskBrowserWindow({ appUrl: 'app://index.html' })
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appUrl` | `string` | — | The URL to load. |
| `screen` | `'primary' \| 'secondary' \| number` | `'primary'` | The display to run kiosk mode on. Use `'secondary'` for the first non-primary display, or a zero-based index for a specific display. |
| `...BrowserWindowConstructorOptions` | | | All standard Electron options are supported. |

**Second parameter:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | `boolean` | `app.isPackaged` | Set to `true` to force kiosk behavior in development. |

**Examples:**

```typescript
// Default — kiosk on the primary display when packaged
() => new KioskBrowserWindow({ appUrl: 'app://index.html' })

// Kiosk on the secondary display
() => new KioskBrowserWindow({ appUrl: 'app://index.html', screen: 'secondary' })

// Kiosk on the display at index 2
() => new KioskBrowserWindow({ appUrl: 'app://index.html', screen: 2 })

// Force kiosk behavior in development
() => new KioskBrowserWindow({ appUrl: 'app://index.html' }, true)
```

---

### FullScreenBrowserWindow

Ensures the window always occupies the full bounds of a display. When packaged, the window snaps to the target display on `ready-to-show` and automatically re-snaps when display configuration changes (display added, removed, or resized). In development it behaves as a normal window.

Prefer `FullScreenBrowserWindow` over `KioskBrowserWindow` when:
- Running multiple windows across different displays
- A window needs to span multiple displays (see [spanning multiple displays](#example-window-spanning-multiple-displays))

```typescript
() => new FullScreenBrowserWindow({ appUrl: 'app://index.html' })
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appUrl` | `string` | — | The URL to load. |
| `screen` | `'primary' \| 'secondary' \| number` | `'primary'` | The display to occupy. Use `'secondary'` for the first non-primary display, or a zero-based index for a specific display. |
| `...BrowserWindowConstructorOptions` | | | All standard Electron options are supported. |

**Second parameter:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | `boolean` | `app.isPackaged` | Set to `true` to force fullscreen behavior in development. |

**Example — multiple windows, one per display:**

```typescript
init({
  windows: [
    () => new FullScreenBrowserWindow({ appUrl: 'app://index.html', screen: 'primary' }),
    () => new FullScreenBrowserWindow({ appUrl: 'app://index.html', screen: 'secondary' }),
  ],
  plugins: [
    new PrivilegedSchemes(['app']),
    new StaticFileDir('app', path.join(__dirname, '../renderer')),
    new AutoUpdater({ channel: 'stable' }),
  ],
});
```

Each window independently tracks its target display and re-snaps when the display configuration changes.

---

## Plugins

Plugins implement the `InitPlugin` interface and hook into one or more phases of the initialization lifecycle.

### Lifecycle

```
beforeReady → app.whenReady() → afterReady → [per window] beforeLoad → loadApp() → afterLoad
```

| Phase | Context | Typical use |
|-------|---------|-------------|
| `beforeReady` | No window | Registering privileged schemes |
| `afterReady` | No window | App-level setup after Electron is ready |
| `beforeLoad` | Window available | Installing extensions, attaching window event handlers |
| `afterLoad` | Window available | Starting background services, adjusting window state after load |

The context object passed to each phase contains:
- `log` — an `electron-log` instance. Use this instead of `console` so output is captured in log files.
- `browserWindow` — the `AppBrowserWindow` instance. Only available in `beforeLoad` and `afterLoad`.

---

### Built-in Plugins

#### AutoUpdater

Checks for and automatically installs updates every 3 minutes using `electron-updater`. Only runs when packaged by default.

```typescript
new AutoUpdater({ channel: 'stable' })

// Custom channel
new AutoUpdater({ channel: 'beta' })

// Force-enable in development
new AutoUpdater({ channel: 'stable' }, true)
```

#### DevTools

Installs browser extensions and opens DevTools. Only runs in development by default.

```typescript
import { DevTools, DevToolExtensions } from '@dimensional-innovations/electron-background';

new DevTools([DevToolExtensions.VUEJS_DEVTOOLS])
new DevTools([DevToolExtensions.REACT_DEVELOPER_TOOLS, DevToolExtensions.REDUX_DEVTOOLS])
```

Available extensions: `VUEJS_DEVTOOLS`, `REACT_DEVELOPER_TOOLS`, `REDUX_DEVTOOLS`, `MOBX_DEVTOOLS`, `EMBER_INSPECTOR`, `BACKBONE_DEBUGGER`, `JQUERY_DEBUGGER`.

#### SingleInstance

Ensures only one instance of the app runs at a time. If a second instance is launched, it quits immediately and the first instance is focused.

```typescript
new SingleInstance()
```

#### PrivilegedSchemes

Registers custom URL schemes as privileged (secure, standard, with Fetch API support). Runs in `beforeReady`. Pair with `StaticFileDir` to serve local files via a custom scheme.

```typescript
new PrivilegedSchemes(['app'])

// Multiple schemes
new PrivilegedSchemes(['app', 'media'])
```

#### StaticFileDir

Registers a custom scheme to serve static files from a local directory. Runs in `afterReady`.

```typescript
new StaticFileDir('app', path.join(__dirname, '../renderer'))

// A separate scheme for media assets
new StaticFileDir('media', path.join(__dirname, '../assets'))
```

#### TouchEvents

Enables touch event support via Chromium's `--touch-events` command-line switch.

```typescript
new TouchEvents()
```

#### Heartbeat

Sends periodic HTTP HEAD requests to a URL for uptime monitoring. Only runs when packaged by default.

```typescript
import { Heartbeat } from '@dimensional-innovations/electron-background';

new Heartbeat({ url: 'https://your-monitor.example.com/ping', pollInterval: 30_000 })
```

#### BetterStackHeartbeat

Sends periodic heartbeats to [BetterStack](https://betterstack.com) uptime monitoring. Only runs when packaged by default.

```typescript
import { BetterStackHeartbeat } from '@dimensional-innovations/electron-background';

new BetterStackHeartbeat({ heartbeatApiKey: 'your-api-key' })

// Custom poll interval (default is 30 seconds)
new BetterStackHeartbeat({ heartbeatApiKey: 'your-api-key', pollInterval: 60_000 })
```

---

## Custom Plugins

Implement the `InitPlugin` interface and define whichever lifecycle methods your plugin needs. Omitting a method means that phase is skipped for your plugin.

```typescript
import {
  InitPlugin,
  NonBrowserWindowInitContext,
  BrowserWindowInitContext,
} from '@dimensional-innovations/electron-background';

class MyPlugin implements InitPlugin {
  async afterReady({ log }: NonBrowserWindowInitContext): Promise<void> {
    log.info('App is ready');
  }

  async afterLoad({ browserWindow, log }: BrowserWindowInitContext): Promise<void> {
    log.info('Window loaded:', browserWindow.id);
  }
}
```

Pass the plugin directly in the `plugins` array:

```typescript
init({
  windows: [...],
  plugins: [new MyPlugin()],
});
```

---

### Example: Window Spanning Multiple Displays

For setups where a single window must stretch across several displays, use a custom plugin to compute the combined bounds of all displays and apply them via `setBounds` in `afterLoad`. `FullScreenBrowserWindow` is used as the base window because it removes the frame and disables user resizing and movement — the plugin then overrides the bounds to cover all displays.

```typescript
import { screen } from 'electron';
import path from 'path';
import {
  init,
  InitPlugin,
  BrowserWindowInitContext,
  FullScreenBrowserWindow,
  PrivilegedSchemes,
  StaticFileDir,
} from '@dimensional-innovations/electron-background';

class SpanAllDisplays implements InitPlugin {
  async afterLoad({ browserWindow }: BrowserWindowInitContext): Promise<void> {
    const displays = screen.getAllDisplays();

    const left   = Math.min(...displays.map(d => d.bounds.x));
    const top    = Math.min(...displays.map(d => d.bounds.y));
    const right  = Math.max(...displays.map(d => d.bounds.x + d.bounds.width));
    const bottom = Math.max(...displays.map(d => d.bounds.y + d.bounds.height));

    browserWindow.setBounds({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    });
  }
}

init({
  windows: [
    () => new FullScreenBrowserWindow({ appUrl: 'app://index.html' }),
  ],
  plugins: [
    new PrivilegedSchemes(['app']),
    new StaticFileDir('app', path.join(__dirname, '../renderer')),
    new SpanAllDisplays(),
  ],
});
```

---

## API Reference

For the complete API exported by this package, see [API.md](./API.md).
