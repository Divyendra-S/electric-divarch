import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electrons: {
      createBookmark: (url?:string,Text?: string) => Promise<any>;
      fetchOgimage: (url: string) => Promise<any>;
      createTags: (text: string) => Promise<any>;
      findSuitableFolder: (folders: any[], newTags: string, url: string) => Promise<string | false>;
      findSuitableFolderForText: (folders: any[], text: string) => Promise<string | false>;
      fetchAllFoldersWithTags: (userId: string) => Promise<any>;
      getFolders: (userId: string) => Promise<any[]>;
      getBookmarksByFolderId: (folderId: number, userId: string) => Promise<any[]>;
      getFolderById: (folderId: number) => Promise<any | null>;
      updateFolderName: (folderId: number, newName: string) => Promise<any>;
      getFoldersWithFirstBookmark: (userId: string) => Promise<any[]>;
      getFolderByBookmarkId: (bookmarkId: number, userId: string) => Promise<any | null>;
      getAllBookmarks: () => Promise<any | null>;
    };
  }
}
