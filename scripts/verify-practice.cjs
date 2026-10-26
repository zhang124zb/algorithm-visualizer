const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'..'),dist=path.join(project,'dist'),context=vm.createContext({});
for(const file of ['core','catalog'])vm.runInContext(fs.readFileSync(path.join(dist,'assets/js/'+file+'.js'),'utf8'),context);
const items=JSON.parse(JSON.stringify(context.AlgoLab.allItems)),ids=new Set(items.map(item=>item.id)),levels=['模板','基础','进阶','困难'];
const decode=value=>String(value).replace(/&(amp|lt|gt|quot|#39);/g,(match,name)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"})[name]);
const plain=value=>decode(value).replace(/\\([\[\]\\])/g,'$1').trim();
const text=value=>decode(value.replace(/<[^>]*>/g,'')).trim();
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const expected=new Map();
for(const file of walk(path.join(project,'算法训练题单')).filter(file=>file.endsWith('.md'))){
  const source=fs.readFileSync(file,'utf8'),chunks=source.split(/<a id="([a-z0-9-]+)"><\/a>/);
  for(let index=1;index<chunks.length;index+=2){
    const id=chunks[index];if(!ids.has(id))continue;assert.ok(!expected.has(id),'One Markdown source for '+id);
    const body=chunks[index+1],topic={title:plain(body.match(/^## (.+)$/m)?.[1]||''),scope:plain(body.match(/^训练范围：(.+)$/m)?.[1]||''),note:plain(body.match(/^选题说明：(.+)$/m)?.[1]||''),problems:[]};
    const blocks=body.split(/\r?\n(?=- \[ \] \*\*)/);
    for(const block of blocks){
      const match=/^- \[ \] \*\*(模板|基础|进阶|困难)(?: · 选做)?\*\* · \[(Codeforces|CSES|洛谷) (\S+) · (.+)\]\((https:\/\/[^\s)]+)\)/.exec(block);
      if(!match)continue;
      topic.problems.push({level:match[1],platform:match[2],id:match[3],title:plain(match[4]),url:match[5],focus:plain(block.match(/^  - 训练重点：(.+)$/m)?.[1]||''),note:plain(block.match(/^  - 提醒：(.+)$/m)?.[1]||'')});
    }
    assert.ok(topic.title&&topic.scope&&topic.problems.length>=4&&topic.problems.length<=6,id+' usable Markdown exercises');expected.set(id,topic);
  }
}
assert.equal(expected.size,120);assert.equal(items.length,120);
function sectionAt(html,start){
  let depth=0;for(const match of html.slice(start).matchAll(/<\/?section\b[^>]*>/g)){depth+=match[0].startsWith('</')?-1:1;if(!depth)return html.slice(start,start+match.index+match[0].length);}
  throw Error('Unclosed practice section');
}
const field=(html,className)=>html.match(new RegExp('<(?:p|span) class="'+className+'">([\\s\\S]*?)<\\/(?:p|span)>'))?.[1]||'';
let total=0,short=0;
for(const item of items){
  const file=path.join(dist,item.path),html=fs.readFileSync(file,'utf8'),topic=expected.get(item.id);
  assert.ok(topic,item.id+' corresponding Markdown topic');
  const starts=[...html.matchAll(/<section class="practice-list"[^>]*>/g)];assert.equal(starts.length,1,item.id+' exactly one exercise section');
  const start=starts[0],section=sectionAt(html,start.index),main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main?.trimEnd().endsWith(section),item.id+' practice is the final element inside main');
  assert.ok(html.indexOf('class="transport"')<start.index&&html.indexOf('class="input-details"')<start.index,item.id+' practice follows controls and input/output');
  assert.ok(start[0].includes('data-topic="'+item.id+'"'));assert.ok(start[0].includes('aria-labelledby="practice-heading"'));
  assert.equal([...html.matchAll(/id="practice-heading"/g)].length,1);
  assert.equal(text(section.match(/<h2 id="practice-heading">([\s\S]*?)<\/h2>/)?.[1]||''),'对应题单 · '+topic.title);
  assert.equal(text(field(section,'practice-total')),topic.problems.length+' 道练习');
  assert.equal(text(field(section,'practice-intro')),'训练范围：'+topic.scope);
  assert.equal(text(field(section,'practice-note')),topic.note?'选题说明：'+topic.note:'');
  const tiers=[...section.matchAll(/<section class="practice-tier" data-level="([^"]+)">/g)];assert.deepEqual(tiers.map(match=>match[1]),levels,item.id+' tier order');
  let actual=[];
  for(const tier of tiers){
    const body=sectionAt(section,tier.index);assert.ok(body.includes('<ol class="practice-problems">'));
    for(const match of body.matchAll(/<li class="practice-problem">([\s\S]*?)<\/li>/g)){
      const problem=match[1],link=problem.match(/<a class="practice-problem-link"([^>]*)>([\s\S]*?)<\/a>/);assert.ok(link,item.id+' original problem link');
      const url=decode(link[1].match(/href="([^"]+)"/)?.[1]||'');
      assert.match(url,/^https:\/\/(?:codeforces\.com\/problemset\/problem\/\d+\/[A-Z]\d*|cses\.fi\/problemset\/task\/\d+\/|www\.luogu\.com\.cn\/problem\/[PB]\d+)$/);
      assert.match(link[1],/target="_blank"/);assert.match(link[1],/rel="noopener noreferrer"/);
      actual.push({level:tier[1],platform:text(field(problem,'practice-platform')),title:text(link[2]).replace(/\s*↗$/,'').trim(),url,focus:text(field(problem,'practice-focus')),note:text(field(problem,'practice-problem-note'))});
    }
  }
  const wanted=topic.problems.map(problem=>({level:problem.level,platform:problem.platform+' '+problem.id,title:problem.title,url:problem.url,focus:'训练重点：'+problem.focus,note:problem.note?'提醒：'+problem.note:''}));
  assert.deepEqual(actual,wanted,item.id+' exercises preserve the independent Markdown source');
  assert.match(text(field(section,'practice-footnote')),/困难题选做/);assert.match(text(field(section,'practice-footnote')),/不等同于平台官方评级/);
  const style=html.match(/<link rel="stylesheet" href="([^"]*assets\/css\/practice\.css)"/);assert.ok(style,item.id+' shared exercise style');
  assert.equal(path.resolve(path.dirname(file),style[1]),path.join(dist,'assets/css/practice.css'));
  total+=actual.length;if(actual.length<6){short++;assert.ok(topic.note,item.id+' fewer exercises have a retained reason');}
}
let excluded=0;for(const file of walk(dist).filter(file=>file.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');if(html.includes('data-algorithm='))continue;
  assert.doesNotMatch(html,/class="practice-list"/,path.relative(dist,file)+' excluded from this change');excluded++;
}
assert.equal(excluded,36);assert.equal(total,707);assert.equal(short,9);
console.log(`Verified ${items.length} animation pages with ${total} Markdown-matched exercises, safe official links, four tiers, retained notes, bottom placement and ${excluded} excluded pages.`);
