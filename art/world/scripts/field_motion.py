"""In-place locomotion with planted-foot targets, sagittal two-bone IK and counter-rotation."""
import bpy,math
from mathutils import Vector,Euler
T=math.tau

def make_rig(parts):
    arm=bpy.data.armatures.new('Field club skeleton');rig=bpy.data.objects.new('FieldClub',arm);bpy.context.scene.collection.objects.link(rig);bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
    def bone(name,a,b,parent=None):
        o=arm.edit_bones.new(name);o.head=a;o.tail=b
        if parent:o.parent=arm.edit_bones[parent]
    bone('root',(0,0,0),(0,0,.16));bone('hips',(0,0,.92),(0,0,1.04),'root');bone('spine',(0,0,.975),(0,0,1.36),'hips');bone('head',(0,0,1.425),(0,0,1.85),'spine');bone('pack',(0,-.12,1.33),(0,-.12,1.08),'spine')
    for s in (-1,1):
        suf='.'+str(s);x=s*.105
        bone('thigh'+suf,(x,0,.92),(x,0,.51),'hips');bone('shin'+suf,(x,0,.51),(x,0,.105),'thigh'+suf);bone('foot'+suf,(x,0,.105),(x,.14,.04),'shin'+suf)
        bone('upper_arm'+suf,(s*.209,0,1.32),(s*.272,0,1.083),'spine');bone('forearm'+suf,(s*.272,0,1.083),(s*.296,.012,.906),'upper_arm'+suf);bone('hand'+suf,(s*.296,.012,.906),(s*.304,.02,.83),'forearm'+suf)
        bone('eye'+suf,(s*.081,.15,1.666),(s*.081,.15,1.716),'head')
    bpy.ops.object.mode_set(mode='OBJECT')
    for ob in parts:
        mod=ob.modifiers.new('Club skin','ARMATURE');mod.object=rig;ob.parent=rig
    return rig

def animate(rig,resident,holding_cup=False,student=False):
    bones=rig.pose.bones;bases={p.name:p.bone.matrix_local.to_quaternion() for p in bones}
    def turn(b,x=0,y=0,z=0):bones[b].rotation_quaternion=bases[b].inverted()@Euler((x,y,z)).to_quaternion()@bases[b]
    def move(b,x,y,z):bones[b].location=bases[b].inverted()@Vector((x,y,z))
    def clamp(v,l,h):return max(l,min(h,v))
    def smooth(t):return t*t*(3-2*t)
    clips=[('Idle',108),('Greet',54),('Walk',32),('Run',30),('Sit',108)] if student else [('Idle',108),('Greet',54)] if resident else [('Idle',108),('Walk',32),('Run',30)]
    for name,end in clips:
        action=bpy.data.actions.new(name);rig.animation_data_create();rig.animation_data.action=action
        for fr in range(end+1):
            ph=fr/end;t=T*ph;run=name=='Run';gait=name in ('Run','Walk');wave=math.sin(t)
            for p in bones:p.rotation_mode='QUATERNION';p.rotation_quaternion=(1,0,0,0);p.location=(0,0,0);p.scale=(1,1,1)
            if gait:
                duty=.43 if run else .58;travel=1.08 if run else .79;bend=-.095 if run else -.054
                bob=bend+(.040 if run else .024)*(-math.cos(2*t-.52));shift=(.018 if run else .025)*math.sin(t+.35);move('hips',shift,0,bob)
                turn('hips',0,-.025*wave,-.048*math.cos(t));turn('spine',-.13 if run else -.047,.035*wave,.095*math.cos(t));turn('head',.09 if run else .031,-.018*wave,-.045*math.cos(t));turn('pack',.028*math.sin(2*t-.45),.028*wave,0)
                if not run:
                    # Compress just after heel strike, stand tall over the
                    # supporting foot at midstance. Lean toward that foot.
                    bob=bend-.019*math.cos(2*t-.52)
                    shift=-.014*math.sin(t-.13);move('hips',shift,0,bob)
                    turn('hips',0,-.019*wave,-.042*math.cos(t))
                    turn('spine',-.024,.032*wave,.086*math.cos(t))
                    turn('head',.016,-.012*wave,-.043*math.cos(t))
                for s in (-1,1):
                    u=(ph+(.5 if s==1 else 0))%1;sup=u<duty
                    if sup:
                        f=u/duty;fy=travel*(.5-f);pitch=.19*max(0,1-f*3)-.43*max(0,(f-.61)/.39)**1.5;fz=.105+max(0,-math.sin(pitch)*.191,math.sin(pitch)*.094)
                    else:
                        f=(u-duty)/(1-duty);fy=travel*(smooth(f)-.5);pitch=-.43*(1-f)+.19*f+.12*math.sin(math.pi*f);fz=.105+.08*(1-f)+.018*f+(.33 if run else .135)*math.sin(math.pi*f)**1.15
                    if gait:
                        heel=.10 if run else .16;toe=-.36 if run else -.32
                        if sup:
                            pitch=heel*(1-smooth(min(1,f/.23)))+toe*smooth(clamp((f-.66)/.34,0,1))
                            fz=.105+max(0,-math.sin(pitch)*.195,math.sin(pitch)*.091)
                        else:
                            # Match backwards ankle velocity on *both* ends of
                            # swing, instead of snapping to zero at toe-off.
                            ease=smooth(f);match=(1-duty)/duty
                            fy=travel*(ease-.5-match*f*(1-f)*(1-2*f))
                            pitch=toe+(heel-toe)*ease
                            fz=.105+(1-ease)*(-math.sin(toe)*.195)+ease*math.sin(heel)*.091+(.235 if run else .082)*math.sin(math.pi*f)**2
                    down=.92+bob-fz;d=clamp(math.hypot(down,fy),.035,.8149);a=math.atan2(fy,down)+math.acos(clamp((.41**2+d*d-.405**2)/(.82*d),-1,1));k=-math.acos(clamp((d*d-.41**2-.405**2)/(2*.41*.405),-1,1));su='.'+str(s)
                    turn('thigh'+su,a,0,0);turn('shin'+su,k);turn('foot'+su,pitch-a-k)
                    swing=-math.cos(T*u);turn('upper_arm'+su,(.51 if run else .255)*swing-(.10 if run else .045),-s*.04,s*.045);turn('forearm'+su,(.93 if run else .22)+(.15 if run else .07)*swing);turn('hand'+su,-.12+.05*swing)
            else:
                move('hips',.010*wave,0,-.013+.005*math.cos(t));turn('spine',-.014+.016*wave,.019*wave,.031*wave);turn('head',.015*math.cos(t),-.022*wave,-.088*math.sin(t-.3));turn('pack',.010*wave)
                for s in (-1,1):
                    su='.'+str(s);turn('upper_arm'+su,-.033+.024*math.sin(t+s),-s*.033,0);turn('forearm'+su,.14+.045*math.sin(t+s));turn('thigh'+su,.106);turn('shin'+su,-.204);turn('foot'+su,.098)
                if name=='Greet':
                    env=smooth(clamp(ph/.22,0,1))*smooth(clamp((1-ph)/.26,0,1));turn('upper_arm.1',.19*env,-1.54*env,0);turn('forearm.1',.14+.37*env,(-1.15+.17*math.sin(t*3))*env,0);turn('hand.1',0,.24*math.sin(3*t)*env,0);turn('head',-.09*math.sin(math.pi*ph),-.09*env,.04*env)
            if name=='Sit':
                move('hips',0,0,-.41+.003*wave)
                turn('spine',.065+.015*wave);turn('head',.15+.02*wave)
                for side in (-1,1):
                    su='.'+str(side);turn('thigh'+su,1.43);turn('shin'+su,-1.43);turn('foot'+su,0)
                    turn('upper_arm'+su,.48,0,side*.06);turn('forearm'+su,.84);turn('hand'+su,-.13)
            if holding_cup:
                # Hold the cup upright in the left hand; the right remains free to greet.
                turn('upper_arm.-1',.23,-.045,0);turn('forearm.-1',1.08+.024*wave);turn('hand.-1',-1.29-.024*wave)
            # Blinks on slow loops only; avoid one mechanical blink on every step.
            if not gait:
                blink=max(0,1-abs(ph-.70)/(.028 if name=='Idle' else .04));
                for s in (-1,1):bones['eye.'+str(s)].scale.y=1-.96*blink
            for p in bones:
                if p.name=='root':continue
                p.keyframe_insert('rotation_quaternion',frame=fr)
                if p.name=='hips':p.keyframe_insert('location',frame=fr)
                if p.name.startswith('eye.'):p.keyframe_insert('scale',frame=fr)
        track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,0,action);track.mute=True;action.use_fake_user=True
    rig.animation_data.action=None
    for p in bones:p.rotation_quaternion=(1,0,0,0);p.location=(0,0,0);p.scale=(1,1,1)
