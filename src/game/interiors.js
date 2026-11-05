// Building interiors (pure data — no DOM). Each room follows the classic GBA
// floor plan: a dark wall cap on row 0, a furnished wall face on row 1, floor
// below, and an exit mat on the bottom row. Every resume entry becomes a
// villager: talk to (or bump into) them and they tell you their story.

import { education } from "../data/education";
import { experience } from "../data/experience";
import { spotlightProjects } from "../data/projects";
import { books } from "../data/books";

const BOOKSHELF_PAGES = [
  "LOGAN's bookshelf. Recent reads:",
  books.map((b) => `${b.title} — ${b.author}`).join(", ") + ".",
];

// --- NPC dialog builders -----------------------------------------------------

// Each villager gets a hand-written voice and wardrobe (`pal` indexes
// NPC_PALS); entries without a matching profile fall back to reciting their
// data file entry, so new resume entries still show up.

const educationNpcProfiles = [
  {
    match: "Rochester",
    pages: [
      "University of Rochester — BA in Computer Science & Economics in Rochester, NY.",
      "Magna Cum Laude, Phi Beta Kappa, and varsity soccer all live under this blue-and-dandelion crest.",
    ],
    pal: 7,
  },
  {
    match: "Berkeley",
    pages: [
      "UC Berkeley — MEng in EECS in Berkeley, CA.",
      "Fung Scholar, CalSol builder, MEng ambassador. The blue-and-gold corner says Go Bears.",
    ],
    pal: 8,
  },
];

const educationNpcs = education.map((school) => {
  const profile = educationNpcProfiles.find((item) => school.school.includes(item.match));
  return {
    pal: profile?.pal ?? 0,
    pages: profile?.pages ?? [school.school],
  };
});

const experienceNpcProfiles = [
  {
    match: "Tesla",
    pal: 6,
    pages: [
      "TESLA, Palo Alto — Software QA Engineer, starting July 2026. The newest hire in the village!",
      "QA is the last gate between fresh software and a moving car. Somebody has to try to break it first.",
    ],
  },
  {
    match: "AI Racing",
    pal: 9,
    pages: [
      "I race with AI RACING TECH — the Berkeley MEng capstone on Prof. Allen Yang's ROAR autonomous racing platform.",
      "My piece is DLIO++: LiDAR-IMU odometry in C++ and ROS 2 that tells the racecar exactly where it is at speed.",
      "On a racetrack, 'roughly there' is how you meet a wall.",
    ],
  },
  {
    match: "CalSol",
    pal: 10,
    pages: [
      "Sun's out, volts out! I'm an electrical engineer on CalSol, Berkeley's solar vehicle team.",
      "I design and manufacture electronics for the Gen XI car — it races the American Solar Challenge in summer 2026.",
    ],
  },
  {
    match: "Kite",
    pal: 11,
    pages: [
      "Founding engineer at KITE, the AI-powered Gmail extension. usekite.app — tell your friends!",
      "JavaScript up front, Flask in back, LLMs with Turbopuffer vector search underneath. Your inbox, but smarter.",
      "Paying customers, tier-1 VC meetings, top 10% of YC applicants. Not bad for a little kite!",
    ],
  },
  {
    match: "OWL",
    pal: 1,
    pages: [
      "Hoot hoot! At OWL INTEGRATIONS I prototyped ESP32 T-Beam trackers — GPS, LoRa mesh, ultra-low power.",
      "They monitor wildlife in places with no signal, running ML audio classification on birdsong. The birds never noticed a thing.",
    ],
  },
  {
    match: "OpenDR",
    pal: 2,
    pages: [
      "I took a full-stack demo to DEF CON 2024 — Go and Neo4j in the back, React up front, Docker all the way down.",
      "API design, database tuning, release prep on the Skynet project, which became OpenDR. Relax — not THAT Skynet.",
    ],
  },
  {
    match: "Rochester Medical",
    pal: 5,
    pages: [
      "Research assistant with the Department of Neurosurgery at the University of Rochester Medical Center.",
      "I wrangled clinical records for 114,892 patients into shape for machine learning.",
      "Our models out-predicted standard logistic regression on neurosurgical outcomes. The surgeons were pleased.",
    ],
  },
];

const experienceNpcs = experience.map((e) => {
  const profile = experienceNpcProfiles.find((item) => e.company.includes(item.match));
  return {
    pal: profile?.pal,
    pages: profile?.pages ?? [
      `${e.role} at ${e.company}${e.department ? `, ${e.department}` : ""} (${e.dates}, ${e.location}).`,
      ...e.bullets,
    ],
  };
});

// The last page is the YES/NO prompt for opening the project link.
const projectNpcProfiles = {
  roar: {
    pal: 9,
    pages: [
      "Welcome to the fast corner! This is ROAR localization — DLIO++ keeping an autonomous racecar locked onto its pose.",
      "C++, Python, and ROS 2. A car can't brake late if it doesn't know where it is.",
      "Open the ROAR website?",
    ],
  },
  calsol: {
    pal: 10,
    pages: [
      "Careful, that's the Gen XI solar car! CalSol races it in the 2026 American Solar Challenge.",
      "KiCad boards, C++ firmware, and every drop of sunshine we can catch.",
      "Visit the CalSol team site?",
    ],
  },
  kite: {
    pal: 11,
    pages: [
      "This terminal runs KITE — an AI email assistant that turns your inbox into a queryable database.",
      "Natural-language search, thread summaries, context-aware replies, automatic calendar wrangling...",
      "Open usekite.app?",
    ],
  },
  tuinet: {
    pal: 12,
    pages: [
      "Shh — it's listening! TūīNet identifies New Zealand's native birds by song, with AI audio recognition on a Raspberry Pi.",
      "It reports home over OWL's ClusterDuck mesh from forests with no signal at all.",
      "Read the TūīNet story?",
    ],
  },
  scrabble: {
    pal: 4,
    pages: [
      "Fancy a word game? This SCRABBLE BOT finds optimal plays with a DAWG dictionary and board heuristics.",
      "I have never beaten it. I am at peace with this.",
      "Challenge the bot?",
    ],
  },
};

const projectNpcs = spotlightProjects.map((p) => {
  const profile = projectNpcProfiles[p.id];
  return {
    pal: profile?.pal,
    pages: profile?.pages ?? [
      `${p.title}! Built with ${p.tech.join(", ")}.`,
      p.description,
      `Want to open "${p.cta}"?`,
    ],
    choice: { href: p.href },
  };
});

// In-room furniture by each exit that opens the full resume panel.
const PANEL_HOTSPOT_PAGES = {
  education: ["A heavy ledger rests on the podium: LOGAN's full academic record — degrees, honors, and varsity seasons."],
  experience: ["The notice board holds the complete career record — every role, neatly pinned."],
  projects: ["The notice board lists the full project roster — every build, stack, and launch link."],
};

const MACHINE_PAGES = ["The machine hums importantly. Most of the blinking lights mean something."];
const ROCHESTER_BANNER_PAGES = [
  "The dandelion-gold athletic R of ROCHESTER on navy.",
  "Ever better — the varsity soccer team took it literally.",
];
const CAL_BANNER_PAGES = ["The gold CAL script on Berkeley blue. GO BEARS!"];
const SOCCER_BALL_PAGES = [
  "LOGAN's match ball, worn soft at the seams. NCAA varsity, UAA All-Academic.",
  "It still gets juggled between problem sets.",
];
const CLEATS_PAGES = ["Muddy cleats drying by the door. Varsity habits die hard."];
const TROPHY_PAGES = ["The honors shelf: Dean's Scholar, Phi Beta Kappa, Provost's Circle Scholar. Recently polished."];
const BRAIN_PAGES = [
  "A model brain from the URMC Neurosurgery lab.",
  "The real predictor learned from 114,892 patients. The jar is for ambiance.",
];
const LAPTOP_PAGES = ["A road-worn laptop plastered in DEF CON 2024 stickers. The Skynet demo still boots."];
const KITE_PROP_PAGES = ["A little kite from the KITE launch party. The tail is made of rejected email subject lines."];
const OWL_PAGES = ["A carved owl from OWL INTEGRATIONS. Its eyes follow you. Low-power mode, allegedly."];
const CHARGER_PAGES = ["A miniature Supercharger. The cable reaches exactly one parking spot."];
const LIDAR_PAGES = ["A LiDAR rig on a tripod, spinning quietly. It has mapped this room 4,000 times."];
const SOLAR_PANEL_PAGES = ["A spare Gen XI solar array, angled at the window. Every photon counts."];
const KITE_TERMINAL_PAGES = ["KITE's demo terminal. Inbox zero — achieved by a robot."];
const SCRABBLE_TABLE_PAGES = [
  "A half-finished Scrabble game. The bot just played QUIXOTIC on a triple.",
  "Nobody wants the next turn.",
];
const TUI_PAGES = ["A tūī on a perch, eyeing the field microphone. TūīNet is always listening."];
const TOOLBOX_PAGES = ["CalSol's toolbox: crimpers, flux, zip ties, and one mystery bolt from the last car."];
const TV_PAGES = ["The TV is playing a documentary about self-driving cars. LOGAN has seen it twice."];
const MONITOR_PAGES = ["Build logs scroll past: localization tests, board bring-up, vector search benchmarks. All green."];
const RACECAR_PAGES = [
  "The ROAR racecar — an open-wheeler that drives itself. The mast on top is its eyes: LiDAR, cameras, GPS.",
  "DLIO++ tells it where it is every millisecond. At race speed, that's the whole game.",
];
const SOLARCAR_PAGES = [
  "GEN XI, CalSol's solar racer. Four square meters of cells, one bubble canopy, zero drops of gasoline.",
  "Next stop: the 2026 American Solar Challenge.",
];

// --- campus flavor ------------------------------------------------------------

const RUSH_RHEES_PAGES = [
  "RUSH RHEES LIBRARY — the domed landmark of the University of Rochester.",
  "Its tower presides over the EASTMAN QUAD. LOGAN logged many late nights beneath that dome.",
];
const MELIORA_PAGES = [
  "MELIORA HALL — MELIORA, 'ever better,' is the university's motto."
];
const HUTCHISON_PAGES = ["HUTCHISON HALL — chemistry and biology labs close the north edge of the quad."];
const BAUSCH_LOMB_PAGES = ["BAUSCH & LOMB HALL — physics and astronomy, wrapped around a quiet brick courtyard."];
const MOREY_PAGES = ["MOREY HALL — humanities and languages, mirroring Bausch & Lomb across the green."];
const DEWEY_PAGES = ["DEWEY HALL — psychology and the social sciences, closing the south end of the quad."];
const QUAD_STUDENT_PAGES = [
  "Go 'Jackets! You found the EASTMAN QUAD — the best lawn on campus for a kickabout.",
  "LOGAN read Computer Science and Economics here, and played varsity soccer just up the hill.",
];

const CAMPANILE_PAGES = [
  "SATHER TOWER — 'the Campanile' — UC Berkeley's 307-foot clock tower.",
  "On the hour its carillon rings out over GLADE. LOGAN's MEng in EECS happened in its shadow.",
];
const DOE_PAGES = [
  "DOE LIBRARY — Berkeley's grand Beaux-Arts library under its red tile roof.",
  "Inside its reading rooms, LOGAN ground through EECS problem sets late into the night.",
];
const SATHER_GATE_PAGES = [
  "SATHER GATE — the green bronze gateway to campus, standing since 1910.",
  "Beyond it, Telegraph Avenue. Behind you, the glade. Choose wisely at lunchtime.",
];
const CREEK_PAGES = ["STRAWBERRY CREEK — burbling down from the Berkeley hills, right through campus."];
const LAKE_PAGES = ["The creek pools here before slipping under the gate. Something ripples by the rocks."];
const BERRY_PAGES = ["A tidy berry garden. Planted by the botany club; raided by the CS majors."];
const STAND_PAGES = ["GLADE MART — snacks, sunscreen, and blue books. The awning has seen some winters."];
const UC_SEAL_PAGES = [
  "The UNIVERSITY OF CALIFORNIA seal, set in a planter on the glade.",
  "FIAT LUX — 'let there be light.'",
];
const GLADE_STUDENT_PAGES = [
  "Go Bears! Welcome to MEMORIAL GLADE, with SATHER TOWER keeping time overhead.",
  "LOGAN earned an MEng in EECS here — and built solar cars and autonomous racecars on the side.",
];

// --- room definitions ----------------------------------------------------------

const ROOMS = {
  education: {
    title: "SCHOOL HOUSE",
    w: 12,
    h: 8,
    floor: "wood",
    theme: "university",
    rug: [4, 3, 4, 3],
    furniture: [
      // Back wall, left to right: ROCHESTER banner + its school-colored gateway,
      // bookshelves in the middle, then the BERKELEY gateway + the Cal banner.
      // Each school flies its banner beside the portal to its campus.
      { kind: "logoBanner", x: 0, y: 1, w: 3, colors: ["#0f2f66", "#ffd028"], logo: "rochesterR" },
      { kind: "portalArch", x: 3, y: 1, w: 2, colors: ["#0f2f66", "#ffd028"], logo: "rochesterR" },
      { kind: "bookshelf", x: 5, y: 1 },
      { kind: "bookshelf", x: 6, y: 1 },
      { kind: "portalArch", x: 7, y: 1, w: 2, colors: ["#003262", "#fdb515"], logo: "calScript" },
      { kind: "logoBanner", x: 9, y: 1, w: 3, colors: ["#003262", "#fdb515"], logo: "calScript" },
      { kind: "trophy", x: 0, y: 2 },
      { kind: "plant", x: 1, y: 2 },
      { kind: "calMerch", x: 10, y: 2 },
      { kind: "plant", x: 11, y: 2 },
      { kind: "soccerBall", x: 2, y: 5 },
      { kind: "podium", x: 6, y: 6 },
      { kind: "cleats", x: 3, y: 7 },
    ],
    hotspots: [
      { x: 0, y: 1, w: 3, pages: ROCHESTER_BANNER_PAGES },
      { x: 3, y: 1, w: 2, portal: "uofr" },
      { x: 5, y: 1, pages: BOOKSHELF_PAGES },
      { x: 6, y: 1, pages: BOOKSHELF_PAGES },
      { x: 7, y: 1, w: 2, portal: "ucb" },
      { x: 9, y: 1, w: 3, pages: CAL_BANNER_PAGES },
      { x: 0, y: 2, pages: TROPHY_PAGES },
      { x: 2, y: 5, pages: SOCCER_BALL_PAGES },
      { x: 3, y: 7, pages: CLEATS_PAGES },
      { x: 6, y: 6, panel: "education", pages: PANEL_HOTSPOT_PAGES.education },
    ],
    spots: [
      { x: 4, y: 4, dir: "down" },
      { x: 7, y: 4, dir: "down" },
    ],
    npcData: educationNpcs,
    palOffset: 0,
    mats: [[5, 7], [6, 7]],
    spawn: { x: 5, y: 7, dir: "up" },
    portals: [{ x: 3, y: 1, w: 2, h: 2 }, { x: 7, y: 1, w: 2, h: 2 }],
  },

  experience: {
    title: "CAREER HOUSE",
    w: 12,
    h: 9,
    floor: "wood",
    rug: [2, 4, 8, 2],
    // Each villager keeps their memorabilia next to them: Tesla(2,3) the
    // charger, ROAR(4,3) the LiDAR rig, CalSol(6,3) the solar array,
    // Kite(8,3) the kite overhead, OWL(3,6) the owl, OpenDR(5,6) the DEF CON
    // laptop, URMC(7,6) the brain jar.
    furniture: [
      { kind: "tv", x: 2, y: 1 },
      { kind: "counter", x: 3, y: 1 },
      { kind: "counter", x: 4, y: 1 },
      { kind: "window", x: 6, y: 1 },
      { kind: "kiteWall", x: 8, y: 1 },
      { kind: "bookshelf", x: 9, y: 1 },
      { kind: "bookshelf", x: 10, y: 1 },
      { kind: "plant", x: 1, y: 2 },
      { kind: "lidarRig", x: 4, y: 2 },
      { kind: "solarPanel", x: 6, y: 2 },
      { kind: "plant", x: 11, y: 2 },
      { kind: "charger", x: 1, y: 3 },
      { kind: "owl", x: 2, y: 6 },
      { kind: "brainJar", x: 8, y: 6 },
      { kind: "hackerLaptop", x: 4, y: 7 },
      { kind: "board", x: 8, y: 8 },
    ],
    hotspots: [
      { x: 2, y: 1, pages: TV_PAGES },
      { x: 8, y: 1, pages: KITE_PROP_PAGES },
      { x: 4, y: 2, pages: LIDAR_PAGES },
      { x: 6, y: 2, pages: SOLAR_PANEL_PAGES },
      { x: 1, y: 3, pages: CHARGER_PAGES },
      { x: 2, y: 6, pages: OWL_PAGES },
      { x: 8, y: 6, pages: BRAIN_PAGES },
      { x: 4, y: 7, pages: LAPTOP_PAGES },
      { x: 8, y: 8, panel: "experience", pages: PANEL_HOTSPOT_PAGES.experience },
    ],
    spots: [
      { x: 2, y: 3, dir: "down" },
      { x: 4, y: 3, dir: "down" },
      { x: 6, y: 3, dir: "down" },
      { x: 8, y: 3, dir: "down" },
      { x: 3, y: 6, dir: "up" },
      { x: 5, y: 6, dir: "up" },
      { x: 7, y: 6, dir: "up" },
    ],
    npcData: experienceNpcs,
    palOffset: 1,
    mats: [[5, 8], [6, 8]],
    spawn: { x: 5, y: 8, dir: "up" },
  },

  projects: {
    title: "LOGAN LAB",
    w: 14,
    h: 10,
    floor: "lab",
    rug: null,
    furniture: [
      { kind: "machine", x: 1, y: 1 },
      { kind: "machine", x: 2, y: 1 },
      { kind: "machine", x: 3, y: 1 },
      { kind: "screen", x: 5, y: 1 },
      { kind: "screen", x: 6, y: 1 },
      { kind: "machine", x: 8, y: 1 },
      { kind: "screen", x: 10, y: 1 },
      { kind: "screen", x: 11, y: 1 },
      // Memorabilia sits with its researcher: ROAR(3,3) by the racecar,
      // CalSol(10,3) by the solar car + toolbox, Kite(2,6) faces the demo
      // terminal, TūīNet(7,6) keeps the tūī, Scrabble(11,6) hosts the board.
      { kind: "racecar", x: 2, y: 4, w: 4, h: 2 },
      { kind: "solarcar", x: 8, y: 4, w: 4, h: 2 },
      { kind: "toolbox", x: 9, y: 2 },
      { kind: "hackerLaptop", x: 3, y: 6 },
      { kind: "tuiPerch", x: 8, y: 6 },
      { kind: "scrabbleTable", x: 12, y: 6 },
      { kind: "plant", x: 1, y: 8 },
      { kind: "plant", x: 12, y: 8 },
      { kind: "board", x: 9, y: 9 },
    ],
    hotspots: [
      { x: 5, y: 1, w: 2, pages: MONITOR_PAGES },
      { x: 10, y: 1, w: 2, pages: MONITOR_PAGES },
      { x: 1, y: 1, w: 3, pages: MACHINE_PAGES },
      { x: 8, y: 1, pages: MACHINE_PAGES },
      { x: 2, y: 4, w: 4, h: 2, pages: RACECAR_PAGES },
      { x: 8, y: 4, w: 4, h: 2, pages: SOLARCAR_PAGES },
      { x: 9, y: 2, pages: TOOLBOX_PAGES },
      { x: 3, y: 6, pages: KITE_TERMINAL_PAGES },
      { x: 8, y: 6, pages: TUI_PAGES },
      { x: 12, y: 6, pages: SCRABBLE_TABLE_PAGES },
      { x: 9, y: 9, panel: "projects", pages: PANEL_HOTSPOT_PAGES.projects },
    ],
    spots: [
      { x: 3, y: 3, dir: "down" },
      { x: 10, y: 3, dir: "down" },
      { x: 2, y: 6, dir: "right" },
      { x: 7, y: 6, dir: "up" },
      { x: 11, y: 6, dir: "left" },
    ],
    npcData: projectNpcs,
    palOffset: 5, // lab coat first
    mats: [[6, 9], [7, 9]],
    spawn: { x: 6, y: 9, dir: "up" },
  },

  // An outdoor scene reached through the SCHOOL HOUSE portal: the University
  // of Rochester's Eastman Quadrangle — Rush Rhees Library and its dome at the
  // head of the green, two brick halls flanking, flagpoles on the lawn. Shares
  // the room data model but renders through campusTiles (kind: "campus").
  uofr: {
    kind: "campus",
    title: "EASTMAN QUAD",
    w: 24,
    h: 20,
    floor: "quad",
    // The Eastman Quad as a hand-plotted tile map ("#" = paved walk): a long
    // central green framed by straight side walks and a central avenue up to
    // Rush Rhees, with short branches reaching each brick hall.
    pathMatrix: [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "..####################..", // cross-walk in front of the north halls
      "......##...##...##......", // side walks (6–7, 16–17) + central avenue (11–12)
      "......##...##...##......",
      "......##...##...##......",
      "...#####...##...#####...", // branches west to Bausch & Lomb, east to Morey
      "......##...##...##......",
      "......##...##...##......",
      "......##...##...##......",
      "......##...##...##......",
      "......##...##...##......",
      "......############......", // cross-walk in front of Dewey
      "........................",
      "........................",
      "........................",
      "........................",
    ],
    paths: [],
    furniture: [
      { kind: "rushRhees", x: 8, y: 2, w: 8, h: 3 }, // head of the quad
      { kind: "brickHall", x: 0, y: 2, w: 5, h: 3 }, // Hutchison Hall (NW)
      { kind: "brickHall", x: 18, y: 2, w: 6, h: 3 }, // Meliora Hall (NE)
      { kind: "brickHall", x: 0, y: 7, w: 4, h: 5 }, // Bausch & Lomb (W)
      { kind: "brickHall", x: 20, y: 7, w: 4, h: 5 }, // Morey Hall (E)
      { kind: "brickHall", x: 8, y: 16, w: 8, h: 3 }, // Dewey Hall (S)
      // trees down the side margins, off the walks and roofs
      { kind: "pineTree", x: 5, y: 7 }, { kind: "campusTree", x: 18, y: 7, autumn: true },
      { kind: "campusTree", x: 5, y: 11, autumn: true }, { kind: "pineTree", x: 18, y: 11 },
      { kind: "campusTree", x: 4, y: 6 }, { kind: "campusTree", x: 19, y: 6, autumn: true },
      { kind: "campusTree", x: 5, y: 14 }, { kind: "campusTree", x: 18, y: 14, autumn: true },
    ],
    hotspots: [
      { x: 8, y: 4, w: 8, pages: RUSH_RHEES_PAGES },
      { x: 0, y: 4, w: 5, pages: HUTCHISON_PAGES },
      { x: 18, y: 4, w: 6, pages: MELIORA_PAGES },
      { x: 3, y: 7, h: 5, pages: BAUSCH_LOMB_PAGES }, // east face, toward the quad
      { x: 20, y: 7, h: 5, pages: MOREY_PAGES }, // west face, toward the quad
      { x: 8, y: 16, w: 8, pages: DEWEY_PAGES }, // north face, toward the quad
    ],
    spots: [{ x: 8, y: 9, dir: "down" }],
    npcData: [{ pal: 7, pages: QUAD_STUDENT_PAGES }], // a Rochester student
    palOffset: 7,
    mats: [[11, 13], [12, 13]],
    spawn: { x: 11, y: 12, dir: "up" }, // step out of the portal onto the quad
    portals: [{ x: 11, y: 12, w: 2, h: 2 }],
  },

  // The matching scene behind the SCHOOL HOUSE's right-hand portal: UC Berkeley's
  // Memorial Glade — Sather Tower and Doe Library at the head of a forest-walled
  // lawn, Strawberry Creek winding down the west side into a rocky pool, a stone
  // plaza running south from Doe's portico through Sather Gate.
  ucb: {
    kind: "campus",
    title: "MEMORIAL GLADE",
    w: 24,
    h: 20,
    floor: "quad",
    // Hand-plotted ground matrix: "~" = creek/lake water (solid), "B" = wooden
    // bridge over the creek, "=" = the pale stone plaza, "#" = brick walks.
    pathMatrix: [
      "........................",
      "........................",
      "...~~...................",
      "...~~...................",
      "..~~....................",
      "..~~....................",
      ".~~.............===.....",
      ".~~.............===.....",
      "..~~............===.....",
      "..BB############===.....",
      ".~~.............===.....",
      ".~~.............===.....",
      ".~~.............===.....",
      ".~~~......######===.....",
      "~~~~............===.....",
      "~~~~~...........===.....",
      "~~~~~...........===.....",
      "~~~~~...........===.....",
      "~~~~~...........===.....",
      "~~~~~...........===.....",
    ],
    paths: [],
    furniture: [
      // forest walls framing the glade
      { kind: "forest", x: 0, y: 0, w: 24, h: 2 }, // north tree line
      { kind: "forest", x: 22, y: 2, w: 2, h: 12 }, // east edge
      { kind: "forest", x: 22, y: 14, w: 2, h: 6 }, // SE corner
      // landmarks
      { kind: "doeLibrary", x: 13, y: 2, w: 9, h: 4 }, // Doe Library (NE), portico onto the plaza
      { kind: "campanile", x: 7, y: 3, w: 3, h: 2 }, // Sather Tower (NW)
      { kind: "satherGate", x: 14, y: 16, w: 6, h: 2 }, // the gate astride the plaza
      { kind: "ironFence", x: 5, y: 16, w: 9, h: 1 }, // fence runs flanking the gate
      { kind: "ironFence", x: 20, y: 16, w: 2, h: 1 },
      { kind: "ucSeal", x: 10, y: 8 }, // the bronze seal mid-glade
      // the Glade Mart and its berry garden, east of the plaza
      { kind: "berryPatch", x: 19, y: 10, w: 2, h: 2 },
      { kind: "stand", x: 19, y: 13, w: 2 },
      // rocks in the creek pool
      { kind: "rock", x: 2, y: 14 }, { kind: "rock", x: 1, y: 16 }, { kind: "rock", x: 3, y: 18 },
      // redwood grove west of the glade, singles drifting east
      { kind: "redwood", x: 5, y: 5 }, { kind: "redwood", x: 6, y: 6 },
      { kind: "redwood", x: 4, y: 7 }, { kind: "redwood", x: 4, y: 11 },
      { kind: "redwood", x: 6, y: 12 }, { kind: "redwood", x: 5, y: 14 },
      { kind: "redwood", x: 13, y: 7 },
      // round campus trees + undergrowth
      { kind: "campusTree", x: 11, y: 3 }, { kind: "campusTree", x: 10, y: 5 },
      { kind: "campusTree", x: 14, y: 8 }, { kind: "campusTree", x: 20, y: 7 },
      { kind: "campusTree", x: 21, y: 8 }, { kind: "campusTree", x: 6, y: 10 },
      { kind: "campusTree", x: 13, y: 11 }, { kind: "campusTree", x: 21, y: 12 },
      { kind: "campusTree", x: 7, y: 17 }, { kind: "campusTree", x: 12, y: 18 }, // beyond the gate
      { kind: "bush", x: 12, y: 8 }, { kind: "bush", x: 9, y: 11 },
      { kind: "bush", x: 14, y: 14 }, { kind: "bush", x: 19, y: 14 },
      // lampposts along the plaza
      { kind: "lamppost", x: 15, y: 7 }, { kind: "lamppost", x: 19, y: 7 },
      { kind: "lamppost", x: 15, y: 12 },
    ],
    hotspots: [
      { x: 13, y: 5, w: 9, pages: DOE_PAGES },
      { x: 7, y: 4, w: 3, pages: CAMPANILE_PAGES },
      { x: 14, y: 16, w: 6, pages: SATHER_GATE_PAGES },
      { x: 10, y: 8, pages: UC_SEAL_PAGES },
      { x: 19, y: 10, w: 2, h: 2, pages: BERRY_PAGES },
      { x: 19, y: 13, w: 2, pages: STAND_PAGES },
      { x: 1, y: 6, w: 2, h: 2, pages: CREEK_PAGES },
      { x: 0, y: 15, w: 5, h: 2, pages: LAKE_PAGES },
    ],
    spots: [{ x: 13, y: 10, dir: "down" }],
    npcData: [{ pal: 8, pages: GLADE_STUDENT_PAGES }], // a Berkeley student
    palOffset: 8,
    mats: [[11, 15], [12, 15]],
    spawn: { x: 11, y: 14, dir: "up" },
    portals: [{ x: 11, y: 14, w: 2, h: 2 }],
  },
};

// --- assembly -------------------------------------------------------------------

function buildInteriorLogic(room) {
  // NPCs are dynamic: they idle-wander a tile around `home` and turn to face
  // the player when spoken to, so they're left out of the static solid and
  // hotspot tables — Village.jsx resolves them per frame.
  const npcs = room.npcData.slice(0, room.spots.length).map((npc, i) => {
    const spot = room.spots[i];
    return {
      ...npc,
      ...spot,
      tx: spot.x,
      ty: spot.y,
      home: { x: spot.x, y: spot.y },
      moving: false,
      progress: 0,
      animClock: 0,
      timer: 1 + Math.random() * 3,
      pal: npc.pal ?? room.palOffset + i,
    };
  });

  const solid = new Set();
  for (let x = 0; x < room.w; x++) {
    solid.add(`${x},0`);
    solid.add(`${x},1`);
  }
  room.furniture.forEach((f) => {
    for (let y = f.y; y < f.y + (f.h || 1); y++)
      for (let x = f.x; x < f.x + (f.w || 1); x++) solid.add(`${x},${y}`);
  });
  // Campus water ("~" in the path matrix) is solid; bridges ("B") stay walkable.
  (room.pathMatrix || []).forEach((rowStr, y) => {
    for (let x = 0; x < rowStr.length; x++) if (rowStr[x] === "~") solid.add(`${x},${y}`);
  });

  const hotspots = new Map();
  // Hotspots may span several tiles (w/h), e.g. the lab vehicles. A `portal`
  // hotspot warps to another scene (the campus); the warp back is handled by
  // Village.jsx's scene stack.
  room.hotspots.forEach((h) => {
    const entry = h.portal
      ? { type: "portal", to: h.portal }
      : h.panel
        ? { type: "panel", id: h.panel, pages: h.pages }
        : { type: "dialog", pages: h.pages };
    for (let y = h.y; y < h.y + (h.h || 1); y++)
      for (let x = h.x; x < h.x + (h.w || 1); x++) hotspots.set(`${x},${y}`, entry);
  });
  // Exit mats only fire walking/facing down, so crossing the two-tile door
  // sideways (e.g. heading for the notice board) doesn't eject you.
  room.mats.forEach(([x, y]) => hotspots.set(`${x},${y}`, { type: "exit-interior", dir: "down" }));

  return {
    ...room,
    npcs,
    isSolid: (x, y) => x < 0 || y < 0 || x >= room.w || y >= room.h || solid.has(`${x},${y}`),
    hotspotAt: (x, y) => hotspots.get(`${x},${y}`) || null,
  };
}

export function getInteriors() {
  return Object.fromEntries(
    Object.entries(ROOMS).map(([id, room]) => [id, buildInteriorLogic(room)]),
  );
}
