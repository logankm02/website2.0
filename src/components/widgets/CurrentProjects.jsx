import { useEffect, useRef } from "react";
import WidgetHeader from "../WidgetHeader";
import useCarousel from "../../hooks/useCarousel";
import { currentProjects } from "../../data/projects";

const SWIPE_THRESHOLD = 40;

export default function CurrentProjects() {
  const { activeIndex, visible, goTo, next, prev } = useCarousel(currentProjects.length, 200);
  const touchStartX = useRef(null);

  // Auto-advance; the timer resets whenever the active project changes.
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) (diff > 0 ? next : prev)();
    touchStartX.current = null;
  };

  const active = currentProjects[activeIndex];

  return (
    <div
      className="relative card-glass transition-all w-full h-full overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="widget-gradient" />

      <WidgetHeader
        className="relative z-10 px-3 pt-3 pb-2"
        icon={
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 5h16M4 12h10M4 19h7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Project Overview"
        right={
          <div className="flex gap-1">
            {currentProjects.map((project, idx) => (
              <button
                key={project.id}
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "w-5 bg-white" : "w-2 bg-white/30"
                }`}
                aria-label={`Go to project ${idx + 1}`}
              />
            ))}
          </div>
        }
      />

      {/* Focused image — click left/right thirds to navigate */}
      <div className="relative z-10 mx-3 rounded-xl overflow-hidden flex-1 min-h-0 cursor-pointer select-none">
        <img
          src={active.image}
          alt={active.title}
          className={`w-full h-full object-cover transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        />
        <button className="absolute left-0 top-0 bottom-0 w-1/3 group" onClick={prev} aria-label="Previous project">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm leading-none">‹</span>
          </div>
        </button>
        <button className="absolute right-0 top-0 bottom-0 w-1/3 group" onClick={next} aria-label="Next project">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm leading-none">›</span>
          </div>
        </button>
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-3 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          <p className="text-white text-sm font-bold leading-tight">{active.title}</p>
          <p className="text-white/70 text-xs">{active.role}</p>
        </div>
      </div>

      <div
        className={`relative z-10 px-3 pt-2 pb-3 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <p className="text-white/80 text-xs leading-relaxed mb-2">{active.blurb}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {active.tech.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={active.link}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            {active.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
