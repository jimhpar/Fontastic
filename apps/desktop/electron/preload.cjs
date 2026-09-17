const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  triggerNativeSnip: () => ipcRenderer.send('trigger-native-snip'),
  onFontSnipReceived: (callback) => ipcRenderer.on('font-snip-received', (_event, imageBase64) => callback(imageBase64)),
  openExternal: (url) => ipcRenderer.invoke('open-external-url', url),
  installFont: (font) => ipcRenderer.invoke('install-font-file', font),
  isElectron: true,
  platform: process.platform
});
