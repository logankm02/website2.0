import React, { useEffect } from 'react';
import { Html, useProgress } from "@react-three/drei";
import { ring } from 'ldrs'
ring.register()



export const Loader = ({ setIsLoaded }) => {
  const { progress } = useProgress();

    useEffect(() => {
        if (progress === 100) {
            setIsLoaded(true);
        }
    }, [progress, setIsLoaded]);

  return (
    <Html center>
      <l-ring
        size="40"
        stroke="4"
        bg-opacity="0"
        speed="2" 
        color="black" 
      ></l-ring>
    </Html>
  );
};