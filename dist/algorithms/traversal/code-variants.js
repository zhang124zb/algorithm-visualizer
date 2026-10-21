(function(L){
  'use strict';
  L.addCode('bfs',`from collections import deque

def bfs(adj, start):
init|    visited = [False] * len(adj)
output|    order = []
queue|    q = deque()
mark|    visited[start] = True
push|    q.append(start)
loop|    while q:
pop|        u = q.popleft()
visit|        order.append(u)
neighbors|        for v in adj[u]:
test|            if not visited[v]:
seen|                visited[v] = True
enqueue|                q.append(v)
return|    return order`,
`static List<Integer> bfs(List<List<Integer>> adj, int start) {
init|    boolean[] visited = new boolean[adj.size()];
output|    List<Integer> order = new ArrayList<>();
queue|    Deque<Integer> q = new ArrayDeque<>();
mark|    visited[start] = true;
push|    q.addLast(start);
loop|    while (!q.isEmpty()) {
pop|        int u = q.removeFirst();
visit|        order.add(u);
neighbors|        for (int v : adj.get(u)) {
test|            if (!visited[v]) {
seen|                visited[v] = true;
enqueue|                q.addLast(v);
            }
        }
    }
return|    return order;
}`);
  L.addCode('dfs',`def dfs(u, adj, visited, order):
mark|    visited[u] = True
visit|    order.append(u)
loop|    for v in adj[u]:
test|        if not visited[v]:
recurse|            dfs(v, adj, visited, order)`,
`static void dfs(int u, List<List<Integer>> adj, boolean[] visited, List<Integer> order) {
mark|    visited[u] = true;
visit|    order.add(u);
loop|    for (int v : adj.get(u)) {
test|        if (!visited[v]) {
recurse|            dfs(v, adj, visited, order);
        }
    }
}`);
  L.addCode('permutations',`def permute(a, used, path, result):
complete|    if len(path) == len(a):
save|        result.append(path.copy())
return|        return
loop|    for i in range(len(a)):
skip|        if used[i]: continue
mark|        used[i] = True
choose|        path.append(a[i])
recurse|        permute(a, used, path, result)
undo|        path.pop()
unmark|        used[i] = False`,
`static void permute(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> result) {
complete|    if (path.size() == a.length) {
save|        result.add(new ArrayList<>(path));
return|        return;
    }
loop|    for (int i = 0; i < a.length; i++) {
skip|        if (used[i]) continue;
mark|        used[i] = true;
choose|        path.add(a[i]);
recurse|        permute(a, used, path, result);
undo|        path.remove(path.size() - 1);
unmark|        used[i] = false;
    }
}`);
  L.addCode('maze',`from collections import deque

def maze(grid):
size|    n, m = len(grid), len(grid[0])
init|    seen = [[False] * m for _ in range(n)]
parent|    parent = {}
queue|    q = deque()
start|    q.append((0, 0)); seen[0][0] = True
directions|    dirs = [(1, 0), (0, 1), (-1, 0), (0, -1)]
loop|    while q:
pop|        x, y = q.popleft()
goal|        if x == n - 1 and y == m - 1: break
neighbors|        for dx, dy in dirs:
next|            nx, ny = x + dx, y + dy
test|            if not (0 <= nx < n and 0 <= ny < m) or grid[nx][ny] or seen[nx][ny]: continue
mark|            seen[nx][ny] = True
save|            parent[nx, ny] = (x, y)
push|            q.append((nx, ny))
path|    path = []
fail|    if not seen[n - 1][m - 1]: return path
    p = (n - 1, m - 1)
back|    while True:
record|        path.append(p)
stop|        if p == (0, 0): break
        p = parent[p]
reverse|    path.reverse()
return|    return path`,
`static List<int[]> maze(int[][] grid) {
size|    int n = grid.length, m = grid[0].length;
init|    boolean[][] seen = new boolean[n][m];
parent|    int[][][] parent = new int[n][m][2];
queue|    Deque<int[]> q = new ArrayDeque<>();
start|    q.addLast(new int[]{0, 0}); seen[0][0] = true;
directions|    int[][] dirs = {{1,0},{0,1},{-1,0},{0,-1}};
loop|    while (!q.isEmpty()) {
pop|        int[] cell = q.removeFirst(); int x = cell[0], y = cell[1];
goal|        if (x == n - 1 && y == m - 1) break;
neighbors|        for (int[] dir : dirs) {
next|            int nx = x + dir[0], ny = y + dir[1];
test|            if (nx < 0 || nx >= n || ny < 0 || ny >= m || grid[nx][ny] != 0 || seen[nx][ny]) continue;
mark|            seen[nx][ny] = true;
save|            parent[nx][ny] = new int[]{x, y};
push|            q.addLast(new int[]{nx, ny});
        }
    }
path|    List<int[]> path = new ArrayList<>();
fail|    if (!seen[n-1][m-1]) return path;
back|    for (int[] p = {n-1, m-1}; ; p = parent[p[0]][p[1]]) {
record|        path.add(p.clone());
stop|        if (p[0] == 0 && p[1] == 0) break;
    }
reverse|    Collections.reverse(path);
return|    return path;
}`);
  L.addCode('n-queens',`def safe(row, c, col):
previous|    for r in range(row):
conflict|        if col[r] == c or abs(col[r] - c) == row - r: return False
valid|    return True

def queens(row, col, solutions):
complete|    if row == len(col):
save|        solutions.append(col.copy())
return|        return
loop|    for c in range(len(col)):
test|        if not safe(row, c, col): continue
place|        col[row] = c
recurse|        queens(row + 1, col, solutions)
remove|        col[row] = -1`,
`static boolean safe(int row, int c, int[] col) {
previous|    for (int r = 0; r < row; r++) {
conflict|        if (col[r] == c || Math.abs(col[r] - c) == row - r) return false;
    }
valid|    return true;
}
static void queens(int row, int[] col, List<int[]> solutions) {
complete|    if (row == col.length) {
save|        solutions.add(col.clone());
return|        return;
    }
loop|    for (int c = 0; c < col.length; c++) {
test|        if (!safe(row, c, col)) continue;
place|        col[row] = c;
recurse|        queens(row + 1, col, solutions);
remove|        col[row] = -1;
    }
}`);
})(AlgoLab);

(function(L) {
  'use strict';
  L.addLesson('pruning',`bool subsetDfs(const vector<int>& a, const vector<int>& suffix,
               int i, int sum, int target) {
goal|    if (sum == target) {
success|        return true;
    }
over|    if (sum > target) {
overReturn|        return false;
    }
end|    if (i == (int)a.size()) {
endReturn|        return false;
    }
shortage|    if (sum + suffix[i] < target) {
shortReturn|        return false;
    }
include|    bool take = subsetDfs(a, suffix, i + 1, sum + a[i], target);
checkTake|    if (take) {
takeReturn|        return true;
    }
exclude|    return subsetDfs(a, suffix, i + 1, sum, target);
}
bool subsetSum(vector<int> a, int target) {
suffix|    vector<int> suffix(a.size() + 1, 0);
build|    for (int i = (int)a.size() - 1; i >= 0; --i) {
sumSuffix|        suffix[i] = suffix[i + 1] + a[i];
    }
start|    return subsetDfs(a, suffix, 0, 0, target);
}`,`def subset_dfs(a, suffix, i, total, target):
goal|    if total == target:
success|        return True
over|    if total > target:
overReturn|        return False
end|    if i == len(a):
endReturn|        return False
shortage|    if total + suffix[i] < target:
shortReturn|        return False
include|    take = subset_dfs(a, suffix, i + 1, total + a[i], target)
checkTake|    if take:
takeReturn|        return True
exclude|    return subset_dfs(a, suffix, i + 1, total, target)

def subset_sum(a, target):
suffix|    suffix = [0] * (len(a) + 1)
build|    for i in range(len(a) - 1, -1, -1):
sumSuffix|        suffix[i] = suffix[i + 1] + a[i]
start|    return subset_dfs(a, suffix, 0, 0, target)`,`static boolean subsetDfs(int[] a, int[] suffix,
                         int i, int sum, int target) {
goal|    if (sum == target) {
success|        return true;
    }
over|    if (sum > target) {
overReturn|        return false;
    }
end|    if (i == a.length) {
endReturn|        return false;
    }
shortage|    if (sum + suffix[i] < target) {
shortReturn|        return false;
    }
include|    boolean take = subsetDfs(a, suffix, i + 1, sum + a[i], target);
checkTake|    if (take) {
takeReturn|        return true;
    }
exclude|    return subsetDfs(a, suffix, i + 1, sum, target);
}
static boolean subsetSum(int[] a, int target) {
suffix|    int[] suffix = new int[a.length + 1];
build|    for (int i = a.length - 1; i >= 0; --i) {
sumSuffix|        suffix[i] = suffix[i + 1] + a[i];
    }
start|    return subsetDfs(a, suffix, 0, 0, target);
}`);

  L.addLesson('memo-search',`int fibSearch(int n, vector<int>& memo) {
cached|    if (memo[n] != -1) {
hit|        return memo[n];
    }
base|    if (n <= 1) {
seed|        memo[n] = n;
    } else {
left|        int left = fibSearch(n - 1, memo);
right|        int right = fibSearch(n - 2, memo);
store|        memo[n] = left + right;
    }
return|    return memo[n];
}
int memoFib(int n) {
init|    vector<int> memo(n + 1, -1);
start|    return fibSearch(n, memo);
}`,`def fib_search(n, memo):
cached|    if memo[n] != -1:
hit|        return memo[n]
base|    if n <= 1:
seed|        memo[n] = n
    else:
left|        left = fib_search(n - 1, memo)
right|        right = fib_search(n - 2, memo)
store|        memo[n] = left + right
return|    return memo[n]

def memo_fib(n):
init|    memo = [-1] * (n + 1)
start|    return fib_search(n, memo)`,`static int fibSearch(int n, int[] memo) {
cached|    if (memo[n] != -1) {
hit|        return memo[n];
    }
base|    if (n <= 1) {
seed|        memo[n] = n;
    } else {
left|        int left = fibSearch(n - 1, memo);
right|        int right = fibSearch(n - 2, memo);
store|        memo[n] = left + right;
    }
return|    return memo[n];
}
static int memoFib(int n) {
init|    int[] memo = new int[n + 1]; Arrays.fill(memo, -1);
start|    return fibSearch(n, memo);
}`);
})(AlgoLab);
