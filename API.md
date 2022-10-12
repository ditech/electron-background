## Classes

<dl>
<dt><a href="#AssetLoader">AssetLoader</a></dt>
<dd><p>Initializes the <code>@dimensional-innovations/electron-asset-loader</code> package.</p>
<p>Note that if this plugin is included, the package must be installed in the application as well.</p>
</dd>
<dt><a href="#AutoUpdater">AutoUpdater</a></dt>
<dd><p>Starts the auto update process, checking for updates every 3 minutes
and automatically installing the update once one is found.</p>
<p>For more info, see <a href="https://www.electron.build/auto-update">https://www.electron.build/auto-update</a></p>
</dd>
<dt><a href="#DevTools">DevTools</a></dt>
<dd><p>Installs dev tools extensions and opens the devTools panel.</p>
</dd>
<dt><a href="#ElectronSettings">ElectronSettings</a></dt>
<dd><p>Manages application settings with <code>@dimensional-innovations/vue-electron-settings</code>.</p>
<p>Note that if this plugin is installed, the package must be installed in the application as well.</p>
</dd>
<dt><a href="#InitContext">InitContext</a></dt>
<dd><p>The context object passed to each plugin during the init process.</p>
</dd>
<dt><a href="#KioskBrowserWindow">KioskBrowserWindow</a></dt>
<dd><p>Enables kiosk mode in the BrowserWindow when the application is packaged.</p>
</dd>
<dt><a href="#NodeHeartbeat">NodeHeartbeat</a></dt>
<dd><p>Starts a &quot;heartbeat&quot;, which reports uptime to betteruptime.com.</p>
<p>Requires that heartbeatApiKey is set in the settings.</p>
</dd>
<dt><a href="#PrivilegedSchemes">PrivilegedSchemes</a></dt>
<dd><p>Registers schemes as privileged.</p>
</dd>
<dt><a href="#StaticFileDir">StaticFileDir</a></dt>
<dd><p>Registers a custom scheme to serve static files.</p>
</dd>
<dt><a href="#TouchEvents">TouchEvents</a></dt>
<dd><p>Enables touch events in the app.</p>
</dd>
<dt><a href="#VueElectronSettings">VueElectronSettings</a></dt>
<dd><p>Initializes the <code>@dimensional-innovations/vue-electron-settings</code> package, and updates the
settings on the InitContext to match.</p>
<p>Note that if this plugin is included, the package must be installed in the application as well.</p>
</dd>
<dt><a href="#VueElectronVersion">VueElectronVersion</a></dt>
<dd><p>Initializes the <code>@dimensional-innovations/vue-electron-version</code> package.</p>
<p>If this plugin is included, the package must also be installed in the app.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#startAutoUpdater">startAutoUpdater(autoUpdaterChannel)</a></dt>
<dd><p>Starts the auto update process, checking for updates every 3 minutes
and automatically installing the update once one is found.</p>
<p>For more info, see <a href="https://www.electron.build/auto-update">https://www.electron.build/auto-update</a></p>
</dd>
<dt><a href="#init">init(options)</a> ⇒</dt>
<dd><p>Initializes the application, creating a browser window, and loads the provided app url.</p>
</dd>
<dt><a href="#getWindowOptions">getWindowOptions(options, enableKioskMode)</a> ⇒</dt>
<dd><p>Combines the provided window options with defaults for a BrowserWindow.</p>
</dd>
<dt><a href="#createFileProtocol">createFileProtocol(scheme, sourceDirectory)</a></dt>
<dd><p>Wrapper around <code>protocol.registerFileProtocol</code> that serves files from the given source directory.
The handler will convert any url with the custom scheme to a file path in the source directory in
order to find the file to serve. For example, with &quot;media&quot; passed in for scheme and <code>/public</code> passed
in for sourceDirectory &quot;media://videos/demo.mp4&quot; would resolve to &quot;/public/media/videos/demo.mp4&quot;.</p>
</dd>
</dl>

<a name="AssetLoader"></a>

## AssetLoader
Initializes the `@dimensional-innovations/electron-asset-loader` package.Note that if this plugin is included, the package must be installed in the application as well.

**Kind**: global class  
<a name="new_AssetLoader_new"></a>

### new AssetLoader(options)

| Param | Description |
| --- | --- |
| options | Options used to initialize the asset loader. |

<a name="AutoUpdater"></a>

## AutoUpdater
Starts the auto update process, checking for updates every 3 minutesand automatically installing the update once one is found.For more info, see https://www.electron.build/auto-update

**Kind**: global class  
<a name="new_AutoUpdater_new"></a>

### new AutoUpdater(enabled)

| Param | Description |
| --- | --- |
| enabled | Indicates if the plugin is enabled. Used to disable the plugin in development. Defaults to `app.isPackaged`. |

<a name="DevTools"></a>

## DevTools
Installs dev tools extensions and opens the devTools panel.

**Kind**: global class  
<a name="new_DevTools_new"></a>

### new DevTools(devTools, enabled)

| Param | Description |
| --- | --- |
| devTools | The extensions to install. Defaults to Vue3 dev tools. |
| enabled | Indicates if the plugin is enabled. Used to disable the plugin when the app is packaged. Defaults to `!app.isPackaged`. |

<a name="ElectronSettings"></a>

## ElectronSettings
Manages application settings with `@dimensional-innovations/vue-electron-settings`.Note that if this plugin is installed, the package must be installed in the application as well.

**Kind**: global class  
<a name="InitContext"></a>

## InitContext
The context object passed to each plugin during the init process.

**Kind**: global class  
<a name="KioskBrowserWindow"></a>

## KioskBrowserWindow
Enables kiosk mode in the BrowserWindow when the application is packaged.

**Kind**: global class  
<a name="new_KioskBrowserWindow_new"></a>

### new KioskBrowserWindow(options, enableKioskMode)

| Param | Description |
| --- | --- |
| options | Additional options to apply to the BrowserWindow. |
| enableKioskMode | Indicates if the plugin is enabled. Used to disabled kiosk mode in development. Defaults to `app.isPackaged` |

<a name="NodeHeartbeat"></a>

## NodeHeartbeat
Starts a "heartbeat", which reports uptime to betteruptime.com.Requires that heartbeatApiKey is set in the settings.

**Kind**: global class  
<a name="new_NodeHeartbeat_new"></a>

### new NodeHeartbeat(enabled)

| Param | Description |
| --- | --- |
| enabled | Indicates if the plugin is enabled. Used to disable the plugin during development. Defaults to `app.isPackaged`. |

<a name="PrivilegedSchemes"></a>

## PrivilegedSchemes
Registers schemes as privileged.

**Kind**: global class  

* [PrivilegedSchemes](#PrivilegedSchemes)
    * [new PrivilegedSchemes(schemes)](#new_PrivilegedSchemes_new)
    * [.beforeReady()](#PrivilegedSchemes+beforeReady)

<a name="new_PrivilegedSchemes_new"></a>

### new PrivilegedSchemes(schemes)

| Param | Description |
| --- | --- |
| schemes | The schemes to register as privileged. |

<a name="PrivilegedSchemes+beforeReady"></a>

### privilegedSchemes.beforeReady()
**Kind**: instance method of [<code>PrivilegedSchemes</code>](#PrivilegedSchemes)  
<a name="StaticFileDir"></a>

## StaticFileDir
Registers a custom scheme to serve static files.

**Kind**: global class  
<a name="new_StaticFileDir_new"></a>

### new StaticFileDir(scheme, dir)

| Param | Description |
| --- | --- |
| scheme | The scheme to serve the files from. |
| dir | The directory where the static files are located. |

<a name="TouchEvents"></a>

## TouchEvents
Enables touch events in the app.

**Kind**: global class  
<a name="VueElectronSettings"></a>

## VueElectronSettings
Initializes the `@dimensional-innovations/vue-electron-settings` package, and updates thesettings on the InitContext to match.Note that if this plugin is included, the package must be installed in the application as well.

**Kind**: global class  
<a name="VueElectronVersion"></a>

## VueElectronVersion
Initializes the `@dimensional-innovations/vue-electron-version` package.If this plugin is included, the package must also be installed in the app.

**Kind**: global class  
<a name="new_VueElectronVersion_new"></a>

### new VueElectronVersion(version)

| Param | Description |
| --- | --- |
| version | The application version. Defaults to `app.getVersion()`. |

<a name="startAutoUpdater"></a>

## startAutoUpdater(autoUpdaterChannel)
Starts the auto update process, checking for updates every 3 minutesand automatically installing the update once one is found.For more info, see https://www.electron.build/auto-update

**Kind**: global function  

| Param | Description |
| --- | --- |
| autoUpdaterChannel | The update channel the autoUpdate watches. |

<a name="init"></a>

## init(options) ⇒
Initializes the application, creating a browser window, and loads the provided app url.

**Kind**: global function  
**Returns**: - The final state of the init context, including the created browser window for additional setup.  

| Param | Description |
| --- | --- |
| options | Options used to define how the application is initialized. |

<a name="getWindowOptions"></a>

## getWindowOptions(options, enableKioskMode) ⇒
Combines the provided window options with defaults for a BrowserWindow.

**Kind**: global function  
**Returns**: - The options that can be passed to the BrowserWindow constructor.  

| Param | Description |
| --- | --- |
| options | The options to include with the default options. |
| enableKioskMode | If true, additional defaults will be included to support kiosk mode. |

<a name="createFileProtocol"></a>

## createFileProtocol(scheme, sourceDirectory)
Wrapper around `protocol.registerFileProtocol` that serves files from the given source directory.The handler will convert any url with the custom scheme to a file path in the source directory inorder to find the file to serve. For example, with "media" passed in for scheme and `/public` passedin for sourceDirectory "media://videos/demo.mp4" would resolve to "/public/media/videos/demo.mp4".

**Kind**: global function  

| Param | Description |
| --- | --- |
| scheme | The scheme to register. |
| sourceDirectory | The directory where files are served from. |

