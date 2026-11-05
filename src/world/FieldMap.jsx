import { memo } from 'react';

const tile = 2.4;
function tileRect(x, y, w, h, fill, key) {
  return <rect key={key} x={(x - 12) * tile} y={(y - 10.5) * tile} width={w * tile} height={h * tile} fill={fill} />;
}

const Cartography = memo(function Cartography({ manifest, locations }) {
  const { layout, bounds, interior } = manifest;
  const pond = layout?.POND;
  return <>
    <rect x="-180" y="-180" width="360" height="360" fill={interior ? '#92968a' : '#a4c57f'} />
    <rect x={bounds.minX} y={bounds.minZ} width={bounds.maxX - bounds.minX} height={bounds.maxZ - bounds.minZ} fill={interior ? '#eee3c6' : '#c9d68b'} />
    {layout?.TREES?.map(([x,y]) => <circle key={x + ',' + y} cx={(x - 11.5) * tile} cy={(y - 10) * tile} r="1.8" fill="#78aa72" />)}
    {layout?.PATHS?.map(([x,y,w,h], i) => tileRect(x,y,w,h,'#f8daa1',i))}
    {pond && tileRect(pond.x, pond.y, pond.w, pond.h, '#71baca')}
    {layout?.pathMatrix?.map((row,y) => [...row.matchAll(/(#+|~+|=+|B+)/g)].map(match =>
      tileRect(match.index,y,match[0].length,1,match[0][0] === '~' ? '#71baca' : '#f8daa1',y + ':' + match.index)))}
    {manifest.fountain && <circle cx={manifest.fountain.x} cy={manifest.fountain.z} r={manifest.fountain.radius*.65} fill="#65aeb0" stroke="#f3dbae" strokeWidth=".65" />}
    {manifest.landmarks.map(({id, center, half}) => <rect key={id} x={center[0]-half[0]} y={-center[1]-half[1]} width={half[0]*2} height={half[1]*2} fill="#ca916e" stroke="#866b54" strokeWidth=".4" rx=".6" />)}
    {locations.filter(l => l.position && !l.secret).map(({id,position}) => <circle key={id} cx={position[0]} cy={position[2]} r={interior ? .42 : .85} fill="#315b63" stroke="#fff7cf" strokeWidth={interior ? .15 : .35} />)}
  </>;
});

export default function FieldMap({ assets, locations, mapRef, arrowRef, onOpen }) {
  const { manifest } = assets;
  const [x,y] = manifest.spawn;
  const radius = manifest.interior ? 8 : 26;
  return <button className="field-map" onClick={onOpen} aria-label="Open area directory">
    <svg ref={mapRef} viewBox={`${x-radius} ${-y-radius} ${2*radius} ${2*radius}`} aria-hidden="true">
      <Cartography manifest={manifest} locations={locations} />
      <g ref={arrowRef} transform={`translate(${x} ${-y})`}>
        <path transform={`scale(${radius/26})`} d="M0 -3.1 2.35 2.15 0 1.25 -2.35 2.15Z" fill="#ffdc4e" stroke="#303d45" strokeWidth=".65" strokeLinejoin="round" />
      </g>
    </svg>
    <b aria-hidden="true">N</b><span>Area map</span>
  </button>;
}
