const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'..','artifacts','npm-cache','_npx');
const packageRoot=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules','playwright')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
if(!packageRoot)throw new Error('Playwright is unavailable in the local test cache.');
const {chromium}=require(packageRoot);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const base='http://127.0.0.1:4173';
    await page.goto(base,{waitUntil:'networkidle'});
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/home-desktop.png'),fullPage:true});
    assert.equal(await page.locator('.category-card').count(),await page.evaluate(()=>AlgoLab.catalogGroups.length));
    assert.equal(await page.locator('#structure-grid .category-card').count(),9);
    assert.equal(await page.locator('#algorithm-grid .category-card').count(),11);
    await page.locator('#search-input').fill('二分');
    const expectedMatches=await page.evaluate(()=>AlgoLab.allItems.filter(x=>(x.title+' '+x.id+' '+x.groupTitle+' '+x.description).toLowerCase().includes('二分')).length);
    assert.equal(await page.locator('.result-row').count(),expectedMatches);
    assert.equal(await page.locator('.result-row').first().getAttribute('target'),'_blank');
    await page.locator('#search-input').fill('不存在的算法');
    assert.equal(await page.locator('.empty-search').count(),1);
    await page.locator('#search-input').fill('');
    const items=await page.evaluate(()=>AlgoLab.items.map(item=>({id:item.id,path:item.path})));
    let frames=0;
    for(const item of items){
      await page.goto(base+'/'+item.path,{waitUntil:'load'});
      assert.equal(await page.locator('#error').isVisible(),false,item.id);
      frames+=await page.evaluate(()=>{
        const seek=document.getElementById('seek'),max=Number(seek.max);
        for(let i=0;i<=max;i++){
          seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));
          if(document.querySelectorAll('.code-lines .is-current').length!==1)throw new Error('Invalid highlight');
          if(!document.getElementById('stage').textContent&&!document.querySelector('#stage svg'))throw new Error('Empty animation');
        }
        return max+1;
      });
      assert.equal(await page.locator('#play-status').textContent(),'执行完成',item.id);
      await page.locator('#restart').click();
      assert.equal(await page.locator('#previous').isDisabled(),true,item.id);
    }
    await page.goto(base+'/algorithms/search/binary-search.html');
    const initial=await page.locator('#input-data').textContent();
    await page.locator('#next').click();
    const second=await page.locator('#stage').innerHTML();
    await page.locator('#next').click();await page.locator('#previous').click();
    assert.equal(await page.locator('#stage').innerHTML(),second,'Back restores the complete animation state');
    await page.locator('#restart').click();
    assert.equal(await page.locator('#input-data').textContent(),initial,'Restart must preserve input');
    await page.locator('#speed').selectOption('4');await page.locator('#play').click();
    await page.waitForTimeout(500);await page.locator('#play').click();
    const paused=await page.locator('#seek').inputValue();await page.waitForTimeout(350);
    assert.equal(await page.locator('#seek').inputValue(),paused,'Pause must stop the timer');
    await page.locator('#randomize').click();assert.equal(await page.locator('#seek').inputValue(),'0');
    await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/player-desktop.png'),fullPage:true});
    assert.ok(Math.abs((await page.locator('.visualization-panel').boundingBox()).width/(await page.locator('.code-panel').boundingBox()).width-1.5)<.03);
    await page.setViewportSize({width:390,height:844});await page.goto(base);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Home mobile overflow');
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/home-mobile.png'),fullPage:true});
    await page.goto(base+'/algorithms/dp/lcs.html');
    await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Player mobile overflow');
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/player-mobile.png'),fullPage:true});
    const fileUrl=require('node:url').pathToFileURL(path.resolve(__dirname,'../dist/algorithms/search/binary-search.html')).href;
    await page.goto(fileUrl);assert.equal(await page.locator('#error').isVisible(),false,'Offline file opening');await page.locator('#next').click();assert.equal(await page.locator('#seek').inputValue(),'1');
    assert.deepEqual(errors,[]);
    console.log(`Browser verified all ${items.length} demonstrations and ${frames} rendered frames, controls, desktop/mobile layout, search and offline file opening.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
