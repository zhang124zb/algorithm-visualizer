(function(L,C){
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  L.register('cross-product',(o={})=>{
    const p=o.points||C.points(3),[a,b,c]=p,t=C.trace('cross-product',{points:p},C.geometry(p)),s=(l,msg,v={})=>t.step(l,msg,v,{...C.geometry(p,[[0,1],[0,2]],[0,1,2]),caption:'采用数学坐标：x 向右、y 向上；正值表示逆时针'});
    const x1=b[0]-a[0],y1=b[1]-a[1],x2=c[0]-a[0],y2=c[1]-a[1];s('vector','以 A 为共同起点构造向量 AB 和 AC。',{x1,y1,x2,y2});const value=x1*y2-y1*x2;s('cross','计算 x1×y2-y1×x2。',{value});s('return',value>0?'C 在有向线段 AB 左侧，逆时针转向。':value<0?'C 在有向线段 AB 右侧，顺时针转向。':'三点共线。',{value});return t.done(value);
  });
  L.register('segment-intersection',(o={})=>{
    const p=o.points||C.points(4),[a,b,c,d]=p,view={...C.geometry(p,[[0,1],[2,3]]),caption:'线段 AB 与 CD，端点接触和共线重叠都算相交'},t=C.trace('segment-intersection',{points:p},view),s=(l,msg,v={})=>t.step(l,msg,v,view);
    const separate=Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]);s('bbox','先检查两个包围盒是否相交。',{separate});if(separate)return t.done(false,'包围盒分离，线段不相交。');const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);s('cross','计算两条线段对彼此端点的四个叉积。',{x,y,z,w});const first=x<=0&&y>=0||x>=0&&y<=0,second=z<=0&&w>=0||z>=0&&w<=0;s('test','端点位于另一条线两侧或在线上，满足含边界的跨立条件。',{first,second});const result=first&&second;s('return',result?'两条线段相交。':'两条线段不相交。',{result});return t.done(result);
  });
  L.register('convex-hull',(o={})=>{
    const points=o.points?.map(p=>p.slice())||C.points(),p=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),h=[],t=C.trace('convex-hull',{points},C.geometry(points));
    const s=(l,msg,v={},point)=>{const ids=h.map(x=>points.findIndex(p=>p[0]===x[0]&&p[1]===x[1])),edges=ids.slice(1).map((id,i)=>[ids[i],id]);t.step(l,msg,{hull:h,...v},{...C.geometry(points,edges,point?[points.findIndex(p=>p[0]===point[0]&&p[1]===point[1])]:[]),caption:'单调链凸包：删除共线中间点，不重复首点'});};
    s('sort','按 x、y 排序并去掉重复点。',{sorted:p});s('base','零个或一个点时，凸包就是自身。');if(p.length<=1)return t.done(p);s('init','初始化边界栈。');for(const point of p){s('lower','从左到右构造下凸壳。',{},point);while(h.length>=2&&cross(h.at(-2),h.at(-1),point)<=0){h.pop();s('popLower','不是逆时针转向，删除中间点。',{},point);}s('popLower','检查转向完成。',{},point);h.push(point);s('pushLower','把当前点加入边界。',{},point);}const threshold=h.length+1;s('split','保存下凸壳长度，反向构造上凸壳。',{threshold});for(let i=p.length-2;i>=0;i--){s('upper','从右到左继续扫描。',{i},p[i]);while(h.length>=threshold&&cross(h.at(-2),h.at(-1),p[i])<=0){h.pop();s('popUpper','删除上凸壳里向内弯的点。',{i},p[i]);}s('popUpper','检查转向完成。',{i},p[i]);h.push(p[i]);s('pushUpper','保留当前边界点。',{i},p[i]);}h.pop();s('return','去掉重复的起点，得到逆时针凸包。');if(h.length>1){const frame=t.steps.at(-1);frame.view.edges.push({u:points.findIndex(p=>p[0]===h.at(-1)[0]&&p[1]===h.at(-1)[1]),v:points.findIndex(p=>p[0]===h[0][0]&&p[1]===h[0][1])});t.current.view=frame.view;}return t.done(h);
  });
})(AlgoLab,AlgoLab.competition);
