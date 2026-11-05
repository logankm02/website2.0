"""Orient the original Rochester halls toward the green, retaining their footprints.
The source campus uses Blender Z-up; its original façades all point toward -Y.
Keep this in the export pipeline so rebuilding the landmark never resets the halls.
"""
import math

# center X/Y, original width/depth, counterclockwise rotation about Blender Z
INWARD_HALLS = {
    'BAUSCH & LOMB': (-24.0, 2.4, 9.6, 12.0, math.pi / 2),
    'MOREY HALL': (24.0, 2.4, 9.6, 12.0, -math.pi / 2),
    'DEWEY HALL': (0.0, -16.8, 19.2, 7.2, math.pi),
}
FACADE_PARTS = ('Campus limestone window', 'Campus deep blue glazing',
                'Campus window mullion', 'Campus window transom',
                'Hipped campus roof', 'Roof tile course', 'Quad-facing window',
                'Quad-facing glazing')

def hall_transform(name):
    from mathutils import Matrix, Vector
    x,y,w,d,angle=INWARD_HALLS[name]
    # Preserve the parcel after the frontage/depth swap of a quarter-turn.
    quarter=abs(abs(angle)-math.pi/2)<.01
    fit=Matrix.Diagonal((w/d,d/w,1,1)) if quarter else Matrix.Identity(4)
    return Matrix.Translation(Vector((x,y,0))) @ fit @ Matrix.Rotation(angle,4,'Z') @ Matrix.Translation(Vector((-x,-y,0)))

def orient_hall(source_object, clone, midpoint):
    for name, (x, y, w, d, angle) in INWARD_HALLS.items():
        building_part = source_object.name.startswith((name,) + FACADE_PARTS)
        if not building_part or abs(midpoint.x-x)>w/2+.4 or abs(midpoint.y-y)>d/2+.4:
            continue
        clone.matrix_world=hall_transform(name) @ clone.matrix_world
        clone['quad_hall']=name
        return name
    return None

def update_doors(manifest):
    for landmark in manifest['landmarks']:
        spec=INWARD_HALLS.get(landmark['id'])
        if not spec:continue
        x,y,w,d,angle=spec
        nx,ny=round(math.sin(angle)),round(-math.cos(angle))
        distance=(w/2 if nx else d/2)+1.4
        door=[x+nx*distance,y+ny*distance,landmark['center'][2]]
        landmark['door']=door
        landmark['facing']=[nx,ny]
        for location in manifest['locations']:
            if location['id']==landmark['id']:
                location['position']=[door[0],door[2],-door[1]]
