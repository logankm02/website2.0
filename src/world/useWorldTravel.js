import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadWorld } from './assets';
import { resolveWorldRoute } from './worldRoute';

// Keep the current scene alive during the fade and asset load. Reveal only
// after the replacement scene has rendered, so shader compilation stays hidden.
export default function useWorldTravel() {
  const location = useLocation(), navigate = useNavigate();
  const [active, setActive] = useState(() => ({ route: resolveWorldRoute(location.search), assets: null, key: 0 }));
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0), [error, setError] = useState(null);
  const current = useRef(active), resources = useRef(new Set()), sequence = useRef(0), revealTimer = useRef();
  const awaiting = useRef(null), isTravel = useRef(false);
  current.current = active;
  useEffect(() => {
    let cancelled = false;
    const route = resolveWorldRoute(location.search), changing = Boolean(current.current.assets);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = ++sequence.current;
    isTravel.current = changing;
    clearTimeout(revealTimer.current);
    awaiting.current = null;
    setError(null); setProgress(0);
    if (changing) setPhase('closing');
    const fade = new Promise(resolve => setTimeout(resolve, changing && !reduced ? 360 : 0));
    loadWorld(value => { if (!cancelled) setProgress(value); }, route).then(async assets => {
      await fade;
      if (cancelled) { assets.dispose(); return; }
      resources.current.add(assets);
      awaiting.current = id;
      setActive({ route, assets, key: id });
    }).catch(e => {
      if (cancelled) return;
      setError(e.message);
      setPhase('opening');
      revealTimer.current = setTimeout(() => setPhase('idle'), reduced ? 0 : 600);
    });
    return () => { cancelled = true; clearTimeout(revealTimer.current); };
  }, [location.search]);
  useEffect(() => {
    const owned = resources.current;
    return () => { clearTimeout(revealTimer.current); owned.forEach(resource => resource.dispose()); owned.clear(); };
  }, []);
  const sceneReady = useCallback(key => {
    if (awaiting.current !== key || sequence.current !== key) return;
    awaiting.current = null;
    resources.current.forEach(resource => {
      if (resource !== current.current.assets) { resource.dispose(); resources.current.delete(resource); }
    });
    if (!isTravel.current) { setPhase('idle'); return; }
    setPhase('opening');
    revealTimer.current = setTimeout(() => setPhase('idle'), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600);
  }, []);
  const travel = useCallback(href => {
    const target = new URL(href, window.location.href);
    if (target.origin !== window.location.origin || !['/', '/world'].includes(target.pathname)) return false;
    if (target.search === location.search) return false;
    setPhase('closing');
    navigate(target.pathname + target.search + target.hash);
    return true;
  }, [navigate, location.search]);
  return { ...active, phase, progress, error, setError, sceneReady, travel };
}
