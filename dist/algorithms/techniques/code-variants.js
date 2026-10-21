(function(L){
  'use strict';
  L.addCode('prefix-sum',`def range_sum(a, left, right):
init|    prefix = [0] * (len(a) + 1)
loop|    for i in range(len(a)):
add|        prefix[i + 1] = prefix[i] + a[i]
query|    return prefix[right + 1] - prefix[left]`,
`static int rangeSum(int[] a, int left, int right) {
init|    int[] prefix = new int[a.length + 1];
loop|    for (int i = 0; i < a.length; i++) {
add|        prefix[i + 1] = prefix[i] + a[i];
    }
query|    return prefix[right + 1] - prefix[left];
}`);
  L.addCode('difference',`def range_add(a, l, r, delta):
init|    d = [0] * (len(a) + 1)
loop|    for i in range(len(a)):
diff|        d[i] = a[i] - (0 if i == 0 else a[i - 1])
left|    d[l] += delta
right|    d[r + 1] -= delta
restore|    for i in range(len(a)):
sum|        a[i] = d[i] + (0 if i == 0 else a[i - 1])
return|    return a`,
`static int[] rangeAdd(int[] a, int l, int r, int delta) {
init|    int[] d = new int[a.length + 1];
loop|    for (int i = 0; i < a.length; i++) {
diff|        d[i] = a[i] - (i == 0 ? 0 : a[i - 1]);
    }
left|    d[l] += delta;
right|    d[r + 1] -= delta;
restore|    for (int i = 0; i < a.length; i++) {
sum|        a[i] = d[i] + (i == 0 ? 0 : a[i - 1]);
    }
return|    return a;
}`);
  L.addCode('two-pointers',`def pair_sum(a, target):
init|    left, right = 0, len(a) - 1
loop|    while left < right:
sum|        total = a[left] + a[right]
equal|        if total == target: return [left, right]
less|        if total < target:
left|            left += 1
        else:
right|            right -= 1
missing|    return [-1, -1]`,
`static int[] pairSum(int[] a, int target) {
init|    int left = 0, right = a.length - 1;
loop|    while (left < right) {
sum|        int sum = a[left] + a[right];
equal|        if (sum == target) return new int[]{left, right};
less|        if (sum < target) {
left|            left++;
        } else {
right|            right--;
        }
    }
missing|    return new int[]{-1, -1};
}`);
  L.addCode('sliding-window',`def max_window_sum(a, k):
init|    total, best = 0, float('-inf')
loop|    for i in range(len(a)):
add|        total += a[i]
test|        if i >= k:
remove|            total -= a[i - k]
full|        if i >= k - 1:
best|            best = max(best, total)
return|    return best`,
`static int maxWindowSum(int[] a, int k) {
init|    int sum = 0, best = Integer.MIN_VALUE;
loop|    for (int i = 0; i < a.length; i++) {
add|        sum += a[i];
test|        if (i >= k) {
remove|            sum -= a[i - k];
        }
full|        if (i >= k - 1) {
best|            best = Math.max(best, sum);
        }
    }
return|    return best;
}`);
})(AlgoLab);
