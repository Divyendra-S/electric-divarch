import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import logo from "../../assets/logo.png";
import { toast } from "sonner";
import { Bookmark } from "../../lib/schema";
import { debounce } from 'lodash';

interface BookmarkSearchProps {
  setFilteredBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setSearchString: React.Dispatch<React.SetStateAction<boolean>>;
}

const FocusedInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}> = ({ value, onChange, placeholder, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Move cursor to the end of the input
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    };

    focusInput();
    // Add a small delay to ensure focus after render
    const timeoutId = setTimeout(focusInput, 0);

    return () => clearTimeout(timeoutId);
  }, [value]);

  

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};


const BookmarkSearch: React.FC<BookmarkSearchProps> = ({
  setFilteredBookmarks,
  setSearchString,
}) => {
  const [tags, setTags] = useState<string>("");
  const [filteredBookmarks, setLocalFilteredBookmarks] = useState<Bookmark[]>(
    []
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  

  // useEffect(() => {
  //   const fetchBookmarks = async () => {
  //     if (tags) {
  //       try {
  //         const response = await window.electrons.searchBookmarks(tags);

  //         if (!response.success) {
  //           console.error("Error fetching bookmarks:", response.error);
  //           toast.error(response.error);
  //           setFilteredBookmarks([]);
  //           setLocalFilteredBookmarks([]);
  //         } else {
  //           setSearchString(true);
  //           setFilteredBookmarks(response.success);
  //           setLocalFilteredBookmarks(response.success);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching bookmarks:", error);
  //         toast.error("Failed to fetch bookmarks");
  //         setFilteredBookmarks([]);
  //         setLocalFilteredBookmarks([]);
  //       }
  //     } else {
  //       setFilteredBookmarks([]);
  //       setLocalFilteredBookmarks([]);
  //       setSearchString(false);
  //     }
  //   };

  //   fetchBookmarks();
  // }, [tags, setFilteredBookmarks]);

  const debouncedFetchBookmarks = useCallback(
    debounce(async (searchTags: string) => {
      if (searchTags) {
        try {
          const response = await window.electrons.searchBookmarks(searchTags);
  
          if (!response.success) {
            console.error("Error fetching bookmarks:", response.error);
            toast.error(response.error);
            setTimeout(() => {
              setFilteredBookmarks([]);
              setLocalFilteredBookmarks([]);
            }, 600);
          } else {
            setSearchString(true);
            setTimeout(() => {
              setFilteredBookmarks(response.success);
              setLocalFilteredBookmarks(response.success);
            }, 600);
          }
        } catch (error) {
          console.error("Error fetching bookmarks:", error);
          toast.error("Failed to fetch bookmarks");
          setTimeout(() => {
            setFilteredBookmarks([]);
            setLocalFilteredBookmarks([]);
          }, 600);
        }
      } else {
        setTimeout(() => {
          setFilteredBookmarks([]);
          setLocalFilteredBookmarks([]);
          setSearchString(false);
        }, 600);
      }
    }, 600),
    [setFilteredBookmarks, setSearchString]
  );
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    debouncedFetchBookmarks(tags);
  
    return () => {
      clearTimeout(timeoutId);
    };
  }, [tags, debouncedFetchBookmarks]);

  const handleCreateFolder = async () => {
    const bookmarkIds = filteredBookmarks.map((bookmark) => bookmark.id);
    try {
      const response = await window.electrons.createFolderAndAddBookmarks(
        folderName,
        bookmarkIds
      );

      if ("error" in response) {
        toast.error("Failed to create folder and add bookmarks");
        setIsOpen(false);
        setFolderName("");
      } else {
        toast.success("Folder created and bookmarks added successfully");
        setIsOpen(false);
        setFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder and adding bookmarks:", error);
      toast.error("Failed to create folder and add bookmarks");
    }
  };

  return (
    <div className="">
      <div className="relative w-full mb-4">
      <FocusedInput
          value={tags}
          onChange={setTags}
          placeholder="Search my mind..."
          className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
        />
        {/* <input
          ref={inputRef}
          type="text"
          key="bookmarkss"
          name="bookmarks"
          autoFocus
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Search my mind..."
          className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
        /> */}
        <div className="w-full h-[1px] bg-[#36373a] mt-[12px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
          <div className="moving-highlight"></div>
        </div>
        {tags && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2  ml-4   px-3.5 py-2 rounded-full text-sm flex items-center transition-all duration-300 font-nunito hover:bg-[#2a2b38] border border-[#ff5924] mt-2 tracking-wider text-[#748297] "
          >
            SAVE SMART SPACE
          </button>
        )}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger />
        <DialogContent className="w-[440px] h-[469px] px-[30px] py-10 pt-5 font-nunito bg-[#0a0b0f]">
          <div className="p-4 text-center flex flex-col items-center pt-0">
            <img src={logo} alt="logo" width="100" height="60" />
            <h2 className="text-4xl mb-4">Create New Folder</h2>
            <p className="text-lg font-extralight text-[#a7b4c6]">
              This "smart space" is a dynamic collection of one or more search
              terms saved into one space.
            </p>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Name your new space"
              className="w-full p-[15px] bg-[#14161e] border-[#626c7a] text-center border-2 rounded h-[55.5px] text-lg mt-[30px]"
            />
            <button
              onClick={handleCreateFolder}
              className="mt-4 bg-[#626c7a] text-black rounded-full tracking-widest text-xs px-5 py-[13px]"
            >
              CREATE FOLDER
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookmarkSearch;
