const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json')));
const {chromium}=require(pkg),cases=require('./code-lab-array-cases.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/extensions/code-lab/index.html');
    const seek=page.locator('#seek'),cards=page.locator('.lab-array-card');
    async function run(code){
      await page.locator('#edit-tab').click();await page.locator('#source').fill(code);await page.locator('#run').click();
      await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.startsWith('已生成'));
      assert.equal(await page.locator('#error').isVisible(),false);
    }
    async function names(){return cards.evaluateAll(els=>els.map(e=>e.dataset.array));}
    async function values(name){return page.locator('.lab-array-card').filter({has:page.locator('h3',{hasText:new RegExp('^'+name+' ')})}).locator('.array-cell').evaluateAll(els=>els.sort((a,b)=>parseFloat(a.style.left)-parseFloat(b.style.left)).map(e=>e.querySelector('.array-value').textContent));}
    async function line(code,needle){
      const target=code.split('\n').findIndex(s=>s.includes(needle))+1;
      for(let i=0;i<=Number(await seek.getAttribute('max'));i++){
        await seek.fill(String(i));if(Number(await page.locator('.code-lines .is-current').getAttribute('data-line'))===target)return i;
      }
      throw Error('Line not found: '+needle);
    }
    await run(cases.two);const pairStep=await line(cases.two,'b[1] =');
    assert.deepEqual(await names(),['a','b']);assert.deepEqual(await values('a'),['1','2','3']);assert.deepEqual(await values('b'),['6','7','0']);
    await page.locator('#previous').click();assert.deepEqual(await values('b'),['6','0','0']);await page.locator('#next').click();assert.equal(await seek.inputValue(),String(pairStep));assert.deepEqual(await values('b'),['6','7','0']);
    await page.locator('#watch-array').selectOption('a');assert.deepEqual(await names(),['a','b'],'Selecting an array must retain the second array');
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-two-arrays.png'),fullPage:true});
    await run(cases.three);await line(cases.three,'c[0] =');assert.deepEqual(await names(),['a','b','c']);assert.deepEqual(await values('c'),['13','0','0']);
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-three-arrays.png'),fullPage:true});
    await run(cases.many);const activeStep=await line(cases.many,'d[i] =');
    assert.deepEqual(await names(),['a','c','d']);assert.match(await page.locator('#array-summary').textContent(),/5 个数组.*3 个.*unused.*b/);
    await page.locator('#previous').click();assert.deepEqual(await names(),['a','b','c']);await page.locator('#next').click();assert.deepEqual(await names(),['a','c','d']);
    await seek.fill('0');assert.equal(await cards.count(),0);await seek.fill(String(activeStep));assert.deepEqual(await names(),['a','c','d'],'Seeking must restore the same important arrays');
    await page.locator('#watch-array').selectOption('unused');assert.deepEqual(await names(),['unused','a','d']);assert.deepEqual(await values('unused'),['9','9']);assert.equal(await cards.count(),3);
    await page.locator('#watch-array').selectOption('');assert.deepEqual(await names(),['a','c','d']);
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-priority-arrays.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await cards.count(),3);
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-three-arrays-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1050});await run(cases.mixed);await line(cases.mixed,'matrix[1][1] =');assert.deepEqual(await names(),['matrix','values']);assert.equal(await page.locator('[data-array="matrix"] .matrix-table').count(),1);assert.equal(await page.locator('[data-array="values"] .array-stage').count(),1);assert.deepEqual(await page.locator('[data-array="matrix"] tbody td').allTextContents(),['4','8','12','16']);
    await run(cases.scope);await line(cases.scope,'base[0] =');assert.deepEqual(await names(),['base','scratch']);await page.locator('#watch-array').selectOption('scratch');await line(cases.scope,'base[1] =');assert.deepEqual(await names(),['base']);assert.match(await page.locator('#array-summary').textContent(),/scratch.*不可见/);await page.locator('#previous').click();assert.deepEqual(await names(),['base','scratch']);
    await run(cases.shadow);await line(cases.shadow,'a[0] =');assert.match(await page.locator('.lab-array-heading').textContent(),/int\[3\]/);assert.deepEqual(await values('a'),['8','4','5']);await line(cases.shadow,'a[1] =');assert.match(await page.locator('.lab-array-heading').textContent(),/int\[2\]/);assert.deepEqual(await values('a'),['1','9']);
    assert.deepEqual(errors,[]);console.log('Verified simultaneous 2/3 arrays, 5-array relevance/pins, synchronized back/forward/seek, matrix combinations, scope changes and mobile layout.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
