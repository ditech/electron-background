import { autoUpdater } from 'electron-updater';
import electronLog from 'electron-log';

/**
 * Starts the auto update process, checking for updates every 3 minutes
 * and automatically installing the update once one is found.
 *
 * For more info, see https://www.electron.build/auto-update
 *
 * @param autoUpdaterChannel - The update channel the autoUpdate watches.
 */
export function startAutoUpdater(autoUpdaterChannel: string): void {
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
