import { Component, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import WorldScene from '../world/WorldScene';
import { loadWorld } from '../world/assets';
import { locationsForWorld } from '../world/locations';
import '../world/world.css';

class WorldErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="world-failure"><h1>The valley couldn’t open.</h1><p>Your browser may not support this 3D experience. The rest of the website is still here.</p><a href="/about">Visit the portfolio →</a><button onClick={() => window.location.reload()}>Try again</button></div>;
    return this.props.children;
  }
}
function DestinationDialog({ destination, onClose, locations, worldName }) {
  const ref = useRef();
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog className="world-dialog" ref={ref} onCancel={e => { e.preventDefault(); onClose(); }}>
    <button className="world-close" aria-label="Close dialog" onClick={onClose}>×</button>
    <p className="world-eyebrow">{destination.id === 'map' ? 'Find your way' : worldName}</p>
    <h2>{destination.label}</h2><p>{destination.body}</p>
    {destination.id === 'map' ? <div className="world-map-list">{locations.filter(l => !l.secret && l.id !== 'welcome').map((l,i) => <a key={l.id} href={l.links[0].href}><span>0{i + 1}</span><div><strong>{l.label}</strong><small>{l.links[0].label}</small></div><span>↗</span></a>)}</div> : <div className="world-destination-links">{destination.links.map(link => <a key={link.href} href={link.href} target={link.href.startsWith('https') ? '_blank' : undefined} rel={link.href.startsWith('https') ? 'noopener noreferrer' : undefined}>{link.label}<span>{link.href.startsWith('https') ? '↗' : '→'}</span></a>)}</div>}
    <button className="world-return" onClick={onClose}>Back to the trail</button>
  </dialog>;
}
function WorldPage() {
  const campus = new URLSearchParams(window.location.search).get('campus');
  const worldName = campus === 'rochester' ? 'Eastman Quad' : campus === 'berkeley' ? 'Memorial Glade' : 'Logan City';
  const [assets, setAssets] = useState(null), [progress, setProgress] = useState(0), [error, setError] = useState(null);
  const locations = locationsForWorld(assets?.manifest);
  const [started, setStarted] = useState(false), [paused, setPaused] = useState(false), [destination, setDestination] = useState(null), [nearest, setNearest] = useState(null);
  const [qualityMode, setQualityMode] = useState('auto');
  const [quality, setQuality] = useState(() => navigator.hardwareConcurrency <= 4 ? 'low' : 'balanced');
  const slowWindows = useRef(0), debug = useRef(null), [stats, setStats] = useState(null);
  const debugEnabled = new URLSearchParams(window.location.search).has('debug');
  useEffect(() => {
    let cancelled = false, resource;
    loadWorld(value => { if (!cancelled) setProgress(previous => Math.max(previous, value)); }, campus).then(result => { resource = result; if (cancelled) result.dispose(); else setAssets(result); }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; resource?.dispose(); };
  }, [campus]);
  useEffect(() => {
    const prior = document.title; document.title = `${worldName} · Logan Kinajil-Moran`;
    return () => { document.title = prior; };
  }, [worldName]);
  useEffect(() => { if (!debugEnabled) return; const id = setInterval(() => setStats(debug.current), 500); return () => clearInterval(id); }, [debugEnabled]);
  const pause = useCallback(() => setPaused(true), []);
  const performance = useCallback(fps => {
    if (qualityMode !== 'auto') return;
    slowWindows.current = fps < 27 ? slowWindows.current + 1 : 0;
    if (slowWindows.current >= 2) setQuality('low');
  }, [qualityMode]);
  const focus = () => requestAnimationFrame(() => document.querySelector('.world-page canvas')?.focus());
  const start = () => { setStarted(true); setPaused(false); focus(); };
  const close = () => { setDestination(null); focus(); };
  const running = started && !paused && !destination;
  return <main className="world-page">
    <div className="world-canvas" style={!assets ? { backgroundImage: 'url(/world/arrival.png)' } : undefined}>
      {assets && <Canvas shadows={quality !== 'low'} dpr={[1, quality === 'high' ? 1.75 : quality === 'low' ? 1 : 1.35]} camera={{ fov: 58, near: .1, far: 700 }} gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setError('The graphics connection was interrupted. Reload the page to return to Logan City.'); }); }}>
        <WorldScene assets={assets} quality={quality} running={running} onNearest={setNearest} onInteract={setDestination} onPause={pause} onPerformance={performance} debug={debugEnabled ? debug : null} />
      </Canvas>}
    </div>
    <header className="world-topbar">
      <a href="/world" className="world-brand" aria-label="Logan City"><span className="world-monogram">LK</span><span>{worldName.toUpperCase()}<small>{campus ? 'A campus chapter' : 'Logan’s little world'}</small></span></a>
      <nav aria-label="World navigation">
        <button onClick={() => setDestination({ id: 'map', label: worldName, body: campus ? 'Explore the campus landmarks, or use the return portal to head back to LOGAN CITY.' : 'The school house is northwest, mission control northeast, and the maker lab east of the central avenue.' })}>Directory <span>↗</span></button>
        <label className="world-quality"><span className="sr-only">Rendering quality</span><select aria-label="Rendering quality" value={qualityMode} onChange={e => { setQualityMode(e.target.value); setQuality(e.target.value === 'auto' ? 'balanced' : e.target.value); }}><option value="auto">Quality · Auto</option><option value="high">Quality · High</option><option value="balanced">Quality · Balanced</option><option value="low">Quality · Low</option></select></label>
        <a href="/about" className="world-portfolio-link">Portfolio <span>↗</span></a>
      </nav>
    </header>
    {(!started || paused) && !destination && <section className="world-arrival" aria-label={started ? 'Paused' : `Welcome to ${worldName}`}>
      <div className="world-arrival-copy">
        <p className="world-eyebrow">{started ? 'Take a breath' : 'A new way to get to know me'}</p>
        <h1>{started ? <>The trail<br /><em>can wait.</em></> : <>Take the<br /><em>scenic route.</em></>}</h1>
        <p>{started ? `Your place in ${worldName} is right where you left it.` : campus ? 'An open-air chapter of my university years. Walk the quad, visit the landmarks, and find your way back through the portal.' : 'A little world of projects, stories, and things to play. Pick a path. See where it leads.'}</p>
        {error ? <div role="alert" className="world-load-error"><p>{error}</p><a href="/about">Open the portfolio →</a><button onClick={() => window.location.reload()}>Reload</button></div> : <button className="world-enter" disabled={!assets} onClick={start}>{assets ? (started ? 'Back to exploring' : `Enter ${worldName}`) : `Preparing your arrival · ${progress}%`}<span>→</span></button>}
        {!assets && !error && <progress max="100" value={progress} aria-label="Loading the village" />}
        <a className="world-text-link" href="/about">Prefer the usual website? It’s right here ↗</a>
      </div>
      <div className="world-arrival-note"><span>{campus === 'rochester' ? '02' : campus === 'berkeley' ? '03' : '01'} / {worldName.toUpperCase()}</span><p>Some things are better<br />discovered on foot.</p></div>
    </section>}
    {started && !paused && !destination && <>
      <div className="world-location"><span className="world-compass">N<br />↑</span><div>{worldName.toUpperCase()}<small>{nearest ? nearest.label : campus ? 'Campus walk' : 'Central avenue'}</small></div></div>
      {nearest && <button className="world-interact" onClick={() => setDestination(nearest)}><kbd>E</kbd><span>{nearest.kind}<strong>{nearest.label}</strong></span><span>↗</span></button>}
      <div className="world-controls"><span><kbd>W A S D</kbd> Move</span><span><kbd>SHIFT</kbd> Run</span><span>Drag to look</span><span><kbd>E</kbd> Interact</span><button onClick={pause}>Pause <kbd>ESC</kbd></button></div>
    </>}
    {destination && <DestinationDialog destination={destination} onClose={close} locations={locations} worldName={worldName} />}
    {error && started && <div role="alert" className="world-runtime-error">{error} <a href="/about">Open portfolio</a></div>}
    {stats && <output className="world-debug" aria-label="Development diagnostics">{JSON.stringify({ ...stats, quality })}</output>}
    <p className="world-mobile-note">This first edition is made for a keyboard and mouse. <a href="/about">Visit the portfolio →</a></p>
  </main>;
}
export default function World() { return <WorldErrorBoundary><WorldPage /></WorldErrorBoundary>; }
