
/** Utility methods for creating application windows. */

import { BrowserWindowConstructorOptions } from 'electron';

/**
 * Combines the provided window options with defaults for the a BrowserWindow.
 * 
 * @param options - The options to include with the default options.
 * @param enableKioskMode - If true, additional defaults will be included to support kiosk mode.
 * @returns - The options that can be passed to the BrowserWindow constructor.
 */
export function getWindowOptions(options: Partial<BrowserWindowConstructorOptions>, enableKioskMode: boolean): BrowserWindowConstructorOptions {
  const defaultWindowOptions = {
    width: 1920,
    height: 1080,
    backgroundColor: '#000',
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
    }
  }

  return {
    ...defaultWindowOptions,
    ...options
  }
}