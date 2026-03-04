import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export interface AppBrowserWindowConstructorOptions extends BrowserWindowConstructorOptions {
  appUrl: string;
}

export class AppBrowserWindow extends BrowserWindow {

  private readonly appUrl: string;

  constructor(options: AppBrowserWindowConstructorOptions) {
    super(options);

    this.appUrl = options.appUrl;
  }

  public loadApp() {
    return this.loadURL(this.appUrl);
  }
}