import { InitContext, InitPlugin } from './init';

/**
 * Initializes the `@dimensional-innovations/vue-electron-settings` package, and updates the
 * settings on the InitContext to match.
 *
 * Note that if this plugin is included, the package must be installed in the application as well.
 */
export class VueElectronSettings implements InitPlugin {
  public async afterReady(context: InitContext): Promise<void> {
    try {
      const { initSettings } = await import('@dimensional-innovations/vue-electron-settings');
      context.config = await initSettings(context.config);
    } catch (error) {
      context.log.error('Failed to initialize vue-electron-settings');
      context.log.error(error);
    }
  }
}
