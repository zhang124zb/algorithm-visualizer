(function(C){
  C.code('dfs-order',`vector<vector<int>> dfsOrder(vector<vector<int>> g) {
init|    vector<int> order,tin(g.size()),tout(g.size());
visit|    function<void(int,int)> dfs=[&](int u,int parent) {
enter|        tin[u]=order.size(); order.push_back(u);
edge|        for(int v:g[u]) {
recur|            if(v!=parent) dfs(v,u);
        }
exit|        tout[u]=order.size();
    };
start|    dfs(0,-1);
return|    return {order,tin,tout};
}`,`def dfs_order(g):
init|    order=[]; tin=[0]*len(g); tout=[0]*len(g)
visit|    def dfs(u,parent):
enter|        tin[u]=len(order); order.append(u)
edge|        for v in g[u]:
recur|            if v!=parent: dfs(v,u)
exit|        tout[u]=len(order)
start|    dfs(0,-1)
return|    return [order,tin,tout]`, `static void visit(List<List<Integer>> g,int u,int parent,List<Integer> order,int[] tin,int[] tout) {
visit|    int node=u;
enter|    tin[u]=order.size(); order.add(u);
edge|    for(int v:g.get(u)) {
recur|        if(v!=parent) visit(g,v,u,order,tin,tout);
    }
exit|    tout[u]=order.size();
}
static int[][] dfsOrder(List<List<Integer>> g) {
init|    List<Integer> order=new ArrayList<>(); int[] tin=new int[g.size()],tout=new int[g.size()];
start|    visit(g,0,-1,order,tin,tout);
return|    return new int[][]{order.stream().mapToInt(Integer::intValue).toArray(),tin,tout};
}`);
  C.code('tree-diameter',`int treeDiameter(vector<vector<int>> g) {
init|    int source=0; vector<int> d;
pass|    for(int pass=0;pass<2;pass++) {
start|        d.assign(g.size(),-1); queue<int> q; d[source]=0; q.push(source);
loop|        while(!q.empty()) {
pop|            int u=q.front(); q.pop();
edge|            for(int v:g[u]) {
visit|                if(d[v]<0) { d[v]=d[u]+1; q.push(v); }
            }
        }
far|        source=max_element(d.begin(),d.end())-d.begin();
    }
return|    return d[source];
}`,`from collections import deque
def tree_diameter(g):
init|    source=0; d=[]
pass|    for turn in range(2):
start|        d=[-1]*len(g); d[source]=0; q=deque([source])
loop|        while q:
pop|            u=q.popleft()
edge|            for v in g[u]:
visit|                if d[v]<0: d[v]=d[u]+1; q.append(v)
far|        source=d.index(max(d))
return|    return d[source]`, `static int treeDiameter(List<List<Integer>> g) {
init|    int source=0; int[] d=new int[g.size()];
pass|    for(int pass=0;pass<2;pass++) {
start|        Arrays.fill(d,-1); Deque<Integer> q=new ArrayDeque<>(); d[source]=0; q.add(source);
loop|        while(!q.isEmpty()) {
pop|            int u=q.remove();
edge|            for(int v:g.get(u)) {
visit|                if(d[v]<0) { d[v]=d[u]+1; q.add(v); }
            }
        }
far|        for(int v=0;v<g.size();v++) if(d[v]>d[source]) source=v;
    }
return|    return d[source];
}`);
  C.code('binary-lca',`int lca(vector<vector<int>> g,int u,int v) {
init|    int n=g.size(),K=1; while((1<<K)<=n) K++; vector<vector<int>> up(K,vector<int>(n)); vector<int> depth(n,-1); queue<int> q;
start|    depth[0]=0; q.push(0);
bfs|    while(!q.empty()) { int x=q.front(); q.pop();
parent|        for(int y:g[x]) if(depth[y]<0) { depth[y]=depth[x]+1; up[0][y]=x; q.push(y); }
    }
level|    for(int j=1;j<K;j++) {
table|        for(int x=0;x<n;x++) up[j][x]=up[j-1][up[j-1][x]];
    }
swap|    if(depth[u]<depth[v]) swap(u,v);
align|    for(int j=K-1;j>=0;j--) if((depth[u]-depth[v])>=(1<<j)) u=up[j][u];
same|    if(u==v) return u;
loop|    for(int j=K-1;j>=0;j--) {
jump|        if(up[j][u]!=up[j][v]) { u=up[j][u]; v=up[j][v]; }
    }
return|    return up[0][u];
}`,`from collections import deque
def lca(g,u,v):
init|    n=len(g); levels=n.bit_length(); up=[[0]*n for _ in range(levels)]; depth=[-1]*n; q=deque()
start|    depth[0]=0; q.append(0)
bfs|    while q:
        x=q.popleft()
parent|        for y in g[x]:
            if depth[y]<0: depth[y]=depth[x]+1; up[0][y]=x; q.append(y)
level|    for j in range(1,levels):
table|        for x in range(n): up[j][x]=up[j-1][up[j-1][x]]
swap|    if depth[u]<depth[v]: u,v=v,u
align|    for j in range(levels-1,-1,-1):
        if depth[u]-depth[v]>=(1<<j): u=up[j][u]
same|    if u==v: return u
loop|    for j in range(levels-1,-1,-1):
jump|        if up[j][u]!=up[j][v]: u,v=up[j][u],up[j][v]
return|    return up[0][u]`, `static int lca(List<List<Integer>> g,int u,int v) {
init|    int n=g.size(),K=32-Integer.numberOfLeadingZeros(n); int[][] up=new int[K][n]; int[] depth=new int[n]; Arrays.fill(depth,-1); Deque<Integer> q=new ArrayDeque<>();
start|    depth[0]=0; q.add(0);
bfs|    while(!q.isEmpty()) { int x=q.remove();
parent|        for(int y:g.get(x)) if(depth[y]<0) { depth[y]=depth[x]+1; up[0][y]=x; q.add(y); }
    }
level|    for(int j=1;j<K;j++) {
table|        for(int x=0;x<n;x++) up[j][x]=up[j-1][up[j-1][x]];
    }
swap|    if(depth[u]<depth[v]) { int t=u; u=v; v=t; }
align|    for(int j=K-1;j>=0;j--) if(depth[u]-depth[v]>=(1<<j)) u=up[j][u];
same|    if(u==v) return u;
loop|    for(int j=K-1;j>=0;j--) {
jump|        if(up[j][u]!=up[j][v]) { u=up[j][u]; v=up[j][v]; }
    }
return|    return up[0][u];
}`);
})(AlgoLab.competition);
