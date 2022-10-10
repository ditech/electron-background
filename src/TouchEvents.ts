import { app } from 'electron';
import { InitContext, InitPlugin } from './init';

/**
 * Enables touch events in the app.
 */
export class TouchEvents implements InitPlugin {
  public async afterReady(context: InitContext): Promise<void> {
    app.commandLine.appendSwitch('touch-events', 'enabled');
  }
}
