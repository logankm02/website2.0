import { useEffect, useRef } from 'react';

export default function WorldIntro({ leaving, onEnter }) {
  const button = useRef(null);
  useEffect(() => { button.current?.focus({ preventScroll: true }); }, []);
  return <button ref={button} type="button" className={'world-opening' + (leaving ? ' is-leaving' : '')}
    onClick={onEnter} disabled={leaving} aria-label="Enter Logan City">
    <span className="world-opening-title">
      <span className="world-opening-kicker">LOGAN KINAJIL-MORAN</span>
      <span className="world-opening-heading">Hi, I’m Logan<span className="world-opening-dot">.</span></span>
      <span className="world-opening-sub">Click more to learn about me and my journey.</span>
    </span>
    <span className="world-opening-enter"><span className="world-opening-play" aria-hidden="true">↗</span>Click anywhere to explore</span>
    <span className="world-opening-caption">LOGAN CITY <span aria-hidden="true">·</span> YOUR ADVENTURE STARTS HERE</span>
  </button>;
}
