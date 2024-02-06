import { BrowserWindowConstructorOptions, app } from "electron";
import { InitContext, InitPlugin } from "./init";

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
    protected readonly options: BrowserWindowConstructorOptions
  ) { }

  public async afterReady(context: InitContext): Promise<void> {
    context.browserWindowOptions = {
      ...context.browserWindowOptions,
      ...this.getDefaultWindowOptions(),
      ...this.getWindowOptionsFromConfig(context.config),
      ...this.options,
      closable: true
    };
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

  protected getWindowOptionsFromConfig({ appHeight, appWidth, backgroundColor }: Record<string, string | number | boolean>): BrowserWindowConstructorOptions {
    const options: BrowserWindowConstructorOptions = {};

    if (appHeight !== undefined && typeof appHeight === 'number') {
      options.height = appHeight;
    }
    if (appWidth !== undefined && typeof appWidth === 'number') {
      options.width = appWidth;
    }
    if (backgroundColor !== undefined && typeof backgroundColor === 'string') {
      options.backgroundColor = backgroundColor;
    }

    return options;
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
    options: BrowserWindowConstructorOptions,
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
    options: BrowserWindowConstructorOptions,
    private readonly enabled: boolean = app.isPackaged
  ) {
    super(options);
  }

  public async beforeLoad(context: InitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const browserWindow = context.browserWindow;
    if (!browserWindow) {
      context.log.error('browserWindow is undefined');
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