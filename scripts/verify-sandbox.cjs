// Host-side security regression checks. Docker interactions are simulated; no C++ is executed here.
const assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),cp=require('node:child_process');
const savedSpawn=cp.spawn,calls=[],imageId='sha256:'+'a'.repeat(64);
let mode='ready',cleanupFails=false,remote=false,heldRunStarted;
cp.spawn=(command,args)=>{
  assert.match(require('node:path').basename(command),/^docker(?:\.exe)?$/i,'The website must never spawn a host compiler/debugger');
  const call={args};calls.push(call);const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let closed=false,body=[];
  const close=(code,stdout='',stderr='')=>{if(closed)return;closed=true;child.stdout.end(stdout);child.stderr.end(stderr);child.emit('close',code);};
  child.kill=()=>{setImmediate(()=>close(-1));return true;};
  child.stdin.on('data',data=>body.push(data));
  child.stdin.on('finish',()=>setImmediate(()=>{
    call.input=Buffer.concat(body).toString('utf8');
    if(mode==='missing'){child.emit('error',Error('ENOENT'));close(-2);return;}
    if(args[0]==='context')return close(0,JSON.stringify(remote?'ssh://remote.example':'npipe:////./pipe/docker_engine'));
    if(args[0]==='info')return close(0,JSON.stringify({OSType:'linux',MemoryLimit:true,SwapLimit:true,PidsLimit:true,CpuCfsQuota:true,SecurityOptions:['name=seccomp,profile=builtin']}));
    if(args[0]==='image')return close(0,JSON.stringify({Id:imageId,Os:'linux',Config:{Labels:{'org.algolab.sandbox.policy':'1'}}}));
    if(args[0]==='run'){
      if(mode==='hold'){heldRunStarted?.();return;}
      if(mode==='bad-json')return close(0,'untrusted invalid output');
      return close(0,JSON.stringify({steps:[],output:'sandbox response',engine:'gdb',phase:'before'}));
    }
    if(args[0]==='rm')return close(cleanupFails?1:0,'',cleanupFails?'daemon unavailable':'');
    throw Error('Unexpected Docker command');
  }));return child;
};
const {checkSandbox,runSandbox,runArguments}=require('./local-lab/sandbox.cjs'),{traceCpp}=require('./local-lab/trace.cjs'),{createLocalServer}=require('./local-lab/server.cjs');
(async()=>{
  const oldHost=process.env.DOCKER_HOST,oldContext=process.env.DOCKER_CONTEXT;delete process.env.DOCKER_HOST;delete process.env.DOCKER_CONTEXT;
  let server;
  try{
    const breakpoint=require('./local-lab/mi.cjs').parseRecord('33^done,bkpt={number="22",addr="<MULTIPLE>",locations=[{number="22.1",line="27"},{number="22.2",line="27"}]}');assert.equal(breakpoint.data.bkpt.locations.length,2);
    await assert.rejects(()=>traceCpp('int main(){}',''),/仅允许在隔离容器/);
    const args=runArguments('algolab-00000000-0000-4000-8000-000000000000',imageId);
    for(const flag of ['--network=none','--read-only','--user=10001:10001','--cap-drop=ALL','--security-opt=no-new-privileges=true','--memory=512m','--memory-swap=512m','--cpus=1','--pids-limit=64','--pull=never'])assert.ok(args.includes(flag),flag);
    for(const key of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy'])assert.ok(args.includes(key+'='),'Clear inherited '+key);
    for(const flag of args)assert.ok(!/^(?:--privileged|--volume|-v$|--mount|--publish|-p$|--pid=host|--network=host|--env-file)/.test(flag),'Forbidden host access flag '+flag);
    assert.throws(()=>runArguments('../foreign-container',imageId));
    remote=true;assert.equal((await checkSandbox()).available,false);remote=false;
    process.env.DOCKER_HOST='tcp://remote.example:2375';assert.equal((await checkSandbox()).available,false);delete process.env.DOCKER_HOST;
    mode='missing';assert.equal((await checkSandbox()).available,false);const noDocker=await runSandbox('int main(){}','');assert.match(noDocker.error.message,/Docker/);assert.ok(!calls.some(c=>c.args[0]==='run'));
    mode='ready';const successful=await runSandbox('int main(){}','private input');assert.equal(successful.output,'sandbox response');const launched=calls.find(c=>c.args[0]==='run');assert.ok(!launched.args.includes('private input'));assert.equal(JSON.parse(launched.input).input,'private input');assert.equal(launched.args.at(-1),imageId);
    const runName=launched.args[launched.args.indexOf('--name')+1];assert.ok(calls.some(c=>c.args[0]==='rm'&&c.args.at(-1)===runName));
    mode='bad-json';assert.ok((await runSandbox('int main(){}','')).error);assert.equal(calls.at(-1).args[0],'rm');
    mode='hold';const controller=new AbortController(),started=new Promise(resolve=>{heldRunStarted=resolve;});const pending=runSandbox('int main(){}','',{signal:controller.signal});await started;controller.abort();assert.match((await pending).error.message,/停止/);assert.equal(calls.at(-1).args[0],'rm');
    mode='missing';server=createLocalServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
    const health=await (await fetch(base+'/api/native/health')).json();assert.equal(health.available,false);assert.match(health.message,/Docker/);
    const headers={'Content-Type':'application/json','X-Algolab-Token':health.token};const body=JSON.stringify({id:'blocked',code:'int main(){}',input:''});
    const blocked=await (await fetch(base+'/api/native/run',{method:'POST',headers,body})).json();assert.ok(blocked.error);assert.equal(blocked.steps.length,0);
    assert.equal((await fetch(base+'/api/native/health',{headers:{Origin:'https://untrusted.example'}})).status,403);
    mode='ready';cleanupFails=true;const dirty=await (await fetch(base+'/api/native/run',{method:'POST',headers,body})).json();assert.ok(dirty.cleanupFailed);const count=calls.filter(c=>c.args[0]==='run').length;
    assert.equal((await (await fetch(base+'/api/native/health')).json()).available,false);
    assert.equal((await fetch(base+'/api/native/run',{method:'POST',headers,body})).status,503);assert.equal(calls.filter(c=>c.args[0]==='run').length,count,'Cleanup failure must block subsequent execution');
    console.log('Verified fail-closed host boundary, required container restrictions, no host mounts or remote Docker, stdin-only code transfer, image pinning, cleanup on failure/cancellation, and execution lock after cleanup failure. Real container execution requires Docker.');
  }finally{server?.stop();server?.closeAllConnections();cp.spawn=savedSpawn;if(oldHost===undefined)delete process.env.DOCKER_HOST;else process.env.DOCKER_HOST=oldHost;if(oldContext===undefined)delete process.env.DOCKER_CONTEXT;else process.env.DOCKER_CONTEXT=oldContext;}
})().catch(error=>{console.error(error);process.exitCode=1;});
