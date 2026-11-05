"""Render-driven refinement: softer slate, detailed side elevations and ivy."""
import bpy, math, random
from city_spacing import EAST_TILES, TILE
lab_offset = EAST_TILES * TILE
# The lab's footprint moved north (y=8 -> y=1 in city_spacing.py) to join the
# other two buildings' street-facing row; these hand-placed side details
# shift by the same world-space delta to stay attached to its walls.
lab_shift_y = 16.8
from mathutils import Vector
from world_core import *
import world_nature as nature
scene=bpy.context.scene
assert scene.name.startswith('LOGAN CITY')
slate=mat('Weathered blue gray slate',(.10,.14,.19),.82,28,.025)
slate_alt=mat('Subtle slate variation',(.12,.16,.21),.8,28,.025)
for i,o in enumerate(scene.objects):
    if o.name.startswith('Overlapping slate roof tile'): o.data.materials[0]=slate_alt if i%4==0 else slate

def sidewindow(x,y,z,w=1.8,h=1.7):
    box('Side window stone reveal',(x,y,z+h/2),(.16,w+.2,h+.2),M['cream'],.035)
    box('Side window glazing',(x-.1,y,z+h/2),(.03,w,h),M['glass'],.015)
    for dy in [-w/2,0,w/2]: box('Side window mullion',(x-.14,y+dy,z+h/2),(.06,.055,h),M['cream'])
    box('Side window transom',(x-.14,y,z+h*.5),(.06,w,.055),M['cream'])
    box('Side window stone sill',(x-.24,y,z),(.48,w+.4,.13),M['stoneLight'],.035)
# West elevations are prominent while exploring and in the overview.
for y in [12,16.5,20]:
    for z in [3.6,6.7]: sidewindow(-21.68,y,z,1.8,1.65)
for y in [-4.5,1,5]:
    sidewindow(lab_offset-.1,y+lab_shift_y,4.3,3,1.6)
    box('Lab wall pilaster',(lab_offset-.08,y+lab_shift_y+2,4.9),(.24,.22,4.8),M['stoneLight'],.035)
for x in [lab_offset,lab_offset+21.6]:
    mesh('Workshop closed gable',[(x,-8.4+lab_shift_y,7.3),(x,6+lab_shift_y,7.3),(x,-1.2+lab_shift_y,8.7)],[(0,1,2)],M['plaster'])
for y in [11.5,16,20]:
    sidewindow(-.1,y,4.0,2.2,1.5)
    box('Mission panel seam',(-.1,y+1.6,5.8),(.045,.055,6.2),M['metal'])
# Pediment oculus and fine horizontal clapboard courses.
cx,fy=-14.4,8.11
for j in range(8):
    h=.3+j*.32; half=7.2*(1-h/3.2)
    box('Pediment clapboard joint',(cx,fy,9.7+h),(half*2,.02,.025),M['stoneLight'])
for radius,material in [(.52,M['navy']),(.64,M['cream'])]:
    if radius==.52:
        uvball('Pediment round attic glass',(cx,fy-.05,11.1),(.51,.04,.51),M['glass'],32,16)
    else:
        curve('Pediment oculus surround',[(cx+radius*math.cos(i*TAU/48),fy-.1,11.1+radius*math.sin(i*TAU/48)) for i in range(49)],.09,material)
box('Oculus cross rail',(cx,fy-.16,11.1),(1,.04,.045),M['cream'])
box('Oculus upright',(cx,fy-.16,11.1),(.045,.04,1),M['cream'])

# Ivy traces follow the masonry, using folded leaf geometry rather than blobs.
rr=random.Random(305); vs=[];fs=[];cs=[]
for xx,yy,h in [(-21.82,10,5.8),(-21.82,19,5.6),(lab_offset-.23,-6.8,3.3),(lab_offset-.23,5.4,3.7)]:
    for branch in range(5):
        points=[]
        for j in range(24):
            z=2.5+h*j/24; y=yy+branch*.18+.2*math.sin(j*.38+branch)
            points.append((xx,y,z))
            for k in range(4):
                p=(xx-.03,y+rr.uniform(-.3,.3),z+rr.uniform(-.15,.15))
                nature.leaf(vs,fs,cs,p,.23,.16,rr.uniform(0,TAU),rr.uniform(-.6,.6),(.06+rr.random()*.09,.19+rr.random()*.15,.025))
        curve('Climbing ivy stem',points,.012,M['wood'])
mesh('Living ivy on city masonry',vs,fs,nature.vertex_material('Ivy variegation city'),colors=cs)

# Rooftop HVAC and gutters add readable layers without extra runtime effects.
for x in [4.2,10.2]:
    box('Mission rooftop HVAC',(x,18,10),(2,2,1),M['metal'],.08)
    for i in range(10): box('HVAC louver',(x-.8+i*.18,16.97,10),(.07,.04,.65),M['steel'])
for x,y,d in [(-21.8,14.4,12),(-7,14.4,12),(lab_offset,-1.2,14.4)]:
    curve('Rainwater downpipe',[(x,y-d/2,8),(x-.15,y-d/2,7.7),(x-.15,y-d/2,2.8)],.055,M['metal'])

# Soften the baked bevel chamfers into rounded chunky edges; terrain, water,
# distant backdrop and vegetation prototypes keep their own shading.
bpy.ops.object.select_all(action='DESELECT')
smooth_count=0
for o in scene.objects:
    if o.type!='MESH': continue
    if o.get('terrain') or o.get('prototype') or o.get('instance_kind') or o.get('vegetation_chunk'): continue
    if o.name.startswith(('Logan Terrain','Pond turquoise water','Distant ridge','Far snow')): continue
    o.select_set(True); smooth_count+=1
smoothed=[o for o in scene.objects if o.select_get()]
if smoothed:
    bpy.context.view_layer.objects.active=smoothed[0]
    bpy.ops.object.shade_auto_smooth(angle=math.radians(30))
print('Auto-smoothed',smooth_count,'architecture/fence/prop objects at 30 degrees.')

scene.camera.location=(0,-77,61)
scene.camera.rotation_euler=(Vector((8,1,3))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera.data.lens=37
scene.render.resolution_percentage=100
scene.cycles.samples=40
print('Slate, side windows, pediment, ivy and rooftop details refined.')
