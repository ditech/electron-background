import { app, BrowserWindowConstructorOptions } from 'electron';
import { InitContext, InitPlugin } from './init';

/**
 * Enables kiosk mode in the BrowserWindow when the application is packaged.
 */
export class KioskBrowserWindow implements InitPlugin {
  /**
   * @constructor
   *
   * @param options - Additional options to apply to the BrowserWindow.
   * @param enableKioskMode - Indicates if the plugin is enabled. Used to disabled kiosk mode in development. Defaults to `app.isPackaged`
   */
  constructor(
    private readonly options: BrowserWindowConstructorOptions = {},
    private readonly enableKioskMode: boolean = app.isPackaged,
  ) { }

  public async afterReady(context: InitContext): Promise<void> {
    const { appHeight, appWidth, backgroundColor } = context.config;
    context.browserWindowOptions = this.getWindowOptions({
      ...context.browserWindowOptions,
      height: appHeight && typeof appHeight === 'number'
        ? appHeight
        : context.browserWindowOptions.height,
      width: appWidth && typeof appWidth === 'number'
        ? appWidth
        : context.browserWindowOptions.width,
      backgroundColor: backgroundColor && typeof backgroundColor === 'string'
        ? backgroundColor
        : context.browserWindowOptions.backgroundColor,
      ...this.options,
    }, this.enableKioskMode);
  }

  private getWindowOptions(options: BrowserWindowConstructorOptions, enableKioskMode: boolean): BrowserWindowConstructorOptions {
    const defaultWindowOptions = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false,
      },
    };

    if (enableKioskMode) {
      return {
        ...defaultWindowOptions,
        acceptFirstMouse: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        fullscreen: true,
        kiosk: true,
        minimizable: false,
        movable: false,
        x: 0,
        y: 0,
        ...options,
        closable: true, // !!! enabling will break auto updating !!!
      };
    }

    return {
      ...defaultWindowOptions,
      ...options,
    };
  }
}

/**
 * Combines the provided window options with defaults for a BrowserWindow.
 *
 * @param options - The options to include with the default options.
 * @param enableKioskMode - If true, additional defaults will be included to support kiosk mode.
 * @returns - The options that can be passed to the BrowserWindow constructor.
 */
function getWindowOptions(options: BrowserWindowConstructorOptions, enableKioskMode: boolean): BrowserWindowConstructorOptions {
  const defaultWindowOptions = {
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  };

  if (enableKioskMode) {
    return {
      ...defaultWindowOptions,
      acceptFirstMouse: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      fullscreen: true,
      kiosk: true,
      minimizable: false,
      movable: false,
      x: 0,
      y: 0,
      ...options,
      closable: true, // !!! enabling will break auto updating !!!
    };
  }

  return {
    ...defaultWindowOptions,
    ...options,
  };
}
