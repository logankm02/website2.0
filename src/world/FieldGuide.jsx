import { useEffect, useRef } from 'react';
import { profile } from '../data/profile';
import { education } from '../data/education';
import { experience } from '../data/experience';
import { spotlightProjects } from '../data/projects';
import { skillCategories } from '../data/skills';
import { guideHref } from './guideContent';
import './fieldGuide.css';

const tabs = [['resume', 'Résumé'], ['projects', 'Projects'], ['skills', 'Skills'], ['contact', 'Contact'], ['settings', 'Controls']];
function Education() {
  return <section className="guide-record"><h3>Education</h3>{education.map(e => <article key={e.school}>
    <p className="guide-meta">{e.meta}</p><h4>{e.school}</h4><p className="guide-role">{e.degree}</p>
    <ul>{e.highlights.map(h => <li key={h}>{h}</li>)}</ul>
  </article>)}</section>;
}
function Experience() {
  return <section className="guide-record"><h3>Experience</h3>{experience.map(e => <article key={e.company}>
    <p className="guide-meta">{e.dates} · {e.location}</p><h4>{e.role}</h4><p className="guide-role">{e.company}{e.department && ` · ${e.department}`}</p>
    <ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul>
  </article>)}</section>;
}
export default function FieldGuide({ view, onClose, qualityMode, onQualityChange }) {
  const ref = useRef(), scroll = useRef();
  useEffect(() => { ref.current?.showModal(); }, []);
  useEffect(() => { scroll.current?.scrollTo(0, 0); }, [view]);
  const project = spotlightProjects.find(p => view === `project-${p.id}`);
  const active = project ? 'projects' : ['education', 'experience'].includes(view) ? 'resume' : view;
  const title = project?.title || ({ resume: 'Logan Kinajil-Moran', education: 'Academic record', experience: 'Career record', projects: 'Projects', skills: 'Skills & tools', contact: 'Get in touch', settings: 'Exploration controls' })[view];
  return <dialog ref={ref} className="field-guide" aria-labelledby="guide-title" onCancel={e => { e.preventDefault(); onClose(); }}>
    <header className="guide-header"><div><p className="world-eyebrow"><span className="world-index">LK</span> Logan City · Field guide</p><h2 id="guide-title">{title}</h2></div><button className="guide-close" aria-label="Close field guide" onClick={onClose}>×</button></header>
    <nav className="guide-tabs" aria-label="Field guide sections">{tabs.map(([id,label]) => <a key={id} href={guideHref(id)} aria-current={active === id ? 'page' : undefined}>{label}</a>)}</nav>
    <div className="guide-scroll" ref={scroll}>
      {active === 'resume' && <>
        <div className="guide-profile"><img src={profile.photo} alt="Logan Kinajil-Moran" /><div><p className="guide-kicker">{profile.origin}</p><p>{profile.headline}</p><a href={guideHref('contact')}>Get in touch →</a></div></div>
        <nav className="guide-record-nav" aria-label="Résumé sections"><a href={guideHref('resume')}>Full résumé</a><a href={guideHref('education')}>Education</a><a href={guideHref('experience')}>Experience</a></nav>
        {view !== 'experience' && <Education />}{view !== 'education' && <Experience />}
      </>}
      {view === 'projects' && <><p className="guide-intro">Autonomous racing, renewable energy, useful software, and a little piece of Aotearoa.</p><div className="guide-projects">{spotlightProjects.map((p,i) => <a className="guide-project" key={p.id} href={guideHref(`project-${p.id}`)}><img src={p.image} alt="" loading="lazy" /><div><span className="guide-kicker">Project {String(i+1).padStart(2,'0')}</span><h3>{p.title}</h3><p>{p.description}</p><small>{p.tech.join(' · ')}</small><strong>Read project →</strong></div></a>)}</div></>}
      {project && <article className="guide-project-detail"><a className="guide-back" href={guideHref('projects')}>← All projects</a><img className="guide-project-image" src={project.image} alt={project.title} /><p className="guide-kicker">{project.tech.join(' · ')}</p><h3>The project</h3><p>{project.description}</p>{experience.filter(e => project.id === 'roar' ? e.company.startsWith('AI Racing') : project.id === 'calsol' ? e.company.includes('CalSol') : project.id === 'kite' ? e.company.startsWith('Kite') : false).map(e => <section key={e.company}><h3>My contribution</h3><p className="guide-meta">{e.role} · {e.dates}</p><ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul></section>)}<aside className="guide-resources"><h3>Explore further</h3><p>Optional links open in a new tab.</p><a href={project.href} target="_blank" rel="noopener noreferrer">{project.cta} ↗</a>{project.githubHref && <a href={project.githubHref} target="_blank" rel="noopener noreferrer">Source code ↗</a>}</aside></article>}
      {view === 'skills' && <div className="guide-record">{skillCategories.map(category => <section key={category.title}><h3>{category.title}</h3><ul className="guide-skills">{category.skills.map(s => <li key={s.name}><img src={s.icon} alt="" loading="lazy" />{s.name}</li>)}</ul></section>)}</div>}
      {view === 'contact' && <section className="guide-contact"><p className="guide-intro">Have a project, a question, or an idea to share? I’d love to hear from you.</p><a className="guide-email" href={`mailto:${profile.email}`}>{profile.email} ↗</a><p className="guide-kicker">Elsewhere</p>{Object.entries(profile.socials).map(([name,s]) => <a key={name} href={s.url} target="_blank" rel="noopener noreferrer">{name === 'github' ? 'GitHub' : 'LinkedIn'} · {s.handle} ↗</a>)}</section>}
      {view === 'settings' && <section className="guide-record"><h3>Explore at your pace</h3><dl className="guide-controls"><dt>W A S D / arrow keys</dt><dd>Walk</dd><dt>Shift</dt><dd>Run</dd><dt>Click, then move the mouse</dt><dd>Look around</dd><dt>Scroll</dt><dd>Move the camera closer or farther away</dd><dt>E</dt><dd>Talk, inspect, or enter</dd><dt>Escape</dt><dd>Close the current panel</dd></dl><label className="guide-quality">Graphics quality<select aria-label="Rendering quality" value={qualityMode} onChange={e => onQualityChange(e.target.value)}><option value="auto">Auto</option><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low</option></select></label></section>}
    </div>
    <footer className="guide-footer"><span>Your place in the world is saved while you read.</span><button onClick={onClose}>Back to exploring <kbd>Esc</kbd></button></footer>
  </dialog>;
}
