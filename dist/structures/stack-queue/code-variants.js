(function(L){
  'use strict';
  for(const id of ['stack','queue']){
    const stack=id==='stack';
    L.addCode(id,(stack?'':'from collections import deque\n\n')+`def demo(commands):
init|    data = ${stack?'[]':'deque()'}
output|    removed = []
loop|    for type, value in commands:
pushTest|        if type == 1:
push|            data.append(value)
        else:
empty|            if data:
read|                removed.append(data[${stack?'-1':'0'}])
pop|                data.${stack?'pop':'popleft'}()
return|    return removed`,
`static List<Integer> demo(int[][] commands) {
init|    Deque<Integer> data = new ArrayDeque<>();
output|    List<Integer> removed = new ArrayList<>();
loop|    for (int[] command : commands) {
        int type = command[0], value = command[1];
pushTest|        if (type == 1) {
push|            data.addLast(value);
        } else {
empty|            if (!data.isEmpty()) {
read|                removed.add(data.${stack?'peekLast':'peekFirst'}());
pop|                data.${stack?'removeLast':'removeFirst'}();
            }
        }
    }
return|    return removed;
}`);
  }
  L.addCode('deque',`from collections import deque

def demo(commands):
init|    data = deque()
output|    removed = []
loop|    for type, value in commands:
front|        if type == 0: data.appendleft(value)
back|        elif type == 1: data.append(value)
popFront|        elif type == 2 and data:
readFront|            removed.append(data[0])
eraseFront|            data.popleft()
popBack|        elif type == 3 and data:
readBack|            removed.append(data[-1])
eraseBack|            data.pop()
return|    return removed`,
`static List<Integer> demo(int[][] commands) {
init|    Deque<Integer> data = new ArrayDeque<>();
output|    List<Integer> removed = new ArrayList<>();
loop|    for (int[] command : commands) {
        int type = command[0], value = command[1];
front|        if (type == 0) data.addFirst(value);
back|        else if (type == 1) data.addLast(value);
popFront|        else if (type == 2 && !data.isEmpty()) {
readFront|            removed.add(data.peekFirst());
eraseFront|            data.removeFirst();
        }
popBack|        else if (type == 3 && !data.isEmpty()) {
readBack|            removed.add(data.peekLast());
eraseBack|            data.removeLast();
        }
    }
return|    return removed;
}`);
  L.addCode('circular-queue',`def demo(commands):
capacity|    capacity = 5
init|    data, removed = [0] * capacity, []
state|    front, count = 0, 0
loop|    for type, value in commands:
pushTest|        if type == 1:
full|            if count == capacity: continue
rear|            rear = (front + count) % capacity
write|            data[rear] = value
increase|            count += 1
        else:
empty|            if count == 0: continue
read|            removed.append(data[front])
advance|            front = (front + 1) % capacity
decrease|            count -= 1
return|    return removed`,
`static List<Integer> demo(int[][] commands) {
capacity|    final int capacity = 5;
init|    int[] data = new int[capacity]; List<Integer> removed = new ArrayList<>();
state|    int front = 0, count = 0;
loop|    for (int[] command : commands) {
        int type = command[0], value = command[1];
pushTest|        if (type == 1) {
full|            if (count == capacity) continue;
rear|            int rear = (front + count) % capacity;
write|            data[rear] = value;
increase|            count++;
        } else {
empty|            if (count == 0) continue;
read|            removed.add(data[front]);
advance|            front = (front + 1) % capacity;
decrease|            count--;
        }
    }
return|    return removed;
}`);
})(AlgoLab);
