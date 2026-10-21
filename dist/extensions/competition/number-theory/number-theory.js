(function(L,C){
  L.register('factorization',(o={})=>{
    let n=o.n??L.rand(12,240);const factors=[],t=C.trace('factorization',{n},L.array([])),s=(l,msg,v={})=>t.step(l,msg,{remaining:n,...v},L.array(factors,[],{caption:'质因子按从小到大排列，重复次数表示指数'}));
    s('init','输入 n≥1，依次尝试可能的质因子。');for(let p=2;p<=Math.floor(n/p);p++){s('loop','只需尝试到剩余 n 的平方根。',{p});while(true){s('test','检查能否被当前因子整除。',{p});if(n%p)break;factors.push(p);n/=p;s('divide','记录质因子，并把它除掉。',{p});}}if(n>1)factors.push(n);s('remain','剩余值大于 1 时，它本身是最后一个质因子。');s('return','全部质因子相乘可还原输入，1 对应空列表。');return t.done(factors);
  });
  L.register('extended-gcd',(o={})=>{
    const a=o.a??L.rand(10,100),b=o.b??L.rand(1,60),calls=[],t=C.trace('extended-gcd',{a,b},L.array([a,b])),s=(l,msg,v={})=>t.step(l,msg,v,L.array(v.a===undefined?[a,b]:[v.a,v.b],[],{labels:['a','b'],aux:[{label:'递归调用栈 [a,b]',values:calls}]}));
    function solve(a,b){calls.push([a,b]);s('base','b=0 时，a×1+b×0=a。',{a,b});if(!b){calls.pop();return [a,1,0];}s('recur','递归求 b 与 a%b 的贝祖系数。',{a,b});const [g,oldX,oldY]=solve(b,a%b);const x=oldY;s('x','交换到当前问题：x 等于下一层的 y。',{a,b,g,x});const y=oldX-Math.floor(a/b)*oldY;s('y','按 a%b=a-floor(a/b)×b 推回 y。',{a,b,g,x,y});s('return','返回 [g,x,y]，满足 a×x+b×y=g。',{a,b,g,x,y});calls.pop();return [g,x,y];}
    return t.done(solve(a,b));
  });
  L.register('linear-sieve',(o={})=>{
    const n=o.n??L.rand(20,42),lp=Array(n+1).fill(0),primes=[],t=C.trace('linear-sieve',{n},{kind:'numbers',values:[]}),s=(l,msg,v={},active=[])=>t.step(l,msg,{n,primes,...v},{kind:'numbers',values:Array.from({length:Math.max(0,n-1)},(_,i)=>i+2),active,muted:lp.flatMap((p,i)=>p&&p!==i?[i]:[]),aux:[{label:'已找到的素数',values:primes},{label:'最小质因子 lp',values:lp}]} );
    s('init','lp 记录每个数的最小质因子，0 表示未标记。');for(let i=2;i<=n;i++){s('loop','检查下一个整数。',{i},[i]);if(!lp[i]){lp[i]=i;primes.push(i);}s('prime','未标记的数是素数，加入素数表。',{i},[i]);for(const p of primes){s('scan','从小到大枚举已经发现的素数。',{i,p});s('test','只用 p≤lp[i] 的素数，且乘积不能越界。',{i,p});if(p>lp[i]||i*p>n)break;lp[i*p]=p;s('mark','让合数 i×p 只被其最小质因子 p 标记一次。',{i,p},[i*p]);}}s('return','返回不大于 n 的全部素数。');return t.done(primes);
  });
  L.register('pascal',(o={})=>{
    const n=o.n??L.rand(5,8),k=o.k??L.rand(0,n),c=Array.from({length:n+1},()=>Array(n+1).fill('—')),t=C.trace('pascal',{n,k},L.matrix(c)),s=(l,msg,v={},active=[])=>t.step(l,msg,{n,k,...v},L.matrix(c,active,{caption:'C(i,j) = C(i-1,j-1) + C(i-1,j)，演示使用小规模整数'}));
    s('init','每一行表示从 i 个元素中选取 j 个。');for(let i=0;i<=n;i++){s('row','生成下一行。',{i});c[i][0]=c[i][i]=1;s('edge','不选或全部选，方案数都为 1。',{i},[[i,0],[i,i]]);for(let j=1;j<i;j++){s('loop','计算这一行的内部元素。',{i,j});c[i][j]=c[i-1][j-1]+c[i-1][j];s('add','按是否选择最后一个元素分成两种互斥情况。',{i,j},[[i,j],[i-1,j-1],[i-1,j]]);}}s('return','读取第 n 行第 k 列。',{result:c[n][k]},[[n,k]]);return t.done(c[n][k]);
  });
})(AlgoLab,AlgoLab.competition);
