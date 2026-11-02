"""Iteration 2: density, architecture detail, horizon and daylight."""
import bpy, math, importlib, json
from mathutils import Vector
from world_core import *
import world_nature, world_architecture
scene=bpy.context.scene
assert scene.name.startswith('Brackenvale')
# Only replace the procedural foliage objects in our own scene.
for ob in list(scene.objects):
    if ob.get('prototype') or ob.get('instance_kind') or ob.get('vegetation_chunk'): bpy.data.objects.remove(ob,do_unlink=True)
importlib.reload(world_nature); world_nature.generate()
(OUT/'data/placements.json').write_text(json.dumps(world_nature.PLACEMENTS,separators=(',',':')))
for ob in scene.objects:
    if ob.name.startswith('Distant ridge'):
        ob.location.y+=90; ob.scale.z=.65
# Limestone corner quoins, recessed courses, flower boxes, exposed rafters.
for cx,cy,w,d,h in [(13,23,12,10,5.8),(-13,23,8,7,6.6),(-13,38,7,7,5.2),(12,41,8,7,5.2)]:
    for side in [-1,1]:
        for row in range(int(h/.5)):
            bw=.6 if row%2 else .85
            box('Hand-cut corner limestone',(cx+side*(w/2-.2),cy-d/2-.08,2.5+row*.5+.25),(bw,.23,.42),M['stoneLight'],.04)
    for j in range(int(w/.65)):
        box('Visible roof rafter',(cx-w/2+j*.65,cy-d/2-.28,2.5+h-.12),(.12,.65,.17),M['wood'],.025)
    for side in [-1,1]:
        xx=cx+side*w*.31; yy=cy-d/2-.3
        box('Window herb box',(xx,yy,3.62),(1.5,.58,.34),M['woodLight'],.04)
        for f in range(9): world_nature.instance('flowers-'+str(1+f%3),xx+R.uniform(-.65,.65),yy+R.uniform(-.2,.2),3.80,R.uniform(.6,1),R.random()*TAU)
    # Creeping ivy follows the facade corners, keeps openings readable.
    vs=[]; fs=[]; cols=[]
    for j in range(420):
        zz=2.8+R.random()*h; side=1 if j%2 else -1
        xx=cx+side*(w/2-.8)+.35*math.sin(zz*2)+R.uniform(-.45,.45); yy=cy-d/2-.24
        world_nature.leaf(vs,fs,cols,(xx,yy,zz),R.uniform(.14,.27),.18,R.random()*TAU,R.uniform(.2,1.2),(.065+R.random()*.08,.18+R.random()*.12,.025))
    mesh('Climbing wall ivy',vs,fs,world_nature.vertex_material('Ivy variegation'),colors=cols)
# Pond shore reeds and water lilies.
for i in range(75):
    a=R.random()*TAU; x=-29+12.5*math.cos(a); y=-1+18*math.sin(a)
    if height(x,y)>.4: continue
    for j in range(3):
        h=R.uniform(.6,1.3)
        curve('Shore rush',[(x+j*.04,y,height(x,y)),(x+.1,y+.1,.4+h)],.018,M['grass'])
        tube('Reed seed head',[(x+.1,y+.1,.4+h),(x+.1,y+.1,.6+h)],[.045,.035],M['woodLight'],6)
for i in range(32):
    a=R.random()*TAU; r=R.uniform(.1,.75); x=-29+11*r*math.cos(a); y=-1+17*r*math.sin(a)
    vs=[(x,y,.06)]+[(x+.3*math.cos(t*TAU/16),y+.25*math.sin(t*TAU/16),.065) for t in range(1,16)]
    mesh('Floating lily leaf',vs,[tuple(range(len(vs)))],M['leaf'])
# Original rugged peaks, with altitude-based snow and rock colors.
vs=[]; fs=[]; colors=[]; n=81
for j in range(n):
    y=160+j*2.5
    for i in range(n):
        x=-100+i*2.5
        z=0
        for px,py,h,r in [(-40,250,82,65),(12,215,108,65),(63,256,74,61)]:
            dist=math.sqrt((x-px)**2+((y-py)*1.1)**2)
            z=max(z,h*max(0,1-dist/r)**1.2)
        z+=noise(x*.12,y*.12)*max(1,z*.07)
        vs.append((x,y,z))
        snow=smooth((z-62+noise(x*.08,y*.08)*10)/15)
        c=(.20,.31,.38); colors.append(tuple(mix(c[k],(.74,.84,.88)[k],snow) for k in range(3)))
for j in range(n-1):
    for i in range(n-1): a=j*n+i; fs.extend([(a,a+1,a+n+1),(a,a+n+1,a+n)])
shade(mesh('Far snow peaks',vs,fs,world_nature.vertex_material('Mountain rock and snow'),colors=colors))
# A few distant cloud banks, outside the walkable valley.
cloud=mat('Sunlit cloud',(.84,.9,.95),1)
for i in range(10):
    x=R.uniform(-160,150); y=R.uniform(190,300); z=R.uniform(55,90)
    for k in range(5): uvball('Distant cloud',(x+k*8,y+R.uniform(-5,5),z+R.uniform(-2,2)),(13,5,4),cloud,16,8)
# Reset the composition to a low approach with a clear arcade silhouette.
scene.camera.location=(10,-35,8)
scene.camera.rotation_euler=(Vector((1,23,7))-scene.camera.location).to_track_quat('-Z','Y').to_euler(); scene.camera.data.lens=29
sun=bpy.data.objects['Afternoon sun']; sun.data.angle=math.radians(2); sun.data.energy=2.4
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND'); bg.inputs['Color'].default_value=(.25,.52,.85,1); bg.inputs['Strength'].default_value=.35
scene.view_settings.exposure=0
try: scene.view_settings.look='AgX - Medium High Contrast'
except TypeError: pass
try: scene.render.engine='CYCLES'
except TypeError: pass
scene.cycles.samples=24; scene.cycles.use_denoising=True; scene.cycles.max_bounces=4
scene.render.resolution_x=1440; scene.render.resolution_y=900
scene.render.filepath=str(OUT/'previews/village-02.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'blend/brackenvale-v02.blend'),copy=True)
print('Refinement complete; render ready.')
