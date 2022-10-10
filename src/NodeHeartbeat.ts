import { Heartbeat, Modes } from '@dimensional-innovations/node-heartbeat';
import { app } from 'electron';
import { InitContext, InitPlugin } from './init';

export class NodeHeartbeat implements InitPlugin {
  constructor(private readonly enabled: boolean = app.isPackaged) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const { heartbeatApiKey } = context.settings;
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
