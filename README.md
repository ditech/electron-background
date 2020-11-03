# @dimensional-innovations/vue-electron-background

## Examples

Install
```bash
npm install @dimensional-innovations/vue-electron-background -S
```

Default setup
```javascript
import background from '@dimensional-innovations/vue-electron-background';
background();
```

Disable the auto update feature
```javascript
import background from '@dimensional-innovations/vue-electron-background';
background({ enableAutoUpdater: false });
```

Only enable kiosk mode in production environments
```javascript
import background from '@dimensional-innovations/vue-electron-background';
background({ enableKioskMode: process.env === 'production' });
```


## Features
This package acts as the default background script for vue-electron projects at DI. It does the following:

1. Ability to enable a kiosk mode. Kiosk mode loads the electron app into full screen and makes it near impossible for the user to exit. This mode is disabled by default. To enable: `init({ enableKioskMode: true })`. 
1. Enables auto updating from S3 buckets by default. Any time a new version of the electron app is published to the bucket, the auto updater will pull down a new version, install and restart immediately. To disable: `init({enableAutoUpdater: false})`
1. Enables touch events by default. Disable by: `init({ enableTouchEvents: false, })`
1. [Registers a scheme as privledged](https://www.electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes) by default. To disable: `init({registerSchemesAsPrivileged: false, })`
1. Sets up a variety of handlers to listen for app ready, close, quit and exit.
1. Loads the config from the package.json into [electron-settings](https://electron-settings.js.org/).