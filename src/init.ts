import { AssetLoaderOptions } from '@dimensional-innovations/electron-asset-loader';
import {
  app, BrowserWindow, BrowserWindowConstructorOptions, protocol,
} from 'electron';
import { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { startAutoUpdater } from './autoUpdater';
import { Extension, installDevTools } from './dev';
import { startHeartbeat } from './heartbeat';
import { createFileProtocol } from './protocol';
import { getWindowOptions } from './window';
import log from 'electron-log';

export class InitContext {
  constructor(
    public appUrl: string, 
    public settings: Record<string, string | number | boolean>, 
    public browserWindowOptions: BrowserWindowConstructorOptions, 
    public browserWindow: BrowserWindow | null,
    public log: Pick<Console, 'error' | 'warn' | 'info' | 'debug'>
  ) { }
}

export interface InitPlugin {
  beforeReady?(context: InitContext): Promise<void>;
  beforeLoad?(context: InitContext): Promise<void>;
  afterLoad?(context: InitContext): Promise<void>;
}

export interface InitOptions {
  /**
   * The url to load once the the app has been created. You can also pass an object in for the app url in order to define a
   * custom scheme to serve the app from.
   */
  appUrl: string;

  plugins?: Array<InitPlugin>;
}

export interface InitResult {
  browserWindow: BrowserWindow;
}

export async function init({
  appUrl,
  plugins = []
}: InitOptions): Promise<InitContext> {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

  const context = new InitContext(appUrl, {}, {}, null, log);
  for (const plugin of plugins) {
    if (plugin.beforeReady) {
      await plugin.beforeReady(context);
    }
  }

  await app.whenReady();

  for (const plugin of plugins) {
    if (plugin.beforeLoad) {
      await plugin.beforeLoad(context);
    }
  }

  context.browserWindow = new BrowserWindow(context.browserWindowOptions);
  context.browserWindow.on('closed', () => context.browserWindow = null);
  await context.browserWindow.loadURL(context.appUrl);

  for (const plugin of plugins) {
    if (plugin.afterLoad) {
      plugin.afterLoad(context);
    }
  }

  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);

  return context;
}

export class PrivilegedSchemes implements InitPlugin {
  constructor(private readonly schemes: Array<string>) { }

  public async beforeReady(context: InitContext): Promise<void> {
    const customSchemes = this.schemes
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }
}

export class TouchEvents implements InitPlugin {
  public async beforeLoad(context: InitContext): Promise<void> {
    // enable touch events
    // https://www.electronjs.org/docs/api/command-line-switches
    app.commandLine.appendSwitch('touch-events', 'enabled');
  }
}

export class Version implements InitPlugin {
  constructor(private readonly version?: string) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initVersion } = await import('@dimensional-innovations/vue-electron-version');
      initVersion(this.version);
    }
    catch (error) {
      context.log.error('Failed to initialize vue-electron-version');
      context.log.error(error);
    }
  }
}

export class Settings implements InitPlugin {
  constructor(private readonly config?: Record<string, string | number | boolean>) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initSettings } = await import('@dimensional-innovations/vue-electron-settings');
      context.settings = await initSettings(this.config || {});
    }
    catch (error) {
      context.log.error('Failed tp initialize vue-electron-settings');
      context.log.error(error);
    }
  }
}

export class KioskBrowserWindow implements InitPlugin {
  constructor(
    private readonly enableKioskMode: boolean, 
    private readonly options?: BrowserWindowConstructorOptions
  ) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    context.browserWindowOptions = getWindowOptions(this.options || {}, this.enableKioskMode);
  }
}

export class DevTools implements InitPlugin {
  constructor(private readonly devTools: Array<Extension> = [VUEJS3_DEVTOOLS]) { }

  public async afterLoad(context: InitContext): Promise<void> {
    if (!context.browserWindow) {
      throw new Error('Expected value for browserWindow');
    }
    await installDevTools(context.browserWindow, this.devTools);
  }
}

export class AutoUpdater implements InitPlugin {
  constructor(private readonly enabled: boolean = true) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const { autoUpdaterChannel } = context.settings;
    if (this.enabled && autoUpdaterChannel) {
      startAutoUpdater(autoUpdaterChannel as string);
    }
    else if (this.enabled) {
      context.log.warn('autoUpdaterChannel was not set in the settings. AutoUpdater was not started.');
    }
  }
}

export class Heartbeat implements InitPlugin {
  constructor(private readonly enabled: boolean = true) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const { heartbeatApiKey } = context.settings;
    if (this.enabled && heartbeatApiKey) {
      startHeartbeat(heartbeatApiKey as string); 
    }
    else if (this.enabled) {
      context.log.warn('heartbeatApiKey was set in the settings. Heartbeat was not started.');
    }
  }
}

export class StaticFileDir implements InitPlugin {
  constructor(private readonly scheme: string, private readonly dir: string) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    createFileProtocol(this.scheme, this.dir);
  }
}

export class AssetLoader implements InitPlugin {
  constructor(private readonly options?: AssetLoaderOptions) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initAssetLoader } = await import('@dimensional-innovations/electron-asset-loader');
      initAssetLoader(this.options);  
    }
    catch (error) {
      context.log.error('Failed to initial asset loader.');
      context.log.error(error);
    }
  }
}

/**
 * init({
 *  appUrl: process.env.WEBPACK_DEV_URL ? process.env.WEBPACK_DEV_URL : 'app://index.html',
 *  plugins: [
 *    new Settings(config),
 *    new TouchEvents(), 
 *    new AutoUpdater(),
 *    new Heartbeat(),
 *    new KioskBrowserWindow(),
 *    new AssetLoader(),
 *    new PrivilegedSchemes(['app']),
 *    new DevTools(),
 *    new StaticFileDir('app', __dirname),
 *    new StaticFileDir('media', join(__static, 'media'))
 *  ]
 * });
 */
