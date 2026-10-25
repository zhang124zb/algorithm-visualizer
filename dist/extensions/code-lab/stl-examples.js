(function(root){root.CppLabSTLExamples=[
  {
    "id": "stl-vector",
    "name": "STL · vector 动态数组",
    "array": "a",
    "input": "4\n5 2 9 4",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a;\n    a.reserve(8);\n    for (int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        a.push_back(x);\n    }\n    a[1] = 7;\n    a.pop_back();\n    int capacity = a.capacity();\n    int sum = 0;\n    for (int i = 0; i < a.size(); i++) {\n        sum += a[i];\n    }\n    cout << a.size() << \" \" << sum << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-string",
    "name": "STL · string 字符串",
    "array": "s",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s = \"algo\";\n    s.reserve(16);\n    s += \"rithm\";\n    s[0] = 'A';\n    int capacity = s.capacity();\n    cout << s << \" \" << s.size() << \" \" << s[1] << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-queue",
    "name": "STL · queue 队列",
    "array": "q",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    queue<int> q;\n    q.push(3);\n    q.push(7);\n    q.push(11);\n    q.pop();\n    cout << q.front() << \" \" << q.back() << \" \" << q.size() << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-stack",
    "name": "STL · stack 栈",
    "array": "st",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    stack<int> st;\n    st.push(3);\n    st.push(7);\n    st.push(11);\n    st.pop();\n    cout << st.top() << \" \" << st.size() << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-pair",
    "name": "STL · pair 数对",
    "array": "p",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    pair<int, int> p = make_pair(2, 5);\n    p.second += p.first;\n    cout << p.first << \" \" << p.second << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-set",
    "name": "STL · set 有序集合",
    "array": "values",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    set<int> values;\n    values.insert(7);\n    values.insert(2);\n    values.insert(7);\n    values.insert(5);\n    values.erase(7);\n    cout << values.size() << \" \" << values.count(2) << \" \" << values.count(7) << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-map",
    "name": "STL · map 键值计数",
    "array": "counts",
    "input": "",
    "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    map<int, int> counts;\n    counts[4]++;\n    counts[2] += 3;\n    counts[4]++;\n    counts[7] = 9;\n    counts.erase(7);\n    cout << counts[2] << \" \" << counts[4] << \" \" << counts.size() << \" \" << counts.count(7) << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-unordered-set",
    "name": "STL · unordered_set 哈希集合",
    "array": "values",
    "input": "",
    "code": "#include <iostream>\n#include <unordered_set>\n\nint main() {\n    std::unordered_set<int> values;\n    values.max_load_factor(0.7);\n    values.reserve(8);\n    values.insert(7);\n    values.insert(2);\n    values.insert(7);\n    values.insert(5);\n    values.erase(7);\n    std::cout << values.size() << \" \" << values.count(2) << \" \" << values.count(7) << \" \";\n    std::cout << (values.bucket_count() * values.max_load_factor() >= 8) << \" \";\n    std::cout << (values.load_factor() <= values.max_load_factor()) << \"\\n\";\n    return 0;\n}"
  },
  {
    "id": "stl-unordered-map",
    "name": "STL · unordered_map 哈希计数",
    "array": "counts",
    "input": "",
    "code": "#include <iostream>\n#include <unordered_map>\n\nint main() {\n    std::unordered_map<int, int> counts;\n    counts.max_load_factor(0.7);\n    counts.reserve(8);\n    counts[4]++;\n    counts[2] += 3;\n    counts[4]++;\n    counts[7] = 9;\n    counts.erase(7);\n    std::cout << counts[2] << \" \" << counts[4] << \" \" << counts.size() << \" \" << counts.count(7) << \" \";\n    std::cout << (counts.bucket_count() * counts.max_load_factor() >= 8) << \" \";\n    std::cout << (counts.load_factor() <= counts.max_load_factor()) << \"\\n\";\n    return 0;\n}"
  }
];})(typeof self==="undefined"?globalThis:self);
