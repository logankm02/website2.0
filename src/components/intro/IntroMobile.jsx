import { useEffect, useRef, useState } from "react";
import BackgroundVideo from "../BackgroundVideo";
import HomeText from "../HomeText";
import ProfileCard from "../ProfileCard";
import Spinner from "../Spinner";

const SWIPE_THRESHOLD = 80;

// Full-screen video intro for mobile: swipe up to slide the headline away and
// reveal the profile card, then dismiss into the portfolio underneath.
export default function IntroMobile({ onDismissed }) {
  const [phase, setPhase] = useState("intro"); // 'intro' | 'animating'
  const [videoReady, setVideoReady] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const touchStartY = useRef(null);
  const dragYRef = useRef(0);
  const directionLocked = useRef(null);

  const dismiss = () => {
    setPhase("animating");
    setTimeout(onDismissed, 480);
  };

  useEffect(() => {
    if (phase !== "intro") return;
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
        directionLocked.current = dy < 0 ? "up" : "down";
      if (directionLocked.current === "up") {
        e.preventDefault();
        dragYRef.current = dy;
        setDragY(dy);
      }
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      directionLocked.current = null;
      const passedThreshold = Math.abs(dragYRef.current) >= SWIPE_THRESHOLD;
      dragYRef.current = 0;
      setDragY(0);
      if (passedThreshold) dismiss();
      touchStartY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isAnimating = phase === "animating";
  const clampedDrag = Math.min(0, dragY);
  const dragProgress = Math.min(1, Math.abs(dragY) / SWIPE_THRESHOLD);

  const slideTransition = isAnimating
    ? "transform 0.48s cubic-bezier(0.32, 0.72, 0, 1)"
    : isDragging
      ? "none"
      : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

  const slide1Transform = isAnimating ? "translateY(-100%)" : `translateY(${clampedDrag}px)`;
  const slide2Transform = isAnimating ? "translateY(0)" : `translateY(calc(100% + ${clampedDrag}px))`;

  return (
    <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 50 }}>
      {/* Video background — stays fixed, never animates */}
      <BackgroundVideo onCanPlay={() => setVideoReady(true)} />

      {!videoReady && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}

      {videoReady && (
        <>
          {/* Slide 1 — headline text, exits upward */}
          <div className="absolute inset-0 z-20" style={{ transform: slide1Transform, transition: slideTransition }}>
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

          {/* Slide 2 — same profile card as the portfolio hero */}
          <div className="absolute inset-0 z-10" style={{ transform: slide2Transform, transition: slideTransition }}>
            <div className="flex flex-col items-center mx-4">
              <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-4">
                <div className="w-full max-w-7xl min-h-[90vh] grid grid-cols-1 gap-2">
                  <ProfileCard
                    className="col-span-1 min-h-[88vh] p-3"
                    onLearnMore={dismiss}
                    onGetInTouch={dismiss}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
