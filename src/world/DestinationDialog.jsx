import { useEffect, useRef, useState } from 'react';
import { guideForLink, guideHref } from './guideContent';

export default function DestinationDialog({ destination, onClose, onSelect, locations, worldName }) {
  const ref = useRef();
  const [page, setPage] = useState(0);
  useEffect(() => { ref.current?.showModal(); }, []);
  const pages = destination.pages;
  const talking = destination.kind === 'Talk';
  const onLastPage = !pages || page >= pages.length - 1;
  const advance = () => { if (pages && !onLastPage) setPage(p => p + 1); };
  return <dialog className={`world-dialog ${destination.id === 'map' ? 'is-directory' : 'is-conversation'}`} aria-labelledby="destination-name" ref={ref} onCancel={e => { e.preventDefault(); onClose(); }}>
    <button className="world-close" aria-label="Close dialog" onClick={onClose}>×</button>
    <p className="world-eyebrow">{destination.topic || worldName}</p><h2 id="destination-name">{destination.label}</h2>
    <p aria-live="polite" aria-atomic="true">{pages ? pages[page] : destination.body}</p>
    {destination.id === 'map' ? <div className="world-map-list">{locations.filter(l => !l.secret && l.id !== 'welcome').map((l,i) => <button key={l.id} onClick={() => onSelect(l)}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{l.label}</strong><small>{l.topic || l.kind || 'Read'}</small></div><span>→</span></button>)}</div> : destination.links?.length > 0 && <div className="world-destination-links">{destination.links.map(link => {
      const guide = guideForLink(link.href), external = !guide && link.href.startsWith('https');
      return <a key={link.href} href={guide ? guideHref(guide) : link.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{guide?.startsWith('project-') && !link.href.startsWith('#guide/') ? 'Read project' : link.label}<span>{external ? '↗' : '→'}</span></a>;
    })}</div>}
    <footer className="world-dialog-actions">
      {pages?.length > 1 && <div className="world-dialog-pagination" aria-label="Conversation pages">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous dialogue page">Previous</button>
        <span aria-live="polite">{page + 1} / {pages.length}</span>
        <button onClick={advance} disabled={onLastPage} aria-label="Next dialogue page">Next</button>
      </div>}
      <button className="world-return" onClick={onClose}>{talking ? 'See you around' : 'Back to exploring'} <span aria-hidden="true">↗</span></button>
    </footer>
  </dialog>;
}
