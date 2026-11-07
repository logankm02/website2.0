import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guideForLink, guideFromHash } from './guideContent.js';
import { resolveWorldRoute } from './worldRoute.js';
import { spotlightProjects } from '../data/projects.js';

test('every world route starts loading immediately', () => {
  for (const search of ['', '?campus=rochester', '?campus=berkeley', '?interior=education', '?interior=experience', '?interior=projects']) {
    assert.equal(resolveWorldRoute(search).startImmediately, true, search);
  }
});
test('legacy résumé links resolve to local field-guide sections', () => {
  for (const [hash,section] of [['about','education'],['education','education'],['experience','experience'],['projects','projects'],['skills','skills'],['getInTouch','contact']]) {
    assert.equal(guideForLink('/about#'+hash),section);
    assert.equal(guideForLink('https://logankm.com/about#'+hash),section);
  }
  assert.equal(guideForLink('/about'),'resume');
  assert.equal(guideForLink('/world?campus=rochester'),null);
  assert.equal(guideForLink('/classic'),null);
  assert.equal(guideForLink('https://example.com/about'),null);
});
test('every project opens its own local story, including existing exhibit links', () => {
  for (const p of spotlightProjects) {
    assert.equal(guideForLink(p.href),'project-'+p.id);
    assert.equal(guideFromHash('#guide/project-'+p.id),'project-'+p.id);
    if(p.githubHref) assert.equal(guideForLink(p.githubHref),'project-'+p.id);
  }
  for(const room of ['education','experience','projects']) {
    const manifest=JSON.parse(readFileSync(new URL(`../../public/world/interiors/${room}/manifest.json`,import.meta.url)));
    for(const location of manifest.locations) for(const link of location.links || []) {
      if(link.href.startsWith('/about') || spotlightProjects.some(p=>p.href===link.href)) assert.ok(guideForLink(link.href),location.id);
    }
  }
});
test('deep links validate content views and retain unrelated hashes', () => {
  assert.equal(guideFromHash('#guide/resume'),'resume');
  assert.equal(guideFromHash('#guide/__proto__'),null);
  assert.equal(guideFromHash('#guide/project-missing'),null);
  assert.equal(guideFromHash('#about'),null);
});
