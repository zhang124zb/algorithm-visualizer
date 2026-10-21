(function(C){
  C.code('heap-dijkstra',`vector<int> heapDijkstra(vector<vector<pair<int,int>>> g,int source) {
init|    vector<int> d(g.size(),1000000000); priority_queue<pair<int,int>,vector<pair<int,int>>,greater<pair<int,int>>> q;
start|    d[source]=0; q.push({0,source});
loop|    while(!q.empty()) {
pop|        auto [dist,u]=q.top(); q.pop();
stale|        if(dist!=d[u]) continue;
edge|        for(auto [v,w]:g[u]) {
test|            if(dist+w>=d[v]) continue;
relax|            d[v]=dist+w; q.push({d[v],v});
        }
    }
return|    return d;
}`,`from heapq import heappush, heappop
def heap_dijkstra(g,source):
init|    d=[10**9]*len(g); q=[]
start|    d[source]=0; heappush(q,(0,source))
loop|    while q:
pop|        dist,u=heappop(q)
stale|        if dist!=d[u]: continue
edge|        for v,w in g[u]:
test|            if dist+w>=d[v]: continue
relax|            d[v]=dist+w; heappush(q,(d[v],v))
return|    return d`, `static int[] heapDijkstra(List<List<int[]>> g,int source) {
init|    int[] d=new int[g.size()]; Arrays.fill(d,1000000000); PriorityQueue<int[]> q=new PriorityQueue<>(Comparator.comparingInt(p->p[0]));
start|    d[source]=0; q.add(new int[]{0,source});
loop|    while(!q.isEmpty()) {
pop|        int[] p=q.remove(); int dist=p[0],u=p[1];
stale|        if(dist!=d[u]) continue;
edge|        for(int[] e:g.get(u)) { int v=e[0],w=e[1];
test|            if(dist+w>=d[v]) continue;
relax|            d[v]=dist+w; q.add(new int[]{d[v],v});
        }
    }
return|    return d;
}`);
  C.code('bipartite-color',`bool bipartite(vector<vector<int>> g) {
init|    vector<int> color(g.size(),-1); queue<int> q;
component|    for(int s=0;s<(int)g.size();s++) if(color[s]<0) {
start|        color[s]=0; q.push(s);
loop|        while(!q.empty()) {
pop|            int u=q.front(); q.pop();
edge|            for(int v:g[u]) {
paint|                if(color[v]<0) { color[v]=color[u]^1; q.push(v); }
conflict|                else if(color[v]==color[u]) return false;
            }
        }
    }
return|    return true;
}`,`from collections import deque
def bipartite(g):
init|    color=[-1]*len(g); q=deque()
component|    for s in range(len(g)):
        if color[s]>=0: continue
start|        color[s]=0; q.append(s)
loop|        while q:
pop|            u=q.popleft()
edge|            for v in g[u]:
paint|                if color[v]<0: color[v]=color[u]^1; q.append(v)
conflict|                elif color[v]==color[u]: return False
return|    return True`, `static boolean bipartite(List<List<Integer>> g) {
init|    int[] color=new int[g.size()]; Arrays.fill(color,-1); Deque<Integer> q=new ArrayDeque<>();
component|    for(int s=0;s<g.size();s++) if(color[s]<0) {
start|        color[s]=0; q.add(s);
loop|        while(!q.isEmpty()) {
pop|            int u=q.remove();
edge|            for(int v:g.get(u)) {
paint|                if(color[v]<0) { color[v]=color[u]^1; q.add(v); }
conflict|                else if(color[v]==color[u]) return false;
            }
        }
    }
return|    return true;
}`);
})(AlgoLab.competition);
