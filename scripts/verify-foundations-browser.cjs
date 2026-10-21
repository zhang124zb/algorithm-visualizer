const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json')));
const {chromium}=require(pkg);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],base='http://127.0.0.1:4173';
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.goto(base);
    assert.equal(await page.locator('#structure-grid .category-card').count(),8);
    assert.equal(await page.locator('#algorithm-grid .category-card').count(),11);
    const groups=await page.evaluate(()=>AlgoLab.groups.map(g=>({path:g.section+'/'+g.id+'/index.html',entries:g.entries.map(x=>x.path)})));
    const items=await page.evaluate(()=>AlgoLab.foundationIds.map(id=>AlgoLab.item(id)));
    for(const g of groups){
      await page.goto(base+'/'+g.path);
      const links=await page.locator('.algorithm-card').evaluateAll(els=>els.map(a=>({path:new URL(a.href).pathname.slice(1),target:a.target,level:a.querySelector('.badge')?.textContent})));
      assert.deepEqual(links.map(x=>x.path),g.entries,g.path);
      assert.ok(links.every(x=>x.target==='_blank'&&['入门','常用提高','选学'].includes(x.level)),g.path);
    }
    await page.goto(base+'/structures/advanced/disjoint-set.html');
    assert.equal(await page.locator('.breadcrumb a').nth(2).textContent(),'并查集');
    assert.match(await page.locator('.breadcrumb a').nth(2).getAttribute('href'),/structures\/sets\/index.html$/);
    await page.goto(base+'/extensions/competition/index.html');
    assert.doesNotMatch(await page.locator('details').textContent(),/剪枝|记忆化搜索/);
    let frames=0;
    const scene=()=>page.locator('#stage').evaluate(el=>{
      const copy=el.cloneNode(true),a=copy.querySelector('.array-stage');
      if(a)for(const cell of [...a.querySelectorAll('.array-cell')].sort((x,y)=>parseFloat(x.style.left)-parseFloat(y.style.left)))a.append(cell);
      return copy.innerHTML;
    });
    for(const item of items){
      await page.goto(base+'/'+item.path);
      assert.equal(await page.locator('#error').isVisible(),false,item.id);
      assert.ok(await page.locator('.lesson-prerequisites a').count(),item.id);
      const initial=await page.locator('#input-data').textContent();
      await page.locator('#next').click();const snap=await scene();
      await page.locator('#previous').click();await page.locator('#next').click();
      assert.equal(await scene(),snap,item.id+' rewind');
      for(const language of ['cpp','python','java']){
        await page.locator('#code-language').selectOption(language);
        assert.equal(await page.locator('#seek').inputValue(),'1');
        assert.equal(await scene(),snap,item.id+' language preserves scene');
        frames+=await page.evaluate(({id,language})=>{
          const seek=document.getElementById('seek'),max=Number(seek.max);
          for(let i=0;i<=max;i++){
            seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));
            const active=document.querySelectorAll('.code-lines .is-current');
            if(active.length!==1)throw Error(id+'/'+language+' invalid highlight');
            if(!active[0].textContent.trim()||/^\s*(#|\/\/)/.test(active[0].textContent))throw Error('Non executable highlight');
            if(!document.getElementById('stage').textContent&&!document.querySelector('#stage svg'))throw Error('Empty scene');
          }
          return max+1;
        },{id:item.id,language});
        assert.equal(await page.locator('#play-status').textContent(),'执行完成');
        await page.locator('#seek').fill('1');
      }
      assert.equal(await page.locator('#input-data').textContent(),initial);
      await page.locator('#randomize').click();assert.equal(await page.locator('#seek').inputValue(),'0');
      assert.equal(await page.locator('#error').isVisible(),false,item.id+' random');
      await page.setViewportSize({width:390,height:844});
      await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),item.id+' mobile overflow');
      if(item.id==='grid-paths')await page.screenshot({path:path.resolve(__dirname,'../artifacts/foundations-grid-mobile.png'),fullPage:true});
      await page.setViewportSize({width:1440,height:1000});
    }
    await page.goto(base+'/structures/sets/dsu-size.html');
    await page.locator('#code-language').selectOption('cpp');
    await page.locator('#seek').fill(String(Math.floor(Number(await page.locator('#seek').getAttribute('max'))*.6)));
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/foundations-dsu-desktop.png'),fullPage:true});
    await page.goto(base+'/algorithms/methods/index.html');
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/foundations-directory.png'),fullPage:true});
    const offline=require('node:url').pathToFileURL(path.resolve(__dirname,'../dist/algorithms/methods/recursion.html')).href;
    await page.goto(offline);await page.locator('#code-language').selectOption('python');await page.locator('#next').click();
    assert.equal(await page.locator('#error').isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log(`Verified 19 new pages, ${frames} frames in 3 languages, all 19 category links, old DSU URL, mobile layout and offline opening.`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
