(function(L) {
  'use strict';
  L.addLesson('enumeration',`vector<int> enumeratePair(vector<int> a, int target) {
outer|    for (int i = 0; i < (int)a.size(); ++i) {
inner|        for (int j = i + 1; j < (int)a.size(); ++j) {
sum|            int sum = a[i] + a[j];
match|            if (sum == target) {
found|                return {i, j};
            }
        }
    }
missing|    return {-1, -1};
}`,`def enumerate_pair(a, target):
outer|    for i in range(len(a)):
inner|        for j in range(i + 1, len(a)):
sum|            total = a[i] + a[j]
match|            if total == target:
found|                return [i, j]
missing|    return [-1, -1]`,`static int[] enumeratePair(int[] a, int target) {
outer|    for (int i = 0; i < a.length; ++i) {
inner|        for (int j = i + 1; j < a.length; ++j) {
sum|            int sum = a[i] + a[j];
match|            if (sum == target) {
found|                return new int[]{i, j};
            }
        }
    }
missing|    return new int[]{-1, -1};
}`);

  L.addLesson('simulation',`vector<int> roundRobin(vector<int> a, int quantum) {
remaining|    vector<int> remain = a;
queue|    queue<int> q;
order|    vector<int> order;
clock|    int time = 0;
seed|    for (int i = 0; i < (int)a.size(); ++i) {
enqueue|        q.push(i);
    }
loop|    while (!q.empty()) {
pop|        int u = q.front(); q.pop();
slice|        int used = min(quantum, remain[u]);
consume|        remain[u] -= used;
advance|        time += used;
finished|        if (remain[u] == 0) {
complete|            order.push_back(u);
        } else {
requeue|            q.push(u);
        }
    }
return|    return order;
}`,`from collections import deque

def round_robin(a, quantum):
remaining|    remain = a.copy()
queue|    q = deque()
order|    order = []
clock|    time = 0
seed|    for i in range(len(a)):
enqueue|        q.append(i)
loop|    while q:
pop|        u = q.popleft()
slice|        used = min(quantum, remain[u])
consume|        remain[u] -= used
advance|        time += used
finished|        if remain[u] == 0:
complete|            order.append(u)
        else:
requeue|            q.append(u)
return|    return order`,`static int[] roundRobin(int[] a, int quantum) {
remaining|    int[] remain = a.clone();
queue|    Deque<Integer> q = new ArrayDeque<>();
order|    List<Integer> order = new ArrayList<>();
clock|    int time = 0;
seed|    for (int i = 0; i < a.length; ++i) {
enqueue|        q.addLast(i);
    }
loop|    while (!q.isEmpty()) {
pop|        int u = q.removeFirst();
slice|        int used = Math.min(quantum, remain[u]);
consume|        remain[u] -= used;
advance|        time += used;
finished|        if (remain[u] == 0) {
complete|            order.add(u);
        } else {
requeue|            q.addLast(u);
        }
    }
return|    return order.stream().mapToInt(Integer::intValue).toArray();
}`);

  L.addLesson('recursion',`int factorial(int n) {
base|    if (n <= 1) {
one|        return 1;
    }
recurse|    int child = factorial(n - 1);
multiply|    int answer = n * child;
return|    return answer;
}`,`def factorial(n):
base|    if n <= 1:
one|        return 1
recurse|    child = factorial(n - 1)
multiply|    answer = n * child
return|    return answer`,`static int factorial(int n) {
base|    if (n <= 1) {
one|        return 1;
    }
recurse|    int child = factorial(n - 1);
multiply|    int answer = n * child;
return|    return answer;
}`);

  L.addLesson('divide-conquer',`int maxRange(const vector<int>& a, int l, int r) {
base|    if (r - l == 1) {
leaf|        return a[l];
    }
split|    int mid = l + (r - l) / 2;
left|    int left = maxRange(a, l, mid);
right|    int right = maxRange(a, mid, r);
merge|    int answer = max(left, right);
result|    return answer;
}
int divideMax(vector<int> a) {
start|    return maxRange(a, 0, (int)a.size());
}`,`def max_range(a, l, r):
base|    if r - l == 1:
leaf|        return a[l]
split|    mid = l + (r - l) // 2
left|    left = max_range(a, l, mid)
right|    right = max_range(a, mid, r)
merge|    answer = max(left, right)
result|    return answer

def divide_max(a):
start|    return max_range(a, 0, len(a))`,`static int maxRange(int[] a, int l, int r) {
base|    if (r - l == 1) {
leaf|        return a[l];
    }
split|    int mid = l + (r - l) / 2;
left|    int left = maxRange(a, l, mid);
right|    int right = maxRange(a, mid, r);
merge|    int answer = Math.max(left, right);
result|    return answer;
}
static int divideMax(int[] a) {
start|    return maxRange(a, 0, a.length);
}`);
})(AlgoLab);
