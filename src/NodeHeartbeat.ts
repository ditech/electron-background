import { app } from 'electron';
import { InitContext, InitPlugin } from './init';
import axios from 'axios';

/**
 * Options used to define the request used to monitor the app.
 */
export interface HeartbeatOptions {
  /**
   * The url to send a request to. If a function is provided, it is called with the current context and a request
   * is sent to the returned value.
   */
  url: string | ((context: InitContext) => string);

  /**
   * The amount of time in milliseconds between requests.
   */
  pollInterval: number;
}

/**
 * Starts a "heartbeat", which sends a request to the provided url on an interval.
 */
export class Heartbeat implements InitPlugin {

  /**
   * @constructor
   * 
   * @param options - Options that define the url used to monitor the app.
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin during development. Defaults to `app.isPackaged`.
   */
  constructor(
    private readonly options: HeartbeatOptions,
    private readonly enabled: boolean = app.isPackaged,
  ) { }

  public async afterLoad(context: InitContext): Promise<void> {
    if (!this.enabled) return;

    const url = typeof this.options.url === 'string'
      ? this.options.url
      : this.options.url(context);
    new NodeHeartbeat(url, this.options.pollInterval).start();
  }
}

export interface BetterStackHeartbeatOptions {
  /**
   * The unique key for the app, obtained from betterstack.com
   */
  heartbeatApiKey?: string;

  /**
   * If true sends a request to https://uptime.betterstack.com. Otherwise sends a request to https://betteruptiume.com.
   */
  isBetterStack?: boolean;

  /**
   * The amount of time in milliseconds between requests.
   */
  pollInterval?: number;
}

/**
 * Starts a "heartbeat" by sending a request to https://betterstack.com on an interval. Requires the apiKey to be in the app config.
 */
export class BetterStackHeartbeat implements InitPlugin {

  /**
   * @constructor
   * 
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin during development. Defaults to `app.isPackaged`.
   * @param options - Options that used to start the heartbeat.
   */
  constructor(
    private readonly enabled: boolean = app.isPackaged,
    private readonly options: BetterStackHeartbeatOptions = {}
  ) { }

  public async afterLoad(context: InitContext): Promise<void> {
    const heartbeatApiKey = this.options.heartbeatApiKey;

    if (this.enabled && heartbeatApiKey && typeof heartbeatApiKey === 'string') {
      const url = this.options.isBetterStack
        ? `https://uptime.betterstack.com/api/v1/heartbeat/${heartbeatApiKey}`
        : `https://betteruptime.com/api/v1/heartbeat/${heartbeatApiKey}`;
      new NodeHeartbeat(url, this.options.pollInterval || 30000).start();
    } else if (this.enabled) {
      context.log.warn('heartbeatApiKey was not in the settings. Heartbeat was not started.');
    }
  }
}

class NodeHeartbeat {
  constructor(
    private readonly url: string,
    private readonly pollInterval: number
  ) { }

  private interval: ReturnType<typeof setInterval> | undefined;

  public start() {
    this.poll();
    this.interval = setInterval(() => this.poll(), this.pollInterval);
  }

  public stop() {
    clearInterval(this.interval);
  }

  private poll() {
    return axios.head(this.url);
  }
}
