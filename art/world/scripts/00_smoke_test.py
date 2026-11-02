import bpy
from mathutils import Vector
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
scene = bpy.data.scenes.new('MCP verification')
bpy.context.window.scene = scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 720
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.world = bpy.data.worlds.new('Verification daylight')
scene.world.use_nodes = True
bg = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (.35, .55, .8, 1)
bg.inputs['Strength'].default_value = .5

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = .7
    return mat

bpy.ops.mesh.primitive_cube_add(location=(0, 0, 1))
obj = bpy.context.object
obj.name = 'MCP generated beveled test object'
obj.data.materials.append(material('Warm clay', (.65, .19, .045)))
mod = obj.modifiers.new('Rounded edges', 'BEVEL')
mod.width = .15
mod.segments = 4
bpy.ops.mesh.primitive_plane_add(size=200)
bpy.context.object.data.materials.append(material('Sage ground', (.17, .29, .11)))
bpy.ops.object.light_add(type='AREA', location=(-3, -4, 7))
bpy.context.object.data.energy = 1200
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 5
bpy.ops.object.camera_add(location=(5, -7, 4.8))
scene.camera = bpy.context.object
scene.camera.rotation_euler = (Vector((0, 0, 1)) - scene.camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera.data.lens = 45
scene.render.filepath = str(OUT / 'previews/mcp-verification.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'blend/mcp-verification.blend'), copy=True)
bpy.ops.render.render(write_still=True)
print('Verified: generated object, saved .blend, rendered PNG through MCP.')
