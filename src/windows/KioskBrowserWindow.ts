import { AppBrowserWindow, AppBrowserWindowConstructorOptions } from "./AppBrowserWindow";

export class KioskBrowserWindow extends AppBrowserWindow {
  constructor(options: AppBrowserWindowConstructorOptions) {
    super({
      acceptFirstMouse: true,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      fullscreen: true,
      kiosk: true,
      minimizable: false,
      movable: false,
      x: 0,
      y: 0,
      ...options
    });
  }
}