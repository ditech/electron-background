import { app } from 'electron';

/**
 * Options used to initial the application instance.
 */
export interface InitAppOptions {
  /**
   * Indicates if touch events should be supported in the application. Defaults to true.
   */
  enableTouchEvents?: boolean;
}

/**
 * Configures common settings in the application instance. This should be called after
 * app.whenReady() has resolved.
 */
export function initApp({
  enableTouchEvents = true,
}: InitAppOptions = {}): void {
  // enable touch events
  // https://www.electronjs.org/docs/api/command-line-switches
  if (enableTouchEvents) {
    app.commandLine.appendSwitch('touch-events', 'enabled');
  }

  app.on('window-all-closed', app.quit);
  process.on('message', (data) => {
    if (data === 'graceful-exit') app.quit();
  });
  process.on('SIGTERM', app.quit);
}
