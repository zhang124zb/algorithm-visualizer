(function(C){
  'use strict';
  C.code('bit-count',`int bitCount(unsigned int x) {
init|    int answer = 0;
loop|    while (x != 0) {
low|        unsigned int low = x & -x;
clear|        x -= low;
count|        ++answer;
    }
return|    return answer;
}`,`def bit_count(x):
init|    answer = 0
loop|    while x != 0:
low|        low = x & -x
clear|        x -= low
count|        answer += 1
return|    return answer`, `static int bitCount(int x) {
init|    int answer = 0;
loop|    while (x != 0) {
low|        int low = x & -x;
clear|        x -= low;
count|        ++answer;
    }
return|    return answer;
}`);
  C.code('compression',`vector<int> compress(vector<int> a) {
copy|    vector<int> keys = a;
sort|    sort(keys.begin(), keys.end());
unique|    keys.erase(unique(keys.begin(), keys.end()), keys.end());
loop|    for (int& x : a) {
rank|        x = lower_bound(keys.begin(), keys.end(), x) - keys.begin();
    }
return|    return a;
}`,`from bisect import bisect_left
def compress(a):
copy|    keys = list(a)
sort|    keys.sort()
unique|    keys = sorted(set(keys))
loop|    for i in range(len(a)):
rank|        a[i] = bisect_left(keys, a[i])
return|    return a`, `static int[] compress(int[] a) {
copy|    int[] keys = a.clone();
sort|    Arrays.sort(keys);
unique|    keys = Arrays.stream(keys).distinct().toArray();
loop|    for (int i = 0; i < a.length; i++) {
rank|        a[i] = Arrays.binarySearch(keys, a[i]);
    }
return|    return a;
}`);
  C.code('prefix-2d',`int prefix2d(vector<vector<int>> a, int x1, int y1, int x2, int y2) {
init|    vector<vector<int>> p(a.size()+1, vector<int>(a[0].size()+1));
row|    for (int i=1; i<=(int)a.size(); i++) {
col|        for (int j=1; j<=(int)a[0].size(); j++) {
add|            p[i][j]=a[i-1][j-1]+p[i-1][j]+p[i][j-1]-p[i-1][j-1];
        }
    }
return|    return p[x2+1][y2+1]-p[x1][y2+1]-p[x2+1][y1]+p[x1][y1];
}`,`def prefix2d(a, x1, y1, x2, y2):
init|    p = [[0]*(len(a[0])+1) for _ in range(len(a)+1)]
row|    for i in range(1, len(a)+1):
col|        for j in range(1, len(a[0])+1):
add|            p[i][j] = a[i-1][j-1]+p[i-1][j]+p[i][j-1]-p[i-1][j-1]
return|    return p[x2+1][y2+1]-p[x1][y2+1]-p[x2+1][y1]+p[x1][y1]`, `static int prefix2d(int[][] a,int x1,int y1,int x2,int y2) {
init|    int[][] p = new int[a.length+1][a[0].length+1];
row|    for (int i=1;i<=a.length;i++) {
col|        for (int j=1;j<=a[0].length;j++) {
add|            p[i][j]=a[i-1][j-1]+p[i-1][j]+p[i][j-1]-p[i-1][j-1];
        }
    }
return|    return p[x2+1][y2+1]-p[x1][y2+1]-p[x2+1][y1]+p[x1][y1];
}`);
  C.code('difference-2d',`vector<vector<int>> rectangleAdd(int n,int m,int x1,int y1,int x2,int y2,int v) {
init|    vector<vector<int>> d(n+1,vector<int>(m+1)),a(n,vector<int>(m));
mark|    d[x1][y1]+=v; d[x2+1][y1]-=v; d[x1][y2+1]-=v; d[x2+1][y2+1]+=v;
row|    for(int i=0;i<n;i++) {
col|        for(int j=0;j<m;j++) {
restore|            a[i][j]=d[i][j]+(i?a[i-1][j]:0)+(j?a[i][j-1]:0)-(i&&j?a[i-1][j-1]:0);
        }
    }
return|    return a;
}`,`def rectangle_add(n,m,x1,y1,x2,y2,v):
init|    d=[[0]*(m+1) for _ in range(n+1)]; a=[[0]*m for _ in range(n)]
mark|    d[x1][y1]+=v; d[x2+1][y1]-=v; d[x1][y2+1]-=v; d[x2+1][y2+1]+=v
row|    for i in range(n):
col|        for j in range(m):
restore|            a[i][j]=d[i][j]+(a[i-1][j] if i else 0)+(a[i][j-1] if j else 0)-(a[i-1][j-1] if i and j else 0)
return|    return a`, `static int[][] rectangleAdd(int n,int m,int x1,int y1,int x2,int y2,int v) {
init|    int[][] d=new int[n+1][m+1],a=new int[n][m];
mark|    d[x1][y1]+=v; d[x2+1][y1]-=v; d[x1][y2+1]-=v; d[x2+1][y2+1]+=v;
row|    for(int i=0;i<n;i++) {
col|        for(int j=0;j<m;j++) {
restore|            a[i][j]=d[i][j]+(i>0?a[i-1][j]:0)+(j>0?a[i][j-1]:0)-(i>0&&j>0?a[i-1][j-1]:0);
        }
    }
return|    return a;
}`);
  C.code('big-add',`string bigAdd(string a,string b) {
init|    int i=(int)a.size()-1,j=(int)b.size()-1,carry=0; string out;
loop|    while(i>=0 || j>=0 || carry) {
sum|        int sum=(i>=0?a[i--]-'0':0)+(j>=0?b[j--]-'0':0)+carry;
digit|        out.push_back(char('0'+sum%10));
carry|        carry=sum/10;
    }
return|    reverse(out.begin(),out.end()); return out;
}`,`def big_add(a,b):
init|    i,j,carry=len(a)-1,len(b)-1,0; out=[]
loop|    while i>=0 or j>=0 or carry:
sum|        total=(int(a[i]) if i>=0 else 0)+(int(b[j]) if j>=0 else 0)+carry; i-=1; j-=1
digit|        out.append(str(total%10))
carry|        carry=total//10
return|    return ''.join(reversed(out))`, `static String bigAdd(String a,String b) {
init|    int i=a.length()-1,j=b.length()-1,carry=0; StringBuilder out=new StringBuilder();
loop|    while(i>=0 || j>=0 || carry!=0) {
sum|        int sum=(i>=0?a.charAt(i--)-'0':0)+(j>=0?b.charAt(j--)-'0':0)+carry;
digit|        out.append(sum%10);
carry|        carry=sum/10;
    }
return|    return out.reverse().toString();
}`);
})(AlgoLab.competition);
