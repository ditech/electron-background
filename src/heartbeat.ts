import { Heartbeat, Modes } from '@dimensional-innovations/node-heartbeat';

/** Utility functions for background monitoring processes. */

/**
 * Starts the heartbeat, reporting the app's uptime to betteruptime.com.
 *
 * @param heartbeatApiKey - The api key that identifies the app in betteruptime.
 */
export function startHeartbeat(heartbeatApiKey: string): void {
  new Heartbeat({
    apiKey: heartbeatApiKey,
    mode: Modes.SERVER,
  }).start();
}
