import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

/**
 * Options used to create a new Application Window. 
 * 
 * AppBrowserWindow extends Electron's BrowserWindow and so any options for the BrowserWindow
 * are accepted here. For more info see: https://electronjs.org/docs/api/structures/browser-window-options
 */
export interface AppBrowserWindowConstructorOptions extends BrowserWindowConstructorOptions {
  /**
   * The url to the application to load. This loaded by the AppBrowserWindow whenever loadApp
   * is called.
   */
  appUrl: string;
}

/**
 * Extends Electron's BrowserWindow to add support for loading a single app through a url
 * provided when the window is constructed.
 */
export class AppBrowserWindow extends BrowserWindow {

  private readonly appUrl: string;

  constructor(options: AppBrowserWindowConstructorOptions) {
    super(options);

    this.appUrl = options.appUrl;
  }

  /**
   * Loads the predefined app.
   * 
   * @returns - A promise that is resolved as the app is loaded.
   */
  public async loadApp(): Promise<void> {
    return await this.loadURL(this.appUrl);
  }
}