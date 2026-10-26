'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'structures/pointers/lessons.js'),'utf8'),context,{filename:'pointer-course/lessons.js'});
const course=context.PointerCourse,plain=value=>JSON.parse(JSON.stringify(value));
const ids=['value-address','dereference','aliases','nullptr','array-arithmetic','pointer-parameters','const-pointers','row-pointers','double-pointer','linked-nodes','dynamic-lifetime','unique-ownership'];
assert.ok(course&&Array.isArray(course.levels)&&Array.isArray(course.lessons));
assert.deepEqual(plain(course.levels.map(level=>level.id)),['beginner','basic','advanced']);
assert.equal(new Set(course.levels.map(level=>level.id)).size,3);
assert.deepEqual(plain(course.lessons.map(lesson=>lesson.id)),ids);
for(const level of course.levels)assert.equal(course.lessons.filter(lesson=>lesson.level===level.id).length,4,level.id+' has four lessons');
const get=id=>course.lessons.find(lesson=>lesson.id===id),cell=(step,id)=>step.cells.find(item=>item.id===id),last=lesson=>lesson.steps.at(-1);
const kinds=new Set(['value','pointer','boundary']),statuses=new Set(['live','freed','ended','boundary','dangling']);
const seenMutable=new WeakMap();let frames=0,blocked=0;
function independent(value,frame,local=new WeakSet()){
  if(value===null||typeof value!=='object'||local.has(value))return;local.add(value);
  const previous=seenMutable.get(value);
  if(previous!==undefined&&previous!==frame)assert.ok(Object.isFrozen(value),'Mutable snapshots shared by '+previous+' and '+frame);
  seenMutable.set(value,frame);for(const child of Object.values(value))independent(child,frame,local);
}
for(const lesson of course.lessons){
  assert.match(lesson.id,/^[a-z][a-z-]*$/);assert.ok(lesson.title&&lesson.goal&&lesson.pitfall);
  assert.ok(Array.isArray(lesson.explanation)&&lesson.explanation.length>=2,lesson.id+' explains the model');
  assert.equal(typeof lesson.code,'string');const lines=lesson.code.split('\n');
  assert.ok(lesson.steps.length>=3,lesson.id+' has a useful replay');
  assert.ok(Array.isArray(lesson.sources)&&lesson.sources.length,lesson.id+' cites source material');
  for(const source of lesson.sources)assert.match(source,/^https:\/\//);
  assert.ok(Array.isArray(lesson.related));
  for(const related of lesson.related){assert.ok(related.title);assert.ok(fs.existsSync(path.join(root,related.path)),lesson.id+' related link '+related.path);}
  const quiz=lesson.practice;assert.ok(quiz.question&&quiz.explanation&&Array.isArray(quiz.options)&&quiz.options.length>=2);
  assert.ok(Number.isInteger(quiz.answer)&&quiz.answer>=0&&quiz.answer<quiz.options.length,lesson.id+' quiz answer is a zero-based option index');
  for(const [index,step]of lesson.steps.entries()){
    frames++;independent(step,lesson.id+'/'+index);
    assert.ok(Number.isInteger(step.line)&&step.line>=1&&step.line<=lines.length,lesson.id+' source line '+step.line);
    assert.ok(lines[step.line-1].trim()&&step.message,lesson.id+' highlighted line has an explanation');
    assert.ok(Array.isArray(step.cells)&&Array.isArray(step.links));
    const cells=new Map(step.cells.map(item=>[item.id,item]));assert.equal(cells.size,step.cells.length,lesson.id+' unique visible cell IDs');
    const from=new Map();
    for(const item of step.cells){
      assert.ok(item.id&&item.label&&item.type&&item.address,lesson.id+' memory cell metadata');
      assert.ok(kinds.has(item.kind)&&statuses.has(item.status),lesson.id+' known cell kind/status');
      assert.ok(Object.hasOwn(item,'value'),lesson.id+' distinguishes stored value from address');
      if(item.status==='freed')assert.match(String(item.value),/释放|不可读/,lesson.id+' released storage is not shown as a readable integer');
      if(item.kind==='boundary'){assert.equal(item.status,'boundary');assert.notEqual(typeof item.value,'number',lesson.id+' one-past is not an extra element');}
    }
    for(const link of step.links){
      const source=cells.get(link.from),target=cells.get(link.to);
      assert.ok(source&&target,lesson.id+' link refers to visible cells');assert.equal(source.kind,'pointer');
      assert.notEqual(source.value,'nullptr',lesson.id+' nullptr has no outgoing arrow');
      assert.notEqual(source.status,'ended',lesson.id+' ended local records have no usable outgoing pointer');
      assert.equal(source.value,target.address,lesson.id+' the stored address identifies the arrow target');
      assert.notEqual(source.address,source.value,lesson.id+' pointer storage and target storage are distinct');
      if(target.status==='freed'||target.status==='ended')assert.equal(source.status,'dangling',lesson.id+' invalid target produces an explicitly dangling relation');
      (from.get(link.from)||from.set(link.from,[]).get(link.from)).push(link.to);
    }
    for(const item of step.cells.filter(item=>item.kind==='pointer')){
      const links=from.get(item.id)||[];
      if(item.value==='nullptr'||item.status==='ended')assert.equal(links.length,0,lesson.id+' empty/ended pointers have no target arrow');
      else assert.equal(links.length,1,lesson.id+' each live or dangling pointer identifies exactly one visible target');
    }
    if(step.blocked){
      blocked++;assert.equal(step.blocked,true);assert.match(lines[step.line-1],/^\s*\/\//,lesson.id+' invalid operation remains a comment');
      assert.ok(index>0);const previous=lesson.steps[index-1];
      assert.deepEqual(plain(step.cells),plain(previous.cells),lesson.id+' blocked operations do not modify memory');
      assert.deepEqual(plain(step.outputs||[]),plain(previous.outputs||[]),lesson.id+' blocked operations do not create successful output');
    }
  }
}
assert.ok(blocked>=8,'Null, bounds, const, lifetime and ownership hazards have explicit stopped frames');

const valueAddress=last(get('value-address'));
assert.equal(cell(valueAddress,'x').address,'A0');assert.equal(cell(valueAddress,'p').address,'P0');assert.equal(cell(valueAddress,'p').value,'A0');
const dereference=last(get('dereference'));
assert.equal(cell(dereference,'x').value,12);assert.equal(cell(dereference,'saved').value,7);assert.equal(cell(dereference,'p').value,'A0');
const aliases=get('aliases'),common=aliases.steps.find(step=>cell(step,'p')?.value==='A0'&&cell(step,'q')?.value==='A0');
assert.ok(common);assert.notEqual(cell(common,'p').address,cell(common,'q').address);
assert.equal(cell(last(aliases),'p').value,'A1');assert.equal(cell(last(aliases),'q').value,'A0');
assert.equal(cell(last(aliases),'x').value,12);assert.equal(cell(last(aliases),'y').value,25);
const nullLesson=get('nullptr');assert.equal(nullLesson.steps[0].links.length,0);assert.equal(cell(last(nullLesson),'x').value,9);

const arrayLesson=get('array-arithmetic'),arrayEnd=last(arrayLesson);
assert.deepEqual(plain(arrayEnd.cells.filter(item=>item.kind==='value').map(item=>item.id)),['a0','a1','a2']);
assert.equal(cell(arrayEnd,'after').kind,'boundary');assert.equal(cell(arrayEnd,'p').value,'E0');assert.equal(cell(arrayEnd,'a1').value,25);
assert.ok(arrayEnd.blocked);assert.ok(arrayEnd.links.some(link=>link.from==='p'&&link.to==='after'));
const parameters=get('pointer-parameters'),write=parameters.steps.find(step=>cell(step,'writeQ')?.status==='live'&&cell(step,'x').value===9);
assert.ok(write);assert.equal(cell(write,'p').value,cell(write,'writeQ').value);assert.notEqual(cell(write,'p').address,cell(write,'writeQ').address);
const reset=parameters.steps.find(step=>cell(step,'resetQ')?.value==='nullptr');
assert.ok(reset);assert.equal(cell(reset,'p').value,'A0');assert.equal(cell(last(parameters),'x').value,9);
assert.equal(cell(last(parameters),'writeQ').status,'ended');assert.equal(cell(last(parameters),'resetQ').status,'ended');
const constLast=last(get('const-pointers'));
assert.equal(cell(constLast,'x').value,4);assert.equal(cell(constLast,'y').value,2);
assert.equal(cell(constLast,'readOnly').value,'A1');assert.equal(cell(constLast,'fixed').value,'A0');assert.equal(cell(constLast,'both').value,'A0');
const rowLesson=get('row-pointers'),rowLast=last(rowLesson);
assert.deepEqual(plain(cell(rowLast,'row0').value),[1,2,3]);assert.deepEqual(plain(cell(rowLast,'row1').value),[4,50,6]);
assert.equal(cell(rowLast,'saved').value,2);assert.equal(cell(rowLast,'row').type,'int (*)[3]');assert.equal(cell(rowLast,'row').value,'R1');
assert.ok(rowLesson.steps.some(step=>cell(step,'row')?.value==='R0'));assert.ok(rowLast.links.some(link=>link.from==='row'&&link.to==='row1'));
const double=last(get('double-pointer'));
assert.equal(cell(double,'pp').value,cell(double,'p').address);assert.equal(cell(double,'p').value,'A1');assert.equal(cell(double,'y').value,9);assert.equal(cell(double,'x').value,5);
assert.ok(double.links.some(link=>link.from==='pp'&&link.to==='p'));
const nodes=last(get('linked-nodes'));
assert.equal(cell(nodes,'p').value,'R1');assert.equal(cell(nodes,'firstNext').value,'R1');assert.equal(cell(nodes,'secondNext').value,'nullptr');assert.equal(cell(nodes,'saved').value,20);
const lifetime=get('dynamic-lifetime'),released=lifetime.steps.find(step=>cell(step,'heap').status==='freed');
assert.ok(released);assert.equal(cell(released,'p').status,'dangling');assert.equal(cell(released,'q').status,'dangling');
const onlyQ=lifetime.steps.find(step=>cell(step,'p').value==='nullptr'&&cell(step,'q').status==='dangling');assert.ok(onlyQ);
assert.equal(cell(last(lifetime),'p').value,'nullptr');assert.equal(cell(last(lifetime),'q').value,'nullptr');
const ownership=get('unique-ownership'),moved=ownership.steps.find(step=>cell(step,'owner')?.value==='nullptr'&&cell(step,'moved')?.value==='H0');
assert.ok(moved);assert.equal(cell(moved,'observer').value,'H0');assert.equal(cell(moved,'heap').status,'live');
const ownershipEnd=last(ownership);assert.equal(cell(ownershipEnd,'heap').status,'freed');
for(const id of ['owner','observer','moved'])assert.equal(cell(ownershipEnd,id).status,'ended');

console.log('Verified 12 pointer lessons in 3 levels, '+frames+' independent frames, '+blocked+' commented and blocked unsafe operations, source lines, memory/address links, quizzes and related files.');
console.log('Verified scalar copies, shared-address aliases, nullptr, one-past boundaries, parameter copies, const restrictions, row-pointer strides, double pointers, linked members, dangling aliases and unique ownership.');
