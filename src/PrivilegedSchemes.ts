import { protocol } from 'electron';
import { InitContext, InitPlugin } from './init';

/**
 * Registers schemes as privileged.
 */
export class PrivilegedSchemes implements InitPlugin {
  /**
   * @constructor
   *
   * @param schemes - The schemes to register as privileged.
   */
  constructor(private readonly schemes: Array<string>) { }

  /**
   * @inheritdoc
   */
  public async beforeReady(context: InitContext): Promise<void> {
    const customSchemes = this.schemes
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }
}
