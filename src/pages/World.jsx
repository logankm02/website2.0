import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import WorldIntro from '../world/WorldIntro';
import { INTRO_SEEN, shouldShowIntro } from '../world/intro';
import FieldMap from '../world/FieldMap';
import WorldScene from '../world/WorldScene';
import { loadWorld } from '../world/assets';
import { locationsForWorld } from '../world/locations';
import { resolveWorldRoute } from '../world/worldRoute';
import FieldGuide from '../world/FieldGuide';
import DestinationDialog from '../world/DestinationDialog';
import { guideFromHash, guideHref } from '../world/guideContent';
import '../world/world.css';

class WorldErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="world-failure"><h1>The valley couldn’t open.</h1><p>You can still read the résumé and projects using the field guide above.</p><button onClick={() => window.location.reload()}>Try again</button></div>;
    return this.props.children;
  }
}
function WorldPage() {
  const route = useMemo(() => resolveWorldRoute(window.location.search), []);
  const { campus, interior, name: worldName } = route;
  const [intro, setIntro] = useState(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_SEEN) === '1'; } catch { /* Storage can be unavailable in private contexts. */ }
    const opening = shouldShowIntro(route, window.location.hash, seen);
    // A visit beginning on a deep link starts directly there, and never
    // interrupts a later return to the city with a belated welcome.
    if (!opening) {
      try { sessionStorage.setItem(INTRO_SEEN, '1'); } catch { /* Optional persistence. */ }
    }
    return opening ? 'waiting' : 'done';
  });
  const enterWorld = useCallback(() => {
    try { sessionStorage.setItem(INTRO_SEEN, '1'); } catch { /* The camera still works without storage. */ }
    setIntro(state => state === 'waiting' ? 'flying' : state);
  }, []);
  const finishIntro = useCallback(() => setIntro('done'), []);
  const [assets, setAssets] = useState(null), [progress, setProgress] = useState(0), [error, setError] = useState(null);
  const locations = useMemo(() => locationsForWorld(assets?.manifest), [assets]);
  const mapRef = useRef(null), arrowRef = useRef(null);
  const [destination, setDestination] = useState(null), [nearest, setNearest] = useState(null);
  const [sprinting, setSprinting] = useState(false);
  const [guide, setGuide] = useState(() => guideFromHash(window.location.hash));
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
  const performance = useCallback(fps => {
    if (qualityMode !== 'auto') return;
    slowWindows.current = fps < 27 ? slowWindows.current + 1 : 0;
    if (slowWindows.current >= 2) setQuality('low');
  }, [qualityMode]);
  const focus = () => requestAnimationFrame(() => document.querySelector('.world-page canvas')?.focus());
  useEffect(() => {
    const changed = () => setGuide(guideFromHash(window.location.hash));
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const closeGuide = () => {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    setGuide(null);
    if (!destination) focus();
  };
  const changeQuality = value => { setQualityMode(value); setQuality(value === 'auto' ? 'balanced' : value); };
  const close = () => { setDestination(null); focus(); };
  const interact = useCallback(location => {
    if (location.travel) window.location.assign(location.travel);
    else setDestination(location);
  }, []);
  const running = intro === 'done' && Boolean(assets) && !error && !destination && !guide;
  useEffect(() => { if (assets && intro === 'done' && !guide && !destination) requestAnimationFrame(() => document.querySelector('.world-page canvas')?.focus()); }, [assets, guide, destination, intro]);
  const chapter = campus === 'rochester' ? '02' : campus === 'berkeley' ? '03' : '01';
  const region = interior ? 'Logan City · Interior' : campus === 'berkeley' ? 'UC Berkeley' : campus === 'rochester' ? 'University of Rochester' : 'Central avenue';
  const openMap = () => setDestination({ id: 'map', label: 'Area directory', body: interior ? 'Meet the people and inspect the exhibits in this room.' : 'Choose a landmark to visit.' });
  return <main className="world-page">
    <div className="world-canvas">
      {assets && <WorldErrorBoundary><Canvas shadows={quality === 'low' ? false : { type: PCFSoftShadowMap }} dpr={[1, quality === 'high' ? 1.75 : quality === 'low' ? 1 : 1.35]} camera={{ fov: interior ? 62 : 48, near: .1, far: 700 }} gl={{ antialias: quality === 'low', powerPreference: 'high-performance', outputColorSpace: SRGBColorSpace, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); setError('The graphics connection was interrupted. Reload the page to return to Logan City.'); }); }}>
        <WorldScene intro={intro} onIntroDone={finishIntro} assets={assets} quality={quality} running={running} onNearest={setNearest} onInteract={interact} onPerformance={performance} onSprintChange={setSprinting} mapRef={mapRef} arrowRef={arrowRef} showGreeting={running && nearest?.id === 'welcome'} debug={debugEnabled ? debug : null} />
      </Canvas></WorldErrorBoundary>}
    </div>
    {!assets && !error && <div className="world-loading" role="status">Entering {worldName}<span aria-hidden="true"> · {progress}%</span></div>}
    {assets && !error && intro !== 'done' && <WorldIntro leaving={intro === 'flying'} onEnter={enterWorld} />}
    {intro === 'done' && !guide && !destination && <nav className="world-guide-menu" aria-label="World menu"><a href={guideHref('resume')}>Résumé</a><a href={guideHref('projects')}>Projects</a><a href={guideHref('settings')} aria-label="Controls and graphics">☷</a></nav>}
    {running && <>
      <div className="world-location"><span className="world-index">{chapter}</span><div><small>{region}</small><strong>{worldName}</strong></div></div>
      {sprinting && <div className="world-sprint" aria-hidden="true">Running</div>}
      <FieldMap assets={assets} locations={locations} mapRef={mapRef} arrowRef={arrowRef} onOpen={openMap} />
      {nearest && <button className="world-interact" onClick={() => interact(nearest)}><kbd>E</kbd> {nearest.kind} <span>{nearest.id === 'welcome' ? 'Logan' : nearest.label}</span></button>}
    </>}
    {destination && !guide && <DestinationDialog key={destination.id} destination={destination} onClose={close} onSelect={interact} locations={locations} worldName={worldName} />}
    {error && <div role="alert" className="world-runtime-error">{error} <button onClick={() => window.location.reload()}>Try again</button><p>You can still read the résumé and projects in the field guide.</p></div>}
    {guide && <FieldGuide view={guide} onClose={closeGuide} qualityMode={qualityMode} onQualityChange={changeQuality} />}
    {stats && <output className="world-debug" aria-label="Development diagnostics">{JSON.stringify({ ...stats, quality })}</output>}
    <p className="world-mobile-note">This first edition is made for a keyboard and mouse. <a href={guideHref('resume')}>Read the field guide →</a></p>
  </main>;
}
export default function World() { return <WorldPage />; }
