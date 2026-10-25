(function(L){
  'use strict';
  const $=id=>document.getElementById(id),E=L.escape,languages=LabLanguages;
  const source=$('source'),input=$('stdin'),drafts=new Map(),unsavedDrafts=new Set();
  let language='cpp',examples=languages.cpp.examples;
  const meta=()=>languages[language],storageKey=()=> 'algorithm-classroom-'+language+'-lab-v1';
  const scenes=new Map(),arrayUsage=new Map();
  let exampleId=examples[0].id,trace=null,index=0,worker=null,timeout=null,timer=null,playing=false,saveTimer=null;
  let nativeService=null,nativeRun=null;
  const busy=()=>!!worker||!!nativeRun,nativeMode=()=>language==='cpp'&&$('lab-engine').value==='native';
  function updateEngine(){
    $('lab-engine').disabled=language!=='cpp'||busy();
    $('lab-engine').querySelector('[value="native"]').disabled=!nativeService?.available;
    $('runtime-badge').textContent=meta().name+(nativeMode()?' · Docker 隔离执行':' · 浏览器内执行');
    $('support-note').textContent=nativeMode()?'C++17 · 一次性隔离容器；黄色行即将执行，变量为执行前状态。':meta().support;
    $('native-note').textContent=nativeMode()?'隔离执行：关闭网络，不挂载电脑目录，容器设有资源上限。回退仅还原动画快照。':nativeService?nativeService.message:'需要完整 C++？准备 Docker 隔离环境后运行 npm run lab:local，再打开本机地址。';
  }
  const emptyHTML=$('stage').innerHTML;
  function exampleOptions(){return examples.map(e=>'<option value="'+e.id+'">'+E(e.name)+'</option>').join('')+(language==='cpp'?'<optgroup label="后续开发"><option disabled>reverse · 后续预留</option><option disabled>sort · 后续预留</option><option disabled>priority_queue · 后续预留</option><option disabled>deque · 后续预留</option></optgroup>':'');}
  $('example').innerHTML=exampleOptions();
  function currentExample(){return examples.find(e=>e.id===exampleId)||examples[0];}
  function setMode(edit){
    $('editor-panel').classList.toggle('hidden',!edit);$('replay-panel').classList.toggle('hidden',edit);
    $('edit-tab').setAttribute('aria-selected',String(edit));$('replay-tab').setAttribute('aria-selected',String(!edit));
    $('code-note').textContent=edit?'自由编辑 · Tab 缩进 · Ctrl / ⌘ + Enter 运行':trace?.phase==='before'?'黄色 = 即将执行行 · 变量显示执行前状态':'黄色 = 当前执行行 · 变量、动画与输出同步';
    if(edit)setPlaying(false);
  }
  function updateEditor(){
    const count=source.value.split('\n').length;
    $('editor-lines').textContent=Array.from({length:count},(_,i)=>i+1).join('\n');
    $('editor-lines').scrollTop=source.scrollTop;
    $('source-size').textContent=source.value.length+' / 24000';
    $('random-input').disabled=source.value!==currentExample().code||!currentExample().random;
    $('random-input').title=$('random-input').disabled?'随机数据仅适用于未修改代码的数组、二分和递归示例。':'';
  }
  function saveDraft(){
    clearTimeout(saveTimer);
    const draft={code:source.value,input:input.value,example:exampleId};drafts.set(language,draft);
    try{localStorage.setItem(storageKey(),JSON.stringify(draft));unsavedDrafts.delete(language);$('draft-status').textContent=meta().name+' 草稿已保存在本机';}
    catch{unsavedDrafts.add(language);$('draft-status').textContent='浏览器无法保存草稿，请下载代码留存';}
  }
  function status(text,busy=false){$('lab-status').textContent=text;$('lab-status').classList.toggle('busy',busy);}
  function controls(){
    const has=!!trace?.steps.length,isBusy=busy();
    for(const id of ['play','restart','seek','speed','watch-array','replay-tab'])$(id).disabled=!has||isBusy;
    $('previous').disabled=!has||isBusy||index===0;$('next').disabled=!has||isBusy||index===trace.steps.length-1;
    for(const id of ['source','stdin','example','load-example','run','lab-language'])$(id).disabled=isBusy;
    $('stop').classList.toggle('hidden',!isBusy);$('run').classList.toggle('hidden',isBusy);
    if(isBusy)$('random-input').disabled=true;else updateEditor();updateEngine();
  }
  function setPlaying(value){
    playing=!!value;clearTimeout(timer);timer=null;
    $('play').textContent=value?'暂停':'自动播放';$('play').setAttribute('aria-pressed',String(playing));
    $('play-status').textContent=busy()?'正在生成步骤':!trace?'尚未运行':playing?'正在回放':trace.steps[index]?.finished?'执行完成':trace.steps[index]?.error?'执行中断':'已暂停';
    if(playing)timer=setTimeout(tick,650/Number($('speed').value));
  }
  function tick(){
    if(!playing||!trace)return;
    if(index<trace.steps.length-1){index++;render();}
    if(index===trace.steps.length-1)setPlaying(false);else timer=setTimeout(tick,650/Number($('speed').value));
  }
  function invalidate(){
    setPlaying(false);trace=null;index=0;setMode(true);controls();
    $('error').classList.add('hidden');$('stage').innerHTML=emptyHTML;scenes.clear();$('stage').classList.remove('lab-array-list','lab-array-list-multiple');$('array-summary').textContent='';
    $('variable-grid').textContent='重新运行后显示变量。';$('call-stack').replaceChildren();$('stack-count').textContent='0 层';
    $('stdout').textContent='重新运行后显示输出。';$('exit-code').textContent='跟随当前步骤';$('current-line').textContent=meta().name+' 教学模式';
    $('step-label').textContent='READY';$('step-message').textContent='代码或输入已修改，请重新运行生成动画。';
    $('step-count').textContent='0 / 0';$('seek').value=0;$('seek').max=0;
    status('代码或输入已修改。点击“运行并生成动画”更新结果。');
  }
  function onEdit(){invalidate();updateEditor();$('draft-status').textContent='正在保存草稿…';clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,400);}
  function syntax(line){
    const re=new RegExp((language==='python'?'#.*$':'\\/\\/.*$')+String.raw`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:int|long|double|float|char|bool|boolean|void|const|static|public|private|class|new|import|from|if|elif|else|for|in|while|do|def|return|break|continue|true|false|True|False|None|and|or|not|using|namespace|switch|case|default|sizeof)\b|\b\d+(?:\.\d+)?\b`,'g');
    let html='',last=0;
    for(const match of line.matchAll(re)){
      const token=match[0],type=token.startsWith('//')||token.startsWith('#')?'comment':/^['"]/.test(token)?'string':/^\d/.test(token)?'number':'keyword';
      html+=E(line.slice(last,match.index))+'<span class="syntax-'+type+'">'+E(token)+'</span>';last=match.index+token.length;
    }
    return html+E(line.slice(last));
  }
  function renderStack(step){
    const stack=step.stack||[];$('stack-count').textContent=stack.length+' 层';
    $('call-stack').innerHTML=stack.map((frame,i)=>'<div class="stack-frame">'+(i+1)+'. '+E(frame.name)+'()<small>'+E(frame.variables.filter(v=>!Array.isArray(v.value)).map(v=>v.name+' = '+v.value).join(' · ')||'暂无局部变量')+'</small></div>').join('');
  }
  function drawScene(step){
    const arrays=step.variables.filter(CppLabScene.isVisual);
    const chosen=$('watch-array').value,previous=trace.steps[index-1];
    const selected=CppLabScene.selectArrays(step,previous,arrayUsage,chosen);
    const hidden=arrays.filter(v=>!selected.some(s=>s.item.name===v.name));
    const noun=arrays.some(v=>v.kind)?'数组/容器':'数组';
    $('array-summary').textContent=arrays.length?(hidden.length?'当前 '+arrays.length+' 个'+noun+'，优先展示 3 个；暂时收起：'+hidden.map(v=>v.name).join('、'):'当前 '+arrays.length+' 个'+noun+'，全部显示。'):'当前作用域暂无数组或容器，展示函数调用过程。';
    if(chosen&&!arrays.some(v=>v.name===chosen))$('array-summary').textContent+=' '+chosen+' 在当前作用域尚不可见。';
    if(!selected.length){
      scenes.clear();$('stage').classList.remove('lab-array-list','lab-array-list-multiple');
      const stack=step.stack||[];
      $('stage').innerHTML='<div class="lab-call-visual">'+stack.map((f,i)=>'<div class="lab-call-box">'+(i+1)+'. '+E(f.name)+'()<small>'+E(f.variables.filter(v=>!Array.isArray(v.value)).map(v=>v.name+' = '+v.value).join(' · ')||'等待变量初始化')+'</small></div>').join('')+(stack.length?'':'<p class="stage-caption">当前没有数组或函数局部变量。</p>')+'</div>';
      const box=$('stage').querySelector('.lab-call-visual');box.scrollTop=box.scrollHeight;
      return;
    }
    if(!$('stage').classList.contains('lab-array-list')){$('stage').replaceChildren();$('stage').classList.add('lab-array-list');}
    $('stage').classList.toggle('lab-array-list-multiple',selected.length>1);
    for(const [name,scene]of scenes)if(!selected.some(s=>s.item.name===name)){scene.card.remove();scenes.delete(name);}
    for(const selection of selected){
      const {item}=selection;let scene=scenes.get(item.name);
      if(!scene){
        const card=document.createElement('section');card.className='lab-array-card';card.dataset.array=item.name;card.setAttribute('aria-label',item.name+' 数组动画');
        card.innerHTML='<div class="lab-array-heading"><h3>'+E(item.name)+' <small>'+E(item.type)+'</small></h3><span></span></div><div class="lab-array-canvas"></div>';
        const canvas=card.querySelector('.lab-array-canvas');scene={card,canvas,renderer:new L.Renderer(canvas)};scenes.set(item.name,scene);
      }
      $('stage').append(scene.card);
      scene.card.querySelector('h3').innerHTML=E(item.name)+' <small>'+E(item.type)+'</small>';
      scene.card.querySelector('.lab-array-heading>span').textContent=selection.pinned?'手动保留':selection.changed?'本步变化':selection.accessed?'本行使用':'';
      const previousItem=previous?.variables.find(v=>v.name===item.name),old=previousItem?.value;
      scene.card.dataset.kind=item.kind||'array';
      scene.card.setAttribute('aria-label',item.name+' '+(item.kind||'数组')+' 动画');
      if(CppLabScene.drawContainer(scene.canvas,item,previousItem)){scene.renderer.kind=null;scene.renderer.cells.clear();continue;}
      const changed=(i,j)=>old!==undefined&&JSON.stringify(j===undefined?old[i]:old[i]?.[j])!==JSON.stringify(j===undefined?item.value[i]:item.value[i][j]);
      const matrix=item.value.length>0&&item.value.every(Array.isArray);
      scene.canvas.style.setProperty('--lab-array-width',!matrix&&item.value.length>12?item.value.length*34+'px':'0px');
      const caption=item.name+' · '+item.type+(item.length>item.value.length||item.columns>16?' · 仅展示前 '+(matrix?'16 × 16':'64')+' 项':'');
      if(matrix){
        const active=[];for(let i=0;i<item.value.length;i++)for(let j=0;j<(item.value[i]?.length||0);j++)if(changed(i,j))active.push([i,j]);
        scene.renderer.draw({kind:'matrix',rows:item.value,active,caption});
      }else{
        const active=item.value.map((_,i)=>i).filter(i=>changed(i)),pointers={};
        for(const v of step.variables)if(/^(?:i|j|k|mid|left|right|l|r|low|high|front|rear|top|pos|index)$/.test(v.name)&&Number.isInteger(v.value)&&v.value>=0&&v.value<item.value.length)pointers[v.name]=v.value;
        scene.renderer.draw({kind:'array',values:item.value,active,pointers,compact:selected.length>1,caption:caption+' · 黄色为本步变化'});
      }
    }
  }
  function render(){
    if(!trace?.steps.length)return;
    const step=trace.steps[index];drawScene(step);renderStack(step);
    $('code-note').textContent=step.finished?'执行已完成 · 黄色保留最后执行位置':trace.phase==='before'?'黄色 = 即将执行行 · 变量显示执行前状态':'黄色 = 当前执行行 · 变量、动画与输出同步';
    $('execution-note').textContent=step.finished?'执行已完成，可回退查看各行的变量、画面和输出。':trace.phase==='before'?'黄色行即将执行，变量显示执行前状态；下一步可观察变化。':'黄色行跟随当前执行位置；回退会同步还原变量、画面和输出。';
    $('step-message').textContent=step.message;$('step-label').textContent='STEP '+String(index+1).padStart(2,'0');
    $('step-count').textContent=(index+1)+' / '+trace.steps.length;$('seek').value=index;
    $('current-line').textContent='第 '+step.line+' 行';
    const previous=trace.steps[index-1]?.variables||[];
    $('variable-grid').innerHTML=step.variables.map(v=>{
      const old=previous.find(p=>p.name===v.name),display=typeof v.value==='object'?JSON.stringify(v.value):String(v.value);
      return '<div class="variable'+(CppLabScene.hasChanged(v,old)?' changed':'')+'" title="'+E(v.type+' '+v.name+' = '+display)+'"><span>'+E(v.name)+'</span><b>'+E(display.length>120?display.slice(0,117)+'…':display)+'</b></div>';
    }).join('')||'<span class="panel-meta">当前没有可观察的变量。</span>';
    $('stdout').textContent=step.output||'（当前步骤尚无输出）';
    $('exit-code').textContent=step.finished?'退出码 '+trace.exitCode:step.error?'执行中断':'跟随当前步骤';
    $('code-lines').querySelector('.is-current')?.classList.remove('is-current','lab-error-line');
    const line=$('code-lines').children[step.line-1];
    if(line){line.classList.add('is-current');if(step.error)line.classList.add('lab-error-line');
      const scroll=$('code-scroll');if(line.offsetTop<scroll.scrollTop+12||line.offsetTop+line.offsetHeight>scroll.scrollTop+scroll.clientHeight-12)scroll.scrollTop=Math.max(0,line.offsetTop-scroll.clientHeight*.4);
    }
    controls();
    $('play-status').textContent=playing?'正在回放':step.finished?'执行完成':step.error?'执行中断':'已暂停';
  }
  function showError(error){$('error').textContent=(error.line?'第 '+error.line+' 行：':'')+error.message;$('error').classList.remove('hidden');}
  function endWorker(){
    clearTimeout(timeout);timeout=null;worker?.terminate();worker=null;
    if(nativeRun){const job=nativeRun;nativeRun=null;fetch('/api/native/run/'+job.id,{method:'DELETE',headers:{'X-Algolab-Token':nativeService.token},keepalive:true}).catch(()=>{});job.controller.abort();}
    controls();
  }
  function finish(result){
    endWorker();trace=result;index=0;
    if(result.error)showError(result.error);
    if(result.steps?.length){
      $('code-lines').innerHTML=source.value.replace(/\r\n?/g,'\n').split('\n').map((line,i)=>'<li data-line="'+(i+1)+'">'+syntax(line)+'</li>').join('');
      const arrays=[...new Set(result.steps.flatMap(s=>s.variables.filter(CppLabScene.isVisual).map(v=>v.name)))];
      arrayUsage.clear();for(const step of result.steps)for(const name of step.accessed||[])arrayUsage.set(name,(arrayUsage.get(name)||0)+1);
      $('watch-array').innerHTML='<option value="">自动（最多 3 个）</option>'+arrays.map(name=>'<option value="'+E(name)+'">保留 '+E(name)+'</option>').join('');
      $('seek').max=result.steps.length-1;setMode(false);render();
      status(result.error?'执行中断，已保留 '+result.steps.length+' 步，可回放排查。':'已生成 '+result.steps.length+' 步 · '+result.elapsed+' ms · 点击下一步或自动播放。');
    }else{trace=null;controls();setMode(true);status('执行未完成，请根据提示修改代码或输入。');}
    setPlaying(false);
  }
  function run(){
    if(busy())return;setPlaying(false);saveDraft();
    if(!source.value.trim()){showError({message:'请先输入 '+meta().name+' 代码。'});return;}
    if(location.protocol==='file:'){showError({message:'请通过网站地址打开代码实验室，或在项目中运行 npm run preview 后访问 http://127.0.0.1:4173。浏览器限制直接双击 HTML 创建执行线程。'});return;}
    trace=null;index=0;setMode(true);$('error').classList.add('hidden');
    $('stage').innerHTML=emptyHTML;scenes.clear();$('stage').classList.remove('lab-array-list','lab-array-list-multiple');$('array-summary').textContent='';$('variable-grid').replaceChildren();$('call-stack').replaceChildren();$('stack-count').textContent='0 层';$('stdout').textContent='正在执行…';$('exit-code').textContent='跟随当前步骤';$('step-count').textContent='0 / 0';$('step-message').textContent='正在根据本次代码生成执行步骤。';
    try{
      if(nativeMode()){
        if(!nativeService?.available){finish({steps:[],error:{message:'隔离环境未就绪，本机执行已禁用。请准备 Docker 隔离环境后重试。'}});return;}
        const job={id:crypto.randomUUID(),controller:new AbortController()};nativeRun=job;controls();setPlaying(false);status('正在一次性隔离容器中编译，并通过 GDB 采集运行状态…',true);
        timeout=setTimeout(()=>{if(nativeRun===job)finish({steps:[],error:{message:'本机执行未及时返回，已停止。'}});},90000);
        fetch('/api/native/run',{method:'POST',headers:{'Content-Type':'application/json','X-Algolab-Token':nativeService.token},body:JSON.stringify({code:source.value,input:input.value,id:job.id}),signal:job.controller.signal})
          .then(async response=>{const result=await response.json();if(nativeRun===job){nativeRun=null;finish(result);}})
          .catch(error=>{if(nativeRun===job){nativeRun=null;finish({steps:[],error:{message:'无法连接本机服务，请检查终端并重新启动：'+error.message}});}});
        return;
      }
      worker=new Worker('worker.js');controls();setPlaying(false);status('正在执行 '+meta().name+'，生成动画与变量快照…',true);
      worker.onmessage=event=>finish(event.data);
      worker.onerror=event=>{event.preventDefault();finish({steps:[],error:{message:'执行引擎未能启动或发生异常。请刷新页面重试。'}});};
      timeout=setTimeout(()=>finish({steps:[],error:{message:'执行超过 6 秒，已停止。请检查循环、递归和数据规模。'}}),6000);
      worker.postMessage({code:source.value,input:input.value,language});
    }catch(error){finish({steps:[],error:{message:'无法启动浏览器执行线程：'+error.message}});}
  }
  function loadExample(id,confirmOverwrite=true){
    const example=examples.find(e=>e.id===id);if(!example)return;
    const current=currentExample();
    if(confirmOverwrite&&(source.value!==current.code||input.value!==current.input)&&!window.confirm('载入示例会覆盖当前语言的代码和输入。需要保留时，请先下载代码。继续载入？')){$('example').value=exampleId;return;}
    exampleId=id;source.value=example.code;input.value=example.input;invalidate();updateEditor();saveDraft();
    status('已载入“'+example.name+'”。可以直接运行，也可以修改后运行。');
  }
  $('load-example').addEventListener('click',()=>loadExample($('example').value));
  $('run').addEventListener('click',run);$('stop').addEventListener('click',()=>{endWorker();trace=null;setMode(true);setPlaying(false);controls();$('stdout').textContent='执行已停止。';$('step-message').textContent='执行已停止，可编辑代码后重新运行。';status('已停止执行，可以继续编辑或重新运行。');});
  source.addEventListener('input',onEdit);input.addEventListener('input',onEdit);
  source.addEventListener('scroll',()=>{$('editor-lines').scrollTop=source.scrollTop;});
  source.addEventListener('keydown',event=>{
    if(event.key==='Tab'){event.preventDefault();if(source.value.length-(source.selectionEnd-source.selectionStart)+4>24000)return;source.setRangeText('    ',source.selectionStart,source.selectionEnd,'end');onEdit();}
  });
  $('edit-tab').addEventListener('click',()=>setMode(true));$('replay-tab').addEventListener('click',()=>{setMode(false);render();});
  $('play').addEventListener('click',()=>{if(!trace)return;setMode(false);if(index===trace.steps.length-1){index=0;render();}setPlaying(!playing);});
  function move(to){if(!trace)return;setPlaying(false);index=Math.max(0,Math.min(trace.steps.length-1,to));setMode(false);render();}
  $('previous').addEventListener('click',()=>move(index-1));$('next').addEventListener('click',()=>move(index+1));$('restart').addEventListener('click',()=>move(0));$('seek').addEventListener('input',()=>move(Number($('seek').value)));
  $('speed').addEventListener('change',()=>{if(playing)setPlaying(true);});$('watch-array').addEventListener('change',render);
  $('random-input').addEventListener('click',()=>{
    if($('random-input').disabled)return;
    const example=currentExample();
    if(example.random==='recursion')input.value=String(3+Math.floor(Math.random()*5));
    else{let values=Array.from({length:8},()=>1+Math.floor(Math.random()*59));
      if(example.random==='sorted'){values.sort((a,b)=>a-b);input.value='8 '+values[Math.floor(Math.random()*8)]+'\n'+values.join(' ');}
      else input.value='8\n'+values.join(' ');
    }
    onEdit();
  });
  $('download-code').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([source.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=meta().file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run();return;}
    if(event.ctrlKey||event.metaKey||event.altKey||/INPUT|TEXTAREA|SELECT|BUTTON/.test(event.target.tagName))return;
    if(event.code==='Space'){event.preventDefault();if(!$('play').disabled)$('play').click();}
    else if(event.code==='ArrowLeft'){event.preventDefault();move(index-1);}else if(event.code==='ArrowRight'){event.preventDefault();move(index+1);}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
  window.addEventListener('resize',()=>{if(trace)drawScene(trace.steps[index]);});
  window.addEventListener('pagehide',()=>{saveDraft();clearTimeout(timer);endWorker();});
  function restoreLanguage(next){
    language=next;examples=meta().examples;exampleId=examples[0].id;
    $('example').innerHTML=exampleOptions();
    source.value=examples[0].code;input.value=examples[0].input;
    let saved=drafts.get(language);if(!saved)try{saved=JSON.parse(localStorage.getItem(storageKey()));}catch{}
    let restored=false;
    if(saved&&typeof saved.code==='string'&&saved.code.length<=24000&&typeof saved.input==='string'&&saved.input.length<=16000){source.value=saved.code;input.value=saved.input;if(examples.some(e=>e.id===saved.example))exampleId=saved.example;restored=true;}
    $('lab-language').value=language;$('example').value=exampleId;$('example').setAttribute('aria-label','选择 '+meta().name+' 示例');
    $('code-file').textContent=meta().file+' · '+meta().name;$('source-label').textContent=meta().name+' 源代码';
    $('code-editor-panel').setAttribute('aria-label',meta().name+' 代码编辑与回放');
    $('support-note').textContent=meta().support;$('runtime-badge').textContent=meta().name+' · 浏览器内执行';
    $('input-label').textContent='标准输入 · '+meta().input;$('output-label').textContent='标准输出 · '+meta().output;
    $('download-code').textContent='下载 '+meta().extension;
    invalidate();updateEditor();controls();$('draft-status').textContent=unsavedDrafts.has(language)?'此语言草稿仅保留在本次页面，请下载代码留存':restored?'已恢复 '+meta().name+' 草稿':meta().name+' 草稿自动保存在本机';
    status('当前语言：'+meta().name+(language==='cpp'?'（默认主要语言）':'')+'。载入示例或编辑后运行。');
  }
  $('lab-language').addEventListener('change',()=>{const next=$('lab-language').value;if(!Object.hasOwn(languages,next)||busy())return;if(next!=='cpp')$('lab-engine').value='browser';saveDraft();restoreLanguage(next);});
  $('lab-engine').addEventListener('change',()=>{invalidate();updateEngine();});
  restoreLanguage('cpp');
  if(location.protocol==='http:'&&location.hostname==='127.0.0.1')fetch('/api/native/health').then(r=>r.ok?r.json():null).then(result=>{nativeService=result;updateEngine();}).catch(()=>{});
})(AlgoLab);
