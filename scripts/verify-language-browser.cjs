const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const packageRoot=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/playwright')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
const {chromium}=require(packageRoot);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const base='http://127.0.0.1:4173';await page.goto(base);
    const items=await page.evaluate(()=>AlgoLab.items.map(item=>({id:item.id,path:item.path})));
    const scene=()=>page.locator('#stage').evaluate(element=>{
      const clone=element.cloneNode(true),box=clone.querySelector('.array-stage');
      if(box){const cells=[...box.querySelectorAll('.array-cell')].sort((a,b)=>parseFloat(a.style.left)-parseFloat(b.style.left));for(const cell of cells)box.append(cell);}
      return clone.innerHTML;
    });
    let frames=0;
    for(const item of items){
      await page.goto(base+'/'+item.path,{waitUntil:'load'});
      assert.equal(await page.locator('#error').isVisible(),false,item.id);
      const input=await page.locator('#input-data').textContent();
      await page.locator('#seek').fill('2');
      const stage=await scene();
      for(const language of ['cpp','python','java']){
        await page.locator('#code-language').selectOption(language);
        assert.equal(await page.locator('#input-data').textContent(),input,item.id+' input changed');
        assert.equal(await page.locator('#seek').inputValue(),'2',item.id+' progress changed');
        assert.equal(await scene(),stage,item.id+' scene changed');
        frames+=await page.evaluate(({id,language})=>{
          const seek=document.getElementById('seek'),max=Number(seek.max);
          for(let i=0;i<=max;i++){
            seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));
            const active=document.querySelectorAll('.code-lines .is-current');
            if(active.length!==1)throw new Error(id+'/'+language+' missing highlight');
            const line=Number(active[0].dataset.line);
            if(language!=='cpp'&&active[0].textContent!==AlgoLab.codeVersions[id][language].code[line-1])throw new Error('Wrong language line');
            if(document.getElementById('error').offsetHeight)throw new Error('Visible error');
          }
          return max+1;
        },{id:item.id,language});
        await page.locator('#seek').fill('2');
      }
    }
    await page.goto(base+'/algorithms/search/binary-search.html');
    await page.locator('#code-language').selectOption('python');
    assert.equal(await page.locator('.syntax-comment').filter({hasText:'// 2'}).count(),0,'Python floor division is not a comment');
    await page.locator('#next').click();await page.locator('#next').click();
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/python-desktop.png'),fullPage:true});
    await page.locator('#speed').selectOption('4');await page.locator('#play').click();
    await page.locator('#code-language').selectOption('java');
    const paused=await page.locator('#seek').inputValue();await page.waitForTimeout(350);
    assert.equal(await page.locator('#seek').inputValue(),paused,'Language change must pause playback');
    assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/java-desktop.png'),fullPage:true});
    await page.goto(base+'/algorithms/sorting/quick-sort.html');
    assert.equal(await page.locator('#code-language').inputValue(),'java','Language preference across pages');
    await page.setViewportSize({width:390,height:844});
    await page.locator('#code-language').selectOption('python');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/python-mobile.png'),fullPage:true});
    const file=require('node:url').pathToFileURL(path.resolve(__dirname,'../dist/algorithms/search/binary-search.html')).href;
    await page.goto(file);await page.locator('#code-language').selectOption('java');await page.locator('#next').click();
    assert.equal(await page.locator('#error').isVisible(),false,'Offline languages');
    const blocked=await browser.newPage();
    blocked.on('pageerror',error=>errors.push(error.message));
    await blocked.addInitScript(()=>{
      Storage.prototype.getItem=()=> 'constructor';
      Storage.prototype.setItem=()=>{throw new DOMException('Storage full','QuotaExceededError');};
    });
    await blocked.goto(base+'/algorithms/search/binary-search.html');
    assert.equal(await blocked.locator('#code-language').inputValue(),'cpp','Invalid saved language falls back to C++');
    await blocked.locator('#code-language').selectOption('python');
    assert.equal(await blocked.locator('#error').isVisible(),false,'Storage failure must not break language switching');
    await blocked.close();
    assert.deepEqual(errors,[]);
    console.log(`Browser verified ${items.length} × 3 language choices, ${frames} rendered frames, unchanged input/scene/progress, pause, saved preference, mobile and offline use.`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
