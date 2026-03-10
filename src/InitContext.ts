import { AppBrowserWindow } from "./windows/AppBrowserWindow";

/**
 * The context object passed to each plugin during the init process.
 */
export class InitContext<T = unknown> {
  constructor(
    /**
     * The log instance. This should be used over `console` in plugin implementations.
     */
    public log: Pick<Console, 'error' | 'warn' | 'info' | 'debug'>,

    public config?: T,

    /**
     * The browser window that the app is loaded into. This is available in the context
     * in the `beforeLoad` and `afterLoad` methods.
     */
  public browserWindow?: AppBrowserWindow,
  ) { }
}

/**
 * Represents the InitContext during the beforeReady phase.
 */
export type BeforeReadyInitContext<T> = Omit<InitContext<T>, 'config' | 'browserWindow'>;

/**
 * Represents the InitContext before the BrowserWindow has been set. Used in the
 * "beforeReady" and "afterReady" methods.
 */
export type NonBrowserWindowInitContext<T> = Omit<InitContext<T>, 'config' | 'browserWindow'> & Required<Pick<InitContext<T>, 'config'>>;

/**
 * Represents the InitContext after the BrowserWindow has been set. Used in the 
 * "beforeLoad" and "afterLoad" methods.
 */
export type BrowserWindowInitContext<T> = Omit<InitContext<T>, 'config' | 'browserWindow'> & Required<Pick<InitContext<T>, 'config' | 'browserWindow'>>;