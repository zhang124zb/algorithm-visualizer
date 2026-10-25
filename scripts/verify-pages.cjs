const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..','dist');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const files=walk(root);let links=0,pages=0;
for(const file of files){const text=fs.readFileSync(file,'utf8');if(file.endsWith('.js'))new vm.Script(text,{filename:file});if(!file.endsWith('.html'))continue;pages++;assert.match(text,/<html lang="zh-CN">/);assert.match(text,/<meta name="viewport"/);for(const match of text.matchAll(/(?:src|href)="([^"]*)"/g)){const url=match[1];if(!url||url.startsWith('#')||/^(https?:|data:)/.test(url))continue;const target=path.resolve(path.dirname(file),url.split('#')[0]);assert.ok(fs.existsSync(target),`${file} → ${url}`);links++;}if(text.includes('data-algorithm=')){for(const id of ['stage','code-lines','previous','next','restart','play','speed','seek','randomize','input-data','result-data'])assert.ok(text.includes(`id="${id}"`),`${file}: ${id}`);}}
const catalog=vm.createContext({});
for(const file of ['core','catalog'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',file+'.js'),'utf8'),catalog);
assert.equal(pages,catalog.AlgoLab.allItems.length+catalog.AlgoLab.allGroups.length+3);
const stl=fs.readFileSync(path.join(root,'structures/stl/index.html'),'utf8');
assert.equal([...stl.matchAll(/class="stl-lesson"/g)].length,12,'STL lesson count');
assert.equal([...stl.matchAll(/class="stl-group"/g)].length,4,'STL learning groups');
assert.equal([...stl.matchAll(/固定 C\+\+17 示例/g)].length,12,'STL examples must be present');
assert.ok(stl.includes('&lt;vector&gt;'),'C++ template/header characters must be HTML escaped');
const stlIds=[...stl.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(stlIds).size,stlIds.length);
for(const match of stl.matchAll(/href="#([^"]+)"/g))assert.ok(stlIds.includes(match[1]),'Missing STL anchor '+match[1]);
console.log(`Verified ${pages} HTML pages, ${links} local resource/navigation links and all JavaScript syntax.`);
