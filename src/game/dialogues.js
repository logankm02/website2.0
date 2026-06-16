// All in-game text. Panels get an intro line before they open; dialogs are
// flavor only; choices end with a YES/NO prompt.

export const WELCOME = [
  "Welcome to LOGAN CITY!",
  "Each building holds a chapter of LOGAN's story. Walk up to a door and step inside.",
];

export const PANEL_INTROS = {
  education: [
    "ΛΚΜ HOUSE — LOGAN's chapter. Letters on the gable, campus flags in the windows, couch on the porch.",
    "The ledger on the podium by the door keeps the full academic record.",
  ],
  experience: [
    "LOGAN & CO. — MISSION CONTROL. A wall of live screens, tiered consoles, and a crew tracking every system. Everyone here has a story for you.",
    "The notice board by the door holds the complete career record.",
  ],
  projects: [
    "LOGAN LABS — the MAKER SPACE. 3D printers humming, tools on the pegboard, spools of filament, the laser cutter glowing. Mind the wet prints.",
    "The notice board by the door indexes the full project roster.",
  ],
  skills: [
    "LOGAN's garden, planted with a corner of AOTEAROA.",
    "TRAINED SKILLS bloom all year between the silver ferns.",
  ],
  contact: ["TOWN NOTICE: Want to reach LOGAN? Mail is the fastest route!"],
  uofr: [
    "EASTMAN QUAD, University of Rochester — LOGAN's undergrad home. Brick halls ring a long green under bare autumn trees.",
    "RUSH RHEES LIBRARY crowns the quad; LOGAN logged countless late nights beneath its dome. Go 'Jackets! Step back onto the glowing pad to return.",
  ],
  ucb: [
    "MEMORIAL GLADE, UC Berkeley — LOGAN's grad-school stomping ground, all California sun and red-tiled roofs.",
    "SATHER TOWER keeps time over DOE LIBRARY at the head of the glade. Go Bears! Step back onto the glowing pad to return.",
  ],
};

export const DIALOGS = {
  mailboxA: ["LOGAN's mailbox. There are 3,047 unread emails inside.", "...better not add to the pile. Use the CONTACT sign instead."],
  mailboxB: ["It's stuffed with KITE flyers. \"Your inbox, but smarter!\""],
  pot: ["The flowers are well looked after. They smell faintly of solder."],
  teslaCar: [
    "A TESLA MODEL Y, fresh off the line, parked outside LOGAN & CO.",
    "The QA checklist on the dash is all green. LOGAN's department, starting July 2026.",
  ],
  soccerBall: [
    "A well-loved soccer ball on the green.",
    "Wall passes against the ΛΚΜ HOUSE: 10,000 and counting. The brothers have stopped complaining.",
  ],
  fern: [
    "A silver fern, transplanted from Aotearoa New Zealand.",
    "Flip a frond — silver underneath, just like back home in Wellington.",
  ],
  kiwi: [
    "A wild kiwi snuffles through the grass, beak first.",
    "Strange... kiwi are nocturnal. It should be fast asleep until nightfall.",
    "The birds here keep LOGAN hours — up at odd times, head down, hunting bugs.",
  ],
  pohutukawa: [
    "A pōhutukawa in full crimson bloom.",
    "New Zealand's Christmas tree — back home it flowers in December, at the height of summer.",
  ],
};

// A choice ends in a YES/NO prompt. `route` navigates in-app, `href` opens a
// new tab; `cancelNudge` steps the player back off the trigger tile on NO.
export const CHOICES = {
  pond: {
    pages: [
      "You peer into the still water...",
      "Old-timers say a CLASSIC world sleeps beneath the surface — the original 3D LOGAN CITY.",
      "Dive in?",
    ],
    choice: { route: "/classic" },
  },
  exit: {
    pages: ["The path leads back to the regular website.", "Leave LOGAN CITY?"],
    choice: { route: "/", cancelNudge: true },
  },
};

export const PANEL_TITLES = {
  education: "EDUCATION",
  experience: "EXPERIENCE",
  projects: "PROJECTS",
  skills: "SKILLS",
  contact: "CONTACT",
};
