const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createLocalServer}=require('./local-lab/server.cjs'),{checkSandbox}=require('./local-lab/sandbox.cjs');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(p=>fs.existsSync(path.join(p,'package.json')));
const {chromium}=require(pkg);
(async()=>{
  const readiness=await checkSandbox();assert.ok(readiness.available,readiness.message);
  const server=createLocalServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.goto('http://127.0.0.1:'+server.address().port+'/extensions/code-lab/');
    await page.waitForFunction(()=>!document.querySelector('#lab-engine option[value="native"]').disabled);
    const run=async()=>{await page.locator('#run').click();await page.waitForFunction(()=>!document.querySelector('#run').classList.contains('hidden')&&/已生成|已保留|执行未完成/.test(document.querySelector('#lab-status').textContent),{},{timeout:90000});};
    const last=async()=>page.locator('#seek').fill(await page.locator('#seek').getAttribute('max'));
    const edit=async code=>{await page.locator('#edit-tab').click();await page.locator('#source').fill(code);};
    await page.locator('#lab-engine').selectOption('native');await run();assert.equal(await page.locator('#error').isVisible(),false,await page.locator('#error').textContent());await last();assert.equal((await page.locator('#stdout').textContent()).trim(),'8 13 17 26 29 35 42 51');
    const code='#include <iostream>\nint main(){\nint a[2]={1,2};\nint b[2]={3,4};\na[0]=7;\nb[1]=a[0]+1;\nstd::cout<<b[1]<<"\\n";\nreturn 0;\n}';
    await edit(code);await run();assert.equal(await page.locator('#error').isVisible(),false);await last();assert.equal(await page.locator('.lab-array-card').count(),2);assert.equal(await page.locator('#stdout').textContent(),'8\n');assert.equal(await page.locator('.is-current').count(),1);
    await page.locator('#restart').click();const first=await page.locator('#variable-grid').textContent();await page.locator('#next').click();await page.locator('#previous').click();assert.equal(await page.locator('#variable-grid').textContent(),first);assert.equal(await page.locator('#stdout').textContent(),'（当前步骤尚无输出）');
    await page.locator('#speed').selectOption('4');await page.locator('#play').click();await page.waitForTimeout(200);await page.locator('#play').click();assert.ok(Number(await page.locator('#seek').inputValue())>0);
    await edit('int main(){\nint a[2]={1,2};\nint b[2]={3,4};\nint c[2]={5,6};\nint d[2]={7,8};\na[0]=9;\nreturn 0;\n}');await run();await last();assert.equal(await page.locator('.lab-array-card').count(),3);assert.match(await page.locator('#array-summary').textContent(),/4 个数组/);await page.locator('#watch-array').selectOption('d');assert.equal(await page.locator('.lab-array-card[data-array="d"]').count(),1);
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/native-cpp-lab-desktop.png'),fullPage:true});
    await edit('int main(){\nint x=;\n}');await run();assert.match(await page.locator('#error').textContent(),/第 2 行.*编译失败/s);
    await edit('#include <thread>\n#include <chrono>\nint main(){\nstd::this_thread::sleep_for(std::chrono::seconds(30));\n}');await page.locator('#run').click();await page.waitForTimeout(1500);await page.locator('#stop').click();assert.match(await page.locator('#lab-status').textContent(),/已停止/);await page.waitForTimeout(500);
    await edit(code);await run();assert.equal(await page.locator('#error').isVisible(),false,'A fresh run must work after cancellation');
    for(const language of ['python','java']){
      await page.locator('#lab-language').selectOption(language);assert.equal(await page.locator('#lab-engine').inputValue(),'browser');assert.equal(await page.locator('#lab-engine').isDisabled(),true);
      await page.locator('#example').selectOption('bubble');await page.locator('#load-example').click();await run();assert.equal(await page.locator('#error').isVisible(),false,language);await last();assert.equal((await page.locator('#stdout').textContent()).trim(),'8 13 17 26 29 35 42 51');
    }
    await page.locator('#lab-language').selectOption('cpp');await page.locator('#lab-engine').selectOption('browser');await page.locator('#example').selectOption('bubble');await page.locator('#load-example').click();await run();assert.equal(await page.locator('#error').isVisible(),false,'Browser C++ remains usable');await last();assert.equal((await page.locator('#stdout').textContent()).trim(),'8 13 17 26 29 35 42 51');
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile width');
    assert.deepEqual(errors,[]);console.log('Verified native mode discovery, real bubble sort, two/four array display and pinning, synchronized output/highlights, playback, compile errors, cancellation/retry, all browser languages and mobile layout.');
  }finally{if(browser)await browser.close();server.stop();server.closeAllConnections();}
})().catch(error=>{console.error(error);process.exitCode=1;});
