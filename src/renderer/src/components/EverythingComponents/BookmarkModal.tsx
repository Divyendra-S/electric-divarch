import React, { useState, useRef, useEffect } from "react";

import BookmarkCard from "./BookmarkCard";




import { Plus, X, Circle, Trash2 } from "lucide-react";

import FolderSelector from "./FolderSelector";

import { toast } from "sonner";


import { Bookmark, Folder } from "../../lib/schema";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";





type BookmarkCardProps = {
  screenshot: string | null;
  text: string;
  title: string | null;
  tags: string;
  folder: Folder | null;
  bookmarkId: number;
  modal?: boolean;
  bookmarkHeights: number;
  isFolder?: boolean;
  setBookmarks?: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setFolderBookmarks?: React.Dispatch<React.SetStateAction<Bookmark[]>>;
};

const BookmarkModal: React.FC<BookmarkCardProps> = ({
  screenshot,
  text,
  title,
  tags,
  folder,
  bookmarkId,
  modal,
  bookmarkHeights,
  setBookmarks,
  setFolderBookmarks, 
  isFolder,
}) => {
  const link = text;
  const domain = extractDomain(link);
  const [newTag, setNewTag] = useState<string>("");
  const [tagArray, setTagArray] = useState<string[]>(
    tags.split(",").map((tag: string) => tag.trim())
  );
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [folders, setFolders] = useState<
    {
      name: string;
      id: number;
    }[]
  >([]);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const folderSelectorRef = useRef<HTMLDivElement>(null);
  const [bookmarkTitle, setBookmarkTitle] = useState<string>(title || "");
  const [bookmarkText, setBookmarkText] = useState<string>(text);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleAddToFolder = async (folderId: number) => {
    try {
      const result = await window.electrons.addBookmarkToFolder(bookmarkId, folderId);
      if (result.success) {
        setShowFolderSelector(false);
        toast.success("Bookmark added to folder successfully");
      } else {
        console.error(result.error);
        toast.error("Failed to add bookmark to folder");
      }
    } catch (error) {
      console.error("Error adding bookmark to folder:", error);
      toast.error("An error occurred while adding bookmark to folder");
    }
  };

  const handleDeleteBookmark = async () => {
    try {
      const result = await window.electrons.deleteBookmark(bookmarkId);
      if (result.success) {
        if (isFolder && folder) {
          const fetchedBookmarks = await window.electrons.getBookmarksByFolderId(Number(folder.id));
          if ('error' in fetchedBookmarks) {
            toast.error(`Error fetching bookmarks: ${fetchedBookmarks.error}`);
            return;
          }
          if (!setFolderBookmarks) {
            toast.error("SetBookmarks function is not defined");
            return;
          }
          setFolderBookmarks(fetchedBookmarks);
          
        } else {
          const allBookmarks = await window.electrons.getAllBookmarks();
          if ('error' in allBookmarks) {
            toast.error(`Error fetching bookmarks: ${allBookmarks.error}`);
            return;
          }
          if (!setBookmarks) {
            toast.error("SetBookmarks function is not defined");
            return;
          }
          setBookmarks(allBookmarks);
        }
        
        setIsOpen(false);
        toast.success("Bookmark deleted successfully");
      } else {
        console.error(result.error);
        toast.error("Failed to delete bookmark");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("An error occurred while deleting bookmark");
    } finally {
      
        const allBookmarks = await window.electrons.getAllBookmarks();
        if ('error' in allBookmarks) {
          toast.error(`Error fetching bookmarks: ${allBookmarks.error}`);
          return;
        }
        if (!setBookmarks) {
          toast.error("SetBookmarks function is not defined");
          return;
        }
        setBookmarks(allBookmarks);
      
    }
  };

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const fetchedFolders = await window.electrons.getFolders();
        if ('error' in fetchedFolders) {
          toast.error(`Error fetching folders: ${fetchedFolders.error}`);
          return;
        }
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast.error("An error occurred while fetching folders");
      }
    };
    fetchFolders();
  }, []);
  useEffect(() => {
    // Function to remove focus
    const removeFocus = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    // Set a small timeout to ensure the dialog has opened
    const timeoutId = setTimeout(removeFocus, 100);

    // Clean up the timeout
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        folderSelectorRef.current &&
        !folderSelectorRef.current.contains(event.target as Node)
      ) {
        setShowFolderSelector(false);
      }
    };

    if (showFolderSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFolderSelector]);

  const handleAddTag = async () => {
    if (newTag.trim()) {
      try {
        await window.electrons.addTag(bookmarkId, newTag.trim());
        setTagArray((prevTags) => [...prevTags, newTag.trim()]);
        setNewTag("");
        setIsAddingTag(false);
        toast.success("Tag added successfully");
      } catch (error) {
        console.error("Error adding tag:", error);
        toast.error("Failed to add tag");
      }
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    try {
      const response = await window.electrons.DeleteTag(bookmarkId, tagToDelete);
      if (!response.success) { 
        toast.error(response.error)
        return;
      }
      setTagArray((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
      toast.success("Tag deleted successfully");
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const handleTitleBlur = async () => {
    try {
      await window.electrons.updateBookmark(bookmarkId, bookmarkTitle, bookmarkText);
      const allBookmarks = await window.electrons.getAllBookmarks();
      if ('error' in allBookmarks) {
        toast.error(`Error fetching bookmarks: ${allBookmarks.error}`);
        return;
      }
      if (!setBookmarks) {
        toast.error("SetBookmarks function is not defined");
        return;
      }
      setBookmarks(allBookmarks);
      toast.success("Title updated successfully");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };
  
  // Similar changes for handleTextBlur

  const handleTextBlur = async () => {
    try {
      await window.electrons.updateBookmark(bookmarkId, bookmarkTitle, bookmarkText);
      const allBookmarks = await window.electrons.getAllBookmarks();
      if ('error' in allBookmarks) {
        toast.error(`Error fetching bookmarks: ${allBookmarks.error}`);
        return;
      }
      if (!setBookmarks) {
        return;
      }
      setBookmarks(allBookmarks);
      toast.success("Text updated successfully");
    } catch (error) {
      console.error("Error updating text:", error);
      toast.error("Failed to update text");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full">
        <BookmarkCard
          key={bookmarkId}
          screenshot={screenshot}
          title={title}
          description={text}
          heightMultiplier={bookmarkHeights}
        />
      </DialogTrigger>
      <DialogContent className="w-[94%] h-[85%] flex" ref={dialogRef}>
        <div
          tabIndex={-1}
          autoFocus
          style={{ position: "absolute", opacity: 0 }}
        ></div>
        <section className="w-full h-full ">
          <div className="flex flex-col items-center m-[100px] h-full ">
            {screenshot ? (
              <img
                src={`data:image/jpeg;base64,${screenshot}`}
                alt={title || "Bookmark screenshot"}
                width={600}
                height={300}
                className="rounded-lg object-cover"
              />
            ) : (
              <textarea
                value={bookmarkText}
                onChange={(e) => setBookmarkText(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-gray-500 focus:outline-none resize-none"
                placeholder="Enter text here"
                // onBlur={handleTextBlur}
                onKeyPress={(e) => e.key === "Enter" && handleTextBlur()}
                autoFocus={false}
              />
            )}

            {screenshot && (
              <>
                <div className="mt-4 text-3xl text-[#a7b4c6] font-bold font-nunito text-center bg-transparent border-none focus:outline-none">
                  {bookmarkTitle}{" "}
                </div>
                <a
                  href={text}
                  rel="noopener noreferrer"
                  className="mt-2 text-[#7A889D] text-[13px] underline font-nunito"
                >
                  VISIT ORIGINAL ARTICLE
                </a>
              </>
            )}
          </div>
        </section>
        <section className="w-[550px] rounded-lg overflow-y-scroll  flex flex-col">
          <header className="w-full h-[95px] font-nunito py-4 px-[27px] flex flex-col justify-center text-[#a7b4c6] header-gradient ">
            {screenshot ? (
              <>
                <input
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                  placeholder="Title goes here"
                  className="text-[29px] font-extralight truncate border-none p-0 text-start  focus:outline-none bg-transparent "
                  onKeyPress={(e) => e.key === "Enter" && handleTitleBlur()}
                  // onBlur={handleTitleBlur}
                  autoFocus
                />
                <a
                  href={link}
                  
                  rel="noopener noreferrer"
                  className="font-extralight "
                >
                  {domain}
                </a>
              </>
            ) : (
              <Input
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="Title goes here"
                className="text-[29px] font-extralight truncate bg-transparent border-none focus:outline-none p-0  "
                onBlur={handleTitleBlur}
              />
            )}
          </header>
          <div className="h-[calc(100%-95px)] flex flex-col justify-between scroll bg-[#1d1e28]">
            <div>
              <div className="Tldr text-[#748297] font-nunito p-4">
                <div className="top-left-text "></div>
                Content here to ensure the div is visible
              </div>
              <div className="overflow-scroll p-4 pb-0">
                {screenshot && (
                  <h3 className="text-[#a7b4c6] font-nunito mb-2">Tags:</h3>
                )}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isAddingTag
                      ? "mb-4 max-h-20 opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                  style={{
                    transform: isAddingTag
                      ? "translateY(0)"
                      : "translateY(-20px)",
                    transitionProperty: "max-height, opacity, transform",
                    transitionDuration: "400ms, 400ms, 400ms",
                    transitionDelay: isAddingTag
                      ? "0ms, 0ms, 0ms"
                      : "0ms, 0ms, 0ms",
                  }}
                >
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewTag(e.target.value)
                      }
                      placeholder="New tag"
                      className="bg-[#242531] h-[45px] focus:outline-none text-[#a7b4c6] flex-grow border-none Input"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button
                      onClick={handleAddTag}
                      className="bg-[#ff5924] hover:bg-[#ba3c11] h-[45px]"
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setIsAddingTag(!isAddingTag)}
                    className={cn(
                      "bg-[#ff5924] text-white px-2.5 py-1.5 rounded-full text-sm flex items-center transition-all duration-300 font-nunito hover:bg-[#2a2b38] border border-[#ff5924] ",
                      isAddingTag
                        ? " bg-transparent "
                        : "opacity-100 translate-y-0 duration-100 "
                    )}
                  >
                    <Plus size={13} className="mr-1" />
                    Add tag
                  </button>
                  {screenshot &&
                    tagArray.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="relative group"
                        style={{ boxShadow: "5px 5px 22px rgb(0 0 0 / 11%)" }}
                      >
                        <span className="bg-[#1c1e26] group-hover:bg-black text-[#748297] px-3 py-1.5 rounded-full text-sm font-nunito font-extralight inline-block border group-hover:border cursor-pointer">
                          {tag}
                        </span>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="absolute -top-1 -right-1 bg-[#36373a] text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#2a2b38] border "
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="gap-3 bg-[#14161e] h-[95px] relative flex items-end pb-4 justify-center ">
              <div ref={folderSelectorRef} className="">
                <div
                  onClick={() => setShowFolderSelector(!showFolderSelector)}
                  className="bg-[#1c1e26] text-[#748297] hover:bg-[#3b3f4f] rounded-full p-1.5 "
                >
                  <Circle size={23} className="" />
                </div>
                {showFolderSelector && (
                  <div>
                    <FolderSelector
                      folder={folder}
                      folders={folders}
                      onSelectFolder={handleAddToFolder}
                      onClose={() => setShowFolderSelector(false)}
                      BookmarkId={bookmarkId}
                      setBookmarks={setBookmarks}
                      isFolder={isFolder}
                    />
                  </div>
                )}
              </div>
              <div
                onClick={handleDeleteBookmark}
                className="bg-[#1c1e26] text-[#748297] hover:bg-[#3b3f4f] rounded-full "
              >
                <Trash2 size={34} className="p-1.5" />
              </div>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkModal;

function extractDomain(url: string): string {
  let domain;
  if (url.indexOf("//") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  domain = domain.split(":")[0].split("?")[0];
  return domain;
}
