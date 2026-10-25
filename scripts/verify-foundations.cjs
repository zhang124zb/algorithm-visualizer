const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),ctx=vm.createContext({console});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
load('assets/js/core.js');load('assets/js/catalog.js');
const L=ctx.AlgoLab,plain=x=>JSON.parse(JSON.stringify(x));
for(const g of L.groups){load(`${g.section}/${g.id}/${g.id}.js`);load(`${g.section}/${g.id}/code-variants.js`);}
let cases=0,frames=0;
function run(id,options){
  const t=L.builders[id](options);cases++;
  assert.ok(t.steps.at(-1).finished,id);
  for(const language of ['cpp','python','java']){
    const code=L.getCode(id,t,language);
    for(const label of Object.keys(t.labels))assert.ok(code.labels[label],`${id}/${language}/${label}`);
    for(const step of t.steps){
      const source=code.code[code.labels[step.label]-1];
      assert.ok(source?.trim()&&!/^\s*(#|\/\/)/.test(source),`${id}/${language}: executable line`);
      assert.ok(step.view&&step.vars&&step.message,id);
      frames++;
    }
  }
  return plain(t.result);
}
assert.equal(new Set(L.foundationIds).size,19);
assert.equal(L.allItems.length,120);
assert.equal(new Set(L.allItems.map(x=>x.id)).size,L.allItems.length);
assert.equal(L.groups.filter(g=>g.section==='structures').length,8);
assert.equal(L.groups.filter(g=>g.section==='algorithms').length,11);
assert.equal(L.catalogGroups.filter(g=>g.section==='structures').length,9);
assert.equal(L.guideGroups[0].id,'stl');assert.equal(L.guideGroups[0].guide,true);
assert.ok(L.guideGroups[0].entries.every(item=>item===L.item(item.id)),'STL guide reuses existing demonstration metadata');
assert.ok(L.searchItems.some(item=>item.path==='structures/stl/index.html'),'STL guide must be searchable');
assert.equal(L.categoryFor('disjoint-set').id,'sets');
assert.equal(L.item('disjoint-set').groupTitle,'并查集');
assert.equal(L.item('disjoint-set').path,'structures/advanced/disjoint-set.html');
for(const g of L.groups){
  assert.equal(new Set(g.entries.map(x=>x.id)).size,g.entries.length);
  for(const item of g.entries)assert.equal(item,L.item(item.id));
}
for(const id of L.foundationIds){assert.ok(L.item(id).level,id);assert.ok(L.prerequisites(id).every(Boolean),id);run(id);}
for(const a of [[],[0],[4,4,4],[-3,0,4,-3],Array.from({length:9},(_,i)=>i)]){
  assert.deepEqual(run('dynamic-array',{a}),a);
  for(const eraseValue of [0,4,99]){
    for(const id of ['ordered-set','hash-set'])assert.deepEqual(run(id,{a,query:4,eraseValue}),[...new Set(a)].filter(x=>x!==eraseValue).sort((x,y)=>x-y),id);
    const counts=new Map();for(const x of a)counts.set(x,(counts.get(x)||0)+1);counts.delete(eraseValue);
    for(const id of ['ordered-map','hash-map'])assert.deepEqual(run(id,{a,query:4,eraseValue}),[...counts].sort((x,y)=>x[0]-y[0]),id);
  }
}
for(const [n,edges] of [[1,[]],[5,[]],[5,[[0,1],[2,3],[1,3],[0,0],[0,2]]],[6,[[1,2],[2,3],[4,5]]]]){
  const roots=run('dsu-size',{n,edges}),reach=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j));
  for(const [a,b] of edges)reach[a][b]=reach[b][a]=true;
  for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)reach[i][j]||=reach[i][k]&&reach[k][j];
  assert.equal(roots.length,n);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++)assert.equal(roots[i]===roots[j],reach[i][j],'DSU partition');
}
for(const a of [[],[3],[3,3],[1,-1,2,0],[5,1,8,2]])for(const target of [-2,0,6,10]){
  let expected=[-1,-1];
  outer:for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]+a[j]===target){expected=[i,j];break outer;}
  assert.deepEqual(run('enumeration',{a,target}),expected);
}
for(const [a,quantum,expected] of [[[],2,[]],[[3],2,[0]],[[1,3,2],2,[0,2,1]],[[4,4,4],2,[0,1,2]],[[3,1,2],9,[0,1,2]]])assert.deepEqual(run('simulation',{a,quantum}),expected);
for(let n=0,factorial=1;n<=7;n++){if(n)factorial*=n;assert.equal(run('recursion',{n}),factorial);}
for(const a of [[3],[-9,-2,-4],[4,4,4],[0,10,-1,8,3]])assert.equal(run('divide-conquer',{a}),Math.max(...a));
for(const a of [[],[0,0],[1,3,5],[2,2,2],[3,1,8,4]])for(const target of [0,1,4,7,16,30]){
  const sums=new Set([0]);for(const x of a)for(const sum of [...sums])sums.add(sum+x);
  assert.equal(run('pruning',{a,target}),sums.has(target));
}
for(let n=0,prev=0,current=1;n<=10;n++){assert.equal(run('memo-search',{n}),prev);[prev,current]=[current,prev+current];}
function pathValues(grid,r=0,c=0){
  if(r===grid.length-1&&c===grid[0].length-1)return [grid[r][c]];
  const tails=[...(r+1<grid.length?pathValues(grid,r+1,c):[]),...(c+1<grid[0].length?pathValues(grid,r,c+1):[])];
  return tails.map(sum=>sum+grid[r][c]);
}
function pathCount(grid,r=0,c=0){
  if(r>=grid.length||c>=grid[0].length||grid[r][c])return 0;
  return r===grid.length-1&&c===grid[0].length-1?1:pathCount(grid,r+1,c)+pathCount(grid,r,c+1);
}
for(const grid of [[[0]],[[1]],[[0,0,0]],[[0],[1],[0]],[[0,1],[1,0]],[[0,0,0],[0,1,0],[0,0,0]]])assert.equal(run('grid-paths',{grid}),pathCount(grid));
for(const grid of [[[0]],[[3]],[[1,2,3]],[[3],[2],[0]],[[1,9,1],[1,1,1]],[[9,0,3],[1,2,0],[0,1,0]]])assert.equal(run('grid-min-path',{grid}),Math.min(...pathValues(grid)));
const graph=(n,edges)=>({kind:'graph',nodes:Array.from({length:n},(_,id)=>({id,label:String(id),x:15+id*12,y:50})),edges:edges.map(([u,v])=>({u,v,w:1})),directed:false,weighted:false});
for(const [n,edges,labels] of [[1,[],[0]],[4,[],[0,1,2,3]],[6,[[0,2],[1,3],[2,4]],[0,1,0,1,0,2]],[3,[[0,1],[1,2],[2,0]],[0,0,0]]])assert.deepEqual(run('components',{graph:graph(n,edges)}),labels);
for(const text of ['', 'aaaa','zabaz','abcdefghijklmnopqrstuvwxyz']){
  const expected=Array.from({length:26},(_,i)=>[...text].filter(c=>c.charCodeAt(0)===97+i).length);
  assert.deepEqual(run('string-count',{text}),expected);
}
for(const [a,b] of [['',''],['','a'],['a',''],['abc','abc'],['abc','abcd'],['abz','ac'],['z','abc']])assert.equal(run('string-compare',{a,b}),a===b?0:a<b?-1:1);
for(const [a,b,expected] of [[0,0,0],[0,7,0],[7,0,0],[6,8,24],[1,13,13],[12,12,12],[7,13,91]])assert.equal(run('lcm',{a,b}),expected);
for(const a of [-99,-7,0,3,31])for(const b of [-11,0,23])for(const modulus of [1,7,13]){
  const norm=x=>Number((x%BigInt(modulus)+BigInt(modulus))%BigInt(modulus));
  assert.deepEqual(run('mod-arithmetic',{a,b,modulus}),[norm(BigInt(a)+BigInt(b)),norm(BigInt(a)-BigInt(b)),norm(BigInt(a)*BigInt(b))]);
}
console.log(`Verified 19 foundation lessons, ${cases} cases, ${frames} language-frame mappings, category aliases and preserved links.`);
