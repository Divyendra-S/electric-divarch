import Navbar from "../EverythingComponents/Navbar";




const Serendipity = ({setNavId,navId}) => {
  return (
    <div className="bg-[#14161e] min-h-screen ">
      <Navbar setNavId={setNavId} navId={navId} />
      {/* <ScreenshotComponent /> */}
      
    </div>
  );
};

export default Serendipity;
