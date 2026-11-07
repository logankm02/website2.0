import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Traveler from './Traveler';
import { routeMotion } from './campusLife';

function Walker({ person, asset, world, running }) {
  const initial=routeMotion(person.route,person.phase,person.speed,0);
  const state=useRef({...initial,y:world.height(initial.x,initial.z),speed:0,distance:0});
  const elapsed=useRef(0);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.08),p=state.current;
    if(!running){p.speed=0;return;}
    elapsed.current+=dt;
    const target=routeMotion(person.route,person.phase,person.speed,elapsed.current);
    const oldX=p.x,oldZ=p.z;
    // Ease into the requested trajectory at corners and when departing a stop.
    const alpha=1-Math.exp(-9*dt);
    p.x+=(target.x-p.x)*alpha;p.z+=(target.z-p.z)*alpha;
    p.vx=(p.x-oldX)/dt;p.vz=(p.z-oldZ)/dt;
    const step=Math.hypot(p.x-oldX,p.z-oldZ);p.distance+=step;p.speed=step/dt;
    p.y=world.height(p.x,p.z);
  },-1);
  return <Traveler asset={asset} player={state} residentIndex={person.look} />;
}
export default function CampusCrowd({assets,world,observer,running,quality}) {
  return assets.manifest.people?.filter((p,i)=>quality!=='low'||!p.route||i%2===0).map(person=>
    person.route ? <Walker key={person.id} person={person} asset={assets.resident} world={world} running={running}/> :
      <Traveler key={person.id} asset={assets.resident} observer={observer} residentIndex={person.look}
        position={person.position} behavior={person.behavior} arrivalYaw={Math.PI} contactShadow/>);
}
