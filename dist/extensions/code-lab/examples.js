(function(root){
  'use strict';
  root.CppLabExamples=[
    {id:'bubble',name:'冒泡排序',array:'a',input:'8\n42 17 35 8 26 51 13 29',random:'array',code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[8] = {0};
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                int temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
    for (int i = 0; i < n; i++) {
        cout << a[i] << " ";
    }
    return 0;
}`},
    {id:'binary',name:'二分查找',array:'a',input:'8 26\n8 13 17 26 29 35 42 51',random:'sorted',code:`#include <iostream>
using namespace std;

int main() {
    int n, target;
    cin >> n >> target;
    int a[8] = {0};
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    int left = 0, right = n - 1, answer = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (a[mid] == target) {
            answer = mid;
            break;
        }
        if (a[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    cout << answer << endl;
    return 0;
}`},
    {id:'prefix',name:'前缀和',array:'prefix',input:'8\n4 7 2 9 3 6 1 5',random:'array',code:`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int a[8] = {0};
    int prefix[9] = {0};
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        prefix[i + 1] = prefix[i] + a[i];
    }
    cout << prefix[n] << endl;
    return 0;
}`},
    {id:'matrix',name:'二维数组',array:'a',input:'',code:`#include <iostream>
using namespace std;

int main() {
    int a[4][4];
    int total = 0;
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            a[i][j] = (i + 1) * (j + 1);
            total += a[i][j];
        }
    }
    cout << total << endl;
    return 0;
}`},
    {id:'recursion',name:'递归与调用栈',array:'',input:'5',random:'recursion',code:`#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    int child = factorial(n - 1);
    int answer = n * child;
    return answer;
}

int main() {
    int n;
    cin >> n;
    int result = factorial(n);
    cout << result << endl;
    return 0;
}`}
  ];
})(typeof self==='undefined'?globalThis:self);
