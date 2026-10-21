(function(L){
  'use strict';
  const pyNode=`class Node:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

`;
  const javaNode=`static class Node {
    int value; Node left, right;
    Node(int value) { this.value = value; }
}
`;
  for(const id of ['preorder','inorder','postorder']){
    const order=id==='preorder'?['visit','left','right']:id==='inorder'?['left','visit','right']:['left','right','visit'];
    const py={visit:'visit|    output.append(node.value)',left:'left|    traverse(node.left, output)',right:'right|    traverse(node.right, output)'};
    const java={visit:'visit|    output.add(node.value);',left:'left|    traverse(node.left, output);',right:'right|    traverse(node.right, output);'};
    L.addCode(id,pyNode+`def traverse(node, output):
empty|    if node is None: return
${order.map(x=>py[x]).join('\n')}`,javaNode+`static void traverse(Node node, List<Integer> output) {
empty|    if (node == null) return;
${order.map(x=>java[x]).join('\n')}
}`);
  }
  L.addCode('level-order','from collections import deque\n\n'+pyNode+`def level_order(root):
init|    output = []
empty|    if root is None: return output
queue|    q = deque()
push|    q.append(root)
loop|    while q:
pop|        node = q.popleft()
visit|        output.append(node.value)
left|        if node.left: q.append(node.left)
right|        if node.right: q.append(node.right)
return|    return output`,javaNode+`static List<Integer> levelOrder(Node root) {
init|    List<Integer> output = new ArrayList<>();
empty|    if (root == null) return output;
queue|    Deque<Node> q = new ArrayDeque<>();
push|    q.addLast(root);
loop|    while (!q.isEmpty()) {
pop|        Node node = q.removeFirst();
visit|        output.add(node.value);
left|        if (node.left != null) q.addLast(node.left);
right|        if (node.right != null) q.addLast(node.right);
    }
return|    return output;
}`);
})(AlgoLab);
