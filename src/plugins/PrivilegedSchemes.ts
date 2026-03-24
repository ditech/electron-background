import { protocol } from 'electron';
import { InitPlugin } from '../InitPlugin';

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

  public beforeReady(): false {
    const customSchemes = this.schemes
      .map((scheme) => ({
        scheme,
        privileges: { secure: true, standard: true, supportFetchAPI: true },
      }));
    protocol.registerSchemesAsPrivileged(customSchemes);

    return false;
  }
}
