(function(C){
  C.code('flood-fill',`vector<vector<int>> fillRegion(vector<vector<int>> a,int sr,int sc,int color) {
init|    int old=a[sr][sc],n=a.size(),m=a[0].size(); queue<pair<int,int>> q;
same|    if(old==color) return a;
start|    a[sr][sc]=color; q.push({sr,sc});
loop|    while(!q.empty()) {
pop|        auto [r,c]=q.front(); q.pop();
neighbors|        for(auto [dr,dc]:vector<pair<int,int>>{{1,0},{-1,0},{0,1},{0,-1}}) {
test|            int x=r+dr,y=c+dc; if(x<0||x>=n||y<0||y>=m||a[x][y]!=old) continue;
paint|            a[x][y]=color; q.push({x,y});
        }
    }
return|    return a;
}`,`from collections import deque
def fill_region(a,sr,sc,color):
init|    old=a[sr][sc]; n=len(a); m=len(a[0]); q=deque()
same|    if old==color: return a
start|    a[sr][sc]=color; q.append((sr,sc))
loop|    while q:
pop|        r,c=q.popleft()
neighbors|        for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
test|            x,y=r+dr,c+dc
            if not (0<=x<n and 0<=y<m) or a[x][y]!=old: continue
paint|            a[x][y]=color; q.append((x,y))
return|    return a`, `static int[][] fillRegion(int[][] a,int sr,int sc,int color) {
init|    int old=a[sr][sc],n=a.length,m=a[0].length; Deque<int[]> q=new ArrayDeque<>();
same|    if(old==color) return a;
start|    a[sr][sc]=color; q.add(new int[]{sr,sc});
loop|    while(!q.isEmpty()) {
pop|        int[] p=q.remove(); int r=p[0],c=p[1];
neighbors|        for(int[] dir:new int[][]{{1,0},{-1,0},{0,1},{0,-1}}) {
test|            int x=r+dir[0],y=c+dir[1]; if(x<0||x>=n||y<0||y>=m||a[x][y]!=old) continue;
paint|            a[x][y]=color; q.add(new int[]{x,y});
        }
    }
return|    return a;
}`);
  C.code('multi-bfs',`vector<vector<int>> multiBfs(int n,int m,vector<pair<int,int>> sources) {
init|    vector<vector<int>> d(n,vector<int>(m,-1)); queue<pair<int,int>> q;
start|    for(auto [r,c]:sources) if(d[r][c]<0) { d[r][c]=0; q.push({r,c}); }
loop|    while(!q.empty()) {
pop|        auto [r,c]=q.front(); q.pop();
neighbors|        for(auto [dr,dc]:vector<pair<int,int>>{{1,0},{-1,0},{0,1},{0,-1}}) {
test|            int x=r+dr,y=c+dc; if(x<0||x>=n||y<0||y>=m||d[x][y]>=0) continue;
visit|            d[x][y]=d[r][c]+1; q.push({x,y});
        }
    }
return|    return d;
}`,`from collections import deque
def multi_bfs(n,m,sources):
init|    d=[[-1]*m for _ in range(n)]; q=deque()
start|    for r,c in sources:
        if d[r][c]<0: d[r][c]=0; q.append((r,c))
loop|    while q:
pop|        r,c=q.popleft()
neighbors|        for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
test|            x,y=r+dr,c+dc
            if not (0<=x<n and 0<=y<m) or d[x][y]>=0: continue
visit|            d[x][y]=d[r][c]+1; q.append((x,y))
return|    return d`, `static int[][] multiBfs(int n,int m,int[][] sources) {
init|    int[][] d=new int[n][m]; for(int[] row:d) Arrays.fill(row,-1); Deque<int[]> q=new ArrayDeque<>();
start|    for(int[] p:sources) if(d[p[0]][p[1]]<0) { d[p[0]][p[1]]=0; q.add(p.clone()); }
loop|    while(!q.isEmpty()) {
pop|        int[] p=q.remove(); int r=p[0],c=p[1];
neighbors|        for(int[] dir:new int[][]{{1,0},{-1,0},{0,1},{0,-1}}) {
test|            int x=r+dir[0],y=c+dir[1]; if(x<0||x>=n||y<0||y>=m||d[x][y]>=0) continue;
visit|            d[x][y]=d[r][c]+1; q.add(new int[]{x,y});
        }
    }
return|    return d;
}`);
  C.code('zero-one-bfs',`vector<int> zeroOne(vector<vector<pair<int,int>>> g,int source) {
init|    vector<int> d(g.size(),1000000000); deque<int> q;
start|    d[source]=0; q.push_back(source);
loop|    while(!q.empty()) {
pop|        int u=q.front(); q.pop_front();
edge|        for(auto [v,w]:g[u]) {
test|            if(d[u]+w>=d[v]) continue;
relax|            d[v]=d[u]+w;
push|            if(w==0) q.push_front(v); else q.push_back(v);
        }
    }
return|    return d;
}`,`from collections import deque
def zero_one(g,source):
init|    d=[10**9]*len(g); q=deque()
start|    d[source]=0; q.append(source)
loop|    while q:
pop|        u=q.popleft()
edge|        for v,w in g[u]:
test|            if d[u]+w>=d[v]: continue
relax|            d[v]=d[u]+w
push|            if w==0: q.appendleft(v)
            else: q.append(v)
return|    return d`, `static int[] zeroOne(List<List<int[]>> g,int source) {
init|    int[] d=new int[g.size()]; Arrays.fill(d,1000000000); Deque<Integer> q=new ArrayDeque<>();
start|    d[source]=0; q.add(source);
loop|    while(!q.isEmpty()) {
pop|        int u=q.removeFirst();
edge|        for(int[] e:g.get(u)) { int v=e[0],w=e[1];
test|            if(d[u]+w>=d[v]) continue;
relax|            d[v]=d[u]+w;
push|            if(w==0) q.addFirst(v); else q.addLast(v);
        }
    }
return|    return d;
}`);
})(AlgoLab.competition);
