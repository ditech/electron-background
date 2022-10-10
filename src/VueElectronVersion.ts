import { InitContext, InitPlugin } from './init';

/**
 * Initializes the `@dimensional-innovations/vue-electron-version` package.
 *
 * If this plugin is included, the package must also be installed in the app.
 */
export class VueElectronVersion implements InitPlugin {
  /**
   * @constructor
   *
   * @param version - The application version. Defaults to `app.getVersion()`.
   */
  constructor(private readonly version?: string) { }

  public async beforeLoad(context: InitContext): Promise<void> {
    try {
      const { initVersion } = await import('@dimensional-innovations/vue-electron-version');
      initVersion(this.version);
    } catch (error) {
      context.log.error('Failed to initialize vue-electron-version');
      context.log.error(error);
    }
  }
}
