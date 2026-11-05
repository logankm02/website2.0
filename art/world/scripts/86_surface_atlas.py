"""Tileable linear surface channels for stone, timber and field cloth."""
import bpy,numpy as np
from pathlib import Path
n=512
y,x=np.mgrid[0:n,0:n]/n
rng=np.random.default_rng(1409)
def field(cells):
    grid=rng.random((cells,cells)); X=x*cells; Y=y*cells
    ix=X.astype(int); iy=Y.astype(int); a=X-ix; b=Y-iy
    a=a*a*(3-2*a); b=b*b*(3-2*b)
    return ((1-a)*grid[iy,ix]+a*grid[iy,(ix+1)%cells])*(1-b)+((1-a)*grid[(iy+1)%cells,ix]+a*grid[(iy+1)%cells,(ix+1)%cells])*b
grit=field(9)*.26+field(35)*.36+field(96)*.20+rng.random((n,n))*.18
wood=.46+.25*np.sin(2*np.pi*(y*20+1.8*field(4)+.22*field(13)))+.21*(field(80)-.5)
weave=.5+.18*np.cos(2*np.pi*x*52)+.17*np.cos(2*np.pi*y*48+np.pi*(np.cos(2*np.pi*x*52)>0))+.1*(field(28)-.5)
im=bpy.data.images.new('Surface studies - grit, grain and weave',width=n,height=n,alpha=False)
im.colorspace_settings.name='Non-Color'
im.pixels.foreach_set(np.stack([grit,wood,weave,np.ones_like(x)],axis=-1).astype('float32').ravel())
im.filepath_raw='/private/tmp/logan-plaza-art/surface-studies.png'
im.file_format='PNG';im.save()
