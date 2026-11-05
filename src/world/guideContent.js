import { spotlightProjects } from '../data/projects.js';

export const guideSections = ['resume', 'education', 'experience', 'projects', 'skills', 'contact', 'settings'];
export function validGuideView(view) {
  return guideSections.includes(view) || spotlightProjects.some(p => view === `project-${p.id}`) ? view : null;
}
export function guideFromHash(hash) {
  return hash.startsWith('#guide/') ? validGuideView(hash.slice(7)) : null;
}
export const guideHref = view => `#guide/${validGuideView(view) || 'resume'}`;

// Resolve legacy exhibit links at the content boundary. Blender manifests can
// still be regenerated without reintroducing navigation to the old portfolio.
export function guideForLink(href) {
  if (!href) return null;
  const direct = guideFromHash(href);
  if (direct) return direct;
  const url = new URL(href, 'https://logankm.com');
  if (['logankm.com', 'www.logankm.com'].includes(url.hostname) && ['/', '/about'].includes(url.pathname)) {
    return ({ '#about': 'education', '#education': 'education', '#experience': 'experience', '#projects': 'projects', '#skills': 'skills', '#getInTouch': 'contact' })[url.hash] || 'resume';
  }
  const project = spotlightProjects.find(p => [p.href, p.githubHref].filter(Boolean).some(link => {
    const target = new URL(link);
    return url.origin === target.origin && url.pathname.replace(/\/$/, '') === target.pathname.replace(/\/$/, '');
  }));
  return project ? `project-${project.id}` : null;
}
