(function(L,C){
  L.register('max-subarray',(o={})=>{
    const a=o.values?.slice()||L.numbers(9,-10,15);let current=a[0],best=a[0],left=0,bestLeft=0,bestRight=0;
    const t=C.trace('max-subarray',{values:a},L.array(a)),s=(l,msg,i=0)=>t.step(l,msg,{i,current,best,left,bestLeft,bestRight},L.array(a,[i],{range:[left,i],aux:[{label:'目前最佳子段',values:a.slice(bestLeft,bestRight+1)}]}));
    s('init','要求非空子段，初始化为第一个元素；全负数也能正确处理。');for(let i=1;i<a.length;i++){s('loop','考虑以当前位置结尾的最佳子段。',i);if(a[i]>current+a[i]){current=a[i];left=i;}else current+=a[i];s('extend','比较重新开始和延长上一段。',i);if(current>best){best=current;bestLeft=left;bestRight=i;}s('best','更新所有结尾位置中的最大值。',i);}s('return','返回最大子段和。',a.length-1);return t.done(best);
  });
  L.register('edit-distance',(o={})=>{
    const a=o.a??L.shuffle(['KITTEN','CATS','ABCAB'])[0],b=o.b??L.shuffle(['SITTING','CUT','ACBA'])[0],n=a.length,m=b.length,d=Array.from({length:n+1},()=>Array(m+1).fill(0)),t=C.trace('edit-distance',{a,b},L.matrix(d));
    const s=(l,msg,v={},active=[])=>t.step(l,msg,v,L.matrix(d,active,{rowLabels:['∅',...a],colLabels:['∅',...b],caption:'行前缀变为列前缀的最小操作数；插入、删除、替换均为 1'}));
    s('init','建立包含空前缀的状态表。');for(let i=0;i<=n;i++)d[i][0]=i;for(let j=0;j<=m;j++)d[0][j]=j;s('base','空串变为长度 j 的串需要 j 次插入，反向需要删除。');for(let i=1;i<=n;i++){s('row','扩大第一个字符串的前缀。',{i});for(let j=1;j<=m;j++){s('col','扩大第二个字符串的前缀。',{i,j});d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));s('update','在删除、插入、匹配或替换中选择最小代价。',{i,j},[[i,j]]);}}s('return','右下角即完整字符串间的编辑距离。',{result:d[n][m]},[[n,m]]);return t.done(d[n][m]);
  });
  L.register('complete-pack',(o={})=>{
    const weights=o.weights||[2,3,L.rand(4,5)],values=o.values||[L.rand(2,4),L.rand(4,6),L.rand(6,8)],capacity=o.capacity??10,dp=Array(capacity+1).fill(0),t=C.trace('complete-pack',{weights,values,capacity},L.array(dp)),s=(l,msg,v={},active=[])=>t.step(l,msg,{capacity,...v},L.array(dp,active,{aux:[{label:'物品重量（均大于 0）',values:weights},{label:'物品价值（可不限次选取）',values}]}));
    s('init','允许不装满，每个容量的初值为 0。');for(let i=0;i<weights.length;i++){s('item','处理一种可重复使用的物品。',{i});for(let c=weights[i];c<=capacity;c++){s('loop','容量从小到大更新。',{i,c},[c]);dp[c]=Math.max(dp[c],dp[c-weights[i]]+values[i]);s('update','较小容量已经包含当前物品，因此可以再次选它。',{i,c},[c,c-weights[i]]);}}s('return','返回容量限制内能达到的最大价值。');return t.done(dp[capacity]);
  });
  L.register('group-pack',(o={})=>{
    const groups=o.groups||[[[2,4],[3,L.rand(4,6)]],[[3,5],[4,L.rand(6,9)]],[[1,L.rand(1,3)]]],capacity=o.capacity??8,dp=Array(capacity+1).fill(0);let previous=dp.slice();
    const t=C.trace('group-pack',{groups,capacity},L.array(dp)),s=(l,msg,v={},active=[])=>t.step(l,msg,{capacity,...v},L.array(dp,active,{aux:[{label:'上一组处理完的状态（本组只从这里转移）',values:previous}]}));
    s('init','每组最多选一件，也可以整组不选。');for(let g=0;g<groups.length;g++){const items=groups[g];s('group','开始处理下一组。',{g,items});previous=dp.slice();s('copy','保存上一组状态，避免本组内重复选择。',{g});for(let c=0;c<=capacity;c++){s('loop','考虑当前容量。',{g,c});for(const [weight,value]of items){s('item','尝试本组中的一件物品。',{g,c,weight,value});if(c>=weight)dp[c]=Math.max(dp[c],previous[c-weight]+value);s('update','容量足够时，从上一组的状态转移；原 dp[c] 保留不选方案。',{g,c,weight,value},[c]);}}}s('return','所有组处理完毕。');return t.done(dp[capacity]);
  });
})(AlgoLab,AlgoLab.competition);
