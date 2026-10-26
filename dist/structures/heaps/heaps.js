(function(L){
  'use strict';
  for(const id of ['max-heap','min-heap'])L.register(id,(options={})=>{
    const max=id==='max-heap',input=options.values?.slice()||L.unique(7),a=input.slice(),value=options.value??(max?L.rand(45,60):L.rand(0,1)),better=(x,y)=>max?x>y:x<y;
    const t=new L.Trace(`void down(vector<int>& a, int u) {
downLoop|    while (2 * u + 1 < (int)a.size()) {
child|        int v = 2 * u + 1;
choose|        if (v + 1 < (int)a.size() && a[v+1] ${max?'>':'<'} a[v]) ++v;
stop|        if (a[u] ${max?'>=':'<='} a[v]) break;
swapDown|        swap(a[u], a[v]);
descend|        u = v;
    }
}
vector<int> demo(vector<int> a, int value) {
build|    for (int u = (int)a.size()/2 - 1; u >= 0; --u) {
adjust|        down(a, u);
    }
insert|    a.push_back(value);
last|    int u = (int)a.size() - 1;
upLoop|    while (u > 0) {
parent|        int p = (u - 1) / 2;
upStop|        if (a[p] ${max?'>=':'<='} a[u]) break;
swapUp|        swap(a[p], a[u]);
ascend|        u = p;
    }
read|    int removed = a[0];
replace|    a[0] = a.back();
pop|    a.pop_back();
repair|    down(a, 0);
return|    return a;
}`,{values:input,value},{});
    function draw(active=[],vars={}){return {kind:'graph',pointers:Object.fromEntries(['u','v','p'].filter(key=>Number.isInteger(vars[key])&&vars[key]>=0&&vars[key]<a.length).map(key=>[key,vars[key]])),nodes:a.map((value,i)=>{const depth=Math.floor(Math.log2(i+1)),offset=i-(2**depth-1);return{id:i,label:String(value),badge:i,x:(offset+.5)*100/2**depth,y:12+depth*24};}),edges:a.flatMap((_,i)=>i?[{u:Math.floor((i-1)/2),v:i}]:[]),active,aux:[{label:'堆在数组中的存储顺序',values:a}],caption:max?'大根堆：每个父节点不小于孩子':'小根堆：每个父节点不大于孩子'};}
    const s=(l,m,v={},active=[])=>t.step(l,m,{插入值:value,...v},draw(active,v));
    function down(u){while(true){s('downLoop','当前节点还有孩子时继续检查。',{u},[u]);if(2*u+1>=a.length)break;let v=2*u+1;s('child','先选择左孩子。',{u,v},[u,v]);if(v+1<a.length&&better(a[v+1],a[v]))v++;s('choose',max?'选择较大的孩子。':'选择较小的孩子。',{u,v},[u,v]);s('stop','父子关系满足堆性质时停止。',{u,v},[u,v]);if(!better(a[v],a[u]))break;[a[u],a[v]]=[a[v],a[u]];s('swapDown','父节点与选中的孩子交换。',{u,v},[u,v]);u=v;s('descend','继续在下一层检查。',{u},[u]);}}
    for(let u=Math.floor(a.length/2)-1;;u--){s('build','从最后一个非叶子节点向根建立堆。',{u});if(u<0)break;s('adjust','调整这个节点的子树。',{u},[u]);down(u);}a.push(value);s('insert','新元素先放入数组末尾。',{},[a.length-1]);let u=a.length-1;s('last','从新元素所在位置开始上浮。',{u},[u]);while(true){s('upLoop','根节点没有父节点。',{u},[u]);if(u<=0)break;const p=Math.floor((u-1)/2);s('parent','计算父节点下标。',{u,p},[u,p]);s('upStop','父子关系已经满足堆性质时停止。',{u,p},[u,p]);if(!better(a[u],a[p]))break;[a[u],a[p]]=[a[p],a[u]];s('swapUp','新元素与父节点交换。',{u,p},[u,p]);u=p;s('ascend','继续向根节点移动。',{u},[u]);}const removed=a[0];s('read','下面演示删除堆顶：先保存堆顶值。',{removed},[0]);a[0]=a[a.length-1];s('replace','用最后一个元素覆盖堆顶。',{removed},[0]);a.pop();s('pop','移除数组末尾位置。',{removed});s('repair','从根向下恢复堆性质。',{removed},[0]);down(0);s('return','建堆、插入和删除堆顶全部完成。',{removed});return t.done(a);
  });
})(AlgoLab);
