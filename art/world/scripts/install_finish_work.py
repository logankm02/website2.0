"""Install Blender exports and their interaction metadata after rebuilding the detail studies."""
import json, shutil
from pathlib import Path
art=Path(__file__).resolve().parents[1]
public=art.parents[1]/'public/world'
stage=Path('/private/tmp/logan-plaza-art')
traveler=Path('/private/tmp/brackenvale-stage')
for source,dest in [(traveler/'traveler.glb',public/'traveler.glb'),(traveler/'traveler.blend',art/'blend/traveler-field.blend'),(stage/'surface-studies.png',public/'surface-studies.png')]:
    shutil.copyfile(source,dest)
shutil.copyfile(traveler/'resident.glb',public/'resident.glb')
shutil.copyfile(traveler/'resident.blend',art/'blend/resident-field.blend')
for district in ['city','rochester','berkeley','education','experience','projects']:
    campus=district in ('rochester','berkeley')
    folder=public if district=='city' else public/('campuses' if campus else 'interiors')/district
    name='meridian-court' if district=='city' else district+'-detail'
    shutil.copyfile(stage/(name+'.glb'),folder/(name+'.glb'))
    shutil.copyfile(stage/(name+'.blend'),art/'blend'/(name+'.blend'))
    path=folder/'manifest.json'
    m=json.loads(path.read_text())
    m['detailModel']=(folder/(name+'.glb')).relative_to(public).as_posix()
    if district=='city':
        m['fountain']={'x':8.2,'z':-.3,'radius':4.18}
        m['collision']=[b for b in m['collision'] if b.get('detail')!='court']+json.loads((stage/'solids.json').read_text())
    path.write_text(json.dumps(m,separators=(',',':')))
