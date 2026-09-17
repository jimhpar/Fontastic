const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, Tray, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let overlayWindow = null;
let tray = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#F8FAFC',
    title: 'Fontastic - Visual Font Finder & Manager',
    icon: path.join(__dirname, 'tray-icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    show: true
  });

  // Handle external link clicks (Direct Download, foundry links, etc.) safely in user default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const devServerUrl = 'http://localhost:3000';
  const distPath = path.join(__dirname, '../dist/index.html');

  mainWindow.loadURL(devServerUrl).catch(() => {
    mainWindow.loadFile(distPath);
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'tray-icon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Fontastic - Visual Font Finder (Press F9 or Ctrl+Shift+F)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '📸 Snip Screen Area (F9 or Ctrl+Shift+F)',
      click: () => {
        startScreenSnip();
      }
    },
    {
      label: '🖥️ Open Fontastic',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createMainWindow();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Fontastic',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  tray.on('double-click', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

async function startScreenSnip() {
  try {
    console.log('[Electron] Starting global screen snip...');
    // 1. Hide the main app window so it is not in the screenshot
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }

    // Small delay to let OS repaint the background windows
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. Capture desktop display
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const scale = primaryDisplay.scaleFactor || 1;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: Math.round(width * scale),
        height: Math.round(height * scale)
      }
    });

    if (!sources || sources.length === 0) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
      return;
    }

    const screenDataUrl = sources[0].thumbnail.toDataURL();

    // 3. Create fullscreen overlay window
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.destroy();
    }

    overlayWindow = new BrowserWindow({
      x: primaryDisplay.bounds.x,
      y: primaryDisplay.bounds.y,
      width: primaryDisplay.bounds.width,
      height: primaryDisplay.bounds.height,
      fullscreen: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: false,
      enableLargerThanScreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'overlay-preload.cjs')
      }
    });

    overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));

    overlayWindow.webContents.once('did-finish-load', () => {
      overlayWindow.webContents.send('set-screen-image', screenDataUrl);
      overlayWindow.focus();
    });

    overlayWindow.on('closed', () => {
      overlayWindow = null;
    });

  } catch (err) {
    console.error('Error starting screen snip:', err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }
}

// IPC Handlers
ipcMain.on('trigger-native-snip', () => {
  startScreenSnip();
});

ipcMain.handle('open-external-url', async (_event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});

ipcMain.handle('install-font-file', async (_event, font) => {
  try {
    const downloadsDir = app.getPath('downloads');
    const fontasticDir = path.join(downloadsDir, 'Fontastic Fonts');
    if (!fs.existsSync(fontasticDir)) {
      fs.mkdirSync(fontasticDir, { recursive: true });
    }

    const safeFamily = (font.family || 'Font').replace(/[^a-zA-Z0-9_-]/g, '_');
    let targetFilePath = null;

    // Check if we have an explicit font binary URL (woff2, ttf, or otf)
    const fileUrl = font.files?.regular || (font.downloadUrl && (font.downloadUrl.endsWith('.ttf') || font.downloadUrl.endsWith('.otf')) ? font.downloadUrl : null);

    if (fileUrl && (fileUrl.endsWith('.ttf') || fileUrl.endsWith('.otf') || fileUrl.endsWith('.woff2'))) {
      const ext = fileUrl.endsWith('.otf') ? '.otf' : (fileUrl.endsWith('.woff2') ? '.woff2' : '.ttf');
      targetFilePath = path.join(fontasticDir, `${safeFamily}${ext}`);
      
      const res = await fetch(fileUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(targetFilePath, Buffer.from(arrayBuffer));
      }
    }

    // If font file was downloaded to disk, open with native Windows Font Viewer so user has 1-click Install
    if (targetFilePath && fs.existsSync(targetFilePath)) {
      await shell.openPath(targetFilePath);
      return {
        success: true,
        action: 'opened_in_font_viewer',
        filePath: targetFilePath,
        message: `Font saved to ${targetFilePath} and opened in Windows Font Viewer.`
      };
    }

    // If no direct binary, open the direct download/specimen URL in the user's browser
    if (font.downloadUrl) {
      await shell.openExternal(font.downloadUrl);
      return {
        success: true,
        action: 'opened_in_browser',
        url: font.downloadUrl,
        message: `Opened ${font.family} official download page in browser.`
      };
    }

    return { success: false, error: 'No download source available for this font.' };
  } catch (err) {
    console.error('[Fontastic Font Installer Error]:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('snip-completed', (_event, croppedBase64) => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }

  // Restore main window and forward the snip
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('font-snip-received', croppedBase64);
  }
});

ipcMain.on('snip-cancelled', () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }

  // Restore main window
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createMainWindow();
  createTray();

  // Register robust Global Shortcuts across the entire OS (works in third-party apps, browsers, games)
  const shortcuts = [
    'F9',
    'CommandOrControl+Shift+F',
    'CommandOrControl+F9',
    'Shift+F9',
    'PrintScreen'
  ];

  shortcuts.forEach(sc => {
    try {
      const success = globalShortcut.register(sc, () => {
        console.log(`[Global Shortcut Activated]: ${sc}`);
        startScreenSnip();
      });
      console.log(`[Global Shortcut] Registered ${sc}: ${success}`);
    } catch (err) {
      console.warn(`[Global Shortcut] Failed to register ${sc}:`, err);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Only quit if user explicitly clicked Quit from system tray
  if (app.isQuitting) {
    app.quit();
  }
});
