"""Install the enlarged room shells and their matching movable exhibits and wall details."""
import json
from pathlib import Path
from shutil import copyfile
from room_dimensions import ROOM_SIZE
art=Path(__file__).resolve().parents[1]
public=art.parents[1]/'public/world/interiors'
for room,(width,depth) in ROOM_SIZE.items():
    stage=Path('/private/tmp/logan-furnished-rooms')/room
    details=Path('/private/tmp/logan-plaza-art')
    dest=public/room
    manifest=json.loads((stage/'manifest.json').read_text())
    assert abs(manifest['bounds']['maxX']*2+.3-width)<1e-5 and abs(manifest['bounds']['maxZ']*2+.3-depth)<1e-5
    for asset in ('room.glb','heightmap.bin','placements.bin'):copyfile(stage/asset,dest/asset)
    copyfile(stage/'room.blend',art/'blend'/('interior-'+room+'.blend'))
    copyfile(details/(room+'-detail.blend'),art/'blend'/(room+'-detail.blend'))
    copyfile(details/(room+'-detail.glb'),dest/(room+'-detail.glb'))
    manifest['detailModel']='interiors/'+room+'/'+room+'-detail.glb'
    (dest/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
