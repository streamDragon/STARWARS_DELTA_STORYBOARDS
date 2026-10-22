import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const workbench=readFileSync(new URL('../assets/authoring-workbench-ui.26040424df83.js',import.meta.url),'utf8');

test('home offers film and level workflows as distinct primary destinations',()=>{
  assert.match(home,/href="workbench\.html\?kind=film"/);
  assert.match(home,/href="workbench\.html\?kind=level"/);
  assert.match(home,/href="film-qa\.html"/);
  assert.match(home,/href="level-qa\.html"/);
});
test('specialist and historical tools are available behind an accessible disclosure',()=>{
  const match=home.match(/<details[^>]*class="portal-extra"[^>]*>([\s\S]*?)<\/details>/);
  assert.ok(match,'the advanced tools menu must be a native details element');
  for(const page of ['storyboards.html','sprite-sheet-player.html','cutscene-preview.html','devora.html','cinematic-director.html'])
    assert.ok(match[1].includes('href="'+page+'"'),page+' must remain accessible');
});
test('CURRENT status has pending, verified and unavailable states rather than always-green indicator',()=>{
  assert.match(home,/data-state="pending"/);
  assert.match(home,/dataset\.state=verified\?'verified':'unverified'/);
  assert.match(home,/dataset\.state='unavailable'/);
});
test('workbench honors kind=level deep link and updates URL when user switches tabs',()=>{
  assert.match(workbench,/URLSearchParams\(location\.search\)\.get\('kind'\)/);
  assert.match(workbench,/searchParams\.set\('kind',kind\)/);
});
