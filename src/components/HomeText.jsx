import React from 'react';
import { useMediaQuery } from 'react-responsive';

export const HomeText = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)'})
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  return (
      <div className="text-center w-auto text-white border rounded-lg bg-slate-800 bg-opacity-80 p-8">
            <h1 className="text-2xl font-bold mb-4">Hi, I'm Logan Kinajil-Moran</h1>
            <h2 className="text-lg font-semibold mb-2">Welcome to my Website!</h2>
            <p className="text-base mb-2">I'm a electrical engineering and computer science student from New Zealand 🇳🇿</p>
            <p className="text-base mb-2">Incoming MEng EECS at UC Berkeley</p>
            {isMobile && <p className="text-base">Tap anywhere to learn more!</p>}
            {isDesktop && <p className="text-base">Click anywhere to learn more!</p>}
          </div>    
  )
}