(function(L){
  'use strict';
  L.addCode('disjoint-set',`def find(x, parent):
root|    if parent[x] == x: return x
compress|    parent[x] = find(parent[x], parent)
returnRoot|    return parent[x]

def demo(n, pairs, target):
init|    parent = list(range(n))
loop|    for u, v in pairs:
first|        a = find(u, parent)
second|        b = find(v, parent)
test|        if a != b:
union|            parent[a] = b
query|    return find(target, parent)`,
`static int find(int x, int[] parent) {
root|    if (parent[x] == x) return x;
compress|    parent[x] = find(parent[x], parent);
returnRoot|    return parent[x];
}
static int demo(int n, int[][] pairs, int target) {
init|    int[] parent = new int[n]; for (int i = 0; i < n; i++) parent[i] = i;
loop|    for (int[] pair : pairs) {
        int u = pair[0], v = pair[1];
first|        int a = find(u, parent);
second|        int b = find(v, parent);
test|        if (a != b) {
union|            parent[a] = b;
        }
    }
query|    return find(target, parent);
}`);
  L.addCode('fenwick',`def add(bit, i, delta):
addLoop|    while i < len(bit):
add|        bit[i] += delta
up|        i += i & -i

def prefix_sum(bit, i):
zero|    result = 0
sumLoop|    while i > 0:
take|        result += bit[i]
down|        i -= i & -i
return|    return result

def demo(a, index, delta, query):
init|    bit = [0] * (len(a) + 1)
build|    for i in range(len(a)): add(bit, i + 1, a[i])
update|    add(bit, index, delta)
query|    return prefix_sum(bit, query)`,
`static void add(int[] bit, int i, int delta) {
addLoop|    while (i < bit.length) {
add|        bit[i] += delta;
up|        i += i & -i;
    }
}
static int sum(int[] bit, int i) {
zero|    int result = 0;
sumLoop|    while (i > 0) {
take|        result += bit[i];
down|        i -= i & -i;
    }
return|    return result;
}
static int demo(int[] a, int index, int delta, int query) {
init|    int[] bit = new int[a.length + 1];
build|    for (int i = 0; i < a.length; i++) add(bit, i + 1, a[i]);
update|    add(bit, index, delta);
query|    return sum(bit, query);
}`);
  L.addCode('segment-tree',`a, tree = [], []

def build(p, l, r):
leaf|    if l == r:
assign|        tree[p] = a[l]
buildReturn|        return
middle|    m = (l + r) // 2
left|    build(p * 2, l, m)
right|    build(p * 2 + 1, m + 1, r)
merge|    tree[p] = tree[p * 2] + tree[p * 2 + 1]

def update(p, l, r, index, value):
updateLeaf|    if l == r: tree[p] = value; a[l] = value; return
updateMiddle|    m = (l + r) // 2
direction|    if index <= m:
updateLeft|        update(p * 2, l, m, index, value)
    else:
updateRight|        update(p * 2 + 1, m + 1, r, index, value)
repair|    tree[p] = tree[p * 2] + tree[p * 2 + 1]

def query(p, l, r, ql, qr):
outside|    if r < ql or l > qr: return 0
inside|    if ql <= l and r <= qr: return tree[p]
queryMiddle|    m = (l + r) // 2
combine|    return query(p*2, l, m, ql, qr) + query(p*2+1, m+1, r, ql, qr)

def demo(input, index, value, ql, qr):
    global a, tree
init|    a, tree = input.copy(), [0] * (len(input) * 4)
build|    build(1, 0, len(a) - 1)
update|    update(1, 0, len(a) - 1, index, value)
query|    return query(1, 0, len(a) - 1, ql, qr)`,
`static int[] a, tree;
static void build(int p, int l, int r) {
leaf|    if (l == r) {
assign|        tree[p] = a[l];
buildReturn|        return;
    }
middle|    int m = (l + r) / 2;
left|    build(p * 2, l, m);
right|    build(p * 2 + 1, m + 1, r);
merge|    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}
static void update(int p, int l, int r, int index, int value) {
updateLeaf|    if (l == r) { tree[p] = value; a[l] = value; return; }
updateMiddle|    int m = (l + r) / 2;
direction|    if (index <= m) {
updateLeft|        update(p * 2, l, m, index, value);
    } else {
updateRight|        update(p * 2 + 1, m + 1, r, index, value);
    }
repair|    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}
static int query(int p, int l, int r, int ql, int qr) {
outside|    if (r < ql || l > qr) return 0;
inside|    if (ql <= l && r <= qr) return tree[p];
queryMiddle|    int m = (l + r) / 2;
combine|    return query(p*2, l, m, ql, qr) + query(p*2+1, m+1, r, ql, qr);
}
static int demo(int[] input, int index, int value, int ql, int qr) {
init|    a = input.clone(); tree = new int[a.length * 4];
build|    build(1, 0, a.length - 1);
update|    update(1, 0, a.length - 1, index, value);
query|    return query(1, 0, a.length - 1, ql, qr);
}`);
})(AlgoLab);
