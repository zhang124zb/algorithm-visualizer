// Each fixture invokes the displayed code, including empty/base and unsuccessful cases.
module.exports=({A,G})=>{
  const cases=[];
  const add=(id,fn,py,options,args)=>cases.push([id,options,fn,py,args]);
  for(const a of [[],[0],[3,-2,3,9,0,4,5,6,7]])
    add('dynamic-array','dynamicArray','dynamic_array',{a},[A(a)]);
  for(const [id,fn,py] of [['ordered-set','orderedSet','ordered_set'],['hash-set','hashSet','hash_set'],['ordered-map','orderedMap','ordered_map'],['hash-map','hashMap','hash_map']])
    for(const [a,query,eraseValue] of [[[3,-2,3,0],3,3],[[],1,2],[[4,4,4],99,99]])
      add(id,fn,py,{a,query,eraseValue},[A(a),query,eraseValue]);
  for(const [n,edges] of [[1,[]],[6,[[0,1],[2,3],[3,4],[0,4],[1,1],[0,3]]]])
    add('dsu-size','dsuSize','dsu_size',{n,edges},[n,A(edges,'matrix')]);
  for(const [a,target] of [[[3,1,3,2],6],[[],4],[[1,2,4],9]])
    add('enumeration','enumeratePair','enumerate_pair',{a,target},[A(a),target]);
  for(const [a,quantum] of [[[1,3,2],2],[[],2],[[4],3]])
    add('simulation','roundRobin','round_robin',{a,quantum},[A(a),quantum]);
  for(const n of [0,1,7])add('recursion','factorial','factorial',{n},[n]);
  for(const a of [[5],[-4,-1,-8],[4,9,2,9,3]])
    add('divide-conquer','divideMax','divide_max',{a},[A(a)]);
  for(const [a,target] of [[[3,1,8,4],7],[[2,4],3],[[],0],[[],1]])
    add('pruning','subsetSum','subset_sum',{a,target},[A(a),target]);
  for(const n of [0,1,9])add('memo-search','memoFib','memo_fib',{n},[n]);
  for(const grid of [[[0]],[[1]],[[0,0,0],[0,1,0],[0,0,0]]])
    add('grid-paths','gridPaths','grid_paths',{grid},[A(grid,'matrix')]);
  for(const grid of [[[0]],[[3],[2],[0]],[[1,9,1],[1,1,1]]])
    add('grid-min-path','gridMinPath','grid_min_path',{grid},[A(grid,'matrix')]);
  for(const [n,edges] of [[1,[]],[6,[[0,2],[1,3],[2,4]]],[3,[[0,1],[1,2],[2,0]]]]){
    const graph={kind:'graph',nodes:Array.from({length:n},(_,id)=>({id,label:String(id),x:10+id*12,y:50})),edges:edges.map(([u,v])=>({u,v,w:1})),directed:false,weighted:false};
    const adj=Array.from({length:n},()=>[]);for(const [u,v] of edges){adj[u].push(v);adj[v].push(u);}
    add('components','connectedComponents','connected_components',{graph},[A(adj,'matrix')]);
  }
  for(const text of ['', 'zabaz','abcdefghijklmnopqrstuvwxyz'])
    add('string-count','stringCount','string_count',{text},[text]);
  for(const [a,b] of [['',''],['','a'],['a',''],['abc','abcd'],['abz','ac']])
    add('string-compare','stringCompare','string_compare',{a,b},[a,b]);
  for(const [a,b] of [[0,0],[0,7],[7,0],[6,8],[7,13]])
    add('lcm','leastCommonMultiple','least_common_multiple',{a,b},[a,b]);
  for(const [a,b,modulus] of [[-7,11,13],[-9,-4,7],[23,24,1],[0,0,7]])
    add('mod-arithmetic','modArithmetic','mod_arithmetic',{a,b,modulus},[a,b,modulus]);
  return cases;
};
