import { app } from 'electron';
import electronLog from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { BrowserWindowInitContext, InitPlugin } from './init';

/**
 * Starts the auto update process, checking for updates every 3 minutes
 * and automatically installing the update once one is found.
 *
 * For more info, see https://www.electron.build/auto-update
 */
export class AutoUpdater implements InitPlugin {
  /**
   * @constructor
   * 
   * @param enabled - Indicates if the plugin is enabled. Used to disable the plugin in development. Defaults to `app.isPackaged`.
   */
  constructor(private readonly enabled: boolean = app.isPackaged) { }

  public async afterLoad({ config, log }: BrowserWindowInitContext): Promise<void> {
    const { autoUpdaterChannel } = config;
    if (this.enabled && autoUpdaterChannel) {
      this.startAutoUpdater(autoUpdaterChannel as string);
    } else if (this.enabled) {
      log.warn('autoUpdaterChannel was not set in the settings. AutoUpdater was not started.');
    }
  }

  private startAutoUpdater(autoUpdaterChannel: string): void {
    const threeMinutes = 180000;

    autoUpdater.channel = autoUpdaterChannel;
    autoUpdater.autoDownload = true;
    autoUpdater.logger = electronLog;

    autoUpdater.on('update-downloaded', () => {
      electronLog.info('Updated app downloaded... restarting');
      // https://www.electron.build/auto-update#module_electron-updater.AppUpdater+quitAndInstall
      autoUpdater.quitAndInstall(true, true);
    });

    autoUpdater.on('update-not-available', () => {
      electronLog.info('No update available. Will try again soon.');
    });

    // check for updates now and then every 3 minutes
    autoUpdater.checkForUpdates();
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, threeMinutes);
  }
}


