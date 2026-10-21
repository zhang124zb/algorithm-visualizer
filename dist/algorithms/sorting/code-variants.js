(function(L){
  'use strict';
  L.addCode('bubble-sort',`def bubble_sort(a):
outer|    for end in range(len(a) - 1, 0, -1):
inner|        for j in range(end):
compare|            if a[j] > a[j + 1]:
swap|                a[j], a[j + 1] = a[j + 1], a[j]`,
`static void bubbleSort(List<Integer> a) {
outer|    for (int end = a.size() - 1; end > 0; end--) {
inner|        for (int j = 0; j < end; j++) {
compare|            if (a.get(j) > a.get(j + 1)) {
swap|                Collections.swap(a, j, j + 1);
            }
        }
    }
}`);
  L.addCode('selection-sort',`def selection_sort(a):
outer|    for i in range(len(a)):
init|        best = i
inner|        for j in range(i + 1, len(a)):
compare|            if a[j] < a[best]:
best|                best = j
swap|        a[i], a[best] = a[best], a[i]`,
`static void selectionSort(List<Integer> a) {
outer|    for (int i = 0; i < a.size(); i++) {
init|        int best = i;
inner|        for (int j = i + 1; j < a.size(); j++) {
compare|            if (a.get(j) < a.get(best)) {
best|                best = j;
            }
        }
swap|        Collections.swap(a, i, best);
    }
}`);
  L.addCode('insertion-sort',`def insertion_sort(a):
outer|    for i in range(1, len(a)):
key|        key = a[i]
init|        j = i - 1
loop|        while j >= 0 and a[j] > key:
move|            a[j + 1] = a[j]
back|            j -= 1
insert|        a[j + 1] = key`,
`static void insertionSort(List<Integer> a) {
outer|    for (int i = 1; i < a.size(); i++) {
key|        int key = a.get(i);
init|        int j = i - 1;
loop|        while (j >= 0 && a.get(j) > key) {
move|            a.set(j + 1, a.get(j));
back|            j--;
        }
insert|        a.set(j + 1, key);
    }
}`);
  L.addCode('merge-sort',`def merge_sort(a, l, r):
base|    if l >= r: return
mid|    m = l + (r - l) // 2
left|    merge_sort(a, l, m)
right|    merge_sort(a, m + 1, r)
temp|    b = []
init|    i, j = l, m + 1
loop|    while i <= m or j <= r:
compare|        if j > r or (i <= m and a[i] <= a[j]):
takeLeft|            b.append(a[i]); i += 1
        else:
takeRight|            b.append(a[j]); j += 1
copyLoop|    for k in range(len(b)):
copy|        a[l + k] = b[k]`,
`static void mergeSort(List<Integer> a, int l, int r) {
base|    if (l >= r) return;
mid|    int m = l + (r - l) / 2;
left|    mergeSort(a, l, m);
right|    mergeSort(a, m + 1, r);
temp|    List<Integer> b = new ArrayList<>();
init|    int i = l, j = m + 1;
loop|    while (i <= m || j <= r) {
compare|        if (j > r || (i <= m && a.get(i) <= a.get(j))) {
takeLeft|            b.add(a.get(i++));
        } else {
takeRight|            b.add(a.get(j++));
        }
    }
copyLoop|    for (int k = 0; k < b.size(); k++) {
copy|        a.set(l + k, b.get(k));
    }
}`);
  L.addCode('quick-sort',`def quick_sort(a, l, r):
base|    if l >= r: return
pivot|    pivot = a[r]
init|    i = l
loop|    for j in range(l, r):
compare|        if a[j] < pivot:
swap|            a[i], a[j] = a[j], a[i]
advance|            i += 1
place|    a[i], a[r] = a[r], a[i]
left|    quick_sort(a, l, i - 1)
right|    quick_sort(a, i + 1, r)`,
`static void quickSort(List<Integer> a, int l, int r) {
base|    if (l >= r) return;
pivot|    int pivot = a.get(r);
init|    int i = l;
loop|    for (int j = l; j < r; j++) {
compare|        if (a.get(j) < pivot) {
swap|            Collections.swap(a, i, j);
advance|            i++;
        }
    }
place|    Collections.swap(a, i, r);
left|    quickSort(a, l, i - 1);
right|    quickSort(a, i + 1, r);
}`);
  L.addCode('heap-sort',`def sift_down(a, n, u):
loop|    while 2 * u + 1 < n:
child|        v = 2 * u + 1
choose|        if v + 1 < n and a[v + 1] > a[v]: v += 1
stop|        if a[u] >= a[v]: break
swap|        a[u], a[v] = a[v], a[u]
down|        u = v

def heap_sort(a):
build|    for u in range(len(a) // 2 - 1, -1, -1):
adjust|        sift_down(a, len(a), u)
outer|    for end in range(len(a) - 1, 0, -1):
extract|        a[0], a[end] = a[end], a[0]
repair|        sift_down(a, end, 0)`,
`static void siftDown(List<Integer> a, int n, int u) {
loop|    while (2 * u + 1 < n) {
child|        int v = 2 * u + 1;
choose|        if (v + 1 < n && a.get(v + 1) > a.get(v)) v++;
stop|        if (a.get(u) >= a.get(v)) break;
swap|        Collections.swap(a, u, v);
down|        u = v;
    }
}
static void heapSort(List<Integer> a) {
build|    for (int u = a.size() / 2 - 1; u >= 0; u--) {
adjust|        siftDown(a, a.size(), u);
    }
outer|    for (int end = a.size() - 1; end > 0; end--) {
extract|        Collections.swap(a, 0, end);
repair|        siftDown(a, end, 0);
    }
}`);
  L.addCode('counting-sort',`def counting_sort(a):
maximum|    maximum = max(a, default=0)
init|    count = [0] * (maximum + 1)
loop|    for x in a:
count|        count[x] += 1
index|    k = 0
values|    for x in range(maximum + 1):
repeat|        while count[x] > 0:
write|            a[k] = x; k += 1
decrease|            count[x] -= 1`,
`static void countingSort(List<Integer> a) {
maximum|    int maximum = a.isEmpty() ? 0 : Collections.max(a);
init|    int[] count = new int[maximum + 1];
loop|    for (int x : a) {
count|        count[x]++;
    }
index|    int k = 0;
values|    for (int x = 0; x <= maximum; x++) {
repeat|        while (count[x] > 0) {
write|            a.set(k++, x);
decrease|            count[x]--;
        }
    }
}`);
})(AlgoLab);
