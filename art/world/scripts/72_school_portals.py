"""Add the two school-house campus gateways without changing /city itself."""
import bpy, json, math
from world_core import *
from world_architecture import lathe
scene=next(s for s in bpy.data.scenes if s.name.startswith('LOGAN CITY'))
bpy.context.window.scene=scene
meta=json.loads(scene['city_manifest'])
for x,label in [(-20,'ROCHESTER'),(-8.5,'BERKELEY')]:
    y=5.2
    for dx in [-1.1,1.1]:
        lathe(label+' portal pier',(x+dx,y,2.5),[(.28,0),(.28,.2),(.17,.3),(.17,3.1),(.29,3.2)],M['cream'],24)
        meta['collision'].append({'x':x+dx,'z':-y,'hx':.3,'hz':.3,'minY':2.5,'maxY':5.8})
    curve(label+' portal arch',[(x+1.1*math.cos(i*math.pi/40),y,5.7+1.1*math.sin(i*math.pi/40)) for i in range(41)],.12,M['cyan'])
    box(label+' portal sign',(x,y,6),(2.6,.16,.5),M['navy'],.04)
    text(label+' portal lettering',label,(x,y-.1,5.93),.22,M['yellow'])
    # Flush floor inlay keeps the passage accessible to the existing controller.
    box(label+' portal threshold',(x,y,2.51),(2.1,.9,.02),M['copper'] if 'copper' in M else M['teal'],.03)
scene['city_manifest']=json.dumps(meta)
bpy.data.libraries.write('/private/tmp/logan-city-v01.blend',{scene},fake_user=True,compress=True)
print('Both school-house campus portals are ready.')
