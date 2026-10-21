(function(C){
  C.code('win-lose',`bool winning(int n) {
init|    vector<bool> win(n+1,false);
state|    for(int i=1;i<=n;i++) {
move|        for(int take=1;take<=3;take++) {
test|            if(i>=take && !win[i-take]) {
win|                win[i]=true; break;
            }
        }
    }
return|    return win[n];
}`,`def winning(n):
init|    win=[False]*(n+1)
state|    for i in range(1,n+1):
move|        for take in range(1,4):
test|            if i>=take and not win[i-take]:
win|                win[i]=True; break
return|    return win[n]`, `static boolean winning(int n) {
init|    boolean[] win=new boolean[n+1];
state|    for(int i=1;i<=n;i++) {
move|        for(int take=1;take<=3;take++) {
test|            if(i>=take && !win[i-take]) {
win|                win[i]=true; break;
            }
        }
    }
return|    return win[n];
}`);
  C.code('nim',`vector<int> nimMove(vector<int> piles) {
init|    int value=0;
xor|    for(int x:piles) value^=x;
lose|    if(value==0) return {-1,-1};
loop|    for(int i=0;i<(int)piles.size();i++) {
target|        int target=piles[i]^value;
move|        if(target<piles[i]) return {i,target};
    }
return|    return {-1,-1};
}`,`def nim_move(piles):
init|    value=0
xor|    for x in piles: value^=x
lose|    if value==0: return [-1,-1]
loop|    for i in range(len(piles)):
target|        target=piles[i]^value
move|        if target<piles[i]: return [i,target]
return|    return [-1,-1]`, `static int[] nimMove(int[] piles) {
init|    int value=0;
xor|    for(int x:piles) value^=x;
lose|    if(value==0) return new int[]{-1,-1};
loop|    for(int i=0;i<piles.length;i++) {
target|        int target=piles[i]^value;
move|        if(target<piles[i]) return new int[]{i,target};
    }
return|    return new int[]{-1,-1};
}`);
})(AlgoLab.competition);
