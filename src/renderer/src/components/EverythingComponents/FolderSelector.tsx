import React from "react";

import { Bookmark, Folder } from "../../lib/schema";
import { Button } from "../ui/button";
import { cn } from "@renderer/lib/utils";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { bookmarksAtom, folderBookmarksAtom } from "@renderer/lib/atoms";



interface Folders {
  id: number;
  name: string;
}

interface FolderSelectorProps {
  folder: Folder|null;
  folders: Folders[];
  onSelectFolder: (folderId: number) => void;
  onClose: () => void;
  BookmarkId: number;
  isFolder?: boolean;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  folders,
  onSelectFolder,
  onClose,
  folder,
  BookmarkId,
  isFolder,
}) => {
  const [, setFolderBookmarks] = useAtom(folderBookmarksAtom)
  
  const fetchAllBookmarks = async() => {
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
      
    } 
  }
  {console.log(folder,"goooslso")}
  return (
    <div className="absolute bottom-full left-0 w-[232px] max-h-[150px] bg-[#14161e]  rounded-lg shadow-lg border-2 translate-x-[30px] overflow-y-scroll translate-y-[30px] ">
      
      <div className="flex flex-col  max-h-48 overflow-y-auto">
        {folders.map((folde) => (
          <Button
            key={folde.id}
            onClick={() => {
              onSelectFolder(folde.id) 
              fetchAllBookmarks()
          }}
            className="bg-[#14161e] text-[#a7b4c6] hover:bg-[#2a2b38] justify-start"
          >
            <span className={cn("rounded-full w-[14px] h-[14px] border-2 border-[#166ff4] mr-2 ", {
              "bg-[#166ff4]": folde.id === folder?.id
            })}></span>
            {folde.name}
          </Button>
        ))}
      </div>
      {/* <Button onClick={onClose} className="mt-4 w-full bg-[#ff5924] hover:bg-[#ba3c11]">
        Cancel
      </Button> */}
    </div>
  );
};

export default FolderSelector;
