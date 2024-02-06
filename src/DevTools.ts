import { app } from 'electron';
import install, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { InitContext, InitPlugin } from './init';

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

  public async beforeLoad(context: InitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await install(this.devTools);
    } catch (error) {
      console.error(`Failed to install dev tools: ${this.devTools.join(',')}`);
      console.error(error);
    }

    if (context.browserWindow) {
      const browserWindow = context.browserWindow;
      browserWindow.on('ready-to-show', () => browserWindow.webContents.openDevTools());
    }
  }
}
