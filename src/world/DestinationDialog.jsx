import { useEffect, useRef, useState } from 'react';
import { guideForLink, guideHref } from './guideContent';

export default function DestinationDialog({ destination, onClose, onSelect, locations, worldName }) {
  const ref = useRef();
  const [page, setPage] = useState(0);
  useEffect(() => { ref.current?.showModal(); }, []);
  const pages = destination.pages;
  const onLastPage = !pages || page >= pages.length - 1;
  const advance = () => { if (pages && !onLastPage) setPage(p => p + 1); };
  return <dialog className={`world-dialog ${destination.id === 'map' ? 'is-directory' : 'is-conversation'}`} aria-labelledby="destination-name" ref={ref} onCancel={e => { e.preventDefault(); onClose(); }}>
    <button className="world-close" aria-label="Close dialog" onClick={onClose}>×</button>
    <p className="world-eyebrow">{worldName}</p><h2 id="destination-name">{destination.label}</h2>
    <p>{pages ? pages[page] : destination.body}</p>
    {destination.id === 'map' ? <div className="world-map-list">{locations.filter(l => !l.secret && l.id !== 'welcome').map((l,i) => <button key={l.id} onClick={() => onSelect(l)}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{l.label}</strong><small>{l.kind || 'Read'}</small></div><span>→</span></button>)}</div> : onLastPage && destination.links?.length > 0 && <div className="world-destination-links">{destination.links.map(link => {
      const guide = guideForLink(link.href), external = !guide && link.href.startsWith('https');
      return <a key={link.href} href={guide ? guideHref(guide) : link.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{guide?.startsWith('project-') ? 'Read project' : link.label}<span>{external ? '↗' : '→'}</span></a>;
    })}</div>}
    <button className="world-return" onClick={onLastPage ? onClose : advance}>{onLastPage ? 'Back' : 'Continue'}</button>
  </dialog>;
}
