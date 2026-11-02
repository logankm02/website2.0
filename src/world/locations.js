import { spotlightProjects } from '../data/projects';
import { profile } from '../data/profile';

export const locations = [
  { id: 'welcome', label: 'The trail guide', position: [3, 0, 16], kind: 'Talk', body: `Welcome to my little corner of the world. I'm ${profile.name}. Follow the path to the village: games are in the arcade, projects live in the workshop, and Field Notes tells my story.`, links: [{ label: 'About Logan', href: '/about' }] },
  { id: 'arcade', label: 'The Arcade', position: [13, 2.5, -15], kind: 'Enter', body: 'A few different ways to play. Step into the original pixel village, visit the soccer scene, or challenge the Scrabble bot.', links: [{ label: 'Pixel village', href: '/city' }, { label: 'Soccer scene', href: '/classic' }, { label: 'Play Scrabble', href: spotlightProjects.find(p => p.id === 'scrabble').href }] },
  { id: 'notes', label: 'Field Notes', position: [-13, 2.5, -17.5], kind: 'Read', body: `${profile.headline}. ${profile.educationLine}. ${profile.origin}.`, links: [{ label: 'Education & background', href: '/about#about' }, { label: 'Experience', href: '/about#experience' }] },
  { id: 'workshop', label: 'The Workshop', position: [-13, 2.5, -32.5], kind: 'Explore', body: 'Autonomous racing, solar vehicles, wildlife conservation, and tools that make everyday work a little easier.', links: [{ label: 'All projects', href: '/about#projects' }, ...spotlightProjects.filter(p => p.id !== 'scrabble').map(p => ({ label: p.title, href: p.href }))] },
  { id: 'house', label: 'Wayfarer House', position: [12, 2.5, -35.5], kind: 'Visit', body: 'Thanks for stopping by. If something here sparked an idea, I would love to hear from you.', links: [{ label: 'Get in touch', href: '/about#getInTouch' }, { label: 'GitHub', href: profile.socials.github.url }] },
  { id: 'pond', label: 'A quiet discovery', position: [-40, 0, 19], kind: 'Discover', body: 'A pause beside the water. This valley started as a collection of scripts, sketches, and small experiments—much like the projects that brought you here.', links: [{ label: 'Browse the projects', href: '/about#projects' }], secret: true },
];
