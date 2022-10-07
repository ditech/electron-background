import { BrowserWindow } from 'electron';
import install, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';

export type Extension = string | typeof VUEJS_DEVTOOLS;

/**
 * Attempts to install the provided dev tools and opens the dev tools panel in the window.
 *
 * @param window - The window to open the dev tools in.
 * @param devTools - The extensions to install.
 */
export async function installDevTools(window: BrowserWindow, devTools: Array<Extension> = [VUEJS_DEVTOOLS]): Promise<void> {
  try {
    await install(devTools);
  } catch (error) {
    console.error(`Failed to install dev tools: ${devTools.join(',')}`);
    console.error(error);
  }

  window.webContents.openDevTools();
}
