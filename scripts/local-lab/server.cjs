const http=require('node:http'),{randomBytes}=require('node:crypto');
const {serveStatic}=require('../serve.cjs'),{checkSandbox,runSandbox}=require('./sandbox.cjs');
function createLocalServer(){
  const token=randomBytes(32).toString('hex');let active=null,isolationFault=null;
  const server=http.createServer(async(req,res)=>{
    const host='127.0.0.1:'+server.address().port,origin='http://'+host;
    const send=(code,data)=>{if(!res.destroyed){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}};
    // Same-origin only: no CORS, no arbitrary Host/DNS rebinding, no form-based execution.
    if(req.headers.host!==host||(req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site'){send(403,{error:{message:'仅允许本机网页访问。'}});return;}
    const url=new URL(req.url,origin);
    if(!url.pathname.startsWith('/api/native/')){serveStatic(req,res);return;}
    if(req.method==='GET'&&url.pathname==='/api/native/health'){
      const state=await checkSandbox();send(200,{available:state.available&&!isolationFault,isolation:state.isolation,message:isolationFault||state.message,token});return;
    }
    if(req.headers['x-algolab-token']!==token){send(403,{error:{message:'本机会话已失效，请刷新网页。'}});return;}
    if(req.method==='DELETE'&&/^\/api\/native\/run\/[\w-]{1,80}$/.test(url.pathname)){
      if(active?.id===url.pathname.split('/').at(-1))active.controller.abort();send(200,{stopped:true});return;
    }
    if(req.method!=='POST'||url.pathname!=='/api/native/run'){send(404,{error:{message:'接口不存在。'}});return;}
    if(active){send(409,{error:{message:'本机正在执行另一段代码，请等待或停止后重试。'}});return;}
    if(req.headers['content-type']?.split(';')[0]!=='application/json'){send(415,{error:{message:'需要 JSON 请求。'}});return;}
    const job={controller:new AbortController(),id:null};active=job;
    res.on('close',()=>{if(!res.writableEnded)job.controller.abort();});
    try{
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>160000){send(413,{error:{message:'请求过大。'}});return;}chunks.push(chunk);}
      let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{send(400,{error:{message:'请求格式错误。'}});return;}
      if(typeof data.code!=='string'||!data.code.trim()||data.code.length>24000||typeof data.input!=='string'||data.input.length>16000||typeof data.id!=='string'||!/^[-\w]{1,80}$/.test(data.id)){send(400,{error:{message:'代码、输入或执行编号无效。'}});return;}
      if(isolationFault){send(503,{steps:[],error:{message:isolationFault}});return;}
      job.id=data.id;const result=await runSandbox(data.code,data.input,{signal:job.controller.signal});
      if(result.cleanupFailed)isolationFault=result.error.message+' 确认清理后请重启服务。';
      send(200,result);
    }catch(error){send(500,{steps:[],error:{message:error.message}});}
    finally{if(active===job)active=null;}
  });
  server.on('close',()=>active?.controller.abort());
  server.stop=()=>{active?.controller.abort();server.close();};return server;
}
if(require.main===module){
  const server=createLocalServer(),port=Number(process.env.ALGOLAB_PORT||4173);
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'端口被占用，请先关闭原来的预览服务，或设置 ALGOLAB_PORT。':error.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>{console.log('代码实验室：http://127.0.0.1:'+server.address().port+'/extensions/code-lab/');console.log('C++ 仅在一次性 Docker 隔离容器内运行；容器未就绪时禁用执行。按 Ctrl+C 关闭。');});
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.stop());
}
module.exports={createLocalServer};
