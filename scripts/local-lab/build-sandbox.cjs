const {spawn}=require('node:child_process'),path=require('node:path');
const {IMAGE,checkEngine,dockerExecutable,dockerEnvironment}=require('./sandbox.cjs');
(async()=>{
  const state=await checkEngine();if(!state.available){console.error(state.message);process.exitCode=1;return;}
  const child=spawn(dockerExecutable,['build','--file',path.join(__dirname,'sandbox/Dockerfile'),'--tag',IMAGE,__dirname],{env:dockerEnvironment,stdio:'inherit',windowsHide:true});
  child.on('error',()=>{console.error('Docker 镜像准备失败，请检查 Docker Desktop。');process.exitCode=1;});
  child.on('close',code=>{process.exitCode=code===0?0:1;});
})();
