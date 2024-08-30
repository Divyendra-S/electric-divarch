"use client";

import { useEffect, useState } from "react";



import { toast } from "sonner";
// import { Bookmark } from "../../lib/schema";
import { useAtom } from "jotai";
import { bookmarksAtom, fetchBookmarks } from "@renderer/lib/atoms";


// type ScreenshotResponse = {
//   screenshot?: string | undefined;
//   html?: string | undefined;
//   error?: string | undefined;
// };
// type ErrorResponse = { error: string };
// type ScreenshotComponentProps = {
//   setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>
// }
export default function ScreenshotComponent() {
  const [,setBookmarks] = useAtom(bookmarksAtom)
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{
    screenshot?: string;
    html?: string;
    tags?: string;
    title?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // useEffect(() => {
  //   window.electrons.onBookmarkChanged(() => {
  //     fetchBookmarks(); // Reload temos when a temo is created or deleted
  //   });
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      if (!url.match(/^https?:\/\//i)) {
        toast.error("Invalid URL");
        return;
      }
      saveBookmark();
      
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };
  if (bookmarkLoading) {
   
  }

  const saveBookmark = async () => {
    setBookmarkLoading(true);
    const loadingToast = toast.loading("Saving bookmark...");
    
    try {
      const response = await window.electrons.createBookmarkWithScreenshot(url)
      if (!response?.message) {
        toast.error(response?.error);
      } else {
        // const allBookmarks = await window.electrons.getAllBookmarks();
        // if ("error" in allBookmarks) {
        //   console.error("Error fetching bookmarks:", allBookmarks.error);
        //   // Optionally, you can set an error state here if you have one
        //   // setError(allBookmarks.error);
        // } else {
        //   setBookmarks(allBookmarks);
        // }
        toast.success(response.message);
        setUrl("");
        console.log(`Bookmark saved`);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while saving the bookmark");
    } finally {
      setBookmarkLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // const handleGenerateTags = async () => {
  //   if (!result?.html) return;

  //   setTagsLoading(true);

  //   try {
  //     // Generate tags

  //     const tagsRes:
  //       | { tags: string; title: string; error?: string }
  //       | undefined = await generatTags(result.html, url);
  //     if (!tagsRes) {
  //       return { message: "No tags" };
  //     }
  //     setResult((prevResult) => ({
  //       ...prevResult,
  //       tags: tagsRes?.tags,
  //       title: tagsRes?.title,
  //     }));
  //   } catch (error) {
  //     setResult((prevResult) => ({
  //       ...prevResult,
  //       error: (error as Error).message,
  //     }));
  //   } finally {
  //     setTagsLoading(false);
  //   }
  // };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Url"
          className="w-full placeholder-[#748297] focus:outline-none bg-transparent font-satisfy text-6xl pl-[6px] hover:placeholder-[#444c5c] text-[#748297] transition duration-300 ease-in-out"
          onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
        />
        <div className="w-full h-[1px] bg-[#36373a] mt-[12px] mb-5"></div>
        {/* <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "SAVE"}
        </Button> */}
      </form>
      {/* {result?.error && <p>Error: {result.error}</p>}
      {result?.screenshot && (
        <div>
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <Image
              src={`data:image/png;base64,${result.screenshot}`}
              alt="Screenshot"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <Button onClick={handleGenerateTags} disabled={tagsLoading}>
            {tagsLoading ? "Generating Tags..." : "Generate Tags"}
          </Button>
          <Button onClick={saveBookmark} disabled={bookmarkLoading}>
            {bookmarkLoading ? "Saving Bookmark..." : "Save Bookmark"}
          </Button>
          {result.tags && (
            <div>
              <p>Title: {result.title}</p>
              <p>Tags:{result.tags}</p>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
