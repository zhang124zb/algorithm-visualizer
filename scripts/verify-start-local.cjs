const assert=require('node:assert/strict'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {once,EventEmitter}=require('node:events'),cp=require('node:child_process');
const originalSpawn=cp.spawn,browserCalls=[],servers=[];let browserFails=false;
cp.spawn=(command,args,options)=>{
  assert.match(path.basename(command),/^cmd\.exe$/i,'Startup must not invoke a compiler or Docker');
  browserCalls.push({command,args,options});const child=new EventEmitter();
  queueMicrotask(()=>browserFails?child.emit('error',Error('Browser unavailable')):child.emit('exit',0));return child;
};
const {startLocal}=require('./start-local.cjs');
const request=(server,url,options={})=>new Promise((resolve,reject)=>{
  const req=http.request({host:'127.0.0.1',port:server.address().port,path:url,agent:false,...options},res=>{
    let body='';res.setEncoding('utf8');res.on('data',data=>body+=data);res.on('end',()=>resolve({status:res.statusCode,body}));
  });req.on('error',reject);req.end();
});
(async()=>{
  try{
    const server=await startLocal({port:0});servers.push(server);
    assert.equal(server.address().address,'127.0.0.1');
    assert.match((await request(server,'/')).body,/<title>首页 · 算法演示室<\/title>/);
    assert.equal((await request(server,'/extensions/code-lab/')).status,200);
    assert.equal((await request(server,'/extensions/code-lab/worker.js')).status,200);
    assert.equal((await request(server,'/structures/pointers/')).status,200);
    assert.equal((await request(server,'/api/native/run',{method:'POST'})).status,403,'Native execution still requires a session token');
    assert.equal((await request(server,'/api/native/health',{headers:{Origin:'https://foreign.example'}})).status,403);
    assert.equal((await request(server,'/',{headers:{Host:'foreign.example'}})).status,403);
    if(process.platform==='win32'){
      assert.equal(browserCalls.length,1);assert.equal(browserCalls[0].args.at(-1),'start "" "http://127.0.0.1:'+server.address().port+'/"');
      assert.equal(browserCalls[0].options.windowsHide,true);
      assert.equal(browserCalls[0].options.windowsVerbatimArguments,true);
      const args=browserCalls[0].args.slice();args[args.length-1]=args.at(-1).replace(/^start /,'echo ');
      const parsed=cp.spawnSync(browserCalls[0].command,args,{windowsHide:true,windowsVerbatimArguments:true,encoding:'utf8'});
      assert.ifError(parsed.error);assert.equal(parsed.status,0);
      assert.equal(parsed.stdout.trim(),'"" "http://127.0.0.1:'+server.address().port+'/"','CMD receives the browser title and URL without backslash escapes');
    }
    const blocker=http.createServer((req,res)=>res.end('Existing service'));servers.push(blocker);
    await new Promise(resolve=>blocker.listen(0,'127.0.0.1',resolve));
    const fallback=await startLocal({port:blocker.address().port,openBrowser:false});servers.push(fallback);
    assert.notEqual(fallback.address().port,blocker.address().port);
    assert.equal((await request(blocker,'/')).body,'Existing service','A busy port must never cause another service to be stopped');
    assert.equal((await request(fallback,'/extensions/code-lab/')).status,200);
    assert.equal(browserCalls.length,process.platform==='win32'?1:0);
    browserFails=true;const withoutBrowser=await startLocal({port:0});servers.push(withoutBrowser);
    assert.equal((await request(withoutBrowser,'/')).status,200,'Browser launch failure leaves the server usable');
    await assert.rejects(()=>startLocal({port:65536}),/ALGOLAB_PORT/);
    if(process.platform==='win32'){
      const batch=path.resolve(__dirname,'../一键启动.bat'),system32=path.join(process.env.SystemRoot,'System32');
      const result=cp.spawnSync(path.join(system32,'cmd.exe'),['/d','/s','/c','""'+batch+'""'],{
        cwd:os.tmpdir(),env:{...process.env,PATH:system32},windowsVerbatimArguments:true,windowsHide:true,input:'\r\n',encoding:'utf8',timeout:8000
      });
      assert.ifError(result.error);assert.equal(result.status,1);assert.match(result.stdout,/未找到 Node\.js/,'The batch file locates the project across drives and reports missing Node');
    }
    console.log('Verified local startup, default-browser dispatch/failure, busy-port fallback, preserved services, shared pages/API protection and Windows batch dependency handling.');
  }finally{
    cp.spawn=originalSpawn;
    for(const server of servers.reverse())if(server.listening){const closed=once(server,'close');server.stop?server.stop():server.close();server.closeIdleConnections?.();await closed;}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
