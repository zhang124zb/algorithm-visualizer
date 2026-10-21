(function(root){
  'use strict';
  function selectArrays(step,previous,usage=new Map(),pinned=''){
    const arrays=step.variables.filter(v=>Array.isArray(v.value));
    const ranked=arrays.map((item,order)=>{
      const old=previous?.variables.find(v=>v.name===item.name);
      return {item,order,pinned:item.name===pinned,changed:JSON.stringify(old?.value)!==JSON.stringify(item.value),accessed:step.accessed?.includes(item.name)||false,uses:usage.get(item.name)||0};
    });
    ranked.sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(b.changed)-Number(a.changed)||Number(b.accessed)-Number(a.accessed)||b.uses-a.uses||a.order-b.order);
    // Keep declaration order so ranking changes do not reorder the retained cards.
    return ranked.slice(0,3).sort((a,b)=>a.order-b.order);
  }
  root.CppLabScene={selectArrays};
})(typeof self==='undefined'?globalThis:self);
