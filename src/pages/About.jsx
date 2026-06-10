import { useEffect, useRef, useState } from "react";
import Portfolio from "../components/Portfolio";

// Direct route to the portfolio without the video intro: dark backdrop while
// loading, then the page gradient fades in shortly after the content does.
export default function About() {
  const [bgReady, setBgReady] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleReady = () => {
    timeoutRef.current = setTimeout(() => setBgReady(true), 1100);
  };

  return (
    <div
      className={`w-full min-h-screen relative transition-colors duration-1000 ${
        bgReady ? "bg-page" : "bg-gray-900"
      }`}
    >
      <Portfolio onReady={handleReady} />
    </div>
  );
}
