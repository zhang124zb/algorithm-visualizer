(function(L){
  'use strict';
  const id=document.body.dataset.algorithm,item=L.item(id),build=L.builders[id],E=L.escape;
  const ui={stage:document.getElementById('stage'),code:document.getElementById('code-lines'),scroll:document.getElementById('code-scroll'),vars:document.getElementById('variable-grid'),message:document.getElementById('step-message'),label:document.getElementById('step-label'),count:document.getElementById('step-count'),status:document.getElementById('play-status'),line:document.getElementById('current-line'),play:document.getElementById('play'),previous:document.getElementById('previous'),next:document.getElementById('next'),restart:document.getElementById('restart'),random:document.getElementById('randomize'),seek:document.getElementById('seek'),speed:document.getElementById('speed'),input:document.getElementById('input-data'),result:document.getElementById('result-data'),language:document.getElementById('code-language'),description:document.getElementById('code-description')};
  const descriptions={cpp:'C++ 函数片段 · 省略通用头文件与主函数',python:'Python 函数片段 · 含必要导入',java:'Java 类内片段 · 省略 java.util 导入与外层类'};
  let language='cpp';
  try{const saved=localStorage.getItem('algorithm-classroom-language');if(['cpp','python','java'].includes(saved))language=saved;}catch{}
  ui.language.value=language;
  let trace,version,index=0,timer=null,playing=false,previousVars={};
  const renderer=new L.Renderer(ui.stage);
  const display=value=>typeof value==='object'?JSON.stringify(value):String(value);
  function syntax(line){
    const comment=language==='python'?'#.*$':'\\/\\/.*$';
    const re=new RegExp(comment+String.raw`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:int|long|bool|boolean|void|const|final|static|public|private|class|if|elif|else|for|while|return|break|continue|true|false|null|nullptr|auto|struct|new|delete|string|String|vector|pair|queue|deque|map|priority_queue|greater|def|in|is|not|and|or|None|True|False|import|from|global|del|lambda)\b|\b\d+\b`,'g');
    let result='',start=0;
    for(const match of line.matchAll(re)){
      result+=E(line.slice(start,match.index));const token=match[0];
      const type=token.startsWith('//')||token.startsWith('#')?'comment':token.startsWith('"')||token.startsWith("'")?'string':/^\d/.test(token)?'number':'keyword';
      result+='<span class="syntax-'+type+'">'+E(token)+'</span>';start=match.index+token.length;
    }
    return result+E(line.slice(start));
  }
  function setCode(){
    version=L.getCode(id,trace,language);
    for(const step of trace.steps)if(!version.labels[step.label])throw new Error(language+' 缺少代码步骤：'+step.label);
    ui.code.innerHTML=version.code.map((line,i)=>'<li data-line="'+(i+1)+'">'+syntax(line)+'</li>').join('');
    ui.description.textContent=descriptions[language];
  }
  function setPlaying(value){
    playing=value;clearTimeout(timer);timer=null;
    ui.play.innerHTML=(value?'<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h4v12H3zM10 2h4v12h-4z"/></svg>':'<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z"/></svg>')+'<span>'+(value?'暂停':'自动播放')+'</span>';
    ui.play.setAttribute('aria-label',value?'暂停':'自动播放');ui.play.setAttribute('aria-pressed',String(value));
    ui.status.textContent=value?'正在运行':index===trace?.steps.length-1?'执行完成':'已暂停';
    if(value)timer=setTimeout(tick,700/Number(ui.speed.value));
  }
  function tick(){
    if(!playing)return;if(index<trace.steps.length-1){index++;render();}
    if(index>=trace.steps.length-1)setPlaying(false);else timer=setTimeout(tick,700/Number(ui.speed.value));
  }
  function render(){
    const step=trace.steps[index],line=version.labels[step.label];renderer.draw(step.view);
    ui.message.textContent=step.message;ui.label.textContent='STEP '+String(index+1).padStart(2,'0');
    ui.count.textContent=(index+1)+' / '+trace.steps.length;ui.seek.value=index;ui.line.textContent='第 '+line+' 行';
    ui.previous.disabled=index===0;ui.next.disabled=index===trace.steps.length-1;ui.status.textContent=playing?'正在运行':step.finished?'执行完成':'已暂停';
    ui.code.querySelector('.is-current')?.classList.remove('is-current');
    const active=ui.code.children[line-1];active.classList.add('is-current');
    const top=active.offsetTop,bottom=top+active.offsetHeight;
    if(top<ui.scroll.scrollTop+15||bottom>ui.scroll.scrollTop+ui.scroll.clientHeight-15)ui.scroll.scrollTop=Math.max(0,top-ui.scroll.clientHeight*.4);
    const vars=L.watchVars(trace,index,version,language);ui.vars.replaceChildren();
    for(const [key,value]of Object.entries(vars)){
      const el=document.createElement('div'),str=display(value);el.className='variable'+(display(previousVars[key])!==str?' changed':'');el.title=key+' = '+str;
      const name=document.createElement('span'),number=document.createElement('b');name.textContent=key;number.textContent=str.length>150?str.slice(0,147)+'…':str;el.append(name,number);ui.vars.append(el);
    }
    if(!ui.vars.children.length){const note=document.createElement('span');note.className='panel-meta';note.textContent='执行初始化代码后，变量会显示在这里。';ui.vars.append(note);}
    previousVars=L.copy(vars);ui.result.textContent=step.finished?display(trace.result):'执行完成后显示结果';
  }
  function showError(error){setPlaying(false);const node=document.getElementById('error');node.classList.remove('hidden');node.textContent='演示生成失败：'+error.message;console.error(error);}
  function generate(){
    try{setPlaying(false);trace=build();index=0;previousVars={};setCode();ui.seek.max=trace.steps.length-1;ui.input.textContent=JSON.stringify(trace.input,null,2);document.getElementById('error').classList.add('hidden');render();}catch(error){showError(error);}
  }
  if(!item||!build){showError(new Error('这个算法尚未接入演示。'));return;}
  ui.language.addEventListener('change',()=>{
    setPlaying(false);language=ui.language.value;
    try{setCode();previousVars={};render();}catch(error){showError(error);return;}
    try{localStorage.setItem('algorithm-classroom-language',language);}catch{}
  });
  ui.play.addEventListener('click',()=>{if(index===trace.steps.length-1&&!playing){index=0;render();}setPlaying(!playing);});
  ui.previous.addEventListener('click',()=>{setPlaying(false);if(index>0){index--;render();}});
  ui.next.addEventListener('click',()=>{setPlaying(false);if(index<trace.steps.length-1){index++;render();}});
  ui.restart.addEventListener('click',()=>{setPlaying(false);index=0;previousVars={};render();});
  ui.random.addEventListener('click',generate);ui.seek.addEventListener('input',()=>{setPlaying(false);index=Number(ui.seek.value);render();});
  ui.speed.addEventListener('change',()=>{if(playing)setPlaying(true);});
  document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||/INPUT|SELECT|TEXTAREA|BUTTON/.test(event.target.tagName))return;if(event.code==='Space'){event.preventDefault();ui.play.click();}else if(event.code==='ArrowLeft'){event.preventDefault();ui.previous.click();}else if(event.code==='ArrowRight'){event.preventDefault();ui.next.click();}else if(event.code==='KeyR'){event.preventDefault();ui.restart.click();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)setPlaying(false);});window.addEventListener('resize',()=>{if(trace)renderer.draw(trace.steps[index].view);});window.addEventListener('pagehide',()=>clearTimeout(timer));generate();
})(AlgoLab);
