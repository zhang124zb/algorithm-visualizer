(function(L){
  'use strict';
  L.escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const E=L.escape;
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
      const stage=this.element.querySelector('.array-stage'),values=view.values||[],width=stage.clientWidth,n=values.length,gap=n>9?5:9,cellWidth=Math.max(10,(width-gap*Math.max(0,n-1))/Math.max(n,1)),maximum=Math.max(1,...values.filter(v=>typeof v==='number').map(Math.abs)),counts={},keep=new Set();stage.querySelector('.empty-structure')?.remove();stage.querySelector('.past-pointer')?.remove();
      if(!n){const empty=document.createElement('div');empty.className='empty-structure';empty.textContent='当前结构为空';stage.append(empty);}
      values.forEach((value,i)=>{const key=typeof value+':'+String(value)+':'+(counts[value]=(counts[value]||0)+1);keep.add(key);let cell=this.cells.get(key);if(!cell){cell=document.createElement('div');cell.className='array-cell';cell.innerHTML='<div class="array-value"></div><span class="array-index"></span><span class="pointer-label"></span>';stage.append(cell);this.cells.set(key,cell);}
        cell.className=['array-cell',includes(view.active,i)?'active':'',includes(view.found,i)?'found':'',includes(view.sorted,i)?'sorted':'',view.range&&(i<view.range[0]||i>view.range[1])?'outside':''].filter(Boolean).join(' ');cell.style.left=(cellWidth+gap)*i+'px';cell.style.width=cellWidth+'px';const valueEl=cell.querySelector('.array-value');valueEl.textContent=value;valueEl.style.height=(typeof value==='number'?(view.compact?22:55)+Math.abs(value)/maximum*(view.compact?48:110):(view.compact?40:54))+'px';cell.querySelector('.array-index').textContent=view.labels?.[i]??i;cell.querySelector('.pointer-label').textContent=Object.entries(view.pointers||{}).filter(([,index])=>index===i).map(([name])=>name).join(' / ');});
      for(const [key,cell]of this.cells)if(!keep.has(key)){cell.remove();this.cells.delete(key);}
      const past=Object.entries(view.pointers||{}).filter(([,index])=>index<0||index>=n);if(past.length){const node=document.createElement('span');node.className='past-pointer';node.textContent=past.map(([key,value])=>key+' = '+value).join(' · ');stage.append(node);}
    }
  };
})(AlgoLab);
