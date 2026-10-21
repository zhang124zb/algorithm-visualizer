'use strict';
self.onmessage=event=>{
  const {code,input,language='cpp'}=event.data||{};
  try{
    let result;
    if(language==='cpp'){importScripts('vendor/cpp-runtime.js','engine.js');result=CppLab.run(CppRuntime,code,input);}
    else if(language==='python'){importScripts('vendor/python/skulpt.min.js','vendor/python/stdlib.js','languages/python.js');result=PythonLab.run(Sk,code,input);}
    else if(language==='java'){importScripts('vendor/java/java-runtime.js','languages/java.js');result=JavaLab.run(JavaRuntime,code,input);}
    else throw Error('不支持的执行语言。');
    self.postMessage(result);
  }catch(error){self.postMessage({steps:[],error:{message:String(error.message||error)}});}
};
