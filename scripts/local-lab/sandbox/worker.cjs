const {traceCpp}=require('./trace.cjs');
(async()=>{
  const chunks=[];let size=0;for await(const chunk of process.stdin){size+=chunk.length;if(size>160000)throw Error('请求过大。');chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(typeof data.code!=='string'||data.code.length>24000||typeof data.input!=='string'||data.input.length>16000)throw Error('代码或输入无效。');
  if(!Number.isInteger(data.maxSteps)||data.maxSteps<1||data.maxSteps>2000||!Number.isInteger(data.maxTime)||data.maxTime<100||data.maxTime>60000)throw Error('执行限制无效。');
  const result=await traceCpp(data.code,data.input,{maxSteps:data.maxSteps,maxTime:data.maxTime});
  process.stdout.write(JSON.stringify(result));
})().catch(error=>{process.stdout.write(JSON.stringify({steps:[],error:{message:error.message},engine:'gdb',phase:'before'}));process.exitCode=1;});
