import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

export const HomeText = () => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)'})
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    window.addEventListener("mousemove", mouseMove)
    
    return () => {
      window.removeEventListener("mousemove", mouseMove)
    }
  }, [])
  return (
      <div className="text-center w-full text-white p-8 drop-shadow-lg">
            <h1 className="text-6xl font-bold mb-4">Hi, I'm Logan Kinajil-Moran</h1>
            <p className="text-lg mb-3">An electrical engineering and computer science student from New Zealand 🇳🇿</p>
            <p className="text-lg mb-4">Incoming MEng EECS student at UC Berkeley</p>
            {isMobile && <p className="text-base">Tap anywhere to learn more!</p>}
            {isDesktop && createPortal(
              <motion.div 
                className="fixed pointer-events-none z-50" 
                style={{
                  left: mousePosition.x,
                  top: mousePosition.y-30,
                  fontSize: '14px',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                Click to learn more
              </motion.div>,
              document.body
            )}
          </div>    
  )
}