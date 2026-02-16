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
   * The list of plugins to load with the application.
   */
  plugins?: Array<InitPlugin>;
}

function getPluginName(plugin: InitPlugin): string {
  return plugin.constructor?.name || 'UnknownPlugin';
}

async function runPluginPhase<T>(
  plugins: Array<InitPlugin>,
  phase: keyof InitPlugin,
  context: T,
  logger: Pick<Console, 'error' | 'warn' | 'info' | 'debug'>,
): Promise<void> {
  for (const plugin of plugins) {
    const method = plugin[phase];
    if (method) {
      try {
        await (method as (ctx: T) => Promise<void>).call(plugin, context);
      } catch (err) {
        logger.error(`[init] Plugin "${getPluginName(plugin)}" threw during ${phase}:`, err);
      }
    }
  }
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
  plugins = [],
}: InitOptions): Promise<InitContext> {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);

  const context = new InitContext(appUrl, browserWindowOptions, log);

  await runPluginPhase(plugins, 'beforeReady', context, log);

  await app.whenReady();

  await runPluginPhase(plugins, 'afterReady', context, log);

  context.browserWindow = new BrowserWindow(context.browserWindowOptions);

  await runPluginPhase(plugins, 'beforeLoad', context as BrowserWindowInitContext, log);

  try {
    await context.browserWindow.loadURL(context.appUrl);
  } catch (err) {
    log.error('[init] Failed to load app URL:', err);
  }

  if (context.browserWindow && !context.browserWindow.isDestroyed() && !context.browserWindow.isVisible()) {
    context.browserWindow.show();
  }

  await runPluginPhase(plugins, 'afterLoad', context as BrowserWindowInitContext, log);

  context.browserWindow.on('closed', () => context.browserWindow = undefined);

  return context;
}
