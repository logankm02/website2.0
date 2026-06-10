# Personal Website

Personal portfolio site — React + Vite + Tailwind CSS, deployed to Cloudflare Pages.

## Develop

```
npm install
npm run dev
```

## Routes

- `/` — video intro + portfolio (desktop: click to enter; mobile: swipe up)
- `/about` — portfolio with static banner, no intro
- `/classic` — the original three.js soccer-scene landing page

## Structure

| Path | Purpose |
| --- | --- |
| `src/data/` | All site content (bio, experience, projects, skills, …) as plain data |
| `src/pages/` | One component per route |
| `src/sections/` | Portfolio page sections (Hero, Education, Experience, …) |
| `src/components/` | Shared UI, hero widgets, intro overlays |
| `src/hooks/` | `useMediaQuery`, `useCarousel` |
| `src/models/` | Generated three.js model for `/classic` |

## Deploy

```
npm run deploy
```

(Builds and runs `wrangler pages deploy dist` — requires Wrangler login.)
