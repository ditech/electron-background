import { app } from 'electron';
import install, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { BrowserWindowInitContext, InitPlugin } from './init';

export type Extension = string | typeof VUEJS3_DEVTOOLS;

/**
 * Installs dev tools extensions and opens the devTools panel.
 */
export class DevTools implements InitPlugin {
  /**
   * @constructor
   * 
   * @param devTools - The extensions to install.
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin when the app is packaged. Defaults to `!app.isPackaged`.
   */
  constructor(
    private readonly devTools: Array<Extension>, 
    private readonly enabled: boolean = !app.isPackaged,
  ) { }

  public async beforeLoad({ browserWindow }: BrowserWindowInitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    browserWindow.on('ready-to-show', () => browserWindow.webContents.openDevTools());

    try {
      await install(this.devTools);
    } catch (error) {
      console.error(`Failed to install dev tools: ${this.devTools.join(',')}`);
      console.error(error);
    }
  }
}
