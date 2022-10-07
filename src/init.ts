import { initAssetLoader } from '@dimensional-innovations/electron-asset-loader';
import { initSettings } from '@dimensional-innovations/vue-electron-settings';
import { initVersion } from '@dimensional-innovations/vue-electron-version';
import {
  app, BrowserWindow, BrowserWindowConstructorOptions, protocol
} from 'electron';
import { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { join } from 'path';
import { initApp } from './app';
import { startAutoUpdater } from './autoUpdater';
import { installDevTools } from './dev';
import { startHeartbeat } from './heartbeat';
import { createFileProtocol } from './protocol';
import { getWindowOptions } from './window';

/**
 * Options that define how to create and load the application.
 */
export interface InitOptions {
  /**
   * The url to load once the the app has been created. You can also pass an object in for the app url in order to define a 
   * custom scheme to serve the app from.
   */
  appUrl: { scheme: string, directory: string, indexUrl: string } | string;

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
   * The dev tools to install in the browser window. Defaults to VUEJS3_DEVTOOLS.
   */
  devTools?: Array<typeof VUEJS3_DEVTOOLS>;

  /**
   * Directories where static files are served from. Generally these directories exist in the "public" folder.
   */
  staticFileDirs?: Array<{ schema: string, dir: string }>;
}

/**
 * Initializes the application using the provided settings.
 */
export async function init({
  appUrl,
  browserWindowOptionOverrides = {},
  config = {},
  devTools = [VUEJS3_DEVTOOLS],
  enableAssetLoader = true,
  enableAutoUpdater = app.isPackaged,
  enableHeartbeat = app.isPackaged,
  enableKioskMode = app.isPackaged,
  enableTouchEvents = true,
  privilegedSchemes = [],
  staticFileDirs = [],
}: InitOptions): Promise<{ browserWindow: BrowserWindow }> {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

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

  if (!app.isPackaged) {
    await installDevTools(browserWindow, devTools);
  }
  if (typeof appUrl === 'string') {
    browserWindow.loadURL(appUrl);
  } else {
    createFileProtocol(appUrl.scheme, appUrl.directory);
    browserWindow.loadURL(appUrl.indexUrl);
  }

  if (enableAutoUpdater && autoUpdaterChannel) {
    startAutoUpdater(autoUpdaterChannel);
  }
  if (enableHeartbeat && heartbeatApiKey) {
    startHeartbeat(heartbeatApiKey);
  }

  return { browserWindow };
}
