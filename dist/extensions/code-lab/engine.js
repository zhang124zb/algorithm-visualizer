(function(root){
  'use strict';
  const LIMITS={code:24000,input:16000,steps:2000,operations:200000,output:16000,bytes:12000000};
  function snapshot(debug){
    const frames=[{name:'全局',variables:[]}];
    function valueOf(variable,depth=0){
      if(variable.t.type==='primitive')return typeof variable.v==='number'&&!Number.isFinite(variable.v)?'未初始化':variable.v;
      if(variable.t.ptrType==='array'&&depth<2){
        const max=variable.t.eleType?.ptrType==='array'?16:depth?16:64;
        return variable.v.target.slice(variable.v.position,variable.v.position+max).map(v=>valueOf(v,depth+1));
      }
      return variable.v?.target===null?'nullptr':'指针';
    }
    for(const scope of debug.rt.scope){
      if(scope.$name.startsWith('function '))frames.push({name:scope.$name.slice(9),variables:[]});
      const frame=frames[frames.length-1];
      for(const [name,variable] of Object.entries(scope.variables)){
        if(!variable||!variable.t||variable.left===false||!['primitive','pointer'].includes(variable.t.type)||variable.t.ptrType==='function')continue;
        const item={name,type:debug.rt.makeTypeString(variable.t),value:valueOf(variable)};
        if(variable.t.ptrType==='array'){
          item.length=variable.v.target.length-variable.v.position;
          if(variable.t.eleType?.ptrType==='array')item.columns=variable.t.eleType.size;
        }
        const old=frame.variables.findIndex(v=>v.name===name);
        if(old>=0)frame.variables[old]=item;else if(frame.variables.length<64)frame.variables.push(item);
      }
    }
    const globals=frames[0].variables,current=frames.length>1?frames[frames.length-1].variables:[];
    const variables=[...globals.filter(g=>!current.some(v=>v.name===g.name)),...current];
    return {variables,stack:frames.slice(1)};
  }
  function errorInfo(error,line){
    const message=String(error?.message||error).slice(0,2400);
    const match=message.match(/(?:^|\n)(\d+):\d+/)||message.match(/line\s+(\d+)/i)||message.match(/Line\s+(\d+)/);
    return {message,line:match?Number(match[1]):line||null};
  }
  function run(runtime,code,input=''){
    const start=Date.now(),steps=[];let debug,output='',lastLine=1,operations=0,bytes=0,exitCode=null;
    if(typeof code!=='string'||code.length>LIMITS.code)return {steps,error:{message:'代码最多 24000 个字符。',line:null}};
    if(typeof input!=='string'||input.length>LIMITS.input)return {steps,error:{message:'标准输入最多 16000 个字符。',line:null}};
    const lines=code.replace(/\r\n?/g,'\n').split('\n');
    function push(line,state,extra={}){
      const frame={line:Math.max(1,Math.min(lines.length,line||lastLine)),...state,output,...extra};
      bytes+=JSON.stringify(frame).length*2;
      if(steps.length>=LIMITS.steps||bytes>LIMITS.bytes)throw Error('执行记录超过限制：最多 2000 步，请缩小数据或检查循环。');
      steps.push(frame);
    }
    try{
      debug=runtime.run(lines.join('\n'),input,{debug:true,stdio:{write(text){
        if(output.length+text.length>LIMITS.output)throw Error('输出超过 16000 个字符，请检查输出循环。');
        output+=text;
      }}});
      let exiting=null;
      const exitScope=debug.rt.exitScope;
      debug.rt.exitScope=function(...args){
        // Capture final values before a block's locals disappear from the runtime.
        if(!exiting)exiting=snapshot(debug);
        return exitScope.apply(this,args);
      };
      debug.next();
      let pending=debug.nextNode(),state=snapshot(debug);
      push(pending?.sLine||1,state,{initial:true,message:'程序已进入 main，点击下一步执行黄色标记行。'});
      while(!debug.done){
        const line=pending?.sLine>0?pending.sLine:lastLine;
        lastLine=line;const stackDepth=state.stack.length,accessed=new Set();let result;
        do{
          if(++operations>LIMITS.operations)throw Error('执行超过限制：请检查循环是否结束。');
          if(pending?.type==='IdentifierExpression'&&state.variables.some(v=>v.name===pending.Identifier&&Array.isArray(v.value)))accessed.add(pending.Identifier);
          exiting=null;result=debug.next();state=snapshot(debug);pending=debug.nextNode();
        }while(!debug.done&&pending?.sLine===line&&state.stack.length===stackDepth);
        if(exiting)state=exiting;
        const action=state.stack.length>stackDepth?'第 '+line+' 行调用 '+state.stack.at(-1).name+'，进入函数。':'执行到第 '+line+' 行：'+lines[line-1].trim().slice(0,110);
        push(line,state,{accessed:[...accessed],message:action});
        if(debug.done)exitCode=typeof result==='object'?result?.v:result;
        else state=snapshot(debug);
      }
      push(lastLine,steps.at(-1)||snapshot(debug),{finished:true,message:'执行完成，退出码 '+exitCode+'。可回退查看任意一步。'});
      return {steps,exitCode,output,elapsed:Date.now()-start};
    }catch(error){
      const info=errorInfo(error,debug?.nextNode()?.sLine||lastLine);
      if(steps.length){
        const frame={...steps.at(-1),line:info.line||lastLine,output,error:true,message:'执行在这里停止：'+info.message};
        steps.push(frame);
      }
      return {steps,output,error:info,elapsed:Date.now()-start};
    }
  }
  root.CppLab={LIMITS,snapshot,run,errorInfo};
})(typeof self==='undefined'?globalThis:self);
