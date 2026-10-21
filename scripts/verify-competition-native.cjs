// Compile and run the displayed snippets; compiler tools remain development-only.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({console}),out=path.join(root,'artifacts/competition-native');fs.mkdirSync(out,{recursive:true});
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,'dist',f),'utf8'),ctx);
load('assets/js/core.js');load('assets/js/catalog.js');load('extensions/competition/support.js');const L=ctx.AlgoLab;
for(const g of L.allGroups){load(`${g.section}/${g.id}/${g.id}.js`);load(`${g.section}/${g.id}/code-variants.js`);}
const n=5,edges=[[0,1,1],[0,2,1],[1,3,1],[1,4,1]],g={kind:'graph',nodes:Array.from({length:n},(_,id)=>({id,x:10+id*10,y:50,label:String(id)})),edges:edges.map(([u,v,w])=>({u,v,w})),directed:false,weighted:true};
const a=[3,1,3,2],matrix=[[1,-2,3],[4,5,-6]],points=[[0,0],[2,0],[2,2],[0,2],[1,1]],queries=[[0,3,2],[1,2,3],[0,2,1]];
const A=(value,type='array')=>({value,type}),G=(value=g,weighted=false)=>({value,type:weighted?'weighted':'graph'});
const cases=[
['bit-count',{x:13},'bitCount','bit_count',[13]],
['compression',{values:a},'compress','compress',[A(a)]],
['prefix-2d',{matrix,x1:0,y1:1,x2:1,y2:2},'prefix2d','prefix2d',[A(matrix,'matrix'),0,1,1,2]],
['difference-2d',{n:2,m:3,x1:0,y1:1,x2:1,y2:2,delta:-2},'rectangleAdd','rectangle_add',[2,3,0,1,1,2,-2]],
['big-add',{a:'99999999999999999999',b:'1'},'bigAdd','big_add',['99999999999999999999','1']],
['binary-answer',{values:[7,2,5,10,8],k:2},'splitLimit','split_limit',[A([7,2,5,10,8]),2]],
['real-binary',{x:.25},'root','root',[.25]],
['inversions',{values:a},'inversions','inversions',[A(a),0,a.length]],
['flood-fill',{matrix:[[1,0],[0,1]],row:0,col:0,color:2},'fillRegion','fill_region',[A([[1,0],[0,1]],'matrix'),0,0,2]],
['multi-bfs',{n:1,m:5,sources:[[0,0],[0,4]]},'multiBfs','multi_bfs',[1,5,A([[0,0],[0,4]],'matrix')]],
['zero-one-bfs',{graph:g},'zeroOne','zero_one',[G(g,true),0]],
['mono-stack',{values:a},'nextGreater','next_greater',[A(a)]],
['mono-queue',{values:a,k:2},'windowMax','window_max',[A(a),2]],
['sparse-table',{values:a,left:1,right:3},'rangeMin','range_min',[A(a),1,3]],
['max-subarray',{values:[-5,-2,-7]},'maxSubarray','max_subarray',[A([-5,-2,-7])]],
['edit-distance',{a:'kitten',b:'sitting'},'editDistance','edit_distance',['kitten','sitting']],
['complete-pack',{weights:[2,3],values:[3,4],capacity:6},'completePack','complete_pack',[A([2,3]),A([3,4]),6]],
['group-pack',{groups:[[[2,4],[3,5]]],capacity:5},'groupPack','group_pack',[A([[[2,4],[3,5]]],'cube'),5]],
['heap-dijkstra',{graph:g},'heapDijkstra','heap_dijkstra',[G(g,true),0]],
['bipartite-color',{graph:g},'bipartite','bipartite',[G()]],
['dfs-order',{graph:g},'dfsOrder','dfs_order',[G()]],
['tree-diameter',{graph:g},'treeDiameter','tree_diameter',[G()]],
['binary-lca',{graph:g,u:3,v:4},'lca','lca',[G(),3,4]],
['z-function',{text:'AAAAA'},'zFunction','z_function',['AAAAA']],
['manacher',{text:'ABBA'},'longestPalindrome','longest_palindrome',['ABBA']],
['factorization',{n:360},'factor','factor',[360]],
['extended-gcd',{a:30,b:18},'exgcd','exgcd',[30,18]],
['linear-sieve',{n:30},'linearSieve','linear_sieve',[30]],
['pascal',{n:5,k:2},'choose','choose',[5,2]],
['cross-product',{points:points.slice(0,3)},'orientation','orientation',points.slice(0,3).map(p=>A(p,'point'))],
['segment-intersection',{points:points.slice(0,4)},'intersects','intersects',points.slice(0,4).map(p=>A(p,'point'))],
['convex-hull',{points},'hull','hull',[A(points,'points')]],
['win-lose',{n:8},'winning','winning',[8]],
['nim',{values:[1,1,1]},'nimMove','nim_move',[A([1,1,1])]],
['offline-threshold',{values:a,queries},'offlineCount','offline_count',[A(a),A(queries,'matrix')]],
['mo-distinct',{values:a,queries:queries.map(q=>q.slice(0,2))},'moDistinct','mo_distinct',[A(a),A(queries.map(q=>q.slice(0,2)),'matrix')]]
];
cases.push(...require('./foundation-native-cases.cjs')({A,G}));
assert.deepEqual(new Set(cases.map(x=>x[0])),new Set([...L.competitionItems.map(x=>x.id),...L.foundationIds]));
const literal=x=>Array.isArray(x)?'{'+x.map(literal).join(',')+'}':JSON.stringify(x);
function argument(arg,language){
  if(!arg||typeof arg!=='object')return JSON.stringify(arg);
  let {value,type}=arg;
  if(['graph','weighted'].includes(type)){
    if(language==='python'){const adj=value.nodes.map(()=>[]);for(const {u,v,w}of value.edges){adj[u].push(type==='weighted'?[v,w]:v);if(!value.directed)adj[v].push(type==='weighted'?[u,w]:u);}return JSON.stringify(adj);}
    const edges=value.edges.map(e=>[e.u,e.v,e.w]);return `${type==='weighted'?'weightedGraph':'plainGraph'}(${value.nodes.length},${language==='java'?'new int[][]':''}${literal(edges)},${value.directed?'true':'false'})`;
  }
  if(language==='python')return JSON.stringify(value);
  if(language==='cpp')return literal(value);
  const types={array:'int[]',matrix:'int[][]',cube:'int[][][]',point:'long[]',points:'long[][]'};return 'new '+types[type]+literal(value);
}
const name=id=>'Case_'+id.replaceAll('-','_'),expected=cases.map(([id,options])=>JSON.parse(JSON.stringify(L.builders[id](options).result)));
let cpp=`#include <bits/stdc++.h>
using namespace std;
void emit(const string& x){cout<<quoted(x);} void emit(bool x){cout<<(x?"true":"false");}
template<class T,enable_if_t<is_arithmetic_v<T>,int> =0> void emit(T x){cout<<setprecision(17)<<x;}
template<class T,size_t N> void emit(const array<T,N>& x){cout<<"[";for(size_t i=0;i<N;i++){if(i)cout<<",";emit(x[i]);}cout<<"]";}
template<class T> void emit(const vector<T>& x){cout<<"[";for(size_t i=0;i<x.size();i++){if(i)cout<<",";emit(x[i]);}cout<<"]";}
vector<vector<int>> plainGraph(int n,vector<array<int,3>> edges,bool directed){vector<vector<int>> g(n);for(auto [u,v,w]:edges){g[u].push_back(v);if(!directed)g[v].push_back(u);}return g;}
vector<vector<pair<int,int>>> weightedGraph(int n,vector<array<int,3>> edges,bool directed){vector<vector<pair<int,int>>> g(n);for(auto [u,v,w]:edges){g[u].push_back({v,w});if(!directed)g[v].push_back({u,w});}return g;}
`;
let java=`import java.util.*;
public class CompetitionNative {
static String json(Object x){if(x==null)return "null";if(x instanceof String)return "\\\""+x+"\\\"";if(x.getClass().isArray()){List<String> a=new ArrayList<>();for(int i=0;i<java.lang.reflect.Array.getLength(x);i++)a.add(json(java.lang.reflect.Array.get(x,i)));return "["+String.join(",",a)+"]";}if(x instanceof Collection){List<String>a=new ArrayList<>();for(Object v:(Collection<?>)x)a.add(json(v));return "["+String.join(",",a)+"]";}return x.toString();}
static List<List<Integer>> plainGraph(int n,int[][] edges,boolean directed){List<List<Integer>> g=new ArrayList<>();for(int i=0;i<n;i++)g.add(new ArrayList<>());for(int[] e:edges){g.get(e[0]).add(e[1]);if(!directed)g.get(e[1]).add(e[0]);}return g;}
static List<List<int[]>> weightedGraph(int n,int[][] edges,boolean directed){List<List<int[]>> g=new ArrayList<>();for(int i=0;i<n;i++)g.add(new ArrayList<>());for(int[] e:edges){g.get(e[0]).add(new int[]{e[1],e[2]});if(!directed)g.get(e[1]).add(new int[]{e[0],e[2]});}return g;}
`;
const py=['import json'];
for(const [id] of new Map(cases.map(c=>[c[0],c]))){
  const trace=L.builders[id]();cpp+=`namespace ${name(id)} {\n${trace.code.join('\n')}\n}\n`;java+=`static class ${name(id)} {\n${L.getCode(id,trace,'java').code.join('\n')}\n}\n`;
}
for(const [id,,,pyName,args]of cases){
  const trace=L.builders[id]();
  py.push(`scope={}\nexec(${JSON.stringify(L.getCode(id,trace,'python').code.join('\n'))},scope)\nprint(json.dumps(scope[${JSON.stringify(pyName)}](${args.map(a=>argument(a,'python')).join(',')})))`);
}
cpp+='int main(){\n';java+='public static void main(String[] args){\n';
for(const [id,,fn,,args]of cases){
  // Inversions takes a mutable reference, so keep its input in a named local.
  if(id==='inversions')cpp+=`{vector<int> input=${literal(a)};emit(${name(id)}::${fn}(input,0,input.size()));cout<<"\\n";}\n`;
  else cpp+=`emit(${name(id)}::${fn}(${args.map(a=>argument(a,'cpp')).join(',')}));cout<<"\\n";\n`;
  java+=`System.out.println(json(${name(id)}.${fn}(${args.map(a=>argument(a,'java')).join(',')})));\n`;
}
cpp+='}\n';java+='}\n}\n';
fs.writeFileSync(path.join(out,'main.cpp'),cpp);fs.writeFileSync(path.join(out,'CompetitionNative.java'),java);fs.writeFileSync(path.join(out,'main.py'),py.join('\n'));
function exec(cmd,args){const r=spawnSync(cmd,args,{cwd:out,encoding:'utf8',timeout:90000,maxBuffer:8e6});assert.ifError(r.error);assert.equal(r.status,0,r.stderr);return r.stdout.trim().split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s));}
function verify(actual,language){assert.equal(actual.length,cases.length);actual.forEach((value,i)=>{if(cases[i][0]==='real-binary')assert.ok(Math.abs(value-expected[i])<1e-10);else assert.deepEqual(value,expected[i],language+'/'+cases[i][0]);});}
const compile=(cmd,args)=>{const r=spawnSync(cmd,args,{cwd:out,encoding:'utf8',timeout:90000,maxBuffer:8e6});assert.ifError(r.error);assert.equal(r.status,0,r.stderr);};
compile(process.env.ALGOLAB_CXX||'g++',['-std=c++17','-O0','main.cpp','-o','competition-native.exe']);verify(exec(path.join(out,'competition-native.exe'),[]),'C++');
verify(exec(process.env.ALGOLAB_PYTHON||'python',['-I','main.py']),'Python');
compile(process.env.ALGOLAB_JAVAC||'javac',['--release','8','CompetitionNative.java']);verify(exec(process.env.ALGOLAB_JAVA||'java',['-cp','.', 'CompetitionNative']),'Java');
console.log(`Verified ${new Set(cases.map(x=>x[0])).size*3} competition/foundation snippets and ${cases.length*3} cases with native C++ / Python / Java.`);
