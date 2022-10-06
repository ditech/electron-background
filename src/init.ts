import { initSettings } from '@dimensional-innovations/vue-electron-settings';
import { app, BrowserWindow, BrowserWindowConstructorOptions, protocol } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { join } from 'path';
import { initApp } from './app';
import { startAutoUpdater } from './autoUpdater';
import { startHeartbeat } from './heartbeat';
import { createFileProtocol } from './protocol';
import { getWindowOptions } from './window';

// eslint-disable-next-line no-underscore-dangle
declare const __static: string;

// https://github.com/webpack/webpack/issues/5392
// eslint-disable-next-line prefer-destructuring
const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;

export interface InitOptions {
  config?: any;
  enableTouchEvents?: boolean;
  enableAutoUpdater?: boolean;
  enableHeartbeat?: boolean;
  enableKioskMode?: boolean;
  registerSchemesAsPrivileged?: boolean;
  browserWindowOptionOverrides?: Partial<BrowserWindowConstructorOptions>;
  devTools?: Array<typeof VUEJS_DEVTOOLS>;
  staticFileDirs?: Array<string>;
} 

export async function init({
  config = {},
  enableTouchEvents = true,
  enableAutoUpdater = true,
  enableHeartbeat = true,
  enableKioskMode = false,
  registerSchemesAsPrivileged = true,
  browserWindowOptionOverrides = {},
  devTools = [VUEJS_DEVTOOLS],
  staticFileDirs = ['media'],
}: InitOptions) {
  // bypasses content security policy for resources
  // https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
  if (registerSchemesAsPrivileged) {
    const customSchemes = ['app']
      .concat(staticFileDirs)
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }

  await app.whenReady();

  initApp();
  const { autoUpdaterChannel, heartbeatApiKey, appHeight, appWidth, backgroundColor } = await initSettings(config);
  
  // Create the schemas to serve static files from the media folder in public.
  for (let i = 0; i < staticFileDirs.length; i++) {
    const dir = staticFileDirs[i];
    createFileProtocol(dir, join(__static, dir));
  }

  // create the browser window with the correct options
  let browserWindow: BrowserWindow | null = new BrowserWindow(getWindowOptions({
    height: appHeight,
    width: appWidth,
    backgroundColor: backgroundColor,
    ...browserWindowOptionOverrides
  }, enableKioskMode));
  // unassign window to drop event listeners, remove the reference
  // https://www.electronjs.org/docs/api/browser-window#event-closed
  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  // open the dev server url if it's available (if the app is running in dev mode)
  if (WEBPACK_DEV_SERVER_URL && !!devTools) {
    // commenting this out for devtools temp fix
    // await installExtension(devTools);
    try {
      await installExtension(devTools);
    } catch (e: any) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  if (WEBPACK_DEV_SERVER_URL) {
    await browserWindow.loadURL(WEBPACK_DEV_SERVER_URL);
    browserWindow.webContents.openDevTools();
  } else {
    createFileProtocol('app', __dirname);
    browserWindow.loadURL('app://./index.html');
  }

  // setup the auto updater, allowing this app to be updated from pushes to an S3 bucket
  // quit the app and update immediately update
  // https://www.electron.build/auto-update
  if (enableAutoUpdater) {
    startAutoUpdater(autoUpdaterChannel);
  }
  
  if (enableHeartbeat && heartbeatApiKey) {
    startHeartbeat(heartbeatApiKey);
  }

  return { browserWindow };
}
