export const INTRO_SEEN = 'logan-city-intro-v1';
export const INTRO_SECONDS = 3.2;
export function shouldShowIntro(route, hash, seen) {
  if (route.interior || route.campus || route.from || hash.startsWith('#guide/')) return false;
  return !seen;
}
export function introEase(t) {
  t = Math.max(0, Math.min(1, t));
  return t*t*t*(t*(t*6-15)+10);
}


// Drift over the city, arc behind the traveler, then settle at the exact
// follow-camera pose. The eased parameter gives zero speed at both ends.
export function introFlightPoint(from, to, time) {
  const t = introEase(time), u = 1-t;
  const c1 = [from[0]-5, from[1]+1.5, from[2]-19];
  const c2 = [to[0]+7, to[1]+9, to[2]+13];
  return from.map((v,i) => u*u*u*v + 3*u*u*t*c1[i] + 3*u*t*t*c2[i] + t*t*t*to[i]);
}
export function introLens(time, base) {
  return base + 5 * Math.sin(Math.PI * introEase(time)) ** 2;
}
