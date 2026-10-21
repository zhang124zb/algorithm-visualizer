(function(C){
  C.code('factorization',`vector<int> factor(int n) {
init|    vector<int> factors;
loop|    for(int p=2;p<=n/p;p++) {
test|        while(n%p==0) {
divide|            factors.push_back(p); n/=p;
        }
    }
remain|    if(n>1) factors.push_back(n);
return|    return factors;
}`,`def factor(n):
init|    factors=[]; p=2
loop|    while p<=n//p:
test|        while n%p==0:
divide|            factors.append(p); n//=p
        p+=1
remain|    if n>1: factors.append(n)
return|    return factors`, `static List<Integer> factor(int n) {
init|    List<Integer> factors=new ArrayList<>();
loop|    for(int p=2;p<=n/p;p++) {
test|        while(n%p==0) {
divide|            factors.add(p); n/=p;
        }
    }
remain|    if(n>1) factors.add(n);
return|    return factors;
}`);
  C.code('extended-gcd',`vector<long long> exgcd(long long a,long long b) {
base|    if(b==0) return {a,1,0};
recur|    auto t=exgcd(b,a%b);
x|    long long x=t[2];
y|    long long y=t[1]-(a/b)*t[2];
return|    return {t[0],x,y};
}`,`def exgcd(a,b):
base|    if b==0: return [a,1,0]
recur|    g,old_x,old_y=exgcd(b,a%b)
x|    x=old_y
y|    y=old_x-(a//b)*old_y
return|    return [g,x,y]`, `static long[] exgcd(long a,long b) {
base|    if(b==0) return new long[]{a,1,0};
recur|    long[] t=exgcd(b,a%b);
x|    long x=t[2];
y|    long y=t[1]-(a/b)*t[2];
return|    return new long[]{t[0],x,y};
}`);
  C.code('linear-sieve',`vector<int> linearSieve(int n) {
init|    vector<int> lp(n+1),primes;
loop|    for(int i=2;i<=n;i++) {
prime|        if(lp[i]==0) { lp[i]=i; primes.push_back(i); }
scan|        for(int p:primes) {
test|            if(p>lp[i] || 1LL*i*p>n) break;
mark|            lp[i*p]=p;
        }
    }
return|    return primes;
}`,`def linear_sieve(n):
init|    lp=[0]*(n+1); primes=[]
loop|    for i in range(2,n+1):
prime|        if lp[i]==0: lp[i]=i; primes.append(i)
scan|        for p in primes:
test|            if p>lp[i] or i*p>n: break
mark|            lp[i*p]=p
return|    return primes`, `static List<Integer> linearSieve(int n) {
init|    int[] lp=new int[n+1]; List<Integer> primes=new ArrayList<>();
loop|    for(int i=2;i<=n;i++) {
prime|        if(lp[i]==0) { lp[i]=i; primes.add(i); }
scan|        for(int p:primes) {
test|            if(p>lp[i] || (long)i*p>n) break;
mark|            lp[i*p]=p;
        }
    }
return|    return primes;
}`);
  C.code('pascal',`long long choose(int n,int k) {
init|    vector<vector<long long>> c(n+1,vector<long long>(n+1));
row|    for(int i=0;i<=n;i++) {
edge|        c[i][0]=c[i][i]=1;
loop|        for(int j=1;j<i;j++) {
add|            c[i][j]=c[i-1][j-1]+c[i-1][j];
        }
    }
return|    return c[n][k];
}`,`def choose(n,k):
init|    c=[[0]*(n+1) for _ in range(n+1)]
row|    for i in range(n+1):
edge|        c[i][0]=c[i][i]=1
loop|        for j in range(1,i):
add|            c[i][j]=c[i-1][j-1]+c[i-1][j]
return|    return c[n][k]`, `static long choose(int n,int k) {
init|    long[][] c=new long[n+1][n+1];
row|    for(int i=0;i<=n;i++) {
edge|        c[i][0]=c[i][i]=1;
loop|        for(int j=1;j<i;j++) {
add|            c[i][j]=c[i-1][j-1]+c[i-1][j];
        }
    }
return|    return c[n][k];
}`);
})(AlgoLab.competition);
