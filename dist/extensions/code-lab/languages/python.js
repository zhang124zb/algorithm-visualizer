(function(root){
  'use strict';
  function run(S,code,input=''){
    const steps=[],start=Date.now(),filename='main.py';let output='',bytes=0,lastLine=1,lastModuleLine=1,suspension,operations=0;
    if(typeof code!=='string'||code.length>24000||typeof input!=='string'||input.length>16000)return {steps,error:{message:'代码最多 24000 字符，输入最多 16000 字符。'}};
    const lines=code.replace(/\r\n?/g,'\n').split('\n'),inputLines=input.replace(/\r\n?/g,'\n').split('\n');let inputIndex=0;
    if(input.endsWith('\n'))inputLines.pop();if(!input)inputLines.length=0;
    const fail=message=>{throw new S.builtin.RuntimeError(message);};
    function push(frame){
      bytes+=JSON.stringify(frame).length*2;
      if(steps.length>=2000||bytes>12000000)fail('执行记录超过限制：最多 2000 步，请缩小数据或检查循环。');
      steps.push(frame);
    }
    function valueOf(v,depth=0){
      if(['list','tuple'].includes(v?.tp$name)&&depth<2){
        if(v.v.length>4096)fail('列表最多包含 4096 项。');
        const nested=v.v.some(x=>['list','tuple'].includes(x?.tp$name));
        return v.v.slice(0,nested||depth?16:64).map(x=>valueOf(x,depth+1));
      }
      if(v?.tp$name==='NoneType')return null;
      if(v?.tp$name==='bool')return !!v.v;
      if(['int','float','str'].includes(v?.tp$name))return typeof v.v==='object'?String(v.v):v.v;
      return v?.tp$name||'未知';
    }
    function variables(locals){
      return Object.entries(locals||{}).filter(([name,v])=>!name.startsWith('$')&&!['__name__','__file__','__package__','__doc__','__path__'].includes(name)&&v&&['int','float','str','bool','NoneType','list','tuple'].includes(v.tp$name)).slice(0,64).map(([name,v])=>{
        const item={name:name.replace(/_\$rw\$$/,''),type:v.tp$name,value:valueOf(v)};
        if(['list','tuple'].includes(v.tp$name)){item.length=v.v.length;if(v.v[0]?.v&&Array.isArray(v.v[0].v))item.columns=v.v[0].v.length;}
        return item;
      });
    }
    function activeFrames(s){
      const frames=[];for(let node=s;node;node=node.child)if(node.$filename===filename&&node.$lineno)frames.push(node);
      return frames;
    }
    let functions=[],namesByLine=new Map();
    function readAst(){
      const parsed=S.parse(filename,code),ast=S.astFromParse(parsed.cst,filename,parsed.flags);
      function walk(node){
        if(!node||typeof node!=='object')return 0;
        if(Array.isArray(node))return Math.max(0,...node.map(walk));
        if(!node._astname)return 0;
        let end=node.lineno||0;
        if(node._astname==='Name'){
          const name=node.id?.v||node.id;let names=namesByLine.get(node.lineno);if(!names)namesByLine.set(node.lineno,names=new Set());names.add(name);
        }
        for(const [key,value]of Object.entries(node))if(!['ctx','lineno','col_offset'].includes(key))end=Math.max(end,walk(value));
        if(node._astname==='FunctionDef')functions.push({name:node.name.v||node.name,start:node.lineno,end});
        return end;
      }
      walk(ast);
    }
    function snapshot(s){
      const raw=activeFrames(s);if(raw.length>64)fail('递归调用超过 64 层。');
      lastModuleLine=raw[0]?.$lineno||lastModuleLine;
      const frames=raw.map((f,i)=>({name:i===0?'模块':functions.filter(fn=>fn.start<=f.$lineno&&fn.end>=f.$lineno).sort((a,b)=>b.start-a.start)[0]?.name||'函数',variables:variables({...f.$loc,...Object.fromEntries(Object.entries(f.$tmps||{}).filter(([key])=>!key.startsWith('$')))} )}));
      const globals=variables(raw[0]?.$gbl||S.globals),current=frames.at(-1)?.variables||globals;
      const vars=[...globals.filter(g=>!current.some(v=>v.name===g.name)),...current];
      const line=raw.at(-1)?.$lineno||lastLine;
      return {line,variables:vars,stack:frames,accessed:vars.filter(v=>Array.isArray(v.value)&&namesByLine.get(line)?.has(v.name)).map(v=>v.name),output,phase:'before',message:'即将执行第 '+line+' 行：'+(lines[line-1]||'').trim().slice(0,110)};
    }
    try{
      S.configure({__future__:S.python3,debugging:true,breakpoints:()=>{if(++operations>200000)fail('执行超过教学模式操作限制。');return true;},execLimit:5000,yieldLimit:null,syspath:[],output:text=>{if(output.length+text.length>16000)fail('输出超过 16000 字符。');output+=text;},inputfun:prompt=>{
        if(prompt){if(output.length+prompt.length>16000)fail('输出超过 16000 字符。');output+=prompt;}if(inputIndex>=inputLines.length)throw new S.builtin.EOFError('标准输入不足，请检查输入数据。');return inputLines[inputIndex++];
      },inputfunTakesPrompt:true,read:file=>{
        if(!/^src\/(?:builtin|lib)\/(?:sys|math|random|_random|_strptime|time)(?:\.js|\.py)$/.test(file)||!Object.hasOwn(S.builtinFiles.files,file))throw new S.builtin.ImportError('教学模式暂不支持此模块：'+file);
        return S.builtinFiles.files[file];
      }});
      S.execStart=Date.now();
      // shortcut: Skulpt supplies Python 3 teaching semantics; use CPython for complete modern Python support.
      for(const key of ['numberBinOp','numberInplaceBinOp']){
        const old=S.abstr[key];if(old.labGuard)continue;
        const guarded=function(a,b,op){
          const seq=['list','tuple','str'].includes(a?.tp$name)?a:['list','tuple','str'].includes(b?.tp$name)?b:null;
          if(seq&&['Mult','Add'].includes(op)){
            const max=seq.tp$name==='str'?16000:4096,other=seq===a?b:a;
            const size=op==='Mult'?seq.v.length*Number(S.misceval.asIndexSized(other)):seq.v.length+(other?.v?.length||0);
            if(size>max)fail('列表或字符串大小超过教学模式限制。');
          }
          if(op==='Pow'&&Number(b?.v)>10000)fail('幂运算规模超过教学模式限制。');
          return old.call(this,a,b,op);
        };guarded.labGuard=true;S.abstr[key]=guarded;
      }
      const rangePrototype=S.builtin.range_.prototype;
      if(!rangePrototype.tp$new.labGuard){
        const old=rangePrototype.tp$new,guarded=function(args,kwargs){
          const nums=args.map(v=>Number(S.misceval.asIndexSized(v))),from=nums.length===1?0:nums[0],to=nums.length===1?nums[0]:nums[1],step=nums[2]??1;
          if(step&&Math.max(0,Math.ceil((to-from)/step))>4096)fail('range 最多生成 4096 项。');return old.call(this,args,kwargs);
        };guarded.labGuard=true;rangePrototype.tp$new=guarded;
      }
      readAst();suspension=S.importMainWithBody('main',false,code,true);
      while(suspension instanceof S.misceval.Suspension){
        if(Date.now()-start>5000)fail('执行超过 5 秒，已停止。');
        if(!['Sk.debug','Sk.delay'].includes(suspension.data?.type))fail('教学模式暂不支持异步调用。');
        const frame=snapshot(suspension);lastLine=frame.line;
        if(frame.stack.length){
          const previous=steps.at(-1);
          if(!previous||frame.line!==previous.line||frame.output!==previous.output||JSON.stringify(frame.variables)!==JSON.stringify(previous.variables)||JSON.stringify(frame.stack)!==JSON.stringify(previous.stack))push(frame);
        }
        suspension=suspension.resume();
      }
      const vars=variables(S.globals);push({line:lastModuleLine,variables:vars,stack:[{name:'模块',variables:vars}],accessed:[],output,finished:true,message:'执行完成，可回退查看任意一步。'});
      return {steps,exitCode:0,output,elapsed:Date.now()-start,phase:'before'};
    }catch(error){
      const message=String(error.toString?.()||error.message||error).slice(0,2400);
      const line=error.traceback?.find(t=>t.filename===filename)?.lineno||error.lineno||Number(message.match(/line\s+(\d+)/i)?.[1])||lastLine;
      const info={line,message};
      if(steps.length)steps.push({...steps.at(-1),line,output,error:true,message:'执行在这里停止：'+info.message});
      return {steps,output,error:info,elapsed:Date.now()-start,phase:'before'};
    }
  }
  root.PythonLab={run};
})(typeof self==='undefined'?globalThis:self);
