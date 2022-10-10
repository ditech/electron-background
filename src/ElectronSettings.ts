import { InitContext, InitPlugin } from './init';

/**
 * Manages application settings with `@dimensional-innovations/vue-electron-settings`.
 *
 * Note that if this plugin is installed, the package must be installed in the application as well.
 */
export class ElectronSettings implements InitPlugin {
  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initSettings } = await import('@dimensional-innovations/vue-electron-settings');
      context.settings = await initSettings(context.settings);
    } catch (error) {
      context.log.error('Failed to initialize vue-electron-settings');
      context.log.error(error);
    }
  }
}
