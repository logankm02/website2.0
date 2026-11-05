import { spotlightProjects } from '../data/projects';
import { profile } from '../data/profile';
import { SIGNS, POND, EXITS } from '../game/map';

// Same tile transform as the Blender build; destinations stay attached to /city.
export const cityPosition = (x, y) => [(x - 11.5) * 2.4, 2.5, (y - 10) * 2.4];
const notice = id => { const s = SIGNS.find(s => s.id === id); return cityPosition(s.x, s.y + .65); };

export const locations = [
  { id: 'welcome', label: 'Welcome to LOGAN CITY', position: [-4.3, 2.5, 9.6], kind: 'Talk', body: `I'm ${profile.name}. ΛΚΜ House holds my education, LOGAN & CO. follows my career, and LOGAN LABS is where the projects live. Open the field guide any time to read my résumé and project stories.`, links: [{ label: 'Read my résumé', href: '#guide/resume' }, { label: 'Explore my projects', href: '#guide/projects' }] },
  { id: 'education', label: 'ΛΚΜ House', kind: 'Visit', body: 'Letters on the pediment, Rochester and Berkeley flags in the windows, and a well-loved couch on the porch. My academic chapter lives here. Inside you’ll find the academic ledger and portals to Eastman Quad and Memorial Glade.', links: [{ label: 'Education & background', href: '/about#about' }] },
  { id: 'experience', label: 'LOGAN & CO.', kind: 'Visit', body: 'Mission control: telemetry screens, operator consoles, and rooftop communications gear. A home for the teams, systems, and experiences that shaped my work.', links: [{ label: 'Explore my experience', href: '/about#experience' }] },
  { id: 'projects', label: 'LOGAN LABS', kind: 'Explore', body: 'The maker space: 3D printers, filament spools, tools on the pegboard, and a laser cutter. Autonomous racing, solar vehicles, wildlife conservation, and small useful experiments all start here.', links: [{ label: 'All projects', href: '/about#projects' }, ...spotlightProjects.map(p => ({ label: p.title, href: p.href }))] },
  { id: 'skills', label: 'Aotearoa garden', position: notice('skills'), kind: 'Read', body: 'Silver ferns, garden flowers, and a little piece of home. The garden noticeboard collects the tools and skills I bring to my work.', links: [{ label: 'Skills & tools', href: '/about#skills' }] },
  { id: 'contact', label: 'Town noticeboard', position: notice('contact'), kind: 'Read', body: 'Have a project, a question, or an idea to share? Leave a note at the town noticeboard.', links: [{ label: 'Get in touch', href: '/about#getInTouch' }, { label: 'GitHub', href: profile.socials.github.url }] },
  { id: 'pond', label: 'The soccer pond', position: cityPosition(POND.x + (POND.w - 1) / 2, POND.y - 1), kind: 'Play', body: 'A familiar shortcut beside the southwest pond. Step into the original soccer scene, or find the Scrabble bot in the lab.', links: [{ label: 'Open the soccer scene', href: '/classic' }, { label: 'Play Scrabble', href: spotlightProjects.find(p => p.id === 'scrabble').href }] },
  { id: 'exit', label: 'South gate', position: cityPosition(EXITS[0].x + .5, EXITS[0].y), kind: 'Read', body: 'Take a moment to read the field guide: my résumé, projects, skills, and a way to get in touch.', links: [{ label: 'Read my résumé', href: '#guide/resume' }, { label: 'Get in touch', href: '#guide/contact' }] },
  { id: 'rochester', label: 'University of Rochester', position: [-20, 2.5, -5.2], kind: 'Travel', body: 'Visit Eastman Quad: Rush Rhees Library, the copper dome, brick academic halls, and autumn trees.', links: [{ label: 'Enter Eastman Quad in 3D', href: '/world?campus=rochester' }] },
  { id: 'berkeley', label: 'UC Berkeley', position: [-8.5, 2.5, -5.2], kind: 'Travel', body: 'Visit Memorial Glade: the Campanile, Doe Library, Strawberry Creek, and Sather Gate.', links: [{ label: 'Enter Memorial Glade in 3D', href: '/world?campus=berkeley' }] },
];

locations.find(l => l.id === 'education').links.push(
  { label: 'Rochester campus in 3D', href: '/world?campus=rochester' },
  { label: 'Berkeley campus in 3D', href: '/world?campus=berkeley' },
);
for (const id of ['education', 'experience', 'projects']) {
  const building = locations.find(l => l.id === id);
  building.kind = 'Enter';
  building.travel = `/world?interior=${id}`;
  building.links.unshift({ label: 'Enter the building', href: building.travel });
}
export function locationsForWorld(manifest) {
  if (!manifest) return locations;
  if (!manifest.interior) {
    if (manifest.locations) return manifest.locations;
    return locations.map(location => {
      const landmark = manifest.landmarks.find(item => item.id === location.id);
      if (!landmark) return location;
      const [x, y, height] = landmark.door;
      return { ...location, position: [x, height, -y] };
    });
  }
  const building = locations.find(l => l.id === manifest.interior);
  // Keep the original content in the room directory alongside its exhibits.
  const exhibits = manifest.locations.map(location => location.kind === 'Talk' && !location.links?.length
    ? { ...location, links: [{ label: manifest.interior === 'education' ? 'Read academic record' : 'Read career record', href: '#guide/' + (manifest.interior === 'education' ? 'education' : 'experience') }] }
    : location);
  return [...exhibits, { ...building, id: 'information', position: null, travel: undefined, links: building.links.slice(1) }];
}
