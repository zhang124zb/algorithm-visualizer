(function(L){
  'use strict';
  L.register('dsu-size',(options={})=>{
    const n=options.n??L.rand(5,8);
    const edges=options.edges?.map(pair=>pair.slice())||(n?Array.from({length:n+2},()=>[L.rand(0,n-1),L.rand(0,n-1)]):[]);
    const parent=Array.from({length:n},(_,i)=>i),size=Array(n).fill(1),stack=[];
    const t=L.lessonTrace('dsu-size',{n,edges},{});
    const draw=(active=[])=>({
      kind:'graph',directed:true,
      nodes:parent.map((_,i)=>({id:i,label:String(i),x:12+(i%4)*25,y:Math.floor(i/4)*42+25,badge:parent[i]===i?`size=${size[i]}`:undefined})),
      edges:parent.flatMap((p,i)=>p===i?[]:[{u:i,v:p}]),active,
      aux:[{label:'parent：父节点',values:parent},{label:'size：仅根节点处有效',values:size}],
      caption:'小集合挂到大集合下；查找时压缩路径。根节点上的 size 才是当前集合的大小。'
    });
    const s=(label,message,vars={},active=[])=>t.step(label,message,{parent,size,调用栈:stack.slice(),...vars},draw(active));
    function find(x){
      stack.push(x);
      s('root','父节点等于自身时，这个节点就是集合代表。',{x},[x]);
      if(parent[x]===x){stack.pop();return x;}
      s('recurse','递归查找父节点的代表。',{x},[x,parent[x]]);
      const root=find(parent[x]);
      s('recurse','递归返回集合代表。',{x,root},[x,root]);
      parent[x]=root;
      s('compress','把当前节点直接连接到代表，压缩查询路径。',{x,root},[x,root]);
      s('returnRoot','返回集合代表。',{x,root},[root]);
      stack.pop();
      return root;
    }
    s('init','每个节点最初单独构成大小为 1 的集合。',{n});
    for(let i=0;;i++){
      s('loop','读取下一对需要合并的节点。',{i});
      if(i>=edges.length)break;
      const [u,v]=edges[i];
      s('first','查找第一个节点的集合代表。',{u,v},[u]);
      let a=find(u);
      s('first','已得到第一个集合代表。',{u,v,a},[a]);
      s('second','查找第二个节点的集合代表。',{u,v,a},[v]);
      let b=find(v);
      s('second','已得到第二个集合代表。',{u,v,a,b},[b]);
      s('same','代表相同时已经连通，跳过此次合并。',{u,v,a,b},[a,b]);
      if(a===b)continue;
      s('compare','比较两个集合大小，保证 a 是较大的集合。',{a,b},[a,b]);
      if(size[a]<size[b]){
        [a,b]=[b,a];
        s('swap','交换两个代表，较大集合放在 a。',{a,b},[a,b]);
      }
      parent[b]=a;
      s('attach','把较小集合的根 b 连接到较大集合的根 a。',{a,b},[a,b]);
      size[a]+=size[b];
      s('increase','更新新根 a 的集合大小；非根位置的 size 不再使用。',{a,b},[a]);
    }
    const result=Array(n).fill(0);
    s('output','准备每个节点的最终代表数组。',{result});
    for(let i=0;;i++){
      s('collect','依次查询所有节点，同时完成路径压缩。',{i,result});
      if(i>=n)break;
      s('write','查找当前节点的代表。',{i,result},[i]);
      result[i]=find(i);
      s('write','写入当前节点的最终代表。',{i,result},[i,result[i]]);
    }
    s('return','返回每个节点所属集合的代表。',{result});
    return t.done(result);
  });
})(AlgoLab);
