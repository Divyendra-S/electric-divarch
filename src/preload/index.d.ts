import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electrons: {
      createBookmark: (url?: string, Text?: string) => Promise<any>;
      createBookmarkWithScreenshot: (url?:string) => Promise<any>;
      fetchOgimage: (url: string) => Promise<any>;
      createTags: (text: string) => Promise<any>;
      findSuitableFolder: (folders: any[], newTags: string, url: string) => Promise<string | false>;
      findSuitableFolderForText: (folders: any[], text: string) => Promise<string | false>;
      fetchAllFoldersWithTags: (userId: string) => Promise<any>;
      getFolders: () => Promise<any[]>;
      getBookmarksByFolderId: (folderId: number) => Promise<any[]>;
      getFolderById: (folderId: number) => Promise<any | null>;
      updateFolderName: (folderId: number, newName: string) => Promise<any>;
      getFoldersWithFirstBookmark: () => Promise<any[]>;
      getFolderByBookmarkId: (bookmarkId: number) => Promise<any | null>;
      getAllBookmarks: () => Promise<any | null>;
      createFolder: (folderName: string) => Promise<any>;
      createFolderAndAddBookmarks: (folderName: string, bookmarkIds: number[]) => Promise<any>;
      DeleteTag: (bookmarkId: number, tagToDelete: string) => Promise<any>;
      addTag: (bookmarkId: number, tag: string) => Promise<any>;
      findBookmarksByTag: (tag: string) => Promise<any[]>;
      updateBookmark: (bookmarkId: number, title?: string, text?: string) => Promise<any>;
      deleteFolder: (folderId: number) => Promise<any>;
      deleteBookmark: (bookmarkId: number) => Promise<any>;
      addBookmarkToFolder: (bookmarkId: number, folderId: number) => Promise<any>;
    };
  }
}
