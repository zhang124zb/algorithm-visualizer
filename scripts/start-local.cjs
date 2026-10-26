const {spawn}=require('node:child_process');
const {createLocalServer}=require('./local-lab/server.cjs');

function openHome(url){
  if(process.platform!=='win32')return;
  const child=spawn(process.env.ComSpec||'cmd.exe',['/d','/s','/c','start "" "'+url+'"'],{windowsHide:true,windowsVerbatimArguments:true,stdio:'ignore'});
  const failed=()=>console.error('未能自动打开浏览器，请手动打开上方网址。');
  child.on('error',failed);child.on('exit',code=>{if(code)failed();});
}

async function startLocal({port=Number(process.env.ALGOLAB_PORT||4173),openBrowser=true}={}){
  if(Number(process.versions.node.split('.')[0])<18)throw Error('需要 Node.js 18 或更新版本。');
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('ALGOLAB_PORT 必须是 0～65535 的整数。');
  const server=createLocalServer();let retried=false;
  await new Promise((resolve,reject)=>{
    const failed=error=>{
      if(error.code==='EADDRINUSE'&&port!==0&&!retried){
        retried=true;console.log('端口 '+port+' 已被占用，正在选择空闲端口……');
        server.listen(0,'127.0.0.1');
      }else{
        server.removeListener('listening',ready);server.removeListener('error',failed);reject(error);
      }
    };
    const ready=()=>{server.removeListener('error',failed);resolve();};
    server.once('listening',ready);server.on('error',failed);server.listen(port,'127.0.0.1');
  });
  const url='http://127.0.0.1:'+server.address().port+'/';
  console.log('\n算法演示室已启动：'+url);
  console.log('代码实验室：'+url+'extensions/code-lab/');
  console.log('C++ 本机执行需要已启动的 Docker 和已准备的隔离镜像；网页会检查是否就绪。');
  console.log('请保持此窗口开启。停止服务请按 Ctrl+C。\n');
  if(openBrowser)openHome(url);
  return server;
}

if(require.main===module){
  startLocal().then(server=>{
    for(const signal of ['SIGINT','SIGTERM','SIGHUP'])process.once(signal,()=>{
      console.log('\n正在停止本地服务……');server.stop();server.closeIdleConnections?.();
    });
  }).catch(error=>{console.error('启动失败：'+error.message);process.exitCode=1;});
}
module.exports={startLocal};
