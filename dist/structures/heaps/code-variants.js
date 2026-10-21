(function(L){
  'use strict';
  for(const id of ['max-heap','min-heap']){
    const max=id==='max-heap',better=max?'>':'<',ordered=max?'>=':'<=';
    L.addCode(id,`def down(a, u):
downLoop|    while 2 * u + 1 < len(a):
child|        v = 2 * u + 1
choose|        if v + 1 < len(a) and a[v + 1] ${better} a[v]: v += 1
stop|        if a[u] ${ordered} a[v]: break
swapDown|        a[u], a[v] = a[v], a[u]
descend|        u = v

def demo(a, value):
    a = a.copy()
build|    for u in range(len(a) // 2 - 1, -1, -1):
adjust|        down(a, u)
insert|    a.append(value)
last|    u = len(a) - 1
upLoop|    while u > 0:
parent|        p = (u - 1) // 2
upStop|        if a[p] ${ordered} a[u]: break
swapUp|        a[p], a[u] = a[u], a[p]
ascend|        u = p
read|    removed = a[0]
replace|    a[0] = a[-1]
pop|    a.pop()
repair|    down(a, 0)
return|    return a`,
`static void down(List<Integer> a, int u) {
downLoop|    while (2 * u + 1 < a.size()) {
child|        int v = 2 * u + 1;
choose|        if (v + 1 < a.size() && a.get(v + 1) ${better} a.get(v)) v++;
stop|        if (a.get(u) ${ordered} a.get(v)) break;
swapDown|        Collections.swap(a, u, v);
descend|        u = v;
    }
}
static List<Integer> demo(List<Integer> a, int value) {
    a = new ArrayList<>(a);
build|    for (int u = a.size() / 2 - 1; u >= 0; u--) {
adjust|        down(a, u);
    }
insert|    a.add(value);
last|    int u = a.size() - 1;
upLoop|    while (u > 0) {
parent|        int p = (u - 1) / 2;
upStop|        if (a.get(p) ${ordered} a.get(u)) break;
swapUp|        Collections.swap(a, p, u);
ascend|        u = p;
    }
read|    int removed = a.get(0);
replace|    a.set(0, a.get(a.size() - 1));
pop|    a.remove(a.size() - 1);
repair|    down(a, 0);
return|    return a;
}`);
  }
})(AlgoLab);
