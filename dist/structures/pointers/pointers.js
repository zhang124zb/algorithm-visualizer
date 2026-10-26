(function(){
  'use strict';
  const course=window.PointerCourse,$=id=>document.getElementById(id);
  const ids=['pointer-levels','pointer-lessons','pointer-lesson-title','pointer-goal','pointer-explanation','pointer-code','pointer-memory','pointer-message','pointer-step-count','pointer-seek','pointer-previous','pointer-next','pointer-restart','pointer-play','pointer-speed','pointer-pitfall','pointer-question','pointer-options','pointer-feedback','pointer-related','pointer-sources'];
  if(!course?.lessons?.length||ids.some(id=>!$(id))){if($('pointer-message'))$('pointer-message').textContent='指针课堂尚未就绪，请刷新页面重试。';return;}
  const lessons=course.lessons,defaults=[{id:'beginner',title:'入门',description:'地址、取址与解引用'},{id:'basic',title:'基础',description:'指针移动与参数传递'},{id:'advanced',title:'进阶',description:'生命周期与安全边界'}];
  const levels=defaults.map(level=>{const provided=Array.isArray(course.levels)?course.levels.find(item=>item.id===level.id):course.levels?.[level.id];return {...level,...(provided&&typeof provided==='object'?provided:{}),title:provided?.title||provided?.label||provided?.name||level.title};});
  let lesson=lessons[0],index=0,playing=false,timer=null,layoutFrame=null;
  const memory=$('pointer-memory'),code=$('pointer-code'),cellElements=new Map(),SVG='http://www.w3.org/2000/svg';
  const statuses={live:'有效对象',freed:'已释放 · 不可读取',ended:'生命周期已结束',boundary:'尾后边界 · 不可解引用',dangling:'悬垂指针 · 不可解引用'};
  const colors=['#80bbf2','#c5a9ff','#80d6bc','#f2cd80'];
  const node=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
  const format=value=>value===undefined?'未初始化':value===null?'nullptr':typeof value==='object'?JSON.stringify(value):String(value);
  const address=value=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?'0x'+value.toString(16).toUpperCase():value===undefined?'—':format(value);
  const isNull=value=>value===null||value===0||/^(?:nullptr|NULL|0|0x0+)$/i.test(String(value??'').trim());
  const current=()=>lesson.steps[index];
  const outputs=node('div','pointer-output');outputs.append(node('span','','当前输出'),node('pre'));
  const blocked=node('p','pointer-blocked');blocked.setAttribute('role','status');
  $('pointer-message').after(blocked,outputs);
  memory.setAttribute('aria-label','地址与指向关系示意');
  $('pointer-levels').setAttribute('role','tablist');$('pointer-levels').setAttribute('aria-label','选择指针学习层级');
  $('pointer-lessons').setAttribute('role','tabpanel');$('pointer-options').setAttribute('role','group');$('pointer-options').setAttribute('aria-labelledby','pointer-question');
  $('pointer-feedback').setAttribute('role','status');$('pointer-seek').setAttribute('aria-label','选择执行步骤');
  function button(text,className){const element=node('button',className,text);element.type='button';return element;}
  function speed(){const value=Number($('pointer-speed').value);return Number.isFinite(value)?Math.max(.5,Math.min(2,value)):1;}
  function pause(){playing=false;clearTimeout(timer);timer=null;$('pointer-play').textContent='自动播放';$('pointer-play').setAttribute('aria-pressed','false');}
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(!playing)return;if(index<lesson.steps.length-1){index++;renderStep();}if(index>=lesson.steps.length-1||current().blocked)pause();else schedule();},1100/speed());}
  function play(){if(playing){pause();return;}if(index===lesson.steps.length-1||current().blocked){index=0;renderStep();}playing=true;$('pointer-play').textContent='暂停';$('pointer-play').setAttribute('aria-pressed','true');schedule();}
  function move(to){pause();index=Math.max(0,Math.min(lesson.steps.length-1,Math.trunc(to)||0));renderStep();}
  function linkedCell(cell,old,hasPrevious,target){
    const pointer=cell.kind==='pointer',owner=pointer&&/\bunique_ptr\s*</.test(cell.type||''),status=cell.status||'live';
    const changed=hasPrevious&&(!old||JSON.stringify([cell.value,cell.address,cell.status])!==JSON.stringify([old.value,old.address,old.status]));
    const card=node('article','pointer-cell is-'+status+(changed?' is-changed':''));card.dataset.cell=cell.id;card.dataset.kind=cell.kind||'value';card.dataset.status=status;
    const heading=node('div','pointer-cell-heading');heading.append(node('strong','',cell.label||cell.id),node('span','pointer-cell-kind',owner?'所有者对象':pointer?'指针':cell.kind==='boundary'?'边界':'对象'));card.append(heading,node('code','pointer-cell-type',cell.type||''));
    const details=node('dl','pointer-cell-details'),storage=node('div');storage.append(node('dt','',pointer?'自身存储地址':'对象地址'),node('dd','pointer-storage-address',address(cell.address)));details.append(storage);
    const saved=node('div','pointer-cell-current'+(pointer&&changed?' is-target-changed':''));
    saved.append(node('dt','',owner?'管理的目标地址':pointer?'保存的目标地址':['freed','ended'].includes(status)?'最后记录值（不可读取）':cell.kind==='boundary'?'边界说明':'当前值'));
    const value=node('dd','pointer-cell-value');
    if(Array.isArray(cell.value)){
      value.classList.add('pointer-cell-values');cell.value.forEach((item,i)=>{const chip=node('code','pointer-value-chip',format(item));if(hasPrevious&&JSON.stringify(old?.value?.[i])!==JSON.stringify(item))chip.classList.add('is-changed');value.append(chip);});
      if(!cell.value.length)value.textContent='[]';
    }else value.textContent=pointer?address(cell.value):format(cell.value);
    let stateText=statuses[status]||status;
    if(pointer&&status==='live')stateText=isNull(cell.value)?owner?'空所有者 · 没有目标':'空指针 · 没有目标':target?.kind==='boundary'||target?.status==='boundary'?'保存尾后位置 · 不可解引用':owner?'所有者对象有效 · 管理目标见连线':'指针变量有效 · 目标见连线';
    saved.append(value);details.append(saved);card.append(details,node('p','pointer-cell-status',stateText));
    return card;
  }
  function drawMemory(step,previous){
    cellElements.clear();
    const board=node('div','pointer-memory-board'),pointerLane=node('div','pointer-memory-lane pointer-object-lane'),valueLane=node('div','pointer-memory-lane pointer-value-lane');
    const cells=step.cells||[],pointerCells=cells.filter(cell=>cell.kind==='pointer'),valueCells=cells.filter(cell=>cell.kind!=='pointer');
    function lane(container,items,title){container.append(node('h4','pointer-lane-title',title));for(const cell of items){const old=previous?.cells?.find(item=>item.id===cell.id),to=step.links?.find(link=>link.from===cell.id)?.to,target=cells.find(item=>item.id===to),card=linkedCell(cell,old,!!previous,target);container.append(card);cellElements.set(cell.id,card);}if(!items.length)container.append(node('p','pointer-lane-empty',title==='指针对象'?'当前没有指针对象':'当前没有可指向的对象'));}
    lane(pointerLane,pointerCells,'指针对象');lane(valueLane,valueCells,'目标对象与边界');board.append(pointerLane,valueLane);
    const svg=document.createElementNS(SVG,'svg');svg.classList.add('pointer-memory-lines');svg.setAttribute('aria-label','根据保存的目标地址绘制指向关系');svg.setAttribute('role','img');
    memory.replaceChildren(board,svg,node('p','pointer-memory-note','地址为固定教学示意，不等于真实内存。此处展示预设步骤，不会执行任意 C++ 代码。'));
    layoutLinks();
  }
  function svgNode(tag,attributes){const element=document.createElementNS(SVG,tag);for(const [key,value]of Object.entries(attributes))element.setAttribute(key,String(value));return element;}
  function layoutLinks(){
    const svg=memory.querySelector('.pointer-memory-lines');if(!svg)return;
    const step=current(),cells=new Map((step.cells||[]).map(cell=>[cell.id,cell])),bounds=memory.getBoundingClientRect(),width=memory.clientWidth,height=memory.scrollHeight;
    svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('width',width);svg.setAttribute('height',height);svg.replaceChildren();
    const defs=svgNode('defs',{});svg.append(defs);const descriptions=[];
    for(const [i,link]of (step.links||[]).entries()){
      const source=cells.get(link.from),target=cells.get(link.to),from=cellElements.get(link.from),to=cellElements.get(link.to);
      if(!source||source.kind!=='pointer'||isNull(source.value)||!target||!from||!to)continue;
      const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),ay=a.top-bounds.top+a.height/2,by=b.top-bounds.top+b.height/2;
      const danger=source.status==='dangling'||['freed','ended'].includes(target.status),boundary=target.kind==='boundary'||target.status==='boundary';
      const color=danger?'#ff989c':colors[i%colors.length],markerId='pointer-course-tip-'+i;
      const marker=svgNode('marker',{id:markerId,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto'});marker.append(svgNode('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));defs.append(marker);
      let d;
      if(b.left-a.right>24){const ax=a.right-bounds.left+2,bx=b.left-bounds.left-5,bend=(ax+bx)/2+(i%3-1)*8;d='M '+ax+' '+ay+' C '+bend+' '+ay+', '+bend+' '+by+', '+bx+' '+by;}
      else{const ax=a.right-bounds.left+2,bx=b.right-bounds.left+5,gutter=Math.max(ax,bx)+18+(i%4)*9;if(from===to)d='M '+ax+' '+(ay-10)+' C '+gutter+' '+(ay-40)+', '+gutter+' '+(ay+40)+', '+bx+' '+(by+10);else d='M '+ax+' '+ay+' C '+gutter+' '+ay+', '+gutter+' '+by+', '+bx+' '+by;}
      const path=svgNode('path',{d,fill:'none',stroke:color,'stroke-width':2.2,'marker-end':'url(#'+markerId+')'});path.classList.add('pointer-memory-link');if(danger)path.classList.add('is-danger');if(boundary)path.classList.add('is-boundary');path.dataset.from=link.from;path.dataset.to=link.to;
      path.append(svgNode('title',{}));path.firstChild.textContent=(source.label||source.id)+' → '+(target.label||target.id)+(danger?'（目标已失效）':boundary?'（不可解引用的边界）':'');svg.append(path);descriptions.push(path.firstChild.textContent);
    }
    svg.setAttribute('aria-label',descriptions.length?descriptions.join('；'):'当前没有有效的指向连线；空指针不连接对象。');
  }
  function renderStep(){
    const step=current(),previous=lesson.steps[index-1];
    drawMemory(step,previous);$('pointer-message').textContent=step.message||'';$('pointer-message').setAttribute('aria-live','polite');
    blocked.hidden=!step.blocked;blocked.textContent=step.blocked?(typeof step.blocked==='string'?step.blocked:'已阻止无效操作：这里只说明风险，不会读取失效或越界内存。'):'';
    const result=step.outputs||[];outputs.hidden=!result.length;outputs.querySelector('pre').textContent=result.map(format).join('\n');
    for(const row of code.children){const active=Number(row.dataset.line)===step.line;row.classList.toggle('is-current',active);row.classList.toggle('is-blocked',active&&!!step.blocked);if(active)row.setAttribute('aria-current','step');else row.removeAttribute('aria-current');}
    const selected=code.querySelector('.is-current'),scroller=code.scrollHeight>code.clientHeight?code:code.closest('.pointer-code-scroll')||code.parentElement;
    if(selected&&scroller.scrollHeight>scroller.clientHeight){const a=selected.getBoundingClientRect(),b=scroller.getBoundingClientRect();if(a.top<b.top+12||a.bottom>b.bottom-12)scroller.scrollTop+=a.top-b.top-scroller.clientHeight*.35;}
    $('pointer-step-count').textContent=(index+1)+' / '+lesson.steps.length;$('pointer-seek').max=lesson.steps.length-1;$('pointer-seek').value=index;$('pointer-seek').setAttribute('aria-valuetext','第 '+(index+1)+' 步，共 '+lesson.steps.length+' 步');
    $('pointer-previous').disabled=index===0;$('pointer-next').disabled=index===lesson.steps.length-1;$('pointer-restart').disabled=index===0&&!playing;$('pointer-play').disabled=lesson.steps.length<2;$('pointer-seek').disabled=lesson.steps.length<2;
  }
  function renderLevels(){
    $('pointer-levels').replaceChildren(...levels.map(level=>{const tab=button('','pointer-level');tab.id='pointer-level-'+level.id;tab.dataset.level=level.id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','pointer-lessons');tab.setAttribute('aria-selected',String(level.id===lesson.level));tab.tabIndex=level.id===lesson.level?0:-1;tab.append(node('strong','',level.title),node('span','',level.description),node('small','',lessons.filter(item=>item.level===level.id).length+' 节课程'));tab.addEventListener('click',()=>selectLevel(level.id));return tab;}));
    $('pointer-lessons').setAttribute('aria-labelledby','pointer-level-'+lesson.level);
  }
  function renderLessonList(){
    $('pointer-lessons').replaceChildren(...lessons.filter(item=>item.level===lesson.level).map((item,i)=>{const option=button('','pointer-lesson');option.dataset.lesson=item.id;option.setAttribute('aria-pressed',String(item.id===lesson.id));option.append(node('span','pointer-lesson-number',String(i+1).padStart(2,'0')),node('span','pointer-lesson-name',item.title));option.addEventListener('click',()=>selectLesson(item.id));return option;}));
  }
  function renderPractice(){
    const practice=lesson.practice;$('pointer-question').textContent=practice?.question||'';$('pointer-feedback').textContent='';$('pointer-feedback').className='pointer-feedback';$('pointer-options').replaceChildren();
    for(const [i,text]of (practice?.options||[]).entries()){const option=button(String.fromCharCode(65+i)+'. '+text,'pointer-option');option.dataset.option=i;option.setAttribute('aria-pressed','false');option.addEventListener('click',()=>{for(const other of $('pointer-options').children){const selected=other===option;other.setAttribute('aria-pressed',String(selected));other.classList.toggle('is-correct',selected&&i===practice.answer);other.classList.toggle('is-incorrect',selected&&i!==practice.answer);}const correct=i===practice.answer;$('pointer-feedback').className='pointer-feedback '+(correct?'is-correct':'is-incorrect');$('pointer-feedback').textContent=(correct?'回答正确。':'再检查一下。')+(practice.explanation||'');});$('pointer-options').append(option);}
  }
  function safeUrl(value,relative=false){try{const url=new URL(value,relative?new URL('../../',location.href):location.href);return ['http:','https:'].includes(url.protocol)||relative&&url.protocol==='file:'?url:null;}catch{return null;}}
  function renderLinks(){
    $('pointer-related').replaceChildren();for(const entry of lesson.related||[]){const url=safeUrl(entry.path,true);if(!url)continue;const link=node('a','',entry.title+' ↗');link.href=url.href;link.target='_blank';link.rel='noopener';$('pointer-related').append(link);}if(!$('pointer-related').children.length)$('pointer-related').append(node('span','pointer-no-links','本课直接围绕地址示意练习。'));
    $('pointer-sources').replaceChildren();for(const [i,value]of (lesson.sources||[]).entries()){const url=safeUrl(value);if(!url)continue;const link=node('a','','参考资料 '+(i+1)+' · '+url.hostname);link.href=url.href;link.target='_blank';link.rel='noopener';$('pointer-sources').append(link);}
  }
  function selectLesson(id,writeHash=true){
    const selected=lessons.find(item=>item.id===id&&item.steps?.length);if(!selected)return;
    const focus=document.activeElement,restoreLevel=focus?.hasAttribute('data-level'),restoreLesson=focus?.hasAttribute('data-lesson');
    pause();lesson=selected;index=0;renderLevels();renderLessonList();$('pointer-lesson-title').textContent=lesson.title;$('pointer-goal').textContent=lesson.goal||'';
    $('pointer-explanation').replaceChildren(...(lesson.explanation||[]).map(text=>node('p','',text)));$('pointer-pitfall').textContent=lesson.pitfall||'';
    code.replaceChildren(...String(lesson.code||'').split('\n').map((line,i)=>{const row=node('li','',line||' ');row.dataset.line=i+1;return row;}));
    renderPractice();renderLinks();renderStep();if(restoreLevel)$('pointer-level-'+lesson.level)?.focus();else if(restoreLesson)[...$('pointer-lessons').children].find(button=>button.dataset.lesson===lesson.id)?.focus();if(writeHash&&location.hash!=='#lesson='+encodeURIComponent(lesson.id))history.replaceState(null,'','#lesson='+encodeURIComponent(lesson.id));
  }
  function selectLevel(id){const first=lessons.find(item=>item.level===id);if(first)selectLesson(first.id);}
  function fromHash(){return new URLSearchParams(location.hash.slice(1)).get('lesson');}
  $('pointer-levels').addEventListener('keydown',event=>{const position=levels.findIndex(level=>level.id===lesson.level);let next;if(event.key==='ArrowRight')next=(position+1)%levels.length;else if(event.key==='ArrowLeft')next=(position+levels.length-1)%levels.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=levels.length-1;else return;event.preventDefault();selectLevel(levels[next].id);$('pointer-level-'+levels[next].id)?.focus();});
  $('pointer-previous').addEventListener('click',()=>move(index-1));$('pointer-next').addEventListener('click',()=>move(index+1));$('pointer-restart').addEventListener('click',()=>move(0));$('pointer-play').addEventListener('click',play);$('pointer-seek').addEventListener('input',()=>move(Number($('pointer-seek').value)));$('pointer-speed').addEventListener('change',()=>{if(playing)schedule();});
  document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||/^(?:INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(event.target.tagName))return;if(event.code==='Space'){event.preventDefault();play();}else if(event.key==='ArrowLeft'){event.preventDefault();move(index-1);}else if(event.key==='ArrowRight'){event.preventDefault();move(index+1);}});
  window.addEventListener('resize',()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(layoutLinks);});
  window.addEventListener('hashchange',()=>{const id=fromHash();if(id&&id!==lesson.id)selectLesson(id,false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',()=>{pause();cancelAnimationFrame(layoutFrame);});
  selectLesson(lessons.some(item=>item.id===fromHash())?fromHash():lessons[0].id);
})();
