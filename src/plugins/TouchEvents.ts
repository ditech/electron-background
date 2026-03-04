import { app } from 'electron';
import { InitPlugin } from '../init';

/**
 * Enables touch events in the app.
 */
export class TouchEvents implements InitPlugin {
  public beforeReady(): false {
    app.commandLine.appendSwitch('touch-events', 'enabled');
    return false;
  }
}
