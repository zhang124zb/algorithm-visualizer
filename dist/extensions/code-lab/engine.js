(function(root){
  'use strict';
  const LIMITS={code:24000,input:16000,steps:2000,operations:200000,output:16000,bytes:12000000};
  const STREAM_ALIASES={cin:'__i',cout:'__o',endl:'__e'};
  const BITS_HEADER='__algolab_all';
  const BITS_LIBRARIES=[['iostream'],['cmath','math.h'],['cctype','ctype.h'],['cstring','string.h'],['iomanip']];
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
        const container=root.CppLabSTL?.snapshot(variable);
        if(container){
          const item={name,type:container.type||debug.rt.makeTypeString(variable.t),...container};
          const old=frame.variables.findIndex(v=>v.name===name);
          if(old>=0)frame.variables[old]=item;else if(frame.variables.length<64)frame.variables.push(item);
          continue;
        }
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
    return {message,line:Number.isInteger(error?.line)&&error.line>0?error.line:match?Number(match[1]):line||null};
  }
  function prepareSource(code){
    // Keep offsets and newlines intact so replay and parser errors still refer to the editor.
    const sourceTokens=[...code.matchAll(/^[\t ]*#(?:\\\n|[^\n])*|\/\/(?:\\\n|[^\n])*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))|R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|"(?:\\[\s\S]|[^"\\])*(?:"|$)|'(?:\\[\s\S]|[^'\\])*(?:'|$)|[A-Za-z_]\w*|::|->|[^\s]/gm)];
    const tokens=sourceTokens.filter(token=>!/^\s*#|^\/[/\*]/.test(token[0]));
    const chars=code.split(''),text=i=>tokens[i]?.[0];
    const erase=(start,end)=>{for(let i=start;i<end;i++)if(chars[i]!=='\n')chars[i]=' ';};
    // The upstream preprocessor only accepts simple header names; this alias has equal length.
    for(const token of sourceTokens){
      const include=/^([\t ]*#[\t ]*include[\t ]*)(?:<([^<>\n]+)>|"([^"\n]+)")(?=[\t ]*(?:\/[/\*]|$))/.exec(token[0]);
      if(!include)continue;
      const name=include[2]||include[3],start=token.index+include[1].length;
      if(name==='bits/stdc++.h')for(let i=0;i<BITS_HEADER.length;i++)chars[start+1+i]=BITS_HEADER[i];
      if(name==='bits/stdc++.h'||BITS_LIBRARIES.some(headers=>headers.includes(name))){chars[start]='<';chars[start+name.length+1]='>';}
    }
    for(let i=0;i<tokens.length;i++){
      if(['::','.','->'].includes(text(i-1)))continue;
      const qualified=text(i)==='std'&&text(i+1)==='::',name=i+(qualified?2:0);
      let end=-1;
      // Browser I/O is already immediate; these standalone buffering settings have no effect here.
      if(['{','}',';'].includes(text(i-1))){
        if(['ios','ios_base'].includes(text(name))&&text(name+1)==='::'&&text(name+2)==='sync_with_stdio'&&text(name+3)==='('&&['false','true','0','1'].includes(text(name+4))&&text(name+5)===')'&&text(name+6)===';')end=name+6;
        if(['cin','cout'].includes(text(name))&&text(name+1)==='.'&&text(name+2)==='tie'&&text(name+3)==='('&&['nullptr','NULL','0'].includes(text(name+4))&&text(name+5)===')'&&text(name+6)===';')end=name+6;
      }
      if(end>=0){erase(tokens[i].index,tokens[end].index);i=end;continue;}
      if(qualified&&Object.hasOwn(STREAM_ALIASES,text(name))){
        erase(tokens[i].index,tokens[name].index+text(name).length);
        for(const [offset,char]of [...STREAM_ALIASES[text(name)]].entries())chars[tokens[name].index+offset]=char;
      }
    }
    return chars.join('');
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
      const source=prepareSource(lines.join('\n')),prepared=root.CppLabSTL?.prepare(source);
      const iostream=runtime.includes.iostream,iomanip=runtime.includes.iomanip,bitsHeader=runtime.includes[BITS_HEADER];
      // Reserved aliases keep qualified standard streams independent of local cin/cout names.
      runtime.includes.iostream={load(rt){
        iostream.load(rt);
        for(const [name,alias]of Object.entries(STREAM_ALIASES))rt.scope[0].variables[alias]=rt.scope[0].variables[name];
      }};
      runtime.includes.iomanip={load(rt){rt.include('iostream');iomanip.load(rt);}};
      // shortcut: aggregate only the interpreter's existing libraries; full STL needs the native mode.
      runtime.includes[BITS_HEADER]={load(rt){
        for(const headers of BITS_LIBRARIES){
          const loaded=rt.config.loadedLibraries;
          if(!headers.some(name=>loaded.includes(name)))rt.include(headers[0]);
          for(const name of headers)if(!loaded.includes(name))loaded.push(name);
        }
      }};
      let restoreSTL;
      try{
        restoreSTL=prepared?root.CppLabSTL.install(runtime,prepared):null;
        debug=runtime.run(prepared?.code||source,input,{debug:true,stdio:{write(text){
          if(output.length+text.length>LIMITS.output)throw Error('输出超过 16000 个字符，请检查输出循环。');
          output+=text;
        }}});
      }finally{
        restoreSTL?.();
        runtime.includes.iostream=iostream;
        runtime.includes.iomanip=iomanip;
        if(bitsHeader===undefined)delete runtime.includes[BITS_HEADER];else runtime.includes[BITS_HEADER]=bitsHeader;
      }
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
          if(pending?.type==='IdentifierExpression'&&state.variables.some(v=>v.name===pending.Identifier&&(Array.isArray(v.value)||v.kind)))accessed.add(pending.Identifier);
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
  root.CppLab={LIMITS,snapshot,run,errorInfo,prepareSource};
})(typeof self==='undefined'?globalThis:self);
