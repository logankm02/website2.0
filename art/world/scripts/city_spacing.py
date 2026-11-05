"""Lay out the east workshop court on the 3D map, using /city as its starting point."""
from math import sin, cos

EAST_TILES = 9
TILE = 2.4


def city_layout(layout):
    width = layout['MAP_W']
    layout['MAP_W'] += EAST_TILES
    lab = next(b for b in layout['BUILDINGS'] if b['id'] == 'projects')
    lab['x'] += EAST_TILES
    lab['door']['x'] += EAST_TILES
    # The makerspace joins the same street-facing row as the other two
    # buildings instead of sitting a block south of them.
    lab['y'] = 1
    lab['door']['y'] = 6
    # Centre the middle building between the two fixed facing walls, in tiles.
    house, mission = (next(b for b in layout['BUILDINGS'] if b['id']==kind) for kind in ('education','experience'))
    midpoint = (house['x'] + house['w'] + lab['x'] - mission['w']) / 2
    door_offset = mission['door']['x'] - mission['x']
    mission['x'] = int(midpoint) if midpoint.is_integer() else midpoint
    mission['door']['x'] = int(midpoint + door_offset)
    # Extend the central avenue's east-west street and the workshop walk to
    # reach the relocated door. A second path runs straight from the east
    # walk to Mission Control's front door.
    for path in layout['PATHS']:
        if path[:2] == [14, 14]:
            path[2] += EAST_TILES
        elif path[:2] == [16, 14]:
            path[0] += EAST_TILES
        elif path[:2] == [4, 7]:
            path[2] += EAST_TILES
    # Keep the east promenade beside the pool. Its north end joins the
    # front-door walk, giving a straight route around the fountain's basin.
    layout['PATHS'].append([17, 7, 1, 8])
    layout['PATHS'].append([mission['door']['x'], 7, 1, 8])
    for point in layout['TREES']:
        if point[0] >= width-3:
            point[0] += EAST_TILES
    for x in range(width-3, width-3+EAST_TILES):
        layout['TREES'].extend([[x, 0], [x, layout['MAP_H']-1]])
    for point in layout['POHUTUKAWA']:
        if point[0] == width-2:
            point[0] += EAST_TILES
    return layout


def meadow_height(x,y):
    edge = max(-x-30, x-30-EAST_TILES*TILE, abs(y-1)-26, 0)
    t = min(1, edge/18)
    blend = t*t*(3-2*t)
    return 2.5 + blend*(.5+2.6*sin(x*.07)*cos(y*.055)+1.3*sin(y*.11))
