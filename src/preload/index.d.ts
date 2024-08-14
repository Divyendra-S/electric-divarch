import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electrons: {
      createBookmark: (text: string) => Promise<any>;
    };
  }
}
