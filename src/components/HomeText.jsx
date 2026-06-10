import React from 'react';
import { useMediaQuery } from 'react-responsive';

export const HomeText = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)'})
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  return (
      <div className="text-center w-full text-white p-4 md:p-8" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25), 0 4px 24px rgba(0,0,0,0.15)' }}>
            <h1 className="text-3xl md:text-6xl font-bold mb-3 md:mb-4 leading-tight">Hi, I'm Logan</h1>
            <p className="text-sm md:text-lg mb-2 md:mb-3 px-2">Autonomous Systems, AI & Embedded Hardware</p>
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm md:text-lg mb-3 md:mb-4 px-2">
              <span>UC Berkeley MEng EECS '26, University of Rochester CS & Economics '25</span>
            </div>
            {!isMobile && <p className="text-sm md:text-base text-white">Click anywhere to learn more</p>}
          </div>    
  )
}