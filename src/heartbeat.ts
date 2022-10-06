import { Heartbeat, Modes } from '@dimensional-innovations/node-heartbeat';

/** Utility functions for background monitoring processes. */

export function startHeartbeat(heartbeatApiKey: string): void {
  new Heartbeat({
    apiKey: heartbeatApiKey,
    mode: Modes.SERVER
  }).start();
}