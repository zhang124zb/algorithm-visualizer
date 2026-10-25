const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json')));
const {chromium}=require(pkg),cases=require('./code-lab-stl-cases.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.goto('http://127.0.0.1:4173/extensions/code-lab/index.html');
    const run=async()=>{
      await page.locator('#run').click();
      await page.waitForFunction(()=>!document.getElementById('run').classList.contains('hidden')&&/已生成|已保留|未完成/.test(document.getElementById('lab-status').textContent));
    };
    assert.equal(await page.locator('#example optgroup option:disabled').count(),4,'Keep the four requested future options visible');
    for(const example of cases){
      await page.locator('#example').selectOption(example.id);await page.locator('#load-example').click();await run();
      assert.equal(await page.locator('#error').isVisible(),false,example.id+': '+await page.locator('#error').textContent());
      const seek=page.locator('#seek'),maximum=Number(await seek.getAttribute('max'));await seek.fill(String(maximum));
      assert.equal(await page.locator('#stdout').textContent(),example.expected,example.id);
      assert.equal(await page.locator('.lab-array-card[data-kind="'+example.expectedKind+'"]').count(),1,example.id+' visualization');
      const card=page.locator('.lab-array-card[data-kind="'+example.expectedKind+'"]');
      if(['vector','string'].includes(example.expectedKind))assert.equal(await card.locator('[data-metric="capacity"]').count(),1,'Show capacity separately from size');
      if(example.expectedKind.startsWith('unordered_')){
        assert.equal(await card.locator('[data-metric="bucketCount"]').count(),1,'Show bucket count');
        assert.equal(await card.locator('[data-metric="loadFactor"]').count(),1,'Show load factor');
        assert.match(await card.textContent(),/不代表遍历顺序或桶布局/);
      }
      assert.equal(await page.locator('#source').inputValue(),example.code,'Keep original user code');
      assert.equal(await page.locator('.code-lines li').count(),example.code.split('\n').length);
      await seek.fill(String(Math.max(2,Math.floor(maximum*.7))));
      const snapshot=await page.locator('#stage').innerHTML(),variables=await page.locator('#variable-grid').innerHTML();
      await page.locator('#previous').click();await page.locator('#next').click();
      assert.equal(await page.locator('#stage').innerHTML(),snapshot,example.id+' backward/forward scene');
      assert.equal(await page.locator('#variable-grid').innerHTML(),variables,example.id+' backward/forward variables');
      if(example.id==='stl-map'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/stl-lab-map-desktop.png'),fullPage:true});}
      if(example.id==='stl-unordered-map'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/stl-capacity-hash-desktop.png'),fullPage:true});}
    }
    await page.locator('#edit-tab').click();
    await page.locator('#source').fill('#include <bits/stdc++.h>\nint main(){\nvector<int> a;\na.reserve(8);\na.resize(2,7);\na.clear();\nreturn 0;\n}');
    await page.locator('#stdin').fill('');await run();
    assert.equal(await page.locator('#error').isVisible(),false,'Capacity-only operations run through the worker');
    const capacityStates=await page.evaluate(()=>{
      const slider=document.getElementById('seek'),states=[];
      for(let i=0;i<=Number(slider.max);i++){
        slider.value=i;slider.dispatchEvent(new Event('input',{bubbles:true}));
        const card=document.querySelector('.lab-array-card[data-array="a"]');
        if(card)states.push({step:i,line:document.querySelector('.code-lines .is-current')?.textContent,message:document.getElementById('step-message').textContent,size:card.querySelector('[data-metric="length"]')?.textContent,capacity:card.querySelector('[data-metric="capacity"]')?.textContent,changed:card.querySelector('[data-metric="capacity"]')?.classList.contains('is-changed'),label:card.querySelector('.lab-array-heading>span').textContent,cells:card.querySelectorAll('.lab-stl-cell').length});
      }
      return states;
    });
    assert.equal(capacityStates[0].capacity,'capacity = 0');
    const reserved=capacityStates.find(s=>s.line.includes('a.reserve(8)')&&s.message.startsWith('执行到'));
    assert.ok(reserved);assert.equal(reserved.size,'size = 0');assert.equal(reserved.capacity,'capacity = 8');assert.equal(reserved.cells,0,'Reserved slots are not actual elements');assert.equal(reserved.changed,true);assert.equal(reserved.label,'本步变化');
    const resized=capacityStates.find(s=>s.line.includes('a.resize(2,7)'));
    assert.equal(resized.size,'size = 2');assert.equal(resized.capacity,'capacity = 8');assert.equal(resized.cells,2);
    const cleared=capacityStates.find(s=>s.line.includes('a.clear()'));
    assert.equal(cleared.size,'size = 0');assert.equal(cleared.capacity,'capacity = 8');assert.equal(cleared.cells,0);
    await page.locator('#seek').fill(String(reserved.step));
    const reservedScene=await page.locator('#stage').innerHTML();
    await page.locator('#next').click();await page.locator('#previous').click();
    assert.equal(await page.locator('#stage').innerHTML(),reservedScene,'Rewind restores reserved capacity and its highlight');
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/stl-capacity-reserve-desktop.png'),fullPage:true});
    await page.locator('#edit-tab').click();
    await page.locator('#source').fill('#include <bits/stdc++.h>\nint main(){\nvector<int> a;\na.push_back(1);\nqueue<int> q;\nq.push(2);\nstack<int> st;\nst.push(3);\nstring text="hi";\nmap<int,int> m;\nm[1]=4;\nint spare[2]={5,6};\na[0]=q.front()+m[1];\nreturn 0;\n}');
    await page.locator('#stdin').fill('');await run();
    assert.equal(await page.locator('#error').isVisible(),false,'Mixed arrays and STL containers');
    await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
    assert.equal(await page.locator('.lab-array-card').count(),3);
    await page.locator('#watch-array').selectOption('text');
    assert.equal(await page.locator('.lab-array-card[data-array="text"]').count(),1,'Manual string pin');
    assert.equal(await page.locator('.lab-array-card').count(),3,'Pins share the three-container limit');
    await page.setViewportSize({width:390,height:844});
    for(const example of cases){
      await page.locator('#example').selectOption(example.id);await page.locator('#load-example').click();await run();
      await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
      assert.equal(await page.locator('#error').isVisible(),false,example.id);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),example.id+' mobile overflow');
    }
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/stl-lab-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/structures/stl/index.html');
    for(const id of ['stl-vector','stl-string']){
      const lesson=await page.locator('#'+id).textContent();
      for(const api of ['reserve','capacity','resize','shrink_to_fit'])assert.ok(lesson.includes(api),id+' documents '+api);
    }
    const hashLesson=await page.locator('#stl-unordered').textContent();
    for(const api of ['reserve','rehash','bucket_count','load_factor','max_load_factor'])assert.ok(hashLesson.includes(api),'Document hash '+api);
    assert.match(hashLesson,/O\(n²\)|O\(n\^2\)/);
    await page.locator('#stl-unordered').scrollIntoViewIfNeeded();await page.screenshot({path:path.resolve(__dirname,'../artifacts/stl-capacity-guide.png')});
    await page.goto('http://127.0.0.1:4173');
    const cardStyle=selector=>page.locator(selector).first().evaluate(e=>({border:getComputedStyle(e).borderTopWidth,radius:getComputedStyle(e).borderTopLeftRadius,icon:getComputedStyle(e.querySelector('.group-icon')).width,badge:getComputedStyle(e.querySelector('.card-bottom>span')).borderRadius,corner:getComputedStyle(e.querySelector('.group-icon'),'::before').content}));
    assert.deepEqual(await cardStyle('#algorithm-grid .category-card'),await cardStyle('#structure-grid .category-card'),'Algorithms use the same card treatment as structures');
    await page.locator('#algorithms').scrollIntoViewIfNeeded();await page.screenshot({path:path.resolve(__dirname,'../artifacts/home-algorithm-cards-unified.png')});
    assert.deepEqual(errors,[]);
    console.log('Verified nine browser STL examples, capacity/bucket metrics, capacity-only changes, rewind, mobile layout, guide APIs, four reserved entries and unified homepage cards.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
