import { useRef, useState } from "react";
import GitHubIcon from "../components/GitHubIcon";
import useCarousel from "../hooks/useCarousel";
import { spotlightProjects as projects } from "../data/projects";

const SWIPE_THRESHOLD = 80;

export default function Projects() {
  const { activeIndex, setActiveIndex, visible, goTo, next, prev } = useCarousel(projects.length, 180);

  // Touch-drag state: the card follows the finger and flies off when released
  // past the threshold.
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDir, setFlyDir] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const dx = e.targetTouches[0].clientX - touchStartX.current;
    const dy = e.targetTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy)) setDragX(dx);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const dir = dragX > 0 ? 1 : -1;
      const nextIdx =
        dir < 0
          ? (activeIndex + 1) % projects.length
          : (activeIndex - 1 + projects.length) % projects.length;
      setFlyDir(dir);
      setIsFlying(true);
      setTimeout(() => {
        setNoTransition(true);
        setActiveIndex(nextIdx);
        setDragX(0);
        setIsFlying(false);
        setFlyDir(0);
        setTimeout(() => setNoTransition(false), 50);
      }, 280);
    } else {
      setDragX(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const active = projects[activeIndex];
  const cardX = isFlying ? flyDir * 500 : dragX;
  const cardRotate = isFlying ? flyDir * 12 : dragX * 0.04;
  const cardOpacity = isFlying ? 0 : Math.max(0.4, 1 - Math.abs(dragX) / 250);

  return (
    <div id="projects" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 pb-8">
      <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Projects</h1>

      {/* Preload all project images so swapping never flashes */}
      <div className="hidden" aria-hidden="true">
        {projects.map((p) => (
          <img key={p.id} src={p.image} alt="" />
        ))}
      </div>

      <div
        className="card-light overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${cardX}px) rotate(${cardRotate}deg)`,
          transition:
            isDragging || noTransition
              ? "none"
              : "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.28s ease",
          opacity: cardOpacity,
          willChange: "transform",
        }}
      >
        {/* Fixed height so the image never dictates the card size */}
        <div className="flex flex-col-reverse md:flex-row h-[480px] md:h-[380px]">
          {/* Info panel */}
          <div
            className={`md:w-1/2 p-5 md:p-6 flex flex-col justify-between overflow-y-auto transition-opacity ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                {activeIndex + 1} / {projects.length}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{active.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {active.tech.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{active.description}</p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <a
                  href={active.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-full shadow-sm transition-all hover:shadow-md"
                >
                  {active.cta}
                </a>
                {active.githubHref && (
                  <a
                    href={active.githubHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-full shadow-sm transition-all hover:shadow-md"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    GitHub
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center justify-center text-gray-600 transition-all hover:shadow-md"
                  aria-label="Previous project"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center justify-center text-gray-600 transition-all hover:shadow-md"
                  aria-label="Next project"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Image panel — click left/right thirds to navigate */}
          <div className="md:w-1/2 relative overflow-hidden select-none cursor-pointer">
            <img
              src={active.image}
              alt={active.title}
              className={`w-full h-full object-cover transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}
            />
            <button className="absolute left-0 top-0 bottom-0 w-1/3 group" onClick={prev} aria-label="Previous project">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-lg leading-none">‹</span>
              </div>
            </button>
            <button className="absolute right-0 top-0 bottom-0 w-1/3 group" onClick={next} aria-label="Next project">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-lg leading-none">›</span>
              </div>
            </button>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-3 border-t border-gray-100">
          {projects.map((project, idx) => (
            <button
              key={project.id}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-6 bg-gray-700" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
