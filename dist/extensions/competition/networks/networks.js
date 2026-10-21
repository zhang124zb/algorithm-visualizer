(function(L,C){
  L.register('heap-dijkstra',(o={})=>{
    const g=o.graph||L.graph(6,true,true);if(g.edges.some(e=>e.w<0))throw Error('Dijkstra 只支持非负权图。');
    const source=o.source??0,d=g.nodes.map(()=>1e9),q=[],adj=L.adjacency(g),t=C.trace('heap-dijkstra',{graph:g,source},g);
    const push=p=>{q.push(p);let i=q.length-1;while(i){const p=Math.floor((i-1)/2);if(q[p][0]<=q[i][0])break;[q[p],q[i]]=[q[i],q[p]];i=p;}};
    const pop=()=>{const top=q[0],last=q.pop();if(q.length){q[0]=last;let i=0;while(2*i+1<q.length){let j=2*i+1;if(j+1<q.length&&q[j+1][0]<q[j][0])j++;if(q[i][0]<=q[j][0])break;[q[i],q[j]]=[q[j],q[i]];i=j;}}return top;};
    const s=(l,msg,v={},active=[],chosen=[])=>t.step(l,msg,{distance:d,heap:q,...v},{...g,active,chosen,aux:[{label:'最短距离（1e9 表示不可达）',values:d},{label:'最小堆 [距离,节点]（按堆数组存放）',values:q}]} );
    s('init','使用真正的二叉最小堆保存候选状态。');d[source]=0;push([0,source]);s('start','把源点状态加入堆。');while(q.length){s('loop','继续处理距离最小的候选。');const [dist,u]=pop();s('pop','弹出最小堆的堆顶。',{dist,u},[u]);s('stale','旧距离不等于最新距离时，跳过过期状态。',{dist,u});if(dist!==d[u])continue;for(const [v,w]of adj[u]){s('edge','枚举相邻边。',{u,v,w},[u,v],[[u,v]]);s('test','判断能否缩短最短距离。',{u,v,w});if(dist+w>=d[v])continue;d[v]=dist+w;push([d[v],v]);s('relax','更新距离并插入新状态，旧条目可留在堆里。',{u,v,w},[v],[[u,v]]);}}s('return','返回源点到各点的最短距离。');return t.done(d);
  });
  L.register('bipartite-color',(o={})=>{
    const g=o.graph||L.graph(6),adj=L.adjacency(g),color=g.nodes.map(()=>-1),q=[],t=C.trace('bipartite-color',{graph:g},g),s=(l,msg,v={},active=[],chosen=[])=>t.step(l,msg,{color,queue:q,...v},{...g,nodes:g.nodes.map(p=>({...p,badge:color[p.id]<0?'未染色':'组 '+color[p.id]})),active,chosen,visited:color.flatMap((x,i)=>x>=0?[i]:[])});
    s('init','-1 表示未染色；用 0 和 1 表示两组。');for(let start=0;start<g.nodes.length;start++){s('component','每个连通分量都要检查，孤立点也属于一个分量。',{s:start});if(color[start]>=0)continue;color[start]=0;q.push(start);s('start','选择一个未染色点作为新分量起点。',{s:start},[start]);while(q.length){s('loop','逐层传播颜色。');const u=q.shift();s('pop','取出一个已染色点。',{u},[u]);for(const [v]of adj[u]){s('edge','检查相邻节点。',{u,v},[u,v],[[u,v]]);if(color[v]<0){color[v]=color[u]^1;q.push(v);s('paint','把邻点染成相反颜色。',{u,v},[v]);}else{s('conflict','相邻节点颜色相同说明存在冲突，自环也会被识别。',{u,v},[u,v],[[u,v]]);if(color[v]===color[u])return t.done(false,'发现奇环，无法二分染色。');}}}}s('return','所有连通分量都可以分为两组。');return t.done(true);
  });
})(AlgoLab,AlgoLab.competition);
