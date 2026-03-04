import { app } from 'electron';
import { InitContext, InitPlugin } from '../init';

/**
 * Enforces that only a single instance of the app can run at the same time.
 * If a second instance of the is opened, the second instance is closed and
 * the first instance is brought back into focus.
 */
export class SingleInstance implements InitPlugin {
  public beforeReady(): false {
    if(!app.requestSingleInstanceLock()) {
      app.quit();
      process.exit(0);
    }
    return false;
  }

  public async afterReady(context: InitContext): Promise<void> {
    app.on('second-instance', () => {
      if (!context.browserWindow) return;

      if (context.browserWindow.isMinimized()) {
        context.browserWindow.restore();
      }
      else {
        context.browserWindow.focus();
      }
    });
  }
}