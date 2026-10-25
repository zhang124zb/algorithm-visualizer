'use strict';

const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/extensions/code-lab'),context=vm.createContext({});
for(const file of ['vendor/cpp-runtime.js','stl.js','engine.js','scene.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const run=(code,input='')=>context.CppLab.run(context.CppRuntime,code,input);
const plain=value=>JSON.parse(JSON.stringify(value));
const program=body=>'#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n'+body+'\nreturn 0;\n}';
function success(code,input='',expected){
  const trace=run(code,input);
  assert.equal(trace.error,undefined,trace.error?.message);
  assert.equal(trace.exitCode,0);
  if(expected!==undefined)assert.equal(trace.output,expected);
  return trace;
}
function failure(body,pattern,input=''){
  const code=program(body),trace=run(code,input);
  assert.ok(trace.error,'Expected a bounded, actionable failure: '+body);
  assert.match(trace.error.message,pattern);
  assert.ok(trace.error.line>=1&&trace.error.line<=code.split('\n').length,'Errors refer to the editor source');
}
const fixtures=require('./code-lab-stl-cases.cjs');
assert.equal(fixtures.length,9);
const normalized=(kind,value)=>kind==='unordered_set'?plain(value).sort((a,b)=>a-b):kind==='unordered_map'?plain(value).sort((a,b)=>a.key-b.key):plain(value);
for(const example of fixtures){
  const trace=success(example.code,example.input,example.expected);
  const item=trace.steps.at(-1).variables.find(variable=>variable.name===example.array);
  assert.ok(item,example.id+' remains visible at program completion');
  assert.equal(item.kind,example.expectedKind,example.id+' snapshot kind');
  assert.deepEqual(normalized(example.expectedKind,item.value),normalized(example.expectedKind,example.expectedValues),example.id+' snapshot content');
  if(['vector','string'].includes(item.kind))assert.ok(item.capacity>=item.length,example.id+' recorded capacity');
  if(item.kind.startsWith('unordered_')){
    assert.ok(item.bucketCount>0);
    assert.ok(item.maxLoadFactor>0);
    assert.ok(Math.abs(item.loadFactor-item.length/item.bucketCount)<1e-9);
    assert.ok(item.loadFactor<=item.maxLoadFactor);
  }
  for(const step of trace.steps){
    assert.ok(step.line>=1&&step.line<=example.code.split('\n').length,example.id+' original line range');
    assert.ok(Array.isArray(step.variables));
  }
  const before=trace.steps.find(step=>step.variables.some(variable=>variable.name===example.array&&JSON.stringify(variable.value)!==JSON.stringify(item.value)));
  assert.ok(before,example.id+' captures changes for replay');
  const saved=JSON.stringify(before);
  success(example.code,example.input,example.expected);
  assert.equal(JSON.stringify(before),saved,'A later run must not change an earlier trace');
}

const vector=fixtures.find(example=>example.expectedKind==='vector'),vectorTrace=success(vector.code,vector.input,vector.expected);
const firstPush=vectorTrace.steps.find(step=>step.variables.some(variable=>variable.name==='a'&&JSON.stringify(variable.value)==='[5]'));
assert.ok(firstPush,'Record the first push before later mutations');
assert.deepEqual(plain(firstPush.variables.find(variable=>variable.name==='a').value),[5],'Later vector writes must not mutate previous snapshots');
const pair=fixtures.find(example=>example.expectedKind==='pair'),pairTrace=success(pair.code,pair.input,pair.expected);
assert.ok(pairTrace.steps.some(step=>step.variables.some(variable=>variable.name==='p'&&JSON.stringify(variable.value)==='[2,5]')),'Pair members are copied into each snapshot');

success(program('vector<int> a;\na.push_back(1);\nvector<int> b = a;\nb[0] = 2;\nvector<int> c;\nc = b;\nc.push_back(3);\ncout << a[0] << " " << b.size() << " " << b[0] << " " << c.size() << "\\n";'),'','1 1 2 2\n');
success(String.raw`#include <bits/stdc++.h>
using namespace std;
void update(vector<int>& a) {
    a[0] = 8;
    a.push_back(9);
}
int copyOnly(vector<int> a) {
    a[0] = 100;
    return a[0];
}
int main() {
    vector<int> a;
    a.push_back(1);
    update(a);
    int x = copyOnly(a);
    cout << a[0] << " " << a[1] << " " << x << "\n";
    return 0;
}`,'','8 9 100\n');
success(program('string a = "cat";\nstring b = a;\nb[0] = \'b\';\ncout << a << " " << b << " " << a.substr(1, 2) << "\\n";'),'','cat bat at\n');
success(program('map<int, int> a;\na[4] = 2;\nmap<int, int> b = a;\nb[4] = 7;\ncout << a[4] << " " << b[4] << "\\n";'),'','2 7\n');
success(program('set<int> a;\na.insert(-3);\na.insert(2);\na.insert(-3);\nint erased = a.erase(42);\ncout << a.size() << " " << a.count(-3) << " " << erased << "\\n";'),'','2 1 0\n');
success(program('map<int, int> a;\nint missing = a[8];\ncout << missing << " " << a.size() << " " << a.count(8) << "\\n";'),'','0 1 1\n');
success('#include <iostream>\nint sort(int x){return x+1;}\nint reverse(int x){return x-1;}\nint main(){cout << sort(4) << " " << reverse(4);return 0;}','','5 3');
success('#include <bits/stdc++.h>\nint sort(int x){return x+1;}\nint main(){vector<int> a; a.push_back(4);cout << sort(a[0]);return 0;}','','5');
success('#include <bits/stdc++.h>\nint reverse(int x){return x-1;}\nint main(){vector<int> a; a.push_back(4);cout << reverse(a[0]);return 0;}','','3');
success(program('set<pair<int,int>> a;\na.insert(make_pair(2,3));\na.insert(make_pair(1,4));\ncout << a.size() << " " << a.count(make_pair(2,3));'),'','2 1');
failure('map<vector<int>, int> a;',/键.*尚未开放/);
failure('set<vector<int>> a;',/键.*尚未开放/);
failure('vector<int> b(4096);\nvector<vector<int>> a(4096,b);',/4096|限制|limit/i);
failure('vector<vector<int>> a(4096,vector<int>(4096,7));',/4096|限制|limit/i);
failure('int a[2]={2,1};\nstd::sort(a,a+2);',/暂未|尚未|预留|后续|不支持/i);
failure('int a[2]={2,1};\nsort(a,a+2);',/暂未|尚未|预留|后续|不支持/i);

for(const body of [
  'vector<int> a;\na.push_back(1);\ncout << a[-1];',
  'vector<int> a;\na.push_back(1);\ncout << a.at(2);',
  'string s = "hi";\ncout << s[-1];'
])failure(body,/bound|range|越界|下标/i);
for(const body of [
  'vector<int> a;\na.pop_back();',
  'vector<int> a;\ncout << a.front();',
  'queue<int> q;\nq.pop();',
  'queue<int> q;\ncout << q.front();',
  'stack<int> st;\nst.pop();',
  'stack<int> st;\ncout << st.top();'
])failure(body,/empty|空/i);
failure('vector<int> a(4097);',/4096|限制|limit/i);
for(const body of [
  'vector<int> a;\nsort(a.begin(), a.end());',
  'vector<int> a;\nreverse(a.begin(), a.end());',
  'priority_queue<int> q;',
  'deque<int> q;'
])failure(body,/暂未|预留|后续|不支持|not supported|unsupported/i);

const final=(trace,name)=>trace.steps.at(-1).variables.find(variable=>variable.name===name);
const capacityTrace=success(program(String.raw`vector<int> a;
a.reserve(12);
int reserved = a.capacity();
a.reserve(2);
cout << (a.empty() && a.capacity() == reserved) << " ";
a.push_back(1);
a.resize(6, 3);
a.resize(2);
a.pop_back();
a.clear();
cout << (a.empty() && a.capacity() == reserved) << " ";
a.assign(4, 9);
cout << (a.size() == 4 && a.capacity() == reserved) << " ";
a.resize(20, 5);
int grown = a.capacity();
a.resize(3);
a.shrink_to_fit();
cout << (a.capacity() >= a.size() && a.capacity() <= grown) << "\n";`),'','1 1 1 1\n');
assert.ok(capacityTrace.steps.some(step=>step.variables.some(variable=>variable.name==='a'&&variable.length===0&&variable.capacity>=12)),'An empty reserved vector still has capacity');
assert.equal(final(capacityTrace,'a').length,3);
for(const step of capacityTrace.steps)for(const variable of step.variables)if(variable.kind==='vector')assert.ok(variable.capacity>=variable.length,'Every vector snapshot keeps capacity >= size');

const stringCapacity=success(program(String.raw`string s = "a";
s.reserve(20);
int reserved = s.capacity();
s.reserve(2);
cout << (s.size() == 1 && s.capacity() == reserved) << " ";
s.append("bc");
s += "de";
s.push_back('f');
s.resize(8, 'x');
s.resize(3);
s.pop_back();
s.clear();
cout << (s.empty() && s.capacity() == reserved) << " ";
s.assign("longer");
cout << (s.size() == 6 && s.capacity() == reserved) << " ";
s.assign(25, 'z');
int grown = s.capacity();
s.resize(4);
s.shrink_to_fit();
cout << (s.capacity() >= s.size() && s.capacity() <= grown) << "\n";`),'','1 1 1 1\n');
assert.equal(final(stringCapacity,'s').value,'zzzz');
for(const step of stringCapacity.steps)for(const variable of step.variables)if(variable.kind==='string')assert.ok(variable.capacity>=variable.length,'Every string snapshot keeps capacity >= size');

success(program(String.raw`string word;
word.reserve(20);
int reserved = word.capacity();
cin >> word;
cout << word << " " << (word.capacity() == reserved) << " ";
string line;
getline(cin, line);
getline(cin, line);
cout << line << " " << (line.capacity() >= line.size()) << "\n";`),'token\nlonger input line\n','token 1 longer input line 1\n');
success(program(String.raw`string s;
s.reserve(20);
getline(cin, s);
cout << s << " " << (s.capacity() >= 20) << "\n";`),'hi there\n','hi there 1\n');
success(program(String.raw`string s;
s.reserve(2);
cin >> s;
s.append(" more");
s += " text";
cout << s << " " << (s.capacity() >= s.size()) << "\n";`),'longtoken','longtoken more text 1\n');
success(String.raw`#include <bits/stdc++.h>
using namespace std;
void reserveRef(vector<int>& a) { a.reserve(100); }
void reserveCopy(vector<int> a) { a.reserve(200); }
int main() {
    vector<int> a;
    a.reserve(10);
    a.push_back(7);
    vector<int> b = a;
    b.reserve(30);
    cout << (a.capacity() < b.capacity()) << " ";
    reserveRef(a);
    int capacity = a.capacity();
    reserveCopy(a);
    cout << (a.capacity() >= 100 && a.capacity() == capacity && a[0] == 7) << "\n";
    return 0;
}`,'','1 1\n');
success(program(String.raw`string a = "cat";
a.reserve(10);
string b = a;
b.reserve(30);
cout << (a.capacity() < b.capacity()) << " ";
string c;
c.reserve(40);
c = a;
cout << (c == a && c.capacity() >= 40) << "\n";`),'','1 1\n');
success(String.raw`#include <iostream>
#include <string>
using namespace std;
void reserveRef(string& s) { s.reserve(100); }
void reserveCopy(string s) { s.reserve(200); s += "!"; }
int main() {
    string s = "cat";
    reserveRef(s);
    int capacity = s.capacity();
    reserveCopy(s);
    cout << (s.capacity() >= 100 && s.capacity() == capacity && s == "cat") << "\n";
    return 0;
}`,'','1\n');

for(const kind of ['unordered_set','unordered_map']){
  const declaration=kind==='unordered_set'?'unordered_set<int> table;':'unordered_map<int, int> table;';
  const insertion=kind==='unordered_set'?'table.insert(i);':'table[i] = i + 10;';
  const duplicate=kind==='unordered_set'?'table.insert(3);':'table[3] = 13;';
  const trace=success(program(declaration+'\ntable.max_load_factor(0.7);\nfor(int i=0;i<10;i++) {\n'+insertion+'\n}\n'+duplicate+String.raw`
int count = table.size();
table.reserve(30);
cout << (table.size() == count && table.bucket_count() * table.max_load_factor() >= 30) << " ";
table.rehash(1);
cout << (table.size() == count && table.bucket_count() * table.max_load_factor() >= count) << " ";
cout << (table.count(3) == 1 && table.load_factor() <= table.max_load_factor()) << "\n";`),'','1 1 1\n');
  const item=final(trace,'table');
  assert.equal(item.kind,kind,'An unordered container keeps its own kind');
  assert.equal(item.length,10,'Duplicate insert or existing indexed write does not grow size');
  for(const step of trace.steps){
    const variable=step.variables.find(variable=>variable.name==='table');
    if(variable){
      assert.ok(variable.bucketCount>=1&&variable.bucketCount<=16384);
      assert.ok(Math.abs(variable.loadFactor-variable.length/variable.bucketCount)<1e-9);
      assert.ok(variable.loadFactor<=variable.maxLoadFactor+1e-9,'Automatic rehash keeps load within the configured limit');
    }
  }
}
const unorderedCopy=success(program(String.raw`unordered_map<int, int> a;
a.max_load_factor(0.7);
a.reserve(8);
a[9] = 4;
a[2] = 6;
unordered_map<int, int> b = a;
b.max_load_factor(0.5);
b.reserve(100);
b[9] = 7;
cout << a[9] << " " << b[9] << " " << (a.bucket_count() < b.bucket_count()) << " ";
b.clear();
cout << a.size() << " " << b.size() << "\n";`),'','4 7 1 2 0\n');
const hashBefore=unorderedCopy.steps.find(step=>step.variables.some(variable=>variable.name==='b'&&variable.length===2&&variable.maxLoadFactor===0.7));
assert.ok(hashBefore);
const preservedHash=hashBefore.variables.find(variable=>variable.name==='b');
assert.deepEqual(plain(preservedHash.value),[{key:9,value:4},{key:2,value:6}],'Hash insertion order is a stable teaching view, independent of set/map ordering');
assert.equal(preservedHash.maxLoadFactor,0.7,'Later load-factor changes do not mutate previous snapshots');
const hashAssignment=success(program(String.raw`unordered_set<int> a;
a.max_load_factor(0.7);
a.reserve(8);
a.insert(9);
a.insert(2);
unordered_set<int> b;
b = a;
b.insert(5);
cout << a.size() << " " << b.size() << " " << a.count(5) << "\n";`),'','2 3 0\n');
assert.deepEqual(plain(final(hashAssignment,'a').value),[9,2]);
success(program(String.raw`unordered_map<string, int> counts;
counts["red"]++;
counts["blue"] = 4;
counts["red"]++;
unordered_set<string> names;
names.insert("red");
names.insert("red");
cout << counts["red"] << " " << counts.size() << " " << names.size() << "\n";`),'','2 2 1\n');
for(const body of [
  'unordered_set<pair<int,int>> table;',
  'unordered_map<vector<int>,int> table;',
  'unordered_set<vector<int>> table;',
  'unordered_map<pair<int,int>,int> table;'
])failure(body,/键.*尚未开放|自定义.*不支持|哈希.*键|unsupported.*key/i);
for(const body of [
  'vector<int> a;\na.reserve(-1);',
  'vector<int> a;\na.reserve(1.5);',
  'vector<int> a;\na.reserve(4097);',
  'vector<int> a;\na.resize(4097);',
  'vector<int> a;\na.assign(4097, 1);',
  'string s;\ns.reserve(-1);',
  'string s;\ns.reserve(4097);',
  'string s;\ns.resize(4097);',
  'string s;\ns.assign(4097, \'x\');',
  'unordered_set<int> a;\na.reserve(-1);',
  'unordered_map<int,int> a;\na.reserve(4097);',
  'unordered_set<int> a;\na.rehash(-1);',
  'unordered_set<int> a;\na.rehash(16385);',
  'unordered_set<int> a;\na.max_load_factor(0);',
  'unordered_map<int,int> a;\na.max_load_factor(-0.5);',
  'unordered_set<int> a;\na.max_load_factor(sqrt(-1.0));',
  'unordered_map<int,int> a;\na.max_load_factor(exp(10000.0));',
  'unordered_set<int> a;\na.max_load_factor(0.00001);\na.reserve(4096);'
])failure(body,/正|有限|整数|范围|容量|限制|负载|4096|16384|limit|finite|positive|overflow|NaN|Infinity/i);
failure('string s;\ncin >> s;',/4096|限制|limit/i,'x'.repeat(4097));
failure('string s;\ngetline(cin, s);',/4096|限制|limit/i,'x'.repeat(4097)+'\n');
failure('string s="a";\ns.append("'+'x'.repeat(4096)+'");',/4096|限制|limit/i);
failure('string s="a";\ns += "'+'x'.repeat(4096)+'";',/4096|限制|limit/i);
for(const body of [
  'set<int> a;\na.reserve(10);',
  'map<int,int> a;\na.reserve(10);',
  'set<int> a;\na.resize(10);',
  'map<int,int> a;\na.resize(10);'
])failure(body,/reserve|resize|成员|函数|方法|not found|cannot find/i);

const mixed=success(program('vector<int> a;\na.push_back(1);\nqueue<int> q;\nq.push(3);\nstack<int> st;\nst.push(4);\nstring text = "hi";\nmap<int, int> counts;\ncounts[7] = 5;\nint unused[2] = {8, 9};\na[0] = counts[7] + q.front();'));
const usage=new Map();
for(const step of mixed.steps)for(const name of step.accessed||[])usage.set(name,(usage.get(name)||0)+1);
const select=context.CppLabScene.selectArrays;
for(let i=0;i<mixed.steps.length;i++){
  const step=mixed.steps[i],previous=mixed.steps[i-1],selected=select(step,previous,usage);
  const visible=step.variables.filter(variable=>Array.isArray(variable.value)||variable.kind==='string');
  assert.equal(selected.length,Math.min(3,visible.length),'Arrays and STL containers share the three-card maximum');
  assert.equal(new Set(selected.map(entry=>entry.item.name)).size,selected.length);
  assert.deepEqual(plain(select(step,previous,usage).map(entry=>entry.item.name)),plain(selected.map(entry=>entry.item.name)),'Replay selection must be deterministic');
  if(step.variables.some(variable=>variable.name==='text'))assert.ok(select(step,previous,usage,'text').some(entry=>entry.item.name==='text'),'A string can be manually retained');
}
const active=mixed.steps.find(step=>step.message.includes('a[0] = counts[7] + q.front()'));
assert.ok(active);
assert.deepEqual(plain(select(active,mixed.steps[mixed.steps.indexOf(active)-1],usage).map(entry=>entry.item.name)),['a','q','counts'],'Executed container reads outrank unused arrays');
console.log('Verified nine browser STL examples, typed snapshots, immutable replay, copy/reference behavior, bounds/empty/size errors and reserved features.');
console.log('Verified vector/string capacity teaching models, input and assignment growth, unordered hash load/buckets, rehash/reserve, limits and unsupported custom keys.');
console.log('Verified combined arrays and STL containers stay within three displayed cards, respect manual pins and prioritize active values.');
