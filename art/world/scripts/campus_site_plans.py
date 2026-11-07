"""Walk-scale site plans. Local +Y follows the Rochester axis / Berkeley's Sather Road.
Survey reference: River Campus printable map (Sept 2025) and Berkeley Library map
(Aug 2025). Dimensions are compressed game units, not survey coordinates."""
def plan(slug):
    paths=[]; buildings=[]; trees=[]
    def path(width,*points): paths.append(dict(width=width,points=points))
    def building(name,x,y,w,d,height,face,style):
        buildings.append(dict(name=name,x=x,y=y,w=w,d=d,h=height,face=face,style=style))
    if slug=='rochester':
        # Entrance from the river, looking east-northeast (bearing ~63 degrees).
        spawn=(0,-33);bounds=(-28,60,-41,43);yaw=0; pitch=-.075
        building('RUSH RHEES LIBRARY',0,31,24,9,21,(0,-1),'rush')
        for name,x,y,w in [('LATTIMORE HALL',-20,-15,23),('MOREY HALL',-20,13,24),
                           ('DEWEY HALL',20,-15,23),('BAUSCH & LOMB',20,13,24)]:
            building(name,x,y,8,w,8,(1 if x<0 else -1,0),'georgian')
        # Beyond the formal green: Meliora near the southeast corner of the
        # library and Hutchison farther into the science district.
        building('MELIORA HALL',33,32,14,9,8,(0,-1),'georgian')
        building('HUTCHISON HALL',52,3,10,18,10,(-1,0),'georgian')
        path(2.2,(12,24),(22,26),(33,25),(42,23),(44,9),(45,3))
        path(2.45,(0,-54),(0,26));path(3.2,(-16,24),(16,24))
        for s in (-1,1):
            path(1.8,(s*12,-36),(s*12,25))
            for y in [-15,13]:path(1.8,(s*16,y),(s*12,y))
            path(1.5,(s*12,-32),(0,-17),(s*12,-2),(0,10),(s*12,23))
        path(2.4,(-17,-32),(17,-32));path(2.2,(-17,-2),(17,-2))
        for s in [-1,1]:
            for i,y in enumerate([-35,-23,-9,5,18,28]):
                trees.append(('tree-autumn' if i in (2,5) else 'tree-0',s*(13.8 if i%2 else 14.3),y,.71+(i%3)*.08))
        return locals()
    # Berkeley: Moffitt SW, Starr NW, Doe south, tower SE. Gate is downstream
    # along Sather Road at the creek, not an entrance arch on Memorial Glade.
    spawn=(-23,6);bounds=(-61,54,-113,35);yaw=-2.14;pitch=-.09
    building('DOE LIBRARY',-3,-29,34,19,13,(0,1),'doe')
    building('The Bancroft Library',18,-32,8,14,8,(0,1),'annex')
    building('campanile',34,-49,4.8,4.8,39.4,(0,-1),'tower')
    building('C. V. Starr East Asian Library',-26,24,21,11,8,(0,-1),'screen')
    building('McLaughlin Hall',9,25,20,8,7,(0,-1),'annex')
    building('Moffitt Library',-44,-13,21,15,8,(1,0),'terraces')
    path(2.7,(-30,-104),(-30,-73),(-28,-48),(-26,-27),(-25,-12),(-23,-4),(-21,3),(-18,11),(-13,16),(-6,18),(3,18),(12,16),(18,12),(20,6),(20,-10))
    path(2.5,(-42,-4),(-31,-5),(-24,-6),(-15,-8),(-6,-10),(4,-11),(20,-10),(31,-8),(43,-5))
    path(1.8,(-23,6),(-21,2),(-18,0),(-14,-2),(-8,-5),(-2,-8),(4,-11))
    path(2.1,(-25,-12),(-17,-13),(-11,-12),(-6,-10))
    path(4.0,(-25,-16),(-3,-16),(19,-16),(25,-18))
    path(2.7,(-3,-16),(-3,-21))
    path(2.5,(-21,3),(-29,7),(-34,10),(-38,13))
    path(1.9,(9,21),(9,17))
    path(2.5,(20,-10),(22,-25),(24,-42),(26,-54),(35,-54))
    path(2.5,(-28,-44),(-10,-44),(12,-44),(24,-42),(34,-43))
    path(3.2,(-30,-109),(-30,-104),(-30,-97))
    path(2.2,(-29,7),(-26,10),(-26,19))
    trees += [('tree-1',x,y,s) for x,y,s in [(-39,16,.72),(-40,3,.58),(-26,1,.47),(-31,-1,.61),(14,15,.56),(24,12,.63),(28,8,.54),(-47,-90,.8),(-42,-94,.67),(0,-94,.74),(10,-97,.69)]]
    trees += [('tree-0',x,y,.73) for x,y in [(-19,16),(3,32),(24,-4),(40,-9),(-18,-53),(17,-53),(15,-34),(-38,-34),(-50,16)]]
    for i in range(6):
        trees.extend([('tree-0',-35,-40-i*10,.63),('tree-0',-24,-47-i*9,.59)])
    return locals()
