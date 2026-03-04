import { app } from 'electron';
import log from 'electron-log';
import { BrowserWindowInitContext, InitContext, NonBrowserWindowInitContext } from './InitContext';
import { InitPlugin } from './InitPlugin';
import { AppBrowserWindow } from './windows/AppBrowserWindow';

export interface InitOptions<T> {
  config: () => T | Promise<T>;

  /**
   * The list of plugins to load with the application.
   */
  plugins?: Array<InitPlugin<T>>;

  /**
   * The windows to create during the init process.
   */
  windows: Array<(context: NonBrowserWindowInitContext<T>) => AppBrowserWindow>;
}

/**
 * Initializes the application, creating a browser window, and loads the provided app url.
 *
 * @param options - Options used to define how the application is initialized.
 * @returns - The final state of the init context, including the created browser window for additional setup.
 */
export async function init<T>({
  config,
  windows,
  plugins = [],
}: InitOptions<T>): Promise<void> {
  if (windows.length === 0) {
    throw new Error('At least 1 window must be defined.');
  } 

  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);

  let context = new InitContext<T>(log);
  for (const plugin of plugins) {
    if (plugin.beforeReady) {
      try {
        plugin.beforeReady(context);
      } catch (err) {
        context.log.error(`[init] Plugin "${getPluginName(plugin)}" threw during beforeReady:`, err);
      }
    }
  }

  await app.whenReady();

  context = new InitContext<T>(log, await config());
  await runPluginPhase(plugins, 'afterReady', context);

  for (const windowFactory of windows) {
    const window = windowFactory(context as NonBrowserWindowInitContext<T>);
    const windowContext = new InitContext(context.log, context.config, window) as BrowserWindowInitContext<T>;

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
