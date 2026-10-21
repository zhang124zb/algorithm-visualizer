(function(L){
  'use strict';
  L.addCode('interval-scheduling',`def select_intervals(a):
sort|    a.sort(key=lambda interval: interval[1])
init|    end, answer = float('-inf'), 0
loop|    for i in range(len(a)):
test|        if a[i][0] >= end:
end|            end = a[i][1]
count|            answer += 1
return|    return answer`,
`static int selectIntervals(int[][] a) {
sort|    Arrays.sort(a, Comparator.comparingInt(interval -> interval[1]));
init|    int end = Integer.MIN_VALUE, answer = 0;
loop|    for (int i = 0; i < a.length; i++) {
test|        if (a[i][0] >= end) {
end|            end = a[i][1];
count|            answer++;
        }
    }
return|    return answer;
}`);
  L.addCode('interval-cover',`def cover(a, target):
sort|    a.sort()
init|    current, i, count = 0, 0, 0
outer|    while current < target:
best|        farthest, chosen = current, -1
inner|        while i < len(a) and a[i][0] <= current:
test|            if a[i][1] > farthest:
update|                farthest, chosen = a[i][1], i
advance|            i += 1
fail|        if farthest == current: return -1
extend|        current = farthest
count|        count += 1
return|    return count`,
`static int cover(int[][] a, int target) {
sort|    Arrays.sort(a, Comparator.comparingInt((int[] x) -> x[0]).thenComparingInt(x -> x[1]));
init|    int current = 0, i = 0, count = 0;
outer|    while (current < target) {
best|        int farthest = current, chosen = -1;
inner|        while (i < a.length && a[i][0] <= current) {
test|            if (a[i][1] > farthest) {
update|                farthest = a[i][1]; chosen = i;
            }
advance|            i++;
        }
fail|        if (farthest == current) return -1;
extend|        current = farthest;
count|        count++;
    }
return|    return count;
}`);
  L.addCode('optimal-merge',`import heapq

def optimal_merge(a):
init|    q = a.copy(); heapq.heapify(q)
cost|    cost = 0
loop|    while len(q) > 1:
first|        x = heapq.heappop(q)
second|        y = heapq.heappop(q)
add|        cost += x + y
push|        heapq.heappush(q, x + y)
return|    return cost`,
`static int optimalMerge(int[] a) {
init|    PriorityQueue<Integer> q = new PriorityQueue<>(); for (int x : a) q.add(x);
cost|    int cost = 0;
loop|    while (q.size() > 1) {
first|        int x = q.remove();
second|        int y = q.remove();
add|        cost += x + y;
push|        q.add(x + y);
    }
return|    return cost;
}`);
})(AlgoLab);
