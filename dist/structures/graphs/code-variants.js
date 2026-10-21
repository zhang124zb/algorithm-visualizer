(function(L){
  'use strict';
  L.addCode('adjacency-matrix',`def build(n, edges):
init|    matrix = [[0] * n for _ in range(n)]
loop|    for u, v in edges:
forward|        matrix[u][v] = 1
back|        matrix[v][u] = 1
return|    return matrix`,
`static int[][] build(int n, int[][] edges) {
init|    int[][] matrix = new int[n][n];
loop|    for (int[] edge : edges) {
        int u = edge[0], v = edge[1];
forward|        matrix[u][v] = 1;
back|        matrix[v][u] = 1;
    }
return|    return matrix;
}`);
  L.addCode('adjacency-list',`def build(n, edges):
init|    adj = [[] for _ in range(n)]
loop|    for u, v in edges:
forward|        adj[u].append(v)
back|        adj[v].append(u)
return|    return adj`,
`static List<List<Integer>> build(int n, int[][] edges) {
init|    List<List<Integer>> adj = new ArrayList<>(); for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
loop|    for (int[] edge : edges) {
        int u = edge[0], v = edge[1];
forward|        adj.get(u).add(v);
back|        adj.get(v).add(u);
    }
return|    return adj;
}`);
})(AlgoLab);
