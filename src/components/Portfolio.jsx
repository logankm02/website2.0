import { useState } from "react";
import Hero from "../sections/Hero";
import Education from "../sections/Education";
import Experience from "../sections/Experience";
import Projects from "../sections/Projects";
import Skills from "../sections/Skills";
import Contact from "../sections/Contact";

// The full portfolio page content. With `videoBackground` the hero plays the
// looping video and content shows immediately (an intro overlay handles the
// reveal); otherwise the hero uses the banner image and everything fades in
// once the profile photo has loaded, after which `onReady` fires.
export default function Portfolio({ videoBackground = false, onReady }) {
  const [fadeIn, setFadeIn] = useState(videoBackground);

  const handlePhotoLoad = () => {
    setFadeIn(true);
    onReady?.();
  };

  const fadeClass = videoBackground
    ? ""
    : `transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`;

  return (
    <main>
      <Hero
        videoBackground={videoBackground}
        fadeClass={fadeClass}
        onPhotoLoad={videoBackground ? undefined : handlePhotoLoad}
      />
      <div className={`flex flex-col items-center mx-4 md:mx-10 ${fadeClass}`}>
        <Education />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </div>
    </main>
  );
}
