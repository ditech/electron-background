import { app, BrowserWindowConstructorOptions } from "electron";
import { InitContext, InitPlugin } from "./init";

/**
 * Ensures the browser window will always be fullscreen. Generally, KioskBrowserWindow is preferred
 * over this plugin, but there are times when app cannot be in kiosk mode.
 */
export class FullScreenBrowserWindow implements InitPlugin {

  /**
   * @constructor
   * 
   * @param options - Additional options to apply to the BrowserWindow.
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin in development. Defaults to `app.isPackaged`.
   */
  constructor(
    private readonly options: BrowserWindowConstructorOptions,
    private readonly enabled: boolean = app.isPackaged
  ) { }

  public async afterReady(context: InitContext): Promise<void> {
    context.browserWindowOptions = this.getWindowOptions(this.options, this.enabled);
  }

  public async beforeLoad(context: InitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const { screen } = await import('electron');
    const resizeWindow = () => {
      if (context.browserWindow) {
        context.browserWindow.setBounds(screen.getPrimaryDisplay().bounds);
      }
    };
    screen.on('display-added', resizeWindow);
    screen.on('display-metrics-changed', resizeWindow);
    screen.on('display-removed', resizeWindow);    
  }

  private getWindowOptions(options: BrowserWindowConstructorOptions, fullscreen: boolean): BrowserWindowConstructorOptions {
    const defaultWindowOptions = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false,
      },
    };

    if (fullscreen) {
      return {
        ...defaultWindowOptions,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        frame: false,
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