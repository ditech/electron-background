import settings from 'electron-settings';
import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';
import electronLog from 'electron-log';
import { basename, dirname, join, normalize } from 'path';

/* global __static */ 

// https://github.com/webpack/webpack/issues/5392
// eslint-disable-next-line prefer-destructuring
const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;

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
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  };

  if (enableKioskMode) {
    return {
      ...windowOptions,
      acceptFirstMouse: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      fullscreen: true,
      kiosk: true,
      minimizable: false,
      movable: false,
      x: 0,
      y: 0,
      ...browserWindowOptionOverrides,
      closable: true, // !!! enabling will break auto updating !!!
    };
  }

  return {
    ...windowOptions,
    ...browserWindowOptionOverrides,
  };
}

function createFileProtocol(scheme, sourceDirectory) {
  protocol.registerFileProtocol(scheme, (request, respond) => {
    const requestPath = request.url.replace(`${scheme}://`, '');
    const requestDir = dirname(requestPath);
    const requestFile = basename(requestPath);
    const path = normalize(join(sourceDirectory, requestDir, requestFile));
    respond({ path });
  });
}

// eslint-disable-next-line import/prefer-default-export
export async function init({
  config = {},
  enableTouchEvents = true,
  enableAutoUpdater = true,
  enableKioskMode = false,
  registerSchemesAsPrivileged = true,
  browserWindowOptionOverrides = {},
  devTools = [VUEJS_DEVTOOLS],
  staticFileDirs = ['media']
}) {
  // bypasses content security policy for resources
  // https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
  if (registerSchemesAsPrivileged) {
    const customSchemes = ['app']
      .concat(staticFileDirs)
      .map(scheme => ({ 
        scheme,  
        privileges: { secure: true, standard: true, supportFetchAPI: true }
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }

  await app.whenReady();

  // check to see if any previous config settings have been set if not, set them
  if (!await settings.has('config')) {
    await settings.set('config', config);
  }

  // create the browser window with the correct options
  let browserWindow = new BrowserWindow(
    await getWindowOptions(browserWindowOptionOverrides, enableKioskMode),
  );

  // Create the schemas to serve static files from the media folder in public.
  for (let i = 0; i < staticFileDirs.length; i + 1) {
    const dir = staticFileDirs[i];
    createFileProtocol(dir, join(__static, dir));
  }

  // open the dev server url if it's available (if the app is running in dev mode)
  if (WEBPACK_DEV_SERVER_URL && !!devTools) {
    // commenting this out for devtools temp fix
    // await installExtension(devTools);
    try {
      await installExtension(devTools);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  if (WEBPACK_DEV_SERVER_URL) {
    await browserWindow.loadURL(WEBPACK_DEV_SERVER_URL);
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
  // quit the app and update immediately update
  // https://www.electron.build/auto-update
  if (enableAutoUpdater) {
    const threeMinutes = 180000;

    const { autoUpdaterChannel } = await settings.get('config');
    autoUpdater.channel = autoUpdaterChannel;
    autoUpdater.autoDownload = true;
    autoUpdater.logger = electronLog;

    autoUpdater.on('update-downloaded', () => {
      electronLog.info('Updated app downloaded... restarting');
      // https://www.electron.build/auto-update#module_electron-updater.AppUpdater+quitAndInstall
      autoUpdater.quitAndInstall(true, true);
    });

    autoUpdater.on('update-not-available', () => {
      electronLog.info('No update available. Will try again soon.');
    });

    // check for updates now and then every 3 minutes
    autoUpdater.checkForUpdates();
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, threeMinutes);
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

  return { browserWindow };
}
