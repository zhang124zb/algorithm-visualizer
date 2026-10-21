const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/extensions/code-lab'),ctx=vm.createContext({setTimeout,clearTimeout});
for(const file of ['examples.js','languages/examples.js','scene.js','vendor/python/skulpt.min.js','vendor/python/stdlib.js','languages/python.js','vendor/java/java-runtime.js','languages/java.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const run=(language,code,input='')=>language==='python'?ctx.PythonLab.run(ctx.Sk,code,input):ctx.JavaLab.run(ctx.JavaRuntime,code,input);
const expected=['8 13 17 26 29 35 42 51 ','3\n','37\n','100\n','120\n'];
for(const language of ['python','java']){
  for(const [i,example]of ctx.LabLanguages[language].examples.entries()){
    const trace=run(language,example.code,example.input);assert.equal(trace.error,undefined,language+'/'+example.id+': '+trace.error?.message);
    assert.equal(trace.output,i===0&&language==='python'?expected[0].trimEnd()+'\n':expected[i]);assert.equal(trace.exitCode,0);assert.ok(trace.steps.at(-1).finished);
    for(const step of trace.steps){assert.ok(step.line>0&&step.line<=example.code.split('\n').length);assert.ok(Array.isArray(step.variables));}
    if(example.id==='prefix')assert.equal(trace.steps.at(-1).variables.filter(v=>Array.isArray(v.value)).length,2);
    if(example.id==='recursion'){assert.ok(Math.max(...trace.steps.map(s=>s.stack.length))>=6);assert.ok(trace.steps.some(s=>s.stack.filter(f=>f.name==='factorial').length>=4));}
  }
  const bubble=ctx.LabLanguages[language].examples[0];
  const edited=bubble.code.replace('a[j] > a[j + 1]','a[j] < a[j + 1]');
  assert.equal(run(language,edited,bubble.input).output,language==='python'?'51 42 35 29 26 17 13 8\n':'51 42 35 29 26 17 13 8 ');
  const recursion=ctx.LabLanguages[language].examples[4];assert.equal(run(language,recursion.code,'6').output,'720\n');
}
const java=body=>'public class Main {\npublic static void main(String[] args) {\n'+body+'\n}\n}';
const cases=[
  ['python','x=1\nx = ;','',/SyntaxError/],
  ['python','a=[1,2]\nprint(a[9])','',/IndexError/],
  ['python','print(4//0)','',/ZeroDivisionError/],
  ['python','n = int(input())','',/EOFError/],
  ['python','a=[0] * 5000','',/大小超过/],
  ['python','a=range(5000)','',/4096/],
  ['python','while True: pass','',/限制/],
  ['python','import os','',/ImportError/],
  ['java',java('int x = ;'),'',/line|Unexpected|Expected/],
  ['java',java('int[] a = new int[2];\nSystem.out.println(a[4]);'),'',/range/],
  ['java',java('System.out.println(4/0);'),'',/zero/],
  ['java','import java.util.Scanner;\n'+java('Scanner sc = new Scanner(System.in);\nint x = sc.nextInt();'),'',/输入不足/],
  ['java',java('int[] a = new int[5000];'),'',/4096/],
  ['java',java('int[][] a = new int[1000000000][0];'),'',/4096/],
  ['java',java('while(true) {}'),'',/timed out|限制/],
  ['java',java('long x = 3;'),'',/不支持|Expected/],
  ['java',java('int x = 2147483647 + 1;'),'',/溢出/]
];
for(const [language,code,input,pattern]of cases){const result=run(language,code,input);assert.match(result.error?.message||'',pattern,language+': '+JSON.stringify(result));}
assert.equal(run('python','x=1\nx=;').error.line,2);
const printing=run('python','while True: print("x")');
assert.ok(printing.steps.some((s,i)=>i&&s.line===printing.steps[i-1].line&&s.output!==printing.steps[i-1].output),'Repeated output on the same line must retain separate snapshots');
assert.equal(run('java','import java.util.Arrays;\n'+java('int[] a = {3,1,2};\nArrays.sort(a);\nSystem.out.println(Arrays.toString(a));')).output,'[1, 2, 3]\n');
assert.equal(run('java','import java.util.Scanner;\n'+java('Scanner sc=new Scanner(System.in);\nSystem.out.println(sc.nextInt());\nSystem.out.println(sc.nextLine());\nSystem.out.println(sc.nextLine());'),'7 tail\nnext').output,'7\n tail\nnext\n');
const programs={python:'idle=[9,9]\na=[1,2]\nb=[0,0]\nc=[0,0]\nd=[0,0]\nfor i in range(2):\n    b[i]=a[i]*2\n    c[i]=b[i]+1\n    d[i]=c[i]+a[i]\nprint(d)',java:java('int[] idle={9,9};\nint[] a={1,2};\nint[] b={0,0};\nint[] c={0,0};\nint[] d={0,0};\nfor(int i=0;i<2;i++){\nb[i]=a[i]*2;\nc[i]=b[i]+1;\nd[i]=c[i]+a[i];\n}\nSystem.out.println(d[0]);')};
for(const [language,code]of Object.entries(programs)){
  const trace=run(language,code);assert.equal(trace.error,undefined);
  const usage=new Map();for(const step of trace.steps)for(const name of step.accessed||[])usage.set(name,(usage.get(name)||0)+1);
  assert.equal(usage.has('idle'),false);
  for(let i=0;i<trace.steps.length;i++)assert.equal(ctx.CppLabScene.selectArrays(trace.steps[i],trace.steps[i-1],usage).length,Math.min(3,trace.steps[i].variables.filter(v=>Array.isArray(v.value)).length));
  const final=trace.steps.at(-1);assert.deepEqual(Array.from(final.variables.find(v=>v.name==='d').value),[4,7]);
}
console.log('Verified Python/Java edited execution, 10 examples, recursion, multi-array snapshots, syntax/input/runtime errors and execution limits.');
