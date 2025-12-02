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
2. **afterReady** - Runs after `app.whenReady()` but before the BrowserWindow is created. Used for modifying window options or setup requiring a ready app
3. **beforeLoad** - Runs after BrowserWindow creation but before loading the app URL. Used for installing extensions, setting up event handlers on the window
4. **afterLoad** - Runs after the app URL is loaded. Used for starting background services like auto-updater or heartbeat monitors

### InitContext Object

Throughout the plugin lifecycle, plugins receive an `InitContext` object containing:
- `appUrl` - The URL to load in the window
- `config` - Application configuration object (key-value pairs)
- `browserWindowOptions` - BrowserWindow options that can be modified by plugins
- `log` - electron-log instance for consistent logging
- `browserWindow` - Available in beforeLoad/afterLoad phases only

The context object is passed to each plugin sequentially, allowing plugins to modify shared state (especially `browserWindowOptions`).

### Plugin Implementation Pattern

All plugins implement the `InitPlugin` interface (src/init.ts:56-86). Common patterns:

- Plugins typically accept an `enabled` parameter that defaults to `app.isPackaged` (for production-only features) or `!app.isPackaged` (for dev-only features)
- Use `beforeReady` for protocol/scheme registration (must happen before app is ready)
- Use `afterReady` to modify `context.browserWindowOptions` using `lodash.merge` for deep merging
- Use `beforeLoad` to set up window event handlers or install browser extensions
- Use `afterLoad` to start background services or timers

### Window Options Merging

The BrowserWindow plugins (DefaultBrowserWindow, KioskBrowserWindow, FullScreenBrowserWindow in src/BrowserWindow.ts) use a specific merge order via `lodash.merge`:

```
defaultOptions → configOptions → contextOptions → pluginOptions → { closable: true }
```

This ensures the rightmost values take precedence, with `closable: true` always winning.

## Plugin Implementations

### Built-in Plugins (src/):

- **AutoUpdater** - Checks for updates every 3 minutes using electron-updater. Requires `autoUpdaterChannel` in config. Enabled when packaged
- **DevTools** - Installs browser extensions and opens DevTools. Accepts array of extensions to install. Enabled in development only
- **DefaultBrowserWindow/KioskBrowserWindow/FullScreenBrowserWindow** - Configure window behavior. Kiosk mode enables fullscreen, always-on-top, and disables window controls
- **PrivilegedSchemes** - Registers custom URL schemes as privileged (must run in beforeReady)
- **StaticFileDir** - Registers custom scheme to serve static files from a directory
- **TouchEvents** - Enables touch input support
- **SingleInstance** - Ensures only one app instance runs; focuses existing window if second instance launches
- **NodeHeartbeat** - Sends periodic heartbeat to betteruptime.com (requires `heartbeatApiKey` in config)

## Key Implementation Details

### TypeScript Configuration
- Target: ES2016
- Module: CommonJS
- Strict mode enabled
- Outputs to dist/ with declaration files (.d.ts)

### ESLint Configuration
Uses TypeScript ESLint with recommended rules. Project reference points to tsconfig.json.

### Security Settings
The init function sets `ELECTRON_DISABLE_SECURITY_WARNINGS=true` and configures windows with:
- `nodeIntegration: true`
- `contextIsolation: false`
- `webSecurity: false`

These settings are appropriate for kiosk-style applications but should be reviewed for web-facing apps.

### Typical Usage Pattern

```typescript
import { init, KioskBrowserWindow, AutoUpdater, DevTools } from '@dimensional-innovations/electron-background';

init({
  appUrl: process.env.DEV_URL || 'app://index.html',
  config: { autoUpdaterChannel: 'stable' },
  browserWindowOptions: { width: 1920, height: 1080 },
  plugins: [
    new KioskBrowserWindow(),
    new AutoUpdater(),
    new DevTools([DevToolExtensions.VUEJS_DEVTOOLS]),
  ]
});
```

## File Structure

- `src/` - TypeScript source files (one file per plugin/feature)
- `dist/` - Compiled output (gitignored, created by `npm run build`)
- `src/index.ts` - Main entry point, re-exports all public APIs
- `src/init.ts` - Core initialization logic and plugin interfaces
