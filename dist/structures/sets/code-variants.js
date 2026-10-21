(function(L){
  'use strict';
  L.addLesson('dsu-size',`int findRoot(int x, vector<int>& parent) {
root|    if (parent[x] == x) return x;
recurse|    int root = findRoot(parent[x], parent);
compress|    parent[x] = root;
returnRoot|    return root;
}
vector<int> dsuSize(int n, vector<vector<int>> edges) {
init|    vector<int> parent(n), size(n, 1); iota(parent.begin(), parent.end(), 0);
loop|    for (const auto& edge : edges) {
first|        int a = findRoot(edge[0], parent);
second|        int b = findRoot(edge[1], parent);
same|        if (a == b) continue;
compare|        if (size[a] < size[b]) {
swap|            swap(a, b);
        }
attach|        parent[b] = a;
increase|        size[a] += size[b];
    }
output|    vector<int> result(n);
collect|    for (int i = 0; i < n; ++i) {
write|        result[i] = findRoot(i, parent);
    }
return|    return result;
}`,`def find_root(x, parent):
root|    if parent[x] == x: return x
recurse|    root = find_root(parent[x], parent)
compress|    parent[x] = root
returnRoot|    return root

def dsu_size(n, edges):
init|    parent = list(range(n)); size = [1] * n
loop|    for u, v in edges:
first|        a = find_root(u, parent)
second|        b = find_root(v, parent)
same|        if a == b: continue
compare|        if size[a] < size[b]:
swap|            a, b = b, a
attach|        parent[b] = a
increase|        size[a] += size[b]
output|    result = [0] * n
collect|    for i in range(n):
write|        result[i] = find_root(i, parent)
return|    return result`,`static int findRoot(int x, int[] parent) {
root|    if (parent[x] == x) return x;
recurse|    int root = findRoot(parent[x], parent);
compress|    parent[x] = root;
returnRoot|    return root;
}
static int[] dsuSize(int n, int[][] edges) {
init|    int[] parent = new int[n], size = new int[n]; for (int i = 0; i < n; ++i) { parent[i] = i; size[i] = 1; }
loop|    for (int[] edge : edges) {
first|        int a = findRoot(edge[0], parent);
second|        int b = findRoot(edge[1], parent);
same|        if (a == b) continue;
compare|        if (size[a] < size[b]) {
swap|            int temp = a; a = b; b = temp;
        }
attach|        parent[b] = a;
increase|        size[a] += size[b];
    }
output|    int[] result = new int[n];
collect|    for (int i = 0; i < n; ++i) {
write|        result[i] = findRoot(i, parent);
    }
return|    return result;
}`);
})(AlgoLab);
