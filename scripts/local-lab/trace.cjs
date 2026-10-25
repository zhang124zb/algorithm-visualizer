const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const {Gdb,killTree}=require('./mi.cjs');
const quote=JSON.stringify;
function scalar(value='不可读取'){
  if(value==='true'||value==='false')return value==='true';
  if(/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)){const n=Number(value);if(Number.isFinite(n)&&(!Number.isInteger(n)||Number.isSafeInteger(n)))return n;}
  if(/^".*"$/.test(value))try{return JSON.parse(value);}catch{}
  return value;
}
function compile(command,args,cwd,signal){
  return new Promise((resolve,reject)=>{
    if(signal.aborted){reject(Error('执行已停止。'));return;}
    const child=spawn(command,args,{cwd,windowsHide:true,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});let diagnostics='';
    let timedOut=false;const abort=()=>killTree(child),timer=setTimeout(()=>{timedOut=true;abort();},20000);signal.addEventListener('abort',abort,{once:true});
    child.stdout.on('data',d=>{diagnostics=(diagnostics+d).slice(-16000);});child.stderr.on('data',d=>{diagnostics=(diagnostics+d).slice(-16000);});
    child.on('error',e=>reject(Error('无法启动 g++，请检查安装或 ALGOLAB_CXX：'+e.message)));
    child.on('close',code=>{clearTimeout(timer);signal.removeEventListener('abort',abort);signal.aborted||timedOut?reject(Error(timedOut?'编译超过 20 秒，已停止。':'执行已停止。')):resolve({code,diagnostics});});
  });
}
async function traceCpp(code,input,{cxx=process.env.ALGOLAB_CXX||'g++',gdb=process.env.ALGOLAB_GDB||'gdb',signal,maxSteps=2000,maxTime=60000}={}){
  if(process.platform!=='linux'||process.env.ALGOLAB_CONTAINER_WORKER!=='1'||!await fs.stat('/.dockerenv').catch(()=>null))throw Error('C++ 编译与调试仅允许在隔离容器内执行。');
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  const tempRoot=path.resolve(os.tmpdir()),dir=await fs.mkdtemp(path.join(tempRoot,'algolab-')),steps=[],started=Date.now();let debuggerSession,watchdog,deadline,error,exitCode=null,output='',bytes=0;
  const sourceLines=code.replace(/\r\n?/g,'\n').split('\n');
  const outputPath=path.join(dir,'stdout.txt'),errorPath=path.join(dir,'stderr.txt');
  const read=async p=>{let file;try{
    file=await fs.open(p,'r');const buffer=Buffer.alloc(16001),{bytesRead}=await file.read(buffer,0,buffer.length,0);
    if(bytesRead>16000){error={message:'标准输出超过 16000 字节，已停止。'};controller.abort();}
    return buffer.subarray(0,Math.min(bytesRead,16000)).toString('utf8').replace(/\r\n/g,'\n');
  }catch{return '';}finally{await file?.close();}};
  const io=async()=>{const out=await read(outputPath),err=await read(errorPath);return (out+(err?'\n[stderr]\n'+err:'')).slice(0,16000);};
  const push=step=>{bytes+=Buffer.byteLength(JSON.stringify(step));if(bytes>12e6)throw Error('运行快照超过 12 MB，已停止并保留已有步骤。');steps.push(step);};
  try{
    await fs.writeFile(path.join(dir,'main.cpp'),code);
    await fs.writeFile(path.join(dir,'stdin.txt'),input);
    // Keep submitted source and its line numbers unchanged. Flush standard output at each insertion for replay.
    await fs.writeFile(path.join(dir,'io.cpp'),'#include <iostream>\n#include <cstdio>\nnamespace { struct FlushOutput { FlushOutput(){ std::cout.setf(std::ios::unitbuf); std::cerr.setf(std::ios::unitbuf); std::setvbuf(stdout,nullptr,_IONBF,0); std::setvbuf(stderr,nullptr,_IONBF,0); } } flush_output; }\n');
    const compiled=await compile(cxx,['-std=c++17','-g3','-O0','-fno-omit-frame-pointer','-fno-inline','-fdiagnostics-color=never','main.cpp','io.cpp','-o','program'+(process.platform==='win32'?'.exe':'')],dir,controller.signal);
    if(compiled.code!==0){const line=Number(compiled.diagnostics.match(/main\.cpp:(\d+):/)?.[1])||undefined;return {steps:[],error:{line,message:'编译失败：\n'+compiled.diagnostics},elapsed:Date.now()-started,engine:'gdb',phase:'before'};}
    if(controller.signal.aborted)throw Error('执行已停止。');
    debuggerSession=new Gdb(gdb,dir,controller.signal);const mi=command=>debuggerSession.command(command);
    deadline=setTimeout(()=>{error={message:'调试超过 '+Math.round(maxTime/1000)+' 秒，已停止并保留已有步骤。'};controller.abort();},maxTime);
    let checking=false;watchdog=setInterval(async()=>{if(checking)return;checking=true;try{for(const p of [outputPath,errorPath]){if((await fs.stat(p).catch(()=>({size:0}))).size>16000){error={message:'标准输出超过 16000 字节，已停止。'};controller.abort();break;}}}finally{checking=false;}},100);
    await mi('-gdb-set pagination off');await mi('-gdb-set confirm off');await mi('-gdb-set print elements 64');await mi('-gdb-set print repeats 0');
    await mi('-gdb-set mi-async on');await mi('-gdb-set disable-randomization off');await mi('-gdb-set new-console off').catch(()=>{});
    await mi('-file-exec-and-symbols '+quote(path.join(dir,'program'+(process.platform==='win32'?'.exe':'')).replace(/\\/g,'/')));
    await mi('-enable-pretty-printing');
    const symbols=await mi('-symbol-info-variables').catch(()=>({}));
    const globals=(symbols.symbols?.debug||[]).filter(f=>path.basename(f.filename||f.fullname||'')==='main.cpp').flatMap(f=>f.symbols||[]).filter(v=>/^[a-zA-Z_]\w*$/.test(v.name)).slice(0,64);
    const lineTable=await mi('-symbol-list-lines main.cpp');
    const executableLines=[...new Set((lineTable.lines||[]).map(item=>Number(item.line)).filter(n=>n>0&&n<=sourceLines.length))];
    if(!executableLines.length)throw Error('GDB 未找到源代码的可执行行。');
    // Break on submitted source lines, including recursive calls, without descending into standard-library internals.
    for(const line of executableLines)await mi('-break-insert '+quote('main.cpp:'+line));
    let stop=await debuggerSession.resume('-interpreter-exec console '+quote('run < stdin.txt > stdout.txt 2> stderr.txt'));
    async function valueObject(object,depth=0){
      const type=object.type||'',dimensions=[...type.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]));
      if(!dimensions.length||depth>1)return scalar(object.value||type||'不可读取');
      const limit=dimensions.length>1||depth?16:64;
      const result=await mi('-var-list-children --all-values '+quote(object.name)+' 0 '+limit);
      return Promise.all((result.children||[]).map(child=>valueObject(child,depth+1)));
    }
    async function variable(v){
      if(!/^[a-zA-Z_]\w*$/.test(v.name))return null;
      let object;
      try{
        object=await mi('-var-create - * '+quote(v.name));let type=object.type||v.type||'',length,columns;
        const dims=[...type.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]));
        let value;
        if(dims.length){length=dims[0];columns=dims[1];value=await valueObject(object);}
        else if(/^(?:const )?std::vector<.*>/.test(type)&&!/^std::vector<bool[,>]/.test(type)){
          // libstdc++ layout also works on MinGW GDB builds without Python pretty printers.
          const count=await mi('-data-evaluate-expression '+quote(v.name+'._M_impl._M_finish - '+v.name+'._M_impl._M_start'));
          length=Number(count.value);if(!Number.isSafeInteger(length)||length<0||length>10000000)throw Error('unavailable vector');
          value=[];
          for(let i=0;i<Math.min(length,64);i++){const element=await mi('-data-evaluate-expression '+quote(v.name+'._M_impl._M_start['+i+']'));value.push(scalar(element.value));}
        }else value=scalar(v.value??object.value??type);
        return {name:v.name,type,value,...(length!==undefined?{length}:{}),...(columns?{columns}:{})};
      }catch{return {name:v.name,type:v.type||object?.type||'',value:'不可读取'};}
      finally{if(object?.name)await mi('-var-delete '+quote(object.name)).catch(()=>{});}
    }
    async function snapshot(frame){
      const frames=(await mi('-stack-list-frames 0 31')).stack||[],stack=[];let variables=[];
      for(const f of frames.filter(f=>path.basename(f.fullname||f.file||'')==='main.cpp').reverse()){
        await mi('-stack-select-frame '+f.level);
        const locals=(await mi('-stack-list-variables --simple-values')).variables||[];
        const list=[...locals,...(f.level==='0'?globals.filter(g=>!locals.some(v=>v.name===g.name)):[])].slice(0,64);
        const values=[];for(const v of list){const item=await variable(v);if(item)values.push(item);}
        stack.push({name:f.func,variables:values});if(f.level==='0')variables=values;
      }
      await mi('-stack-select-frame 0');
      const line=Number(frame.line),text=sourceLines[line-1]||'';
      output=await io();push({line,variables,stack,output,accessed:variables.filter(v=>Array.isArray(v.value)&&new RegExp('\\b'+v.name+'\\b').test(text)).map(v=>v.name),message:'即将执行第 '+line+' 行 · '+frame.func+'()；变量为执行前状态。'});
    }
    let transitions=0;
    while(true){
      if(controller.signal.aborted)throw Error('执行已停止。');
      if(stop.reason==='exited-normally'||stop.reason==='exited'){
        exitCode=stop['exit-code']?parseInt(stop['exit-code'],/^0x/i.test(stop['exit-code'])?16:8):0;output=await io();
        if(steps.length)push({...steps.at(-1),output,finished:true,message:'程序运行结束，退出码 '+exitCode+'。'});break;
      }
      if(stop.reason==='signal-received'){error={line:Number(stop.frame?.line)||steps.at(-1)?.line,message:'程序收到 '+stop['signal-name']+'：'+(stop['signal-meaning']||'运行异常')};break;}
      const frame=stop.frame;
      if(!frame)throw Error('调试器没有返回执行位置。');
      const inSource=path.basename(frame.fullname||frame.file||'')==='main.cpp';
      if(inSource){
        if(steps.length>=maxSteps){error={line:steps.at(-1)?.line,message:'已达到 '+maxSteps+' 步记录限制。'};break;}
        await snapshot(frame);
      }
      if(++transitions>maxSteps*4)throw Error('进入外部库的次数过多，已停止。');
      stop=await debuggerSession.resume('-exec-continue');
    }
  }catch(e){error=error||{line:steps.at(-1)?.line,message:e.message};}
  finally{
    clearTimeout(deadline);clearInterval(watchdog);
    if(debuggerSession)await debuggerSession.close();
    signal?.removeEventListener('abort',abort);
    output=(await io()).slice(0,16000);
    const cleanupPath=path.resolve(dir);
    if(path.dirname(cleanupPath)===tempRoot&&/^algolab-[\w-]+$/.test(path.basename(cleanupPath)))await fs.rm(cleanupPath,{recursive:true,force:true,maxRetries:5,retryDelay:100}).catch(()=>{});
  }
  if(error&&steps.length){const last=steps.at(-1);last.error=true;last.finished=false;last.message=error.message;last.output=output;}
  return {steps,output,exitCode,error,elapsed:Date.now()-started,phase:'before',engine:'gdb'};
}
module.exports={traceCpp,scalar};
