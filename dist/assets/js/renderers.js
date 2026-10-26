(function(L){
  'use strict';
  L.escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const E=L.escape;
  const pointerStates=new WeakMap(),pointerColors=['#79baff','#d3a3ff','#f3cd77','#7fd7b2','#f3a8b6','#7ed6df'];
  function pointerColor(name){const groups=[/^(?:i|left|l|lo|low|front|head)$/,/^(?:j|right|r|hi|high|rear|back)$/,/^(?:mid|pivot|top)$/];const match=groups.findIndex(re=>re.test(name));return pointerColors[match<0?[...name].reduce((n,c)=>n+c.charCodeAt(0),0)%pointerColors.length:match];}
  L.drawPointers=function(host,pointers={},options={}){
    const count=Number.isSafeInteger(options.count)&&options.count>=0?options.count:0;
    const entries=Object.entries(pointers).filter(([,index])=>Number.isSafeInteger(index));
    let state=pointerStates.get(host);
    if(!entries.length){
      host.querySelector(':scope > .pointer-overlay')?.remove();host.classList.remove('pointer-host');
      if(host.style.getPropertyValue('--pointer-space')){host.style.removeProperty('--pointer-space');if(!host.style.length)host.removeAttribute('style');}
      pointerStates.delete(host);return;
    }
    if(!state){const overlay=document.createElement('div');overlay.className='pointer-overlay';overlay.setAttribute('role','group');overlay.setAttribute('aria-label','算法位置指针');host.append(overlay);state={overlay,nodes:new Map()};pointerStates.set(host,state);}
    state.pointers=pointers;state.options=options;host.classList.add('pointer-host');
    const width=Math.max(1,host.clientWidth),positions=typeof options.positions==='function'?options.positions():options.positions;
    const visible=Array.isArray(positions)?positions.length:count,summary=[],items=[];
    for(const [name,index]of entries){
      let point,boundary='';
      if(!count){summary.push(name+' = '+index+'（当前为空）');continue;}
      if(index===-1){point={x:5};boundary='before';}
      else if(index===count&&visible>=count){point={x:width-5};boundary='after';}
      else if(index<0||index>count){summary.push(name+' = '+index+'（越界）');continue;}
      else if(index>=visible||index===count){summary.push(name+' = '+index+'（未展示'+(index===count?'，尾后位置':'')+'）');continue;}
      else{const value=positions?.[index];point=Array.isArray(positions)?typeof value==='number'?{x:value}:value:{x:(index+.5)*width/count};}
      if(!point||!Number.isFinite(point.x)||point.x<0||point.x>width||(point.side&&!Number.isFinite(point.y))){summary.push(name+' = '+index+'（未展示）');continue;}
      const label=boundary?name+' = '+index:name,labelWidth=Math.min(Math.max(34,[...label].length*7+18),Math.max(34,width-8),160);
      const center=Math.max(labelWidth/2+4,Math.min(width-labelWidth/2-4,point.x));
      items.push({name,index,point,boundary,label,labelWidth,center});
    }
    const lanes=[];let laneCount=0;
    for(const item of items.slice().sort((a,b)=>a.point.x-b.point.x||a.name.localeCompare(b.name))){
      if(item.point.side){item.lane=0;continue;}
      const left=item.center-item.labelWidth/2-4,right=item.center+item.labelWidth/2+4;
      let lane=0;while(lanes[lane]?.some(span=>left<span[1]&&right>span[0]))lane++;
      (lanes[lane]||= []).push([left,right]);item.lane=lane;laneCount=Math.max(laneCount,lane+1);
    }
    const keep=new Set(items.map(item=>item.name));
    for(const [name,node]of state.nodes)if(!keep.has(name)){node.remove();state.nodes.delete(name);}
    for(const item of items.slice().sort((a,b)=>a.name.localeCompare(b.name))){
      let node=state.nodes.get(item.name);
      if(!node){node=document.createElement('div');node.className='algorithm-pointer';node.innerHTML='<span class="pointer-shaft" aria-hidden="true"></span><span class="pointer-tip" aria-hidden="true"></span><span class="pointer-badge"></span>';state.overlay.append(node);state.nodes.set(item.name,node);}
      const side=!!item.point.side,reversed=side&&item.point.x+item.labelWidth+24>width;
      node.className='algorithm-pointer'+(item.boundary?' is-boundary':'')+(side?' is-side':'')+(reversed?' is-reversed':'');
      node.dataset.name=item.name;node.dataset.index=item.index;node.dataset.boundary=item.boundary;
      node.style.left=item.point.x+'px';node.style.setProperty('--pointer-color',pointerColor(item.name));node.style.setProperty('--pointer-lane',item.lane);
      if(side)node.style.top=item.point.y+'px';else node.style.removeProperty('top');
      const description=item.name+' = '+item.index+(item.boundary==='before'?'（左边界外）':item.boundary==='after'?'（尾后位置）':'');
      node.setAttribute('aria-label',description);node.title=description;
      const badge=node.querySelector('.pointer-badge');badge.textContent=item.label;badge.style.width=item.labelWidth+'px';
      badge.style.left=(side?(reversed?-24-item.labelWidth/2:24+item.labelWidth/2):item.center-item.point.x)+'px';
      state.overlay.append(node);
    }
    state.overlay.querySelector('.pointer-summary')?.remove();
    if(summary.length){const node=document.createElement('div');node.className='pointer-summary';node.textContent=summary.join(' · ');node.title=node.textContent;state.overlay.append(node);}
    host.style.setProperty('--pointer-space',(laneCount?laneCount*28+24:0)+(summary.length?28:0)+'px');
  };
  if(typeof window!=='undefined'){let pointerResize;window.addEventListener('resize',()=>{clearTimeout(pointerResize);pointerResize=setTimeout(()=>{for(const host of document.querySelectorAll('.pointer-host')){const state=pointerStates.get(host);if(state)L.drawPointers(host,state.pointers,state.options);}},30);});}
  const includes=(list,key)=>list?.some(x=>Array.isArray(x)?Array.isArray(key)&&x[0]===key[0]&&x[1]===key[1]:x===key);
  function tokens(values){return '<div class="tokens">'+(values.length?values.map(x=>'<span class="token">'+E(typeof x==='object'?JSON.stringify(x):x)+'</span>').join(''):'<span class="token">空</span>')+'</div>';}
  function aux(rows){return (rows||[]).map(row=>'<div class="aux-row"><div class="aux-label">'+E(row.label)+'</div>'+tokens(row.values)+'</div>').join('');}
  function matrix(view){const rows=view.rows||[],grid=view.kind==='grid',queens=view.kind==='queens';const data=queens?Array.from({length:view.n},(_,r)=>Array.from({length:view.n},(_,c)=>view.col[r]===c?'♛':'')):rows;
    return '<div class="matrix-wrap"><table class="matrix-table '+(queens?'queens-table ':'')+(view.conflict?'conflict':'')+'" aria-label="'+(queens?'皇后棋盘':grid?'迷宫状态':'状态矩阵')+'"><thead><tr><th scope="col"></th>'+(data[0]||[]).map((_,c)=>'<th scope="col">'+E(view.colLabels?.[c]??c)+'</th>').join('')+'</tr></thead><tbody>'+data.map((row,r)=>'<tr><th scope="row">'+E(view.rowLabels?.[r]??r)+'</th>'+row.map((value,c)=>{
      const key=[r,c],classes=[includes(view.active,key)?'active':'',includes(view.visited,key)?'visited':'',includes(view.path,key)?'path':'',grid&&value===1?'wall':'',includes([view.start],key)?'start':'',includes([view.goal],key)?'goal':''].filter(Boolean).join(' ');
      const label=grid?(includes([view.start],key)?'S':includes([view.goal],key)?'E':value===1?'■':includes(view.path,key)?'•':''):value;
      return '<td class="'+classes+'" title="['+r+', '+c+']">'+E(label)+'</td>';
    }).join('')+'</tr>').join('')+'</tbody></table></div>';
  }
  function buckets(view){return '<div class="bucket-list">'+view.buckets.map((row,i)=>'<div class="bucket-row '+(includes(view.active,i)?'active':'')+'"><span class="bucket-index">'+E(view.labels?.[i]??i)+'</span>'+tokens(row)+'</div>').join('')+'</div>';}
  function graph(view){const w=600,h=290,nodes=view.nodes||[],edges=view.edges||[],map=new Map(nodes.map(n=>[n.id,n]));const point=n=>[Number(n.x)/100*w,Number(n.y)/100*h];
    let html='<svg class="graph-stage" viewBox="0 0 600 290" role="img" aria-label="节点及连接关系"><defs><marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker></defs>';
    for(const edge of edges){const a=map.get(edge.u),b=map.get(edge.v);if(!a||!b)continue;const [ax,ay]=point(a),[bx,by]=point(b),dx=bx-ax,dy=by-ay,distance=Math.max(1,Math.hypot(dx,dy)),start=[ax+dx/distance*21,ay+dy/distance*21],end=[bx-dx/distance*24,by-dy/distance*24];
      const chosen=view.chosen?.some(pair=>(pair[0]===edge.u&&pair[1]===edge.v)||(!view.directed&&pair[1]===edge.u&&pair[0]===edge.v));const color=chosen?'#5279df':'#ced7e7';let d=`M${start[0]},${start[1]} L${end[0]},${end[1]}`;
      if(edge.back)d=`M${start[0]},${start[1]+8} Q${(ax+bx)/2},${(ay+by)/2+40} ${end[0]},${end[1]+8}`;
      if(edge.u===edge.v)d=`M${ax-13},${ay-16} C${ax-60},${ay-80} ${ax+60},${ay-80} ${ax+13},${ay-16}`;
      html+='<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+(chosen?3:1.8)+'" '+(edge.back?'stroke-dasharray="4 4" ':'')+(view.directed?'marker-end="url(#graph-arrow)"':'')+'/>';
      if(view.weighted&&edge.w!==undefined)html+='<text x="'+((ax+bx)/2-dy/distance*10)+'" y="'+((ay+by)/2+dx/distance*10)+'" text-anchor="middle" font-size="11" fill="#8192b0" paint-order="stroke" stroke="white" stroke-width="5">'+E(edge.w)+'</text>';
    }
    for(const n of nodes){const [x,y]=point(n),classes=['node',includes(view.active,n.id)?'active':'',includes(view.visited,n.id)?'visited':'',n.muted?'muted':''].filter(Boolean).join(' ');html+='<g class="'+classes+'" transform="translate('+x+','+y+')"><circle r="20" fill="#f6f8fd" stroke="#cdd8ee" stroke-width="1.5"/><text text-anchor="middle" dominant-baseline="central" font-size="'+(String(n.label).length>4?10:14)+'" fill="#5b739d">'+E(n.label)+'</text>'+(n.badge!==undefined?'<text class="node-badge" y="38" text-anchor="middle">'+E(n.badge)+'</text>':'')+'</g>';}
    const pointerLanes=new Map();let pointerTop=0;
    for(const [name,id]of Object.entries(view.pointers||{})){
      const node=map.get(id);if(!node)continue;
      const [x,y]=point(node),lane=pointerLanes.get(id)||0;pointerLanes.set(id,lane+1);
      const direction=-1,tipY=y-25,labelY=y-48-lane*25,color=pointerColor(name),labelWidth=Math.min(110,Math.max(32,name.length*7+16)),labelX=Math.max(labelWidth/2+3,Math.min(w-labelWidth/2-3,x));pointerTop=Math.min(pointerTop,labelY-15);
      html+='<g class="graph-pointer" data-name="'+E(name)+'" data-index="'+E(id)+'" role="img" aria-label="'+E(name+' 指向节点 '+node.label)+'" style="color:'+color+'"><path class="graph-pointer-shaft" d="M'+x+','+(labelY-direction*10)+' L'+x+','+(tipY+direction*6)+'"/><path class="graph-pointer-tip" d="M'+(x-4)+','+(tipY+direction*6)+' L'+x+','+tipY+' L'+(x+4)+','+(tipY+direction*6)+' Z"/><rect x="'+(labelX-labelWidth/2)+'" y="'+(labelY-10)+'" width="'+labelWidth+'" height="21" rx="5"/><text x="'+labelX+'" y="'+(labelY+1)+'" text-anchor="middle" dominant-baseline="central">'+E(name)+'</text></g>';
    }
    if(pointerTop<0)html=html.replace('viewBox="0 0 600 290"','viewBox="0 '+pointerTop+' 600 '+(h-pointerTop)+'"');
    html+='</svg>';return html;
  }
  function strings(view){const chars=(str,active)=>[...str].map((c,i)=>'<span class="character '+(includes(active,i)?'active':'')+'">'+E(c)+'<small>'+i+'</small></span>').join('');return '<div class="strings-stage"><div class="string-label">文本 TEXT</div><div class="character-row">'+chars(view.text,view.activeText)+'</div><div class="string-label">模式 PATTERN</div><div class="character-row pattern-row" style="margin-left:'+Math.max(0,Number(view.offset))*33+'px">'+chars(view.pattern,view.activePattern)+'</div>'+(view.pi?aux([{label:'前缀函数 pi',values:view.pi}]):'')+'</div>';}
  function intervals(view){const maximum=Math.max(view.target||0,...view.intervals.map(x=>x[1]),1),minimum=Math.min(0,...view.intervals.map(x=>x[0])),span=maximum-minimum;return '<div class="interval-list">'+view.intervals.map(([left,right],i)=>'<div class="interval-row"><span>['+left+','+right+']</span><div class="interval-track"><div class="interval-bar '+(view.active===i?'active ':'')+(includes(view.selected,i)?'selected':'')+'" style="left:'+((left-minimum)/span*100)+'%;width:'+((right-left)/span*100)+'%">'+i+'</div></div></div>').join('')+'</div>';}
  function numberGrid(view){return '<div class="number-grid">'+view.values.map(x=>'<div class="number-cell '+(includes(view.muted,x)?'muted ':'')+(includes(view.active,x)?'active':'')+'">'+E(x)+'</div>').join('')+'</div>';}
  function staticView(view){switch(view.kind){case 'graph':return graph(view);case 'matrix':case 'grid':case 'queens':return matrix(view);case 'buckets':return buckets(view);case 'strings':return strings(view);case 'intervals':return intervals(view);case 'numbers':return numberGrid(view);default:return '<div class="empty-structure">等待初始化数据</div>';}}
  L.Renderer=class{
    constructor(element){this.element=element;this.kind=null;this.cells=new Map();}
    draw(view){if(view.kind==='array'){this.drawArray(view);}else{this.cells.clear();this.element.innerHTML=staticView(view);this.kind=view.kind;}
      const oldAux=this.element.querySelector('.stage-aux');if(oldAux)oldAux.remove();const below=document.createElement('div');below.className='stage-aux';below.innerHTML=(view.caption?'<p class="stage-caption">'+E(view.caption)+'</p>':'')+aux(view.aux)+(view.table?staticView(view.table):'');this.element.append(below);
    }
    drawArray(view){if(this.kind!=='array'){this.element.innerHTML='<div class="array-stage"></div>';this.cells.clear();this.kind='array';}
      const stage=this.element.querySelector('.array-stage'),values=view.values||[],width=stage.clientWidth,n=values.length,gap=n>9?5:9,cellWidth=Math.max(10,(width-gap*Math.max(0,n-1))/Math.max(n,1)),maximum=Math.max(1,...values.filter(v=>typeof v==='number').map(Math.abs)),counts={},keep=new Set();stage.querySelector('.empty-structure')?.remove();
      if(!n){const empty=document.createElement('div');empty.className='empty-structure';empty.textContent='当前结构为空';stage.append(empty);}
      values.forEach((value,i)=>{const key=typeof value+':'+String(value)+':'+(counts[value]=(counts[value]||0)+1);keep.add(key);let cell=this.cells.get(key);if(!cell){cell=document.createElement('div');cell.className='array-cell';cell.innerHTML='<div class="array-value"></div><span class="array-index"></span>';stage.append(cell);this.cells.set(key,cell);}
        cell.className=['array-cell',includes(view.active,i)?'active':'',includes(view.found,i)?'found':'',includes(view.sorted,i)?'sorted':'',view.range&&(i<view.range[0]||i>view.range[1])?'outside':''].filter(Boolean).join(' ');cell.style.left=(cellWidth+gap)*i+'px';cell.style.width=cellWidth+'px';const valueEl=cell.querySelector('.array-value');valueEl.textContent=value;valueEl.style.height=(typeof value==='number'?(view.compact?22:55)+Math.abs(value)/maximum*(view.compact?48:110):(view.compact?40:54))+'px';cell.querySelector('.array-index').textContent=view.labels?.[i]??i;});
      for(const [key,cell]of this.cells)if(!keep.has(key)){cell.remove();this.cells.delete(key);}
      L.drawPointers(stage,view.pointers||{},{count:view.pointerCount??n,positions:Array.from({length:n},(_,i)=>(cellWidth+gap)*i+cellWidth/2),compact:!!view.compact});
    }
  };
})(AlgoLab);
