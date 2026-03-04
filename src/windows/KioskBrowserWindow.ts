import { app } from 'electron';
import { AppBrowserWindow, AppBrowserWindowConstructorOptions } from "./AppBrowserWindow";
import { getTargetDisplay } from './util';

export interface KioskBrowserWindowConstructorOptions extends AppBrowserWindowConstructorOptions {
  /**
   * The screen the window should occupy. Use 'primary' for the primary display,
   * 'secondary' for the first non-primary display, or a number for the display
   * at that index in the list returned by screen.getAllDisplays(). Defaults to 'primary'.
   */
  screen?: 'primary' | 'secondary' | number;
}

/**
 * Enables kiosk mode in the BrowserWindow when the application is packaged.
 */
export class KioskBrowserWindow extends AppBrowserWindow {
  constructor({ screen: target = 'primary', ...options }: KioskBrowserWindowConstructorOptions, enabled = app.isPackaged) {
    super({
      ...(enabled ? {
        acceptFirstMouse: true,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        fullscreen: true,
        kiosk: true,
        minimizable: false,
        movable: false,
        ...getTargetDisplay(target).bounds,
      } : {}),
      ...options,
    });
  }
}
