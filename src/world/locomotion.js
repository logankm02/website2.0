const smooth = (x,a,b) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t); };
const damp = (a,b,k,dt) => a+(b-a)*(1-Math.exp(-k*dt));
// No clip restarts at a gait change. Both contacts retain their normalized phase.
export function locomotion(state, player, delta) {
  const dt=Math.min(delta,.1);
  state.speed=damp(state.speed??0,player.speed,12,dt);
  state.run=damp(state.run??0,smooth(state.speed,1.85,4.25),7,dt);
  const moving=smooth(state.speed,.03,.72);
  const distance=player.distance??0, advance=Math.max(0,distance-(state.lastDistance??0));
  state.lastDistance=distance;
  const stride=(.79/.58)*(1-state.run)+(1.08/.43)*state.run;
  state.phase=((state.phase??0)+advance/stride)%1;
  return {phase:state.phase,walk:moving*(1-state.run),run:moving*state.run,idle:1-moving};
}
