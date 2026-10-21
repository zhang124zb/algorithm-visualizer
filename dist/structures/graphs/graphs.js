(function(L){
  'use strict';
  for(const id of ['adjacency-matrix','adjacency-list'])L.register(id,(options={})=>{
    const g=options.graph||L.graph(6,false),n=g.nodes.length,matrix=Array.from({length:n},()=>Array(n).fill(0)),adj=Array.from({length:n},()=>[]),isMatrix=id==='adjacency-matrix';
    const code=isMatrix?`vector<vector<int>> build(int n, vector<pair<int,int>> edges) {
init|    vector<vector<int>> matrix(n, vector<int>(n, 0));
loop|    for (auto [u, v] : edges) {
forward|        matrix[u][v] = 1;
back|        matrix[v][u] = 1;
    }
return|    return matrix;
}`:`vector<vector<int>> build(int n, vector<pair<int,int>> edges) {
init|    vector<vector<int>> adj(n);
loop|    for (auto [u, v] : edges) {
forward|        adj[u].push_back(v);
back|        adj[v].push_back(u);
    }
return|    return adj;
}`;const t=new L.Trace(code,{节点:g.nodes.map(x=>x.label),无向边:g.edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,v,{...g,active,table:isMatrix?{kind:'matrix',rows:matrix,rowLabels:g.nodes.map(x=>x.label),colLabels:g.nodes.map(x=>x.label)}:{kind:'buckets',buckets:adj.map(row=>row.map(x=>g.nodes[x].label)),labels:g.nodes.map(x=>x.label)},caption:isMatrix?'矩阵的行列分别对应两个端点':'每行只保存该节点实际连接的邻居'});s('init','为所有节点初始化存储空间。');for(let i=0;;i++){s('loop','读取下一条无向边。',{i});if(i>=g.edges.length)break;const {u,v}=g.edges[i];if(isMatrix)matrix[u][v]=1;else adj[u].push(v);s('forward','记录从 u 到 v 的连接。',{u:g.nodes[u].label,v:g.nodes[v].label},[u,v]);if(isMatrix)matrix[v][u]=1;else adj[v].push(u);s('back','无向图还要记录从 v 到 u 的连接。',{u:g.nodes[u].label,v:g.nodes[v].label},[u,v]);}s('return','图的存储结构建立完成。');return t.done(isMatrix?matrix:adj);
  });
})(AlgoLab);
