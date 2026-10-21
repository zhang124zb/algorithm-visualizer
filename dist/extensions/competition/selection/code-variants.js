(function(C){
  C.code('binary-answer',`int splitLimit(vector<int> a,int k) {
init|    int lo=*max_element(a.begin(),a.end()),hi=accumulate(a.begin(),a.end(),0);
loop|    while(lo<hi) {
mid|        int mid=lo+(hi-lo)/2,parts=1,sum=0;
scan|        for(int x:a) {
cut|            if(sum+x>mid) { ++parts; sum=0; }
add|            sum+=x;
        }
move|        if(parts<=k) hi=mid; else lo=mid+1;
    }
return|    return lo;
}`,`def split_limit(a,k):
init|    lo,hi=max(a),sum(a)
loop|    while lo<hi:
mid|        mid=(lo+hi)//2; parts=1; total=0
scan|        for x in a:
cut|            if total+x>mid: parts+=1; total=0
add|            total+=x
move|        if parts<=k: hi=mid
        else: lo=mid+1
return|    return lo`, `static int splitLimit(int[] a,int k) {
init|    int lo=Arrays.stream(a).max().getAsInt(),hi=Arrays.stream(a).sum();
loop|    while(lo<hi) {
mid|        int mid=lo+(hi-lo)/2,parts=1,sum=0;
scan|        for(int x:a) {
cut|            if(sum+x>mid) { ++parts; sum=0; }
add|            sum+=x;
        }
move|        if(parts<=k) hi=mid; else lo=mid+1;
    }
return|    return lo;
}`);
  C.code('real-binary',`double root(double x) {
init|    double lo=0,hi=max(1.0,x);
loop|    for(int i=0;i<60;i++) {
mid|        double mid=(lo+hi)/2;
move|        if(mid*mid<=x) lo=mid; else hi=mid;
    }
return|    return (lo+hi)/2;
}`,`def root(x):
init|    lo,hi=0.0,max(1.0,x)
loop|    for i in range(60):
mid|        mid=(lo+hi)/2
move|        if mid*mid<=x: lo=mid
        else: hi=mid
return|    return (lo+hi)/2`, `static double root(double x) {
init|    double lo=0,hi=Math.max(1.0,x);
loop|    for(int i=0;i<60;i++) {
mid|        double mid=(lo+hi)/2;
move|        if(mid*mid<=x) lo=mid; else hi=mid;
    }
return|    return (lo+hi)/2;
}`);
  C.code('inversions',`long long inversions(vector<int>& a,int l,int r) {
base|    if(r-l<=1) return 0;
split|    int m=(l+r)/2;
recur|    long long answer=inversions(a,l,m)+inversions(a,m,r);
init|    vector<int> b; int i=l,j=m;
loop|    while(i<m || j<r) {
left|        if(j==r || (i<m && a[i]<=a[j])) b.push_back(a[i++]);
right|        else { answer+=m-i; b.push_back(a[j++]); }
    }
copy|    copy(b.begin(),b.end(),a.begin()+l);
return|    return answer;
}`,`def inversions(a,l,r):
base|    if r-l<=1: return 0
split|    m=(l+r)//2
recur|    answer=inversions(a,l,m)+inversions(a,m,r)
init|    b=[]; i=l; j=m
loop|    while i<m or j<r:
left|        if j==r or (i<m and a[i]<=a[j]): b.append(a[i]); i+=1
right|        else: answer+=m-i; b.append(a[j]); j+=1
copy|    a[l:r]=b
return|    return answer`, `static long inversions(int[] a,int l,int r) {
base|    if(r-l<=1) return 0;
split|    int m=(l+r)/2;
recur|    long answer=inversions(a,l,m)+inversions(a,m,r);
init|    int[] b=new int[r-l]; int i=l,j=m,p=0;
loop|    while(i<m || j<r) {
left|        if(j==r || (i<m && a[i]<=a[j])) b[p++]=a[i++];
right|        else { answer+=m-i; b[p++]=a[j++]; }
    }
copy|    System.arraycopy(b,0,a,l,b.length);
return|    return answer;
}`);
})(AlgoLab.competition);
