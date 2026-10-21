const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..','dist'),context=vm.createContext({console});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
load('assets/js/core.js');load('assets/js/catalog.js');
const L=context.AlgoLab;
for(const group of L.groups){load(`${group.section}/${group.id}/${group.id}.js`);load(`${group.section}/${group.id}/code-variants.js`);}
let frames=0;
for(const item of L.items){
  const trace=L.builders[item.id]();
  for(const language of ['cpp','python','java']){
    const version=L.getCode(item.id,trace,language);
    for(const label of Object.keys(trace.labels))assert.ok(version.labels[label],`${item.id}/${language}: missing ${label}`);
    for(let i=0;i<trace.steps.length;i++){
      const step=trace.steps[i],line=version.labels[step.label],source=version.code[line-1];
      assert.ok(line>=1&&line<=version.code.length,`${item.id}/${language}/${step.label}`);
      assert.ok(source.trim()&&!/^\s*(#|\/\/)/.test(source),`${item.id}/${language}: non-executable highlight`);
      const before=JSON.stringify(step.vars);L.watchVars(trace,i,version,language);assert.equal(JSON.stringify(step.vars),before);
      frames++;
    }
  }
}
const t=L.builders['linear-search']({values:[3,5],target:8}),v=L.getCode('linear-search',t,'python');
const terminal=t.steps.findIndex(step=>step.label==='loop'&&step.vars.i===2);
assert.equal(L.watchVars(t,terminal,v,'python').i,undefined,'Python for must not show a C++ terminal index');
assert.equal(L.watchVars(t,0,v,'python').i,0);
assert.throws(()=>L.parseCode('same|x\nsame|y'),/重复/);
assert.throws(()=>L.getCode('missing',t,'python'),/尚未接入/);
console.log(`Verified ${L.items.length} × 3 language mappings and ${frames} frame projections.`);
