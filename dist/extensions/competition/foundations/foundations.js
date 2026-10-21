(function(L,C){
  'use strict';
  L.register('bit-count',(o={})=>{
    let x=o.x??L.rand(8,127),answer=0;const input=x;
    const view=()=>L.array(x.toString(2).padStart(8,'0').split('').map(Number),[],{caption:'从高位到低位 · 每次消去最低位的 1'});
    const t=C.trace('bit-count',{x},view()),s=(l,m,v={})=>t.step(l,m,{x,answer,...v},view());
    s('init','初始化二进制中 1 的计数。');while(true){s('loop','检查是否仍有非零位。');if(!x)break;const low=x&-x;s('low','x & -x 只保留最低位的 1。',{low});x-=low;s('clear','消去这一位。',{low});answer++;s('count','计数加一。');}s('return',input+' 的二进制中共有 '+answer+' 个 1。');return t.done(answer);
  });
  L.register('compression',(o={})=>{
    const a=o.values?.slice()||L.numbers(8,-20,40),original=a.slice();let keys=a.slice();
    const t=C.trace('compression',{values:original},L.array(a)),s=(l,m,v={},active=[])=>t.step(l,m,v,L.array(a,active,{aux:[{label:'原始数值',values:original},{label:'有序唯一值（下标就是排名）',values:keys}]}));
    s('copy','复制原数组，用副本准备排名。');keys.sort((a,b)=>a-b);s('sort','按数值从小到大排序。');keys=[...new Set(keys)];s('unique','去掉重复项，相同数值会得到相同排名。');for(let i=0;i<a.length;i++){s('loop','依次映射原数组。',{i},[i]);a[i]=keys.indexOf(a[i]);s('rank','用从 0 开始的排名替换数值。',{i,rank:a[i]},[i]);}s('return','离散化保持大小关系，但不保持数值之间的距离。');return t.done(a);
  });
  L.register('prefix-2d',(o={})=>{
    const a=o.matrix?.map(r=>r.slice())||Array.from({length:4},()=>L.numbers(4,1,9)),n=a.length,m=a[0].length,p=Array.from({length:n+1},()=>Array(m+1).fill(0)),x1=o.x1??1,y1=o.y1??1,x2=o.x2??n-1,y2=o.y2??m-1;
    const t=C.trace('prefix-2d',{matrix:a,x1,y1,x2,y2},L.matrix(a)),s=(l,msg,v={},active=[])=>t.step(l,msg,{x1,y1,x2,y2,...v},L.matrix(p,active,{caption:'上方与左侧补 0 的前缀和矩阵',table:L.matrix(a,[],{caption:'原矩阵'})}));
    s('init','补出第 0 行与第 0 列，统一处理边界。');for(let i=1;i<=n;i++){s('row','处理下一行。',{i});for(let j=1;j<=m;j++){s('col','处理下一列。',{i,j},[[i,j]]);p[i][j]=a[i-1][j-1]+p[i-1][j]+p[i][j-1]-p[i-1][j-1];s('add','上方 + 左侧 - 重叠部分 + 当前数值。',{i,j},[[i,j]]);}}
    const result=p[x2+1][y2+1]-p[x1][y2+1]-p[x2+1][y1]+p[x1][y1];s('return','四块前缀容斥，查询闭区间矩形。',{result},[[x2+1,y2+1],[x1,y2+1],[x2+1,y1],[x1,y1]]);return t.done(result);
  });
  L.register('difference-2d',(o={})=>{
    const n=o.n??4,m=o.m??5,x1=o.x1??L.rand(0,1),y1=o.y1??L.rand(0,1),x2=o.x2??n-1,y2=o.y2??m-2,v=o.delta??L.rand(2,8),d=Array.from({length:n+1},()=>Array(m+1).fill(0)),a=Array.from({length:n},()=>Array(m).fill(0));
    const t=C.trace('difference-2d',{n,m,x1,y1,x2,y2,delta:v},L.matrix(a)),s=(l,msg,vars={},active=[])=>t.step(l,msg,{x1,y1,x2,y2,v,...vars},L.matrix(a,active,{caption:'从全零矩阵开始，演示一次矩形加',table:L.matrix(d)}));
    s('init','建立差分矩阵与还原矩阵，末行末列作为哨兵。');d[x1][y1]+=v;d[x2+1][y1]-=v;d[x1][y2+1]-=v;d[x2+1][y2+1]+=v;s('mark','左上与右下加，另两个角减；区间以外会互相抵消。');for(let i=0;i<n;i++){s('row','按行恢复每个元素。',{i});for(let j=0;j<m;j++){s('col','处理下一列。',{i,j});a[i][j]=d[i][j]+(i?a[i-1][j]:0)+(j?a[i][j-1]:0)-(i&&j?a[i-1][j-1]:0);s('restore','对差分做二维前缀累加。',{i,j},[[i,j]]);}}s('return','矩形内增加 v，其他元素保持为 0。');return t.done(a);
  });
  L.register('big-add',(o={})=>{
    const a=o.a??String(L.rand(10000,99999)),b=o.b??String(L.rand(10000,99999));let i=a.length-1,j=b.length-1,carry=0;const out=[];
    const view=()=>L.array(out.slice().reverse(),[],{caption:'已算出的结果（从低位累积）',aux:[{label:'a',values:a.split('')},{label:'b',values:b.split('')}]}),t=C.trace('big-add',{a,b},view()),s=(l,m,v={})=>t.step(l,m,{i,j,carry,...v},view());
    s('init','输入为非负十进制整数字符串，不含前导零（0 除外）。');while(true){s('loop','两边均处理完且没有进位时停止。');if(i<0&&j<0&&!carry)break;const sum=(i>=0?Number(a[i--]):0)+(j>=0?Number(b[j--]):0)+carry;s('sum','相加当前位与上一位的进位。',{sum});out.push(String(sum%10));s('digit','只保存当前和的个位。',{sum});carry=Math.floor(sum/10);s('carry','把十位留给更高一位。');}s('return','倒置低位优先的结果序列。');return t.done(out.reverse().join(''));
  });
})(AlgoLab,AlgoLab.competition);
