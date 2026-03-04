import { app } from 'electron';
import log from 'electron-log';
import { AppBrowserWindow, AppBrowserWindowConstructorOptions } from './windows/AppBrowserWindow';

/**
 * The context object passed to each plugin during the init process.
 */
export class InitContext {
  constructor(
    /**
     * The log instance. This should be used over `console` in plugin implementations.
     */
    public log: Pick<Console, 'error' | 'warn' | 'info' | 'debug'>,

    /**
     * The browser window that the app is loaded into. This is available in the context
     * in the `beforeLoad` and `afterLoad` methods.
     */
  public browserWindow?: AppBrowserWindow,
  ) { }
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
   * has been loaded into the window. This runs for each BrowserWindow created during init
   * process.
   *
   * @param context - The current InitContext instance.
   */
  beforeLoad?(context: BrowserWindowInitContext): Promise<void>;

  /**
   * afterLoad is executed after the application has been loaded into the browserWindow.
   * This runs for each BrowserWindow created during the init process.
   *
   * @param context - The current InitContext instance.
   */
  afterLoad?(context: BrowserWindowInitContext): Promise<void>;
}

export interface InitOptions {
  /**
   * The windows to create during the init process.
   */
  windows: Array<[{ new (options: AppBrowserWindowConstructorOptions): AppBrowserWindow }, AppBrowserWindowConstructorOptions]>;

  /**
   * The list of plugins to load with the application.
   */
  plugins?: Array<InitPlugin>;
}

function getPluginName(plugin: InitPlugin): string {
  return plugin.constructor?.name || 'UnknownPlugin';
}

async function runPluginPhase<T extends InitContext>(
  plugins: Array<InitPlugin>,
  phase: keyof InitPlugin,
  context: T,
): Promise<void> {
  for (const plugin of plugins) {
    const method = plugin[phase];
    if (method) {
      try {
        await (method as (ctx: T) => Promise<void>).call(plugin, context);
      } catch (err) {
        context.log.error(`[init] Plugin "${getPluginName(plugin)}" threw during ${phase}:`, err);
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
  windows,
  plugins = [],
}: InitOptions): Promise<void> {
  if (windows.length === 0) {
    throw new Error('At least 1 window must be defined.');
  } 

  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);

  const context = new InitContext(log);

  await runPluginPhase(plugins, 'beforeReady', context);

  await app.whenReady();

  await runPluginPhase(plugins, 'afterReady', context);

  for (const [WindowClass, options] of windows) {
    const window = new WindowClass(options);
    const windowContext = new InitContext(context.log, window) as BrowserWindowInitContext;

    await runPluginPhase(plugins, 'beforeLoad', windowContext);

    try {
      await windowContext.browserWindow.loadApp();
    }
    catch (err) {
      log.error('[init] Failed to load app URL:', err);
    }

    await runPluginPhase(plugins, 'afterLoad', windowContext);
  }
}
