// Actual isolation checks. Requires the Docker image; never runs the probes on the host.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {runSandbox,checkSandbox,dockerExecutable,dockerEnvironment}=require('./local-lab/sandbox.cjs');
const execute=require('node:util').promisify(require('node:child_process').execFile);
const docker=async args=>(await execute(dockerExecutable,args,{env:dockerEnvironment,windowsHide:true,timeout:10000,maxBuffer:1000000})).stdout;
(async()=>{
  const state=await checkSandbox();assert.ok(state.available,state.message);
  const root=path.resolve(__dirname,'../artifacts');await fs.mkdir(root,{recursive:true});
  const sentinel=path.join(root,'sandbox-host-canary-'+Date.now()+'.txt');await fs.writeFile(sentinel,'HOST_FILE_MUST_STAY_PRIVATE');
  try{
    const hostPath=JSON.stringify(sentinel.replace(/\\/g,'/'));
    const code='#include <fstream>\n#include <iostream>\n#include <sys/socket.h>\n#include <arpa/inet.h>\n#include <unistd.h>\nint main(){\nstd::ifstream host('+hostPath+');\nstd::cout<<(host.good()?"HOST_READABLE":"HOST_HIDDEN")<<"\\n";\nstd::ofstream modify('+hostPath+');\nmodify<<"changed";\nstd::ofstream image("/app/should-not-write");\nstd::cout<<(image.good()?"ROOT_WRITABLE":"ROOT_READONLY")<<"\\n";\nstd::ifstream daemon("/var/run/docker.sock");\nstd::cout<<(daemon.good()?"DAEMON_VISIBLE":"DAEMON_HIDDEN")<<"\\n";\nstd::ofstream temp("/tmp/probe");\nstd::cout<<(temp.good()?"TMP_WRITABLE":"TMP_FAILED")<<"\\n";\nstd::cout<<getuid()<<"\\n";\nint s=socket(AF_INET,SOCK_STREAM,0);\nsockaddr_in target{};\ntarget.sin_family=AF_INET;\ntarget.sin_port=htons(53);\ninet_pton(AF_INET,"8.8.8.8",&target.sin_addr);\nint connection=connect(s,(sockaddr*)&target,sizeof(target));\nstd::cout<<(connection<0?"NETWORK_BLOCKED":"NETWORK_ACCESSIBLE")<<"\\n";\nclose(s);\nreturn 0;\n}';
    const result=await runSandbox(code,'');assert.equal(result.error,undefined,JSON.stringify(result.error));
    assert.equal(result.output,'HOST_HIDDEN\nROOT_READONLY\nDAEMON_HIDDEN\nTMP_WRITABLE\n10001\nNETWORK_BLOCKED\n');
    assert.equal(await fs.readFile(sentinel,'utf8'),'HOST_FILE_MUST_STAY_PRIVATE');
    const previous=new Set((await docker(['ps','--filter','label=org.algolab.sandbox.policy=1','--format','{{.ID}}'])).trim().split(/\s+/));
    const controller=new AbortController();const held=runSandbox('#include <thread>\n#include <chrono>\nint main(){\nstd::this_thread::sleep_for(std::chrono::seconds(30));\n}','',{signal:controller.signal});
    try{
      let current;for(let i=0;i<30&&!current;i++){const list=(await docker(['ps','--filter','label=org.algolab.sandbox.policy=1','--format','{{.ID}}'])).trim().split(/\s+/);current=list.find(id=>id&&!previous.has(id));if(!current)await new Promise(resolve=>setTimeout(resolve,300));}
      assert.ok(current,'Expected an active isolated container');const inspected=JSON.parse(await docker(['inspect',current]))[0],limits=inspected.HostConfig;
      assert.equal(inspected.Config.User,'10001:10001');assert.equal(limits.NetworkMode,'none');assert.equal(limits.ReadonlyRootfs,true);assert.equal(limits.Privileged,false);assert.equal(limits.Memory,512*1024*1024);assert.equal(limits.MemorySwap,512*1024*1024);assert.equal(limits.NanoCpus,1000000000);assert.equal(limits.PidsLimit,64);
      assert.ok(!limits.Binds?.length);assert.ok(inspected.Mounts.every(m=>m.Type==='tmpfs'),'No host bind mounts or volumes');assert.ok(limits.CapDrop.includes('ALL'));assert.deepEqual(limits.CapAdd.map(c=>c.replace(/^CAP_/,'')),['SYS_PTRACE']);assert.ok(limits.SecurityOpt.includes('no-new-privileges=true'));assert.ok(!limits.SecurityOpt.some(v=>v.includes('unconfined')));
      const environment=new Map(inspected.Config.Env.map(v=>{const i=v.indexOf('=');return [v.slice(0,i),v.slice(i+1)];}));
      for(const key of ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy'])assert.ok(environment.get(key)==='',key+' must not inherit host proxy settings');
    }finally{controller.abort();await held;}
    console.log('Verified real container execution cannot read/modify the host canary, write the image filesystem, access the Docker socket, or connect to an external network; temporary storage works and the process runs as UID 10001.');
    console.log('Verified actual Docker limits: no host mounts, read-only filesystem, disabled network, non-root user, cleared proxy environment, no privilege escalation, 512 MiB memory, 1 CPU and 64 processes.');
  }finally{await fs.unlink(sentinel);}
})().catch(error=>{console.error(error);process.exitCode=1;});
