(function(L){
  'use strict';
  L.addCode('array',`def edit_array(a, pos, value, erase_pos):
read|    first = a[0] if a else -1
grow|    a.append(0)
shift|    for i in range(len(a) - 1, pos, -1):
move|        a[i] = a[i - 1]
insert|    a[pos] = value
delete|    for i in range(erase_pos, len(a) - 1):
left|        a[i] = a[i + 1]
shrink|    a.pop()`,
`static void editArray(List<Integer> a, int pos, int value, int erasePos) {
read|    int first = a.isEmpty() ? -1 : a.get(0);
grow|    a.add(0);
shift|    for (int i = a.size() - 1; i > pos; i--) {
move|        a.set(i, a.get(i - 1));
    }
insert|    a.set(pos, value);
delete|    for (int i = erasePos; i + 1 < a.size(); i++) {
left|        a.set(i, a.get(i + 1));
    }
shrink|    a.remove(a.size() - 1);
}`);
  for(const id of ['singly-linked-list','doubly-linked-list']){
    const doubly=id==='doubly-linked-list';
    L.addCode(id,`class Node:
    def __init__(self, value, next=None${doubly?', prev=None':''}):
        self.value, self.next = value, next
${doubly?'        self.prev = prev\n':''}
def demo(values, pos, value):
dummy|    dummy = Node(0)
tail|    tail = dummy
build|    for x in values:
new|        node = Node(x${doubly?', prev=tail':''})
link|        tail.next = node
advance|        tail = node
pointer|    p = dummy
walk|    for i in range(pos): p = p.next
create|    node = Node(value, p.next${doubly?', p':''})
${doubly?'back|    if p.next: p.next.prev = node\n':''}insert|    p.next = node
victim|    victim = node.next
check|    if victim is not None:
unlink|        node.next = victim.next
${doubly?'repair|        if victim.next: victim.next.prev = node\n':''}free|        del victim
${doubly?'head|    if dummy.next: dummy.next.prev = None\n':''}return|    return dummy.next`,
`static class Node {
    int value; Node next${doubly?', prev':''};
    Node(int value, Node next${doubly?', Node prev':''}) {
        this.value = value; this.next = next;${doubly?' this.prev = prev;':''}
    }
}
static Node demo(int[] values, int pos, int value) {
dummy|    Node dummy = new Node(0, null${doubly?', null':''});
tail|    Node tail = dummy;
build|    for (int x : values) {
new|        Node node = new Node(x, null${doubly?', tail':''});
link|        tail.next = node;
advance|        tail = node;
    }
pointer|    Node p = dummy;
walk|    for (int i = 0; i < pos; i++) p = p.next;
create|    Node node = new Node(value, p.next${doubly?', p':''});
${doubly?'back|    if (p.next != null) p.next.prev = node;\n':''}insert|    p.next = node;
victim|    Node victim = node.next;
check|    if (victim != null) {
unlink|        node.next = victim.next;
${doubly?'repair|        if (victim.next != null) victim.next.prev = node;\n':''}free|        victim = null; // detached node can be garbage-collected
    }
${doubly?'head|    if (dummy.next != null) dummy.next.prev = null;\n':''}return|    return dummy.next;
}`);
  }
  L.addCode('circular-linked-list',`def josephus(values, step):
size|    n = len(values)
init|    next = [0] * n
link|    for i in range(n): next[i] = (i + 1) % n
start|    current, previous, remaining = 0, n - 1, n
loop|    while remaining > 1:
count|        for k in range(1, step):
previous|            previous = current
advance|            current = next[current]
unlink|        next[previous] = next[current]
remove|        remaining -= 1
next|        current = next[current]
return|    return values[current]`,
`static int josephus(int[] values, int step) {
size|    int n = values.length;
init|    int[] next = new int[n];
link|    for (int i = 0; i < n; i++) next[i] = (i + 1) % n;
start|    int current = 0, previous = n - 1, remaining = n;
loop|    while (remaining > 1) {
count|        for (int k = 1; k < step; k++) {
previous|            previous = current;
advance|            current = next[current];
        }
unlink|        next[previous] = next[current];
remove|        remaining--;
next|        current = next[current];
    }
return|    return values[current];
}`);
})(AlgoLab);

(function(L){
  'use strict';
  L.addLesson('dynamic-array',`vector<int> dynamicArray(vector<int> a) {
init|    vector<int> buffer; int size = 0, capacity = 0;
loop|    for (int x : a) {
full|        if (size == capacity) {
capacity|            int newCapacity = capacity == 0 ? 1 : capacity * 2;
allocate|            vector<int> next(newCapacity, 0);
copyLoop|            for (int j = 0; j < size; ++j) {
copy|                next[j] = buffer[j];
            }
replace|            buffer = move(next);
saveCapacity|            capacity = newCapacity;
        }
append|        buffer[size] = x;
grow|        ++size;
    }
result|    return vector<int>(buffer.begin(), buffer.begin() + size);
}`,`def dynamic_array(a):
init|    buffer = []; size = 0; capacity = 0
loop|    for x in a:
full|        if size == capacity:
capacity|            new_capacity = 1 if capacity == 0 else capacity * 2
allocate|            next_buffer = [0] * new_capacity
copyLoop|            for j in range(size):
copy|                next_buffer[j] = buffer[j]
replace|            buffer = next_buffer
saveCapacity|            capacity = new_capacity
append|        buffer[size] = x
grow|        size += 1
result|    return buffer[:size]`,`static int[] dynamicArray(int[] a) {
init|    int[] buffer = new int[0]; int size = 0, capacity = 0;
loop|    for (int x : a) {
full|        if (size == capacity) {
capacity|            int newCapacity = capacity == 0 ? 1 : capacity * 2;
allocate|            int[] next = new int[newCapacity];
copyLoop|            for (int j = 0; j < size; ++j) {
copy|                next[j] = buffer[j];
            }
replace|            buffer = next;
saveCapacity|            capacity = newCapacity;
        }
append|        buffer[size] = x;
grow|        ++size;
    }
result|    return Arrays.copyOf(buffer, size);
}`);
})(AlgoLab);
