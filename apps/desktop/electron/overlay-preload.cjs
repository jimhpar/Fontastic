const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
  sendSnipCompleted: (imageBase64) => ipcRenderer.send('snip-completed', imageBase64),
  cancelSnip: () => ipcRenderer.send('snip-cancelled'),
  onSetScreenImage: (callback) => ipcRenderer.on('set-screen-image', (_event, dataUrl) => callback(dataUrl))
});
