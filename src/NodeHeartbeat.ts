import { Heartbeat, Modes, HeartbeatOptions } from '@dimensional-innovations/node-heartbeat';
import { app } from 'electron';
import { InitContext, InitPlugin } from './init';

export interface NodeHeartbeatOptions extends Omit<HeartbeatOptions, 'apiKey' | 'enabled' | 'mode'>  {
  heartbeatApiKey?: string;
}

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
   * @param options - Options passed to the node heartbeat instance.
   */
  constructor(
    private readonly enabled: boolean = app.isPackaged, 
    private readonly options: NodeHeartbeatOptions = {}
  ) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const heartbeatApiKey = context.config.heartbeatApiKey || this.options.heartbeatApiKey;

    if (this.enabled && heartbeatApiKey && typeof heartbeatApiKey === 'string') {
      new Heartbeat({
        ...this.options,
        apiKey: heartbeatApiKey,
        mode: Modes.SERVER,
        enabled: true,
      }).start();
    } else if (this.enabled) {
      context.log.warn('heartbeatApiKey was not in the settings. Heartbeat was not started.');
    }
  }
}
