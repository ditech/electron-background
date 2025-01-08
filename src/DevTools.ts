import { app } from 'electron';
import { BACKBONE_DEBUGGER, EMBER_INSPECTOR, ExtensionReference, installExtension, JQUERY_DEBUGGER, MOBX_DEVTOOLS, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS, VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { BrowserWindowInitContext, InitPlugin } from './init';

// Support backwards compatibility
export type Extension = ExtensionReference;

export const DevToolExtensions = {
  EMBER_INSPECTOR,
  REACT_DEVELOPER_TOOLS,
  BACKBONE_DEBUGGER,
  JQUERY_DEBUGGER,
  VUEJS_DEVTOOLS,
  REDUX_DEVTOOLS,
  MOBX_DEVTOOLS,
} as const;

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
    private readonly devTools: Array<ExtensionReference>, 
    private readonly enabled: boolean = !app.isPackaged,
  ) { }

  public async beforeLoad({ browserWindow }: BrowserWindowInitContext): Promise<void> {
    if (!this.enabled) {
      return;
    }

    browserWindow.on('ready-to-show', () => browserWindow.webContents.openDevTools());

    try {
      await installExtension(this.devTools);
    } catch (error) {
      console.error(`Failed to install dev tools: ${this.devTools.join(',')}`);
      console.error(error);
    }
  }
}
