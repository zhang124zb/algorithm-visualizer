(function(root){
  'use strict';
  const java=(body,methods='')=>'import java.util.Scanner;\n\npublic class Main {\n'+methods+'    public static void main(String[] args) {\n'+body+'\n    }\n}';
  const python=[
    {id:'bubble',name:'冒泡排序',input:'8\n42 17 35 8 26 51 13 29',random:'array',code:`n = int(input())
a = list(map(int, input().split()))
for i in range(n - 1):
    for j in range(n - i - 1):
        if a[j] > a[j + 1]:
            temp = a[j]
            a[j] = a[j + 1]
            a[j + 1] = temp
print(*a)`},
    {id:'binary',name:'二分查找',input:'8 26\n8 13 17 26 29 35 42 51',random:'sorted',code:`n, target = map(int, input().split())
a = list(map(int, input().split()))
left = 0
right = n - 1
answer = -1
while left <= right:
    mid = (left + right) // 2
    if a[mid] == target:
        answer = mid
        break
    if a[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
print(answer)`},
    {id:'prefix',name:'前缀和',input:'8\n4 7 2 9 3 6 1 5',random:'array',code:`n = int(input())
a = list(map(int, input().split()))
prefix = [0] * (n + 1)
for i in range(n):
    prefix[i + 1] = prefix[i] + a[i]
print(prefix[n])`},
    {id:'matrix',name:'二维列表',input:'',code:`a = [[0] * 4 for _ in range(4)]
total = 0
for i in range(4):
    for j in range(4):
        a[i][j] = (i + 1) * (j + 1)
        total += a[i][j]
print(total)`},
    {id:'recursion',name:'递归与调用栈',input:'5',random:'recursion',code:`def factorial(n):
    if n <= 1:
        return 1
    child = factorial(n - 1)
    answer = n * child
    return answer

n = int(input())
result = factorial(n)
print(result)`}
  ];
  const javaExamples=[
    {id:'bubble',name:'冒泡排序',input:python[0].input,random:'array',code:java(`        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[8];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
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
            System.out.print(a[i] + " ");
        }
        sc.close();`)},
    {id:'binary',name:'二分查找',input:python[1].input,random:'sorted',code:java(`        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] a = new int[8];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }
        int left = 0;
        int right = n - 1;
        int answer = -1;
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
        System.out.println(answer);
        sc.close();`)},
    {id:'prefix',name:'前缀和',input:python[2].input,random:'array',code:java(`        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[8];
        int[] prefix = new int[9];
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
            prefix[i + 1] = prefix[i] + a[i];
        }
        System.out.println(prefix[n]);
        sc.close();`)},
    {id:'matrix',name:'二维数组',input:'',code:java(`        int[][] a = new int[4][4];
        int total = 0;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                a[i][j] = (i + 1) * (j + 1);
                total += a[i][j];
            }
        }
        System.out.println(total);`)},
    {id:'recursion',name:'递归与调用栈',input:'5',random:'recursion',code:java(`        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int result = factorial(n);
        System.out.println(result);
        sc.close();`,`    static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        int child = factorial(n - 1);
        int answer = n * child;
        return answer;
    }

`)}
  ];
  root.LabLanguages={
    cpp:{name:'C++',file:'main.cpp',extension:'.cpp',input:'cin',output:'cout',examples:[...root.CppLabExamples,...(root.CppLabSTLExamples||[])],support:'C++ 教学模式 · 已接入 vector、string、queue、stack、pair、set、map、unordered_set、unordered_map；支持容量预留与桶数观察。'},
    python:{name:'Python',file:'main.py',extension:'.py',input:'input()',output:'print()',examples:python,support:'Python 3 教学兼容模式，支持列表、条件、循环、函数与递归；第三方包和部分新语法暂不支持。'},
    java:{name:'Java',file:'Main.java',extension:'.java',input:'Scanner',output:'System.out',examples:javaExamples,support:'Java 非商业教学模式，支持基本类型、数组、循环、static 方法与 Scanner；不包含完整 JVM 或集合库。'}
  };
})(typeof self==='undefined'?globalThis:self);
