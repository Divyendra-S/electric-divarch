import { contextBridge, ipcRenderer } from 'electron'


if (!process.contextIsolated) {
  throw new Error(`Context isolation must be enabled in Electron`)
}
// let renderTimeout;
try {
  contextBridge.exposeInMainWorld('electrons', {
    createBookmark: (url: string, Text: string) => ipcRenderer.invoke('create-bookmark', url, Text),
    createBookmarkWithScreenshot: (url: string) => ipcRenderer.invoke('create-bookmark-with-screenshot', url),
    fetchOgimage: (url: string) => ipcRenderer.invoke('fetch-ogimage', url),
    createTags: (url: string) => ipcRenderer.invoke('create-tags', url),
    findSuitableFolder: (folders: any[], newTags: string, url: string) =>
      ipcRenderer.invoke('find-suitable-folder', folders, newTags, url),
    findSuitableFolderForText: (folders: any[], text: string) =>
      ipcRenderer.invoke('find-suitable-folder-for-text', folders, text),
    fetchAllFoldersWithTags: () =>
      ipcRenderer.invoke('fetch-all-folders-with-tags'),
    getFolders: () => ipcRenderer.invoke('get-folders'),
    getBookmarksByFolderId: (folderId: number) =>
      ipcRenderer.invoke('get-bookmarks-by-folder-id', folderId),
    getFolderById: (folderId: number) => ipcRenderer.invoke('get-folder-by-id', folderId),
    updateFolderName: (folderId: number, newName: string) =>
      ipcRenderer.invoke('update-folder-name', folderId, newName),
    getFoldersWithFirstBookmark: () =>
      ipcRenderer.invoke('get-folders-with-first-bookmark'),
    getFolderByBookmarkId: (bookmarkId: number) =>
      ipcRenderer.invoke('get-folder-by-bookmark-id', bookmarkId,),
    getAllBookmarks: () =>
      ipcRenderer.invoke('get-all-bookmarks'),
    createFolder: (folderName: string) => ipcRenderer.invoke('create-folder', folderName),
    createFolderAndAddBookmarks: (folderName: string, bookmarkIds: number[]) =>
      ipcRenderer.invoke('create-folder-and-add-bookmarks', folderName, bookmarkIds),
    DeleteTag: (bookmarkId: number, tagToDelete: string) =>
      ipcRenderer.invoke('delete-tag', bookmarkId, tagToDelete),
    addTag: (bookmarkId: number, tag: string) =>
      ipcRenderer.invoke('add-tag', bookmarkId, tag),

    findBookmarksByTag: (tag: string) =>
      ipcRenderer.invoke('find-bookmarks-by-tag', tag),
    
    updateBookmark: (bookmarkId: number, title?: string, text?: string) =>
      ipcRenderer.invoke('update-bookmark', bookmarkId, title, text),

    deleteFolder: (folderId: number) =>
      ipcRenderer.invoke('delete-folder', folderId),
      
    deleteBookmark: (bookmarkId: number) =>
      ipcRenderer.invoke('delete-bookmark', bookmarkId),
    addBookmarkToFolder: (bookmarkId: number, folderId: number) => ipcRenderer.invoke('add-bookmark-to-folder', bookmarkId, folderId),
  });

  
  

} catch (error) {
  console.error(error)
}
