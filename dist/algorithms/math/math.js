(function (L) {
  'use strict';
  L.register('gcd',(options={})=>{
    let a=options.a??L.rand(30,120),b=options.b??L.rand(12,60);
    const t=new L.Trace(`int gcd(int a, int b) {
loop|    while (b != 0) {
remainder|        int r = a % b;
move|        a = b;
next|        b = r;
    }
result|    return a;
}`,{a,b},L.array([a,b]));
    let r='—';const s=(line,msg)=>t.step(line,msg,{a,b,r},L.array([a,b],[],{labels:['a','b']}));
    while(true){s('loop','检查除数 b 是否为零。');if(b===0)break;r=a%b;s('remainder','计算余数 r = a % b。');a=b;s('move','将原来的除数移到 a。');b=r;s('next','让余数成为下一轮的除数。');}s('result','b 为零，a 就是最大公约数。');return t.done(a);
  });
  L.register('fast-power',(options={})=>{
    let a=options.a??L.rand(2,9),n=options.n??L.rand(5,15),mod=options.mod??97;
    const input={a,n,mod};let result=1;
    const t=new L.Trace(`long long power(long long a, int n, int mod) {
init|    long long result = 1;
loop|    while (n > 0) {
odd|        if (n & 1) {
multiply|            result = result * a % mod;
        }
square|        a = a * a % mod;
half|        n >>= 1;
    }
return|    return result;
}`,input,L.array([a,n,result]));
    const s=(l,m)=>t.step(l,m,{a,n,mod,result,指数二进制:n.toString(2)},L.array([a,n,result],[],{labels:['底数 a','指数 n','结果']}));
    s('init','累乘结果初始化为 1。');while(true){s('loop','检查指数是否仍有未处理的二进制位。');if(n<=0)break;s('odd','检查最低二进制位是否为 1。');if(n&1){result=result*a%mod;s('multiply','把当前底数乘入结果，并对 mod 取模。');}a=a*a%mod;s('square','底数平方，准备处理下一位。');n>>=1;s('half','指数右移一位，相当于整除 2。');}s('return','所有二进制位处理完毕。');return t.done(result);
  });
  L.register('sieve',(options={})=>{
    const n=options.n??L.rand(24,40),prime=Array(n+1).fill(true);
    const t=new L.Trace(`vector<int> sieve(int n) {
init|    vector<bool> prime(n + 1, true);
zero|    prime[0] = false;
one|    if (n >= 1) prime[1] = false;
outer|    for (int p = 2; p * p <= n; ++p) {
test|        if (!prime[p]) continue;
inner|        for (int x = p * p; x <= n; x += p) {
mark|            prime[x] = false;
        }
    }
list|    vector<int> answer;
collect|    for (int x = 2; x <= n; ++x) {
push|        if (prime[x]) answer.push_back(x);
    }
return|    return answer;
}`,{n},L.array([]));
    const view=(active=[])=>({kind:'numbers',values:Array.from({length:n+1},(_,i)=>i),active,muted:prime.map((p,i)=>p?-1:i).filter(x=>x>=0)});
    const s=(l,m,v={},active=[])=>t.step(l,m,{n,...v},view(active));
    s('init','先假设所有数字都是素数。');prime[0]=false;s('zero','0 不是素数。',{},[0]);if(n>=1)prime[1]=false;s('one','1 不是素数。',{},[1]);
    for(let p=2;;p++){s('outer','只需筛到平方不超过 n 的素数。',{p},[p]);if(p*p>n)break;s('test','合数已经被标记，直接跳过。',{p},[p]);if(!prime[p])continue;for(let x=p*p;;x+=p){s('inner','从 p² 开始枚举 p 的倍数。',{p,x},x<=n?[x]:[]);if(x>n)break;prime[x]=false;s('mark','这个数是 p 的倍数，划去。',{p,x},[x]);}}
    const answer=[];s('list','准备收集所有未被划去的数字。',{answer});for(let x=2;;x++){s('collect','依次检查剩余数字。',{x,answer});if(x>n)break;if(prime[x])answer.push(x);s('push',prime[x]?'保留这个素数。':'已被划去，不加入结果。',{x,answer},[x]);}s('return','返回素数列表。',{answer});return t.done(answer);
  });
})(AlgoLab);

(function(L){
  'use strict';
  L.register('lcm',(options={})=>{
    const a=options.a??L.rand(6,42),b=options.b??L.rand(4,30);
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0)
      throw new Error('最小公倍数演示使用非负安全整数。');
    let x=a,y=b,r='—',result=0;
    const view=(active=[])=>L.array([x,y,result],active,{labels:['x','y','LCM'],
      caption:'先用欧几里得算法求 GCD，再计算 (a / GCD) × b；先除后乘可减少中间结果。',
      aux:[{label:'原始 a、b',values:[a,b]}]});
    const t=L.lessonTrace('lcm',{a,b},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{a,b,x,y,r,result,...vars},view(active));
    s('zero','只要任一数为 0，最小公倍数约定为 0。');
    if(a===0||b===0){s('zeroResult','返回 0，同时避免后面除以 0。',{},[2]);return t.done(0);}
    s('copy','复制原数，用 x、y 计算最大公约数。',{},[0,1]);
    while(true){
      s('loop','当 y 非零时，继续辗转相除。',{},[1]);if(y===0)break;
      r=x%y;s('remainder','计算余数 r = x % y。',{},[0,1]);
      x=y;s('move','把原来的除数移到 x。',{},[0]);
      y=r;s('next','把余数移到 y，进入下一轮。',{},[1]);
    }
    result=a/x*b;
    if(!Number.isSafeInteger(result))throw new Error('结果超过浏览器可精确表示的整数范围，请使用较小输入。');
    s('calculate','此时 x 是 GCD；先除去公共因子，再乘以另一个数。',{gcd:x},[0,2]);
    s('return','返回两个数的最小公倍数。',{},[2]);return t.done(result);
  });
  L.register('mod-arithmetic',(options={})=>{
    const a=options.a??L.rand(-50,50),b=options.b??L.rand(-50,50),modulus=options.modulus??L.rand(3,17);
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||!Number.isSafeInteger(modulus)||modulus<=0)
      throw new Error('a、b 应为安全整数，模数应为正整数。');
    let x=0,y=0,add=0,subtract=0,multiply=0;
    const view=(active=[])=>L.array([x,y,add,subtract,multiply],active,
      {labels:['规范化 a','规范化 b','模加','模减','模乘'],
       caption:'将余数统一到 [0, modulus)；先取余再运算。此处不包含模除法。',
       aux:[{label:'原始 a、b、modulus',values:[a,b,modulus]}]});
    const t=L.lessonTrace('mod-arithmetic',{a,b,modulus},view());
    const s=(label,message,active=[])=>t.step(label,message,{a,b,modulus,x,y,add,subtract,multiply},view(active));
    x=((a%modulus)+modulus)%modulus;s('normalizeA','两次取余把 a 的负余数也规范化到非负范围。',[0]);
    y=((b%modulus)+modulus)%modulus;s('normalizeB','用同样方式规范化 b。',[1]);
    if(!Number.isSafeInteger(x+y)||!Number.isSafeInteger(x*y)||!Number.isSafeInteger(x-y+modulus))
      throw new Error('中间结果超过浏览器可精确表示的整数范围，请使用较小输入。');
    add=(x+y)%modulus;s('add','相加后取模，结果仍落在合法余数范围。',[0,1,2]);
    subtract=(x-y+modulus)%modulus;s('subtract','相减后先加一个模数，避免得到负余数。',[0,1,3]);
    multiply=x*y%modulus;s('multiply','相乘后取模；C++ 与 Java 使用 64 位整数保存乘积。',[0,1,4]);
    s('return','依次返回模加、模减和模乘结果。',[2,3,4]);
    return t.done([add,subtract,multiply]);
  });
})(AlgoLab);
