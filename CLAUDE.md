# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@dimensional-innovations/electron-background` is a TypeScript library that simplifies Electron app initialization through a plugin-based architecture. It provides a streamlined API for setting up common Electron features like auto-updates, dev tools, kiosk mode, and window management.

## Development Commands

```bash
# Build the TypeScript project (compiles src/ to dist/)
npm run build

# Run ESLint on source files
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Generate API documentation (outputs to API.md)
npm run generate:docs
```

## Architecture

### Plugin-Based Initialization System

The core of this library is the `init()` function (src/init.ts), which orchestrates Electron app initialization through a four-phase plugin lifecycle:

1. **beforeReady** - Runs before `app.whenReady()` resolves. Used for setup that must occur before Electron is ready (e.g., registering privileged schemes via `protocol.registerSchemesAsPrivileged`)
2. **afterReady** - Runs after `app.whenReady()` but before any BrowserWindow is created. Used for setup requiring a ready app
3. **beforeLoad** - Runs after each BrowserWindow is created but before loading the app URL. Used for installing extensions, setting up event handlers on the window
4. **afterLoad** - Runs after the app URL is loaded into each window. Used for starting background services like auto-updater or heartbeat monitors

### InitContext Object

Throughout the plugin lifecycle, plugins receive an `InitContext` object. It is a class with two typed aliases:

- `NonBrowserWindowInitContext` - Used in `beforeReady` and `afterReady`. Contains:
  - `log` - electron-log instance for consistent logging
- `BrowserWindowInitContext` - Used in `beforeLoad` and `afterLoad`. Contains:
  - `log` - electron-log instance
  - `browserWindow` - The `AppBrowserWindow` instance (guaranteed to be set)

### Window System

Windows are now class-based, extending `AppBrowserWindow` (src/windows/AppBrowserWindow.ts), which itself extends Electron's `BrowserWindow`. The `AppBrowserWindowConstructorOptions` interface extends `BrowserWindowConstructorOptions` with an additional required `appUrl` field. `AppBrowserWindow` stores `appUrl` internally and exposes a `loadApp()` method.

`InitOptions.windows` accepts an array of tuples `[WindowClass, options]`, where each tuple pairs a window class constructor with its options. The `init()` function iterates this array, instantiates each window, runs the `beforeLoad`/`afterLoad` plugin phases for it, and calls `loadApp()`.

### Plugin Implementation Pattern

All plugins implement the `InitPlugin` interface (src/init.ts). Common patterns:

- Plugins typically accept an `enabled` parameter that defaults to `app.isPackaged` (for production-only features) or `!app.isPackaged` (for dev-only features)
- Use `beforeReady` for protocol/scheme registration (must happen before app is ready)
- Use `afterReady` for app-level setup that requires Electron to be ready
- Use `beforeLoad` to set up window event handlers or install browser extensions
- Use `afterLoad` to start background services or timers

## Plugin Implementations

### Built-in Plugins (src/plugins/):

- **AutoUpdater** - Checks for updates every 3 minutes using electron-updater. Accepts optional `channel` in options. Enabled when packaged
- **DevTools** - Installs browser extensions and opens DevTools. Accepts array of extensions to install. Enabled in development only
- **PrivilegedSchemes** - Registers custom URL schemes as privileged (must run in beforeReady)
- **StaticFileDir** - Registers custom scheme to serve static files from a directory
- **TouchEvents** - Enables touch input support
- **SingleInstance** - Ensures only one app instance runs; focuses existing window if second instance launches
- **NodeHeartbeat** - Sends periodic heartbeat to betteruptime.com (requires `heartbeatApiKey` in options)

### Built-in Windows (src/windows/):

- **AppBrowserWindow** - Base class. Extends `BrowserWindow`. Takes `AppBrowserWindowConstructorOptions` (includes `appUrl`). Exposes `loadApp()`
- **KioskBrowserWindow** - Sets kiosk defaults: `fullscreen`, `alwaysOnTop`, `kiosk`, `minimizable: false`, `movable: false`. Caller options spread last to allow overrides
- **FullScreenBrowserWindow** - Sets `alwaysOnTop`, `resizable: false`, `frame: false`. When packaged, listens on `ready-to-show` to match window bounds to the primary display and reacts to display changes

## Key Implementation Details

### TypeScript Configuration
- Target: ES2016
- Module: CommonJS
- Strict mode enabled
- Outputs to dist/ with declaration files (.d.ts)

### ESLint Configuration
Uses TypeScript ESLint with recommended rules. Project reference points to tsconfig.json.

### Security Settings
The init function sets `ELECTRON_DISABLE_SECURITY_WARNINGS=true`. Window security settings (nodeIntegration, contextIsolation, webSecurity) are set per-window via the options passed to each window class. These settings are appropriate for kiosk-style applications but should be reviewed for web-facing apps.

### Typical Usage Pattern

```typescript
import { init, KioskBrowserWindow, AutoUpdater, DevTools, DevToolExtensions } from '@dimensional-innovations/electron-background';

init({
  windows: [
    [KioskBrowserWindow, {
      appUrl: process.env.DEV_URL || 'app://index.html',
      width: 1920,
      height: 1080,
    }],
  ],
  plugins: [
    new AutoUpdater(undefined, { channel: 'stable' }),
    new DevTools([DevToolExtensions.VUEJS_DEVTOOLS]),
  ]
});
```

## File Structure

- `src/` - TypeScript source files
- `src/plugins/` - Plugin implementations (one file per plugin)
- `src/windows/` - Window class implementations (AppBrowserWindow, KioskBrowserWindow, FullScreenBrowserWindow)
- `dist/` - Compiled output (gitignored, created by `npm run build`)
- `src/index.ts` - Main entry point, re-exports all public APIs
- `src/init.ts` - Core initialization logic, plugin interfaces, and InitContext
