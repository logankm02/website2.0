import React, { useState } from 'react';
import { HomeText } from '../components/HomeText';
import About from './About';
import { useBackground } from '../contexts/BackgroundContext';
import { ring } from 'ldrs';
ring.register();

export default function HomeIntroDesktop() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const { setAboutContentLoaded } = useBackground();

  const dismiss = () => {
    if (isFading || isDismissed) return;
    setIsFading(true);
    setTimeout(() => {
      setIsDismissed(true);
      setAboutContentLoaded(true);
    }, 600);
  };

  return (
    <div>
      <About videoBackground={true} />

      {!isDismissed && (
        <div
          className="fixed inset-0 z-50 cursor-pointer"
          onClick={videoReady ? dismiss : undefined}
          style={{
            opacity: isFading ? 0 : 1,
            transition: isFading ? 'opacity 0.6s ease' : 'none',
            pointerEvents: isFading ? 'none' : 'auto',
          }}
        >
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <l-ring size="40" stroke="4" bg-opacity="0" speed="2" color="black" />
            </div>
          )}

          <video
            autoPlay muted loop playsInline
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            src="/video/background.mp4"
          />

          {videoReady && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[95%] max-w-[1000px] px-4">
              <HomeText />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
