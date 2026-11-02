"""Iteration 3: brighter light, distant ridges, textured ground, no primitive clouds."""
import bpy, math, numpy as np
from world_core import *
scene=bpy.context.scene
for ob in list(scene.objects):
    if ob.name.startswith('Distant cloud'): bpy.data.objects.remove(ob,do_unlink=True)
mount=bpy.data.objects.get('Far snow peaks')
mount.location.y+=150; mount.location.x+=35; mount.scale.z=.6
for v in mount.data.vertices:
    p=v.co
    p.z+=max(0,p.z)*.09*noise(p.x*.30,p.y*.30)
# Atmospheric color softens distance without adding costly world volumes.
for ob in scene.objects:
    if ob.name.startswith('Distant ridge') or ob.name.startswith('Far snow'):
        for matl in ob.data.materials:
            p=next(n for n in matl.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
            p.inputs['Emission Color'].default_value=(.20,.33,.42,1)
            p.inputs['Emission Strength'].default_value=.4
world=scene.world; n=world.node_tree.nodes; links=world.node_tree.links
bg=next(n for n in n if n.type=='BACKGROUND')
bg.inputs['Color'].default_value=(.39,.67,1,1); bg.inputs['Strength'].default_value=.75
# Restrained procedural cloud texture in the background, not separate mesh blobs.
tex=n.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=3.8; tex.inputs['Detail'].default_value=5; tex.inputs['Roughness'].default_value=.65
coord=n.new('ShaderNodeTexCoord'); links.new(coord.outputs['Normal'],tex.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position=.56; ramp.color_ramp.elements[0].color=(.28,.58,.95,1); ramp.color_ramp.elements[1].position=.73; ramp.color_ramp.elements[1].color=(.82,.88,.95,1); links.new(tex.outputs['Fac'],ramp.inputs[0]); links.new(ramp.outputs['Color'],bg.inputs['Color'])
scene.view_settings.exposure=.65
try: scene.view_settings.look='AgX - Medium High Contrast'
except TypeError: pass
# Hand-generated neutral microtexture multiplied by the terrain's authored vertex colors.
terrain=bpy.data.objects['Terrain']; d=terrain.data
uv=d.uv_layers.new(name='Meadow UV')
for poly in d.polygons:
    for li in poly.loop_indices:
        p=d.vertices[d.loops[li].vertex_index].co; uv.data[li].uv=(p.x/4,p.y/4)
rng=np.random.default_rng(41); size=512
noise_a=rng.random((size,size)); grain=.80+.20*noise_a
img=bpy.data.images.new('Original meadow grain',width=size,height=size,alpha=True)
a=np.ones((size,size,4),dtype=np.float32); a[:,:,:3]=grain[:,:,None]; img.pixels.foreach_set(a.ravel()); img.pack()
matl=d.materials[0]; nodes=matl.node_tree.nodes; links=matl.node_tree.links
p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED'); attr=next(n for n in nodes if n.type=='VERTEX_COLOR'); tex=nodes.new('ShaderNodeTexImage'); tex.image=img
mul=nodes.new('ShaderNodeMixRGB'); mul.blend_type='MULTIPLY'; mul.inputs[0].default_value=1; links.new(attr.outputs['Color'],mul.inputs[1]); links.new(tex.outputs['Color'],mul.inputs[2]); links.new(mul.outputs[0],p.inputs['Base Color'])
# Warm foliage bounce: use modest diffuse subsurface, never transparent cards.
for matl in bpy.data.materials:
    if 'varied foliage' in matl.name:
        p=next(n for n in matl.node_tree.nodes if n.type=='BSDF_PRINCIPLED'); p.inputs['Subsurface Weight'].default_value=.12
scene.render.filepath=str(OUT/'previews/village-03.png'); scene.cycles.samples=40
# Stage locally before moving the generated source into the project.
import tempfile, shutil
staged=Path(tempfile.gettempdir())/'brackenvale-v03.blend'
bpy.data.libraries.write(str(staged),{scene},fake_user=True,compress=True)
shutil.move(str(staged),str(OUT/'blend/brackenvale-v03.blend'))
bpy.ops.render.render(write_still=True)
print('Third visual iteration rendered.')
