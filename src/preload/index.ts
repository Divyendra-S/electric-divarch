import { contextBridge, ipcRenderer } from 'electron'



if (!process.contextIsolated) {
  throw new Error(`Context isolation must be enabled in Electron`)
  
} 

try {
  contextBridge.exposeInMainWorld('electron', {
    createBookmark: (text: string) => ipcRenderer.invoke("create-bookmark", text),
  })
  
} catch (error) {
  console.error(error)
}