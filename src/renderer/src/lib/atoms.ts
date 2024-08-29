import { atom, createStore } from 'jotai'
import { Bookmark } from './schema';



export const store: any = createStore();


export const bookmarksAtom = atom<Bookmark[]>([])
export const folderBookmarksAtom = atom<Bookmark[]>([])