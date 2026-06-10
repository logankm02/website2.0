import React, { useState, useRef, useEffect } from 'react';
import { HomeText } from '../components/HomeText';
import About from './About';
import { useBackground } from '../contexts/BackgroundContext';
import { ring } from 'ldrs';
ring.register();

const THRESHOLD = 80;

export default function HomeIntroMobile() {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'animating' | 'done'
  const [videoReady, setVideoReady] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { setAboutContentLoaded } = useBackground();

  const containerRef = useRef(null);
  const touchStartY = useRef(null);
  const dragYRef = useRef(0);
  const directionLocked = useRef(null);

  const dismiss = () => {
    setPhase('animating');
    setTimeout(() => {
      setPhase('done');
      setAboutContentLoaded(true);
    }, 480);
  };

  useEffect(() => {
    if (phase !== 'intro') return;
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStartY.current = e.targetTouches[0].clientY;
      directionLocked.current = null;
      setIsDragging(true);
    };

    const onTouchMove = (e) => {
      if (touchStartY.current === null) return;
      const dy = e.targetTouches[0].clientY - touchStartY.current;
      if (!directionLocked.current && Math.abs(dy) > 5)
        directionLocked.current = dy < 0 ? 'up' : 'down';
      if (directionLocked.current === 'up') {
        e.preventDefault();
        dragYRef.current = dy;
        setDragY(dy);
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      directionLocked.current = null;
      if (Math.abs(dragYRef.current) >= THRESHOLD) {
        dragYRef.current = 0;
        setDragY(0);
        dismiss();
      } else {
        dragYRef.current = 0;
        setDragY(0);
      }
      touchStartY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [phase]);

  const isAnimating = phase === 'animating';
  const isDone = phase === 'done';
  const clampedDrag = Math.min(0, dragY);
  const dragProgress = Math.min(1, Math.abs(dragY) / THRESHOLD);

  const slideTransition = isAnimating
    ? 'transform 0.48s cubic-bezier(0.32, 0.72, 0, 1)'
    : isDragging ? 'none'
    : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

  const slide1Transform = isAnimating ? 'translateY(-100%)' : `translateY(${clampedDrag}px)`;
  const slide2Transform = isAnimating
    ? 'translateY(0)'
    : `translateY(calc(100% + ${clampedDrag}px))`;

  return (
    <div>
      {/* About always rendered underneath — no reload after swipe */}
      <About videoBackground={true} />

      {!isDone && (
        <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 50 }}>

          {/* Video background — stays fixed, never animates */}
          <video
            autoPlay muted loop playsInline
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            src="/video/background.mp4"
          />

          {!videoReady && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <l-ring size="40" stroke="4" bg-opacity="0" speed="2" color="black" />
            </div>
          )}

          {videoReady && (
            <>
              {/* Slide 1 — text, exits upward */}
              <div
                className="absolute inset-0 z-20"
                style={{ transform: slide1Transform, transition: slideTransition }}
              >
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4">
                  <HomeText />
                </div>
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white select-none"
                  style={{ opacity: 1 - dragProgress }}
                >
                  <div className="animate-bounce">
                    <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  <span className="text-xs tracking-widest uppercase opacity-70">Swipe up</span>
                </div>
              </div>

              {/* Slide 2 — exact same structure as About.jsx hero profile card */}
              <div
                className="absolute inset-0 z-10"
                style={{ transform: slide2Transform, transition: slideTransition }}
              >
                <div className="flex flex-col items-center mx-4">
                  <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-4">
                    <div className="w-full max-w-7xl min-h-[90vh] grid grid-cols-1 gap-2">
                      <div className="col-span-1 min-h-[88vh] bg-black/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 flex flex-col items-center justify-center text-center">
                        <img
                          className="rounded-full border-3 border-white/30 shadow-xl w-24 md:w-40 h-24 md:h-40 object-cover mb-2 md:mb-4"
                          src="/images/profile.jpeg"
                          alt="profile"
                        />
                        <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Logan Kinajil-Moran</h1>
                        <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                          <img src="/images/berk-eng-white.png" alt="UC Berkeley" className="h-8 w-auto object-contain" />
                          <img src="/images/rochester-white.png" alt="University of Rochester" className="h-8 w-auto object-contain" />
                        </div>
                        <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-4">
                          From Wellington, New Zealand
                        </p>
                        <div className="flex gap-1 md:gap-2 w-full mb-2 md:mb-4">
                          <a href="https://github.com/logankm02" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                            <img className="h-4 w-4" src="/images/github.png" alt="github" />
                            <span className="text-white text-xs font-medium">GitHub</span>
                          </a>
                          <a href="https://www.linkedin.com/in/logan-kinajil-moran/" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                            <img className="h-4 w-4" src="/images/linkedin.png" alt="linkedin" />
                            <span className="text-white text-xs font-medium">LinkedIn</span>
                          </a>
                        </div>
                        <div className="flex flex-col gap-1 md:gap-2 w-full">
                          <button onClick={dismiss} className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 shadow-lg text-xs md:text-sm">
                            Learn More
                          </button>
                          <button onClick={dismiss} className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/30 text-xs md:text-sm">
                            Get in Touch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
