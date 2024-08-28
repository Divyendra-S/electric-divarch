import React, { useEffect, useState } from "react";

import logo from "../../assets/logo.png";

import { toast } from "sonner";
import Navbar from "../EverythingComponents/Navbar";
import { SkeletonCard } from "../EverythingComponents/SkeletonCard";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
interface Bookmark {
  id: number;
  screenshot: string | null;
}

interface Folder {
  id: number;
  name: string;
  createdAt: Date;
  firstBookmark: Bookmark | null;
  
}

const Spaces = ({setNavId,navId}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");


  const fetchFolders = async () => {
    try {
      const fetchedFolders = await window.electrons.getFoldersWithFirstBookmark();
      
      if ('error' in fetchedFolders) {
        // Handle error case
        // setError(fetchedFolders.error);
        setFolders([]);
      } else {
        // Handle success case
        setFolders(fetchedFolders);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    
  
    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    
    try {
      const response = await window.electrons.createFolder(
        folderName,
        
      );
      
      if ("error" in response) {
        toast.error("Failed to create folder ");
        setIsOpen(false);
        setFolderName("");
      } else {
        toast.success("Folder created successfully");
        fetchFolders()
        setIsOpen(false);
        setFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder and adding bookmarks:", error);
      toast.error("Failed to create folder and add bookmarks");
    }
  };
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-[#14161e] min-h-screen ">
      <Navbar setNavId={setNavId} navId={navId} />
      <main className="">
        <div className="relative w-full mt-[30px]">
          <input
            value='All spaces'
            className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
            readOnly
          />
          {/* <button
            onClick={() => setIsOpen(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2  ml-4   px-3.5 py-2 rounded-full text-sm flex items-center transition-all duration-300 font-nunito hover:bg-[#2a2b38] border border-[#ff5924] mt-2 tracking-wider text-[#748297] "
          >
            SAVE SMART SPACE
          </button> */}
          <div className="w-full h-[1px] bg-[#36373a] mt-[7px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
            <div className="moving-highlight"></div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2  ml-4   px-3.5 py-1.5 rounded-full text-sm flex items-center transition-all duration-300 font-nunito hover:bg-[#2a2b38] border border-[#ff5924] mt-2 tracking-wider text-[#748297] "
          >
            CREATE SPACE
          </button>
        </div>
        <div className=" grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
            : folders.map((folder) => (
                <div key={folder.id} className="shadow-md overflow-hidden rounded-lg">
                  <a href={`/spaces/${folder.id}`}>
                    <div className="cursor-pointer">
                      {folder.firstBookmark && folder.firstBookmark.screenshot ? (
                        <div style={{ position: 'relative'}} className=" aspect-video">
                          <img
                            src={`data:image/png;base64,${folder.firstBookmark.screenshot}`}
                            alt={folder.name}
                            className="rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="p-5 bg-[#1e1f2a] h-full flex flex-col justify-between rounded-md">
                          <p className="text-[#748297] text-sm font-nunito">No Image</p>
                        </div>
                      )}
                      <div className="p-2">
                        <h3 className="text-sm font-nunito truncate text-center text-white">
                          {folder.name}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
        </div>
      </main>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger />
        <DialogContent className=" w-[440px] h-[469px] px-[30px] py-10 pt-5 font-nunito  bg-[#0a0b0f] ">
          <div className="p-4 text-center flex flex-col items-center pt-0">
            <img src={logo} alt="logo" width="100" height="60" />
            <h2 className="text-4xl mb-4">Create New Folder</h2>
            <p className="text-lg font-extralight text-[#a7b4c6] ">
              This "smart space" is a dynamic collection of one or more search
              terms saved into one space.
            </p>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Name your new space"
              className="w-full p-[15px] bg-[#14161e] border-[#626c7a] text-center border-2 rounded h-[55.5px] text-lg mt-[30px] "
            />
            <button
              onClick={handleCreateFolder}
              className="mt-4 bg-[#626c7a] text-black  rounded-full tracking-widest text-xs px-5 py-[13px] "
            >
              CREATE FOLDER
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Spaces;
