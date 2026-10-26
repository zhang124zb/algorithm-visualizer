(function(L){
  'use strict';
  L.register('recurrence',(options={})=>{
    const n=options.n??L.rand(6,11),f=Array(n+1).fill(0);const t=new L.Trace(`int fibonacci(int n) {
init|    vector<int> f(n + 1, 0);
base|    if (n >= 1) f[1] = 1;
loop|    for (int i = 2; i <= n; ++i) {
add|        f[i] = f[i - 1] + f[i - 2];
    }
return|    return f[n];
}`,{n},L.array(f));const s=(l,m,v={},active=[])=>t.step(l,m,{n,...v},L.array(f,active,{pointers:Number.isInteger(v.i)?{i:v.i}:{}}));s('init','初始化 f[0] = 0，其余状态也先置零。');if(n>=1)f[1]=1;s('base','设置基础状态 f[1] = 1。',{},[1]);for(let i=2;;i++){s('loop','按下标从小到大计算状态。',{i});if(i>n)break;f[i]=f[i-1]+f[i-2];s('add','将前两个已知状态相加。',{i,'f[i-1]':f[i-1],'f[i-2]':f[i-2]},[i-2,i-1,i]);}s('return','返回第 n 个状态。');return t.done(f[n]);
  });
  L.register('knapsack',(options={})=>{
    const weights=options.weights?.slice()||L.numbers(4,1,5),values=options.values?.slice()||L.numbers(4,3,12),capacity=options.capacity??10,dp=Array(capacity+1).fill(0);
    const t=new L.Trace(`int knapsack(vector<int> weight, vector<int> value, int capacity) {
init|    vector<int> dp(capacity + 1, 0);
items|    for (int i = 0; i < (int)weight.size(); ++i) {
loop|        for (int c = capacity; c >= weight[i]; --c) {
update|            dp[c] = max(dp[c], dp[c - weight[i]] + value[i]);
        }
    }
return|    return dp[capacity];
}`,{weights,values,capacity},L.array(dp));
    const s=(l,m,v={},active=[])=>t.step(l,m,{capacity,...v},L.array(dp,active,{pointers:Number.isInteger(v.c)?{c:v.c}:{},caption:'下标为容量，数值为该容量内的最大价值',aux:[{label:'物品重量',values:weights},{label:'物品价值',values}]}));s('init','每个容量的最优价值初始为 0。');for(let i=0;;i++){s('items','依次考虑每件物品。',{i});if(i>=weights.length)break;for(let c=capacity;;c--){s('loop','容量倒序遍历，避免同一物品被重复选择。',{i,c,weight:weights[i],value:values[i]});if(c<weights[i])break;const candidate=dp[c-weights[i]]+values[i],previous=dp[c];dp[c]=Math.max(previous,candidate);s('update','比较不选与选择当前物品的价值。',{i,c,不选:previous,选择:candidate},[c-weights[i],c]);}}s('return','返回总容量内的最大价值。');return t.done(dp[capacity]);
  });
  L.register('lis',(options={})=>{
    const a=options.values?.slice()||L.numbers(),dp=Array(a.length).fill(1);let answer=0;
    const t=new L.Trace(`int lis(const vector<int>& a) {
init|    vector<int> dp(a.size(), 1);
answer|    int answer = 0;
outer|    for (int i = 0; i < (int)a.size(); ++i) {
inner|        for (int j = 0; j < i; ++j) {
test|            if (a[j] < a[i]) {
update|                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
best|        answer = max(answer, dp[i]);
    }
return|    return answer;
}`,{values:a},L.array(a));const s=(l,m,v={},active=[])=>t.step(l,m,{answer,dp,...v},L.array(a,active,{pointers:Object.fromEntries(['i','j'].filter(name=>Number.isInteger(v[name])).map(name=>[name,v[name]])),aux:[{label:'以该位置结尾的 LIS 长度',values:dp}]}));s('init','每个元素单独构成长度为 1 的子序列。');s('answer','记录全局最优长度。');for(let i=0;;i++){s('outer','计算以当前位置结尾的最长上升子序列。',{i});if(i>=a.length)break;for(let j=0;;j++){s('inner','枚举当前位置之前的元素。',{i,j});if(j>=i)break;s('test','只有严格较小的元素才能接在前面。',{i,j},[j,i]);if(a[j]<a[i]){dp[i]=Math.max(dp[i],dp[j]+1);s('update','尝试延长以 j 结尾的上升子序列。',{i,j},[j,i]);}}answer=Math.max(answer,dp[i]);s('best','更新全局最长长度。',{i},[i]);}s('return','返回最长严格上升子序列的长度。');return t.done(answer);
  });
  L.register('lcs',(options={})=>{
    const randomString=()=>Array.from({length:6},()=>'ABCD'[L.rand(0,3)]).join('');const a=options.a??randomString(),b=options.b??randomString(),dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
    const t=new L.Trace(`int lcs(string a, string b) {
init|    vector<vector<int>> dp(a.size()+1, vector<int>(b.size()+1, 0));
outer|    for (int i = 1; i <= (int)a.size(); ++i) {
inner|        for (int j = 1; j <= (int)b.size(); ++j) {
test|            if (a[i - 1] == b[j - 1]) {
match|                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
inherit|                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
return|    return dp[a.size()][b.size()];
}`,{a,b},L.matrix(dp));
    const s=(l,m,v={},active=[])=>t.step(l,m,{a,b,...v},L.matrix(dp,active,{rowLabels:['∅',...a],colLabels:['∅',...b]}));s('init','空字符串与任意前缀的公共子序列长度为 0。');for(let i=1;;i++){s('outer','逐行处理字符串 a 的前缀。',{i});if(i>a.length)break;for(let j=1;;j++){s('inner','逐列处理字符串 b 的前缀。',{i,j});if(j>b.length)break;s('test',`比较 ${a[i-1]} 和 ${b[j-1]}。`,{i,j},[[i,j]]);if(a[i-1]===b[j-1]){dp[i][j]=dp[i-1][j-1]+1;s('match','字符相等，在左上方状态基础上加一。',{i,j},[[i-1,j-1],[i,j]]);}else{dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);s('inherit','字符不同，继承上方或左方的较大值。',{i,j},[[i-1,j],[i,j-1],[i,j]]);}}}s('return','右下角状态就是两个完整字符串的 LCS 长度。',{},[[a.length,b.length]]);return t.done(dp[a.length][b.length]);
  });
  L.register('interval-dp',(options={})=>{
    const a=options.values?.slice()||L.numbers(5,1,9),n=a.length,p=[0];a.forEach(x=>p.push(p[p.length-1]+x));const dp=Array.from({length:n},()=>Array(n).fill(0));
    const t=new L.Trace(`int mergeStones(const vector<int>& a) {
init|    int n = a.size();
table|    vector<vector<int>> dp(n, vector<int>(n, 0));
prefix|    vector<int> p(n + 1, 0);
sumLoop|    for (int i = 0; i < n; ++i) p[i + 1] = p[i] + a[i];
length|    for (int len = 2; len <= n; ++len) {
left|        for (int l = 0; l + len <= n; ++l) {
right|            int r = l + len - 1;
infinity|            dp[l][r] = INT_MAX;
split|            for (int k = l; k < r; ++k) {
update|                dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r] + p[r+1] - p[l]);
            }
        }
    }
return|    return n == 0 ? 0 : dp[0][n - 1];
}`,{values:a},L.matrix(dp));const s=(l,m,v={},active=[])=>t.step(l,m,{n,...v},L.matrix(dp,active,{rowLabels:a.map((x,i)=>i+': '+x),colLabels:a.map((_,i)=>i),caption:'dp[l][r]：合并相邻石堆 l…r 的最小成本'}));s('init','只允许合并相邻石堆。');s('table','单独一堆不需要合并，成本为 0。');s('prefix','建立前缀和数组。',{p:Array(n+1).fill(0)});const built=[0];for(let i=0;i<n;i++){built.push(built[i]+a[i]);s('sumLoop','计算前缀和，之后可快速求区间总重量。',{i,p:built.slice()});}
    for(let len=2;;len++){s('length','按区间长度从短到长计算。',{len});if(len>n)break;for(let l=0;;l++){s('left','枚举当前长度的所有起点。',{len,l});if(l+len>n)break;const r=l+len-1;s('right','确定区间右端点。',{len,l,r},[[l,r]]);dp[l][r]=Infinity;s('infinity','先把当前区间成本设为无穷大。',{len,l,r},[[l,r]]);for(let k=l;;k++){s('split','枚举最后一次合并前的分割位置。',{len,l,r,k});if(k>=r)break;const candidate=dp[l][k]+dp[k+1][r]+p[r+1]-p[l];dp[l][r]=Math.min(dp[l][r],candidate);s('update','比较左右子区间成本加上本轮合并重量。',{len,l,r,k,candidate},[[l,k],[k+1,r],[l,r]]);}}}s('return','返回合并整个序列的最小成本。');return t.done(n?dp[0][n-1]:0);
  });
})(AlgoLab);

(function(L){
  'use strict';
  function gridInput(options, obstacles) {
    const grid = options.grid?.map(row => row.slice()) || Array.from({length:4}, () =>
      Array.from({length:5}, () => obstacles ? (Math.random() < .22 ? 1 : 0) : L.rand(1,9)));
    if (!options.grid && obstacles) { grid[0][0] = 0; grid[3][4] = 0; }
    if (!grid.length || !grid[0].length || grid.some(row => row.length !== grid[0].length))
      throw new Error('请输入非空的矩形网格。');
    if (grid.some(row => row.some(value => !Number.isSafeInteger(value) || value < 0 || obstacles && value > 1)))
      throw new Error(obstacles ? '障碍网格使用 0 表示通路，1 表示障碍。' : '路径成本应为非负整数。');
    return grid;
  }
  L.register('grid-paths',(options={})=>{
    const grid=gridInput(options,true), rows=grid.length, cols=grid[0].length;
    const dp=Array.from({length:rows},()=>Array(cols).fill(0));
    const view=(active=[])=>L.matrix(dp.map((row,r)=>row.map((value,c)=>grid[r][c]?'■':value)),active,
      {caption:'只能向右或向下移动；■ 为障碍，数字为抵达该格的路径条数。'});
    const t=L.lessonTrace('grid-paths',{grid},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{rows,cols,...vars},view(active));
    s('size','读取网格的行数与列数。');
    s('init','路径条数全部初始化为 0。');
    for(let r=0;;r++){
      s('row','按从上到下的顺序处理行。',{r});if(r>=rows)break;
      for(let c=0;;c++){
        s('col','按从左到右的顺序处理列。',{r,c});if(c>=cols)break;
        s('blocked','障碍格无法抵达，保持 0 并跳过。',{r,c,blocked:!!grid[r][c]},[[r,c]]);
        if(grid[r][c])continue;
        s('start','判断当前格是否为起点。',{r,c},[[r,c]]);
        if(r===0&&c===0){dp[r][c]=1;s('base','起点有一条空路径；起点若为障碍，不会执行此行。',{r,c},[[r,c]]);}
        else{
          s('top','有上方格时，累加从上方到达的路径。',{r,c},[[r,c]]);
          if(r>0){dp[r][c]+=dp[r-1][c];s('addTop','把上方的路径条数加入当前格。',{r,c},[[r-1,c],[r,c]]);}
          s('left','有左方格时，累加从左方到达的路径。',{r,c},[[r,c]]);
          if(c>0){dp[r][c]+=dp[r][c-1];s('addLeft','把左方的路径条数加入当前格。',{r,c},[[r,c-1],[r,c]]);}
        }
      }
    }
    s('return','右下角的值为路径总数；终点是障碍时为 0。',{},[[rows-1,cols-1]]);
    return t.done(dp[rows-1][cols-1]);
  });
  L.register('grid-min-path',(options={})=>{
    const grid=gridInput(options,false),rows=grid.length,cols=grid[0].length;
    const dp=Array.from({length:rows},()=>Array(cols).fill(0));
    const view=(active=[])=>L.matrix(dp,active,{caption:'dp[r][c]：走到该格的最小累计成本，包含起点与终点。',
      aux:grid.map((row,r)=>({label:'第 '+r+' 行原始成本',values:row}))});
    const t=L.lessonTrace('grid-min-path',{grid},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{rows,cols,...vars},view(active));
    s('size','读取网格大小。');s('init','建立最小路径和状态表。');
    for(let r=0;;r++){
      s('row','依次处理每一行。',{r});if(r>=rows)break;
      for(let c=0;;c++){
        s('col','依次处理当前行的格子。',{r,c});if(c>=cols)break;
        s('start','先判断是否为起点。',{r,c},[[r,c]]);
        if(r===0&&c===0){dp[r][c]=grid[r][c];s('base','起点的最小成本就是自身成本。',{r,c},[[r,c]]);}
        else{
          s('firstRow','第一行只能从左边到达。',{r,c},[[r,c]]);
          if(r===0){dp[r][c]=dp[r][c-1]+grid[r][c];s('fromLeft','左侧最优成本加上当前格成本。',{r,c},[[r,c-1],[r,c]]);}
          else{
            s('firstCol','第一列只能从上方到达。',{r,c},[[r,c]]);
            if(c===0){dp[r][c]=dp[r-1][c]+grid[r][c];s('fromTop','上方最优成本加上当前格成本。',{r,c},[[r-1,c],[r,c]]);}
            else{dp[r][c]=Math.min(dp[r-1][c],dp[r][c-1])+grid[r][c];
              s('choose','选择上方与左方中成本较低的路线，再加入当前格成本。',{r,c,cost:grid[r][c]},[[r-1,c],[r,c-1],[r,c]]);}
          }
        }
      }
    }
    s('return','返回走到右下角的最小累计成本。',{},[[rows-1,cols-1]]);
    return t.done(dp[rows-1][cols-1]);
  });
})(AlgoLab);
