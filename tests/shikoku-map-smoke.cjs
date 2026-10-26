'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root=path.resolve(__dirname,'../medical-intelligence/shikoku');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),css=read('style.css'),dataJs=read('data.js'),mapJs=read('map.js'),appJs=read('app.js');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
for(const href of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(href[1]),'Missing internal hash anchor '+href[1]);
for(const script of ['data.js','app.js','map.js'])assert(new RegExp('src="\\./'+script.replace('.','\\.')+'(?:\\?v=[^" ]+)?"').test(html),'Missing script: '+script);
for(const needed of ['mapMode','mapPref','mapCategory','mapStatus','mapList','mapReset','mapFallback','mapCount','areaFilter','arearows'])assert(ids.includes(needed),'Missing interface control '+needed);
assert(css.includes('@media(max-width:580px)'),'Mobile map layout missing');
assert(mapJs.includes('layer.clearLayers()'),'Map layer cleanup missing');
assert(mapJs.includes('getComputedStyle(cssProbe)'),'Leaflet CSS load guard missing');
assert(!/L\.map\s*\(/.test(appJs),'Legacy map initializer remains in app.js');
const env={window:{}};
vm.runInNewContext(dataJs,env,{filename:'data.js'});
const data=env.window.ShikokuData;
assert.equal(data.pref.length,4,'Expected four prefectures');
assert.equal(data.areas.length,16,'Expected sixteen areas');
assert.equal(data.doctorAreas.length,16,'Expected sixteen doctor index records');
for(const [pref,area] of data.areas)assert(data.doctorAreas.some(d=>d[0]===pref&&d[1]===area),'Missing doctor index '+pref+area);
for(const p of data.places)assert(Number.isFinite(p[3])&&Number.isFinite(p[4])&&p[3]>=31&&p[3]<=36&&p[4]>=131&&p[4]<=137,'Invalid location: '+p[1]);
class FakeElement {
 constructor(id){this.id=id;this.value=id==='mapMode'?'overview':id==='mapPref'||id==='areaFilter'?'全県':'all';this.innerHTML='';this.textContent='';this.hidden=true;this.disabled=false;this.listeners={};this.style={};this.classList={toggle(){}};}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 fire(name,extra={}){for(const fn of this.listeners[name]||[])fn({target:this,...extra});}
 dispatchEvent(evt){this.fire(evt.type,evt);}
 querySelectorAll(){return [];}
 querySelector(){return null;}
 scrollIntoView(){}
 setAttribute(){}
 remove(){}
}
function boot(options={}) {
 const idsMap=Object.fromEntries(ids.map(id=>[id,new FakeElement(id)]));
 const layer={items:[],clearLayers(){this.items.length=0;},addTo(){return this;}};
 let activeMap=null;
 const fakeMap={
   setView(){return this;},fitBounds(){return this;},setMaxBounds(){return this;},invalidateSize(){return this;},
   addLayer(){return this;}
 };
 function marker(){return {events:{},bindPopup(){return this;},on(name,fn){this.events[name]=fn;return this;},addTo(layer){layer.items.push(this);return this;},openPopup(){return this;}};}
 const L={
   map(){activeMap=fakeMap;return fakeMap;},
   control:{zoom(){return {addTo(){}};}},
   tileLayer(){return {on(){return this;},addTo(){return this;}};},
   layerGroup(){return layer;},
   marker,circleMarker:marker,
   divIcon(obj){return obj;},
   latLngBounds(){return {pad(){return this;}};}
 };
 const events={};
 const document={
   getElementById:id=>idsMap[id]||null,
   addEventListener:(name,fn)=>{events[name]=fn;},
   body:{appendChild(){}},
   createElement:()=>new FakeElement('cssProbe'),
   visibilityState:'visible'
 };
 const win={ShikokuData:data,L:options.noLeaflet?null:L,ResizeObserver:undefined,
   getComputedStyle:()=>({position:options.noStyles?'static':'absolute'}),addEventListener(){}};
 const context={window:win,document,L,requestAnimationFrame:fn=>fn(),Event:class{constructor(type){this.type=type;}}};
 vm.runInNewContext(mapJs,context,{filename:'map.js'});
 return {ids:idsMap,layer,activeMap,events};
}
const check=(root,expected,msg)=>assert.equal((root.ids.mapList.innerHTML.match(/class="map-item"/g)||[]).length,expected,msg);
{
 const ui=boot();check(ui,4,'Initial map must group four prefectures');
 assert.equal(ui.layer.items.length,4,'Initial map must show just four markers');
 ui.ids.mapMode.value='areas';ui.ids.mapMode.fire('change');
 check(ui,16,'All areas mode must have 16 locations');
 assert.equal(ui.layer.items.length,16,'All area mode must have 16 visible markers');
 ui.ids.mapPref.value='香川';ui.ids.mapPref.fire('change');
 check(ui,3,'Kagawa has three areas');
 assert.equal(ui.ids.areaFilter.value,'香川','Prefecture choice must sync table');
 ui.ids.mapMode.value='places';ui.ids.mapMode.fire('change');
 check(ui,data.places.filter(p=>p[0]==='香川').length,'Place mode must show only Kagawa locations');
 ui.ids.mapCategory.value='大学病院';ui.ids.mapCategory.fire('change');
 check(ui,1,'University hospital category filter must work');
 ui.ids.mapReset.fire('click');
 check(ui,4,'Reset must show four groups');
 assert.equal(ui.ids.mapPref.value,'全県','Reset must restore the four-prefecture view');
 ui.layer.items[0].events.click();
 check(ui,3,'Clicking Tokushima group must drill to its three areas');
 assert.equal(ui.ids.mapPref.value,'徳島','Group drilldown must select the prefecture');
}
{
 const ui=boot({noLeaflet:true});check(ui,4,'Fallback list must work without Leaflet');
 assert.equal(ui.ids.mapFallback.hidden,false,'Missing Leaflet must show fallback');
}
{
 const ui=boot({noStyles:true});check(ui,4,'Missing Leaflet CSS must still show links');
 assert.equal(ui.ids.mapFallback.hidden,false,'Broken tile layout must be hidden on missing CSS');
}
console.log('PASS: four-prefecture overview, 16 areas, area/table sync, place filters, reset, drilldown, and fallback.');
