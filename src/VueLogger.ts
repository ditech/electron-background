import { InitContext, InitPlugin } from './init';
import { Transport } from '@dimensional-innovations/vue-logger';

/**
 * Initializes the `@dimensional-innovations/vue-logger` package.
 *
 * If this plugin is included, the package must also be installed in the app.
 */
export class VueLogger implements InitPlugin {
  /**
   * @constructor
   * 
   * @param transports - The transports to register. 
   */
  constructor(
    private readonly transports: Array<Transport>
  ) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initLogger } = await import('@dimensional-innovations/vue-logger');
      initLogger(this.transports);
    }
    catch (error) {
      context.log.error('Failed to initialize vue-logger');
      context.log.error(error);
    }
  }
}