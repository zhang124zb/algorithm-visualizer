(function(C){
  C.code('z-function',`vector<int> zFunction(string s) {
init|    int n=s.size(),l=0,r=0; vector<int> z(n);
loop|    for(int i=1;i<n;i++) {
reuse|        if(i<r) z[i]=min(r-i,z[i-l]);
expand|        while(i+z[i]<n && s[z[i]]==s[i+z[i]]) ++z[i];
box|        if(i+z[i]>r) { l=i; r=i+z[i]; }
    }
return|    return z;
}`,`def z_function(s):
init|    n=len(s); l=r=0; z=[0]*n
loop|    for i in range(1,n):
reuse|        if i<r: z[i]=min(r-i,z[i-l])
expand|        while i+z[i]<n and s[z[i]]==s[i+z[i]]: z[i]+=1
box|        if i+z[i]>r: l,r=i,i+z[i]
return|    return z`, `static int[] zFunction(String s) {
init|    int n=s.length(),l=0,r=0; int[] z=new int[n];
loop|    for(int i=1;i<n;i++) {
reuse|        if(i<r) z[i]=Math.min(r-i,z[i-l]);
expand|        while(i+z[i]<n && s.charAt(z[i])==s.charAt(i+z[i])) ++z[i];
box|        if(i+z[i]>r) { l=i; r=i+z[i]; }
    }
return|    return z;
}`);
  C.code('manacher',`int longestPalindrome(string s) {
init|    int n=s.size(),answer=0,l=0,r=-1; vector<int> odd(n),even(n);
oddLoop|    for(int i=0;i<n;i++) {
oddSeed|        int k=i>r?1:min(odd[l+r-i],r-i+1);
oddExpand|        while(i-k>=0 && i+k<n && s[i-k]==s[i+k]) ++k;
oddSave|        odd[i]=k; answer=max(answer,2*k-1);
oddBox|        if(i+k-1>r) { l=i-k+1; r=i+k-1; }
    }
reset|    l=0; r=-1;
evenLoop|    for(int i=0;i<n;i++) {
evenSeed|        int k=i>r?0:min(even[l+r-i+1],r-i+1);
evenExpand|        while(i-k-1>=0 && i+k<n && s[i-k-1]==s[i+k]) ++k;
evenSave|        even[i]=k; answer=max(answer,2*k);
evenBox|        if(i+k-1>r) { l=i-k; r=i+k-1; }
    }
return|    return answer;
}`,`def longest_palindrome(s):
init|    n=len(s); answer=0; l=0; r=-1; odd=[0]*n; even=[0]*n
oddLoop|    for i in range(n):
oddSeed|        k=1 if i>r else min(odd[l+r-i],r-i+1)
oddExpand|        while i-k>=0 and i+k<n and s[i-k]==s[i+k]: k+=1
oddSave|        odd[i]=k; answer=max(answer,2*k-1)
oddBox|        if i+k-1>r: l,r=i-k+1,i+k-1
reset|    l,r=0,-1
evenLoop|    for i in range(n):
evenSeed|        k=0 if i>r else min(even[l+r-i+1],r-i+1)
evenExpand|        while i-k-1>=0 and i+k<n and s[i-k-1]==s[i+k]: k+=1
evenSave|        even[i]=k; answer=max(answer,2*k)
evenBox|        if i+k-1>r: l,r=i-k,i+k-1
return|    return answer`, `static int longestPalindrome(String s) {
init|    int n=s.length(),answer=0,l=0,r=-1; int[] odd=new int[n],even=new int[n];
oddLoop|    for(int i=0;i<n;i++) {
oddSeed|        int k=i>r?1:Math.min(odd[l+r-i],r-i+1);
oddExpand|        while(i-k>=0 && i+k<n && s.charAt(i-k)==s.charAt(i+k)) ++k;
oddSave|        odd[i]=k; answer=Math.max(answer,2*k-1);
oddBox|        if(i+k-1>r) { l=i-k+1; r=i+k-1; }
    }
reset|    l=0; r=-1;
evenLoop|    for(int i=0;i<n;i++) {
evenSeed|        int k=i>r?0:Math.min(even[l+r-i+1],r-i+1);
evenExpand|        while(i-k-1>=0 && i+k<n && s.charAt(i-k-1)==s.charAt(i+k)) ++k;
evenSave|        even[i]=k; answer=Math.max(answer,2*k);
evenBox|        if(i+k-1>r) { l=i-k; r=i+k-1; }
    }
return|    return answer;
}`);
})(AlgoLab.competition);
