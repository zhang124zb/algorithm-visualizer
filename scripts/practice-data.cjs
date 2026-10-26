const fs=require('node:fs');
const path=require('node:path');

const levels=['模板','基础','进阶','困难'];
const folders=['01_数据结构','02_算法','03_竞赛拓展'];
const excluded=/STL|标准模板库|指针课堂|指针动画专项|代码实验室|README|总目录|索引|覆盖|来源/i;
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
const plain=value=>value.replace(/&(amp|lt|gt|quot|apos);/g,(_,name)=>entities[name]).replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,'$1').replace(/`([^`]+)`/g,'$1').trim();

function loadPracticeLists(directory,expectedIds){
  if(!Array.isArray(expectedIds)||!expectedIds.length||expectedIds.some(id=>typeof id!=='string'||!/^[a-z][a-z0-9-]*$/.test(id)))throw new Error('题单：expectedIds 必须是非空的动画知识点 ID 数组。');
  const expected=new Set(expectedIds);
  if(expected.size!==expectedIds.length)throw new Error('题单：动画目录包含重复知识点 ID。');
  const topics=new Map(),locations=new Map();
  const fail=(file,line,message)=>{throw new Error(`题单 ${path.relative(directory,file)}:${line}：${message}`);};
  const files=folders.flatMap(folder=>fs.readdirSync(path.join(directory,folder),{withFileTypes:true})
    .filter(entry=>entry.isFile()&&entry.name.endsWith('.md')&&!excluded.test(entry.name))
    .sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
    .map(entry=>path.join(directory,folder,entry.name)));

  for(const file of files){
    let topic=null,problem=null,start=0;
    const finish=()=>{
      if(!topic)return;
      for(const field of ['title','scope'])if(!topic[field])fail(file,start,`${topic.id} 缺少${field==='title'?'知识点标题':'训练范围'}。`);
      const counts=levels.map(level=>topic.problems.filter(item=>item.level===level).length);
      if(topic.problems.length<4||topic.problems.length>6||counts[0]!==1||counts.slice(1).some(count=>count<1))fail(file,start,`${topic.id} 题数或分层不当：应有 4～6 题、模板恰好 1 题，基础/进阶/困难均至少 1 题；实际为 ${counts.join('/')}。`);
      if(topic.problems.length<6&&!topic.note)fail(file,start,`${topic.id} 只有 ${topic.problems.length} 题，必须保留窄主题的选题说明。`);
      for(const item of topic.problems)if(!item.focus)fail(file,start,`${topic.id} 的 ${item.platform} ${item.id} 缺少训练重点。`);
      topics.set(topic.id,topic);
    };
    const lines=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/);
    for(let index=0;index<lines.length;index++){
      const line=lines[index],number=index+1;
      const anchor=/^<a id="([a-z][a-z0-9-]*)"><\/a>$/.exec(line);
      if(anchor){
        finish();
        const id=anchor[1];
        if(!expected.has(id))fail(file,number,`知识点 ${id} 不在本次动画目录中。`);
        if(locations.has(id))fail(file,number,`重复知识点 ${id}；首次位于 ${locations.get(id)}。`);
        locations.set(id,`${path.relative(directory,file)}:${number}`);
        topic={id,title:'',scope:'',note:'',problems:[]};
        problem=null;start=number;
        continue;
      }
      if(/^\s*<a\b/.test(line))fail(file,number,'知识点锚点格式不正确，应为 <a id="知识点ID"></a>。');
      if(!topic||!line.trim())continue;
      let match=/^## (.+)$/.exec(line);
      if(match){
        if(topic.title||topic.problems.length)fail(file,number,`${topic.id} 的标题重复或位置不正确。`);
        topic.title=plain(match[1]);continue;
      }
      match=/^(训练范围|选题说明)：(.+)$/.exec(line);
      if(match){
        const field=match[1]==='训练范围'?'scope':'note';
        if(topic[field]||topic.problems.length)fail(file,number,`${topic.id} 的${match[1]}重复或位置不正确。`);
        topic[field]=plain(match[2]);
        if(!topic[field])fail(file,number,`${match[1]}不能为空。`);
        continue;
      }
      if(/^配套学习：/.test(line)&&!topic.problems.length)continue;
      match=/^- \[(?: |x|X)\] \*\*(模板|基础|进阶|困难 · 选做)\*\* · \[(洛谷|Codeforces|CSES) ([A-Z0-9]+) · (.+)\]\(([^()\s]+)\)$/.exec(line);
      if(match){
        const [,tier,platform,id,title,url]=match,level=tier.split(' · ')[0];
        const patterns={
          '洛谷':/^https:\/\/www\.luogu\.com\.cn\/problem\/([PB]\d+)\/?$/,
          Codeforces:/^https:\/\/codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z]\d*)\/?$/,
          CSES:/^https:\/\/cses\.fi\/problemset\/task\/(\d+)\/?$/
        };
        const official=patterns[platform].exec(url);
        if(!official||official.slice(1).join('')!==id)fail(file,number,`${platform} ${id} 的原题链接不合法或题号不一致：${url}。`);
        if(topic.problems.some(item=>item.platform===platform&&item.id===id))fail(file,number,`${topic.id} 中重复收录 ${platform} ${id}。`);
        if(problem&&levels.indexOf(level)<levels.indexOf(problem.level))fail(file,number,`${topic.id} 应按模板、基础、进阶、困难顺序排列。`);
        problem={platform,id,title:plain(title),url,level,focus:'',note:''};
        if(!problem.title)fail(file,number,'题名不能为空。');
        topic.problems.push(problem);continue;
      }
      match=/^  - (训练重点|提醒)：(.+)$/.exec(line);
      if(match&&problem){
        const field=match[1]==='训练重点'?'focus':'note';
        if(problem[field])fail(file,number,`${platformLabel(problem)} 的${match[1]}重复。`);
        problem[field]=plain(match[2]);
        if(!problem[field])fail(file,number,`${match[1]}不能为空。`);
        continue;
      }
      fail(file,number,`无法识别 ${topic.id} 的题单内容，请检查分层、链接或字段格式：${line.trim()}。`);
    }
    finish();
  }
  const missing=expectedIds.filter(id=>!topics.has(id));
  if(missing.length)throw new Error(`题单缺少 ${missing.length} 个动画知识点：${missing.join('、')}。`);
  return topics;
}

const platformLabel=problem=>`${problem.platform} ${problem.id}`;
module.exports={loadPracticeLists};
