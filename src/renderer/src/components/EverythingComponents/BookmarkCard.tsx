import React from "react";


interface BookmarkCardProps {
  screenshot: string | null;
  title: string | null;
  description: string;
  heightMultiplier: number;
}

const getRandomHeightMultiplier = () => {
  const multipliers = [1, 0.8, 1, 1.1, 1.2, 0.7, 1.3];
  return multipliers[Math.floor(Math.random() * multipliers.length)];
};

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  screenshot,
  title,
  description,
  heightMultiplier,
}) => {
  const width = 232; // Set a fixed width
  const baseHeight = 200;
  const height = screenshot
    ? Math.floor(baseHeight * heightMultiplier)
    : undefined;

  return (
    <div className="  shadow-md overflow-hidden  ">
      {screenshot ? (
        <>
          <div className="relative  flex-grow  ">
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt={title || "Bookmark"}
              className="rounded-md "
            />
          </div>
          <div className="p-2 ">
            <h3 className="text-sm font-nunito truncate text-center">
              {title || "Untitled"}
            </h3>
          </div>
        </>
      ) : (
        <div className="p-5 bg-[#1e1f2a] h-full flex flex-col justify-between rounded-md hover:ring-[3px] ring-inset ring-[#33384e]">
          <p className="text-[#748297]  text-sm font-nunito ">{description}</p>
          {/* <h3 className="text-lg font-semibold truncate">{title || "Untitled"}</h3> */}
        </div>
      )}
    </div>
  );
};

export default BookmarkCard;
