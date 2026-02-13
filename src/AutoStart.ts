import { app } from 'electron';

import { InitPlugin, NonBrowserWindowInitContext } from './init';

/** Argument passed to the login item so boot launches can be detected. */
const AUTOSTART_ARG = '--autostart';

export interface AutoStartOptions {
  /** Delay in seconds before window creation on boot launches (0 = no delay). Default: 30 */
  startupDelay?: number;
}

/**
 * Registers the application as a login item for automatic startup and optionally
 * delays window creation. The delay only applies when the app was auto-started at
 * system boot (detected via the `--autostart` process argument on Windows).
 *
 * On macOS/Linux, boot detection is not reliably possible, so the delay is always
 * skipped — the app launches instantly regardless of how it was started.
 */
export class AutoStart implements InitPlugin {
  private readonly enabled: boolean;
  private readonly startupDelay: number;

  /**
   * @param enabled - Whether auto-start is active. Defaults to `app.isPackaged`.
   * @param options - Configuration options for startup behavior.
   */
  constructor(enabled?: boolean, options: AutoStartOptions = {}) {
    this.enabled = enabled ?? app.isPackaged;
    this.startupDelay = options.startupDelay ?? 30;
  }

  /** Returns true when the app was launched by the OS login item (Windows only). */
  private isAutoStartLaunch(): boolean {
    return process.platform === 'win32' && process.argv.includes(AUTOSTART_ARG);
  }

  async afterReady(context: NonBrowserWindowInitContext): Promise<void> {
    if (!this.enabled) {
      context.log.info('[AutoStart] Disabled (not packaged)');
      return;
    }

    // On Windows, include the autostart arg so boot launches can be distinguished
    // from manual launches. On other platforms, no args needed.
    try {
      if (process.platform === 'win32') {
        app.setLoginItemSettings({ openAtLogin: true, args: [AUTOSTART_ARG] });
      } else {
        app.setLoginItemSettings({ openAtLogin: true });
      }
      context.log.info('[AutoStart] Registered as login item');
    } catch (err) {
      context.log.error('[AutoStart] Failed to register login item:', err);
    }

    if (this.startupDelay > 0 && this.isAutoStartLaunch()) {
      context.log.info(
        `[AutoStart] Boot launch detected — delaying ${this.startupDelay}s before window creation`
      );
      await new Promise(resolve => {
        setTimeout(resolve, this.startupDelay * 1000);
      });
    } else if (this.startupDelay > 0) {
      context.log.info('[AutoStart] Manual launch — skipping startup delay');
    }
  }
}
