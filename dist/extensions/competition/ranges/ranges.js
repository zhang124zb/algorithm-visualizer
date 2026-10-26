(function(L,C){
  L.register('mono-stack',(o={})=>{
    const a=o.values?.slice()||L.numbers(8,1,15),st=[],answer=Array(a.length).fill(-1),t=C.trace('mono-stack',{values:a},L.array(a)),s=(l,m,v={},active=[])=>t.step(l,m,{stack:st,...v},L.array(a,active,{pointers:{...(Number.isInteger(v.i)?{i:v.i}:{}),...(st.length?{'st.back()':st.at(-1)}:{})},aux:[{label:'候选下标栈（从底到顶）',values:st},{label:'右侧第一个严格更大值的下标',values:answer}]}));
    s('init','未找到更大值时，答案为 -1。');for(let i=0;i<a.length;i++){s('loop','读取下一个元素。',{i},[i]);while(true){s('test','当前元素能否解决栈顶的等待？相等时不弹出。',{i},[i,st.at(-1)]);if(!st.length||a[st.at(-1)]>=a[i])break;const j=st.pop();answer[j]=i;s('pop','当前元素是被弹出位置右侧第一个更大值。',{i,j},[i,j]);}st.push(i);s('push','当前下标入栈，等待右侧更大值。',{i},[i]);}s('return','留在栈里的位置右侧没有更大值。');return t.done(answer);
  });
  L.register('mono-queue',(o={})=>{
    const a=o.values?.slice()||L.numbers(9,-5,20),k=o.k??3,q=[],answer=[],t=C.trace('mono-queue',{values:a,k},L.array(a));
    const s=(l,m,i=-1)=>t.step(l,m,{i,k,queue:q,answer},L.array(a,i>=0?[i]:[],{pointers:{...(i>=0?{i}:{}),...(q.length?{'q.front()':q[0],'q.back()':q.at(-1)}:{})},range:[Math.max(0,i-k+1),i],aux:[{label:'候选下标（队首到队尾）',values:q},{label:'窗口最大值',values:answer}]}));
    s('init','队列存下标，队列对应的数值保持递减。');for(let i=0;i<a.length;i++){s('loop','窗口向右移动。',i);while(q.length&&q[0]<=i-k){q.shift();s('expire','从队首移除离开窗口的下标。',i);}s('expire','检查队首是否仍在窗口内。',i);while(q.length&&a[q.at(-1)]<=a[i]){q.pop();s('prune','移除更小或相等的旧候选，它们不会更优。',i);}s('prune','队尾检查完成。',i);q.push(i);s('push','新下标从队尾进入。',i);if(i>=k-1)answer.push(a[q[0]]);s('answer',i>=k-1?'窗口已满，队首就是最大值。':'窗口尚未达到长度 k。',i);}s('return','得到所有窗口的最大值。');return t.done(answer);
  });
  L.register('sparse-table',(o={})=>{
    const a=o.values?.slice()||L.numbers(8,1,30),n=a.length,l=o.left??L.rand(0,2),r=o.right??n-1,K=Math.floor(Math.log2(n))+1,st=Array.from({length:K},()=>Array(n).fill('—'));
    const t=C.trace('sparse-table',{values:a,left:l,right:r},L.array(a)),s=(line,msg,v={},active=[])=>t.step(line,msg,{l,r,...v},L.matrix(st,active,{rowLabels:st.map((_,j)=>'2^'+j),caption:'st[j][i]：从 i 开始、长度为 2^j 的区间最小值',aux:[{label:'原数组',values:a}]}));
    s('init','计算需要的倍增层数。',{K});st[0]=a.slice();s('base','长度为 1 时，最小值就是自身。');for(let j=1;(1<<j)<=n;j++){s('level','将两个长度减半的区间合并。',{j});for(let i=0;i+(1<<j)<=n;i++){s('loop','只处理完全落在数组内的区间。',{i,j});st[j][i]=Math.min(st[j-1][i],st[j-1][i+(1<<(j-1))]);s('merge','取两个子区间最小值中的较小者。',{i,j},[[j,i]]);}}const k=Math.floor(Math.log2(r-l+1));s('log','选择不超过查询长度的最大 2 的幂次。',{k});const result=Math.min(st[k][l],st[k][r-(1<<k)+1]);s('return','两个区间可以重叠；min 重复计算不影响结果，求和则不能这样做。',{k,result},[[k,l],[k,r-(1<<k)+1]]);return t.done(result);
  });
})(AlgoLab,AlgoLab.competition);
