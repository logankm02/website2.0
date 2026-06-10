import { useState } from "react";
import BackgroundVideo from "../BackgroundVideo";
import HomeText from "../HomeText";
import Spinner from "../Spinner";

// Full-screen video intro for desktop: click anywhere to fade it out.
export default function IntroDesktop({ onDismissed }) {
  const [isFading, setIsFading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const dismiss = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(onDismissed, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={videoReady ? dismiss : undefined}
      style={{
        opacity: isFading ? 0 : 1,
        transition: isFading ? "opacity 0.6s ease" : "none",
        pointerEvents: isFading ? "none" : "auto",
      }}
    >
      {!videoReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Spinner />
        </div>
      )}

      <BackgroundVideo onCanPlay={() => setVideoReady(true)} />

      {videoReady && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[95%] max-w-[1000px] px-4">
          <HomeText />
        </div>
      )}
    </div>
  );
}
