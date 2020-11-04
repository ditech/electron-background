import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';

// https://github.com/webpack/webpack/issues/5392
// eslint-disable-next-line prefer-destructuring
const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;

// read the project's root package.json to determine configs
async function getProjectPackageJsonConfig() {
  const filePath = path.join(process.cwd(), 'package.json');

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, file) => {
      if (err) reject(err);

      const json = JSON.parse(file);
      if (!json.config) reject(new Error('No config found'));
      else resolve(json.config);
    });
  });
}

// setup configurable default window options
// if running in a production environment, add properties for full
// screen kiosk mode with an unclosable window
async function getWindowOptions(browserWindowOptionOverrides, enableKioskMode) {
  const {
    appWidth, appHeight, backgroundColor,
  } = await settings.get('config') || {};

  const windowDefaults = {
    width: 1920,
    height: 1080,
    backgroundColor: '#000',
  };

  const windowOptions = {
    ...windowDefaults,
    width: appWidth,
    height: appHeight,
    backgroundColor,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  };

  if (enableKioskMode) {
    return {
      ...windowOptions,
      acceptFirstMouse: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      closable: false,
      fullscreen: true,
      kiosk: true,
      minimizable: false,
      movable: false,
      x: 0,
      y: 0,
      ...browserWindowOptionOverrides,
    };
  }

  return {
    ...windowOptions,
    ...browserWindowOptionOverrides,
  };
}

export default async function init({
  enableTouchEvents = true,
  enableAutoUpdater = true,
  enableKioskMode = false,
  registerSchemesAsPrivileged = true,
  browserWindowOptionOverrides = {},
}) {
  // bypasses content security policy for resources
  // https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
  if (registerSchemesAsPrivileged) {
    protocol.registerSchemesAsPrivileged(
      [
        {
          scheme: 'app',
          privileges: { secure: true, standard: true },
        },
      ],
    );
  }

  await app.whenReady();

  // tell the audo updater to periodically check for updates
  if (enableAutoUpdater) autoUpdater.checkForUpdates();

  // check to see if any previous config settings have been set if not, set them
  if (!settings.has('config')) {
    const config = await getProjectPackageJsonConfig();
    settings.set('config', config);
  }

  // create the browser window with the correct options
  let browserWindow = new BrowserWindow(
    await getWindowOptions(browserWindowOptionOverrides, enableKioskMode),
  );

  // open the dev server url if it's available (if the app is running in dev mode)
  if (WEBPACK_DEV_SERVER_URL) {
    installExtension(VUEJS_DEVTOOLS);
    browserWindow.loadURL(WEBPACK_DEV_SERVER_URL);
    browserWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    browserWindow.loadURL('app://./index.html');
  }

  // unassign window to drop event listeners, remove the reference
  // https://www.electronjs.org/docs/api/browser-window#event-closed
  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  // setup the auto updater, allowing this app to be updated from pushes to an S3 bucket
  // quit the app and update immediately
  // https://www.electron.build/auto-update
  if (enableAutoUpdater) {
    const { autoUpdaterChannel } = await settings.get('config');
    autoUpdater.channel = autoUpdaterChannel;
    autoUpdater.on('update-available', () => {
      autoUpdater.quitAndInstall(true, true);
    });
  }

  // enable touch events
  // https://www.electronjs.org/docs/api/command-line-switches
  if (enableTouchEvents) {
    app.commandLine.appendSwitch('touch-events', 'enabled');
  }

  // guarantee unload and before unload methods get called before actually
  // quitting by gracefully calling app.quit
  // https://www.electronjs.org/docs/api/app#appquit
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);
  app.on('window-all-closed', app.quit);
}
