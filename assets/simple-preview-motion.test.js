const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
// Replacing authored waypoints with a generic edge-to-edge flyby must fail these tests.
const html=fs.readFileSync(path.join(__dirname,'../designer-ai/simple-preview.html'),'utf8');
const motion=html.slice(html.indexOf('function updateMotion('),html.indexOf('function setTime('));
function scene(actions,base={x:.8,y:.72}){
 const actor={dataset:{subject:'fighter',baseX:String(base.x),baseY:String(base.y)},style:{}};
 const sandbox={state:{index:0,beats:[{actions}]},stage:{querySelectorAll:()=>[actor]},E:s=>String(s??'').trim(),L:s=>String(s??'').trim().toLowerCase()};
 vm.createContext(sandbox);vm.runInContext(motion,sandbox);
 return {actor,at:t=>sandbox.updateMotion(t)};
}
const move={type:'move',subject:'fighter',motionIntent:'path_loop',pathShape:'waypoints',centerX:.5,centerY:.5,width:.8,height:.6,periodSeconds:10,loop:false,pathPoints:[{x:.8,y:.72},{x:.67,y:.7}],pathEasing:'ease_in_out',startOffset:0,duration:10};
function near(actual,want){assert.ok(Math.abs(parseFloat(actual)-want)<1e-8,`${actual} should be ${want}%`);}
test('a staged waypoint ship starts at its authored position, not outside the frame',()=>{const s=scene([move]);s.at(0);near(s.actor.style.left,80);near(s.actor.style.top,28);});
test('waypoint motion interpolates both viewport coordinates',()=>{const s=scene([move]);s.at(5);near(s.actor.style.left,73.5);near(s.actor.style.top,29);});
test('waypoint motion reaches its authored endpoint',()=>{const s=scene([move]);s.at(10);near(s.actor.style.left,67);near(s.actor.style.top,30);});
test('a completed non-looping path holds its endpoint',()=>{const s=scene([{...move,duration:6,periodSeconds:6}]);s.at(8);near(s.actor.style.left,67);near(s.actor.style.top,30);});
test('short actions stop at their partial period position',()=>{const s=scene([{...move,duration:5,pathEasing:'linear'}]);s.at(7);near(s.actor.style.left,73.5);near(s.actor.style.top,29);});
test('seeking backward restores the staged position before a delayed action',()=>{const s=scene([{...move,startOffset:2,duration:6,periodSeconds:6}]);s.at(7);s.at(1);near(s.actor.style.left,80);near(s.actor.style.top,28);});
test('clockwise false reverses open waypoint traversal',()=>{const s=scene([{...move,clockwise:false}]);s.at(0);near(s.actor.style.left,67);near(s.actor.style.top,30);});
test('legacy direction-only movement still crosses from right to left',()=>{const s=scene([{type:'move',subject:'fighter',travelDirection:'right_to_left',duration:10}]);s.at(0);near(s.actor.style.left,102);s.at(10);near(s.actor.style.left,-2);});
