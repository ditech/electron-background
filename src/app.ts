import { app } from 'electron';

export interface InitAppOptions {
  enableTouchEvents?: boolean;
}

export function initApp({
  enableTouchEvents = true
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