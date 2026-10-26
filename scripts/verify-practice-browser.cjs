const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'..'),cache=path.join(project,'artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/playwright')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
if(!pkg)throw Error('Playwright is unavailable in the local test cache.');
const {chromium}=require(pkg),base=(process.env.ALGOLAB_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,''),context=vm.createContext({});
for(const file of ['core','catalog'])vm.runInContext(fs.readFileSync(path.join(project,'dist/assets/js/'+file+'.js'),'utf8'),context);
const items=JSON.parse(JSON.stringify(context.AlgoLab.allItems)),practice=require('./practice-data.cjs').loadPracticeLists(path.join(project,'算法训练题单'),items.map(item=>item.id));
const selected=['array','binary-search','stack','dijkstra','heap-dijkstra','singly-linked-list','grid-paths'];
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{
      if(response.url()===base+'/api/native/health'&&response.status()===404)return;
      if(response.url().startsWith(base+'/')&&response.status()>=400)errors.push(response.status()+' '+response.url());
    });
    const noOverflow=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' horizontal overflow');
    const atBottom=async id=>assert.ok(await page.locator('.practice-list').evaluate(list=>{
      const main=list.closest('main'),details=main.querySelector('.input-details');
      return main.lastElementChild===list&&list.getBoundingClientRect().top>=details.getBoundingClientRect().bottom&&getComputedStyle(list).position!=='fixed';
    }),id+' exercises follow input/output and are last in main');
    for(const id of selected){
      const item=items.find(item=>item.id===id),topic=practice.get(id);assert.ok(item&&topic);
      await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/'+item.path);
      assert.equal(await page.locator('#error').isVisible(),false,id+' animation initializes');
      const list=page.locator('.practice-list');assert.equal(await list.count(),1);assert.equal(await list.getAttribute('data-topic'),id);
      assert.deepEqual(await list.locator('.practice-tier').evaluateAll(nodes=>nodes.map(node=>node.dataset.level)),['模板','基础','进阶','困难']);
      assert.equal(await list.locator('.practice-problem-link').count(),topic.problems.length);
      const links=await list.locator('.practice-problem-link').evaluateAll(nodes=>nodes.map(node=>({url:node.href,target:node.target,rel:node.rel,title:node.textContent.replace(/\s*↗\s*$/,'').trim()})));
      assert.deepEqual(links,topic.problems.map(problem=>({url:problem.url,target:'_blank',rel:'noopener noreferrer',title:problem.title})));
      const original=await list.innerHTML();await atBottom(id);await noOverflow(id+' desktop');
      await page.locator('#restart').click();await page.locator('#next').click();const step=await page.locator('#step-message').textContent();
      await page.locator('#previous').click();await page.locator('#next').click();assert.equal(await page.locator('#step-message').textContent(),step,id+' rewind');
      for(const language of ['cpp','python','java']){await page.locator('#code-language').selectOption(language);assert.equal(await page.locator('#seek').inputValue(),'1');assert.equal(await page.locator('.code-lines .is-current').count(),1);}
      assert.equal(await list.innerHTML(),original,id+' animation controls preserve the practice list');
      if(id==='binary-search'){
        await page.locator('#speed').selectOption('4');await page.locator('#play').click();await page.waitForFunction(()=>Number(document.getElementById('seek').value)>1);
        if(await page.locator('#play').getAttribute('aria-pressed')==='true')await page.locator('#play').click();
        const paused=await page.locator('#seek').inputValue();await page.waitForTimeout(400);assert.equal(await page.locator('#seek').inputValue(),paused);
        await list.scrollIntoViewIfNeeded();await list.screenshot({path:path.join(project,'artifacts/practice-binary-desktop.png')});
      }
      await page.locator('.input-details summary').click();await atBottom(id+' input expanded');
      await page.setViewportSize({width:390,height:844});await list.scrollIntoViewIfNeeded();await atBottom(id+' mobile');await noOverflow(id+' mobile');
      assert.ok(await list.evaluate(list=>{const r=list.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;}),id+' mobile practice stays inside viewport');
      if(id==='array'||id==='singly-linked-list')await list.screenshot({path:path.join(project,'artifacts/practice-'+id+'-mobile.png')});
      if(id==='singly-linked-list'){
        await list.evaluate(list=>scrollTo(0,scrollY+list.getBoundingClientRect().top-80));
        assert.ok(await list.evaluate(list=>list.querySelector('h2').getBoundingClientRect().top>document.querySelector('.site-header').getBoundingClientRect().bottom),'Mobile practice heading remains below the site header');
        await page.screenshot({path:path.join(project,'artifacts/practice-singly-linked-list-mobile-viewport.png')});
      }
    }
    await page.context().route(/^https:\/\/(?:www\.luogu\.com\.cn|codeforces\.com|cses\.fi)\//,route=>route.fulfill({contentType:'text/html',body:'<title>Official problem navigation test</title>'}));
    await page.goto(base+'/algorithms/search/binary-search.html');
    const first=page.locator('.practice-problem-link').first(),wanted=await first.getAttribute('href');
    const beforeSpace=await page.locator('#seek').inputValue();await first.focus();await page.keyboard.press('Space');
    assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false','Space on a focused problem link must not start the animation');
    assert.equal(await page.locator('#seek').inputValue(),beforeSpace);
    const popupPromise=page.waitForEvent('popup');await first.click();const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),wanted);await popup.close();
    for(const url of ['','algorithms/search/index.html','extensions/competition/index.html','structures/stl/index.html','structures/pointers/index.html','extensions/code-lab/index.html']){
      await page.goto(base+'/'+url);assert.equal(await page.locator('.practice-list').count(),0,url+' unchanged scope');
    }
    await page.goto(require('node:url').pathToFileURL(path.join(project,'dist/algorithms/search/binary-search.html')).href);
    assert.equal(await page.locator('.practice-problem-link').count(),6);await page.locator('#next').click();assert.equal(await page.locator('#error').isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log('Verified practice lists on seven representative animation pages, original controls/languages, official-link new tabs, desktop/mobile layout, bottom placement, offline opening and excluded classrooms.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
