import { Heartbeat, Modes } from '@dimensional-innovations/node-heartbeat';
import { app } from 'electron';
import { InitContext, InitPlugin } from './init';

/**
 * Starts a "heartbeat", which reports uptime to betteruptime.com.
 * 
 * Requires that heartbeatApiKey is set in the settings.
 */
export class NodeHeartbeat implements InitPlugin {
  /**
   * @constructor
   * 
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin during development. Defaults to `app.isPackaged`.
   */
  constructor(private readonly enabled: boolean = app.isPackaged) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const { heartbeatApiKey } = context.config;
    if (this.enabled && heartbeatApiKey && typeof heartbeatApiKey === 'string') {
      new Heartbeat({
        apiKey: heartbeatApiKey,
        mode: Modes.SERVER,
      }).start();
    } else if (this.enabled) {
      context.log.warn('heartbeatApiKey was not in the settings. Heartbeat was not started.');
    }
  }
}
