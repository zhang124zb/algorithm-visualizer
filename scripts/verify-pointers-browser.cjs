'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/playwright')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
if(!pkg)throw Error('Playwright is unavailable in the local test cache.');
const {chromium}=require(pkg),base=process.env.ALGOLAB_BASE_URL||'http://127.0.0.1:4173';

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    const capture=async name=>{await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/'+name+'.png'),fullPage:true});};
    const noOverflow=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' page overflow');
    const pointerState=()=>page.locator('#stage .algorithm-pointer').evaluateAll(nodes=>nodes.map(node=>({name:node.dataset.name,index:node.dataset.index,text:node.textContent,left:node.style.left,top:node.style.top})).sort((a,b)=>a.name.localeCompare(b.name)));
    async function seekPointers(names){
      const selected=await page.evaluate(expected=>{
        const seek=document.getElementById('seek');
        for(let index=0;index<=Number(seek.max);index++){
          seek.value=index;seek.dispatchEvent(new Event('input',{bubbles:true}));
          const actual=[...document.querySelectorAll('#stage .algorithm-pointer')].map(node=>node.dataset.name);
          if(expected.every(name=>actual.includes(name)))return index;
        }
        return -1;
      },names);
      assert.ok(selected>=0,'A frame contains '+names.join(', '));
      return selected;
    }
    async function arrayAlignment(label){
      const result=await page.evaluate(()=>{
        const errors=[];let checked=0;
        for(const pointer of document.querySelectorAll('#stage .array-stage .algorithm-pointer')){
          const index=Number(pointer.dataset.index),host=pointer.closest('.pointer-overlay')?.parentElement;
          if(!host||!Number.isInteger(index))continue;
          const cell=[...host.querySelectorAll('.array-cell')].find(node=>Number(node.querySelector('.array-index')?.textContent)===index);
          if(!cell)continue;
          checked++;
          const x=Number.parseFloat(getComputedStyle(pointer).left),hostBox=host.getBoundingClientRect(),box=cell.getBoundingClientRect();
          if(!Number.isFinite(x)||Math.abs(x-(box.x-hostBox.x+box.width/2))>2)errors.push(pointer.dataset.name+' at '+index+' is not centered on its cell');
          const indexBox=cell.querySelector('.array-index').getBoundingClientRect();
          if(Math.abs(indexBox.x+indexBox.width/2-(box.x+box.width/2))>2)errors.push('Index '+index+' is not centered beneath its value');
          const tag=pointer.querySelector('.pointer-badge,.pointer-label,.pointer-name')||pointer.lastElementChild;
          if(tag){const rect=tag.getBoundingClientRect();if(rect.x<hostBox.x-2||rect.right>hostBox.right+2)errors.push(pointer.dataset.name+' label is clipped at the array edge');}
        }
        return {errors,checked};
      });
      assert.ok(result.checked>0,label+' has measurable array pointers');
      assert.deepEqual(result.errors,[],label+' pointer alignment');
    }
    async function player(url,names){
      await page.goto(base+'/'+url);
      assert.equal(await page.locator('#error').isVisible(),false,url);
      const index=await seekPointers(names),before=await pointerState();
      await arrayAlignment(url);
      if(index>0){await page.locator('#previous').click();await page.locator('#next').click();}
      else{await page.locator('#next').click();await page.locator('#previous').click();}
      assert.deepEqual(await pointerState(),before,url+' rewind restores pointers');
      await noOverflow(url);
      return index;
    }
    await player('algorithms/search/binary-search.html',['left','right','mid']);
    await capture('pointer-binary-desktop');
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);
    await arrayAlignment('Binary search after resize');await noOverflow('Binary mobile');
    await capture('pointer-binary-mobile');
    await page.setViewportSize({width:1440,height:1000});
    await player('algorithms/search/lower-bound.html',['left','right']);
    assert.equal(Number(await page.locator('#stage .algorithm-pointer[data-name="right"]').getAttribute('data-index')),await page.locator('#stage .array-cell').count(),'Half-open binary search displays right at n');
    await player('algorithms/techniques/two-pointers.html',['left','right']);
    await capture('pointer-two-pointers-desktop');
    await player('algorithms/sorting/bubble-sort.html',['end','j']);
    await player('algorithms/sorting/selection-sort.html',['i','j']);
    await player('structures/stack-queue/stack.html',['top']);
    await player('structures/stack-queue/queue.html',['front','rear']);
    await player('structures/stack-queue/circular-queue.html',['front','rear']);
    async function graphPlayer(url,names){
      await page.goto(base+'/'+url);assert.equal(await page.locator('#error').isVisible(),false,url);
      const frame=await page.evaluate(expected=>{
        const seek=document.getElementById('seek');
        for(let i=0;i<=Number(seek.max);i++){
          seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));
          const actual=[...document.querySelectorAll('.graph-pointer')].map(node=>node.dataset.name);
          if(expected.every(name=>actual.includes(name)))return i;
        }
        return -1;
      },names);
      assert.ok(frame>=0,url+' graph pointers');
      const snapshot=()=>page.locator('.graph-pointer').evaluateAll(nodes=>nodes.map(node=>node.outerHTML));
      const before=await snapshot();
      if(frame>0){await page.locator('#previous').click();await page.locator('#next').click();}
      else{await page.locator('#next').click();await page.locator('#previous').click();}
      assert.deepEqual(await snapshot(),before,url+' graph pointer rewind');
      const tips=await page.evaluate(()=>{
        const nodes=[...document.querySelectorAll('.graph-stage .node')].map(node=>{const matrix=node.transform.baseVal.consolidate().matrix;return{x:matrix.e,y:matrix.f};});
        return [...document.querySelectorAll('.graph-pointer-tip')].map(tip=>{
          const values=[...tip.getAttribute('d').matchAll(/-?\d+(?:\.\d+)?/g)].map(match=>Number(match[0]));
          return nodes.some(node=>Math.abs(values[2]-node.x)<0.01&&Math.abs(Math.abs(values[3]-node.y)-25)<0.01);
        });
      });
      assert.ok(tips.length&&tips.every(Boolean),url+' arrow tips point at visible nodes');
      await noOverflow(url);
    }
    await graphPlayer('structures/linear/singly-linked-list.html',['p','tail']);
    await capture('pointer-linked-list-desktop');
    await graphPlayer('structures/linear/circular-linked-list.html',['current','previous']);
    await graphPlayer('structures/heaps/max-heap.html',['u','v']);

    // Direct helper checks isolate coincident labels and boundary behavior from random demo inputs.
    const helper=await page.evaluate(()=>{
      const host=document.createElement('div');host.id='pointer-test-host';host.style.cssText='position:relative;width:460px;height:260px;max-width:100%;margin:20px auto';document.querySelector('main').prepend(host);
      const draw=(pointers,count=5)=>AlgoLab.drawPointers(host,pointers,{count});
      draw({i:1,j:1,k:1,left:0,right:4});
      const first=host.querySelector('.algorithm-pointer[data-name="i"]');
      const names=[...host.querySelectorAll('.algorithm-pointer')].map(node=>node.dataset.name);
      const labels=[...host.querySelectorAll('.algorithm-pointer')].filter(node=>node.dataset.index==='1').map(node=>{
        const label=node.querySelector('.pointer-badge,.pointer-label,.pointer-name')||node.lastElementChild||node;
        const rect=label.getBoundingClientRect();return {x:rect.x,y:rect.y,width:rect.width,height:rect.height};
      });
      draw({i:3});const sameNode=host.querySelector('.algorithm-pointer[data-name="i"]')===first;
      draw({left:-1,right:5});const boundaries=[...host.querySelectorAll('.algorithm-pointer')].map(node=>({name:node.dataset.name,index:Number(node.dataset.index),text:node.textContent}));
      AlgoLab.drawPointers(host,{hidden:6,tail:8,outside:9},{count:8,positions:[30,100,170,240,310]});
      const truncated={arrows:host.querySelectorAll('.algorithm-pointer').length,text:host.querySelector('.pointer-summary')?.textContent};
      draw({nan:NaN,infinite:Infinity,fraction:1.5});const invalid=[...host.querySelectorAll('.algorithm-pointer')].map(node=>node.dataset.name);
      const malicious='<img src=x onerror="window.__pointerXss=1">';draw({[malicious]:2});
      const safe=!host.querySelector('img')&&host.textContent.includes(malicious)&&!window.__pointerXss;
      const pointer=host.querySelector('.algorithm-pointer');
      const duration=getComputedStyle(pointer).transitionDuration.split(',').map(value=>Number.parseFloat(value));
      draw({},0);const cleared=host.querySelectorAll('.algorithm-pointer').length===0;
      host.remove();return {names,labels,sameNode,boundaries,truncated,invalid,safe,duration,cleared};
    });
    assert.deepEqual(helper.names.sort(),['i','j','k','left','right']);
    assert.equal(helper.labels.length,3);
    for(let i=0;i<helper.labels.length;i++)for(let j=i+1;j<helper.labels.length;j++){
      const a=helper.labels[i],b=helper.labels[j];
      assert.ok(a.x+a.width<=b.x+1||b.x+b.width<=a.x+1||a.y+a.height<=b.y+1||b.y+b.height<=a.y+1,'Coincident pointer labels must not overlap');
    }
    assert.equal(helper.sameNode,true,'Moving a named pointer preserves its DOM node');
    assert.deepEqual(helper.boundaries.map(p=>p.index).sort((a,b)=>a-b),[-1,5]);
    assert.equal(helper.truncated.arrows,0,'Unshown elements and a truncated tail are summaries, never arrows aimed at a visible cell');
    assert.match(helper.truncated.text,/hidden = 6.*未展示/);assert.match(helper.truncated.text,/tail = 8.*尾后位置/);assert.match(helper.truncated.text,/outside = 9.*越界/);
    assert.deepEqual(helper.invalid,[],'Noninteger and nonfinite indices do not become array arrows');
    assert.equal(helper.safe,true,'Pointer names are text, not HTML');
    assert.ok(helper.duration.every(value=>value<=0.01),'Reduced motion disables arrow transitions');
    assert.equal(helper.cleared,true,'Empty frames clear stale arrows');

    await page.goto(base+'/extensions/code-lab/index.html');
    const run=async code=>{
      await page.locator('#edit-tab').click();await page.locator('#source').fill(code);await page.locator('#stdin').fill('');await page.locator('#run').click();
      await page.waitForFunction(()=>!document.getElementById('run').classList.contains('hidden')&&/已生成|已保留|未完成/.test(document.getElementById('lab-status').textContent));
      assert.equal(await page.locator('#error').isVisible(),false,await page.locator('#error').textContent());
      await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
    };
    await run('#include <bits/stdc++.h>\nint main(){\nint a[4]={5,3,8,2};\nvector<int> v;\nv.push_back(7);\nv.push_back(4);\nv.push_back(9);\nstring text="algo";\nint i=1;\nint j=1;\nint left=-1;\nint right=4;\nint result=a[i]+v[j]+text[j];\nreturn 0;\n}');
    for(const name of ['a','v','text']){
      const card=page.locator('.lab-array-card[data-array="'+name+'"]');
      assert.equal(await card.count(),1,name+' remains visible');
      assert.equal(await card.locator('.algorithm-pointer[data-name="i"]').count(),1,name+' has i');
      assert.equal(await card.locator('.algorithm-pointer[data-name="j"]').count(),1,name+' has j');
    }
    const labState=await pointerState();await page.locator('#previous').click();await page.locator('#next').click();
    assert.deepEqual(await pointerState(),labState,'Lab rewind restores pointer positions');
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);await noOverflow('Lab mobile');
    await capture('pointer-lab-mobile');
    await page.setViewportSize({width:1440,height:1000});
    await run('#include <bits/stdc++.h>\nint main(){\nqueue<int> q;\nq.push(3);\nq.push(5);\nstack<int> st;\nst.push(7);\nst.push(9);\nmap<int,int> m;\nm[2]=7;\nint i=0;\nreturn 0;\n}');
    assert.equal(await page.locator('.lab-array-card[data-array="q"] .algorithm-pointer[data-name="front"]').count(),1);
    assert.equal(await page.locator('.lab-array-card[data-array="q"] .algorithm-pointer[data-name="back"]').count(),1);
    assert.equal(await page.locator('.lab-array-card[data-array="st"] .algorithm-pointer[data-name="top"]').count(),1);
    assert.equal(await page.locator('.lab-array-card[data-array="m"] .algorithm-pointer').count(),0,'Maps have no invented numeric indices');
    const stackAlignment=await page.locator('.lab-array-card[data-array="st"]').evaluate(card=>{
      const pointer=card.querySelector('.algorithm-pointer[data-name="top"]'),host=pointer.closest('.pointer-overlay').parentElement,index=Number(pointer.dataset.index);
      const box=host.querySelectorAll('.lab-stl-cell')[index].querySelector('b').getBoundingClientRect(),bounds=host.getBoundingClientRect();
      return{x:Number.parseFloat(pointer.style.left),y:Number.parseFloat(pointer.style.top),targetX:box.right-bounds.left,targetY:box.y-bounds.y+box.height/2};
    });
    assert.ok(Math.abs(stackAlignment.x-stackAlignment.targetX)<2&&Math.abs(stackAlignment.y-stackAlignment.targetY)<2,'The stack arrow points at the actual top value');
    await capture('pointer-stl-stack-desktop');
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);await noOverflow('Stack mobile');
    await capture('pointer-stl-stack-mobile');
    assert.deepEqual(errors,[]);
    console.log('Verified array/demo/STL and linked-list/heap pointer labels, coincident lanes, boundaries, invalid input and escaping, rewind, resize alignment, reduced motion, mobile layout and queue/stack endpoints.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
