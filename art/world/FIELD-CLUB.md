# Field club characters and motion

Original models, iris painting, rig and keyframes created through Blender MCP. The visual reference informed proportions, readable eyes, travel clothes and expressive movement. The shared anatomy keeps residents and the player at the same scale; headwear varies.

The player wears an espresso waffle-knit sweater over a white tee, loose stonewashed jeans, wheat work boots, a fine gold cross necklace, a hoop and a key clip. Tousled layered hair is visible from all angles. Residents share one download containing three switchable looks: swept fringe, gathered hair and a workshop apron, or a watch cap and spectacles. Clothing and skin palettes are selected per person in the game.

## Motion

The 19-joint rig includes ankles, wrists, eyes and a secondary backpack joint. Elbows and knees use blended skin weights. Walk and Run are in-place clips with sagittal two-bone leg solutions, stance/swing timing, toe-off, swing clearance and counter-rotating shoulders and hips. Runtime cadence follows actual speed; both gaits share the same normalized phase during blending. Idle includes breathing, head movement and blinking. Residents ease toward a nearby player and greet once per approach; they rearm only after the player leaves the outer distance threshold.

## Rebuild / inspect

Run `scripts/95_field_club.py` in an isolated Blender instance through MCP. It uses `field_people.py` for geometry and `field_motion.py` for the rig/actions, and stages editable blends, compressed GLBs and inspection renders in `/private/tmp/logan-field-club`. Copy each GLB to `public/world` and its editable source to `art/world/blend`.

Run `scripts/96_field_motion_review.py` after export to reimport the **GLBs**, evaluate every frame of each action checked, measure deformed shoe-sole heights against the ground and render a motion reel. Its height checks are for flat-ground authored clips; terrain following still uses the existing character controller, not per-foot terrain IK. The player has Idle/Walk/Run, residents Idle/Greet. The two models embed their eye illustrations and require no additional runtime libraries.

| Asset | Previous bytes | Current bytes |
| --- | ---: | ---: |
| traveler | 815,040 | 204,908 |
| resident | 789,676 | 212,640 |

## Verification

Reimported soles stayed 0.75–1.00 cm above the authored floor through the walk cycle. The run reached 4.75 cm of clearance in flight. The resident greeting varied by about 1 cm at the soles. In the local production preview, walked, sprinted, reversed direction, and approached residents in Mission Control; the new faces, outfits, turning and raised-hand greeting were visible. All 22 world tests, ESLint and the production build passed.

## Street outfit

`street_fit.py` builds the player wardrobe around the existing 19-joint rig. The sweater and denim use packed original tiling swatches. The sleeves and jeans have blended elbow/knee weights. Run `95_field_club.py` with `ONLY="traveler"` to stage just the player; `97_street_fit_review.py` reimports its GLB for the front/back inspection image. The resident model and animation clips are preserved.

## City entrance Logan

Use `ONLY="logan"` with the same generator to rebuild the outdoor greeter. `host_wardrobe.py` adds his open olive jacket, shoulder bag, court shoes and takeaway cup. His idle and greeting keep the cup upright while his free hand waves. The city loads `logan.glb`; interiors still load the shared `resident.glb`.

The revised player walk travels 0.79 m during its 58% stance phase. The controller's 1.7 m/s walk gives about 150 steps per minute. The mixer advances phase from distance actually walked and blends into the existing sprint. The support leg straightens at midstance, the pelvis shifts toward it, and the swing ankle matches the stance velocity on either side of contact.

## Run and blending refinement

The run uses 1.08 m of stance travel in a 43% stance phase, smoother toe-off/swing/heel-strike and reduced lateral torso twist. Sprint speed is 4.8 m/s with eased acceleration. `locomotion.js` blends gait weights while advancing one continuous phase from actual travel distance, independent of frame rate. Initial avatar heading is set once, not reapplied on every sprint/HUD render. The player's necklace has been removed from the source geometry. The campus-only student asset adds locomotion and a seated reading action without changing the indoor residents or entrance Logan.
