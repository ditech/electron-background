# @dimensional-innovations/vue-electron-background

vue-electron-background aims to simplify electron apps by providing a simple api to customize the electron application.

## Examples

### Install
Make sure you have `@dimensional-innovations` private package repository access, more info here:
https://gitlab.com/dimensional-innovations/di-handbook/-/blob/master/gitlab-packages/gitlab-packages-setup.md

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
import { AutoUpdater, DevTools, VueElectronSettings, init, KioskBrowserWindow, PrivilegedSchemes, StaticFileDir, TouchEvents, VueElectronVersion } from '@dimensional-innovations/electron-background';
import { config } from '../package';

init({
  appUrl: process.env.WEBPACK_DEV_URL ? process.env.WEBPACK_DEV_URL : 'app://index.html',
  config,
  plugins: [
    new AutoUpdater(),
    new DevTools(),
    new KioskBrowserWindow(),
    new PrivilegedSchemes(['app']),
    new StaticFileDir('app', __dirname),
    new TouchEvents(),
    new VueElectronSettings(),
    new VueElectronVersion()
  ]
});
```

### Setup for Vite

If you are using Vite, add the following to your main or background file. 
```typescript
import { AutoUpdater, DevTools, VueElectronSettings, init, KioskBrowserWindow, PrivilegedSchemes, TouchEvents, VueElectronVersion } from '@dimensional-innovations/electron-background';
import { app } from 'electron';
import { config } from '../package';

init({
  appUrl: app.isPackaged 
    ? `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}` 
    : `file://${join(__dirname, 'index.html')}`,
  config,
  plugins: [
    new AutoUpdater(),
    new DevTools(),
    new KioskBrowserWindow(),
    new TouchEvents(),
    new VueElectronSettings(),
    new VueElectronVersion()
  ]
});
```

## Plugins

By default, the init method creates a BrowserWindow and loads the specified application into the window. All other features of an application are managed through plugins. Each plugin customizes the application instance during the init process. The built-in plugins are listed below.

If a feature you need isn't listed below, you can still add it to the init script by defining the plugin in your application. For example, if we wanted to customize the autoplay policy flag in electron, we would add the following to our init method.
```typescript
import { init } from '@dimensional-innovations/vue-electron-background';
import { app } from 'electron';
import { config } from '../package';

init({
  appUrl: ...,
  config,
  plugins: [
    ...,
    { beforeReady: () => app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required') }
    ...,
  ]
});
```

### AutoUpdater
Starts the auto update process, checking for updates every 3 minutes and automatically installing the update once one is found.

For more info, see https://www.electron.build/auto-update

### DevTools
Installs dev tools extensions and opens the devTools panel.

### KioskBrowserWindow
Enables kiosk mode in the BrowserWindow when the application is packaged.

### BetterUptimeHeartbeat
Starts a heartbeat, which reports uptime to betteruptime.com. Requires that "heartbeatApiKey" is set in the settings.

### PrivilegedSchemes
Registers schemes as privileged.

### StaticFileDir
Registers a custom scheme to serve static files. 

### TouchEvents
Enables touch events in the app.

## API Reference
For the complete API exported by this package, see API.md