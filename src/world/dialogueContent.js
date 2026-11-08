// Website copy lives separately from generated Blender manifests. Stable
// location IDs connect these guides to their characters and exhibits.
const link = (label, view) => ({ label, href: `#guide/${view}` });
const guide = (label, topic, pages, links) => ({ label, topic, pages, links });

export const welcomeConversation = guide('Logan', 'Your host', [
  'Hey, welcome! I’m Logan, from Wellington, New Zealand. I work on autonomous systems, AI, and embedded hardware. This city is my portfolio—you can explore it at your own pace.',
  'The three buildings tell different parts of my story: ΛΚΜ House is for education and campus visits, LOGAN & CO. is for work experience, and LOGAN LABS is for projects. Talk to the guides inside, or use Résumé and Projects in the top-right menu to jump straight in.',
], [link('Read my résumé', 'resume'), link('Browse my projects', 'projects')]);

export const roomConversations = {
  education: {
    'npc-0': guide('Rochester guide', 'Education · University of Rochester', [
      'Welcome to the Rochester side of the house. Logan studied Computer Science and Economics there, graduating in the class of 2025. He also played varsity soccer.',
      'He graduated magna cum laude and was elected to Phi Beta Kappa. Want to look around campus? The Rochester gateway at the back of this room takes you to Eastman Quad.',
    ], [link('Read Logan’s education', 'education'), { label: 'Explore Eastman Quad', href: '/world?campus=rochester' }]),
    'npc-1': guide('Berkeley guide', 'Education · UC Berkeley', [
      'This side of the house covers Logan’s Berkeley chapter: the MEng in Electrical Engineering and Computer Sciences, class of 2026. Autonomous racing and solar vehicles are part of that story.',
      'You can read about his engineering work in the lab next door, or visit Memorial Glade through the Berkeley gateway at the back of this room.',
    ], [link('Read Logan’s education', 'education'), { label: 'Explore Memorial Glade', href: '/world?campus=berkeley' }]),
  },
  experience: {
    'npc-0': guide('QA guide', 'Experience · Tesla', [
      'Interested in the car outside? This stop covers Logan’s Software QA Engineer role at Tesla in Palo Alto.',
      'Software QA is about checking how software behaves, finding failures, and making them reproducible. Logan’s career record has the role details alongside the rest of his experience.',
    ], [link('Read Logan’s experience', 'experience')]),
    'npc-1': guide('Racing guide', 'Experience · AI Racing Tech', [
      'How does a racecar know where it is without a driver? Logan’s Berkeley capstone focuses on that question using the ROAR autonomous racing platform.',
      'His localization work combines LiDAR and motion-sensor measurements in DLIO++, using C++, Python, and ROS 2. The project page explains his contribution.',
    ], [link('Read the racing project', 'project-roar'), link('Read Logan’s experience', 'experience')]),
    'npc-2': guide('Solar guide', 'Experience · CalSol', [
      'The solar array belongs to the CalSol corner. Logan worked on electrical components for Berkeley’s Gen XI solar vehicle.',
      'That work brings electronics design, manufacturing, and firmware together. You can find the solar racer in LOGAN LABS and read the project here.',
    ], [link('Read the CalSol project', 'project-calsol')]),
    'npc-3': guide('Startup guide', 'Experience · Kite', [
      'Ever lost an important message in your inbox? Kite is an AI email assistant that helps with search, summaries, and replies. Logan was a founding engineer.',
      'He built the JavaScript interface and Flask backend, and connected language models with vector search. The project page has the product overview; the career record covers his role.',
    ], [link('Read the Kite project', 'project-kite'), link('Read Logan’s experience', 'experience')]),
    'npc-4': guide('Wildlife guide', 'Experience · OWL Integrations', [
      'This stop is about getting useful data out of remote places. At OWL Integrations, Logan prototyped low-power devices with GPS and long-range mesh radio.',
      'He also worked on firmware and audio-classification data pipelines for wildlife monitoring. If that interests you, look for the TūīNet listening post in LOGAN LABS.',
    ], [link('Read Logan’s experience', 'experience'), link('Read about TūīNet', 'project-tuinet')]),
    'npc-5': guide('Software guide', 'Experience · OpenDR', [
      'This is the OpenDR chapter. Logan helped build a full-stack demo for DEF CON 2024, with React on the frontend and Go and Neo4j on the backend.',
      'His internship also included API design, database optimization, and release preparation. You can find the dates and details in his career record.',
    ], [link('Read Logan’s experience', 'experience')]),
    'npc-6': guide('Research guide', 'Experience · Rochester Medical Center', [
      'Before the racing and robotics projects, Logan worked with the Department of Neurosurgery at the University of Rochester Medical Center.',
      'He prepared and analyzed records covering 114,892 patients to support machine-learning research on surgical outcomes. His career record explains the research contribution.',
    ], [link('Read Logan’s research experience', 'experience')]),
  },
  projects: {
    'npc-0': guide('Racing guide', 'Project · ROAR localization', [
      'Take a look at the racer. Logan’s ROAR project helps an autonomous racecar estimate its position by combining LiDAR scans with motion-sensor data.',
      'The interesting part is keeping that estimate useful while the car moves at speed. Open the project story to see the tools and Logan’s contribution.',
    ], [link('Read the racing project', 'project-roar')]),
    'npc-1': guide('Solar guide', 'Project · CalSol', [
      'This is the CalSol solar racer. Logan worked on electrical components and firmware for the Gen XI car, bringing circuit design and software together.',
      'The project story covers the vehicle and his work. There’s also a link there to the team’s website if you want to go further.',
    ], [link('Read the CalSol project', 'project-calsol')]),
    'npc-2': guide('Software guide', 'Project · Kite', [
      'Looking for a software project? Kite turns an inbox into something you can search with ordinary questions, with tools for summaries and replies too.',
      'Logan helped build it as a founding engineer. You can read the overview right here without leaving the city.',
    ], [link('Read the Kite project', 'project-kite')]),
    'npc-3': guide('Wildlife guide', 'Project · TūīNet', [
      'That listening post is for TūīNet, a project for recognizing New Zealand’s native birds from their calls.',
      'It combines a Raspberry Pi, audio recognition, and mesh networking for remote monitoring. A little bit of Logan’s home, brought into the lab.',
    ], [link('Read the TūīNet story', 'project-tuinet')]),
    'npc-4': guide('Games guide', 'Project · AI Scrabble Bot', [
      'Fancy a word game? Logan built a Scrabble bot that searches for strong moves using a dictionary and board-scoring rules.',
      'Read how it works here. If you want to play, the project page has a link to open the game in a new tab.',
    ], [link('Read about the Scrabble bot', 'project-scrabble')]),
  },
};

export function withConversation(location, room) {
  const conversation = roomConversations[room]?.[location.id];
  return conversation ? { ...location, ...conversation } : location;
}
