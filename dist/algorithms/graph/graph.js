(function(L){
  'use strict';
  const name=(g,i)=>i<0?'—':g.nodes[i].label;
  function draw(g,dist,visited,active=[],chosen=[]){return {...g,nodes:g.nodes.map((n,i)=>({...n,badge:dist?dist[i]:undefined})),active,visited:visited?visited.flatMap((x,i)=>x?[i]:[]):[],chosen};}
  L.register('dijkstra',(options={})=>{
    const g=options.graph||L.graph(6,false,true),n=g.nodes.length,adj=L.adjacency(g),start=options.start??0,dist=Array(n).fill(Infinity),seen=Array(n).fill(false);
    if(g.edges.some(e=>e.w<0))throw new Error('Dijkstra 需要非负边权。');
    const t=new L.Trace(`vector<int> dijkstra(vector<vector<pair<int,int>>> adj, int start) {
size|    int n = adj.size();
infinity|    const int INF = 1000000000;
init|    vector<int> dist(n, INF);
seen|    vector<bool> seen(n, false);
start|    dist[start] = 0;
outer|    for (int round = 0; round < n; ++round) {
candidate|        int u = -1;
scan|        for (int v = 0; v < n; ++v) {
choose|            if (!seen[v] && (u == -1 || dist[v] < dist[u])) u = v;
        }
stop|        if (u == -1 || dist[u] == INF) break;
mark|        seen[u] = true;
edges|        for (auto [v, weight] : adj[u]) {
relax|            if (dist[u] + weight < dist[v]) {
update|                dist[v] = dist[u] + weight;
            }
        }
    }
return|    return dist;
}`,{起点:name(g,start),边:g.edges},g);
    const s=(l,m,v={},active=[])=>t.step(l,m,{dist,...v},draw(g,dist,seen,active));s('size','确定图的节点数。',{n});s('infinity','使用 INF 表示不可达，画面显示为 ∞。');s('init','所有节点距离初始为 ∞。');s('seen','所有节点都尚未确定最短距离。');dist[start]=0;s('start','起点到自身距离为零。',{},[start]);for(let round=0;;round++){s('outer','每轮最多确定一个节点的最短距离。',{round});if(round>=n)break;let u=-1;s('candidate','清空本轮候选节点。',{round,u});for(let v=0;;v++){s('scan','寻找尚未确定且距离最小的节点。',{round,u:name(g,u),v:name(g,v<n?v:-1)},v<n?[v]:[]);if(v>=n)break;if(!seen[v]&&(u===-1||dist[v]<dist[u]))u=v;s('choose','在候选节点中保留距离较小者。',{u:name(g,u),v:name(g,v)},[u,v]);}s('stop','如果剩余节点都不可达，则停止。',{u:name(g,u)},u<0?[]:[u]);if(u===-1||dist[u]===Infinity)break;seen[u]=true;s('mark','该节点的最短距离已经确定。',{u:name(g,u)},[u]);for(let k=0;;k++){s('edges','依次检查从当前节点出发的边。',{u:name(g,u),边下标:k},[u]);if(k>=adj[u].length)break;const [v,weight]=adj[u][k];s('relax','尝试经当前节点到达邻居。',{u:name(g,u),v:name(g,v),weight,候选:dist[u]+weight},[u,v]);if(dist[u]+weight<dist[v]){dist[v]=dist[u]+weight;s('update','找到更短的路线，更新邻居距离。',{u:name(g,u),v:name(g,v),weight},[u,v]);}}}s('return','返回所有节点距离；∞ 表示不可达。');return t.done(dist);
  });
  L.register('bellman-ford',(options={})=>{
    const g=options.graph||L.graph(6,true,true);if(!options.graph)g.edges.forEach(e=>{if(Math.random()<.2)e.w=-L.rand(1,3);});const n=g.nodes.length,start=options.start??0,edges=g.directed?g.edges:g.edges.flatMap(e=>[e,{u:e.v,v:e.u,w:e.w}]),dist=Array(n).fill(Infinity);
    const t=new L.Trace(`struct Edge { int u, v, weight; };
pair<bool, vector<int>> bellmanFord(int n, vector<Edge> edges, int start) {
infinity|    const int INF = 1000000000;
init|    vector<int> dist(n, INF);
start|    dist[start] = 0;
outer|    for (int round = 1; round < n; ++round) {
change|        bool changed = false;
edges|        for (auto [u, v, weight] : edges) {
test|            if (dist[u] != INF && dist[u] + weight < dist[v]) {
update|                dist[v] = dist[u] + weight;
mark|                changed = true;
            }
        }
stop|        if (!changed) break;
    }
cycle|    for (auto [u, v, weight] : edges) {
detect|        if (dist[u] != INF && dist[u] + weight < dist[v]) return {true, dist};
    }
return|    return {false, dist};
}`,{起点:name(g,start),边:edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,{dist,...v},draw(g,dist,null,active));s('infinity','∞ 表示尚不可达。');s('init','初始化距离数组。');dist[start]=0;s('start','起点的距离为零。',{},[start]);for(let round=1;;round++){s('outer','至多 n−1 轮松弛即可覆盖不含环的最短路径。',{round});if(round>=n)break;let changed=false;s('change','记录本轮是否产生改进。',{round,changed});for(let k=0;;k++){s('edges','依次检查所有边。',{round,k});if(k>=edges.length)break;const {u,v,w}=edges[k];s('test','起点可达，并且经这条边能够缩短距离时才更新。',{round,u:name(g,u),v:name(g,v),weight:w},[u,v]);if(dist[u]!==Infinity&&dist[u]+w<dist[v]){dist[v]=dist[u]+w;s('update','更新终点的距离。',{round,u:name(g,u),v:name(g,v),weight:w},[u,v]);changed=true;s('mark','本轮存在改进。',{round,changed});}}s('stop','整轮没有改进时可以提前结束。',{round,changed});if(!changed)break;}for(let k=0;;k++){s('cycle','额外扫描所有边，检查可达负环。',{k});if(k>=edges.length)break;const {u,v,w}=edges[k];s('detect','若还可松弛，则存在从起点可达的负环。',{u:name(g,u),v:name(g,v),weight:w},[u,v]);if(dist[u]!==Infinity&&dist[u]+w<dist[v])return t.done({negativeCycle:true,dist},'发现可达负环，最短距离没有有限解。');}s('return','没有发现可达负环。');return t.done({negativeCycle:false,dist});
  });
  L.register('floyd',(options={})=>{
    const g=options.graph||L.graph(5,true,true),n=g.nodes.length,d=Array.from({length:n},()=>Array(n).fill(Infinity));
    const t=new L.Trace(`vector<vector<int>> floyd(int n, vector<tuple<int,int,int>> edges, bool directed) {
infinity|    const int INF = 1000000000;
init|    vector<vector<int>> d(n, vector<int>(n, INF));
diagonal|    for (int i = 0; i < n; ++i) d[i][i] = 0;
edges|    for (auto [u, v, w] : edges) {
direct|        d[u][v] = min(d[u][v], w);
reverse|        if (!directed) d[v][u] = min(d[v][u], w);
    }
middle|    for (int k = 0; k < n; ++k) {
source|        for (int i = 0; i < n; ++i) {
target|            for (int j = 0; j < n; ++j) {
test|                if (d[i][k] != INF && d[k][j] != INF) {
update|                    d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
                }
            }
        }
    }
return|    return d;
}`,{节点:g.nodes.map(x=>x.label),边:g.edges},L.matrix(d));const s=(l,m,v={},active=[])=>t.step(l,m,v,L.matrix(d,active,{rowLabels:g.nodes.map(x=>x.label),colLabels:g.nodes.map(x=>x.label),caption:'行是起点，列是终点；∞ 表示尚未找到路线'}));s('infinity','∞ 表示不可达。');s('init','初始化两点之间的距离矩阵。');for(let i=0;i<n;i++){d[i][i]=0;s('diagonal','节点到自身距离为 0。',{i},[[i,i]]);}for(const {u,v,w}of g.edges){s('edges','读取一条直接连接的边。',{u:name(g,u),v:name(g,v),w});d[u][v]=Math.min(d[u][v],w);s('direct','写入直接边的权值。',{u:name(g,u),v:name(g,v),w},[[u,v]]);if(!g.directed)d[v][u]=Math.min(d[v][u],w);s('reverse','无向图还需要写入反向距离。',{directed:g.directed},[[v,u]]);}for(let k=0;;k++){s('middle','允许使用这个节点作为新的中转点。',{k});if(k>=n)break;for(let i=0;;i++){s('source','枚举起点。',{k,i});if(i>=n)break;for(let j=0;;j++){s('target','枚举终点。',{k,i,j});if(j>=n)break;s('test','只有两段路径都可达时，才能通过中转点连接。',{k,i,j},[[i,k],[k,j]]);if(d[i][k]!==Infinity&&d[k][j]!==Infinity){const candidate=d[i][k]+d[k][j];d[i][j]=Math.min(d[i][j],candidate);s('update','比较原路线与经 k 中转的路线。',{k,i,j,candidate},[[i,k],[k,j],[i,j]]);}}}}s('return','矩阵中记录了所有节点对的最短距离。');return t.done(d);
  });
  L.register('topological-sort',(options={})=>{
    const g=options.graph||L.graph(6,true),n=g.nodes.length,adj=L.adjacency(g),degree=Array(n).fill(0),q=[],order=[];
    const t=new L.Trace(`vector<int> topologicalSort(vector<vector<int>> adj) {
init|    vector<int> degree(adj.size(), 0), order;
edges|    for (auto neighbors : adj) {
count|        for (int v : neighbors) ++degree[v];
    }
queue|    queue<int> q;
scan|    for (int u = 0; u < (int)adj.size(); ++u) {
zero|        if (degree[u] == 0) q.push(u);
    }
loop|    while (!q.empty()) {
pop|        int u = q.front(); q.pop();
visit|        order.push_back(u);
neighbors|        for (int v : adj[u]) {
decrease|            --degree[v];
push|            if (degree[v] == 0) q.push(v);
        }
    }
cycle|    if (order.size() != adj.size()) return {};
return|    return order;
}`,{边:g.edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,{degree,queue:q.map(i=>name(g,i)),order:order.map(i=>name(g,i)),...v},draw(g,degree,degree.map((_,i)=>order.includes(i)),active));s('init','所有节点的入度初始化为零。');for(let u=0;u<n;u++){s('edges','读取一个节点的出边。',{u:name(g,u)},[u]);for(const [v]of adj[u]){degree[v]++;s('count','每条进入该节点的边让入度加一。',{v:name(g,v)},[v]);}}s('queue','建立入度为零的节点队列。');for(let u=0;;u++){s('scan','寻找初始无前置依赖的节点。',{u});if(u>=n)break;if(degree[u]===0)q.push(u);s('zero','入度为零的节点加入队列。',{u:name(g,u)},[u]);}while(true){s('loop','检查是否还有可以移除的节点。');if(!q.length)break;const u=q.shift();s('pop','取出一个无前置依赖的节点。',{u:name(g,u)},[u]);order.push(u);s('visit','把它加入拓扑序。',{u:name(g,u)},[u]);for(let k=0;;k++){s('neighbors','移除这个节点产生的所有依赖。',{u:name(g,u)});if(k>=adj[u].length)break;const v=adj[u][k][0];degree[v]--;s('decrease','邻居的入度减一。',{u:name(g,u),v:name(g,v)},[u,v]);if(degree[v]===0)q.push(v);s('push','依赖清空的邻居可以入队。',{v:name(g,v)},[v]);}}s('cycle','若仍有节点无法移除，图中存在有向环。');if(order.length!==n)return t.done({order:[],hasCycle:true},'检测到有向环，无法生成完整拓扑序。');s('return','所有节点处理完成。');return t.done({order,hasCycle:false});
  });
  L.register('prim',(options={})=>{
    const g=options.graph||L.graph(6,false,true),n=g.nodes.length,adj=L.adjacency(g),dist=Array(n).fill(Infinity),parent=Array(n).fill(-1),seen=Array(n).fill(false),chosen=[];let total=0;
    const t=new L.Trace(`int prim(vector<vector<pair<int,int>>> adj) {
size|    int n = adj.size();
init|    vector<int> best(n, INT_MAX), parent(n, -1);
seen|    vector<bool> used(n, false);
start|    best[0] = 0;
total|    int total = 0;
outer|    for (int round = 0; round < n; ++round) {
candidate|        int u = -1;
scan|        for (int v = 0; v < n; ++v) {
choose|            if (!used[v] && (u == -1 || best[v] < best[u])) u = v;
        }
fail|        if (u == -1 || best[u] == INT_MAX) return -1;
mark|        used[u] = true;
add|        total += best[u];
edges|        for (auto [v, weight] : adj[u]) {
test|            if (!used[v] && weight < best[v]) {
update|                best[v] = weight;
parent|                parent[v] = u;
            }
        }
    }
return|    return total;
}`,{边:g.edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,{best:dist,parent:parent.map(x=>name(g,x)),total,...v},draw(g,dist,seen,active,chosen));s('size','确定节点数量。',{n});s('init','记录每个节点接入当前生成树的最低边权。');s('seen','所有节点都尚未加入树。');dist[0]=0;s('start','从 A 开始，接入成本为 0。');s('total','总边权初始为 0。');for(let round=0;;round++){s('outer','每轮向生成树加入一个节点。',{round});if(round>=n)break;let u=-1;s('candidate','清空候选节点。');for(let v=0;;v++){s('scan','寻找接入成本最低的未选节点。',{v});if(v>=n)break;if(!seen[v]&&(u===-1||dist[v]<dist[u]))u=v;s('choose','更新候选节点。',{u:name(g,u),v:name(g,v)},[u]);}s('fail','如果无法连接剩余节点，原图不连通。',{u:name(g,u)});if(u===-1||dist[u]===Infinity)return t.done(-1,'原图不连通，不存在覆盖所有节点的生成树。');seen[u]=true;if(parent[u]>=0)chosen.push([parent[u],u]);s('mark','将当前节点与对应连接边加入树。',{u:name(g,u)},[u]);total+=dist[u];s('add','累加接入这条边的权重。',{u:name(g,u)},[u]);for(let k=0;;k++){s('edges','检查这个节点通向树外的边。',{u:name(g,u)});if(k>=adj[u].length)break;const [v,weight]=adj[u][k];s('test','只有通向未选节点且边更便宜时才更新。',{u:name(g,u),v:name(g,v),weight},[u,v]);if(!seen[v]&&weight<dist[v]){dist[v]=weight;s('update','降低该节点接入树的成本。',{v:name(g,v),weight},[v]);parent[v]=u;s('parent','记录这条候选边的树内端点。',{u:name(g,u),v:name(g,v)},[u,v]);}}}s('return','最小生成树构建完成。');return t.done(total);
  });
  L.register('kruskal',(options={})=>{
    const g=options.graph||L.graph(6,false,true),n=g.nodes.length,edges=g.edges.slice().sort((a,b)=>a.w-b.w),p=Array.from({length:n},(_,i)=>i),chosen=[];let total=0;
    const t=new L.Trace(`int findRoot(int x, vector<int>& parent) {
rootLoop|    while (parent[x] != x) {
rootNext|        x = parent[x];
    }
rootReturn|    return x;
}
int kruskal(int n, vector<tuple<int,int,int>> edges) {
sort|    stable_sort(edges.begin(), edges.end(), [](auto a, auto b) { return get<0>(a) < get<0>(b); }); // weight, u, v
init|    vector<int> parent(n); iota(parent.begin(), parent.end(), 0);
total|    int total = 0, count = 0;
edges|    for (auto [weight, u, v] : edges) {
roots|        int a = findRoot(u, parent), b = findRoot(v, parent);
cycle|        if (a == b) continue;
union|        parent[a] = b;
add|        total += weight;
count|        ++count;
    }
return|    return count == n - 1 ? total : -1;
}`,{边:g.edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,{parent:p,total,选边数:chosen.length,...v},draw(g,null,null,active,chosen));function find(x){while(true){s('rootLoop','沿父指针查找集合代表。',{x:name(g,x)},[x]);if(p[x]===x)break;x=p[x];s('rootNext','前进到父节点。',{x:name(g,x)},[x]);}s('rootReturn','找到集合代表。',{x:name(g,x)},[x]);return x;}s('sort','按边权从小到大排序。',{边顺序:edges.map(e=>`${name(g,e.u)}-${name(g,e.v)}:${e.w}`)});s('init','每个节点最初属于独立集合。');s('total','总权重与选边数初始为 0。');for(let k=0;;k++){s('edges','尝试当前最便宜的剩余边。',{k});if(k>=edges.length)break;const {u,v,w}=edges[k];s('roots','分别查找边两端所属的集合。',{u:name(g,u),v:name(g,v),weight:w},[u,v]);const a=find(u),b=find(v);s('cycle','同属一个集合会形成环，直接跳过。',{a:name(g,a),b:name(g,b)},[u,v]);if(a===b)continue;p[a]=b;chosen.push([u,v]);s('union','合并两个集合并选择这条边。',{a:name(g,a),b:name(g,b)},[u,v]);total+=w;s('add','计入本条边权。',{weight:w},[u,v]);s('count','选边数加一。',{count:chosen.length});}s('return','选中 n−1 条边才构成完整生成树。');return t.done(chosen.length===n-1?total:-1,chosen.length===n-1?'最小生成树构建完成。':'图不连通，只能得到生成森林。');
  });
})(AlgoLab);

(function(L){
  'use strict';
  L.register('components',(options={})=>{
    const g=options.graph?L.copy(options.graph):L.graph(7,false,false);
    if(g.directed)throw new Error('此演示计算无向图的连通分量。');
    g.kind='graph';g.directed=false;g.weighted=false;
    if(!options.graph){
      const split=L.rand(2,4);
      g.edges=g.edges.filter(e=>(e.u<split)===(e.v<split)&&e.u!==6&&e.v!==6);
    }
    const n=g.nodes.length,adj=L.adjacency(g).map(row=>row.map(edge=>edge[0]));
    const labels=Array(n).fill(-1);let count=0,queue=[];
    const view=(active=[])=>({...g,active,visited:labels.flatMap((x,i)=>x<0?[]:[i]),
      nodes:g.nodes.map((node,i)=>({...node,badge:labels[i]<0?'未分组':'组 '+labels[i]})),
      aux:[{label:'BFS 队列（顶点编号）',values:queue},{label:'所属分量 label',values:labels}],
      caption:'逐个寻找尚未分组的顶点；每轮 BFS 标记一个完整分量，孤立点也单独成组。'});
    const t=L.lessonTrace('components',{graph:g},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{n,count,labels,queue,...vars},view(active));
    s('size','读取顶点数。');s('init','所有顶点标记为 -1，表示尚未分组。');s('count','分量编号从 0 开始。');
    for(let start=0;;start++){
      s('outer','检查下一个顶点，保证不会遗漏不连通区域。',{start});if(start>=n)break;
      s('skip','已被某次 BFS 分组的顶点无需再次启动搜索。',{start},[start]);if(labels[start]!==-1)continue;
      queue=[];s('queue','为一个新分量建立空队列。',{start},[start]);
      labels[start]=count;s('markStart','起点属于当前分量。',{start},[start]);
      queue.push(start);s('pushStart','起点入队，等待扩展。',{start},[start]);
      while(true){
        s('loop','队列非空时继续搜索当前分量。',{start});if(!queue.length)break;
        const u=queue[0];s('front','取出队首编号。',{start,u},[u]);
        queue.shift();s('pop','移除队首，开始检查它的邻居。',{start,u},[u]);
        for(let k=0;;k++){
          s('edge','依次检查当前顶点的邻接点。',{u,k},[u]);if(k>=adj[u].length)break;
          const v=adj[u][k];s('seen','只有未分组的邻接点需要加入队列。',{u,v},[u,v]);if(labels[v]!==-1)continue;
          labels[v]=count;s('mark','邻居与当前顶点属于同一分量；入队前即标记，防止重复入队。',{u,v},[u,v]);
          queue.push(v);s('push','把新发现的邻居加入队尾。',{u,v},[v]);
        }
      }
      count++;s('next','当前分量已全部搜索，准备使用下一个编号。',{start});
    }
    s('return','返回每个顶点所属的分量编号，相同编号表示连通。');
    return t.done(labels);
  });
})(AlgoLab);
