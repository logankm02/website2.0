import { useState } from "react";
import Portfolio from "../components/Portfolio";
import IntroDesktop from "../components/intro/IntroDesktop";
import IntroMobile from "../components/intro/IntroMobile";
import useMediaQuery from "../hooks/useMediaQuery";

// Landing route: the portfolio with a full-screen video intro overlay on top.
export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [introDone, setIntroDone] = useState(false);
  const Intro = isMobile ? IntroMobile : IntroDesktop;

  return (
    <div
      className={`w-full min-h-screen relative transition-colors duration-1000 ${
        introDone ? "bg-page" : "bg-black"
      }`}
    >
      <Portfolio videoBackground />
      {!introDone && <Intro onDismissed={() => setIntroDone(true)} />}
    </div>
  );
}
