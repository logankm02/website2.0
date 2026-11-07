"""Small-scale, original hard-surface and upholstery details for close inspection."""
import bpy, math
from world_core import mat, box, mesh, shade, curve, uvball, text
from world_architecture import lathe

def rounded(name, p, size, material, radius=.04):
    o=box(name,p,size,material)
    b=o.modifiers.new('Soft manufactured edge','BEVEL');b.width=radius;b.segments=5
    bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
    for face in o.data.polygons:face.use_smooth=True
    n=o.modifiers.new('Face weighted normals','WEIGHTED_NORMAL');n.keep_sharp=True;n.weight=50
    bpy.ops.object.modifier_apply(modifier=n.name)
    return o

def label(words,p,size,material,flat=False):
    o=text('Craft lettering '+words,words,p,size,material)
    if flat:o.rotation_euler=(0,0,0)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    return o

def loop(name,x,y,z,w,d,r,material,thick=.009):
    pts=[]
    for cx,cy,start in [(w/2-r,d/2-r,0),(-w/2+r,d/2-r,math.pi/2),(-w/2+r,-d/2+r,math.pi),(w/2-r,-d/2+r,3*math.pi/2)]:
        for i in range(9):
            a=start+i*math.pi/16;pts.append((x+cx+r*math.cos(a),y+cy+r*math.sin(a),z))
    curve(name,pts+[pts[0]],thick,material)

def palette():
    return {
        'metal':mat('Craft machined aluminum',(.39,.47,.50),.28,metal=.75),
        'dark':mat('Craft graphite hardware',(.023,.035,.043),.38,metal=.38),
        'brass':mat('Craft satin brass',(.65,.40,.12),.27,metal=.75),
        'oak':mat('Craft oiled oak wood',(.28,.115,.043),.55,noise_scale=8,bump=.02),
        'cream':mat('Craft porcelain',(.84,.84,.73),.29),
        'cyan':mat('Craft phosphor glass',(.12,.65,.61),.26),
        'ink':mat('Craft ink',(.04,.07,.10),.8),
    }

def keyboard(x,y,z,m):
    rounded('Craft keyboard chassis',(x,y,z),(1.09,.36,.05),m['metal'],.025)
    for row in range(4):
        for col in range(14):
            if row==0 and 4<=col<=8:continue
            rounded('Craft keycap',(x+(col-6.5)*.071,y+(row-1.5)*.075,z+.034),(.061,.06,.018),m['dark'],.006)
    rounded('Craft spacebar',(x,y-.1125,z+.034),(.34,.06,.018),m['dark'],.006)
    uvball('Craft mouse',(x+.70,y,z+.03),(.075,.12,.045),m['cream'],24,12)
    curve('Craft mouse cable',[(x+.70,y+.1,z),(x+.77,y+.24,z),(x+.54,y+.31,z),(x+.46,y+.42,z-.12)],.009,m['dark'])

def dial(x,y,z,m):
    o=lathe('Craft instrument dial',(0,0,0),[(.07,0),(.072,.035),(.05,.05)],m['metal'],24)
    o.rotation_euler.x=math.pi/2;o.location=(x,y,z)
    box('Craft dial witness',(x,y-.055,z+.035),(.008,.009,.026),m['ink'])
