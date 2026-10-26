(function(L){
  'use strict';
  L.register('prefix-sum',(options={})=>{
    const a=options.values?.slice()||L.numbers(),n=a.length,left=options.left??L.rand(0,Math.max(0,n-2)),right=options.right??L.rand(left,Math.max(left,n-1)),p=Array(n+1).fill(0);
    const t=new L.Trace(`int rangeSum(const vector<int>& a, int left, int right) {
init|    vector<int> prefix(a.size() + 1, 0);
loop|    for (int i = 0; i < (int)a.size(); ++i) {
add|        prefix[i + 1] = prefix[i] + a[i];
    }
query|    return prefix[right + 1] - prefix[left];
}`,{values:a,left,right},L.array(a));
    const s=(l,m,v={},active=[])=>t.step(l,m,{left,right,prefix:p,...v},L.array(a,active,{pointers:{left,right,...(Number.isInteger(v.i)?{i:v.i}:{})},aux:[{label:'prefix（多出一个起始 0）',values:p}]}));
    s('init','prefix[0] 设为 0，表示空前缀。');for(let i=0;;i++){s('loop','检查下一个待累加的元素。',{i},i<n?[i]:[]);if(i>=n)break;p[i+1]=p[i]+a[i];s('add','当前前缀和 = 上一个前缀和 + 当前元素。',{i},[i]);}const result=p[right+1]-p[left];s('query',`用两个前缀相减，得到闭区间 [${left}, ${right}] 的和 ${result}。`,{result},Array.from({length:right-left+1},(_,i)=>left+i));return t.done(result);
  });
  L.register('difference',(options={})=>{
    const a=options.values?.slice()||L.numbers(8,1,12),n=a.length;
    const left=options.left??L.rand(0,n-2),right=options.right??L.rand(left,n-1),delta=options.delta??L.rand(2,7),d=Array(n+1).fill(0),b=Array(n).fill(0);
    const t=new L.Trace(`vector<int> rangeAdd(vector<int> a, int l, int r, int delta) {
init|    vector<int> d(a.size() + 1, 0);
loop|    for (int i = 0; i < (int)a.size(); ++i) {
diff|        d[i] = a[i] - (i == 0 ? 0 : a[i - 1]);
    }
left|    d[l] += delta;
right|    d[r + 1] -= delta;
restore|    for (int i = 0; i < (int)a.size(); ++i) {
sum|        a[i] = d[i] + (i == 0 ? 0 : a[i - 1]);
    }
return|    return a;
}`,{values:a,l:left,r:right,delta},L.array(a));
    const s=(l,m,v={},active=[])=>t.step(l,m,{l:left,r:right,delta,difference:d,...v},L.array(b,active,{pointers:{l:left,r:right,...(Number.isInteger(v.i)?{i:v.i}:{})},aux:[{label:'原始数组',values:a},{label:'差分数组（含末尾哨兵）',values:d}]}));
    s('init','建立带末尾哨兵的差分数组。');for(let i=0;;i++){s('loop','逐个计算相邻元素之差。',{i});if(i>=n)break;d[i]=a[i]-(i===0?0:a[i-1]);s('diff','记录当前位置相对前一位置的变化。',{i},[i]);}d[left]+=delta;s('left','在区间起点增加 delta。',{},[left]);d[right+1]-=delta;s('right','在区间结束后的第一个位置抵消 delta。');for(let i=0;;i++){s('restore','对差分数组做前缀累加。',{i});if(i>=n)break;b[i]=d[i]+(i===0?0:b[i-1]);s('sum','还原更新后的数组元素。',{i},[i]);}s('return','区间更新完成。');return t.done(b);
  });
  L.register('two-pointers',(options={})=>{
    const a=(options.values?.slice()||L.unique()).sort((x,y)=>x-y),target=options.target??a[1]+a[a.length-2];let left=0,right=a.length-1;
    const t=new L.Trace(`pair<int,int> pairSum(const vector<int>& a, int target) {
init|    int left = 0, right = (int)a.size() - 1;
loop|    while (left < right) {
sum|        int sum = a[left] + a[right];
equal|        if (sum == target) return {left, right};
less|        if (sum < target) {
left|            ++left;
        } else {
right|            --right;
        }
    }
missing|    return {-1, -1};
}`,{values:a,target},L.array(a));
    let sum='—';const s=(l,m)=>t.step(l,m,{left,right,target,sum},L.array(a,[left,right],{pointers:{left,right},range:[left,right]}));s('init','两个指针分别从有序数组的两端开始。');while(true){s('loop','检查两个指针是否仍然指向不同元素。');if(left>=right)break;sum=a[left]+a[right];s('sum','计算两端元素之和。');s('equal','检查是否等于目标和。');if(sum===target)return t.done([left,right],'找到一对满足条件的下标。');s('less','根据和与目标的大小决定移动方向。');if(sum<target){left++;s('left','和偏小，左指针右移以增大和。');}else{right--;s('right','和偏大，右指针左移以减小和。');}}s('missing','指针相遇，未找到符合条件的数对。');return t.done([-1,-1]);
  });
  L.register('sliding-window',(options={})=>{
    const a=options.values?.slice()||L.numbers(9,1,20),k=options.k??3;let sum=0,best=-Infinity;
    const t=new L.Trace(`int maxWindowSum(const vector<int>& a, int k) {
init|    int sum = 0, best = INT_MIN;
loop|    for (int i = 0; i < (int)a.size(); ++i) {
add|        sum += a[i];
test|        if (i >= k) {
remove|            sum -= a[i - k];
        }
full|        if (i >= k - 1) {
best|            best = max(best, sum);
        }
    }
return|    return best;
}`,{values:a,k},L.array(a));
    const s=(l,m,i=-1)=>t.step(l,m,{i,k,sum,best},L.array(a,i>=0&&i<a.length?[i]:[],{pointers:i>=0?{i,...(l==='remove'?{'i-k':i-k}:{})}:{},range:[Math.max(0,i-k+1),Math.min(i,a.length-1)]}));s('init','初始化窗口和以及最佳答案。');for(let i=0;;i++){s('loop','将窗口向右推进一格。',i);if(i>=a.length)break;sum+=a[i];s('add','把新进入窗口的元素加入总和。',i);s('test','判断是否有旧元素需要离开窗口。',i);if(i>=k){sum-=a[i-k];s('remove','减去窗口左侧刚刚离开的元素。',i);}s('full','窗口长度达到 k 后才更新答案。',i);if(i>=k-1){best=Math.max(best,sum);s('best','记录目前最大的窗口和。',i);}}s('return','返回所有固定长度窗口中的最大和。');return t.done(best);
  });
})(AlgoLab);
