import { BeforeReadyInitContext, NonBrowserWindowInitContext, BrowserWindowInitContext } from "./InitContext";

/**
 * A plugin is used to execute logic at various stages during the init process.
 *
 * Implementations can define one or more of the optional methods to customize
 * application instance.
 */
export interface InitPlugin<T = unknown> {
  /**
   * beforeReady is executed before the `app.whenReady()` promise resolves.
   * beforeReady method must be synchronous so that all methods complete before the
   * app.whenReady promise resolves.
   *
   * @param context - The current InitContext instance.
   */
  // Here we force the return type to be false. It's unused, but it will cause a type
  // error if an implementation attempts to make the method async and return a promise.
  beforeReady?(context: BeforeReadyInitContext<T>): false;

  /**
   * afterReady is executed after the `app.whenReady()` promise resolves, but before the
   * BrowserWindow is created.
   *
   * @param context - The current InitContext instance.
   */
  afterReady?(context: NonBrowserWindowInitContext<T>): Promise<void>;

  /**
   * beforeLoad is executed after the browserWindow is created, but before the application
   * has been loaded into the window. This runs for each BrowserWindow created during init
   * process.
   *
   * @param context - The current InitContext instance.
   */
  beforeLoad?(context: BrowserWindowInitContext<T>): Promise<void>;

  /**
   * afterLoad is executed after the application has been loaded into the browserWindow.
   * This runs for each BrowserWindow created during the init process.
   *
   * @param context - The current InitContext instance.
   */
  afterLoad?(context: BrowserWindowInitContext<T>): Promise<void>;
}