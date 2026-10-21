(function(L,C){
  L.register('flood-fill',(o={})=>{
    const a=o.matrix?.map(r=>r.slice())||Array.from({length:5},()=>L.numbers(6,0,1)),sr=o.row??0,sc=o.col??0,color=o.color??2,old=a[sr][sc],n=a.length,m=a[0].length,q=[],visited=[];
    const t=C.trace('flood-fill',{matrix:a.map(r=>r.slice()),row:sr,col:sc,color},L.matrix(a)),s=(l,msg,v={},active=[])=>t.step(l,msg,{old,color,queue:q,...v},L.matrix(a,active,{visited}));
    s('init','识别起点原来的颜色。');s('same','新旧颜色相同则直接返回，避免重复入队。');if(old===color)return t.done(a);a[sr][sc]=color;q.push([sr,sc]);visited.push([sr,sc]);s('start','入队时就染色，避免一个格子被重复加入。',{},[[sr,sc]]);while(q.length){s('loop','按队列顺序处理连通区域。');const [r,c]=q.shift();s('pop','取出一个待扩展的格子。',{r,c},[[r,c]]);for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){s('neighbors','枚举上下左右四个方向。',{r,c,dr,dc},[[r,c]]);const x=r+dr,y=c+dc;s('test','检查边界及颜色是否相同。',{x,y});if(x<0||x>=n||y<0||y>=m||a[x][y]!==old)continue;a[x][y]=color;q.push([x,y]);visited.push([x,y]);s('paint','染色并加入队列。',{x,y},[[x,y]]);}}s('return','只填充与起点四连通且颜色相同的区域。');return t.done(a);
  });
  L.register('multi-bfs',(o={})=>{
    const n=o.n??4,m=o.m??5,sources=o.sources||[[0,L.rand(0,m-1)],[n-1,L.rand(0,m-1)]],d=Array.from({length:n},()=>Array(m).fill(-1)),q=[];
    const t=C.trace('multi-bfs',{n,m,sources},L.matrix(d)),s=(l,msg,v={},active=[])=>t.step(l,msg,{sources,queue:q,...v},L.matrix(d,active,{caption:'-1 表示尚不可达；所有起点距离为 0'}));
    s('init','初始化距离矩阵与队列。');for(const [r,c]of sources){if(d[r][c]<0){d[r][c]=0;q.push([r,c]);}s('start','把所有源点一起加入队列，重复源点只加入一次。',{},[[r,c]]);}while(q.length){s('loop','按层向外扩展。');const [r,c]=q.shift();s('pop','取出距离最小的待扩展格子。',{r,c},[[r,c]]);for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){s('neighbors','查看四邻接格子。',{r,c,dr,dc});const x=r+dr,y=c+dc;s('test','越界或已经到达的格子不再入队。',{x,y});if(x<0||x>=n||y<0||y>=m||d[x][y]>=0)continue;d[x][y]=d[r][c]+1;q.push([x,y]);s('visit','第一次到达就是距离最近源点的最短步数。',{x,y},[[x,y]]);}}s('return','得到每格到最近源点的距离。');return t.done(d);
  });
  L.register('zero-one-bfs',(o={})=>{
    const g=o.graph?L.copy(o.graph):L.graph(6,true,true);if(!o.graph)g.edges.forEach(e=>e.w=L.rand(0,1));if(g.edges.some(e=>![0,1].includes(e.w)))throw Error('0-1 BFS 的边权必须为 0 或 1。');
    const source=o.source??0,d=g.nodes.map(()=>1e9),q=[],adj=L.adjacency(g),t=C.trace('zero-one-bfs',{graph:g,source},{...g}),s=(l,msg,v={},active=[],chosen=[])=>t.step(l,msg,{distance:d,deque:q,...v},{...g,active,chosen,aux:[{label:'最短距离（1e9 表示不可达）',values:d}]} );
    s('init','边权限定 0 / 1，以双端队列维护优先顺序。');d[source]=0;q.push(source);s('start','源点距离设为 0。');while(q.length){s('loop','队列不空时继续扩展。');const u=q.shift();s('pop','从队首取出节点。',{u},[u]);for(const [v,w]of adj[u]){s('edge','检查一条出边。',{u,v,w},[u,v],[[u,v]]);s('test','只有距离变短才更新。',{u,v,w});if(d[u]+w>=d[v])continue;d[v]=d[u]+w;s('relax','更新更短距离；已经入过队的节点仍可再次改善。',{u,v,w},[v],[[u,v]]);if(w===0)q.unshift(v);else q.push(v);s('push',w===0?'零权边到达的点进入队首。':'一权边到达的点进入队尾。',{u,v,w});}}s('return','距离计算完成。');return t.done(d);
  });
})(AlgoLab,AlgoLab.competition);
