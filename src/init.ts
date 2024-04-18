import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import log from 'electron-log';

/**
 * The context object passed to each plugin during the init process.
 */
export class InitContext {
  constructor(
    /**
     * The url used to load the application.
     */
    public appUrl: string,

    /**
     * Application config used by the app and/or plugins.
     */
    public config: Record<string, string | number | boolean>,

    /**
     * Options used to create the BrowserWindow. These can be modified in `beforeReady` or
     * `beforeLoad` methods to change the created BrowserWindow.
     */
    public browserWindowOptions: BrowserWindowConstructorOptions,

    /**
     * The log instance. This should be used over `console` in plugin implementations.
     */
    public log: Pick<Console, 'error' | 'warn' | 'info' | 'debug'>,
  ) { }

  /**
     * The main browser window that the app is loaded into. This is available in the context
     * in the `beforeLoad` and `afterLoad` method.
     */
  public browserWindow?: BrowserWindow;
}

/**
 * Represents the InitContext before the BrowserWindow has been set. Used in the
 * "beforeReady" and "afterReady" methods.
 */
export type NonBrowserWindowInitContext = Omit<InitContext, 'browserWindow'>;

/**
 * Represents the InitContext after the BrowserWindow has been set. Used in the 
 * "beforeLoad" and "afterLoad" methods.
 */
export type BrowserWindowInitContext = Omit<InitContext, 'browserWindow'> & Required<Pick<InitContext, 'browserWindow'>>;

/**
 * A plugin is used to execute logic at various stages during the init process.
 *
 * Implementations can define one or more of the optional methods to customize
 * application instance.
 */
export interface InitPlugin {
  /**
   * beforeReady is executed before the `app.whenReady()` promise resolves.
   *
   * @param context - The current InitContext instance.
   */
  beforeReady?(context: NonBrowserWindowInitContext): Promise<void>;

  /**
   * afterReady is executed after the `app.whenReady()` promise resolves, but before the
   * BrowserWindow is created.
   *
   * @param context - The current InitContext instance.
   */
  afterReady?(context: NonBrowserWindowInitContext): Promise<void>;

  /**
   * beforeLoad is executed after the browserWindow is created, but before the application
   * has been loaded into the window.
   *
   * @param context - The current InitContext instance.
   */
  beforeLoad?(context: BrowserWindowInitContext): Promise<void>;

  /**
   * afterLoad is executed after the application has been loaded into the browserWindow.
   *
   * @param context - The current InitContext instance.
   */
  afterLoad?(context: BrowserWindowInitContext): Promise<void>;
}

export interface InitOptions {
  /**
   * The url to load once the the app has been created.
   */
  appUrl: string;

  /**
   * The default browser window options
   */
  browserWindowOptions?: BrowserWindowConstructorOptions;

  /**
   * The default application settings.
   */
  config?: Record<string, string | number | boolean>;

  /**
   * The list of plugins to load with the application.
   */
  plugins?: Array<InitPlugin>;
}

/**
 * Initializes the application, creating a browser window, and loads the provided app url.
 *
 * @param options - Options used to define how the application is initialized.
 * @returns - The final state of the init context, including the created browser window for additional setup.
 */
export async function init({
  appUrl,
  browserWindowOptions = { height: 1920, width: 1080, backgroundColor: '#000' },
  config = {},
  plugins = [],
}: InitOptions): Promise<InitContext> {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);

  const context = new InitContext(appUrl, config, browserWindowOptions, log);

  for (const plugin of plugins) {
    if (plugin.beforeReady) {
      await plugin.beforeReady(context);
    }
  }

  await app.whenReady();

  for (const plugin of plugins) {
    if (plugin.afterReady) {
      await plugin.afterReady(context);
    }
  }

  context.browserWindow = new BrowserWindow(context.browserWindowOptions);

  for (const plugin of plugins) {
    if (plugin.beforeLoad) {
      await plugin.beforeLoad(context as BrowserWindowInitContext);
    }
  }

  await context.browserWindow.loadURL(context.appUrl);

  for (const plugin of plugins) {
    if (plugin.afterLoad) {
      await plugin.afterLoad(context as BrowserWindowInitContext);
    }
  }

  context.browserWindow.on('closed', () => context.browserWindow = undefined);

  return context;
}
