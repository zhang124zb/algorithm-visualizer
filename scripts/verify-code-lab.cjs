const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/extensions/code-lab'),ctx=vm.createContext({});
for(const file of ['vendor/cpp-runtime.js','stl.js','engine.js','examples.js','scene.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const {CppRuntime:C,CppLab:L,CppLabExamples:examples}=ctx;
const run=(code,input='')=>L.run(C,code,input);
const expected=['8 13 17 26 29 35 42 51 ','3\n','37\n','100\n','120\n'];
for(const [i,example]of examples.entries()){
  const trace=run(example.code,example.input);assert.equal(trace.error,undefined,example.id+': '+trace.error?.message);
  assert.equal(trace.output,expected[i],example.id);assert.equal(trace.exitCode,0);assert.ok(trace.steps.at(-1).finished);
  for(const step of trace.steps){assert.ok(step.line>=1&&step.line<=example.code.split('\n').length);assert.ok(Array.isArray(step.variables));}
}
const bubble=examples[0];
assert.equal(run(bubble.code.replace('a[j] > a[j + 1]','a[j] < a[j + 1]'),bubble.input).output,'51 42 35 29 26 17 13 8 ','Edited code must change the actual result');
assert.equal(run(bubble.code,'4\n-3 2 2 -8').output,'-8 -3 2 2 ','Negative values and duplicates');
const state=run(bubble.code,bubble.input);
const swapLine=bubble.code.split('\n').findIndex(line=>line.includes('a[j] = a[j + 1]'))+1;
const swap=state.steps.find(s=>s.line===swapLine);
assert.equal(swap.variables.find(v=>v.name==='a').value[0],17,'Assignment snapshot belongs to its highlighted line');
assert.equal(state.steps.find(s=>s.line===8).variables.find(v=>v.name==='a').value[0],0,'Earlier snapshots must not mutate');
const recursion=run(examples[4].code,'6');assert.equal(recursion.output,'720\n');
assert.ok(Math.max(...recursion.steps.map(s=>s.stack.length))>=6,'Recursive frames must be recorded');
assert.ok(recursion.steps.some(s=>s.stack.filter(f=>f.name==='factorial').length>1));
const simple=body=>'#include <iostream>\nusing namespace std;\nint main(){\n'+body+'\n}';
const cases=[
  [simple('int a = ;'),'',/Parsing Failure/],
  [simple('int a[2] = {1,2};\na[8] = 5;\nreturn 0;'),'',/bound|range|overflow/i],
  [simple('char a;\ncin >> a;\nreturn 0;'),'',/input|EOF|invalid|read/i],
  [simple('int a[1000000000];\nreturn 0;'),'',/4096/],
  [simple('int a[1000000000] = {0};\nreturn 0;'),'',/4096/],
  [simple('while(true) {\nint x = 1;\n}\nreturn 0;'),'',/限制/],
  [simple('while(true) {}'),'',/限制/],
  ['#include <cstdlib>\nint main(){ system("postMessage(1)");return 0;}','',/cannot find library/],
  ['#include <fstream>\nint main(){return 0;}','',/cannot find library/],
  [simple('for(int i=0;i<20000;i++){\ncout << "abcdefghijklmnopqrstuvwxyz";\n}\nreturn 0;'),'',/限制|16000/]
];
for(const [code,input,pattern]of cases){const result=run(code,input);assert.match(result.error?.message||'',pattern,JSON.stringify(result.error));}
assert.equal(run(simple('cout << 123;\nreturn 3;')).exitCode,3,'Non-zero exit codes are preserved');
assert.match(run('x'.repeat(24001)).error.message,/24000/);
assert.match(run(simple('return 0;'),'x'.repeat(16001)).error.message,/16000/);
assert.ok(fs.statSync(path.join(root,'vendor/cpp-runtime.js')).size<650000,'Keep the self-hosted interpreter small');
const arrayCases=require('./code-lab-array-cases.cjs'),select=ctx.CppLabScene.selectArrays;
for(const [name,code]of Object.entries(arrayCases)){
  const trace=run(code);assert.equal(trace.error,undefined,name);
  const usage=new Map();for(const step of trace.steps)for(const key of step.accessed||[])usage.set(key,(usage.get(key)||0)+1);
  for(let i=0;i<trace.steps.length;i++){
    const step=trace.steps[i],all=step.variables.filter(v=>Array.isArray(v.value)),selected=select(step,trace.steps[i-1],usage);
    assert.equal(selected.length,Math.min(all.length,3),name+' count at '+i);
    assert.equal(new Set(selected.map(s=>s.item.name)).size,selected.length);
    assert.deepEqual(Array.from(select(step,trace.steps[i-1],usage),s=>s.item.name),Array.from(selected,s=>s.item.name),'Replay selection must be independent of navigation history');
  }
  if(name==='many'){
    assert.equal(usage.get('unused'),undefined,'Comments must not count as executed reads');
    const i=trace.steps.findIndex(s=>s.line===10),step=trace.steps[i],previous=trace.steps[i-1];
    assert.deepEqual(Array.from(step.accessed).sort(),['a','c','d']);
    assert.deepEqual(Array.from(select(step,previous,usage),s=>s.item.name),['a','c','d'],'Prioritize changed and actually accessed arrays over inactive arrays');
    const pinned=select(step,previous,usage,'unused');assert.equal(pinned.length,3);assert.ok(pinned.some(s=>s.item.name==='unused'));assert.ok(pinned.some(s=>s.item.name==='d'));
    const end=select(trace.steps.at(-1),trace.steps.at(-2),usage);assert.deepEqual(Array.from(end,s=>s.item.name),['a','b','c'],'Use frequency when the current line does not access arrays');
  }
  if(name==='scope'){
    const inside=trace.steps.find(s=>s.line===5);assert.deepEqual(Array.from(inside.variables.find(v=>v.name==='base').value),[5,2],'Capture mutation before the block disappears');assert.ok(inside.variables.some(v=>v.name==='scratch'));
    const i=trace.steps.findIndex(s=>s.line===7);assert.deepEqual(Array.from(select(trace.steps[i],trace.steps[i-1],usage,'scratch'),s=>s.item.name),['base'],'A pin must not revive an out-of-scope array');
  }
}
const inline=run('int main(){\nint a[3] = {0};\nfor (int i=0;i<3;i++) { a[i]=i+1; }\nreturn 0;\n}');
assert.equal(inline.error,undefined);assert.deepEqual(Array.from(inline.steps.find(s=>s.line===3).variables.find(v=>v.name==='a').value),[1,2,3],'A same-line loop must retain its final values');
const io=require('./code-lab-io-cases.cjs'),iostream=C.includes.iostream;
for(const [input,output]of io.cases){
  const trace=run(io.code,input);assert.equal(trace.error,undefined,trace.error?.message);assert.equal(trace.output,output);assert.equal(trace.exitCode,0);
  assert.ok(trace.steps.some(s=>s.line===7&&s.message.includes('std::cin >> e;')),'Replay uses original input line');
  assert.ok(trace.steps.some(s=>s.stack.length===2&&s.stack.at(-1).name==='solve'),'Keep main/solve call frames');
  for(const step of trace.steps)assert.ok(step.line>=1&&step.line<=io.code.split('\n').length);
  assert.equal(C.includes.iostream,iostream,'Restore the stream loader after every run');
}
const ioVariants=[
  ['#include <iostream>\nint main(){\nstd::ios_base /* comment */ :: sync_with_stdio ( 0 );\nstd::cin /* comment */ . tie ( NULL );\nstd::cout.tie(0);\nint x;\nstd /* comment */ ::\ncin >> x;\nstd::cout << x << std::endl;\nreturn 0;\n}','42','42\n'],
  ['#include <iostream>\nint main(){\nint cin=1, cout=2, endl=3, x;\nstd::cin >> x;\nstd::cout << x << std::endl;\nreturn 0;\n}','17','17\n'],
  ['#include <iostream>\nusing namespace std;\nint main(){\nios::sync_with_stdio(true);\ncin.tie(nullptr);\ncout << "std::cin std::cout std::endl ios::sync_with_stdio(false);";\nreturn 0;\n}','','std::cin std::cout std::endl ios::sync_with_stdio(false);'],
  ['#include <iostream>\nint print(){std::cout << 7;return 0;}\nint value=print();\nint main(){return 0;}','','7']
];
for(const [code,input,output]of ioVariants){const trace=run(code,input);assert.equal(trace.error,undefined,trace.error?.message);assert.equal(trace.output,output);}
const untouched=[
  '"std::cout"',"'x'",'// std::cin.tie(nullptr);\n','/* std::cout << std::endl; */',
  'R"tag(std::cin " std::cout)tag"','#define STREAM std::cout\n',
  'other::std::cin','mystd::cout','std::vector<int> a;',
  'int old = std::ios::sync_with_stdio(false);','{ std::ios::sync_with_stdio(++x); }'
];
for(const code of untouched)assert.equal(L.prepareSource(code),code,'Do not rewrite literals, comments or unsupported expressions');
const prepared=L.prepareSource(ioVariants[0][0]);assert.equal(prepared.length,ioVariants[0][0].length);
assert.deepEqual([...prepared.matchAll(/\n/g)].map(m=>m.index),[...ioVariants[0][0].matchAll(/\n/g)].map(m=>m.index),'Keep exact newline positions');
const ioBounds=run('#include <iostream>\nint main(){\nstd::cout << 1;\nint a[1]={0};\na[2]=7;\nreturn 0;\n}');
assert.equal(ioBounds.error.line,5,'Runtime errors still point at the original source line');
const ioSyntax=run('#include <iostream>\nint main(){\nstd::cout << 1;\nint a = ;\n}');
assert.equal(ioSyntax.error.line,4);assert.equal(C.includes.iostream,iostream,'Restore loader even when parsing fails');
const iomanip=C.includes.iomanip,aggregate=String.raw`#include <bits/stdc++.h>
using namespace std;
int main(){
    cout << sqrt(81.0) << " " << isdigit('7') << " " << strlen("hi") << " " << setw(4) << 7 << endl;
    return 0;
}`;
const headers=[
  '#include<bits/stdc++.h>',
  '  # include "bits/stdc++.h" // aggregate',
  '#include <bits/stdc++.h>\n#include <bits/stdc++.h>',
  '#include <iostream>\n#include <bits/stdc++.h>\n#include <iostream>',
  '#include <math.h>\n#include <ctype.h>\n#include <string.h>\n#include <bits/stdc++.h>\n#include <cmath>\n#include <cctype>\n#include <cstring>',
  '#include "iomanip"\n#include "bits/stdc++.h"\n#include "iostream"\n#include "math.h"\n#include "bits/stdc++.h"\n#include "cctype"'
];
for(const header of headers){
  const code=aggregate.replace('#include <bits/stdc++.h>',header),trace=run(code);
  assert.equal(trace.error,undefined,header+': '+trace.error?.message);assert.equal(trace.output,'9 1 2    7\n');
  const prepared=L.prepareSource(code);assert.equal(prepared.length,code.length);
  assert.deepEqual([...prepared.matchAll(/\n/g)].map(m=>m.index),[...code.matchAll(/\n/g)].map(m=>m.index));
}
for(const [input,output]of io.cases){
  const trace=run(io.code.replace('<iostream>','<bits/stdc++.h>'),input);
  assert.equal(trace.error,undefined,trace.error?.message);assert.equal(trace.output,output);
  assert.ok(trace.steps.some(s=>s.line===7&&s.message.includes('std::cin >> e;')));
}
for(const example of examples){const trace=run(example.code.replace('<iostream>','<bits/stdc++.h>'),example.input);assert.equal(trace.error,undefined,example.id);assert.equal(trace.output,run(example.code,example.input).output);}
for(const code of ['// #include <bits/stdc++.h>\n','/*\n#include <bits/stdc++.h>\n*/','"#include <bits/stdc++.h>"','R"tag(\n#include <bits/stdc++.h>\n)tag"','#define HEADER "bits/stdc++.h"\n','#include <unknown.h>\n'])assert.equal(L.prepareSource(code),code,'Only rewrite actual supported include directives');
for(const code of [
  '#include <bits/stdc++.h>\n#include <fstream>\nint main(){return 0;}',
  '#include <bits/stdc++.h>\n#include <cstdlib>\nint main(){return 0;}',
  '#include <bits/stdc++.h>\nint main(){system("postMessage(1)");return 0;}',
  '#include <bits/stdc++.h>\nint main(){\nint a = ;\n}'
]){assert.ok(run(code).error);assert.equal(C.includes.iostream,iostream);assert.equal(C.includes.iomanip,iomanip);assert.equal(Object.hasOwn(C.includes,'__algolab_all'),false,'Temporary aggregate header must be removed after failures');}
console.log('Verified C++ lab execution, limits, 1–3 concurrent arrays, activity ranking, manual pins, mixed matrices and scope changes.');
console.log('Verified qualified standard streams, buffering setup, original source locations, literals and stream-name shadowing.');
console.log('Verified bits/stdc++.h, existing library functions, repeated/mixed headers, original source locations and unchanged library restrictions.');
