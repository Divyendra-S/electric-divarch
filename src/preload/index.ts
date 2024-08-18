import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error(`Context isolation must be enabled in Electron`)
}
// let renderTimeout;
try {
  contextBridge.exposeInMainWorld('electrons', {
    createBookmark: (url:string,Text: string) => ipcRenderer.invoke('create-bookmark', url,Text),
    fetchOgimage: (url: string) => ipcRenderer.invoke('fetch-ogimage', url),
    createTags: (url: string) => ipcRenderer.invoke('create-tags', url),
    findSuitableFolder: (folders: any[], newTags: string, url: string) =>
      ipcRenderer.invoke('find-suitable-folder', folders, newTags, url),
    findSuitableFolderForText: (folders: any[], text: string) =>
      ipcRenderer.invoke('find-suitable-folder-for-text', folders, text),
    fetchAllFoldersWithTags: (userId: string) =>
      ipcRenderer.invoke('fetch-all-folders-with-tags', userId),
    getFolders: (userId: string) => ipcRenderer.invoke('get-folders', userId),
    getBookmarksByFolderId: (folderId: number, userId: string) =>
      ipcRenderer.invoke('get-bookmarks-by-folder-id', folderId, userId),
    getFolderById: (folderId: number) => ipcRenderer.invoke('get-folder-by-id', folderId),
    updateFolderName: (folderId: number, newName: string) =>
      ipcRenderer.invoke('update-folder-name', folderId, newName),
    getFoldersWithFirstBookmark: (userId: string) =>
      ipcRenderer.invoke('get-folders-with-first-bookmark', userId),
    getFolderByBookmarkId: (bookmarkId: number, userId: string) =>
      ipcRenderer.invoke('get-folder-by-bookmark-id', bookmarkId, userId)
  })
} catch (error) {
  console.error(error)
}
