import { BrowserViewConstructorOptions } from 'electron';
import { ExtensionReference } from 'electron-devtools-installer';

declare module '@dimensional-innovations/vue-electron-background' {
  export interface InitOptions {
    config?: any;
    enableTouchEvents?: boolean;
    enableAutoUpdater?: boolean;
    enableKioskMode?: boolean;
    registerSchemesAsPrivileged?: boolean;
    browserWindowOptionOverrides?: Partial<BrowserViewConstructorOptions>;
    devTools?: Array<string | ExtensionReference>;
  }

  export function init(options: InitOptions): void;
}