# @dimensional-innovations/electron-background

electron-background aims to simplify electron apps by providing a simple api to customize the electron application.

## Getting Started

### Install
Add the package using npm or yarn:
```bash
npm install @dimensional-innovations/electron-background
```

```bash
yarn add @dimensional-innovations/electron-background
```

### Setup for Vue CLI / Webpack

If you are using the Vue CLI, add the following to your main or background file. 
```typescript
import { AutoUpdater, DevTools, init, KioskBrowserWindow, PrivilegedSchemes, StaticFileDir, TouchEvents } from '@dimensional-innovations/electron-background';

init({
  appUrl: process.env.WEBPACK_DEV_URL ? process.env.WEBPACK_DEV_URL : 'app://index.html',
  plugins: [
    new AutoUpdater({ channel: 'stable' }),
    new DevTools(),
    new KioskBrowserWindow(),
    new PrivilegedSchemes(['app']),
    new StaticFileDir('app', __dirname),
    new TouchEvents(),
  ]
});
```

### Setup for Vite

If you are using Vite, add the following to your main or background file. 
```typescript
import { AutoUpdater, DevTools, init, KioskBrowserWindow, TouchEvents } from '@dimensional-innovations/electron-background';
import { join } from 'path';

init({
  appUrl: process.env['ELECTRON_RENDERER_URL']
    ? process.env['ELECTRON_RENDERER_URL']
    : `file://${join(__dirname, '../renderer/index.html')}`,
  plugins: [
    new AutoUpdater({ channel: 'stable' }),
    new DevTools(),
    new KioskBrowserWindow(),
    new TouchEvents(),
  ]
});
```

## Plugins

By default, the init method creates a BrowserWindow and loads the specified application into the window. All other features of an application are managed through plugins. Each plugin customizes the application instance during the init process. The built-in plugins are listed below.

If a feature you need isn't listed below, you can still add it to the init script by defining the plugin in your application. For example, if we wanted to customize the autoplay policy flag in electron, we would add the following to our init method.
```typescript
import { init } from '@dimensional-innovations/electron-background';
import { app } from 'electron';

init({
  appUrl: ...,
  plugins: [
    ...,
    { beforeReady: () => app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required') }
    ...,
  ]
});
```

### AutoStart
Registers the application as a login item so it launches automatically at system startup. On Windows, boot-initiated launches are detected via a `--autostart` argument, allowing an optional delay before window creation. On macOS/Linux the delay is skipped since boot detection is not reliable.

```typescript
// Default: 30-second delay on boot launches
new AutoStart()

// Custom delay (in seconds)
new AutoStart(true, { startupDelay: 60 })

// No delay on boot launches
new AutoStart(true, { startupDelay: 0 })
```

### AutoUpdater
Starts the auto update process, checking for updates every 3 minutes and automatically installing the update once one is found.

For more info, see https://www.electron.build/auto-update

### DevTools
Installs dev tools extensions and opens the devTools panel.

### KioskBrowserWindow
Enables kiosk mode in the BrowserWindow when the application is packaged.

### BetterStackHeartbeat
Starts a heartbeat, which reports uptime to betteruptime.com. Requires `heartbeatApiKey` in options.

### PrivilegedSchemes
Registers schemes as privileged.

### StaticFileDir
Registers a custom scheme to serve static files. 

### TouchEvents
Enables touch events in the app.

## API Reference
For the complete API exported by this package, see API.md