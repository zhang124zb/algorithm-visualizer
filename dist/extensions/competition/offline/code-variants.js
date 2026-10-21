(function(C){
  C.code('offline-threshold',`vector<int> offlineCount(vector<int> a,vector<array<int,3>> queries) {
init|    int n=a.size(); vector<int> bit(n+1),answer(queries.size()),order(n),ids(queries.size()); iota(order.begin(),order.end(),0); iota(ids.begin(),ids.end(),0);
    auto add=[&](int i) {
add|        for(;i<=n;i+=i&-i) ++bit[i];
    };
    auto prefix=[&](int i) { int count=0;
prefix|        for(;i>0;i-=i&-i) count+=bit[i];
        return count;
    };
sort|    sort(order.begin(),order.end(),[&](int i,int j){return a[i]<a[j];}); sort(ids.begin(),ids.end(),[&](int i,int j){return queries[i][2]<queries[j][2];});
pointer|    int p=0;
loop|    for(int id:ids) {
activate|        while(p<n && a[order[p]]<=queries[id][2]) { add(order[p]+1); ++p; }
query|        answer[id]=prefix(queries[id][1]+1)-prefix(queries[id][0]);
    }
return|    return answer;
}`,`def offline_count(a,queries):
init|    n=len(a); bit=[0]*(n+1); answer=[0]*len(queries)
    def add(i):
add|        while i<=n: bit[i]+=1; i+=i&-i
    def prefix(i):
        count=0
prefix|        while i>0: count+=bit[i]; i-=i&-i
        return count
sort|    order=sorted(range(n),key=lambda i:a[i]); ids=sorted(range(len(queries)),key=lambda i:queries[i][2])
pointer|    p=0
loop|    for idx in ids:
activate|        while p<n and a[order[p]]<=queries[idx][2]: add(order[p]+1); p+=1
query|        answer[idx]=prefix(queries[idx][1]+1)-prefix(queries[idx][0])
return|    return answer`, `static void add(int[] bit,int i) {
add|    for(;i<bit.length;i+=i&-i) ++bit[i];
}
static int prefix(int[] bit,int i) { int count=0;
prefix|    for(;i>0;i-=i&-i) count+=bit[i];
    return count;
}
static int[] offlineCount(int[] a,int[][] queries) {
init|    int n=a.length; int[] bit=new int[n+1],answer=new int[queries.length]; Integer[] order=new Integer[n],ids=new Integer[queries.length]; for(int i=0;i<n;i++) order[i]=i; for(int i=0;i<ids.length;i++) ids[i]=i;
sort|    Arrays.sort(order,Comparator.comparingInt(i->a[i])); Arrays.sort(ids,Comparator.comparingInt(i->queries[i][2]));
pointer|    int p=0;
loop|    for(int id:ids) {
activate|        while(p<n && a[order[p]]<=queries[id][2]) { add(bit,order[p]+1); ++p; }
query|        answer[id]=prefix(bit,queries[id][1]+1)-prefix(bit,queries[id][0]);
    }
return|    return answer;
}`);
  C.code('mo-distinct',`vector<int> moDistinct(vector<int> a,vector<pair<int,int>> queries) {
init|    int block=max(1,(int)sqrt(a.size())),left=0,right=-1,distinct=0; unordered_map<int,int> count; vector<int> answer(queries.size()),ids(queries.size()); iota(ids.begin(),ids.end(),0);
sort|    sort(ids.begin(),ids.end(),[&](int i,int j){auto x=queries[i],y=queries[j]; if(x.first/block!=y.first/block) return x.first<y.first; return x.first/block%2?x.second>y.second:x.second<y.second;});
    auto add=[&](int i) {
add|        if(count[a[i]]++==0) ++distinct;
    };
    auto remove=[&](int i) {
remove|        if(--count[a[i]]==0) --distinct;
    };
loop|    for(int id:ids) { auto [l,r]=queries[id];
expandLeft|        while(left>l) add(--left);
expandRight|        while(right<r) add(++right);
shrinkLeft|        while(left<l) remove(left++);
shrinkRight|        while(right>r) remove(right--);
answer|        answer[id]=distinct;
    }
return|    return answer;
}`,`from collections import defaultdict
from math import isqrt
def mo_distinct(a,queries):
init|    block=max(1,isqrt(len(a))); left=0; right=-1; distinct=0; count=defaultdict(int); answer=[0]*len(queries)
sort|    ids=sorted(range(len(queries)),key=lambda i:(queries[i][0]//block,queries[i][1]*(-1 if (queries[i][0]//block)%2 else 1)))
    def add(i):
        nonlocal distinct
add|        if count[a[i]]==0: distinct+=1
        count[a[i]]+=1
    def remove(i):
        nonlocal distinct
remove|        count[a[i]]-=1
        if count[a[i]]==0: distinct-=1
loop|    for idx in ids:
        l,r=queries[idx]
expandLeft|        while left>l: left-=1; add(left)
expandRight|        while right<r: right+=1; add(right)
shrinkLeft|        while left<l: remove(left); left+=1
shrinkRight|        while right>r: remove(right); right-=1
answer|        answer[idx]=distinct
return|    return answer`, `static int[] moDistinct(int[] a,int[][] queries) {
init|    int block=Math.max(1,(int)Math.sqrt(a.length)); int left=0,right=-1; int[] distinct={0},answer=new int[queries.length]; Map<Integer,Integer> count=new HashMap<>(); Integer[] ids=new Integer[queries.length]; for(int i=0;i<ids.length;i++) ids[i]=i;
sort|    Arrays.sort(ids,(i,j)->{int x=queries[i][0]/block,y=queries[j][0]/block; return x!=y?Integer.compare(x,y):Integer.compare(queries[i][1],queries[j][1])*(x%2==0?1:-1);});
    java.util.function.IntConsumer add=i->{
add|        int old=count.getOrDefault(a[i],0); if(old==0) distinct[0]++; count.put(a[i],old+1);
    };
    java.util.function.IntConsumer remove=i->{
remove|        int value=count.get(a[i])-1; count.put(a[i],value); if(value==0) distinct[0]--;
    };
loop|    for(int id:ids) { int l=queries[id][0],r=queries[id][1];
expandLeft|        while(left>l) add.accept(--left);
expandRight|        while(right<r) add.accept(++right);
shrinkLeft|        while(left<l) remove.accept(left++);
shrinkRight|        while(right>r) remove.accept(right--);
answer|        answer[id]=distinct[0];
    }
return|    return answer;
}`);
})(AlgoLab.competition);
