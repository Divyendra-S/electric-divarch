import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electrons: {
      createBookmark: (text: string) => Promise<any>;
      fetchOgimage: (url: string) => Promise<any>;
      createTags: (text: string) => Promise<any>;
    };
  }
}
