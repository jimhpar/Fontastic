const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  triggerNativeSnip: () => ipcRenderer.send('trigger-native-snip'),
  onFontSnipReceived: (callback) => ipcRenderer.on('font-snip-received', (_event, imageBase64) => callback(imageBase64)),
  isElectron: true,
  platform: process.platform
});
