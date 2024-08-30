import React, { useEffect, useRef, useState } from "react";

import { toast } from "sonner";
import { Bookmark, Folder } from "../../lib/schema";
import { Button } from "../ui/button";
import { fetchBookmarks } from "@renderer/lib/atoms";
type BookmarkCardProps = {
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  onFocus: () => void;
  onBlur: () => void;
};

const BookmarkForm = ({ setBookmarks, onFocus, onBlur  }: BookmarkCardProps) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await window.electrons.createBookmark(text)
      // const response = await window.electrons.createBookmarkWithScreenshot(text)
      // const bookmark = await window.electrons.getAllBookmarks()
      // // await window.electrons.fetchOgimage('https://www.prisma.io/docs/orm/prisma-schema/data-model/models')
      // const tags = await window.electrons.createTags('https://www.prisma.io/docs/orm/prisma-schema/data-model/models')
      if(!response) console.log("Error creating bookmark");
      if (response?.error) {
        toast.error(response?.error);
      }
      toast.success(response?.message);
      
      // const allBookmarks = await window.electrons.getAllBookmarks();

      // if ("error" in allBookmarks) {
      //   // Handle error case
      //   console.error("Error fetching bookmarks:", allBookmarks.error);
      //   // Optionally, you can set an error state here if you have one
      //   // setError(allBookmarks.error);
      // } else {
      //   // Handle success case
      //   setBookmarks(allBookmarks);
      // }
      setText("");
    } catch (error) {
      console.error("Error creating bookmark:", error);
      // Optionally, you can set an error state here if you have one
      // setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height - important to shrink on delete
      textarea.style.height = "auto";
      // Set height based on scroll height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  const handleKeyDown = async(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    

    }
  };
 

  return (
    <form onSubmit={handleSubmit} className=" font-nunito ">
      <div className=" aspect-square flex flex-col flex-grow p-5 pt-[14px] rounded-md bg-[#1e1f2a] "
      onFocus={onFocus}>
        <label
          htmlFor="textarea"
          className="text-[#ff5924] text-xs tracking-widest "
        >
          ADD A NEW NOTE
        </label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing here..."
          onFocus={onFocus}
          onBlur={onBlur}
          rows={4}
          className="w-full rounded-md border-none resize-none focus:ring-0 focus:outline-none bg-transparent placeholder-[#5f697e]   overflow-hidden"
          style={{
            minHeight: "4em", // Ensure the textarea has an initial height corresponding to 4 rows
          }}
        />
      </div>
      {/* <Button type="submit" className="mt-2" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </Button> */}
    </form>
  );
};

export default BookmarkForm;
