import { app, screen } from 'electron';
import { AppBrowserWindow, AppBrowserWindowConstructorOptions } from "./AppBrowserWindow";
import { getTargetDisplay } from './util';

export interface FullScreenBrowserWindowConstructorOptions extends AppBrowserWindowConstructorOptions {
  /**
   * The screen the window should occupy. Use 'primary' for the primary display,
   * 'secondary' for the first non-primary display, or a number for the display
   * at that index in the list returned by screen.getAllDisplays(). Defaults to 'primary'.
   */
  screen?: 'primary' | 'secondary' | number;
}

export class FullScreenBrowserWindow extends AppBrowserWindow {

  constructor({ screen: target = 'primary', ...options }: FullScreenBrowserWindowConstructorOptions, enabled = app.isPackaged) {
    super({
      ...(enabled ? {
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        frame: false,
      } : {}),
      ...options,
    });

    if (enabled) {
      this.on('ready-to-show', async () => {
        const resizeWindow = () => {
          const targetDisplay = getTargetDisplay(target);
          this.setBounds(targetDisplay.bounds);
        };
        
        resizeWindow();

        screen.on('display-added', resizeWindow);
        screen.on('display-metrics-changed', resizeWindow);
        screen.on('display-removed', resizeWindow);
      });
    }
  }
}
