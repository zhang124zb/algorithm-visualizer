const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx'),pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json'))),{chromium}=require(pkg);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],badResponses=[],base='http://127.0.0.1:4173';
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(r.url());});
    await page.goto(base);const entry=page.locator('a[href="extensions/competition/index.html"]').last();assert.match(await entry.textContent(),/开始学习/);
    await page.locator('#search-input').fill('LCA');assert.equal(await page.locator('.result-row').count(),1);assert.match(await page.locator('.result-row').getAttribute('href'),/extensions\/competition/);
    await page.goto(base+'/extensions/competition/index.html');assert.equal(await page.locator('.category-card').count(),12);
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/competition-desktop.png'),fullPage:true});
    await page.locator('#competition-search').fill('背包');assert.equal(await page.locator('.result-row').count(),2);assert.equal(await page.locator('.result-row').first().getAttribute('target'),'_blank');
    await page.locator('#competition-search').fill('不存在');assert.equal(await page.locator('.empty-search').count(),1);await page.locator('#competition-search').fill('');
    const items=await page.evaluate(()=>AlgoLab.competitionItems.map(x=>({id:x.id,path:x.path})));let frames=0;
    for(const item of items){
      await page.goto(base+'/'+item.path);assert.equal(await page.locator('#error').isVisible(),false,item.id);
      for(const language of ['cpp','python','java']){
        await page.locator('#code-language').selectOption(language);
        frames+=await page.evaluate(()=>{
          const seek=document.getElementById('seek'),max=Number(seek.max);
          for(let i=0;i<=max;i++){seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));if(document.querySelectorAll('.code-lines .is-current').length!==1)throw Error('Invalid highlight');if(!document.getElementById('stage').textContent&&!document.querySelector('#stage svg'))throw Error('Empty stage');}
          return max+1;
        });
        assert.equal(await page.locator('#play-status').textContent(),'执行完成',item.id+'/'+language);
      }
      await page.locator('#restart').click();assert.equal(await page.locator('#seek').inputValue(),'0');await page.locator('#next').click();
      const snapshot=await page.locator('#stage').innerHTML();await page.locator('#previous').click();await page.locator('#next').click();assert.equal(await page.locator('#stage').innerHTML(),snapshot,item.id+' rewind');
      const input=await page.locator('#input-data').textContent();await page.locator('#code-language').selectOption('cpp');assert.equal(await page.locator('#input-data').textContent(),input,'Language preserves input');assert.equal(await page.locator('#seek').inputValue(),'1');
      await page.locator('#randomize').click();assert.equal(await page.locator('#seek').inputValue(),'0');assert.equal(await page.locator('#error').isVisible(),false);
      if(item.id==='binary-lca'){await page.locator('#seek').fill(String(Math.floor(Number(await page.locator('#seek').getAttribute('max'))*.7)));await page.screenshot({path:path.resolve(__dirname,'../artifacts/competition-lca-desktop.png'),fullPage:true});}
    }
    await page.goto(base+'/extensions/competition/offline/mo-distinct.html');await page.locator('#speed').selectOption('4');await page.locator('#play').click();await page.waitForTimeout(500);await page.locator('#code-language').selectOption('python');assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');const paused=await page.locator('#seek').inputValue();await page.waitForTimeout(250);assert.equal(await page.locator('#seek').inputValue(),paused);
    await page.setViewportSize({width:390,height:844});await page.goto(base+'/extensions/competition/index.html');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.resolve(__dirname,'../artifacts/competition-mobile.png'),fullPage:true});
    for(const path of ['dynamic/edit-distance','geometry/convex-hull','offline/mo-distinct','foundations/prefix-2d']){
      await page.goto(base+'/extensions/competition/'+path+'.html');await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' mobile overflow');
    }
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/competition-player-mobile.png'),fullPage:true});
    const file=require('node:url').pathToFileURL(path.resolve(__dirname,'../dist/extensions/competition/text/manacher.html')).href;await page.goto(file);assert.equal(await page.locator('#error').isVisible(),false,'Offline direct opening');await page.locator('#next').click();
    assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);console.log(`Verified all 36 competition pages, ${frames} browser frames across three languages, navigation/search, replay, random data, mobile layout and offline opening.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
