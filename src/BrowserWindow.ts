import { BrowserWindowConstructorOptions, app } from "electron";
import { BrowserWindowInitContext, InitContext, InitPlugin } from "./init";
import merge from 'lodash.merge';

/**
 * Applies default options to the browser window. If `appHeight`, `appWidth`, or `backgroundColor` are included in
 * app config, they will be added to the window options as well.
 */
export class DefaultBrowserWindow implements InitPlugin {

  /**
   * @constructor
   * 
   * @param options - Additional options to apply to the browser window.
   */
  constructor(
    protected readonly options: BrowserWindowConstructorOptions = {}
  ) { }

  public async afterReady(context: InitContext): Promise<void> {
    context.browserWindowOptions = merge({}, this.getDefaultWindowOptions(), context.browserWindowOptions, this.options, { closable: true });
  }

  protected getDefaultWindowOptions(): BrowserWindowConstructorOptions {
    return {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false
      }
    }
  }
}

/**
 * Enables kiosk mode in the BrowserWindow when the application is packaged.
 */
export class KioskBrowserWindow extends DefaultBrowserWindow {

  /**
   * @constructor
   *
   * @param options - Additional options to apply to the BrowserWindow.
   * @param enableKioskMode - Indicates if the plugin is enabled. Used to disabled kiosk mode in development. Defaults to `app.isPackaged`
   */
  constructor(
    options: BrowserWindowConstructorOptions = {},
    private readonly enabled: boolean = app.isPackaged
  ) {
    super(options);
  }

  protected getDefaultWindowOptions(): BrowserWindowConstructorOptions {
    if (!this.enabled) {
      return super.getDefaultWindowOptions();
    }

    return {
      ...super.getDefaultWindowOptions(),
      acceptFirstMouse: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      fullscreen: true,
      kiosk: true,
      minimizable: false,
      movable: false,
      x: 0,
      y: 0,
    }
  }
}

/**
 * Ensures the browser window will always be fullscreen. Generally, KioskBrowserWindow is preferred
 * over this plugin, but there are times when app cannot be in kiosk mode.
 */
export class FullScreenBrowserWindow extends DefaultBrowserWindow {

  /**
   * @constructor
   *
   * @param options - Additional options to apply to the BrowserWindow.
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin in development. Defaults to `app.isPackaged`.
   */
  constructor(
    options: BrowserWindowConstructorOptions = {},
    private readonly enabled: boolean = app.isPackaged
  ) {
    super(options);
  }

  public async beforeLoad({ browserWindow }: BrowserWindowInitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const { screen } = await import('electron');

    const resizeWindow = () => {
      browserWindow.setBounds(screen.getPrimaryDisplay().bounds);
    };
    resizeWindow();

    screen.on('display-added', resizeWindow);
    screen.on('display-metrics-changed', resizeWindow);
    screen.on('display-removed', resizeWindow);
  }

  protected getDefaultWindowOptions(): BrowserWindowConstructorOptions {
    if (!this.enabled) {
      return super.getDefaultWindowOptions();
    }

    return {
      ...super.getDefaultWindowOptions(),
      alwaysOnTop: true,
      resizable: false,
      movable: false,
      frame: false,
    }
  }
}