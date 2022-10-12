import { protocol } from 'electron';
import { InitPlugin } from './init';

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

  public async beforeReady(): Promise<void> {
    const customSchemes = this.schemes
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);
  }
}
