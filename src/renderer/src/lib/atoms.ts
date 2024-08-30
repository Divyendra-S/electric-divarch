import { atom, createStore } from 'jotai'
import { Bookmark } from './schema'

export const store: any = createStore()

export const bookmarksAtom = atom<Bookmark[]>([])
export const folderBookmarksAtom = atom<Bookmark[]>([])

export const fetchBookmarks = async () => {
  try {
    const allBookmarks = await window.electrons.getAllBookmarks()
      if ("error" in allBookmarks) {
          console.error("Error fetching bookmarks:", allBookmarks.error);
          throw new Error('Error fetching bookmarks:', allBookmarks.error);
          // Optionally, you can set an error state here if you have one
          // setError(allBookmarks.error);
      } else {
        //   store.set(bookmarksAtom, allBookmarks)
          return allBookmarks;
      }
  } catch (error) {
    console.log('Failed to fetch Bookmarks')
  }
}
