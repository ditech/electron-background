import { app } from 'electron';
import { AppBrowserWindow, AppBrowserWindowConstructorOptions } from "./AppBrowserWindow";

export class FullScreenBrowserWindow extends AppBrowserWindow {
  
  constructor(options: AppBrowserWindowConstructorOptions) {
    super({
      alwaysOnTop: true,
      resizable: false,
      movable: false,
      frame: false,
      ...options,
    });

    if (app.isPackaged) {
      this.on('ready-to-show', async () => {
        const { screen } = await import('electron');

        const resizeWindow = () => {
          this.setBounds(screen.getPrimaryDisplay().bounds);
        };
        resizeWindow();

        screen.on('display-added', resizeWindow);
        screen.on('display-metrics-changed', resizeWindow);
        screen.on('display-removed', resizeWindow);
      });
    }
  }
}