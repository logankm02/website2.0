import { Html, useProgress } from "@react-three/drei";
import { metronome } from 'ldrs';
import { useEffect } from 'react';

metronome.register()

export const Loader = ({ setIsLoaded }) => {
  const { progress } = useProgress();

    useEffect(() => {
        if (progress === 100) {
            setIsLoaded(true);
        }
    }, [progress, setIsLoaded]);

  return (
    <Html center>
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
        <l-metronome
          size="50"
          speed="1.6" 
          color="black" 
        ></l-metronome>
      </div>
    </Html>
  );
};