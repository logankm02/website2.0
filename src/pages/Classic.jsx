import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, useProgress } from "@react-three/drei";
import { Soccer } from "../models/Soccer";
import HomeText from "../components/HomeText";
import Spinner from "../components/Spinner";

function CanvasLoader({ onLoaded }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) onLoaded(true);
  }, [progress, onLoaded]);

  return (
    <Html center>
      <Spinner />
    </Html>
  );
}

// The original 3D landing page: an interactive soccer scene that zooms into
// the portfolio. Kept at /classic; loaded lazily so the heavy three.js stack
// stays out of the main bundle.
export default function Classic() {
  const [isZooming, setIsZooming] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`w-full min-h-screen relative transition-colors duration-1000 ${
        loaded ? "bg-gradient-to-b from-sunset to-transparent bg-cover" : "bg-transparent"
      }`}
    >
      <section className="w-full h-screen relative">
        {loaded && !isZooming && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[95%] max-w-[1000px] px-4 transition-opacity duration-500">
            <HomeText />
          </div>
        )}
        <Canvas className="w-full h-screen bg-transparent z-0" camera={{ near: 0.1, far: 1000 }}>
          <Suspense fallback={<CanvasLoader onLoaded={setLoaded} />}>
            <Soccer position={[0, -0.9, 5]} rotation={[0, 0, 0]} onZoomStart={() => setIsZooming(true)} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </section>
    </div>
  );
}
