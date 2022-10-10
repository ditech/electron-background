import { Heartbeat, Modes } from '@dimensional-innovations/node-heartbeat';
import { InitContext, InitPlugin } from './init';

export class NodeHeartbeat implements InitPlugin {
  constructor(private readonly enabled: boolean = true) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const { heartbeatApiKey } = context.settings;
    if (this.enabled && heartbeatApiKey && typeof heartbeatApiKey === 'string') {
      new Heartbeat({
        apiKey: heartbeatApiKey,
        mode: Modes.SERVER,
      }).start();
    } else if (this.enabled) {
      context.log.warn('heartbeatApiKey was set in the settings. Heartbeat was not started.');
    }
  }
}
