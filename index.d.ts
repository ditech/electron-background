import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { VUEJS_DEVTOOLS } from 'electron-devtools-installer';

declare module '@dimensional-innovations/vue-electron-background' {
  export interface InitOptions {
    config?: any;
    enableTouchEvents?: boolean;
    enableAutoUpdater?: boolean;
    enableKioskMode?: boolean;
    registerSchemesAsPrivileged?: boolean;
    browserWindowOptionOverrides?: Partial<BrowserWindowConstructorOptions>;
    devTools?: Array<string | typeof VUEJS_DEVTOOLS>;
    staticFileDirs?: Array<string>;
  }

  export function init(options: InitOptions): Promise<{ browserWindow: BrowserWindow }>;
}