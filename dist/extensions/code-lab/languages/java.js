(function(root){
  'use strict';
  function run(J,code,input=''){
    const steps=[],start=Date.now();let evaluator,bytes=0,lastLine=1,lastSignature='',active=null,lastMainEnv=null,frames=[];
    if(typeof code!=='string'||code.length>24000||typeof input!=='string'||input.length>16000)return {steps,error:{message:'代码最多 24000 字符，输入最多 16000 字符。'}};
    const lines=code.replace(/\r\n?/g,'\n').split('\n');input=input.replace(/\r\n?/g,'\n');let cursor=0,allocations=0;
    const fail=message=>{throw Error(message);};
    const output=()=>evaluator?.output.join('')||'';
    function plain(value,depth=0){
      if(value?.javaType==='array'&&depth<2)return value.value.slice(0,depth||value.value.some(v=>v?.javaType==='array')?16:64).map(v=>plain(v,depth+1));
      return value?.javaType==='array'?'数组':value?.value??null;
    }
    function variables(env){
      const scopes=[];for(let e=env;e;e=e.parent)scopes.unshift(e);
      const values=new Map();for(const scope of scopes)for(const [name,v]of scope.vars)if(v?.javaType!=='Scanner'&&!(name==='args'&&v?.javaType==='array'&&!v.value.length))values.set(name,v);
      return [...values].slice(0,64).map(([name,v])=>{
        const item={name,type:v.javaType,value:plain(v)};if(v.javaType==='array'){item.length=v.value.length;if(v.value[0]?.javaType==='array')item.columns=v.value[0].value.length;}
        return item;
      });
    }
    function record(node,env,line=node.line){
      if(!line)return active;lastLine=line;
      if(frames.length)frames.at(-1).env=env;
      if(frames.length===1)lastMainEnv=env;
      const frame={line,variables:variables(env),stack:frames.map(f=>({name:f.name,variables:variables(f.env)})),accessed:[],output:output(),phase:'before',message:'即将执行第 '+line+' 行：'+(lines[line-1]||'').trim().slice(0,110)};
      const signature=JSON.stringify([frame.line,frame.variables,frame.stack,frame.output]);
      if(signature===lastSignature)return steps.at(-1);
      bytes+=signature.length*2;
      if(steps.length>=2000||bytes>12000000)fail('执行记录超过限制：最多 2000 步，请检查循环或缩小数据。');
      steps.push(frame);lastSignature=signature;return frame;
    }
    function accessed(name){if(active&&!active.accessed.includes(name))active.accessed.push(name);}
    function token(){
      const match=/\S+/.exec(input.slice(cursor));if(!match)fail('标准输入不足。');cursor+=match.index+match[0].length;return match[0];
    }
    function scannerCall(receiver,name){
      if(receiver.value.closed&&name!=='close')fail('Scanner 已关闭。');
      if(name==='close'){receiver.value.closed=true;return J.mkVoid();}
      if(name==='hasNext')return J.mkBool(/\S/.test(input.slice(cursor)));
      if(name==='hasNextInt'){const m=/\S+/.exec(input.slice(cursor));return J.mkBool(!!m&&/^[+-]?\d+$/.test(m[0])&&Number(m[0])>=-2147483648&&Number(m[0])<=2147483647);}
      if(name==='nextLine'){if(cursor>=input.length)fail('标准输入不足。');let end=input.indexOf('\n',cursor);if(end<0)end=input.length;const value=input.slice(cursor,end);cursor=end<input.length?end+1:end;return J.mkString(value);}
      if(name==='next')return J.mkString(token());
      if(name==='nextInt'){const text=token(),n=Number(text);if(!/^[+-]?\d+$/.test(text)||!Number.isInteger(n)||n< -2147483648||n>2147483647)fail('Scanner.nextInt 输入格式或范围错误。');return J.mkInt(n);}
      if(name==='nextDouble'){const n=Number(token());if(!Number.isFinite(n))fail('Scanner.nextDouble 输入格式错误。');return J.mkDouble(n);}
      if(name==='nextBoolean'){const text=token().toLowerCase();if(!['true','false'].includes(text))fail('Scanner.nextBoolean 输入格式错误。');return J.mkBool(text==='true');}
      fail('教学模式不支持 Scanner.'+name+'。');
    }
    try{
      let tokens=new J.Lexer(code).tokenize();
      while(tokens[0]?.value==='import'){
        const end=tokens.findIndex(t=>t.value===';');if(end<0)fail('import 缺少分号。');
        const name=tokens.slice(1,end).map(t=>t.value).join('');if(!['java.util.Scanner','java.util.Arrays'].includes(name))fail('教学模式只支持 import java.util.Scanner / Arrays。');tokens=tokens.slice(end+1);
      }
      const parser=new J.Parser(tokens);
      for(const name of Object.getOwnPropertyNames(J.Parser.prototype)){
        if(!/^(parse[A-Z]|expression$|assignment$|ternary$|logical|equality$|comparison$|addition$|multiplication$|unary$|postfix$|primary$)/.test(name))continue;
        const old=parser[name];parser[name]=function(...args){const line=this.peek().line;const value=old.apply(this,args);if(value&&value.type)value.line??=line;return value;};
      }
      const ast=parser.parse();if(ast.body.length!==1)fail('教学模式目前支持单个类。');
      if(ast.body[0].superclass||ast.body[0].interfaces.length)fail('教学模式暂不支持继承和接口。');
      const bodies=new Map(),loopPoints=new Map();
      function walk(node){
        if(!node||typeof node!=='object')return;
        if(Array.isArray(node)){node.forEach(walk);return;}
        if(node.type==='MethodDeclaration'){if(!node.isStatic)fail('教学模式只支持 static 方法。');bodies.set(node.body,node.name);}
        if(node.type==='TypeAnnotation'&&(node.generic||!['int','double','boolean','char','String','void','Scanner'].includes(node.name)))fail('教学模式不支持该类型：'+node.name);
        if(['ForStatement','WhileStatement','DoWhileStatement'].includes(node.type)){if(node.condition)loopPoints.set(node.condition,node.line);if(node.update)loopPoints.set(node.update,node.line);}
        for(const [key,value]of Object.entries(node))if(key!=='line')walk(value);
      }
      walk(ast);evaluator=new J.Evaluator({timeout:200000});
      const tick=evaluator.tick;
      evaluator.tick=function(){if(Date.now()-start>5000)fail('执行超过 5 秒，已停止。');if(output().length>16000)fail('输出超过 16000 字符。');return tick.call(this);};
      const block=evaluator.executeBlock;
      evaluator.executeBlock=function(node,env){
        const method=bodies.get(node);if(method){if(frames.length>=64)fail('递归调用超过 64 层。');frames.push({name:method,env});}
        try{return block.call(this,node,env);}finally{if(method)frames.pop();}
      };
      const statement=evaluator.executeStatement;
      evaluator.executeStatement=function(node,env){
        const previous=active;
        if(!['BlockStatement','ForStatement','WhileStatement','DoWhileStatement'].includes(node.type))active=record(node,env);
        try{return statement.call(this,node,env);}finally{active=previous;}
      };
      const evaluate=evaluator.evaluate;
      evaluator.evaluate=function(node,env){
        this.tick();const previous=active;
        if(loopPoints.has(node))active=record(node,env,loopPoints.get(node));
        try{
          if(node.type==='NewExpression'){
            if(node.className!=='Scanner'||node.args.length!==1)fail('教学模式只支持 new Scanner(System.in)。');
            const a=node.args[0];if(a.type!=='MemberExpression'||a.object.name!=='System'||a.property!=='in')fail('Scanner 只能读取标准输入 System.in。');return {javaType:'Scanner',value:{closed:false}};
          }
          if(node.type==='ArrayCreationExpression'){
            const sizes=node.dimensions.map(n=>J.raw(this.evaluate(n,env))),cells=sizes.reduce((a,b)=>a*b,1);
            if(sizes.length>2||sizes.some(n=>!Number.isSafeInteger(n)||n<0||n>4096)||cells>4096)fail('数组最多 4096 个元素，最多二维。');
            allocations+=cells+sizes[0];if(allocations>100000)fail('数组分配超过教学模式限制。');
            const leaf=()=>({...this.defaultValue(node.elementType)});
            return J.mkArray(sizes.length===1?Array.from({length:sizes[0]},leaf):Array.from({length:sizes[0]},()=>J.mkArray(Array.from({length:sizes[1]},leaf))));
          }
          if(node.type==='ArrayInitializerExpression'&&node.elements.length>4096)fail('数组最多 4096 个元素。');
          const value=evaluate.call(this,node,env);
          if(node.type==='Identifier'&&value?.javaType==='array')accessed(node.name);
          if(value?.javaType==='int'&&(!Number.isInteger(value.value)||value.value< -2147483648||value.value>2147483647))fail('本教学模式暂不支持 int 溢出，请缩小数值。');
          return value;
        }finally{if(loopPoints.has(node))active=previous;}
      };
      const call=evaluator.evaluateCall;
      evaluator.evaluateCall=function(node,env){
        const callee=node.callee;
        if(callee.type==='MemberExpression'&&callee.object.type==='Identifier'){
          if(callee.object.name===ast.body[0].name&&this.methods.has(callee.property))return this.callMethod(this.methods.get(callee.property),node.args,env);
          if(callee.object.name==='Arrays'){
            const args=node.args.map(a=>this.evaluate(a,env)),array=args[0];if(array?.javaType!=='array')fail('Arrays 方法需要数组参数。');
            if(callee.property==='toString')return J.mkString('['+array.value.map(J.javaToString).join(', ')+']');
            if(callee.property==='sort'){if(array.value.some(v=>['boolean','null','array'].includes(v.javaType)))fail('Arrays.sort 目前支持数字、字符或字符串数组。');array.value.sort((a,b)=>typeof a.value==='number'?a.value-b.value:a.value<b.value?-1:a.value>b.value?1:0);return J.mkVoid();}
            fail('教学模式不支持 Arrays.'+callee.property+'。');
          }
          let receiver;for(let e=env;e&&!receiver;e=e.parent)receiver=e.vars.get(callee.object.name);
          if(receiver?.javaType==='Scanner'){if(node.args.length)fail('此 Scanner 方法不接受参数。');return scannerCall(receiver,callee.property);}
        }
        return call.call(this,node,env);
      };
      const bounds=evaluator.boundsCheck;evaluator.boundsCheck=function(arr,index){if(!Number.isInteger(index))fail('数组下标必须是整数。');return bounds.call(this,arr,index);};
      evaluator.run(ast);
      if(output().length>16000)fail('输出超过 16000 字符。');
      const vars=variables(lastMainEnv);steps.push({line:lastLine,variables:vars,stack:[{name:'main',variables:vars}],accessed:[],output:output(),finished:true,message:'执行完成，可回退查看任意一步。'});
      return {steps,exitCode:0,output:output(),elapsed:Date.now()-start,phase:'before'};
    }catch(error){
      const message=String(error.message||error).slice(0,2400),match=message.match(/(?:line|行)\s*(\d+)/i);
      const info={message,line:match?Number(match[1]):lastLine};
      if(steps.length)steps.push({...steps.at(-1),line:info.line,output:output(),error:true,message:'执行在这里停止：'+message});
      return {steps,output:output(),error:info,elapsed:Date.now()-start,phase:'before'};
    }
  }
  root.JavaLab={run};
})(typeof self==='undefined'?globalThis:self);
