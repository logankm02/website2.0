import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import FieldMap from '../world/FieldMap';
import WorldScene from '../world/WorldScene';
import { loadWorld } from '../world/assets';
import { locationsForWorld } from '../world/locations';
import { resolveWorldRoute } from '../world/worldRoute';
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
  return <dialog className={`world-dialog ${destination.id === 'map' ? 'is-directory' : 'is-conversation'}`} aria-labelledby="destination-name" ref={ref} onCancel={e => { e.preventDefault(); onClose(); }}>
    <button className="world-close" aria-label="Close dialog" onClick={onClose}>×</button>
    <p className="world-eyebrow">{destination.id === 'map' ? worldName : worldName}</p>
    <h2 id="destination-name">{destination.label}</h2><p>{destination.body}</p>
    {destination.id === 'map' ? <div className="world-map-list">{locations.filter(l => !l.secret && l.id !== 'welcome').map((l,i) => <a key={l.id} href={l.links[0].href}><span>0{i + 1}</span><div><strong>{l.label}</strong><small>{l.links[0].label}</small></div><span>↗</span></a>)}</div> : <div className="world-destination-links">{destination.links.map(link => <a key={link.href} href={link.href} target={link.href.startsWith('https') ? '_blank' : undefined} rel={link.href.startsWith('https') ? 'noopener noreferrer' : undefined}>{link.label}<span>{link.href.startsWith('https') ? '↗' : '→'}</span></a>)}</div>}
    <button className="world-return" onClick={onClose}>Back</button>
  </dialog>;
}
function WorldPage() {
  const route = useMemo(() => resolveWorldRoute(window.location.search), []);
  const { campus, interior, name: worldName } = route;
  const [assets, setAssets] = useState(null), [progress, setProgress] = useState(0), [error, setError] = useState(null);
  const locations = useMemo(() => locationsForWorld(assets?.manifest), [assets]);
  const mapRef = useRef(null), arrowRef = useRef(null);
  const [started, setStarted] = useState(route.startImmediately), [paused, setPaused] = useState(false), [destination, setDestination] = useState(null), [nearest, setNearest] = useState(null);
  const [qualityMode, setQualityMode] = useState('auto');
  const [quality, setQuality] = useState(() => navigator.hardwareConcurrency <= 4 ? 'low' : 'balanced');
  const slowWindows = useRef(0), debug = useRef(null), [stats, setStats] = useState(null);
  const debugEnabled = new URLSearchParams(window.location.search).has('debug');
  useEffect(() => {
    let cancelled = false, resource;
    loadWorld(value => { if (!cancelled) setProgress(previous => Math.max(previous, value)); }, route).then(result => { resource = result; if (cancelled) result.dispose(); else setAssets(result); }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; resource?.dispose(); };
  }, [route]);
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
  const interact = useCallback(location => {
    if (location.travel) window.location.assign(location.travel);
    else setDestination(location);
  }, []);
  const running = Boolean(assets) && started && !paused && !destination;
  useEffect(() => { if (assets && route.startImmediately) requestAnimationFrame(() => document.querySelector('.world-page canvas')?.focus()); }, [assets, route]);
  const chapter = campus === 'rochester' ? '02' : campus === 'berkeley' ? '03' : '01';
  const region = interior ? 'Logan City · Interior' : campus === 'berkeley' ? 'UC Berkeley' : campus === 'rochester' ? 'University of Rochester' : 'Central avenue';
  const openMap = () => setDestination({ id: 'map', label: 'Area directory', body: interior ? 'Places and links for this room.' : 'Choose a landmark to visit.' });
  return <main className="world-page">
    <div className="world-canvas" style={!assets ? { backgroundImage: 'url(/world/arrival.png)' } : undefined}>
      {assets && <Canvas shadows={quality !== 'low'} dpr={[1, quality === 'high' ? 1.75 : quality === 'low' ? 1 : 1.35]} camera={{ fov: 58, near: .1, far: 700 }} gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setError('The graphics connection was interrupted. Reload the page to return to Logan City.'); }); }}>
        <WorldScene assets={assets} quality={quality} running={running} onNearest={setNearest} onInteract={interact} onPause={pause} onPerformance={performance} mapRef={mapRef} arrowRef={arrowRef} showGreeting={running && nearest?.id === 'welcome'} debug={debugEnabled ? debug : null} />
      </Canvas>}
    </div>
    {started && !assets && !error && <div className="world-runtime-error" role="status">Opening {worldName} · {progress}%</div>}
    {(!started || paused) && !destination && <section className="world-arrival" aria-label={started ? 'Paused' : `Welcome to ${worldName}`}>
      <div className="world-arrival-copy">
        <p className="world-eyebrow"><span className="world-index">{chapter}</span> {started ? 'Field menu' : 'Area guide'}</p>
        <h1>{worldName}</h1>
        <p className="world-subtitle">{region}</p>
        <p className="world-intro">{started ? 'Exploration paused.' : campus ? 'Walk the quad and meet its landmarks.' : 'Meet Logan by the avenue, visit the lab, or take the path to campus.'}</p>
        {error ? <div role="alert" className="world-load-error"><p>{error}</p><button onClick={() => window.location.reload()}>Reload</button></div> :
          <button className="world-enter" disabled={!assets} onClick={start}>{assets ? (started ? 'Resume exploring' : 'Start exploring') : `Loading · ${progress}%`}<span aria-hidden="true">▶</span></button>}
        {!assets && !error && <progress max="100" value={progress} aria-label="Loading area" />}
        <div className="world-menu-list">
          <button onClick={openMap} disabled={!assets}>Area directory <span>↗</span></button>
          <label>Graphics <select aria-label="Rendering quality" value={qualityMode} onChange={e => { setQualityMode(e.target.value); setQuality(e.target.value === 'auto' ? 'balanced' : e.target.value); }}><option value="auto">Auto</option><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low</option></select></label>
          <a href="/about">Portfolio <span>↗</span></a>
        </div>
        <p className="world-controls">WASD to move · Shift to run · Drag to look</p>
      </div>
    </section>}
    {running && <>
      <div className="world-location"><span className="world-index">{chapter}</span><div><small>{region}</small><strong>{worldName}</strong></div></div>
      <FieldMap assets={assets} locations={locations} mapRef={mapRef} arrowRef={arrowRef} onOpen={openMap} />
      {nearest && <button className="world-interact" onClick={() => interact(nearest)}><kbd>E</kbd> {nearest.kind} <span>{nearest.id === 'welcome' ? 'Logan' : nearest.label}</span></button>}
      <button className="world-pause" onClick={pause}><kbd>Esc</kbd> Menu</button>
    </>}
    {destination && <DestinationDialog destination={destination} onClose={close} locations={locations} worldName={worldName} />}
    {error && started && <div role="alert" className="world-runtime-error">{error} <a href="/about">Open portfolio</a></div>}
    {stats && <output className="world-debug" aria-label="Development diagnostics">{JSON.stringify({ ...stats, quality })}</output>}
    <p className="world-mobile-note">This first edition is made for a keyboard and mouse. <a href="/about">Visit the portfolio →</a></p>
  </main>;
}
export default function World() { return <WorldErrorBoundary><WorldPage /></WorldErrorBoundary>; }
