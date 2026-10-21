const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),ctx=vm.createContext({console});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
load('assets/js/core.js');load('assets/js/catalog.js');load('extensions/competition/support.js');
const L=ctx.AlgoLab,plain=x=>JSON.parse(JSON.stringify(x));let cases=0,frames=0;
for(const g of L.competitionGroups){load(`${g.section}/${g.id}/${g.id}.js`);load(`${g.section}/${g.id}/code-variants.js`);}
function run(id,options){cases++;return plain(L.builders[id](options));}
function equal(id,options,expected){assert.deepEqual(run(id,options).result,expected,id);}
assert.equal(L.competitionGroups.length,12);assert.equal(L.competitionItems.length,36);assert.equal(new Set(L.allItems.map(x=>x.id)).size,L.allItems.length);
for(const item of L.competitionItems)for(let trial=0;trial<3;trial++){
  const trace=L.builders[item.id]();cases++;assert.ok(trace.steps.length>1,item.id);assert.ok(trace.steps.at(-1).finished,item.id);
  for(const language of ['cpp','python','java']){
    const version=L.getCode(item.id,trace,language);
    for(const label of Object.keys(trace.labels))assert.ok(version.labels[label],item.id+'/'+language+'/'+label);
    for(const step of trace.steps){const line=version.labels[step.label];assert.ok(line>0&&line<=version.code.length);assert.ok(!/^\s*(\/\/|#)/.test(version.code[line-1]));assert.ok(step.message&&step.view);assert.ok(!JSON.stringify(step).includes('null,null,null,null,null,null,null,null,null,null'),item.id);frames++;}
  }
}
for(const x of [0,1,13,127,1024,2147483647])equal('bit-count',{x},x.toString(2).replaceAll('0','').length);
equal('compression',{values:[]},[]);equal('compression',{values:[-5,10,-5,2]},[0,2,0,1]);
equal('prefix-2d',{matrix:[[1,-2,3],[4,5,-6]],x1:0,y1:1,x2:1,y2:2},0);
equal('difference-2d',{n:2,m:3,x1:0,y1:1,x2:1,y2:2,delta:-2},[[0,-2,-2],[0,-2,-2]]);
for(const [a,b]of [['0','0'],['999999999999999999999999999999','1'],['92348729','128478']])equal('big-add',{a,b},String(BigInt(a)+BigInt(b)));
const cuts=(a,k)=>{let best=Infinity;function dfs(i,left,max){if(!left){if(i===a.length)best=Math.min(best,max);return;}let sum=0;for(let j=i;j<=a.length-left;j++){sum+=a[j];dfs(j+1,left-1,Math.max(max,sum));}}for(let n=1;n<=k;n++)dfs(0,n,0);return best;};
for(const a of [[0],[7,2,5,10,8],[0,0,0],[3,3,1]])for(let k=1;k<=a.length;k++)equal('binary-answer',{values:a,k},cuts(a,k));
for(const x of [0,.001,.25,2,100])assert.ok(Math.abs(run('real-binary',{x}).result-Math.sqrt(x))<1e-10);
for(const a of [[],[3],[2,2],[3,1,2,1]])equal('inversions',{values:a},a.reduce((s,x,i)=>s+a.slice(i+1).filter(y=>x>y).length,0));
equal('flood-fill',{matrix:[[1,0],[0,1]],row:0,col:0,color:2},[[2,0],[0,1]]);equal('flood-fill',{matrix:[[1]],row:0,col:0,color:1},[[1]]);
equal('multi-bfs',{n:1,m:5,sources:[[0,0],[0,4],[0,0]]},[[0,1,2,1,0]]);equal('multi-bfs',{n:2,m:2,sources:[]},[[-1,-1],[-1,-1]]);
const graph=(n,edges,directed=false)=>({kind:'graph',nodes:Array.from({length:n},(_,id)=>({id,label:String(id),x:12+id*10,y:50})),edges:edges.map(([u,v,w=1])=>({u,v,w})),directed,weighted:true});
equal('zero-one-bfs',{graph:graph(4,[[0,1,1],[0,2,0],[2,1,0]],true)},[0,0,0,1e9]);
assert.throws(()=>L.builders['zero-one-bfs']({graph:graph(2,[[0,1,2]])}),/0 或 1/);
const tree=graph(5,[[0,1],[0,2],[1,3],[1,4]]);
equal('dfs-order',{graph:tree},[[0,1,3,4,2],[0,1,4,2,3],[5,4,5,3,4]]);
equal('tree-diameter',{graph:tree},3);equal('tree-diameter',{graph:graph(1,[])},0);
for(const [u,v,answer]of [[3,4,1],[3,2,0],[1,4,1],[4,4,4]])equal('binary-lca',{graph:tree,u,v},answer);
equal('heap-dijkstra',{graph:graph(5,[[0,1,10],[0,2,1],[2,1,1],[1,3,1],[2,3,10]],true)},[0,2,1,3,1e9]);
assert.throws(()=>L.builders['heap-dijkstra']({graph:graph(2,[[0,1,-1]])}),/非负/);
equal('bipartite-color',{graph:graph(5,[[0,1],[2,3],[3,4],[4,2]])},false);equal('bipartite-color',{graph:graph(1,[[0,0]])},false);equal('bipartite-color',{graph:graph(2,[])},true);
equal('mono-stack',{values:[2,2,1,3]},[3,3,3,-1]);equal('mono-queue',{values:[1,3,-1,-3,5,3,6,7],k:3},[3,3,5,5,6,7]);
equal('sparse-table',{values:[3,1,2,0,5],left:1,right:3},0);equal('sparse-table',{values:[7],left:0,right:0},7);
equal('max-subarray',{values:[-5,-2,-7]},-2);equal('max-subarray',{values:[-2,1,-3,4,-1,2,1,-5,4]},6);
equal('edit-distance',{a:'kitten',b:'sitting'},3);equal('edit-distance',{a:'',b:'abc'},3);
equal('complete-pack',{weights:[2,3],values:[3,4],capacity:6},9);equal('group-pack',{groups:[[[2,4],[3,5]]],capacity:5},5);
for(const text of ['', 'AAAAA','ABABA','ABAC','ABBA','CBBD','ABCBAABC']){
  equal('z-function',{text},[...text].map((_,i)=>{if(!i)return 0;let k=0;while(i+k<text.length&&text[k]===text[i+k])k++;return k;}));
  let longest=0;for(let i=0;i<text.length;i++)for(let j=i+1;j<=text.length;j++){const s=text.slice(i,j);if([...s].reverse().join('')===s)longest=Math.max(longest,s.length);}equal('manacher',{text},longest);
}
equal('factorization',{n:1},[]);equal('factorization',{n:360},[2,2,2,3,3,5]);equal('factorization',{n:97},[97]);
for(const [a,b]of [[30,18],[0,7],[7,0],[0,0]]){const [g,x,y]=run('extended-gcd',{a,b}).result;assert.equal(a*x+b*y,g);let p=a,q=b;while(q)[p,q]=[q,p%q];assert.equal(g,p);}
for(const n of [0,1,2,10,50])equal('linear-sieve',{n},Array.from({length:Math.max(0,n-1)},(_,i)=>i+2).filter(x=>{for(let p=2;p*p<=x;p++)if(x%p===0)return false;return true;}));
equal('pascal',{n:0,k:0},1);equal('pascal',{n:5,k:2},10);
for(const [point,answer]of [[[1,1],2],[[1,-1],-2],[[1,0],0]])equal('cross-product',{points:[[0,0],[2,0],point]},answer);
for(const [points,answer]of [[[[0,0],[2,0],[1,0],[3,0]],true],[[[0,0],[2,0],[3,0],[4,0]],false],[[[0,0],[2,2],[0,2],[2,0]],true],[[[0,0],[0,0],[0,0],[2,0]],true],[[[0,0],[1,1],[1,1],[2,0]],true]])equal('segment-intersection',{points},answer);
equal('convex-hull',{points:[[0,0],[2,0],[2,2],[0,2],[1,1],[1,0],[0,0]]},[[0,0],[2,0],[2,2],[0,2]]);equal('convex-hull',{points:[[0,0],[1,0],[2,0]]},[[0,0],[2,0]]);equal('convex-hull',{points:[]},[]);
for(let n=0;n<=20;n++)equal('win-lose',{n},n%4!==0);
for(const piles of [[1,2,3],[1,1,1],[0,0],[7,3,5]]){const result=run('nim',{values:piles}).result,x=piles.reduce((s,x)=>s^x,0);if(!x)assert.deepEqual(result,[-1,-1]);else{const [i,target]=result;assert.ok(target>=0&&target<piles[i]);const after=piles.slice();after[i]=target;assert.equal(after.reduce((s,x)=>s^x,0),0);}}
equal('offline-threshold',{values:[3,1,3,2],queries:[[0,3,2],[1,2,3],[0,2,1]]},[2,2,1]);equal('mo-distinct',{values:[1,2,1,3,2],queries:[[0,4],[1,3],[2,2]]},[3,3,1]);
for(let trial=0;trial<30;trial++){
  const a=Array.from({length:7},()=>Math.floor(Math.random()*9)-3),queries=Array.from({length:5},()=>{const l=Math.floor(Math.random()*7);return [l,l+Math.floor(Math.random()*(7-l)),Math.floor(Math.random()*10)-4];});
  equal('mono-stack',{values:a},a.map((x,i)=>{const j=a.findIndex((y,j)=>j>i&&y>x);return j;}));
  equal('mono-queue',{values:a,k:3},a.slice(2).map((_,i)=>Math.max(...a.slice(i,i+3))));
  equal('offline-threshold',{values:a,queries},queries.map(([l,r,k])=>a.slice(l,r+1).filter(x=>x<=k).length));
  equal('mo-distinct',{values:a,queries:queries.map(q=>q.slice(0,2))},queries.map(([l,r])=>new Set(a.slice(l,r+1)).size));
  const trace=run('mo-distinct',{values:a,queries:queries.map(q=>q.slice(0,2))});
  for(const step of trace.steps)if(step.label==='answer'){
    assert.equal(Object.values(step.vars.frequency).reduce((s,n)=>s+n,0),step.vars.right-step.vars.left+1);
    assert.equal(Object.values(step.vars.frequency).filter(n=>n>0).length,step.vars.distinct);
  }
}
console.log(`Verified 36 competition demos, ${cases} algorithm cases, ${frames} three-language frame mappings and Mo window invariants.`);
