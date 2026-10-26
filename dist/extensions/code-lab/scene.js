(function(root){
  'use strict';
  const kinds=new Set(['vector','string','queue','stack','pair','set','map','unordered_set','unordered_map']);
  const isVisual=item=>Array.isArray(item.value)||kinds.has(item.kind);
  const signature=item=>JSON.stringify([item?.value,item?.length,item?.capacity,item?.bucketCount,item?.loadFactor,item?.maxLoadFactor]);
  const hasChanged=(item,old)=>signature(item)!==signature(old);
  const indexNames=/^(?:i|j|k|mid|left|right|l|r|low|high|lo|hi|front|rear|head|tail|top|pos|index)$/;
  function indexPointers(variables){
    const pointers={};
    for(const variable of variables||[])if(indexNames.test(variable.name)&&Number.isInteger(variable.value))pointers[variable.name]=variable.value;
    return pointers;
  }
  function selectArrays(step,previous,usage=new Map(),pinned=''){
    const arrays=step.variables.filter(isVisual);
    const ranked=arrays.map((item,order)=>{
      const old=previous?.variables.find(v=>v.name===item.name);
      return {item,order,pinned:item.name===pinned,changed:hasChanged(item,old),accessed:step.accessed?.includes(item.name)||false,uses:usage.get(item.name)||0};
    });
    ranked.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(b.changed)-Number(a.changed)||Number(b.accessed)-Number(a.accessed)||b.uses-a.uses||a.order-b.order);
    // Keep declaration order so ranking changes do not reorder the retained cards.
    return ranked.slice(0,3).sort((a,b)=>a.order-b.order);
  }
  function drawContainer(canvas,item,old,options={}){
    if(!kinds.has(item.kind))return false;
    const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const format=value=>typeof value==='object'?JSON.stringify(value):String(value??'');
    const values=item.kind==='string'?[...item.value]:item.value;
    const count=Number.isInteger(item.length)?item.length:values.length;
    const indexed=['vector','string','queue','stack'].includes(item.kind);
    const retained=indexed?canvas.querySelector('.lab-stl-items.lab-stl-'+item.kind):null;
    const before=item.kind==='string'?[...(old?.value||'')]:old?.value||[];
    const changed=i=>JSON.stringify(values[i])!==JSON.stringify(before[i]);
    const captions={vector:'vector · 按下标访问',string:'string · 字符与下标',queue:'queue · 队首出队，队尾入队',stack:'stack · 栈顶入栈与出栈',pair:'pair · first / second',set:'set · 按值有序的逻辑内容',map:'map · 按键有序的逻辑内容',unordered_set:'unordered_set · 逻辑内容，不代表遍历顺序或桶布局',unordered_map:'unordered_map · 逻辑内容，不代表遍历顺序或桶布局'};
    let content;
    if(['map','unordered_map'].includes(item.kind)){
      content='<table class="lab-stl-map"><thead><tr><th>key</th><th>value</th></tr></thead><tbody>'+values.map((entry,i)=>'<tr class="'+(changed(i)?'is-changed':'')+'"><td>'+E(format(entry.key))+'</td><td>'+E(format(entry.value))+'</td></tr>').join('')+'</tbody></table>';
    }else{
      content='<div class="lab-stl-items lab-stl-'+item.kind+'">'+values.map((value,i)=>{
        const label=item.kind==='pair'?['first','second'][i]:['set','unordered_set'].includes(item.kind)?'key':item.kind==='stack'?(i===count-1?'top':''):item.kind==='queue'?[i===0?'front':'',i===count-1?'back':''].filter(Boolean).join(' / '):i;
        return '<div class="lab-stl-cell '+(changed(i)?'is-changed':'')+'"><b>'+E(format(value))+'</b><small>'+E(label)+'</small></div>';
      }).join('')+'</div>';
    }
    const metric=(key,label,value)=>'<span data-metric="'+key+'" class="'+(old?.[key]!==item[key]?'is-changed':'')+'">'+E(label)+' = '+E(value)+'</span>';
    let metrics='';
    if(Number.isFinite(item.capacity))metrics=metric('length','size',item.length)+metric('capacity','capacity',item.capacity)+'<span>空余容量 = '+E(item.capacity-item.length)+'</span>';
    else if(Number.isFinite(item.bucketCount))metrics=metric('length','size',item.length)+metric('bucketCount','bucket_count',item.bucketCount)+metric('loadFactor','load_factor',Number(item.loadFactor.toPrecision(4)))+metric('maxLoadFactor','max_load_factor',Number(item.maxLoadFactor.toPrecision(4)));
    canvas.style.setProperty('--lab-array-width','0px');
    if(indexed&&!values.length)content='<div class="lab-stl-items lab-stl-'+item.kind+'"><p class="lab-stl-empty">当前容器为空</p></div>';
    canvas.innerHTML=(metrics?'<div class="lab-stl-metrics">'+metrics+'</div>':'')+'<div class="lab-stl-view">'+(values.length||indexed?content:'<p class="lab-stl-empty">当前容器为空</p>')+'</div><p class="stage-caption">'+E(captions[item.kind])+(item.kind==='pair'?' · 两个字段':' · size = '+E(item.length??values.length))+(item.length>values.length?' · 仅展示前 '+values.length+' 项':'')+' · 黄色为本步变化'+(metrics?'<br>容量与桶数使用教学模型，实际编译器的分配策略可能不同。':'')+'</p>';
    if(indexed){
      let host=canvas.querySelector('.lab-stl-items');
      if(retained){
        // Keep the overlay host across replay steps so variable-name arrows can move in place.
        const beforeCells=[...retained.querySelectorAll('.lab-stl-cell')],nextCells=[...host.querySelectorAll('.lab-stl-cell')];
        nextCells.forEach((cell,i)=>{if(beforeCells[i]){beforeCells[i].className=cell.className;beforeCells[i].innerHTML=cell.innerHTML;}else retained.append(cell);});
        beforeCells.slice(nextCells.length).forEach(cell=>cell.remove());
        retained.querySelector('.lab-stl-empty')?.remove();
        if(!values.length)retained.append(host.querySelector('.lab-stl-empty'));
        host.replaceWith(retained);host=retained;
      }
      const pointers=item.kind==='stack'?(count?{top:count-1}:{}):item.kind==='queue'?(count?{front:0,back:count-1}:{}):options.pointers||{};
      const bounds=host.getBoundingClientRect(),positions=[...host.querySelectorAll('.lab-stl-cell')].map(cell=>{const rect=(item.kind==='stack'?cell.querySelector('b'):cell).getBoundingClientRect();return item.kind==='stack'?{x:rect.right-bounds.left,y:rect.top-bounds.top+rect.height/2,side:'right'}:rect.left-bounds.left+rect.width/2;});
      root.AlgoLab?.drawPointers?.(host,pointers,{count,positions,compact:!!options.compact});
    }
    return true;
  }
  root.CppLabScene={selectArrays,isVisual,hasChanged,indexPointers,drawContainer};
})(typeof self==='undefined'?globalThis:self);
