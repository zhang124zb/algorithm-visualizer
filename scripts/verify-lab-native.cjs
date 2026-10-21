// Optional cross-check against installed Python 3 and a JDK (not a website dependency).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({}),temp=path.join(root,'artifacts/lab-native');fs.mkdirSync(temp,{recursive:true});
for(const file of ['examples.js','languages/examples.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist/extensions/code-lab',file),'utf8'),ctx);
const python=process.env.ALGOLAB_PYTHON||'python',javac=process.env.ALGOLAB_JAVAC||'javac',java=process.env.ALGOLAB_JAVA||'java';
function exec(command,args,input=''){const result=spawnSync(command,args,{cwd:temp,input,encoding:'utf8',timeout:20000});assert.ifError(result.error);assert.equal(result.status,0,result.stderr);return result.stdout.replace(/\r\n/g,'\n');}
const expected=['8 13 17 26 29 35 42 51 ','3\n','37\n','100\n','120\n'];
for(const language of ['python','java'])for(const [i,example]of ctx.LabLanguages[language].examples.entries()){
  const file=ctx.LabLanguages[language].file;fs.writeFileSync(path.join(temp,file),example.code);
  if(language==='java')exec(javac,['--release','8',file]);
  const output=language==='python'?exec(python,['-I',file],example.input):exec(java,['-cp','.', 'Main'],example.input);
  assert.equal(output,i===0&&language==='python'?expected[0].trimEnd()+'\n':expected[i],language+'/'+example.id);
}
console.log('Verified all 10 new lab examples against native Python and Java.');
