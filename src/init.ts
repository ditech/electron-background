import { initAssetLoader } from '@dimensional-innovations/electron-asset-loader';
import { initSettings } from '@dimensional-innovations/vue-electron-settings';
import { initVersion } from '@dimensional-innovations/vue-electron-version';
import {
  app, BrowserWindow, BrowserWindowConstructorOptions, protocol,
} from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { initApp } from './app';
import { startAutoUpdater } from './autoUpdater';
import { startHeartbeat } from './heartbeat';
import { createFileProtocol } from './protocol';
import { getWindowOptions } from './window';

/**
 * Options that define how to create and load the application.
 */
export interface InitOptions {
  /**
   * The url to load once the the app has been created. By default this is "app://index.html" when the
   * app is packaged and the WEBPACK_DEV_SERVER_URL environment variable otherwise.
   */
  appUrl?: string;

  /**
   * Application config values. These are managed through the @dimensional-innovations/vue-electron-settings package.
   */
  config?: any;

  /**
   * Indicates if the application should support touch events. Defaults to true.
   */
  enableTouchEvents?: boolean;

  /**
   * Indicates if the application should automatically check for and install updates. Defaults to true when the app is packaged.
   *
   * If this is enabled, "autoUpdaterChannel" must also be set in the app config.
   */
  enableAutoUpdater?: boolean;

  /**
   * Indicates if the application should start a "heartbeat" for monitoring. Defaults to true when the app is packaged.
   *
   * If this is enabled, "heartbeatApiKey" must also be set in the app config.
   */
  enableHeartbeat?: boolean;

  /**
   * Indicates if the app should run kiosk mode. Defaults to true when the app is packaged.
   */
  enableKioskMode?: boolean;

  /**
   * Indicates if the @dimensional-innovation/electron-asset-loader package should be initialized. Defaults to true.
   */
  enableAssetLoader?: boolean;

  /**
   * The list of schemes that should be be considered privileged. Defaults to "['app']"
   */
  privilegedSchemes?: Array<string>;

  /**
   * Additional options used to customize the browser window.
   */
  browserWindowOptionOverrides?: Partial<BrowserWindowConstructorOptions>;

  /**
   * The dev tools to install in the browser window. Defaults to VUEJS_DEVTOOLS.
   */
  devTools?: Array<typeof VUEJS_DEVTOOLS>;

  /**
   *
   */
  staticFileDirs?: Array<{ schema: string, dir: string }>;
}

export async function init({
  appUrl = process.env.WEBPACK_DEV_SERVER_URL ? process.env.WEBPACK_DEV_SERVER_URL : 'app://index.html',
  browserWindowOptionOverrides = {},
  config = {},
  devTools = [VUEJS_DEVTOOLS],
  enableAssetLoader = true,
  enableAutoUpdater = app.isPackaged,
  enableHeartbeat = app.isPackaged,
  enableKioskMode = app.isPackaged,
  enableTouchEvents = true,
  privilegedSchemes = ['app'],
  staticFileDirs = [
    { schema: 'app', dir: __dirname },
  ],
}: InitOptions): Promise<{ browserWindow: BrowserWindow }> {
  // bypasses content security policy for resources
  // https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
  if (privilegedSchemes) {
    const customSchemes = privilegedSchemes
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }

  await app.whenReady();

  initApp({ enableTouchEvents });
  initVersion();
  const {
    autoUpdaterChannel, heartbeatApiKey, appHeight, appWidth, backgroundColor,
  } = await initSettings(config);

  if (enableAssetLoader) {
    initAssetLoader();
  }

  // Create the schemas to serve static files from the media folder in public.
  for (const { schema, dir } of staticFileDirs) {
    createFileProtocol(schema, dir);
  }

  // create the browser window with the correct options
  let browserWindow: BrowserWindow | null = new BrowserWindow(getWindowOptions({
    height: appHeight,
    width: appWidth,
    backgroundColor,
    ...browserWindowOptionOverrides,
  }, enableKioskMode));
  // unassign window to drop event listeners, remove the reference
  // https://www.electronjs.org/docs/api/browser-window#event-closed
  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  // open the dev server url if it's available (if the app is running in dev mode)
  if (!app.isPackaged && !!devTools) {
    // commenting this out for devtools temp fix
    // await installExtension(devTools);
    try {
      await installExtension(devTools);
    } catch (e: any) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  if (!app.isPackaged) {
    browserWindow.webContents.openDevTools();
  }

  browserWindow.loadURL(appUrl);

  if (enableAutoUpdater && autoUpdaterChannel) {
    startAutoUpdater(autoUpdaterChannel);
  }
  if (enableHeartbeat && heartbeatApiKey) {
    startHeartbeat(heartbeatApiKey);
  }

  return { browserWindow };
}
