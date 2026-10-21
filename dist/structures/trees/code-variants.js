(function(L){
  'use strict';
  const pyNode=`class Node:
    def __init__(self, value):
        self.value = value
        self.left = self.right = None

`;
  const javaNode=`static class Node {
    int value; Node left, right;
    Node(int value) { this.value = value; }
}
`;
  L.addCode('binary-tree',pyNode+`def build(a, i):
empty|    if i >= len(a): return None
new|    node = Node(a[i])
left|    node.left = build(a, 2 * i + 1)
right|    node.right = build(a, 2 * i + 2)
return|    return node`,javaNode+`static Node build(int[] a, int i) {
empty|    if (i >= a.length) return null;
new|    Node node = new Node(a[i]);
left|    node.left = build(a, 2 * i + 1);
right|    node.right = build(a, 2 * i + 2);
return|    return node;
}`);
  L.addCode('bst',pyNode+`def insert(node, value):
empty|    if node is None:
new|        node = Node(value)
returnInsert|        return node
less|    if value < node.value:
left|        node.left = insert(node.left, value)
greater|    elif value > node.value:
right|        node.right = insert(node.right, value)
    return node

def contains(node, target):
loop|    while node is not None:
equal|        if node.value == target: return True
direction|        node = node.left if target < node.value else node.right
missing|    return False

def demo(values, target):
init|    root = None
build|    for value in values: root = insert(root, value)
query|    return contains(root, target)`,javaNode+`static Node insert(Node node, int value) {
empty|    if (node == null) {
new|        node = new Node(value);
returnInsert|        return node;
    }
less|    if (value < node.value) {
left|        node.left = insert(node.left, value);
    }
greater|    else if (value > node.value) {
right|        node.right = insert(node.right, value);
    }
    return node;
}
static boolean contains(Node node, int target) {
loop|    while (node != null) {
equal|        if (node.value == target) return true;
direction|        node = target < node.value ? node.left : node.right;
    }
missing|    return false;
}
static boolean demo(int[] values, int target) {
init|    Node root = null;
build|    for (int value : values) root = insert(root, value);
query|    return contains(root, target);
}`);
  L.addCode('avl',`class Node:
    def __init__(self, value):
        self.value, self.height = value, 1
        self.left = self.right = None

def H(node):
    return node.height if node else 0

def rotate_right(y):
rx|    x = y.left
rt|    middle = x.right
rlink|    x.right = y
rcut|    y.left = middle
rh1|    y.height = 1 + max(H(y.left), H(y.right))
rh2|    x.height = 1 + max(H(x.left), H(x.right))
rr|    return x

def rotate_left(x):
ly|    y = x.right
lt|    middle = y.left
llink|    y.left = x
lcut|    x.right = middle
lh1|    x.height = 1 + max(H(x.left), H(x.right))
lh2|    y.height = 1 + max(H(y.left), H(y.right))
lr|    return y

def insert(node, value):
empty|    if node is None: return Node(value)
less|    if value < node.value: node.left = insert(node.left, value)
greater|    elif value > node.value: node.right = insert(node.right, value)
equal|    else: return node
height|    node.height = 1 + max(H(node.left), H(node.right))
balance|    balance = H(node.left) - H(node.right)
ll|    if balance > 1 and value < node.left.value: return rotate_right(node)
rrCase|    if balance < -1 and value > node.right.value: return rotate_left(node)
lrCase|    if balance > 1 and value > node.left.value:
lrFirst|        node.left = rotate_left(node.left)
lrSecond|        return rotate_right(node)
rlCase|    if balance < -1 and value < node.right.value:
rlFirst|        node.right = rotate_right(node.right)
rlSecond|        return rotate_left(node)
return|    return node

def demo(values):
init|    root = None
loop|    for value in values: root = insert(root, value)
final|    return root`,
`static class Node {
    int value, height = 1; Node left, right;
    Node(int value) { this.value = value; }
}
static int H(Node node) { return node == null ? 0 : node.height; }
static Node rotateRight(Node y) {
rx|    Node x = y.left;
rt|    Node middle = x.right;
rlink|    x.right = y;
rcut|    y.left = middle;
rh1|    y.height = 1 + Math.max(H(y.left), H(y.right));
rh2|    x.height = 1 + Math.max(H(x.left), H(x.right));
rr|    return x;
}
static Node rotateLeft(Node x) {
ly|    Node y = x.right;
lt|    Node middle = y.left;
llink|    y.left = x;
lcut|    x.right = middle;
lh1|    x.height = 1 + Math.max(H(x.left), H(x.right));
lh2|    y.height = 1 + Math.max(H(y.left), H(y.right));
lr|    return y;
}
static Node insert(Node node, int value) {
empty|    if (node == null) return new Node(value);
less|    if (value < node.value) node.left = insert(node.left, value);
greater|    else if (value > node.value) node.right = insert(node.right, value);
equal|    else return node;
height|    node.height = 1 + Math.max(H(node.left), H(node.right));
balance|    int balance = H(node.left) - H(node.right);
ll|    if (balance > 1 && value < node.left.value) return rotateRight(node);
rrCase|    if (balance < -1 && value > node.right.value) return rotateLeft(node);
lrCase|    if (balance > 1 && value > node.left.value) {
lrFirst|        node.left = rotateLeft(node.left);
lrSecond|        return rotateRight(node);
    }
rlCase|    if (balance < -1 && value < node.right.value) {
rlFirst|        node.right = rotateRight(node.right);
rlSecond|        return rotateLeft(node);
    }
return|    return node;
}
static Node demo(int[] values) {
init|    Node root = null;
loop|    for (int value : values) root = insert(root, value);
final|    return root;
}`);
  L.addCode('trie',`class TrieNode:
    def __init__(self):
        self.next, self.end = [0] * 26, False

def trie_demo(words, target):
init|    trie = [TrieNode()]
words|    for word in words:
root|        u = 0
chars|        for c in word:
index|            k = ord(c) - ord('A')
missing|            if trie[u].next[k] == 0:
link|                trie[u].next[k] = len(trie)
new|                trie.append(TrieNode())
advance|            u = trie[u].next[k]
end|        trie[u].end = True
searchRoot|    u = 0
search|    for c in target:
test|        if trie[u].next[ord(c) - ord('A')] == 0: return False
next|        u = trie[u].next[ord(c) - ord('A')]
return|    return trie[u].end`,
`static class TrieNode {
    int[] next = new int[26]; boolean end;
}
static boolean trieDemo(String[] words, String target) {
init|    List<TrieNode> trie = new ArrayList<>(); trie.add(new TrieNode());
words|    for (String word : words) {
root|        int u = 0;
chars|        for (char c : word.toCharArray()) {
index|            int k = c - 'A';
missing|            if (trie.get(u).next[k] == 0) {
link|                trie.get(u).next[k] = trie.size();
new|                trie.add(new TrieNode());
            }
advance|            u = trie.get(u).next[k];
        }
end|        trie.get(u).end = true;
    }
searchRoot|    int u = 0;
search|    for (char c : target.toCharArray()) {
test|        if (trie.get(u).next[c - 'A'] == 0) return false;
next|        u = trie.get(u).next[c - 'A'];
    }
return|    return trie.get(u).end;
}`);
})(AlgoLab);
