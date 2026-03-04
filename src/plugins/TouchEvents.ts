import { app } from 'electron';
import { InitPlugin } from '../InitPlugin';

/**
 * Enables touch events in the app.
 */
export class TouchEvents implements InitPlugin {
  public beforeReady(): false {
    app.commandLine.appendSwitch('touch-events', 'enabled');
    return false;
  }
}
