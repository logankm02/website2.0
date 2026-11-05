"""Original traveler, rigid/soft joint rig and three looped locomotion clips."""
import bpy, math
from mathutils import Vector
from world_core import *
resident = globals().get('RESIDENT', False)
source_scene=bpy.context.scene
scene=bpy.data.scenes.new('Original traveler asset'); bpy.context.window.scene=scene
skin=mat('Traveler warm skin',(.60,.31,.16),.8)
coat=mat('Traveler indigo field jacket',(.035,.12,.20),.8)
cloth=mat('Traveler linen shirt',(.78,.70,.51),.9)
pants=mat('Traveler charcoal trousers',(.065,.09,.11),.95)
leather=mat('Traveler ochre canvas pack',(.63,.29,.055),.9)
sole=mat('Traveler boot sole',(.10,.065,.035),.9)
hair=mat('Traveler chestnut hair',(.075,.028,.012),.85)
white=mat('Traveler eye whites',(.9,.86,.75),.65)
eye=mat('Traveler eyes',(.04,.07,.055),.45)
pupil=mat('Traveler pupil',(.02,.018,.022),.3)
copper=mat('Traveler copper fasteners',(.80,.36,.095),.33,metal=.58)
lining=mat('Traveler storm teal canvas',(.025,.24,.24),.85)
highlight=mat('Traveler auburn strands',(.15,.058,.024),.78)
parts=[]

def bind(o,bone):
    vg=o.vertex_groups.new(name=bone); vg.add(list(range(len(o.data.vertices))),1,'REPLACE'); parts.append(o); return o

def ball(name,p,s,m,bone):
    o=uvball(name,p,s,m,20,12); bpy.context.view_layer.objects.active=o; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); return bind(o,bone)

def limb(name,a,b,ra,rb,m,bone): return bind(tube(name,[a,tuple(Vector(a).lerp(Vector(b),.5)),b],[ra,(ra+rb)*.54,rb],m,16),bone)
# Rounded jacket torso and collar, separate cuff and seam details.
def tailored(name,rings,material,bone):
    verts=[]; faces=[]; n=32
    for z,rx,ry,dy in rings:
        verts.extend((rx*math.cos(i*TAU/n),dy+ry*math.sin(i*TAU/n),z) for i in range(n))
    for j in range(len(rings)-1):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    return bind(shade(mesh(name,verts,faces,material)),bone)
tailored('Field jacket cut',[(.89,.205,.15,0),(.92,.22,.165,0),(1.02,.205,.16,0),
         (1.18,.22,.18,0),(1.31,.26,.176,0),(1.36,.22,.15,0)],coat,'spine')
tailored('Bound jacket hem',[(.898,.212,.158,0),(.912,.22,.164,0),(.933,.218,.165,0)],lining,'spine')
for side in [-1,1]:
    bind(curve('Slanted welt pocket',[(side*.11,.155,1.07),(side*.18,.103,1.135)],.012,lining),'spine')
ball('Jacket shoulders',(0,0,1.32),(.30,.15,.13),coat,'spine')
bind(box('Jacket zipper',(0,.205,1.15),(.025,.025,.40),leather,.008),'spine')
ball('Neck',(0,0,1.48),(.085,.085,.14),skin,'head')
ball('Shirt collar',(0,0,1.405),(.14,.115,.065),cloth,'spine')
ball('Face',(0,.015,1.66),(.175,.155,.21),skin,'head')
for side in [-1,1]:
    ball('Ear',(side*.174,.005,1.65),(.035,.034,.052),skin,'head')
    # A bigger iris relative to the white, plus a pupil and a catchlight,
    # reads as an expressive anime-style eye instead of a blank stare.
    ball('Eye white',(side*.050,.154,1.688),(.030,.014,.026),white,'head')
    ball('Eye iris',(side*.050,.169,1.686),(.0235,.009,.0205),eye,'head')
    ball('Eye pupil',(side*.050,.176,1.685),(.0105,.005,.0095),pupil,'head')
    ball('Eye catchlight',(side*.044,.179,1.693),(.005,.003,.005),white,'head')
    limb('Eyebrow',(side*.030,.162,1.733),(side*.072,.158,1.736),.011,.007,hair,'head')
ball('Nose',(0,.169,1.64),(.03,.039,.042),skin,'head')
limb('Small smile',(-.034,.155,1.585),(.034,.155,1.585),.006,.006,hair,'head')
# Sculpt a continuous swept cap with overlapping tapered locks.
cap=[]; faces=[]; n=40
for j in range(9):
    for i in range(n):
        a=i*TAU/n
        fringe=1.72+.095*math.sin(a)+.017*math.sin(4*a)
        theta=math.acos(max(-1,min(1,(fringe-1.70)/.205)))*(1-j/8.05)
        cap.append((.184*math.sin(theta)*math.cos(a),-.012+.163*math.sin(theta)*math.sin(a),1.70+.205*math.cos(theta)))
for j in range(8):
    for i in range(n):
        a=j*n+i; b=j*n+(i+1)%n
        faces.append((a,b,b+n,a+n))
bind(shade(mesh('Swept hair cap',cap,faces,hair)),'head')
for i in range(22):
    a=i*TAU/22
    fringe=1.685+.08*math.sin(a)+.02*math.sin(5*a)
    points=[]; radii=[]
    for j in range(9):
        t=j/8; turn=a+.53*(1-t)
        r=.025+.16*math.sin(t*1.58)
        points.append((r*math.cos(turn),-.012+r*.91*math.sin(turn),1.90+(fringe-1.90)*t**1.45))
        radii.append(.003+.035*math.sin(math.pi*t)**.70)
    bind(tube('Swept lock',points,radii,highlight if i%4==1 else hair,10),'head')
# Backpack sits behind the traveler (negative Y).
bind(box('Canvas backpack',(0,-.21,1.19),(.36,.19,.40),leather,.09),'spine')
bind(box('Backpack pocket',(0,-.32,1.12),(.26,.07,.19),coat,.04),'spine')
# Rolled trail blanket, satchel flap, map patch, piping and twin cinches.
bind(tube('Rolled blanket',[(-.22,-.23,1.425),(.22,-.23,1.425)],[.064,.064],lining,24),'spine')
for x in [-.145,.145]:
    bind(tube('Blanket cinch',[(x-.014,-.23,1.425),(x+.014,-.23,1.425)],[.069,.069],sole,20),'spine')
bind(box('Leather rain flap',(0,-.311,1.29),(.34,.049,.135),leather,.026),'spine')
for side in [-1,1]:
    bind(box('Satchel tab',(side*.115,-.341,1.247),(.033,.015,.11),sole,.007),'spine')
    ball('Copper rivet',(side*.115,-.352,1.225),(.012,.007,.012),copper,'spine')
bind(curve('Pocket piping',[(-.12,-.354,1.15),(-.11,-.365,1.19),(.11,-.365,1.19),(.12,-.354,1.15)],.006,cloth),'spine')
bind(mesh('Mountain patch',[(-.076,-.361,1.09),(0,-.361,1.165),(.076,-.361,1.09)],[(0,1,2)],cloth),'spine')
for side in [-1,1]:
    bind(curve('Backpack shoulder strap',[(side*.15,-.2,1.38),(side*.18,.03,1.40),(side*.16,.18,1.12)],.032,leather),'spine')
    bind(box('Backpack buckle',(side*.09,-.366,1.19),(.045,.025,.055),cloth,.008),'spine')
    s=side
    limb('Upper sleeve',(s*.26,0,1.33),(s*.34,0,1.11),.095,.072,coat,'upper_arm.'+str(s))
    ball('Elbow',(s*.34,0,1.10),(.075,.075,.075),coat,'forearm.'+str(s))
    limb('Lower sleeve',(s*.34,0,1.11),(s*.37,.015,.94),.073,.055,coat,'forearm.'+str(s))
    ball('Hand',(s*.37,.025,.89),(.058,.065,.08),skin,'forearm.'+str(s))
    limb('Trouser thigh',(s*.115,0,.91),(s*.13,0,.52),.105,.075,pants,'thigh.'+str(s))
    ball('Trouser knee',(s*.13,0,.52),(.077,.078,.08),pants,'shin.'+str(s))
    limb('Trouser calf',(s*.13,0,.52),(s*.13,0,.16),.075,.055,pants,'shin.'+str(s))
    ball('Hiking boot',(s*.13,.06,.105),(.085,.16,.105),leather,'shin.'+str(s))
    bind(box('Boot sole',(s*.13,.07,.035),(.18,.30,.06),sole,.025),'shin.'+str(s))
    for j in range(3): limb('Boot lace',(s*.13-.06,.12+j*.025,.15),(s*.13+.06,.12+j*.025,.15),.008,.008,cloth,'shin.'+str(s))
if resident:
    # An independent wardrobe for the locals, using the same locomotion rig.
    gear_names=('Canvas backpack','Backpack','Rolled blanket','Blanket cinch','Leather rain flap','Satchel tab','Copper rivet','Pocket piping','Mountain patch')
    for obj in parts[:]:
        if obj.name.startswith(gear_names):
            parts.remove(obj)
            bpy.data.objects.remove(obj,do_unlink=True)
    ball('Waxed cap crown',(0,-.009,1.832),(.192,.174,.11),lining,'head')
    ball('Curved cap peak',(0,.129,1.819),(.157,.120,.027),lining,'head')
    ball('Button top',(0,-.015,1.944),(.020,.020,.014),copper,'head')
    for side in [-1,1]:
        pts=[(side*.059+.044*math.cos(i*TAU/24),.168,1.692+.033*math.sin(i*TAU/24)) for i in range(25)]
        bind(curve('Optical frame',pts,.005,sole),'head')
    bind(curve('Spectacle bridge',[(-.016,.172,1.701),(0,.178,1.707),(.016,.172,1.701)],.004,sole),'head')
    for side in [-1,1]:
        bind(mesh('Lapel',[(side*.04,.148,1.378),(side*.17,.13,1.329),(side*.083,.18,1.211)],[(0,1,2),(2,1,0)],lining),'spine')
    bind(box('Field ID',(-.122,.162,1.255),(.07,.014,.044),cloth,.005),'spine')
body=join(parts,'Resident skinned mesh' if resident else 'Traveler skinned mesh')

arm=bpy.data.armatures.new('Traveler skeleton'); rig=bpy.data.objects.new('Traveler',arm); scene.collection.objects.link(rig)
bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True); bpy.context.view_layer.objects.active=rig; bpy.ops.object.mode_set(mode='EDIT')

def bone(name,head,tail,parent=None):
    b=arm.edit_bones.new(name); b.head=head; b.tail=tail
    if parent:b.parent=arm.edit_bones[parent]
    return b
bone('root',(0,0,0),(0,0,.2)); bone('hips',(0,0,.88),(0,0,1.0),'root'); bone('spine',(0,0,.95),(0,0,1.40),'hips'); bone('head',(0,0,1.40),(0,0,1.85),'spine')
for s in [-1,1]:
    bone('upper_arm.'+str(s),(s*.26,0,1.33),(s*.34,0,1.11),'spine')
    bone('forearm.'+str(s),(s*.34,0,1.11),(s*.37,.015,.89),'upper_arm.'+str(s))
    bone('thigh.'+str(s),(s*.115,0,.91),(s*.13,0,.52),'hips')
    bone('shin.'+str(s),(s*.13,0,.52),(s*.13,0,.10),'thigh.'+str(s))
bpy.ops.object.mode_set(mode='OBJECT'); mod=body.modifiers.new('Traveler skin','ARMATURE'); mod.object=rig; body.parent=rig
for name,length,stride,bend in [('Idle',60,.025,.03),('Walk',32,.42,.32),('Run',22,.72,.72)]:
    rig.animation_data_create(); action=bpy.data.actions.new(name); rig.animation_data.action=action
    for frame in range(0,length+1,2):
        t=frame/length*TAU
        for pb in rig.pose.bones: pb.rotation_mode='XYZ'; pb.rotation_euler=(0,0,0); pb.location=(0,0,0)
        rig.pose.bones['hips'].location.z=(.012 if name=='Idle' else .035)*(.5-.5*math.cos(t*2))
        rig.pose.bones['spine'].rotation_euler.z=math.sin(t)*stride*.10
        for s in [-1,1]:
            wave=math.sin(t+(math.pi if s==1 else 0))
            rig.pose.bones['thigh.'+str(s)].rotation_euler.x=wave*stride
            rig.pose.bones['shin.'+str(s)].rotation_euler.x=-max(0,-wave)*bend
            rig.pose.bones['upper_arm.'+str(s)].rotation_euler.x=-wave*stride*.8
            rig.pose.bones['forearm.'+str(s)].rotation_euler.x=-.12-(.40 if name=='Run' else .08)
        for pb in rig.pose.bones:
            pb.keyframe_insert('rotation_euler',frame=frame); pb.keyframe_insert('location',frame=frame)
    track=rig.animation_data.nla_tracks.new(); track.name=name; track.strips.new(name,0,action)
    # Only the active clip will be evaluated; glTF exports the muted action tracks.
    track.mute=True; action.use_fake_user=True
rig.animation_data.action=None
for pb in rig.pose.bones: pb.rotation_euler=(0,0,0); pb.location=(0,0,0)
scene.frame_set(0)
from pathlib import Path
stage=Path('/private/tmp/brackenvale-stage'); stage.mkdir(exist_ok=True)
bpy.data.libraries.write(str(stage/('resident.blend' if resident else 'traveler.blend')),{scene},fake_user=True,compress=True)
bpy.ops.object.select_all(action='SELECT')
# Animation export uses named actions; inspect clips after export in the browser.
bpy.ops.export_scene.gltf(filepath=str(stage/('resident.glb' if resident else 'traveler.glb')),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_yup=True)
bpy.context.window.scene=source_scene
print('Original traveler saved, rigged and exported with Idle / Walk / Run actions.')
