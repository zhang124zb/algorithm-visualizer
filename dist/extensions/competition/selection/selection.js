(function(L,C){
  L.register('binary-answer',(o={})=>{
    const a=o.values?.slice()||L.numbers(7,0,15),k=o.k??3;let lo=Math.max(...a),hi=a.reduce((s,x)=>s+x,0);
    const t=C.trace('binary-answer',{values:a,k},L.array(a)),s=(l,m,v={},active=[])=>t.step(l,m,{lo,hi,k,...v},L.array(a,active,{pointers:Number.isInteger(v.i)?{i:v.i}:{}}));
    s('init','非负数组：最大元素是下界，总和是上界；允许至多 k 段。');while(lo<hi){s('loop','检查答案区间是否收敛。');const mid=lo+Math.floor((hi-lo)/2);let parts=1,sum=0;s('mid','尝试把每段和限制在 mid 以内。',{mid});for(let i=0;i<a.length;i++){const x=a[i];s('scan','加入下一项之前检查是否超限。',{mid,parts,sum,x,i},[i]);if(sum+x>mid){parts++;sum=0;s('cut','当前段装不下，另开一段。',{mid,parts,sum,i},[i]);}sum+=x;s('add','把当前元素放进这一段。',{mid,parts,sum,i},[i]);}if(parts<=k)hi=mid;else lo=mid+1;s('move',parts<=k?'可行，尝试更小的上限。':'段数过多，必须增大上限。',{mid,parts});}s('return','最小可行的最大段和为 '+lo+'。');return t.done(lo);
  });
  L.register('real-binary',(o={})=>{
    const x=o.x??L.rand(1,120)/4;let lo=0,hi=Math.max(1,x);const t=C.trace('real-binary',{x},L.array([lo,hi])),s=(l,m,v={})=>t.step(l,m,{x,lo,hi,...v},L.array([lo,hi],[],{labels:['lo','hi'],caption:'显示区间端点数值 · 60 次迭代逼近平方根'}));
    s('init','x 必须非负；上界至少为 1，兼容小于 1 的数。');for(let i=0;i<60;i++){s('loop','固定迭代次数，避免浮点数相等判断。',{i});const mid=(lo+hi)/2;s('mid','取当前区间中点。',{i,mid});if(mid*mid<=x)lo=mid;else hi=mid;s('move','根据中点的平方缩小区间。',{i,mid});}const result=(lo+hi)/2;s('return','取最终区间中点作为近似答案。',{result});return t.done(result);
  });
  L.register('inversions',(o={})=>{
    const a=o.values?.slice()||L.numbers(8,1,15),t=C.trace('inversions',{values:a.slice()},L.array(a));
    const s=(l,m,v={},active=[])=>t.step(l,m,v,L.array(a,active,{pointers:Object.fromEntries(['l','m','r','i','j'].filter(name=>Number.isInteger(v[name])).map(name=>[name,v[name]])),aux:v.buffer?[{label:'归并缓冲区',values:v.buffer}]:[]}));
    function solve(l,r){s('base','区间采用 [l,r)，单个元素没有逆序对。',{l,r});if(r-l<=1)return 0;const m=Math.floor((l+r)/2);s('split','从中点拆分左右区间。',{l,m,r});let answer=solve(l,m)+solve(m,r);s('recur','先统计左右区间内部的逆序对。',{l,m,r,answer});const b=[];let i=l,j=m;s('init','左右两半已经有序，开始归并。',{l,m,r,i,j,answer});while(i<m||j<r){s('loop','比较尚未归并的两个元素。',{l,m,r,i,j,answer,buffer:b},[i,j].filter(p=>p<r));if(j===r||(i<m&&a[i]<=a[j])){b.push(a[i++]);s('left','左侧不大于右侧，不增加逆序对。',{i,j,answer,buffer:b});}else{answer+=m-i;b.push(a[j++]);s('right','右侧更小，与左侧剩余的 m-i 个元素都构成逆序对。',{i,j,answer,buffer:b});}}a.splice(l,r-l,...b);s('copy','将合并后的有序结果写回原区间。',{l,r,answer},Array.from({length:r-l},(_,i)=>l+i));s('return','返回当前区间的逆序对数。',{l,r,answer});return answer;}
    return t.done(solve(0,a.length));
  });
})(AlgoLab,AlgoLab.competition);
