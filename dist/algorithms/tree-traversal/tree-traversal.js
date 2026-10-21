(function(L){
  'use strict';
  for(const id of ['preorder','inorder','postorder'])L.register(id,(options={})=>{
    const values=options.values?.slice()||L.unique(7),root=L.binaryTree(values),output=[],stack=[];
    const operations=id==='preorder'?['visit','left','right']:id==='inorder'?['left','visit','right']:['left','right','visit'];
    const lines={visit:'visit|    output.push_back(node->value);',left:'left|    traverse(node->left, output);',right:'right|    traverse(node->right, output);'};
    const t=new L.Trace(`struct Node { int value; Node *left, *right; };
void traverse(Node* node, vector<int>& output) {
empty|    if (node == nullptr) return;
${operations.map(x=>lines[x]).join('\n')}
}`,{层序建树数据:values},L.tree(root));
    function dfs(node){stack.push(node?node.value:'null');const v=()=>({当前节点:node?.value??'null',调用栈:stack.slice(),output:output.slice()});t.step('empty','空节点直接返回。',v(),L.tree(root,node?[node.value]:[],{visited:output}));if(node)for(const op of operations){if(op==='visit'){output.push(node.value);t.step('visit','访问当前节点，将值写入结果。',v(),L.tree(root,[node.value],{visited:output}));}else{t.step(op,op==='left'?'递归访问左子树。':'递归访问右子树。',v(),L.tree(root,[node.value],{visited:output}));dfs(node[op]);}}stack.pop();}
    dfs(root);return t.done(output,'遍历结束，输出顺序已记录。');
  });
  L.register('level-order',(options={})=>{
    const values=options.values?.slice()||L.unique(7),root=L.binaryTree(values),q=[],output=[];
    const t=new L.Trace(`struct Node { int value; Node *left, *right; };
vector<int> levelOrder(Node* root) {
init|    vector<int> output;
empty|    if (root == nullptr) return output;
queue|    queue<Node*> q;
push|    q.push(root);
loop|    while (!q.empty()) {
pop|        Node* node = q.front(); q.pop();
visit|        output.push_back(node->value);
left|        if (node->left) q.push(node->left);
right|        if (node->right) q.push(node->right);
    }
return|    return output;
}`,{层序建树数据:values},L.tree(root));const s=(l,m,node)=>t.step(l,m,{node:node?.value??'—',queue:q.map(x=>x.value),output:output.slice()},L.tree(root,node?[node.value]:[],{visited:output,aux:[{label:'队列：左侧为队首',values:q.map(x=>x.value)}]}));s('init','初始化输出列表。');s('empty','检查根节点是否存在。');if(!root)return t.done(output);s('queue','建立先进先出的队列。');q.push(root);s('push','根节点入队。',root);while(true){s('loop','只要队列非空就继续。');if(!q.length)break;const node=q.shift();s('pop','队首节点出队。',node);output.push(node.value);s('visit','访问这个节点。',node);if(node.left)q.push(node.left);s('left','左孩子存在时入队。',node);if(node.right)q.push(node.right);s('right','右孩子存在时入队。',node);}s('return','返回层序遍历结果。');return t.done(output);
  });
})(AlgoLab);
