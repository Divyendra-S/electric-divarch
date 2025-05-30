import { useEffect, useRef, useState } from 'react'
import Masonry from 'react-masonry-css'
import { cn } from '../../lib/utils'
import { Bookmark } from '../../lib/schema'
import Navbar from './Navbar'
import BookmarkSearch from './BookmarkSearch'
import BookmarkForm from './BookmarkForm'
import BookmarkModal from './BookmarkModal'
import { SkeletonCard } from './SkeletonCard'
import Spaces from '../spaces/spaces'
import Serendipity from '../serendipity/serendipity'
import FolderPage from '../spaces/folders'
import { bookmarksAtom, fetchBookmarks } from '@renderer/lib/atoms'
import { useAtom } from 'jotai'

const getRandomHeightMultiplier = () => {
  const multipliers = [1, 0.8, 1, 1.1, 1.2, 0.7, 1.3]
  return multipliers[Math.floor(Math.random() * multipliers.length)]
}

const EveryBookmark = () => {
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [bookmarkHeights, setBookmarkHeights] = useState<{ [key: number]: number }>({})
  const [modal, setModal] = useState<boolean>(false)
  const [folderName, setFolderName] = useState<string>('')
  const [searchString, setSearchString] = useState<boolean>(false)
  const [isBookmarkFormFocused, setIsBookmarkFormFocused] = useState(false)
  const [overlayOpacity] = useState(0)
  const [navId, setNavId] = useState(1)
  const [folderId, setFolderId] = useState(0)
  const [view, setView] = useState('main') // 'main', 'spaces', 'serendipity', 'folder'
  const bookmarkFormRef = useRef<HTMLDivElement>(null)

  const handleBookmarkFormFocus = () => setIsBookmarkFormFocused(true)
  const handleBookmarkFormBlur = () => setIsBookmarkFormFocused(false)

  useEffect(() => {
    window.electrons.onBookmarkChanged(async() => {
      const newBookmarks = await fetchBookmarks(); // Reload bookmarks when a bookmark is created or deleted or updated
      setBookmarks(newBookmarks);
      console.log("from1 onBookmarkChanged home page");
    });
  }, [setBookmarks]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      bookmarkFormRef.current &&
        !bookmarkFormRef.current.contains(event.target as Node) &&
        handleBookmarkFormBlur()
    }

    isBookmarkFormFocused && document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBookmarkFormFocused])

  useEffect(() => {
    setBookmarkHeights(
      bookmarks.reduce(
        (acc, bookmark) => ({ ...acc, [bookmark.id]: getRandomHeightMultiplier() }),
        {}
      )
    )
  }, [bookmarks])

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const fetchedBookmarks = await window.electrons.getAllBookmarks()
        'error' in fetchedBookmarks
          ? setError(fetchedBookmarks.error)
          : setBookmarks(fetchedBookmarks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [])

  useEffect(() => {
    if (navId === 1) setView('main')
    else if (navId === 2) setView('spaces')
    else if (navId === 3) setView('serendipity')
  }, [navId])

  useEffect(() => {
    if (folderId === 0) {
      setView(navId === 1 ? 'main' : navId === 2 ? 'spaces' : navId === 3 ? 'serendipity' : 'main')
    } else {
      setView('folder')
    }
  }, [folderId, navId])

  const handleCreateFolder = async () => {
    try {
      await window.electrons.createFolderAndAddBookmarks(
        folderName,
        filteredBookmarks.map((bm) => bm.id)
      )
      setFolderName('')
      setModal(false)
    } catch (err) {
      console.error('Failed to create folder and add bookmarks:', err)
    }
  }

  const handleNavigation = (newNavId: number) => {
    setNavId(newNavId)
    setFolderId(0) // Reset folder ID when navigating
  }

  const displayedBookmarks = searchString ? filteredBookmarks : bookmarks

  const breakpointColumnsObj = {
    default: 6,
    1590: 5,
    1332: 4,
    1092: 3,
    500: 2
  }

  const overlayStyle = {
    background: `
      radial-gradient(
        circle at top left,
        rgba(20, 22, 30, 0) 0%,
        rgba(20, 22, 30, 0.1) 20%,
        rgba(20, 22, 30, 0.2) 40%,
        rgba(20, 22, 30, 0.3) 60%,
        rgba(20, 22, 30, 0.4) 80%,
        rgba(20, 22, 30, 0.5) 100%
      )
    `,
    opacity: overlayOpacity,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none' as const
  }

  const renderContent = () => {
    switch (view) {
      case 'spaces':
        return <Spaces navId={navId} setNavId={handleNavigation} setFolderId={setFolderId} />
      case 'serendipity':
        return <Serendipity  />
      case 'folder':
        return folderId !== 0 ? (
          <FolderPage
            folderId={folderId}
            navId={navId}
            setNavId={handleNavigation}
            setFolderId={setFolderId}
            // setBookmarks={setBookmarks}
          />
        ) : null
      default:
        return (
          <>
            <BookmarkSearch
              setFilteredBookmarks={setFilteredBookmarks}
              setSearchString={setSearchString}
            />
            {modal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-4 rounded-md">
                  <h2 className="text-xl mb-4">Create New Folder</h2>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Folder Name"
                    className="border p-2 rounded-md mb-4 w-full"
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="bg-blue-500 text-white p-2 rounded-md"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            )}
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              <div
                ref={bookmarkFormRef}
                className={cn(
                  'relative z-20 hover:ring-4 ring-[#33384e] transition-all duration-100 rounded-md mb-5',
                  {
                    'ring-4 ring-[#33384e]': isBookmarkFormFocused
                  }
                )}
              >
                <BookmarkForm
                  onFocus={handleBookmarkFormFocus}
                  onBlur={handleBookmarkFormBlur}
                />
              </div>
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => <SkeletonCard key={index} />)
                : displayedBookmarks.map((bookmark) => (
                    <BookmarkModal
                      key={bookmark.id}
                      screenshot={bookmark.screenshot}
                      text={bookmark.text}
                      folder={bookmark.folder}
                      modal={modal}
                      bookmarkId={bookmark.id}
                      title={bookmark.title}
                      tags={bookmark.tags}
                      bookmarkHeights={bookmarkHeights[bookmark.id] || 1}
                      
                    />
                  ))}
            </Masonry>
          </>
        )
    }
  }

  return (
    <div className="bg-[#14161e] min-h-screen px-[80px]">
      <Navbar setNavId={handleNavigation} navId={navId} />
      {renderContent()}
      {isBookmarkFormFocused && (
        <div
          className="absolute top-[138px] left-0 right-0 bottom-0 transition-all duration-100 ease-in z-10"
          style={overlayStyle}
        />
      )}
    </div>
  )
}

export default EveryBookmark
