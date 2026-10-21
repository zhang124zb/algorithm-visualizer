(function(L){
  'use strict';
  L.register('binary-tree',(options={})=>{
    const a=options.values?.slice()||L.unique(7),nodes=[],edges=[],stack=[];
    const t=new L.Trace(`struct Node { int value; Node *left, *right; };
Node* build(const vector<int>& a, int i) {
empty|    if (i >= (int)a.size()) return nullptr;
new|    Node* node = new Node{a[i], nullptr, nullptr};
left|    node->left = build(a, 2 * i + 1);
right|    node->right = build(a, 2 * i + 2);
return|    return node;
}`,{层序数据:a},{});const draw=(active=[])=>({kind:'graph',nodes:nodes.map(i=>{const depth=Math.floor(Math.log2(i+1)),offset=i-(2**depth-1);return {id:i,label:String(a[i]),x:(offset+.5)*100/2**depth,y:13+depth*29};}),edges,active});const s=(l,m,i)=>t.step(l,m,{i,调用栈:stack.slice()},draw(i<a.length?[i]:[]));function build(i){stack.push(i);s('empty','下标超出数组范围时，这个孩子为空。',i);if(i>=a.length){stack.pop();return null;}nodes.push(i);s('new','根据层序数组创建当前节点。',i);s('left','递归建立左孩子，返回后连接指针。',i);const left=build(2*i+1);if(left!==null)edges.push({u:i,v:left});s('left','左孩子的返回指针已接到当前节点。',i);s('right','递归建立右孩子，返回后连接指针。',i);const right=build(2*i+2);if(right!==null)edges.push({u:i,v:right});s('right','右孩子的返回指针已接到当前节点。',i);s('return','返回当前子树的根节点。',i);stack.pop();return i;}build(0);return t.done(a,'二叉树建立完成，数组下标与父子关系已对应。');
  });
  L.register('bst',(options={})=>{
    const a=options.values?.slice()||L.unique(7),target=options.target??a[L.rand(0,a.length-1)];let root=null;const stack=[];
    const t=new L.Trace(`struct Node { int value; Node *left, *right; };
void insert(Node*& node, int value) {
empty|    if (node == nullptr) {
new|        node = new Node{value, nullptr, nullptr};
returnInsert|        return;
    }
less|    if (value < node->value) {
left|        insert(node->left, value);
    }
greater|    else if (value > node->value) {
right|        insert(node->right, value);
    }
}
bool contains(Node* node, int target) {
loop|    while (node != nullptr) {
equal|        if (node->value == target) return true;
direction|        node = target < node->value ? node->left : node->right;
    }
missing|    return false;
}
bool demo(vector<int> values, int target) {
init|    Node* root = nullptr;
build|    for (int value : values) insert(root, value);
query|    return contains(root, target);
}`,{values:a,target},{});const s=(l,m,v={},active=[])=>t.step(l,m,{target,调用栈:stack.slice(),...v},L.tree(root,active));function insert(holder,key,value){let node=holder[key];stack.push(node?.value??'null');s('empty','空指针就是新节点的插入位置。',{value,node:node?.value??'null'},node?[node.value]:[]);if(!node){holder[key]={value,left:null,right:null};if(key==='root')root=holder[key];s('new','创建节点，左右孩子初始化为空。',{value},[value]);s('returnInsert','返回上一层。',{value},[value]);stack.pop();return;}s('less','较小值进入左子树。',{value,node:node.value},[node.value]);if(value<node.value){s('left','递归插入左子树。',{value},[node.value]);insert(node,'left',value);}else{s('greater','较大值进入右子树；相等值不重复插入。',{value,node:node.value},[node.value]);if(value>node.value){s('right','递归插入右子树。',{value},[node.value]);insert(node,'right',value);}}stack.pop();}s('init','从空树开始。');const holder={root};for(const value of a){s('build','把下一个值插入搜索树。',{value});insert(holder,'root',value);root=holder.root;}s('query','建树后查询随机目标。');let node=root;while(true){s('loop','沿大小关系缩小搜索范围。',{node:node?.value??'null'},node?[node.value]:[]);if(!node)break;s('equal','检查当前节点是否就是目标。',{node:node.value},[node.value]);if(node.value===target)return t.done(true,'找到目标节点。');node=target<node.value?node.left:node.right;s('direction','目标较小走左侧，较大走右侧。',{node:node?.value??'null'},node?[node.value]:[]);}s('missing','走到空指针，目标不存在。');return t.done(false);
  });
  L.register('avl',(options={})=>{
    const start=L.rand(5,12),a=options.values?.slice()||[start,start+10,start+20,start+15,start+5,start+17],all=[];let root=null;
    const t=new L.Trace(`struct Node { int value, height; Node *left, *right; };
int H(Node* p) { return p ? p->height : 0; }
Node* rotateRight(Node* y) {
rx|    Node* x = y->left;
rt|    Node* middle = x->right;
rlink|    x->right = y;
rcut|    y->left = middle;
rh1|    y->height = 1 + max(H(y->left), H(y->right));
rh2|    x->height = 1 + max(H(x->left), H(x->right));
rr|    return x;
}
Node* rotateLeft(Node* x) {
ly|    Node* y = x->right;
lt|    Node* middle = y->left;
llink|    y->left = x;
lcut|    x->right = middle;
lh1|    x->height = 1 + max(H(x->left), H(x->right));
lh2|    y->height = 1 + max(H(y->left), H(y->right));
lr|    return y;
}
Node* insert(Node* node, int value) {
empty|    if (!node) return new Node{value, 1, nullptr, nullptr};
less|    if (value < node->value) node->left = insert(node->left, value);
greater|    else if (value > node->value) node->right = insert(node->right, value);
equal|    else return node;
height|    node->height = 1 + max(H(node->left), H(node->right));
balance|    int balance = H(node->left) - H(node->right);
ll|    if (balance > 1 && value < node->left->value) return rotateRight(node);
rrCase|    if (balance < -1 && value > node->right->value) return rotateLeft(node);
lrCase|    if (balance > 1 && value > node->left->value) {
lrFirst|        node->left = rotateLeft(node->left);
lrSecond|        return rotateRight(node);
    }
rlCase|    if (balance < -1 && value < node->right->value) {
rlFirst|        node->right = rotateRight(node->right);
rlSecond|        return rotateLeft(node);
    }
return|    return node;
}
Node* demo(vector<int> values) {
init|    Node* root = nullptr;
loop|    for (int value : values) root = insert(root, value);
final|    return root;
}`,{values:a},{});
    const h=n=>n?n.height:0;
    function draw(active=[]){const sorted=all.slice().sort((x,y)=>x.value-y.value),edges=all.flatMap(n=>[...(n.left?[{u:n.value,v:n.left.value}]:[]),...(n.right?[{u:n.value,v:n.right.value}]:[])]),children=new Set(edges.map(e=>e.v)),depths=new Map();function visit(n,d){if(!n||depths.has(n.value))return;depths.set(n.value,d);visit(n.left,d+1);visit(n.right,d+1);}all.filter(n=>!children.has(n.value)).forEach(n=>visit(n,0));all.forEach(n=>visit(n,0));const max=Math.max(1,...depths.values());return{kind:'graph',nodes:sorted.map((n,i)=>({id:n.value,label:String(n.value),badge:'h='+n.height,x:10+i*80/Math.max(1,sorted.length-1),y:12+depths.get(n.value)*72/max})),edges,active,caption:'h 是子树高度；插入后通过旋转恢复左右高度差不超过 1'};}
    const s=(l,m,v={},active=[])=>t.step(l,m,v,draw(active));function rotateRight(y){const x=y.left;s('rx','右旋：保存左孩子作为新根。',{y:y.value,x:x.value},[y.value,x.value]);const middle=x.right;s('rt','保存需要转接的中间子树。',{middle:middle?.value??'null'});x.right=y;s('rlink','旧根成为新根的右孩子。',{},[x.value,y.value]);y.left=middle;s('rcut','中间子树接到旧根左侧。',{},[y.value]);y.height=1+Math.max(h(y.left),h(y.right));s('rh1','先更新旧根高度。',{},[y.value]);x.height=1+Math.max(h(x.left),h(x.right));s('rh2','再更新新根高度。',{},[x.value]);s('rr','返回旋转后的新根。',{},[x.value]);return x;}function rotateLeft(x){const y=x.right;s('ly','左旋：保存右孩子作为新根。',{x:x.value,y:y.value},[x.value,y.value]);const middle=y.left;s('lt','保存需要转接的中间子树。',{middle:middle?.value??'null'});y.left=x;s('llink','旧根成为新根的左孩子。',{},[x.value,y.value]);x.right=middle;s('lcut','中间子树接到旧根右侧。',{},[x.value]);x.height=1+Math.max(h(x.left),h(x.right));s('lh1','先更新旧根高度。',{},[x.value]);y.height=1+Math.max(h(y.left),h(y.right));s('lh2','再更新新根高度。',{},[y.value]);s('lr','返回旋转后的新根。',{},[y.value]);return y;}function insert(node,value){s('empty','空位置创建高度为 1 的新节点。',{node:node?.value??'null',value},node?[node.value]:[]);if(!node){const made={value,height:1,left:null,right:null};all.push(made);s('empty','新节点已创建。',{value},[value]);return made;}s('less','比较新值与当前节点。',{value,node:node.value},[node.value]);if(value<node.value){node.left=insert(node.left,value);s('less','接回插入后的左子树。',{value},[node.value]);}else{s('greater','较大值进入右子树。',{value,node:node.value},[node.value]);if(value>node.value){node.right=insert(node.right,value);s('greater','接回插入后的右子树。',{value},[node.value]);}else{s('equal','重复值不插入。',{value},[node.value]);return node;}}node.height=1+Math.max(h(node.left),h(node.right));s('height','回溯时更新当前节点高度。',{node:node.value,height:node.height},[node.value]);const balance=h(node.left)-h(node.right);s('balance','计算左子树高度减右子树高度。',{node:node.value,balance},[node.value]);s('ll','检查左左型失衡。',{balance,value},[node.value]);if(balance>1&&value<node.left.value)return rotateRight(node);s('rrCase','检查右右型失衡。',{balance,value},[node.value]);if(balance< -1&&value>node.right.value)return rotateLeft(node);s('lrCase','检查左右型失衡。',{balance,value},[node.value]);if(balance>1&&value>node.left.value){s('lrFirst','先对左孩子左旋。');node.left=rotateLeft(node.left);s('lrFirst','接回旋转后的左孩子。');s('lrSecond','再对当前节点右旋。');return rotateRight(node);}s('rlCase','检查右左型失衡。',{balance,value},[node.value]);if(balance< -1&&value<node.right.value){s('rlFirst','先对右孩子右旋。');node.right=rotateRight(node.right);s('rlFirst','接回旋转后的右孩子。');s('rlSecond','再对当前节点左旋。');return rotateLeft(node);}s('return','当前子树已平衡，返回根。',{},[node.value]);return node;}s('init','从空 AVL 树开始。');for(const value of a){s('loop','插入一个新值，并接回可能变化的根节点。',{value});root=insert(root,value);s('loop','本次插入及平衡调整完成。',{value,root:root.value},[root.value]);}s('final','所有节点插入结束，返回平衡树根。',{root:root?.value??'null'});return t.done(root);
  });
  L.register('trie',(options={})=>{
    const words=options.words?.slice()||L.shuffle(['CAT','CAR','CAN','DOG','DOT','DO']).slice(0,4),target=options.target??words[L.rand(0,words.length-1)],nodes=[{id:0,label:'∅',children:{},end:false,depth:0}],edges=[];
    const t=new L.Trace(`struct Node { int next[26]{}; bool end = false; };
bool trieDemo(vector<string> words, string target) {
init|    vector<Node> trie(1);
words|    for (string word : words) {
root|        int u = 0;
chars|        for (char c : word) {
index|            int k = c - 'A';
missing|            if (trie[u].next[k] == 0) {
link|                trie[u].next[k] = trie.size();
new|                trie.emplace_back();
            }
advance|            u = trie[u].next[k];
        }
end|        trie[u].end = true;
    }
searchRoot|    int u = 0;
search|    for (char c : target) {
test|        if (trie[u].next[c - 'A'] == 0) return false;
next|        u = trie[u].next[c - 'A'];
    }
return|    return trie[u].end;
}`,{words,target},{});
    function draw(active=[]){let index=0;const positions={};function layout(u){const children=Object.values(nodes[u].children).filter(id=>id<nodes.length);if(!children.length)positions[u]=index++;else{children.forEach(layout);positions[u]=(positions[children[0]]+positions[children[children.length-1]])/2;}}layout(0);return {kind:'graph',directed:true,nodes:nodes.map(n=>({id:n.id,label:n.label,badge:n.end?'词尾':'',x:12+(positions[n.id]??index)*76/Math.max(1,index-1),y:10+n.depth*22})),edges,active,caption:'从根到词尾的路径构成一个单词，共享前缀只保存一次'};}const s=(l,m,v={},active=[])=>t.step(l,m,{target,...v},draw(active));s('init','建立唯一根节点，所有孩子指针为空。');for(let i=0;;i++){s('words','读取下一个单词。',{i});if(i>=words.length)break;const word=words[i];let u=0;s('root','每个单词都从根节点出发。',{word,u},[u]);for(let j=0;;j++){s('chars','读取当前单词的下一个字符。',{word,j,u},[u]);if(j>=word.length)break;const c=word[j],k=c.charCodeAt(0)-65;s('index','把字符转换成孩子数组下标。',{word,c,k,u},[u]);s('missing','检查这个字符对应的分支是否存在。',{word,c,u},[u]);if(nodes[u].children[c]===undefined){const id=nodes.length;nodes[u].children[c]=id;s('link','预先记录新节点的编号。',{word,c,u,新节点编号:id},[u]);nodes.push({id,label:c,children:{},end:false,depth:nodes[u].depth+1});edges.push({u,v:id});s('new','创建对应字符节点。',{word,c,u,新节点编号:id},[id]);}u=nodes[u].children[c];s('advance','沿对应字符的分支前进。',{word,c,u},[u]);}nodes[u].end=true;s('end','标记这是一个完整单词的结尾。',{word,u},[u]);}let u=0;s('searchRoot','从根节点开始查询目标单词。',{u},[u]);for(let j=0;;j++){s('search','逐个检查目标单词的字符。',{j,u},[u]);if(j>=target.length)break;const c=target[j];s('test','缺少这个分支时，单词不存在。',{c,u},[u]);if(nodes[u].children[c]===undefined)return t.done(false,'目标单词没有对应路径。');u=nodes[u].children[c];s('next','沿匹配的字符分支继续。',{c,u},[u]);}s('return','路径存在还需要词尾标记，才能算完整单词。',{u,词尾:nodes[u].end},[u]);return t.done(nodes[u].end);
  });
})(AlgoLab);
