import { contextBridge, ipcRenderer } from 'electron'



if (!process.contextIsolated) {
  throw new Error(`Context isolation must be enabled in Electron`)
  
} 
// let renderTimeout;
try {
  contextBridge.exposeInMainWorld("electrons", {
    createBookmark: (text: string) => ipcRenderer.invoke("create-bookmark", text),
    fetchOgimage: (url: string) => ipcRenderer.invoke("fetch-ogimage", url),
    createTags: (url: string) => ipcRenderer.invoke("create-tags", url),
    
  })
  
} catch (error) {
  console.error(error)
}