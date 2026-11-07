export const INTRO_SEEN = 'logan-city-intro-v1';
export const INTRO_SECONDS = 1.1;
export function shouldShowIntro(route, hash, seen) {
  if (route.interior || route.campus || route.from || hash.startsWith('#guide/')) return false;
  return !seen;
}
export function introEase(t) {
  t = Math.max(0, Math.min(1, t));
  return t*t*t*(t*(t*6-15)+10);
}
