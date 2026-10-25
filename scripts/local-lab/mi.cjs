const {spawn}=require('node:child_process');

// GDB/MI strings use C escapes, including octal UTF-8 bytes.
function parseRecord(line){
  const match=line.match(/^(\d*)([\^*+=~@&])(.*)$/);if(!match)return null;
  let text=match[3],at=0;
  function string(){
    at++;const bytes=[];
    while(at<text.length){let c=text[at++];if(c==='"')break;
      if(c==='\\'){c=text[at++];const oct=c+text.slice(at).match(/^[0-7]{0,2}/)?.[0];
        if(/[0-7]/.test(c)){bytes.push(parseInt(oct,8));at+=oct.length-1;continue;}
        c=({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f',v:'\v',a:'\x07'})[c]??c;}
      bytes.push(...Buffer.from(c));
    }return Buffer.from(bytes).toString('utf8');
  }
  function key(){const start=at;while(at<text.length&&/[\w-]/.test(text[at]))at++;return text.slice(start,at);}
  function value(){
    if(text[at]==='"')return string();
    if(text[at]==='{'){at++;const obj={};while(at<text.length&&text[at]!=='}'){const k=key();if(text[at++]!=='=')throw Error('Invalid MI object');obj[k]=value();if(text[at]===',')at++;}at++;return obj;}
    if(text[at]==='['){at++;const list=[];while(at<text.length&&text[at]!==']'){
      const start=at;key();if(text[at]==='=')at++;else at=start;list.push(value());if(text[at]===',')at++;
    }at++;return list;}
    const start=at;while(at<text.length&&!/[,}\]]/.test(text[at]))at++;return text.slice(start,at);
  }
  if('~@&'.includes(match[2]))return {kind:match[2],value:value()};
  const cls=key(),data={};while(at<text.length){if(text[at++]!==',')break;const k=key();if(text[at++]!=='=')throw Error('Invalid MI result');data[k]=value();}
  return {token:Number(match[1]),kind:match[2],cls,data};
}

class Gdb{
  constructor(command,cwd,signal){
    this.sequence=0;this.pending=new Map();this.stops=[];this.waiters=[];this.buffer='';
    // MI 3 emits multi-location breakpoints as a valid locations list (MI 2 does not).
    this.child=spawn(command,['--quiet','--nx','--interpreter=mi3'],{cwd,windowsHide:true,detached:process.platform!=='win32',stdio:['pipe','pipe','pipe']});
    this.closed=new Promise(resolve=>this.child.once('close',resolve));
    this.child.stdout.setEncoding('utf8');this.child.stderr.resume();
    this.child.stdout.on('data',chunk=>{this.buffer+=chunk;if(this.buffer.length>1e6){this.fail(Error('调试器输出过多。'));return;}
      let i;while((i=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,i).replace(/\r$/,'');this.buffer=this.buffer.slice(i+1);
        let record;try{record=parseRecord(line);}catch{this.fail(Error('调试器返回了无法读取的数据。'));return;}if(!record)continue;
        if(record.kind==='^'){const pending=this.pending.get(record.token);if(pending){this.pending.delete(record.token);record.cls==='error'?pending.reject(Error(record.data.msg||'GDB command failed')):pending.resolve(record.data);}}
        if(record.kind==='*'&&record.cls==='stopped'){const waiter=this.waiters.shift();if(waiter)waiter.resolve(record.data);else this.stops.push(record.data);}
      }
    });
    this.child.on('error',error=>this.fail(Error('无法启动 GDB：'+error.message)));
    this.child.once('close',()=>this.fail(Error('调试器已关闭。')));
    this.child.stdin.on('error',()=>{});
    this.abort=()=>this.fail(Error('执行已停止或超时。'));signal.addEventListener('abort',this.abort,{once:true});
    this.closed.then(()=>signal.removeEventListener('abort',this.abort));
  }
  command(command){
    if(this.failure)return Promise.reject(this.failure);
    const token=++this.sequence;return new Promise((resolve,reject)=>{this.pending.set(token,{resolve,reject});this.child.stdin.write(token+command+'\n');});
  }
  async resume(command){
    if(this.failure)throw this.failure;
    const stopped=this.stops.length?Promise.resolve(this.stops.shift()):new Promise((resolve,reject)=>this.waiters.push({resolve,reject}));
    // Install the stop listener before sending a command; short programs can stop immediately.
    try{await this.command(command);}catch(error){this.fail(error);}return stopped;
  }
  fail(error){
    if(this.failure)return;this.failure=error;
    for(const p of this.pending.values())p.reject(error);this.pending.clear();for(const p of this.waiters)p.reject(error);this.waiters=[];
    killTree(this.child);
  }
  async close(){this.fail(Error('调试完成。'));await this.closed;}
}
function killTree(child){
  if(!child?.pid||child.exitCode!==null)return;
  if(process.platform==='win32'){const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.on('error',()=>child.kill());killer.on('close',code=>{if(code!==0)child.kill();});}
  else{try{process.kill(-child.pid,'SIGKILL');}catch{child.kill('SIGKILL');}}
}
module.exports={parseRecord,Gdb,killTree};
