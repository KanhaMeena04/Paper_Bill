import { app, ipcMain, BrowserWindow, screen } from 'electron';
import path from 'node:path';



if (require('electron-squirrel-startup')) {
  app.quit();
}


// WINDOWS NAV FUNCTIONS 
// MINIMIZE 
ipcMain.on("window-minimize",() =>{
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
})
// MAXIMIZE 
ipcMain.on("window-minimize",() =>{
  console.log("working mini")
})
// CLOSE 
ipcMain.on("window-minimize",() =>{
  console.log("working mini")
})

const createWindow = () => {
  const { workAreaSize } = screen.getPrimaryDisplay();

  const mainWindow = new BrowserWindow({
    width: workAreaSize.width,
    height: workAreaSize.height,
    icon: path.join(__dirname, 'assets/logo.ico'),
    frame: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: true,
      allowRunningInsecureContent: false,
      nodeIntegration: false,
      contextIsolation: true
    },
    fullscreen: true,
  });

  // menu visible disabled changed by manish
  // mainWindow.setMenuBarVisibility(false)

  

  // Set CSP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "connect-src 'self' * data: https: https://accounts.google.com https://*.gstatic.com https://www.googleapis.com;" +
          "img-src 'self' data: https: blob:;" +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.gstatic.com https://www.google.com;" +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com;" + // Added https://www.gstatic.com
          "font-src 'self' https://fonts.gstatic.com;" +
          "frame-src 'self' https://accounts.google.com https://www.google.com https://*.google.com;" +
          "worker-src 'self' blob:;"
        ],
      },
    });
  });
  

  // Enable permissions for specific features if needed
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['notifications', 'geolocation'];
    callback(allowedPermissions.includes(permission));
  });
  
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  
};



app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});