// Optional integration checks: requires the Docker sandbox image, never compiles on the host.
const assert=require('node:assert/strict');
const {parseRecord,Gdb}=require('./local-lab/mi.cjs'),{runSandbox:traceCpp,checkSandbox}=require('./local-lab/sandbox.cjs'),{createLocalServer}=require('./local-lab/server.cjs');
(async()=>{
  assert.deepEqual(parseRecord('12^done,stack=[frame={level="0",func="main"},frame={level="1",func="f"}]').data.stack,[{level:'0',func:'main'},{level:'1',func:'f'}]);
  assert.equal(parseRecord('~"\\344\\270\\255\\346\\226\\207\\n"').value,'中文\n');
  assert.equal(parseRecord('99^done,value="hello \\"world\\""').token,99);
  await assert.rejects(()=>Gdb.prototype.resume.call({failure:Error('already stopped')},'-exec-continue'),/already stopped/);
  const readiness=await checkSandbox();assert.ok(readiness.available,readiness.message);
  const code='#include <bits/stdc++.h>\nusing namespace std;\nint global[2]={10,20};\nint fact(int n){\nif(n<2) return 1;\nreturn n*fact(n-1);\n}\nint main(){\nint a[2]={1,2};\nint b[2]={3,4};\nint matrix[2][2]={{1,2},{3,4}};\nvector<int> v={9,5,7};\nint x=0;\ncin>>x;\na[0]=x;\nb[1]=a[0]+1;\nsort(v.begin(),v.end());\ncout<<a[0]<<" "<<b[1]<<" "<<v[0]<<" "<<fact(4)<<endl;\nreturn 0;\n}\n';
  const trace=await traceCpp(code,'8');assert.equal(trace.error,undefined,JSON.stringify(trace.error));assert.equal(trace.output,'8 9 5 24\n');assert.equal(trace.exitCode,0);assert.equal(trace.phase,'before');assert.ok(trace.steps.at(-1).finished);
  const after=trace.steps.find(s=>s.line===17),get=name=>after.variables.find(v=>v.name===name)?.value;
  assert.deepEqual(get('a'),[8,2]);assert.deepEqual(get('b'),[3,9]);assert.deepEqual(get('matrix'),[[1,2],[3,4]]);assert.deepEqual(get('global'),[10,20]);
  assert.deepEqual(trace.steps.find(s=>s.line===18).variables.find(v=>v.name==='v').value,[5,7,9]);
  assert.ok(trace.steps.some(s=>s.stack.filter(f=>f.name==='fact').length===4),'Recursive call frames');
  assert.deepEqual(trace.steps.find(s=>s.line===15).variables.find(v=>v.name==='a').value,[1,2],'Earlier snapshots stay unchanged');
  assert.equal(after.output,'','Output must not appear before its source line');
  const bad=await traceCpp('int main(){\nint x=;\n}','');assert.match(bad.error.message,/编译失败/);assert.equal(bad.error.line,2);
  const signal=await traceCpp('int main(){\nvolatile int* p=nullptr;\n*p=1;\nreturn 0;\n}','');assert.match(signal.error?.message||'',/SIGSEGV/);assert.ok(signal.steps.at(-1).error);
  const limit=await traceCpp('int main(){\nint n=0;\nwhile(true){\nn++;\n}\n}','',{maxSteps:6});assert.equal(limit.steps.length,6);assert.match(limit.error.message,/6 步/);
  const timeout=await traceCpp('#include <thread>\n#include <chrono>\nint main(){\nstd::this_thread::sleep_for(std::chrono::seconds(10));\n}','',{maxTime:500});assert.match(timeout.error.message,/调试超过/);assert.ok(timeout.elapsed<10000,'Timeout must kill the inferior');
  const returned=await traceCpp('int main(){\nreturn 7;\n}','');assert.equal(returned.exitCode,7);
  const verbose=await traceCpp('#include <iostream>\n#include <string>\nint main(){\nstd::cout<<std::string(20000,\'x\');\nreturn 0;\n}','');assert.match(verbose.error?.message||'',/16000/);assert.ok(verbose.output.length<=16000);assert.equal(verbose.steps.at(-1).finished,false);
  const server=createLocalServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  try{
    const health=await (await fetch(base+'/api/native/health')).json();assert.ok(health.available);
    assert.equal((await fetch(base+'/api/native/health',{headers:{Origin:'https://untrusted.example'}})).status,403);
    const wrongHost=await new Promise((resolve,reject)=>{require('node:http').get(base+'/api/native/health',{headers:{Host:'untrusted.example'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);});assert.equal(wrongHost,403);
    assert.equal((await fetch(base+'/api/native/run',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
    const headers={'Content-Type':'application/json','X-Algolab-Token':health.token};
    assert.equal((await fetch(base+'/api/native/run',{method:'POST',headers,body:JSON.stringify({id:'bad',code:'',input:''})})).status,400);
    const page=await fetch(base+'/extensions/code-lab/');assert.equal(page.status,200);assert.match(await page.text(),/id="lab-engine"/);
    const response=await fetch(base+'/api/native/run',{method:'POST',headers,body:JSON.stringify({id:'http-run',code:'#include <iostream>\nint main(){\nstd::cout<<"本机正常";\nreturn 0;\n}',input:''})});const result=await response.json();assert.equal(result.error,undefined,JSON.stringify(result.error));assert.equal(result.output,'本机正常');
    const pending=fetch(base+'/api/native/run',{method:'POST',headers,body:JSON.stringify({id:'cancel-run',code:'int main(){\nwhile(true){}\n}',input:''})});
    await new Promise(resolve=>setTimeout(resolve,800));
    assert.equal((await fetch(base+'/api/native/run',{method:'POST',headers,body:'{}'})).status,409);
    await fetch(base+'/api/native/run/cancel-run',{method:'DELETE',headers});const cancelled=await (await pending).json();assert.match(cancelled.error.message,/停止/);
  }finally{server.stop();server.closeAllConnections();}
  console.log('Verified real C++17/STL/input/output, arrays/matrix/globals/vector, recursive frames, immutable pre-line snapshots, compiler errors, signals, exit codes, step/time limits, local HTTP access controls and cancellation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
