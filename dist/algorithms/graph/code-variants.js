(function(L){
  'use strict';
  L.addCode('dijkstra',`def dijkstra(adj, start):
size|    n = len(adj)
infinity|    INF = float('inf')
init|    dist = [INF] * n
seen|    seen = [False] * n
start|    dist[start] = 0
outer|    for round in range(n):
candidate|        u = -1
scan|        for v in range(n):
choose|            if not seen[v] and (u == -1 or dist[v] < dist[u]): u = v
stop|        if u == -1 or dist[u] == INF: break
mark|        seen[u] = True
edges|        for v, weight in adj[u]:
relax|            if dist[u] + weight < dist[v]:
update|                dist[v] = dist[u] + weight
return|    return dist`,
`static int[] dijkstra(List<List<int[]>> adj, int start) {
size|    int n = adj.size();
infinity|    final int INF = 1000000000;
init|    int[] dist = new int[n]; Arrays.fill(dist, INF);
seen|    boolean[] seen = new boolean[n];
start|    dist[start] = 0;
outer|    for (int round = 0; round < n; round++) {
candidate|        int u = -1;
scan|        for (int v = 0; v < n; v++) {
choose|            if (!seen[v] && (u == -1 || dist[v] < dist[u])) u = v;
        }
stop|        if (u == -1 || dist[u] == INF) break;
mark|        seen[u] = true;
edges|        for (int[] edge : adj.get(u)) {
            int v = edge[0], weight = edge[1];
relax|            if (dist[u] + weight < dist[v]) {
update|                dist[v] = dist[u] + weight;
            }
        }
    }
return|    return dist;
}`);
  L.addCode('bellman-ford',`def bellman_ford(n, edges, start):
infinity|    INF = float('inf')
init|    dist = [INF] * n
start|    dist[start] = 0
outer|    for round in range(1, n):
change|        changed = False
edges|        for u, v, weight in edges:
test|            if dist[u] != INF and dist[u] + weight < dist[v]:
update|                dist[v] = dist[u] + weight
mark|                changed = True
stop|        if not changed: break
cycle|    for u, v, weight in edges:
detect|        if dist[u] != INF and dist[u] + weight < dist[v]: return True, dist
return|    return False, dist`,
`static class BFResult {
    boolean negativeCycle; int[] dist;
    BFResult(boolean negativeCycle, int[] dist) {
        this.negativeCycle = negativeCycle; this.dist = dist;
    }
}
static BFResult bellmanFord(int n, int[][] edges, int start) {
infinity|    final int INF = 1000000000;
init|    int[] dist = new int[n]; Arrays.fill(dist, INF);
start|    dist[start] = 0;
outer|    for (int round = 1; round < n; round++) {
change|        boolean changed = false;
edges|        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], weight = edge[2];
test|            if (dist[u] != INF && dist[u] + weight < dist[v]) {
update|                dist[v] = dist[u] + weight;
mark|                changed = true;
            }
        }
stop|        if (!changed) break;
    }
cycle|    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], weight = edge[2];
detect|        if (dist[u] != INF && dist[u] + weight < dist[v]) return new BFResult(true, dist);
    }
return|    return new BFResult(false, dist);
}`);
  L.addCode('floyd',`def floyd(n, edges, directed):
infinity|    INF = float('inf')
init|    d = [[INF] * n for _ in range(n)]
diagonal|    for i in range(n): d[i][i] = 0
edges|    for u, v, w in edges:
direct|        d[u][v] = min(d[u][v], w)
reverse|        if not directed: d[v][u] = min(d[v][u], w)
middle|    for k in range(n):
source|        for i in range(n):
target|            for j in range(n):
test|                if d[i][k] != INF and d[k][j] != INF:
update|                    d[i][j] = min(d[i][j], d[i][k] + d[k][j])
return|    return d`,
`static int[][] floyd(int n, int[][] edges, boolean directed) {
infinity|    final int INF = 1000000000;
init|    int[][] d = new int[n][n]; for (int[] row : d) Arrays.fill(row, INF);
diagonal|    for (int i = 0; i < n; i++) d[i][i] = 0;
edges|    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
direct|        d[u][v] = Math.min(d[u][v], w);
reverse|        if (!directed) d[v][u] = Math.min(d[v][u], w);
    }
middle|    for (int k = 0; k < n; k++) {
source|        for (int i = 0; i < n; i++) {
target|            for (int j = 0; j < n; j++) {
test|                if (d[i][k] != INF && d[k][j] != INF) {
update|                    d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
                }
            }
        }
    }
return|    return d;
}`);
  L.addCode('topological-sort',`from collections import deque

def topological_sort(adj):
init|    degree, order = [0] * len(adj), []
edges|    for neighbors in adj:
count|        for v in neighbors: degree[v] += 1
queue|    q = deque()
scan|    for u in range(len(adj)):
zero|        if degree[u] == 0: q.append(u)
loop|    while q:
pop|        u = q.popleft()
visit|        order.append(u)
neighbors|        for v in adj[u]:
decrease|            degree[v] -= 1
push|            if degree[v] == 0: q.append(v)
cycle|    if len(order) != len(adj): return []
return|    return order`,
`static List<Integer> topologicalSort(List<List<Integer>> adj) {
init|    int[] degree = new int[adj.size()]; List<Integer> order = new ArrayList<>();
edges|    for (List<Integer> neighbors : adj) {
count|        for (int v : neighbors) degree[v]++;
    }
queue|    Deque<Integer> q = new ArrayDeque<>();
scan|    for (int u = 0; u < adj.size(); u++) {
zero|        if (degree[u] == 0) q.addLast(u);
    }
loop|    while (!q.isEmpty()) {
pop|        int u = q.removeFirst();
visit|        order.add(u);
neighbors|        for (int v : adj.get(u)) {
decrease|            degree[v]--;
push|            if (degree[v] == 0) q.addLast(v);
        }
    }
cycle|    if (order.size() != adj.size()) return new ArrayList<>();
return|    return order;
}`);
  L.addCode('prim',`def prim(adj):
size|    n = len(adj)
init|    best, parent = [float('inf')] * n, [-1] * n
seen|    used = [False] * n
start|    best[0] = 0
total|    total = 0
outer|    for round in range(n):
candidate|        u = -1
scan|        for v in range(n):
choose|            if not used[v] and (u == -1 or best[v] < best[u]): u = v
fail|        if u == -1 or best[u] == float('inf'): return -1
mark|        used[u] = True
add|        total += best[u]
edges|        for v, weight in adj[u]:
test|            if not used[v] and weight < best[v]:
update|                best[v] = weight
parent|                parent[v] = u
return|    return total`,
`static int prim(List<List<int[]>> adj) {
size|    int n = adj.size();
init|    int[] best = new int[n], parent = new int[n]; Arrays.fill(best, Integer.MAX_VALUE); Arrays.fill(parent, -1);
seen|    boolean[] used = new boolean[n];
start|    best[0] = 0;
total|    int total = 0;
outer|    for (int round = 0; round < n; round++) {
candidate|        int u = -1;
scan|        for (int v = 0; v < n; v++) {
choose|            if (!used[v] && (u == -1 || best[v] < best[u])) u = v;
        }
fail|        if (u == -1 || best[u] == Integer.MAX_VALUE) return -1;
mark|        used[u] = true;
add|        total += best[u];
edges|        for (int[] edge : adj.get(u)) {
            int v = edge[0], weight = edge[1];
test|            if (!used[v] && weight < best[v]) {
update|                best[v] = weight;
parent|                parent[v] = u;
            }
        }
    }
return|    return total;
}`);
  L.addCode('kruskal',`def find_root(x, parent):
rootLoop|    while parent[x] != x:
rootNext|        x = parent[x]
rootReturn|    return x

def kruskal(n, edges):
sort|    edges.sort(key=lambda edge: edge[2])  # u, v, weight; stable
init|    parent = list(range(n))
total|    total, count = 0, 0
edges|    for u, v, weight in edges:
roots|        a, b = find_root(u, parent), find_root(v, parent)
cycle|        if a == b: continue
union|        parent[a] = b
add|        total += weight
count|        count += 1
return|    return total if count == n - 1 else -1`,
`static int findRoot(int x, int[] parent) {
rootLoop|    while (parent[x] != x) {
rootNext|        x = parent[x];
    }
rootReturn|    return x;
}
static int kruskal(int n, int[][] edges) {
sort|    Arrays.sort(edges, Comparator.comparingInt(edge -> edge[2])); // u, v, weight; stable
init|    int[] parent = new int[n]; for (int i = 0; i < n; i++) parent[i] = i;
total|    int total = 0, count = 0;
edges|    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], weight = edge[2];
roots|        int a = findRoot(u, parent), b = findRoot(v, parent);
cycle|        if (a == b) continue;
union|        parent[a] = b;
add|        total += weight;
count|        count++;
    }
return|    return count == n - 1 ? total : -1;
}`);
})(AlgoLab);

(function(L){
  L.addLesson('components',`vector<int> connectedComponents(vector<vector<int>> adj) {
size|    int n = adj.size();
init|    vector<int> labels(n, -1);
count|    int count = 0;
outer|    for (int start = 0; start < n; ++start) {
skip|        if (labels[start] != -1) continue;
queue|        queue<int> pending;
markStart|        labels[start] = count;
pushStart|        pending.push(start);
loop|        while (!pending.empty()) {
front|            int u = pending.front();
pop|            pending.pop();
edge|            for (int v : adj[u]) {
seen|                if (labels[v] != -1) continue;
mark|                labels[v] = count;
push|                pending.push(v);
            }
        }
next|        ++count;
    }
return|    return labels;
}`,`from collections import deque

def connected_components(adj):
size|    n = len(adj)
init|    labels = [-1] * n
count|    count = 0
outer|    for start in range(n):
skip|        if labels[start] != -1: continue
queue|        pending = deque()
markStart|        labels[start] = count
pushStart|        pending.append(start)
loop|        while pending:
front|            u = pending[0]
pop|            pending.popleft()
edge|            for v in adj[u]:
seen|                if labels[v] != -1: continue
mark|                labels[v] = count
push|                pending.append(v)
next|        count += 1
return|    return labels`,`static int[] connectedComponents(int[][] adj) {
size|    int n = adj.length;
init|    int[] labels = new int[n]; Arrays.fill(labels, -1);
count|    int count = 0;
outer|    for (int start = 0; start < n; ++start) {
skip|        if (labels[start] != -1) continue;
queue|        ArrayDeque<Integer> pending = new ArrayDeque<>();
markStart|        labels[start] = count;
pushStart|        pending.addLast(start);
loop|        while (!pending.isEmpty()) {
front|            int u = pending.peekFirst();
pop|            pending.removeFirst();
edge|            for (int v : adj[u]) {
seen|                if (labels[v] != -1) continue;
mark|                labels[v] = count;
push|                pending.addLast(v);
            }
        }
next|        ++count;
    }
return|    return labels;
}`);
})(AlgoLab);
