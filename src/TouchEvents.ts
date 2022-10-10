import { app } from 'electron';
import { InitPlugin } from './init';

/**
 * Enables touch events in the app.
 */
export class TouchEvents implements InitPlugin {
  public async beforeLoad(): Promise<void> {
    app.commandLine.appendSwitch('touch-events', 'enabled');
  }
}
