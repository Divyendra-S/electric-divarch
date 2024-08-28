'use client'
import React, { useEffect, useState } from 'react'

import { CircleChevronLeft } from 'lucide-react'

import { Bookmark, Folder } from '../../lib/schema'
import Navbar from '../EverythingComponents/Navbar'
import Masonry from 'react-masonry-css'
import { SkeletonCard } from '../EverythingComponents/SkeletonCard'
import BookmarkModal from '../EverythingComponents/BookmarkModal'

const getRandomHeightMultiplier = () => {
  const multipliers = [1, 0.8, 1, 1.1, 1.2, 0.7, 1.3]
  return multipliers[Math.floor(Math.random() * multipliers.length)]
}

const FolderPage = ({ folderId, navId, setNavId, setFolderId,setBookmarks }) => {
  const [folderBookmarks, setFolderBookmarks] = useState<Bookmark[]>([])
  const [folder, setFolder] = useState<Folder | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarkHeights, setBookmarkHeights] = useState<{
    [key: number]: number
  }>({})
  const [modal, setModal] = useState<boolean>(true)
  const [folderName, setFolderName] = useState<string>('')
  const [isFolder, setIsFolder] = useState<boolean>(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!folderId) {
        setFolderBookmarks([])
        setFolder(null)
        setIsLoading(false)
        return
      }

      try {
        const fetchedFolder = await window.electrons.getFolderById(Number(folderId))
        if (!fetchedFolder) {
          setError('Folder not found')
          setIsLoading(false)
          return
        }
        setFolder(fetchedFolder)
        setFolderName(fetchedFolder.name)

        const fetchedBookmarks: any = await window.electrons.getBookmarksByFolderId(
          Number(folderId)
        )

        if ('error' in fetchedBookmarks) {
          // Handle error case
          setError(fetchedBookmarks.error)
          setFolderBookmarks([])
        } else {
          // Handle success case
          setFolderBookmarks(fetchedBookmarks)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [folderId])
  useEffect(() => {
    const newHeights = folderBookmarks.reduce(
      (acc, bookmark) => {
        acc[bookmark.id] = getRandomHeightMultiplier()
        return acc
      },
      {} as { [key: number]: number }
    )

    setBookmarkHeights(newHeights)
  }, [folderBookmarks])

  const handleFolderNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value)
  }

  const handleFolderNameBlur = async () => {
    if (folder && folder.name !== folderName) {
      try {
        await window.electrons.updateFolderName(folder.id, folderName)
        setFolder((prevFolder) => (prevFolder ? { ...prevFolder, name: folderName } : null))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
    }
  }

  const breakpointColumnsObj = {
    default: 6,
    1590: 5,
    1332: 4,
    1092: 3,
    500: 2
  }
  if (!folderId) return null
  if (error) return <div>Error: {error}</div>

  return (
    <div className="bg-[#14161e] min-h-screen ">
      {/* <Navbar navId={navId} setNavId={setNavId}/> */}
      <main className="">
        <div className="flex items-center mb-4">
          {folder && (
            <div className="relative w-full mt-[40px] ">
              <div className="flex items-center">
                <div
                  onClick={() => {
                    setFolderId(0)
                    setNavId(2)
                  }}
                  className=""
                >
                  <CircleChevronLeft
                    className="text-[#748297] transition-all duration-150 hover:text-white mr-5 mt-2 cursor-pointer"
                    size={38}
                  />
                </div>
                <input
                  value={folderName}
                  onChange={handleFolderNameChange}
                  onBlur={handleFolderNameBlur}
                  className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
                />
              </div>
              <div className="w-full h-[1px] bg-[#36373a] mt-[6px]"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
                <div className="moving-highlight"></div>
              </div>
            </div>
          )}
        </div>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
            : folderBookmarks.map((bookmark) => (
                <div key={bookmark.id} className="">
                  <BookmarkModal
                    screenshot={bookmark.screenshot}
                    text={bookmark.text}
                    key={bookmark.id}
                    folder={folder}
                    modal={true}
                    bookmarkId={bookmark.id}
                    title={bookmark.title}
                    tags={bookmark.tags}
                        bookmarkHeights={bookmarkHeights[bookmark.id] || 1}
                        setBookmarks={setBookmarks}
                    setFolderBookmarks={setFolderBookmarks}
                    isFolder={isFolder}
                  />
                </div>
              ))}
        </Masonry>
      </main>
    </div>
  )
}

export default FolderPage
