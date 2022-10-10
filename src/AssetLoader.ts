import { AssetLoaderOptions } from '@dimensional-innovations/electron-asset-loader';
import { InitContext, InitPlugin } from './init';

/**
 * Initializes the `@dimensional-innovations/electron-asset-loader` package.
 */
export class AssetLoader implements InitPlugin {
  /**
   * @constructor
   *
   * @param options - Options used to initialize the asset loader.
   */
  constructor(private readonly options?: AssetLoaderOptions) { }

  public async afterReady(context: InitContext): Promise<void> {
    try {
      const { initAssetLoader } = await import('@dimensional-innovations/electron-asset-loader');
      initAssetLoader(this.options);
    } catch (error) {
      context.log.error('Failed to initialize asset loader.');
      context.log.error(error);
    }
  }
}
