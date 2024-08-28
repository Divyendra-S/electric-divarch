import Navbar from "../EverythingComponents/Navbar";
import ScreenshotComponent from "../EverythingComponents/ScreenshotComponent";




const Serendipity = ({setBookmark}) => {
  return (
    <div className="bg-[#14161e] min-h-screen ">
      {/* <Navbar setNavId={setNavId} navId={navId} /> */}
      <ScreenshotComponent setBookmarks={setBookmark} />
      
    </div>
  );
};

export default Serendipity;
