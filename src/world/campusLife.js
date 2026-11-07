// Ping-pong travel with eased speed at each stop. Routes use Blender XY.
export function routeMotion(route, phase, speed, elapsed) {
  const lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[1]-route[i][1]));
  const total=lengths.reduce((a,b)=>a+b,0), pause=2.5;
  const duration=total/speed+pause;
  const t=(elapsed+phase*duration*2)%(duration*2), reverse=t>=duration;
  const leg=t%duration, moving=leg<duration-pause;
  const d=Math.min(total,leg*speed), along=reverse?total-d:d;
  let offset=0, i=0;
  for(;i<lengths.length-1 && along>offset+lengths[i];i++)offset+=lengths[i];
  const f=Math.max(0,Math.min(1,(along-offset)/lengths[i]));
  const a=route[i],b=route[i+1], sign=reverse?-1:1;
  return {x:a[0]+(b[0]-a[0])*f,z:-a[1]-(b[1]-a[1])*f,
    vx:moving?sign*(b[0]-a[0])/lengths[i]*speed:0,
    vz:moving?-sign*(b[1]-a[1])/lengths[i]*speed:0};
}
