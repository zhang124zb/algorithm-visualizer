(function(L) {
  'use strict';
  L.register('enumeration',(o={})=>{
    const a=o.a?.slice()||L.numbers(7,1,12),target=o.target??(a.length>=5?a[1]+a[4]:a.length>=2?a[0]+a[1]:0);
    const t=L.lessonTrace('enumeration',{a,target},L.array(a));
    const s=(label,message,vars={},active=[])=>t.step(label,message,{target,...vars},L.array(a,active,{pointers:Object.fromEntries(['i','j'].filter(name=>Number.isInteger(vars[name])).map(name=>[name,vars[name]]))}));
    for(let i=0;;i++){
      s('outer','枚举第一个下标。',{i},i<a.length?[i]:[]);
      if(i>=a.length)break;
      for(let j=i+1;;j++){
        s('inner','第二个下标从 i + 1 开始，保证两个元素不同且不重复枚举。',{i,j},j<a.length?[i,j]:[i]);
        if(j>=a.length)break;
        const sum=a[i]+a[j];s('sum','计算这一对元素的和。',{i,j,sum},[i,j]);
        s('match',sum===target?'这一对的和等于目标。':'这一对不满足目标，继续枚举。',{i,j,sum},[i,j]);
        if(sum===target){s('found','返回第一对满足条件的下标。',{i,j,sum},[i,j]);return t.done([i,j]);}
      }
    }
    s('missing','所有不同下标对均已检查，返回未找到标记。');
    return t.done([-1,-1]);
  });

  L.register('simulation',(o={})=>{
    const a=o.a?.slice()||L.numbers(5,1,8),quantum=o.quantum??L.rand(2,3);
    if(!Number.isInteger(quantum)||quantum<=0||a.some(x=>!Number.isInteger(x)||x<=0))throw new Error('任务耗时和时间片必须是正整数。');
    const remain=a.slice(),q=[],order=[];let time=0;
    const t=L.lessonTrace('simulation',{a,quantum},L.array(a));
    const s=(label,message,vars={},active=[])=>t.step(label,message,{quantum,time,queue:q.slice(),order:order.slice(),...vars},L.array(remain,active,{pointers:Object.fromEntries(['i','u'].filter(name=>Number.isInteger(vars[name])).map(name=>[name,vars[name]])),caption:'各任务剩余时间；下标表示任务编号，所有任务在时刻 0 到达。',aux:[{label:'等待队列（左侧先运行）',values:q},{label:'完成顺序',values:order}]}));
    s('remaining','复制每个任务的初始耗时。');s('queue','建立等待队列。');s('order','建立完成顺序列表。');s('clock','模拟时钟从 0 开始。');
    for(let i=0;;i++){s('seed','按任务编号把所有任务加入初始队列。',{i});if(i>=a.length)break;q.push(i);s('enqueue','当前任务进入队尾。',{i},[i]);}
    while(true){
      s('loop','检查等待队列是否还有任务。');if(!q.length)break;
      const u=q.shift();s('pop','取出队首任务，本轮只服务它一个时间片。',{u},[u]);
      const used=Math.min(quantum,remain[u]);s('slice','本轮运行时间取时间片和剩余时间的较小值。',{u,used},[u]);
      remain[u]-=used;s('consume','扣除本轮运行时间。',{u,used},[u]);
      time+=used;s('advance','推进模拟时钟。',{u,used},[u]);
      s('finished',remain[u]===0?'该任务已经完成。':'该任务尚未完成，需要继续排队。',{u,used},[u]);
      if(remain[u]===0){order.push(u);s('complete','记录完成任务的编号。',{u},[u]);}
      else {q.push(u);s('requeue','把未完成的任务放回队尾。',{u},[u]);}
    }
    s('return','所有任务完成，返回完成顺序。');return t.done(order);
  });

  L.register('recursion',(o={})=>{
    const n=o.n??L.rand(3,6),stack=[];
    if(!Number.isInteger(n)||n<0||n>12)throw new Error('阶乘演示支持 0 到 12 的整数。');
    const t=L.lessonTrace('recursion',{n},L.array([]));
    const s=(label,message,vars={})=>t.step(label,message,{调用栈:stack.slice(),...vars},L.array(stack.map(x=>x.n),stack.length?[stack.length-1]:[],{caption:'阶乘递归调用栈：最右侧是正在执行的调用。',aux:[{label:'各层状态',values:stack.map(x=>x.state)}]}));
    function factorial(k){
      stack.push({n:k,state:'检查基例'});
      s('base','每次调用先判断 n 是否不大于 1。',{n:k});
      if(k<=1){stack[stack.length-1].state='返回 1';s('one','0! 和 1! 都等于 1，递归在这里停止。',{n:k,result:1});stack.pop();return 1;}
      stack[stack.length-1].state=`等待 ${k-1}!`;s('recurse','当前层暂时等待，递归求下一层的阶乘。',{n:k});
      const child=factorial(k-1),answer=k*child;stack[stack.length-1].state=`${k} × ${child} = ${answer}`;
      s('multiply','下一层返回后，当前 n 乘以子问题结果。',{n:k,child,answer});
      s('return','当前层完成，将结果交给上一层。',{n:k,child,answer});stack.pop();return answer;
    }
    const result=factorial(n);s(n<=1?'one':'return','最外层调用也已返回，调用栈清空。',{n,result});return t.done(result,`${n}! = ${result}，所有调用已返回。`);
  });

  L.register('divide-conquer',(o={})=>{
    const a=o.a?.slice()||L.numbers(8,-9,30),stack=[];
    if(!a.length)throw new Error('分治求最大值需要至少一个元素。');
    const t=L.lessonTrace('divide-conquer',{a},L.array(a));
    const s=(label,message,vars={},active=[])=>t.step(label,message,{调用栈:stack.slice(),...vars},L.array(a,active,{pointers:Object.fromEntries(['l','r','mid'].filter(name=>Number.isInteger(vars[name])).map(name=>[name,vars[name]])),range:stack.length?[stack.at(-1).l,stack.at(-1).r-1]:[0,a.length-1],caption:'每层处理半开区间 [l, r)，下标 r 不包含在区间内。',aux:[{label:'递归区间（右侧是当前层）',values:stack.map(x=>`[${x.l},${x.r})`)}]}));
    function solve(l,r){
      stack.push({l,r});s('base','区间只有一个元素时，直接得到最大值。',{l,r});
      if(r-l===1){const value=a[l];s('leaf','返回这个单独元素。',{l,r,value},[l]);stack.pop();return value;}
      const mid=l+Math.floor((r-l)/2);s('split','把当前区间分成两个互不重叠的子区间。',{l,r,mid},[mid]);
      s('left','递归求左半区间的最大值。',{l,r,mid});const left=solve(l,mid);
      s('right','左半区间已返回，递归求右半区间的最大值。',{l,r,mid,left});const right=solve(mid,r);
      const answer=Math.max(left,right);s('merge','合并两个子问题：取左右最大值中较大的一个。',{l,r,mid,left,right,answer});
      s('result','返回当前区间的最大值。',{l,r,left,right,answer});stack.pop();return answer;
    }
    s('start','从覆盖整个数组的区间 [0, n) 开始分治。',{l:0,r:a.length});
    const result=solve(0,a.length);s('start','全部子问题已合并，最外层调用返回结果，调用栈清空。',{result});return t.done(result,`整个数组的最大值为 ${result}。`);
  });
})(AlgoLab);
