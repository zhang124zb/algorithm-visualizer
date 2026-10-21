(function(C){
  C.code('mono-stack',`vector<int> nextGreater(vector<int> a) {
init|    vector<int> st,answer(a.size(),-1);
loop|    for(int i=0;i<(int)a.size();i++) {
test|        while(!st.empty() && a[st.back()]<a[i]) {
pop|            answer[st.back()]=i; st.pop_back();
        }
push|        st.push_back(i);
    }
return|    return answer;
}`,`def next_greater(a):
init|    st=[]; answer=[-1]*len(a)
loop|    for i in range(len(a)):
test|        while st and a[st[-1]]<a[i]:
pop|            answer[st.pop()]=i
push|        st.append(i)
return|    return answer`, `static int[] nextGreater(int[] a) {
init|    Deque<Integer> st=new ArrayDeque<>(); int[] answer=new int[a.length]; Arrays.fill(answer,-1);
loop|    for(int i=0;i<a.length;i++) {
test|        while(!st.isEmpty() && a[st.peekLast()]<a[i]) {
pop|            answer[st.removeLast()]=i;
        }
push|        st.addLast(i);
    }
return|    return answer;
}`);
  C.code('mono-queue',`vector<int> windowMax(vector<int> a,int k) {
init|    deque<int> q; vector<int> answer;
loop|    for(int i=0;i<(int)a.size();i++) {
expire|        while(!q.empty() && q.front()<=i-k) q.pop_front();
prune|        while(!q.empty() && a[q.back()]<=a[i]) q.pop_back();
push|        q.push_back(i);
answer|        if(i>=k-1) answer.push_back(a[q.front()]);
    }
return|    return answer;
}`,`from collections import deque
def window_max(a,k):
init|    q=deque(); answer=[]
loop|    for i in range(len(a)):
expire|        while q and q[0]<=i-k: q.popleft()
prune|        while q and a[q[-1]]<=a[i]: q.pop()
push|        q.append(i)
answer|        if i>=k-1: answer.append(a[q[0]])
return|    return answer`, `static List<Integer> windowMax(int[] a,int k) {
init|    Deque<Integer> q=new ArrayDeque<>(); List<Integer> answer=new ArrayList<>();
loop|    for(int i=0;i<a.length;i++) {
expire|        while(!q.isEmpty() && q.peekFirst()<=i-k) q.removeFirst();
prune|        while(!q.isEmpty() && a[q.peekLast()]<=a[i]) q.removeLast();
push|        q.addLast(i);
answer|        if(i>=k-1) answer.add(a[q.peekFirst()]);
    }
return|    return answer;
}`);
  C.code('sparse-table',`int rangeMin(vector<int> a,int l,int r) {
init|    int n=a.size(),K=0; while((1<<K)<=n) ++K;
base|    vector<vector<int>> st(K,vector<int>(n)); st[0]=a;
level|    for(int j=1;(1<<j)<=n;j++) {
loop|        for(int i=0;i+(1<<j)<=n;i++) {
merge|            st[j][i]=min(st[j-1][i],st[j-1][i+(1<<(j-1))]);
        }
    }
log|    int k=0; while((1<<(k+1))<=r-l+1) ++k;
return|    return min(st[k][l],st[k][r-(1<<k)+1]);
}`,`def range_min(a,l,r):
init|    n=len(a); levels=n.bit_length()
base|    st=[list(a)]+[[0]*n for _ in range(levels-1)]
level|    for j in range(1,levels):
loop|        for i in range(n-(1<<j)+1):
merge|            st[j][i]=min(st[j-1][i],st[j-1][i+(1<<(j-1))])
log|    k=(r-l+1).bit_length()-1
return|    return min(st[k][l],st[k][r-(1<<k)+1])`, `static int rangeMin(int[] a,int l,int r) {
init|    int n=a.length,K=32-Integer.numberOfLeadingZeros(n);
base|    int[][] st=new int[K][n]; st[0]=a.clone();
level|    for(int j=1;(1<<j)<=n;j++) {
loop|        for(int i=0;i+(1<<j)<=n;i++) {
merge|            st[j][i]=Math.min(st[j-1][i],st[j-1][i+(1<<(j-1))]);
        }
    }
log|    int k=31-Integer.numberOfLeadingZeros(r-l+1);
return|    return Math.min(st[k][l],st[k][r-(1<<k)+1]);
}`);
})(AlgoLab.competition);
