(function(L){
  'use strict';
  const input=document.getElementById('competition-search'),groups=document.getElementById('competition-groups'),results=document.getElementById('competition-results'),count=document.getElementById('competition-count'),E=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  input.addEventListener('input',()=>{
    const query=input.value.trim().toLowerCase();groups.classList.toggle('hidden',!!query);results.classList.toggle('hidden',!query);
    if(!query){results.replaceChildren();count.textContent='';return;}
    const matches=L.competitionItems.filter(x=>(x.title+' '+x.id+' '+x.groupTitle+' '+x.description).toLowerCase().includes(query));
    count.textContent=matches.length+' 个匹配专题';
    results.innerHTML=matches.length?matches.map(x=>'<a class="result-row" href="'+E(x.path.replace('extensions/competition/',''))+'" target="_blank" rel="noopener"><b>'+E(x.title)+' ↗</b><small>'+E(x.groupTitle)+' · '+E(x.description)+'</small></a>').join(''):'<p class="empty-search">没有找到对应专题，可以尝试“二分”“背包”或“BFS”。</p>';
  });
})(AlgoLab);
