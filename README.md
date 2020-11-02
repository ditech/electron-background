# @dimensional-innovations/vue-electron-background


## Examples

Install
```bash
npm install @dimensional-innovations/vue-electron-background -S
```

Default setup with a development environment
```
import {
  init,
  environment,
} from './bg';

init({
  env: environment.DEVELOPMENT,
  enableAutoUpdater: false,
});
```