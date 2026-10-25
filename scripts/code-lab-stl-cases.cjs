'use strict';

module.exports=[
  {id:'stl-vector',name:'STL · vector 动态数组',array:'a',input:'4\n5 2 9 4',expected:'3 21\n',expectedKind:'vector',expectedValues:[5,7,9],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a;
    a.reserve(8);
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        a.push_back(x);
    }
    a[1] = 7;
    a.pop_back();
    int capacity = a.capacity();
    int sum = 0;
    for (int i = 0; i < a.size(); i++) {
        sum += a[i];
    }
    cout << a.size() << " " << sum << "\n";
    return 0;
}`},
  {id:'stl-string',name:'STL · string 字符串',array:'s',input:'',expected:'Algorithm 9 l\n',expectedKind:'string',expectedValues:'Algorithm',code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    string s = "algo";
    s.reserve(16);
    s += "rithm";
    s[0] = 'A';
    int capacity = s.capacity();
    cout << s << " " << s.size() << " " << s[1] << "\n";
    return 0;
}`},
  {id:'stl-queue',name:'STL · queue 队列',array:'q',input:'',expected:'7 11 2\n',expectedKind:'queue',expectedValues:[7,11],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    queue<int> q;
    q.push(3);
    q.push(7);
    q.push(11);
    q.pop();
    cout << q.front() << " " << q.back() << " " << q.size() << "\n";
    return 0;
}`},
  {id:'stl-stack',name:'STL · stack 栈',array:'st',input:'',expected:'7 2\n',expectedKind:'stack',expectedValues:[3,7],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    stack<int> st;
    st.push(3);
    st.push(7);
    st.push(11);
    st.pop();
    cout << st.top() << " " << st.size() << "\n";
    return 0;
}`},
  {id:'stl-pair',name:'STL · pair 数对',array:'p',input:'',expected:'2 7\n',expectedKind:'pair',expectedValues:[2,7],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    pair<int, int> p = make_pair(2, 5);
    p.second += p.first;
    cout << p.first << " " << p.second << "\n";
    return 0;
}`},
  {id:'stl-set',name:'STL · set 有序集合',array:'values',input:'',expected:'2 1 0\n',expectedKind:'set',expectedValues:[2,5],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    set<int> values;
    values.insert(7);
    values.insert(2);
    values.insert(7);
    values.insert(5);
    values.erase(7);
    cout << values.size() << " " << values.count(2) << " " << values.count(7) << "\n";
    return 0;
}`},
  {id:'stl-map',name:'STL · map 键值计数',array:'counts',input:'',expected:'3 2 2 0\n',expectedKind:'map',expectedValues:[{key:2,value:3},{key:4,value:2}],code:String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    map<int, int> counts;
    counts[4]++;
    counts[2] += 3;
    counts[4]++;
    counts[7] = 9;
    counts.erase(7);
    cout << counts[2] << " " << counts[4] << " " << counts.size() << " " << counts.count(7) << "\n";
    return 0;
}`},
  {id:'stl-unordered-set',name:'STL · unordered_set 哈希集合',array:'values',input:'',expected:'2 1 0 1 1\n',expectedKind:'unordered_set',expectedValues:[2,5],code:String.raw`#include <iostream>
#include <unordered_set>

int main() {
    std::unordered_set<int> values;
    values.max_load_factor(0.7);
    values.reserve(8);
    values.insert(7);
    values.insert(2);
    values.insert(7);
    values.insert(5);
    values.erase(7);
    std::cout << values.size() << " " << values.count(2) << " " << values.count(7) << " ";
    std::cout << (values.bucket_count() * values.max_load_factor() >= 8) << " ";
    std::cout << (values.load_factor() <= values.max_load_factor()) << "\n";
    return 0;
}`},
  {id:'stl-unordered-map',name:'STL · unordered_map 哈希计数',array:'counts',input:'',expected:'3 2 2 0 1 1\n',expectedKind:'unordered_map',expectedValues:[{key:4,value:2},{key:2,value:3}],code:String.raw`#include <iostream>
#include <unordered_map>

int main() {
    std::unordered_map<int, int> counts;
    counts.max_load_factor(0.7);
    counts.reserve(8);
    counts[4]++;
    counts[2] += 3;
    counts[4]++;
    counts[7] = 9;
    counts.erase(7);
    std::cout << counts[2] << " " << counts[4] << " " << counts.size() << " " << counts.count(7) << " ";
    std::cout << (counts.bucket_count() * counts.max_load_factor() >= 8) << " ";
    std::cout << (counts.load_factor() <= counts.max_load_factor()) << "\n";
    return 0;
}`}
];
