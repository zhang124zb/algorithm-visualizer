(function(L){
  'use strict';
  L.addCode('recurrence',`def fibonacci(n):
init|    f = [0] * (n + 1)
base|    if n >= 1: f[1] = 1
loop|    for i in range(2, n + 1):
add|        f[i] = f[i - 1] + f[i - 2]
return|    return f[n]`,
`static int fibonacci(int n) {
init|    int[] f = new int[n + 1];
base|    if (n >= 1) f[1] = 1;
loop|    for (int i = 2; i <= n; i++) {
add|        f[i] = f[i - 1] + f[i - 2];
    }
return|    return f[n];
}`);
  L.addCode('knapsack',`def knapsack(weight, value, capacity):
init|    dp = [0] * (capacity + 1)
items|    for i in range(len(weight)):
loop|        for c in range(capacity, weight[i] - 1, -1):
update|            dp[c] = max(dp[c], dp[c - weight[i]] + value[i])
return|    return dp[capacity]`,
`static int knapsack(int[] weight, int[] value, int capacity) {
init|    int[] dp = new int[capacity + 1];
items|    for (int i = 0; i < weight.length; i++) {
loop|        for (int c = capacity; c >= weight[i]; c--) {
update|            dp[c] = Math.max(dp[c], dp[c - weight[i]] + value[i]);
        }
    }
return|    return dp[capacity];
}`);
  L.addCode('lis',`def lis(a):
init|    dp = [1] * len(a)
answer|    answer = 0
outer|    for i in range(len(a)):
inner|        for j in range(i):
test|            if a[j] < a[i]:
update|                dp[i] = max(dp[i], dp[j] + 1)
best|        answer = max(answer, dp[i])
return|    return answer`,
`static int lis(int[] a) {
init|    int[] dp = new int[a.length]; Arrays.fill(dp, 1);
answer|    int answer = 0;
outer|    for (int i = 0; i < a.length; i++) {
inner|        for (int j = 0; j < i; j++) {
test|            if (a[j] < a[i]) {
update|                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
best|        answer = Math.max(answer, dp[i]);
    }
return|    return answer;
}`);
  L.addCode('lcs',`def lcs(a, b):
init|    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
outer|    for i in range(1, len(a) + 1):
inner|        for j in range(1, len(b) + 1):
test|            if a[i - 1] == b[j - 1]:
match|                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
inherit|                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
return|    return dp[len(a)][len(b)]`,
`static int lcs(String a, String b) {
init|    int[][] dp = new int[a.length() + 1][b.length() + 1];
outer|    for (int i = 1; i <= a.length(); i++) {
inner|        for (int j = 1; j <= b.length(); j++) {
test|            if (a.charAt(i - 1) == b.charAt(j - 1)) {
match|                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
inherit|                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
return|    return dp[a.length()][b.length()];
}`);
  L.addCode('interval-dp',`def merge_stones(a):
init|    n = len(a)
table|    dp = [[0] * n for _ in range(n)]
prefix|    p = [0] * (n + 1)
sumLoop|    for i in range(n): p[i + 1] = p[i] + a[i]
length|    for length in range(2, n + 1):
left|        for l in range(n - length + 1):
right|            r = l + length - 1
infinity|            dp[l][r] = float('inf')
split|            for k in range(l, r):
update|                dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r] + p[r+1] - p[l])
return|    return dp[0][n - 1] if n else 0`,
`static int mergeStones(int[] a) {
init|    int n = a.length;
table|    int[][] dp = new int[n][n];
prefix|    int[] p = new int[n + 1];
sumLoop|    for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
length|    for (int len = 2; len <= n; len++) {
left|        for (int l = 0; l + len <= n; l++) {
right|            int r = l + len - 1;
infinity|            dp[l][r] = Integer.MAX_VALUE;
split|            for (int k = l; k < r; k++) {
update|                dp[l][r] = Math.min(dp[l][r], dp[l][k] + dp[k+1][r] + p[r+1] - p[l]);
            }
        }
    }
return|    return n == 0 ? 0 : dp[0][n - 1];
}`);
})(AlgoLab);

(function(L){
  L.addLesson('grid-paths',`long long gridPaths(vector<vector<int>> grid) {
size|    int rows = grid.size(), cols = grid[0].size();
init|    vector<vector<long long>> dp(rows, vector<long long>(cols, 0));
row|    for (int r = 0; r < rows; ++r) {
col|        for (int c = 0; c < cols; ++c) {
blocked|            if (grid[r][c] == 1) continue;
start|            if (r == 0 && c == 0) {
base|                dp[r][c] = 1;
            } else {
top|                if (r > 0) {
addTop|                    dp[r][c] += dp[r - 1][c];
                }
left|                if (c > 0) {
addLeft|                    dp[r][c] += dp[r][c - 1];
                }
            }
        }
    }
return|    return dp[rows - 1][cols - 1];
}`,`def grid_paths(grid):
size|    rows, cols = len(grid), len(grid[0])
init|    dp = [[0] * cols for _ in range(rows)]
row|    for r in range(rows):
col|        for c in range(cols):
blocked|            if grid[r][c] == 1: continue
start|            if r == 0 and c == 0:
base|                dp[r][c] = 1
            else:
top|                if r > 0:
addTop|                    dp[r][c] += dp[r - 1][c]
left|                if c > 0:
addLeft|                    dp[r][c] += dp[r][c - 1]
return|    return dp[rows - 1][cols - 1]`,`static long gridPaths(int[][] grid) {
size|    int rows = grid.length, cols = grid[0].length;
init|    long[][] dp = new long[rows][cols];
row|    for (int r = 0; r < rows; ++r) {
col|        for (int c = 0; c < cols; ++c) {
blocked|            if (grid[r][c] == 1) continue;
start|            if (r == 0 && c == 0) {
base|                dp[r][c] = 1;
            } else {
top|                if (r > 0) {
addTop|                    dp[r][c] += dp[r - 1][c];
                }
left|                if (c > 0) {
addLeft|                    dp[r][c] += dp[r][c - 1];
                }
            }
        }
    }
return|    return dp[rows - 1][cols - 1];
}`);
  L.addLesson('grid-min-path',`int gridMinPath(vector<vector<int>> grid) {
size|    int rows = grid.size(), cols = grid[0].size();
init|    vector<vector<int>> dp(rows, vector<int>(cols, 0));
row|    for (int r = 0; r < rows; ++r) {
col|        for (int c = 0; c < cols; ++c) {
start|            if (r == 0 && c == 0) {
base|                dp[r][c] = grid[r][c];
firstRow|            } else if (r == 0) {
fromLeft|                dp[r][c] = dp[r][c - 1] + grid[r][c];
firstCol|            } else if (c == 0) {
fromTop|                dp[r][c] = dp[r - 1][c] + grid[r][c];
            } else {
choose|                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c];
            }
        }
    }
return|    return dp[rows - 1][cols - 1];
}`,`def grid_min_path(grid):
size|    rows, cols = len(grid), len(grid[0])
init|    dp = [[0] * cols for _ in range(rows)]
row|    for r in range(rows):
col|        for c in range(cols):
start|            if r == 0 and c == 0:
base|                dp[r][c] = grid[r][c]
firstRow|            elif r == 0:
fromLeft|                dp[r][c] = dp[r][c - 1] + grid[r][c]
firstCol|            elif c == 0:
fromTop|                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
choose|                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
return|    return dp[rows - 1][cols - 1]`,`static int gridMinPath(int[][] grid) {
size|    int rows = grid.length, cols = grid[0].length;
init|    int[][] dp = new int[rows][cols];
row|    for (int r = 0; r < rows; ++r) {
col|        for (int c = 0; c < cols; ++c) {
start|            if (r == 0 && c == 0) {
base|                dp[r][c] = grid[r][c];
firstRow|            } else if (r == 0) {
fromLeft|                dp[r][c] = dp[r][c - 1] + grid[r][c];
firstCol|            } else if (c == 0) {
fromTop|                dp[r][c] = dp[r - 1][c] + grid[r][c];
            } else {
choose|                dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c];
            }
        }
    }
return|    return dp[rows - 1][cols - 1];
}`);
})(AlgoLab);
