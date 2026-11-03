const roomNames = { education: 'ΛΚΜ House', experience: 'LOGAN & CO.', projects: 'LOGAN LABS' };
const validRoom = value => Object.hasOwn(roomNames, value) ? value : null;

export function resolveWorldRoute(search) {
  const query = new URLSearchParams(search);
  const interior = validRoom(query.get('interior'));
  const campus = !interior && ['rochester', 'berkeley'].includes(query.get('campus')) ? query.get('campus') : null;
  const from = !interior && !campus ? validRoom(query.get('from')) : null;
  return {
    interior, campus, from,
    prefix: interior ? `interiors/${interior}/` : campus ? `campuses/${campus}/` : '',
    name: interior ? roomNames[interior] : campus === 'rochester' ? 'Eastman Quad' : campus === 'berkeley' ? 'Memorial Glade' : 'Logan City',
    startImmediately: Boolean(interior || from),
  };
}

export function arrivalManifest(manifest, route) {
  const doorway = route.from && manifest.landmarks.find(l => l.id === route.from)?.door;
  return doorway ? { ...manifest, spawn: doorway.slice(0, 2) } : manifest;
}
