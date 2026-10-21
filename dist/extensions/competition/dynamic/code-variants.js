(function(C){
  C.code('max-subarray',`int maxSubarray(vector<int> a) {
init|    int current=a[0],best=a[0];
loop|    for(int i=1;i<(int)a.size();i++) {
extend|        current=max(a[i],current+a[i]);
best|        best=max(best,current);
    }
return|    return best;
}`,`def max_subarray(a):
init|    current=best=a[0]
loop|    for i in range(1,len(a)):
extend|        current=max(a[i],current+a[i])
best|        best=max(best,current)
return|    return best`, `static int maxSubarray(int[] a) {
init|    int current=a[0],best=a[0];
loop|    for(int i=1;i<a.length;i++) {
extend|        current=Math.max(a[i],current+a[i]);
best|        best=Math.max(best,current);
    }
return|    return best;
}`);
  C.code('edit-distance',`int editDistance(string a,string b) {
init|    int n=a.size(),m=b.size(); vector<vector<int>> d(n+1,vector<int>(m+1));
base|    for(int i=0;i<=n;i++) d[i][0]=i; for(int j=0;j<=m;j++) d[0][j]=j;
row|    for(int i=1;i<=n;i++) {
col|        for(int j=1;j<=m;j++) {
update|            d[i][j]=min({d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!=b[j-1])});
        }
    }
return|    return d[n][m];
}`,`def edit_distance(a,b):
init|    n,m=len(a),len(b); d=[[0]*(m+1) for _ in range(n+1)]
base|    for i in range(n+1): d[i][0]=i
    for j in range(m+1): d[0][j]=j
row|    for i in range(1,n+1):
col|        for j in range(1,m+1):
update|            d[i][j]=min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!=b[j-1]))
return|    return d[n][m]`, `static int editDistance(String a,String b) {
init|    int n=a.length(),m=b.length(); int[][] d=new int[n+1][m+1];
base|    for(int i=0;i<=n;i++) d[i][0]=i; for(int j=0;j<=m;j++) d[0][j]=j;
row|    for(int i=1;i<=n;i++) {
col|        for(int j=1;j<=m;j++) {
update|            d[i][j]=Math.min(Math.min(d[i-1][j]+1,d[i][j-1]+1),d[i-1][j-1]+(a.charAt(i-1)!=b.charAt(j-1)?1:0));
        }
    }
return|    return d[n][m];
}`);
  C.code('complete-pack',`int completePack(vector<int> weights,vector<int> values,int capacity) {
init|    vector<int> dp(capacity+1);
item|    for(int i=0;i<(int)weights.size();i++) {
loop|        for(int c=weights[i];c<=capacity;c++) {
update|            dp[c]=max(dp[c],dp[c-weights[i]]+values[i]);
        }
    }
return|    return dp[capacity];
}`,`def complete_pack(weights,values,capacity):
init|    dp=[0]*(capacity+1)
item|    for i in range(len(weights)):
loop|        for c in range(weights[i],capacity+1):
update|            dp[c]=max(dp[c],dp[c-weights[i]]+values[i])
return|    return dp[capacity]`, `static int completePack(int[] weights,int[] values,int capacity) {
init|    int[] dp=new int[capacity+1];
item|    for(int i=0;i<weights.length;i++) {
loop|        for(int c=weights[i];c<=capacity;c++) {
update|            dp[c]=Math.max(dp[c],dp[c-weights[i]]+values[i]);
        }
    }
return|    return dp[capacity];
}`);
  C.code('group-pack',`int groupPack(vector<vector<pair<int,int>>> groups,int capacity) {
init|    vector<int> dp(capacity+1);
group|    for(auto items:groups) {
copy|        vector<int> previous=dp;
loop|        for(int c=0;c<=capacity;c++) {
item|            for(auto [weight,value]:items) {
update|                if(c>=weight) dp[c]=max(dp[c],previous[c-weight]+value);
            }
        }
    }
return|    return dp[capacity];
}`,`def group_pack(groups,capacity):
init|    dp=[0]*(capacity+1)
group|    for items in groups:
copy|        previous=dp[:]
loop|        for c in range(capacity+1):
item|            for weight,value in items:
update|                if c>=weight: dp[c]=max(dp[c],previous[c-weight]+value)
return|    return dp[capacity]`, `static int groupPack(int[][][] groups,int capacity) {
init|    int[] dp=new int[capacity+1];
group|    for(int[][] items:groups) {
copy|        int[] previous=dp.clone();
loop|        for(int c=0;c<=capacity;c++) {
item|            for(int[] item:items) { int weight=item[0],value=item[1];
update|                if(c>=weight) dp[c]=Math.max(dp[c],previous[c-weight]+value);
            }
        }
    }
return|    return dp[capacity];
}`);
})(AlgoLab.competition);
