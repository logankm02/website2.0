import BackgroundVideo from "../components/BackgroundVideo";
import ProfileCard from "../components/ProfileCard";
import CurrentProjects from "../components/widgets/CurrentProjects";
import NavigationWidget from "../components/widgets/NavigationWidget";
import RecentReads from "../components/widgets/RecentReads";
import WorldClock from "../components/widgets/WorldClock";
import { scrollToSection } from "../lib/scroll";

const handleLearnMore = () => scrollToSection("about");
const handleGetInTouch = () =>
  document.getElementById("getInTouch")?.scrollIntoView({ behavior: "smooth" });

// Full-viewport hero dashboard: profile card plus desktop-only widgets,
// over either the looping video or the static banner image.
export default function Hero({ videoBackground = false, fadeClass = "", onPhotoLoad }) {
  return (
    <div
      id="home"
      className={`w-screen min-h-screen md:h-screen flex flex-col relative overflow-hidden ${
        videoBackground ? "" : "bg-banner bg-cover bg-center"
      }`}
    >
      {videoBackground && <BackgroundVideo className="z-0" />}

      <div className={`flex flex-col items-center mx-4 md:mx-10 ${fadeClass}`}>
        <div className="relative z-10 w-full h-full flex items-center justify-center px-4 md:px-8 py-4 md:py-6">
          <div className="w-full max-w-7xl min-h-[90vh] md:h-[75vh] grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-6 gap-2 md:gap-3">
            <ProfileCard
              className="col-span-1 md:col-span-4 row-span-1 md:row-span-6 min-h-[88vh] md:min-h-0 p-3 md:p-4"
              onLearnMore={handleLearnMore}
              onGetInTouch={handleGetInTouch}
              onPhotoLoad={onPhotoLoad}
            />

            <div className="hidden md:block md:col-span-4 md:row-span-3 md:h-full">
              <RecentReads />
            </div>
            <div className="hidden md:block md:col-span-4 md:row-span-3 md:h-full">
              <CurrentProjects />
            </div>
            <div className="hidden md:block md:col-span-4 md:row-span-3 md:h-full">
              <WorldClock />
            </div>
            <div className="hidden md:block md:col-span-4 md:row-span-3 md:h-full">
              <NavigationWidget />
            </div>
          </div>
        </div>

        <div className="hidden md:block absolute bottom-1 md:bottom-1 left-1/2 transform -translate-x-1/2">
          <a
            href="#about"
            className="flex justify-center items-center"
            onClick={(e) => {
              e.preventDefault();
              handleLearnMore();
            }}
          >
            <img className="w-5 md:w-8 opacity-70 p-2" src="/images/arrow.png" alt="Scroll down" />
          </a>
        </div>
      </div>
    </div>
  );
}
