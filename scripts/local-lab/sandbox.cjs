const {spawn}=require('node:child_process'),{randomUUID}=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
const dockerExecutable=process.platform==='win32'?[
  process.env.LOCALAPPDATA&&path.join(process.env.LOCALAPPDATA,'Programs/DockerDesktop/resources/bin/docker.exe'),
  process.env.ProgramFiles&&path.join(process.env.ProgramFiles,'Docker/Docker/resources/bin/docker.exe')
].find(p=>p&&fs.existsSync(p))||'docker':'docker';
const dockerEnvironment=path.isAbsolute(dockerExecutable)?{...process.env,PATH:path.dirname(dockerExecutable)+path.delimiter+(process.env.PATH||'')}:process.env;
const IMAGE='algorithm-classroom-cpp-sandbox:1',POLICY='1';
const unavailable=message=>({available:false,isolation:'docker',message});
function docker(args,{input,signal,timeout=10000,limit=16000000}={}){
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(Error('执行已停止。'));return;}
    const child=spawn(dockerExecutable,args,{env:dockerEnvironment,windowsHide:true,stdio:['pipe','pipe','pipe']});
    const chunks=[];let bytes=0,stderr='',failure;
    const stop=message=>{failure=Error(message);child.kill();};
    const timer=setTimeout(()=>stop('容器操作超时，已停止。'),timeout),abort=()=>stop('执行已停止。');signal?.addEventListener('abort',abort,{once:true});
    child.stdout.on('data',data=>{bytes+=data.length;if(bytes>limit)stop('容器返回的数据超过限制。');else chunks.push(data);});
    child.stderr.on('data',data=>{stderr=(stderr+data).slice(-4000);});child.stdin.on('error',()=>{});
    child.on('error',()=>{failure=Error('未找到 Docker，请安装并启动 Docker Desktop（Linux 容器）。');});
    child.on('close',code=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);failure?reject(failure):resolve({code,stdout:Buffer.concat(chunks).toString('utf8'),stderr});});
    child.stdin.end(input);
  });
}
async function checkEngine(){
  try{
    // Keep code on this computer, even if Docker has a remote context configured.
    let endpoint=process.env.DOCKER_HOST;
    if(!endpoint||process.env.DOCKER_CONTEXT){
      const context=await docker(['context','inspect','--format','{{json .Endpoints.docker.Host}}']);
      if(context.code!==0)return unavailable('无法读取 Docker 本机连接，请检查 Docker Desktop。');
      endpoint=JSON.parse(context.stdout);
    }
    if(!/^(?:npipe:\/\/|unix:\/\/)/.test(endpoint||''))return unavailable('仅允许本机 Docker 连接；请切换到 Docker Desktop 的本机 Linux 容器。');
    const info=await docker(['info','--format','{{json .}}']);if(info.code!==0)return unavailable('Docker 尚未启动，请启动 Docker Desktop 后重试。');
    const engine=JSON.parse(info.stdout);
    if(engine.OSType!=='linux')return unavailable('请将 Docker Desktop 切换为 Linux 容器。');
    if(!engine.MemoryLimit||!engine.SwapLimit||!engine.PidsLimit||!engine.CpuCfsQuota||!engine.SecurityOptions?.some(v=>v.includes('seccomp')))return unavailable('Docker 未提供所需的资源限制或 seccomp 保护，本机执行已禁用。');
    return {available:true,isolation:'docker'};
  }catch(error){return unavailable(error.message);}
}
async function checkSandbox(){
  const engine=await checkEngine();if(!engine.available)return engine;
  try{
    const inspected=await docker(['image','inspect',IMAGE,'--format','{{json .}}']);
    if(inspected.code!==0)return unavailable('隔离镜像尚未准备，请先运行 npm run lab:sandbox:build。');
    const image=JSON.parse(inspected.stdout);
    if(image.Os!=='linux'||image.Config?.Labels?.['org.algolab.sandbox.policy']!==POLICY||!/^sha256:[a-f0-9]{64}$/.test(image.Id))return unavailable('隔离镜像版本不匹配，请重新运行 npm run lab:sandbox:build。');
    return {available:true,isolation:'docker',imageId:image.Id,message:'一次性隔离环境已就绪；代码无法通过挂载目录或网络访问本机。'};
  }catch(error){return unavailable(error.message);}
}
function runArguments(name,imageId){
  if(!/^algolab-[a-f0-9-]{36}$/.test(name)||!/^sha256:[a-f0-9]{64}$/.test(imageId))throw Error('隔离运行标识无效。');
  return ['run','--rm','--pull=never','--name',name,'--label','org.algolab.sandbox.policy='+POLICY,
    '--network=none','--read-only','--user=10001:10001','--cap-drop=ALL','--cap-add=SYS_PTRACE',
    '--security-opt=no-new-privileges=true','--pids-limit=64','--memory=512m','--memory-swap=512m','--cpus=1',
    '--ulimit','core=0:0','--ulimit','nofile=128:128','--ulimit','fsize=16777216:16777216',
    '--tmpfs','/tmp:rw,exec,nosuid,nodev,size=134217728,mode=1777','--ipc=none','--init','--log-driver=none',
    ...['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy'].flatMap(key=>['--env',key+'=']),'-i',imageId];
}
async function runSandbox(code,input,{signal,maxSteps=2000,maxTime=60000}={}){
  const state=await checkSandbox();if(!state.available)return {steps:[],error:{message:state.message},engine:'gdb',phase:'before'};
  if(signal?.aborted)return {steps:[],error:{message:'执行已停止。'},engine:'gdb',phase:'before'};
  const name='algolab-'+randomUUID();let result,cleanupError;
  try{
    const response=await docker(runArguments(name,state.imageId),{input:JSON.stringify({code,input,maxSteps:Math.max(1,Math.min(2000,maxSteps)),maxTime:Math.max(100,Math.min(60000,maxTime))}),signal,timeout:85000});
    if(response.code!==0)throw Error('隔离运行未完成（可能超过容器资源限制）。'+(response.stderr?'\n'+response.stderr:''));
    result=JSON.parse(response.stdout);
    if(!result||!Array.isArray(result.steps)||result.steps.length>2001)throw Error('隔离环境返回的数据无效。');
  }catch(error){result={steps:[],error:{message:error.message},engine:'gdb',phase:'before'};}
  finally{
    // Stopping the Docker CLI alone does not stop its container. Explicitly remove this run only.
    try{const removed=await docker(['rm','--force',name]);
      if(removed.code!==0&&!/No such container/i.test(removed.stderr))cleanupError='容器清理失败，请在 Docker Desktop 中停止 '+name+'。';
    }catch{cleanupError='无法确认容器清理，请在 Docker Desktop 中停止 '+name+'。';}
  }
  if(cleanupError){result.error={message:cleanupError};result.cleanupFailed=true;}
  return result;
}
module.exports={IMAGE,POLICY,dockerExecutable,dockerEnvironment,checkEngine,checkSandbox,runSandbox,runArguments};
