"""Generate the campuses' distinct paving and the city buildings' interior joinery."""
import bpy, math, json, random, sys
from pathlib import Path
from mathutils import Vector
scripts=Path(__file__).resolve().parent
sys.path.insert(0,str(scripts))
from room_dimensions import ROOM_SIZE
from world_core import box, curve, mesh, join, mat, text
stage=Path('/private/tmp/logan-plaza-art')
root=scripts.parents[2]/'public/world'
tau=math.tau

def label(name,words,loc,size,material):
    o=text(name,words,loc,size,material)
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH')
    return o

def campus(name):
    layout=json.loads((root/'campuses'/name/'manifest.json').read_text())['layout']
    warm=name=='rochester'
    tones=[(.42,.18,.12),(.55,.26,.16),(.55,.34,.22),(.42,.24,.17)] if warm else [(.63,.55,.43),(.69,.62,.48),(.55,.53,.45),(.66,.58,.44)]
    palette=[mat(name+' paving stone '+str(i),c,.9) for i,c in enumerate(tones)]
    rng=random.Random(711)
    v=[];f=[];indices=[]
    for j,row in enumerate(layout['pathMatrix']):
        for i,code in enumerate(row):
            if code not in '#=':continue
            # Red brick basketweave in Rochester; long limestone flags in Berkeley.
            x=(i-12)*2.4;y=(9.5-j)*2.4
            divisions=4 if warm else 2; size=2.4/divisions
            for a in range(divisions):
                for b in range(divisions):
                    for k in range(2):
                        vertical=warm and (a+b)%2==0
                        w=size/2 if vertical else size; d=size if vertical else size/2
                        xx=x+a*size+(k*w if vertical else 0); yy=y+b*size+(0 if vertical else k*d)
                        h=2.53+rng.uniform(0,.006);base=len(v)
                        v.extend([(xx+.014,yy+.014,h),(xx+w-.014,yy+.014,h),(xx+w-.014,yy+d-.014,h),(xx+.014,yy+d-.014,h)])
                        f.append(tuple(range(base,base+4)));indices.append(rng.randrange(4))
    mesh(name+' quadrangle paving',v,f,palette,indices)

def interior(name):
    school=name=='education'; lab=name=='projects'
    w,d=ROOM_SIZE[name]
    wood=mat('Quarter sawn oak' if school else 'Powdercoat midnight',(.27,.13,.06) if school else (.055,.095,.12),.66)
    trim=mat('Antique brass frame' if school else 'Satin aluminum framing',(.64,.42,.13) if school else (.43,.50,.51),.40,metal=.58)
    paper=mat('Cream engraving paper',(.83,.77,.59),.82)
    ink=mat('Etching Prussian blue',(.018,.089,.11),.75)
    accent=mat('Oxide print ink',(.64,.20,.085),.75)
    lamp=mat('Opal gallery lamp',(.95,.81,.55),.3)
    sh=next(n for n in lamp.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    sh.inputs['Emission Color'].default_value=(1,.80,.53,1); sh.inputs['Emission Strength'].default_value=1.25
    # An unbroken picture rail and a coffered ceiling frame the original furnishings.
    for side in (-1,1):
        for z,height,width in [(1.04,.11,.10),(4.25,.18,.20),(4.40,.13,.32)]:
            box('Side gallery rail',(side*(w/2-.17),0,z),(width,d-.24,height),wood,.022)
        for z in [.95,4.18]:
            box('Brass stringing',(side*(w/2-.24),0,z),(.03,d-.3,.035),trim,.008)
    for y in [-d*.31,0,d*.31]:
        box('Ceiling cross member',(0,y,4.40),(w-.30,.17,.20),wood,.025)
        for x in [-w*.26,w*.26]:
            box('Light housing',(x,y,4.26),(1.15,.24,.12),trim,.035)
            box('Opal diffuser',(x,y,4.18),(1.02,.18,.063),lamp,.035)
    prints={'education':['EASTMAN QUAD','MEMORIAL GLADE'],'experience':['LIDAR  /  FIELD SURVEY','SOLAR  /  TELEMETRY'],'projects':['ROAR  /  SECTION 01','SIGNAL  /  TEST 02']}[name]
    for i,words in enumerate(prints):
        # Build each relief print facing forward, then hang it on a side wall.
        before=set(bpy.context.scene.objects)
        box('Deep picture frame',(0,0,0),(2.45,.12,1.95),wood,.035)
        box('Brass fillet',(0,-.065,0),(2.33,.04,1.83),trim,.012)
        box('Print mat',(0,-.091,0),(2.26,.018,1.75),paper)
        box('Engraved field',(0,-.106,.12),(1.95,.016,1.16),ink)
        yy=-.12
        if school:
            if i==0:
                pts=[(-.81,-.30),(-.81,-.04),(-.43,-.04),(-.43,.10),(-.29,.10),(-.29,.23)]
                pts+=[(.29*math.cos(math.pi-j*math.pi/30),.23+.26*math.sin(math.pi-j*math.pi/30)) for j in range(31)]
                pts += [(.29,.1),(.43,.1),(.43,-.04),(.81,-.04),(.81,-.30)]
            else:
                pts=[(-.75,-.30),(-.18,-.30),(-.16,.40),(-.12,.47),(0,.65),(.12,.47),(.16,.40),(.18,-.30),(.75,-.30)]
            curve('Architectural engraving',[(x,yy,z) for x,z in pts],.018,paper)
            for j in range(11):
                x=-.72+j*.144
                curve('Architectural hatch',[(x,yy,-.26),(x+.03,yy,-.11)],.008,trim)
        else:
            for j in range(4):
                pts=[(-.85+k*.034,yy,-.25+j*.21+.081*math.sin(k*(.22+i*.07)+j*.9)+.023*math.cos(k*.51)) for k in range(51)]
                curve('Signal engraving',pts,.012,trim if j%2 else paper)
        label('Edition caption',words,(0,-.124,-.66),.137,ink)
        label('Print serial','L K M    /    S T U D I E S     0'+str(i+1),(0,-.124,-.81),.052,accent)
        panel=join(list(set(bpy.context.scene.objects)-before),'Gallery plate '+words)
        bpy.context.scene.cursor.location=(0,0,0)
        bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        side=(-1,1)[i]
        panel.rotation_euler.z=-side*math.pi/2
        panel.location=(side*(w/2-.23),.64,2.52)

for name in ['rochester','berkeley','education','experience','projects']:
    scene=bpy.data.scenes.new('Detail study - '+name);bpy.context.window.scene=scene
    (campus if name in ['rochester','berkeley'] else interior)(name)
    bpy.data.libraries.write(str(stage/(name+'-detail.blend')),{scene},fake_user=True,compress=True)
    join(list(scene.objects),name+' finish work')
    bpy.ops.export_scene.gltf(filepath=str(stage/(name+'-detail.glb')),export_format='GLB',use_active_scene=True,use_selection=True,export_animations=False,export_draco_mesh_compression_enable=True)
