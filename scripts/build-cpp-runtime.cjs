// Run the documented one-time vendor preparation before rebuilding this file.
// shortcut: JSCPP covers teaching C++; replace with a compiler/debugger when full STL support is required.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),modules=path.join(root,'artifacts/jscpp-build/node_modules');
const esbuild=require(path.join(modules,'esbuild'));
const dest=path.join(root,'dist/extensions/code-lab/vendor');fs.mkdirSync(dest,{recursive:true});
const entry=`
const C=require('JSCPP/lib/launcher').default;
const {CRuntime}=require('JSCPP/lib/rt');
const {Interpreter}=require('JSCPP/lib/interpreter');
const allowed=['iostream','cmath','cctype','cstring','iomanip','math.h','ctype.h','string.h'];
for(const name of Object.keys(C.includes))if(!allowed.includes(name))delete C.includes[name];
let budget;
const visit=Interpreter.prototype.visit;
Interpreter.prototype.visit=function*(...args){
  if(++budget.operations>200000||Date.now()-budget.start>5000)throw Error('执行超过限制：请缩小数据或检查循环。');
  return yield* visit.apply(this,args);
};
const arrayType=CRuntime.prototype.arrayPointerType;
CRuntime.prototype.arrayPointerType=function(type,size){
  let cells=size,t=type;
  while(t&&t.ptrType==='array'){cells*=t.size;t=t.eleType;}
  if(!Number.isSafeInteger(size)||size<0||cells>4096)throw Error('数组最多包含 4096 个元素。');
  return arrayType.call(this,type,size);
};
const arrayInit=Interpreter.prototype.arrayInit;
Interpreter.prototype.arrayInit=function*(dimensions,...args){
  const cells=dimensions.reduce((a,b)=>a*b,1);
  if(!Number.isSafeInteger(cells)||cells<0||cells>4096)throw Error('数组最多包含 4096 个元素。');
  return yield* arrayInit.call(this,dimensions,...args);
};
const defaultValue=CRuntime.prototype.defaultValue;
CRuntime.prototype.defaultValue=function(...args){
  if(++budget.allocations>100000)throw Error('变量分配超过实验室限制。');
  return defaultValue.apply(this,args);
};
const enterScope=CRuntime.prototype.enterScope;
CRuntime.prototype.enterScope=function(...args){
  if(this.scope.length>128)throw Error('递归或嵌套层数超过限制。');
  return enterScope.apply(this,args);
};
const run=C.run;
C.run=function(...args){budget={operations:0,allocations:0,start:Date.now()};return run.apply(C,args);};
module.exports=C;
`;
(async()=>{
await esbuild.build({stdin:{contents:entry,resolveDir:modules,sourcefile:'cpp-lab-runtime.js'},bundle:true,minify:true,platform:'browser',format:'iife',globalName:'CppRuntime',outfile:path.join(dest,'cpp-runtime.js'),legalComments:'none',plugins:[{
  name:'exclude-unused-host-libraries',setup(build){
    build.onResolve({filter:/\/includes\/(?:cstdlib|cstdio|ctime|dummy_class_foo)$/},()=>({path:'unsupported',namespace:'lab'}));
    build.onLoad({filter:/.*/,namespace:'lab'},()=>({contents:'module.exports={load(){throw Error("此头文件暂不支持。")}}',loader:'js'}));
  }
}]});
const licenses=['JSCPP','lodash','pegjs-util'].map(name=>{
  const dir=path.join(modules,name),file=fs.readdirSync(dir).find(n=>/^licen[sc]e(?:\.|$)/i.test(n));
  const text=file?fs.readFileSync(path.join(dir,file),'utf8'):fs.readFileSync(path.join(dir,'PEGUtil.js'),'utf8').match(/\/\*[\s\S]*?\*\//)?.[0];
  if(!text)throw Error('Missing license for '+name);
  return name+'\n'+text;
}).join('\n\n'+'='.repeat(72)+'\n\n');
fs.writeFileSync(path.join(dest,'LICENSES.txt'),licenses);
console.log('Vendored JSCPP 2.0.9; SHA-256 '+crypto.createHash('sha256').update(fs.readFileSync(path.join(dest,'cpp-runtime.js'))).digest('hex'));
})().catch(error=>{console.error(error);process.exitCode=1;});
