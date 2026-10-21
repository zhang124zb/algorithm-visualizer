(function(C){
  const cpp=`using P=array<long long,2>;
long long cross(P a,P b,P c) { return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]); }
`,py=`def cross(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
`,java=`static long cross(long[] a,long[] b,long[] c) { return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]); }
`;
  C.code('cross-product',`long long orientation(array<long long,2> a,array<long long,2> b,array<long long,2> c) {
vector|    long long x1=b[0]-a[0],y1=b[1]-a[1],x2=c[0]-a[0],y2=c[1]-a[1];
cross|    long long value=x1*y2-y1*x2;
return|    return value;
}`,`def orientation(a,b,c):
vector|    x1,y1=b[0]-a[0],b[1]-a[1]; x2,y2=c[0]-a[0],c[1]-a[1]
cross|    value=x1*y2-y1*x2
return|    return value`, `static long orientation(long[] a,long[] b,long[] c) {
vector|    long x1=b[0]-a[0],y1=b[1]-a[1],x2=c[0]-a[0],y2=c[1]-a[1];
cross|    long value=x1*y2-y1*x2;
return|    return value;
}`);
  C.code('segment-intersection',cpp+`bool intersects(P a,P b,P c,P d) {
bbox|    if(max(a[0],b[0])<min(c[0],d[0]) || max(c[0],d[0])<min(a[0],b[0]) || max(a[1],b[1])<min(c[1],d[1]) || max(c[1],d[1])<min(a[1],b[1])) return false;
cross|    long long x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
test|    bool first=(x<=0 && y>=0)||(x>=0 && y<=0),second=(z<=0 && w>=0)||(z>=0 && w<=0);
return|    return first && second;
}`,py+`def intersects(a,b,c,d):
bbox|    if max(a[0],b[0])<min(c[0],d[0]) or max(c[0],d[0])<min(a[0],b[0]) or max(a[1],b[1])<min(c[1],d[1]) or max(c[1],d[1])<min(a[1],b[1]): return False
cross|    x,y,z,w=cross(a,b,c),cross(a,b,d),cross(c,d,a),cross(c,d,b)
test|    first=(x<=0<=y or y<=0<=x); second=(z<=0<=w or w<=0<=z)
return|    return first and second`,java+`static boolean intersects(long[] a,long[] b,long[] c,long[] d) {
bbox|    if(Math.max(a[0],b[0])<Math.min(c[0],d[0]) || Math.max(c[0],d[0])<Math.min(a[0],b[0]) || Math.max(a[1],b[1])<Math.min(c[1],d[1]) || Math.max(c[1],d[1])<Math.min(a[1],b[1])) return false;
cross|    long x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
test|    boolean first=(x<=0 && y>=0)||(x>=0 && y<=0),second=(z<=0 && w>=0)||(z>=0 && w<=0);
return|    return first && second;
}`);
  C.code('convex-hull',cpp+`vector<P> hull(vector<P> p) {
sort|    sort(p.begin(),p.end()); p.erase(unique(p.begin(),p.end()),p.end());
base|    if(p.size()<=1) return p;
init|    vector<P> h;
lower|    for(P point:p) {
popLower|        while(h.size()>=2 && cross(h[h.size()-2],h.back(),point)<=0) h.pop_back();
pushLower|        h.push_back(point);
    }
split|    int threshold=h.size()+1;
upper|    for(int i=(int)p.size()-2;i>=0;i--) {
popUpper|        while((int)h.size()>=threshold && cross(h[h.size()-2],h.back(),p[i])<=0) h.pop_back();
pushUpper|        h.push_back(p[i]);
    }
return|    h.pop_back(); return h;
}`,py+`def hull(points):
sort|    p=sorted(set(map(tuple,points)))
base|    if len(p)<=1: return p
init|    h=[]
lower|    for point in p:
popLower|        while len(h)>=2 and cross(h[-2],h[-1],point)<=0: h.pop()
pushLower|        h.append(point)
split|    threshold=len(h)+1
upper|    for point in reversed(p[:-1]):
popUpper|        while len(h)>=threshold and cross(h[-2],h[-1],point)<=0: h.pop()
pushUpper|        h.append(point)
return|    return h[:-1]`,java+`static long[][] hull(long[][] points) {
sort|    List<long[]> p=new ArrayList<>(Arrays.asList(points)); p.sort((a,b)->a[0]==b[0]?Long.compare(a[1],b[1]):Long.compare(a[0],b[0]));
    List<long[]> unique=new ArrayList<>(); for(long[] x:p) if(unique.isEmpty() || !Arrays.equals(x,unique.get(unique.size()-1))) unique.add(x); p=unique;
base|    if(p.size()<=1) return p.toArray(new long[0][]);
init|    List<long[]> h=new ArrayList<>();
lower|    for(long[] point:p) {
popLower|        while(h.size()>=2 && cross(h.get(h.size()-2),h.get(h.size()-1),point)<=0) h.remove(h.size()-1);
pushLower|        h.add(point);
    }
split|    int threshold=h.size()+1;
upper|    for(int i=p.size()-2;i>=0;i--) {
popUpper|        while(h.size()>=threshold && cross(h.get(h.size()-2),h.get(h.size()-1),p.get(i))<=0) h.remove(h.size()-1);
pushUpper|        h.add(p.get(i));
    }
return|    h.remove(h.size()-1); return h.toArray(new long[0][]);
}`);
})(AlgoLab.competition);
