const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..', 'dist');
const context = vm.createContext({ console });
const load = file => vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
load('assets/js/core.js');
load('assets/js/catalog.js');
const L = context.AlgoLab;
for (const group of L.groups) {
  load(`${group.section}/${group.id}/${group.id}.js`);
  load(`${group.section}/${group.id}/code-variants.js`);
}
const plain = value => JSON.parse(JSON.stringify(value));
let cases = 0;
for (const item of L.items) {
  assert.equal(typeof L.builders[item.id], 'function', `Missing ${item.id}`);
  for (let trial = 0; trial < 3; trial++) {
    const trace = L.builders[item.id]();
    assert.ok(trace.steps.length > 1, item.id);
    assert.ok(trace.steps.at(-1).finished, item.id);
    for (const step of trace.steps) {
      assert.ok(step.line >= 1 && step.line <= trace.code.length, `${item.id} line ${step.line}`);
      assert.ok(step.message && step.view && step.vars, item.id);
      assert.ok(!/^[A-Za-z]\w*\|/.test(trace.code[step.line-1]), item.id);
    }
    cases++;
  }
}
const run=(id,options)=>{cases++;return L.builders[id](options);};
for(const id of L.items.filter(x=>x.group==='sorting').map(x=>x.id))for(const values of [[],[4],[7,7,7],[8,1,8,2,0],[9,8,7,6,5],[1,2,3,4,5]]){
  assert.deepEqual(plain(run(id,{values}).result),values.slice().sort((a,b)=>a-b),id);
}
for(const values of [[],[3],[1,2,2,2,4],[1,2,3,4,5]])for(const target of [0,2,3,5,9]){
  const lower=values.findIndex(x=>x>=target),upper=values.findIndex(x=>x>target);
  assert.equal(run('lower-bound',{values,target}).result,lower===-1?values.length:lower);
  assert.equal(run('upper-bound',{values,target}).result,upper===-1?values.length:upper);
  const found=run('binary-search',{values,target}).result;
  assert.equal(found<0?!values.includes(target):values[found]===target,true);
  assert.equal(run('linear-search',{values,target}).result,values.indexOf(target));
}
for(const id of ['naive-match','kmp','rolling-hash'])for(const [text,pattern]of [['ABABABAC','ABAC'],['AAAAA','AAA'],['ABC','Z'],['',''],['A','AB'],['ABC','']])assert.equal(run(id,{text,pattern}).result,text.indexOf(pattern),id);
assert.equal(run('gcd',{a:84,b:30}).result,6);
assert.equal(run('gcd',{a:7,b:0}).result,7);
assert.equal(run('fast-power',{a:3,n:13,mod:97}).result,Number(3n**13n%97n));
assert.equal(run('knapsack',{weights:[2,3,4],values:[4,5,7],capacity:6}).result,11);
assert.equal(run('lis',{values:[3,1,2,2,5]}).result,3);
assert.equal(run('lcs',{a:'ABCBDAB',b:'BDCABA'}).result,4);
assert.equal(run('interval-dp',{values:[1,2,3,4]}).result,19);
assert.equal(run('n-queens',{n:4}).result.length,2);
assert.equal(run('n-queens',{n:5}).result.length,10);
assert.equal(run('permutations',{values:[1,2,3]}).result.length,6);
for(const order of [['preorder',[1,2,4,5,3,6,7]],['inorder',[4,2,5,1,6,3,7]],['postorder',[4,5,2,6,7,3,1]],['level-order',[1,2,3,4,5,6,7]]])assert.deepEqual(plain(run(order[0],{values:[1,2,3,4,5,6,7]}).result),order[1]);
for(const id of ['max-heap','min-heap'])for(let trial=0;trial<10;trial++){
  const result=run(id).result;
  for(let i=1;i<result.length;i++)assert.ok(id==='max-heap'?result[Math.floor((i-1)/2)]>=result[i]:result[Math.floor((i-1)/2)]<=result[i]);
}
for(const values of [[30,20,10],[10,20,30],[30,10,20],[10,30,20],[7,3,9,1,5,8,10,2,4,6]]){
  const result=run('avl',{values}).result;
  const ordered=[];
  function walk(node){if(!node)return 0;const lh=walk(node.left);ordered.push(node.value);const rh=walk(node.right);assert.ok(Math.abs(lh-rh)<=1);assert.equal(node.height,1+Math.max(lh,rh));return node.height;}
  walk(result);assert.deepEqual(ordered,values.slice().sort((a,b)=>a-b));
}
assert.equal(run('fenwick',{values:[1,2,3,4,5],index:3,delta:4,query:4}).result,14);
assert.equal(run('segment-tree',{values:[1,2,3,4,5,6],index:2,value:10,left:1,right:4}).result,21);
assert.equal(run('interval-cover',{intervals:[[0,2],[3,5]],target:5}).result,-1);
const graph=(n,edges,directed=false)=>({kind:'graph',nodes:Array.from({length:n},(_,id)=>({id,label:String(id),x:15+id*20,y:50})),edges:edges.map(([u,v,w=1])=>({u,v,w})),directed,weighted:true});
const connected=graph(4,[[0,1,3],[0,2,1],[2,1,1],[1,3,2],[2,3,6]]);
assert.deepEqual(plain(run('dijkstra',{graph:connected}).result),[0,2,1,4]);
assert.equal(run('prim',{graph:connected}).result,4);
assert.equal(run('kruskal',{graph:connected}).result,4);
const disconnected=graph(3,[[0,1,2]]);
assert.deepEqual(plain(run('dijkstra',{graph:disconnected}).result),[0,2,'∞']);
assert.equal(run('prim',{graph:disconnected}).result,-1);
assert.equal(run('kruskal',{graph:disconnected}).result,-1);
assert.equal(run('topological-sort',{graph:graph(3,[[0,1],[1,2],[2,0]],true)}).result.hasCycle,true);
assert.equal(run('bellman-ford',{graph:graph(3,[[0,1,1],[1,2,-2],[2,1,-2]],true)}).result.negativeCycle,true);
assert.deepEqual(plain(run('bellman-ford',{graph:graph(3,[[0,1,2],[1,2,-1]],true)}).result.dist),[0,2,1]);
assert.deepEqual(plain(run('floyd',{graph:connected}).result)[0],[0,2,1,4]);
assert.throws(()=>L.builders.dijkstra({graph:graph(2,[[0,1,-1]])}),/非负/);
assert.deepEqual(plain(run('maze',{grid:[[0,1],[1,0]]}).result),[]);
console.log(`Verified ${L.items.length} demonstrations, ${cases} algorithm cases, code-line bounds, and graph/DP/tree edge cases.`);
