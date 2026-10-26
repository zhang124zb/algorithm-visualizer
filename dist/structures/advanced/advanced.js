(function(L){
  'use strict';
  L.register('disjoint-set',(options={})=>{
    const n=7,p=Array.from({length:n},(_,i)=>i),pairs=options.pairs||[[0,1],[1,2],[3,4],[2,4],[5,6],[4,6]],target=options.target??0;
    const t=new L.Trace(`int find(int x, vector<int>& parent) {
root|    if (parent[x] == x) return x;
compress|    parent[x] = find(parent[x], parent);
returnRoot|    return parent[x];
}
int demo(int n, vector<pair<int,int>> pairs, int target) {
init|    vector<int> parent(n); iota(parent.begin(), parent.end(), 0);
loop|    for (auto [u, v] : pairs) {
first|        int a = find(u, parent);
second|        int b = find(v, parent);
test|        if (a != b) {
union|            parent[a] = b;
        }
    }
query|    return find(target, parent);
}`,{n,pairs,target},{});const stack=[];const s=(l,m,v={},active=[])=>t.step(l,m,{parent:p,调用栈:stack.slice(),...v},{kind:'graph',directed:true,nodes:p.map((_,i)=>({id:i,label:String(i),x:12+(i%4)*25,y:i<4?30:75})),edges:p.flatMap((v,i)=>v!==i?[{u:i,v}]:[]),active,aux:[{label:'parent 数组',values:p}],caption:'箭头指向父节点，自身为父节点的节点是集合代表'});function find(x){stack.push(x);s('root','父节点是自身时，这里就是集合代表。',{x},[x]);if(p[x]===x){stack.pop();return x;}s('compress','递归查找代表，返回后把当前节点直接连向代表。',{x},[x]);p[x]=find(p[x]);s('compress','路径压缩：父指针直接指向集合代表。',{x},[x,p[x]]);s('returnRoot','返回压缩后的父节点。',{x},[x]);stack.pop();return p[x];}s('init','每个元素最初都是自己的集合代表。');for(let k=0;;k++){s('loop','读取下一对需要合并的元素。',{k});if(k>=pairs.length)break;const[u,v]=pairs[k];s('first','查找第一个元素所属的集合。',{u,v},[u]);const a=find(u);s('second','查找第二个元素所属的集合。',{u,v,a},[v]);const b=find(v);s('test','只有不同的集合才需要合并。',{u,v,a,b},[a,b]);if(a!==b){p[a]=b;s('union','将一个代表连到另一个代表。',{a,b},[a,b]);}}s('query','最后查询 target 的集合代表，并观察路径压缩。',{target},[target]);const result=find(target);return t.done(result);
  });
  L.register('fenwick',(options={})=>{
    const a=options.values?.slice()||L.numbers(8,1,9),n=a.length,bit=Array(n+1).fill(0),index=options.index??L.rand(1,n),delta=options.delta??L.rand(1,6),query=options.query??L.rand(3,n);
    const t=new L.Trace(`void add(vector<int>& bit, int i, int delta) {
addLoop|    while (i < (int)bit.size()) {
add|        bit[i] += delta;
up|        i += i & -i;
    }
}
int sum(const vector<int>& bit, int i) {
zero|    int result = 0;
sumLoop|    while (i > 0) {
take|        result += bit[i];
down|        i -= i & -i;
    }
return|    return result;
}
int demo(vector<int> a, int index, int delta, int query) {
init|    vector<int> bit(a.size() + 1, 0);
build|    for (int i = 0; i < (int)a.size(); ++i) add(bit, i + 1, a[i]);
update|    add(bit, index, delta);
query|    return sum(bit, query);
}`,{values:a.slice(),index,delta,query},L.array(bit));const s=(l,m,v={},active=[])=>t.step(l,m,{index,delta,query,...v},L.array(bit,active,{pointers:Number.isInteger(v.i)?l==='build'?{'i+1':v.i+1}:{i:v.i}:{},caption:'树状数组使用 1 起始下标；0 号位置不参与计算',aux:[{label:'原数组',values:a}]}));function add(i,d){while(true){s('addLoop','检查更新下标是否仍在数组范围内。',{i,本次增量:d,lowbit:i&-i},[i]);if(i>=bit.length)break;bit[i]+=d;s('add','更新这个节点负责的区间和。',{i,本次增量:d},[i]);i+=i&-i;s('up','加上 lowbit，跳到下一个覆盖该位置的节点。',{i},i<bit.length?[i]:[]);}}s('init','所有树状数组节点初始为零。');for(let i=0;i<n;i++){s('build','将原数组的值逐个加入树状数组。',{i,加入值:a[i]});add(i+1,a[i]);}s('update','对指定位置增加 delta。');add(index,delta);s('query','查询前 query 个元素的和。');let result=0,i=query;s('zero','查询累加结果初始为零。',{result,i});while(true){s('sumLoop','下标归零时，前缀已被完整覆盖。',{result,i},i>0?[i]:[]);if(i<=0)break;result+=bit[i];s('take','累加当前节点管理的区间和。',{result,i},[i]);i-=i&-i;s('down','减去 lowbit，跳到前一个不重叠的区间。',{result,i},i>0?[i]:[]);}s('return','返回前缀和。',{result});return t.done(result);
  });
  L.register('segment-tree',(options={})=>{
    const a=options.values?.slice()||L.numbers(6,1,9),n=a.length,tree=Array(4*n).fill(0),nodes=[],edges=[],index=options.index??L.rand(0,n-1),value=options.value??L.rand(12,20),left=options.left??1,right=options.right??n-2;
    function layout(p,l,r,depth){nodes.push({id:p,label:`[${l},${r}]`,x:8+(l+r)/2*84/Math.max(1,n-1),y:10+depth*24});if(l<r){const m=Math.floor((l+r)/2);edges.push({u:p,v:2*p},{u:p,v:2*p+1});layout(2*p,l,m,depth+1);layout(2*p+1,m+1,r,depth+1);}}layout(1,0,n-1,0);
    const t=new L.Trace(`vector<int> a, tree;
void build(int p, int l, int r) {
leaf|    if (l == r) {
assign|        tree[p] = a[l];
buildReturn|        return;
    }
middle|    int m = (l + r) / 2;
left|    build(p * 2, l, m);
right|    build(p * 2 + 1, m + 1, r);
merge|    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}
void update(int p, int l, int r, int index, int value) {
updateLeaf|    if (l == r) { tree[p] = value; a[l] = value; return; }
updateMiddle|    int m = (l + r) / 2;
direction|    if (index <= m) {
updateLeft|        update(p * 2, l, m, index, value);
    } else {
updateRight|        update(p * 2 + 1, m + 1, r, index, value);
    }
repair|    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}
int query(int p, int l, int r, int ql, int qr) {
outside|    if (r < ql || l > qr) return 0;
inside|    if (ql <= l && r <= qr) return tree[p];
queryMiddle|    int m = (l + r) / 2;
combine|    return query(p*2, l, m, ql, qr) + query(p*2+1, m+1, r, ql, qr);
}
int demo(vector<int> input, int index, int value, int ql, int qr) {
init|    a = input; tree.assign(a.size() * 4, 0);
build|    build(1, 0, (int)a.size() - 1);
update|    update(1, 0, (int)a.size() - 1, index, value);
query|    return query(1, 0, (int)a.size() - 1, ql, qr);
}`,{values:a.slice(),index,value,查询区间:[left,right]},{});const s=(l,m,v={},active=[])=>t.step(l,m,{index,value,ql:left,qr:right,...v},{kind:'graph',nodes:nodes.map(node=>({...node,badge:tree[node.id]})),edges,active,aux:[{label:'原数组',values:a}],caption:'节点标签是闭区间，旁边的数值是该区间元素之和'});function build(p,l,r){s('leaf','检查是否到达只负责一个位置的叶节点。',{p,l,r},[p]);if(l===r){tree[p]=a[l];s('assign','叶节点保存原数组对应的值。',{p,l,r},[p]);s('buildReturn','当前叶节点构建结束。',{p,l,r},[p]);return;}const m=Math.floor((l+r)/2);s('middle','把区间从中间分成两半。',{p,l,r,m},[p]);s('left','递归建立左子区间。',{p,l,r,m},[p]);build(2*p,l,m);s('right','递归建立右子区间。',{p,l,r,m},[p]);build(2*p+1,m+1,r);tree[p]=tree[2*p]+tree[2*p+1];s('merge','父节点保存左右子区间之和。',{p,l,r},[p,2*p,2*p+1]);}function update(p,l,r){if(l===r){tree[p]=value;a[l]=value;}s('updateLeaf',l===r?'在叶节点写入新值并返回。':'尚未到达目标叶节点。',{p,l,r},[p]);if(l===r)return;const m=Math.floor((l+r)/2);s('updateMiddle','计算中点。',{p,l,r,m},[p]);s('direction','根据 index 决定递归方向。',{p,l,r,m},[p]);if(index<=m){s('updateLeft','进入左子树。',{p},[2*p]);update(2*p,l,m);}else{s('updateRight','进入右子树。',{p},[2*p+1]);update(2*p+1,m+1,r);}tree[p]=tree[2*p]+tree[2*p+1];s('repair','回溯时重新计算经过的父节点。',{p,l,r},[p]);}function query(p,l,r){s('outside','与查询区间无交集时贡献 0。',{p,l,r},[p]);if(r<left||l>right)return 0;s('inside','整个节点区间都被包含时直接返回其区间和。',{p,l,r},[p]);if(left<=l&&r<=right)return tree[p];const m=Math.floor((l+r)/2);s('queryMiddle','部分相交，继续拆分查询。',{p,l,r,m},[p]);s('combine','分别查询左右子区间并相加。',{p,l,r},[p]);const result=query(2*p,l,m)+query(2*p+1,m+1,r);s('combine','合并两个子查询的结果。',{p,l,r,子区间结果:result},[p]);return result;}s('init','初始化原数组和线段树存储。');s('build','开始建树。');build(1,0,n-1);s('update','执行一次单点更新。');update(1,0,n-1);s('query','查询闭区间的元素和。');const result=query(1,0,n-1);return t.done(result,`区间 [${left}, ${right}] 的和是 ${result}。`);
  });
})(AlgoLab);
