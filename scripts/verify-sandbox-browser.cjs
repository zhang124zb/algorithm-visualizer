// Validate the unavailable-sandbox path against the actual local service and browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createLocalServer}=require('./local-lab/server.cjs'),{checkSandbox}=require('./local-lab/sandbox.cjs');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(p=>fs.existsSync(path.join(p,'package.json')));
const {chromium}=require(pkg);
(async()=>{
  const state=await checkSandbox();if(state.available){console.log('Sandbox is ready; use verify-local-lab-browser.cjs for real execution checks.');return;}
  const server=createLocalServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];let runs=0;page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/native/run'))runs++;});
    await page.goto('http://127.0.0.1:'+server.address().port+'/extensions/code-lab/');await page.waitForFunction(message=>document.querySelector('#native-note').textContent===message,state.message);
    assert.equal(await page.locator('#lab-engine option[value="native"]').evaluate(el=>el.disabled),true);assert.equal(await page.locator('#lab-engine').inputValue(),'browser');
    for(const language of ['cpp','python','java']){
      await page.locator('#lab-language').selectOption(language);await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.startsWith('已生成'));
      assert.equal(await page.locator('#error').isVisible(),false,language);await page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));assert.equal((await page.locator('#stdout').textContent()).trim(),'8 13 17 26 29 35 42 51');
    }
    await page.locator('#lab-language').selectOption('cpp');await page.evaluate(()=>{const engine=document.querySelector('#lab-engine');engine.querySelector('[value="native"]').disabled=false;engine.value='native';engine.dispatchEvent(new Event('change'));});
    await page.locator('#run').click();assert.match(await page.locator('#error').textContent(),/隔离环境未就绪/);assert.equal(runs,0,'Forcing a disabled option must not submit code');
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
    console.log('Verified actual missing-Docker service state: native execution disabled, forced UI bypass blocked, all three browser languages work and mobile layout fits.');
  }finally{if(browser)await browser.close();server.stop();server.closeAllConnections();}
})().catch(error=>{console.error(error);process.exitCode=1;});
