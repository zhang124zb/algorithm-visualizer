(function(L){
  'use strict';
  L.addCode('hash-chaining',`def chaining(keys, target):
init|    buckets = [[] for _ in range(7)]
loop|    for key in keys:
hash|        index = key % 7
insert|        buckets[index].append(key)
target|    index = target % 7
scan|    for value in buckets[index]:
test|        if value == target: return True
missing|    return False`,
`static boolean chaining(int[] keys, int target) {
init|    List<List<Integer>> buckets = new ArrayList<>(); for (int i = 0; i < 7; i++) buckets.add(new ArrayList<>());
loop|    for (int key : keys) {
hash|        int index = key % 7;
insert|        buckets.get(index).add(key);
    }
target|    int index = target % 7;
scan|    for (int value : buckets.get(index)) {
test|        if (value == target) return true;
    }
missing|    return false;
}`);
  L.addCode('hash-probing',`def probing(keys, target):
init|    table = [-1] * 11
loop|    for key in keys:
hash|        slot = key % 11
scan|        while table[slot] != -1:
advance|            slot = (slot + 1) % 11
insert|        table[slot] = key
target|    slot = target % 11
search|    for tried in range(11):
        if table[slot] == -1: break
test|        if table[slot] == target: return True
next|        slot = (slot + 1) % 11
missing|    return False`,
`static boolean probing(int[] keys, int target) {
init|    int[] table = new int[11]; Arrays.fill(table, -1);
loop|    for (int key : keys) {
hash|        int slot = key % 11;
scan|        while (table[slot] != -1) {
advance|            slot = (slot + 1) % 11;
        }
insert|        table[slot] = key;
    }
target|    int slot = target % 11;
search|    for (int tried = 0; tried < 11 && table[slot] != -1; tried++) {
test|        if (table[slot] == target) return true;
next|        slot = (slot + 1) % 11;
    }
missing|    return false;
}`);
})(AlgoLab);

(function(L){
  'use strict';
  for(const ordered of [true,false]){
    const id=ordered?'ordered-set':'hash-set',fn=ordered?'orderedSet':'hashSet';
    const pyfn=ordered?'ordered_set':'hash_set',container=ordered?'set':'unordered_set';
    const javaContainer=ordered?'TreeSet':'HashSet';
    const python=ordered?`from bisect import bisect_left, insort

def ${pyfn}(a, query, erase_value):
init|    values = []
loop|    for x in a:
contains|        pos = bisect_left(values, x); existing = pos < len(values) and values[pos] == x
test|        if not existing:
insert|            insort(values, x)
query|    pos = bisect_left(values, query); found = pos < len(values) and values[pos] == query
erase|    if erase_value in values: values.remove(erase_value)
output|    result = []
collect|    result.extend(values)
sort|    result.sort()
return|    return result`:`def ${pyfn}(a, query, erase_value):
init|    values = set()
loop|    for x in a:
contains|        existing = x in values
test|        if not existing:
insert|            values.add(x)
query|    found = query in values
erase|    values.discard(erase_value)
output|    result = []
collect|    result.extend(values)
sort|    result.sort()
return|    return result`;
    L.addLesson(id,`vector<int> ${fn}(vector<int> a, int query, int eraseValue) {
init|    ${container}<int> values;
loop|    for (int x : a) {
contains|        bool existing = values.count(x) != 0;
test|        if (!existing) {
insert|            values.insert(x);
        }
    }
query|    bool found = values.count(query) != 0;
erase|    values.erase(eraseValue);
output|    vector<int> result;
collect|    result.assign(values.begin(), values.end());
sort|    sort(result.begin(), result.end());
return|    return result;
}`,python,`static int[] ${fn}(int[] a, int query, int eraseValue) {
init|    Set<Integer> values = new ${javaContainer}<>();
loop|    for (int x : a) {
contains|        boolean existing = values.contains(x);
test|        if (!existing) {
insert|            values.add(x);
        }
    }
query|    boolean found = values.contains(query);
erase|    values.remove(eraseValue);
output|    List<Integer> result = new ArrayList<>();
collect|    result.addAll(values);
sort|    Collections.sort(result);
return|    return result.stream().mapToInt(Integer::intValue).toArray();
}`);
  }
  for(const ordered of [true,false]){
    const id=ordered?'ordered-map':'hash-map',fn=ordered?'orderedMap':'hashMap';
    const pyfn=ordered?'ordered_map':'hash_map',container=ordered?'map':'unordered_map';
    const javaContainer=ordered?'TreeMap':'HashMap';
    const python=ordered?`from bisect import insort

def ${pyfn}(a, query, erase_value):
init|    counts = {}; keys = []
loop|    for x in a:
contains|        existing = x in counts
test|        if not existing:
insert|            counts[x] = 0; insort(keys, x)
count|        counts[x] += 1
query|    found = counts.get(query, 0)
erase|    counts.pop(erase_value, None); keys = [key for key in keys if key != erase_value]
output|    result = []
collect|    for key in keys:
write|        result.append([key, counts[key]])
sort|    result.sort()
return|    return result`:`def ${pyfn}(a, query, erase_value):
init|    counts = {}
loop|    for x in a:
contains|        existing = x in counts
test|        if not existing:
insert|            counts[x] = 0
count|        counts[x] += 1
query|    found = counts.get(query, 0)
erase|    counts.pop(erase_value, None)
output|    result = []
collect|    for key in counts:
write|        result.append([key, counts[key]])
sort|    result.sort()
return|    return result`;
    L.addLesson(id,`vector<vector<int>> ${fn}(vector<int> a, int query, int eraseValue) {
init|    ${container}<int, int> counts;
loop|    for (int x : a) {
contains|        bool existing = counts.count(x) != 0;
test|        if (!existing) {
insert|            counts[x] = 0;
        }
count|        ++counts[x];
    }
query|    auto it = counts.find(query); int found = it == counts.end() ? 0 : it->second;
erase|    counts.erase(eraseValue);
output|    vector<vector<int>> result;
collect|    for (const auto& entry : counts) {
write|        result.push_back({entry.first, entry.second});
    }
sort|    sort(result.begin(), result.end());
return|    return result;
}`,python,`static int[][] ${fn}(int[] a, int query, int eraseValue) {
init|    Map<Integer, Integer> counts = new ${javaContainer}<>();
loop|    for (int x : a) {
contains|        boolean existing = counts.containsKey(x);
test|        if (!existing) {
insert|            counts.put(x, 0);
        }
count|        counts.put(x, counts.get(x) + 1);
    }
query|    int found = counts.getOrDefault(query, 0);
erase|    counts.remove(eraseValue);
output|    List<int[]> result = new ArrayList<>();
collect|    for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
write|        result.add(new int[]{entry.getKey(), entry.getValue()});
    }
sort|    result.sort((left, right) -> Integer.compare(left[0], right[0]));
return|    return result.toArray(new int[result.size()][]);
}`);
  }
})(AlgoLab);
