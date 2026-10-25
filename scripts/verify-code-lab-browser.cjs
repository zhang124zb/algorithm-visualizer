const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json')));
const {chromium}=require(pkg);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173');
    const entry=page.getByRole('link',{name:/C\+\+ 代码实验室/});assert.equal(await entry.getAttribute('target'),'_blank');
    await page.goto('http://127.0.0.1:4173/extensions/code-lab/index.html');
    const source=page.locator('#source'),stdin=page.locator('#stdin'),run=page.locator('#run'),seek=page.locator('#seek');
    const wait=async()=>{await page.waitForFunction(()=>!document.querySelector('#run').classList.contains('hidden')&&document.querySelector('#lab-status').textContent.match(/已生成|已保留|执行未完成/));};
    await run.click();await wait();assert.equal(await page.locator('#error').isVisible(),false);
    const max=Number(await seek.getAttribute('max'));assert.ok(max>100);
    await seek.fill(String(max));assert.equal(await page.locator('#stdout').textContent(),'8 13 17 26 29 35 42 51 ');
    await page.locator('#restart').click();assert.equal(await seek.inputValue(),'0');
    assert.equal(await page.locator('#stdout').textContent(),'（当前步骤尚无输出）');
    await page.locator('#next').click();assert.equal(await seek.inputValue(),'1');
    const vars=await page.locator('#variable-grid').textContent();await page.locator('#previous').click();await page.locator('#next').click();assert.equal(await page.locator('#variable-grid').textContent(),vars);
    await page.locator('#speed').selectOption('4');await page.locator('#play').click();await page.waitForTimeout(400);await page.locator('#play').click();assert.ok(Number(await seek.inputValue())>1);
    const paused=await seek.inputValue();await page.waitForTimeout(220);assert.equal(await seek.inputValue(),paused);
    await seek.fill('35');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-desktop.png'),fullPage:true});
    await page.locator('#edit-tab').click();const original=await source.inputValue();await source.fill(original.replace('a[j] > a[j + 1]','a[j] < a[j + 1]'));
    assert.equal(await page.locator('#play').isDisabled(),true,'Editing invalidates stale replay');
    await run.click();await wait();await seek.fill(await seek.getAttribute('max'));assert.equal(await page.locator('#stdout').textContent(),'51 42 35 29 26 17 13 8 ');
    await page.locator('#edit-tab').click();await stdin.fill('4\n-3 2 2 -8');await run.click();await wait();await seek.fill(await seek.getAttribute('max'));assert.equal(await page.locator('#stdout').textContent(),'2 2 -3 -8 ');
    await page.reload();assert.match(await source.inputValue(),/a\[j\] < a\[j \+ 1\]/);assert.equal(await stdin.inputValue(),'4\n-3 2 2 -8');
    page.on('dialog',d=>d.accept());
    for(const [id,output]of [['prefix','37\n'],['matrix','100\n'],['recursion','120\n'],['binary','3\n']]){
      await page.locator('#example').selectOption(id);await page.locator('#load-example').click();await run.click();await wait();
      assert.equal(await page.locator('#error').isVisible(),false,id);
      const n=Number(await seek.getAttribute('max'));
      for(let i=0;i<=n;i++){
        await seek.fill(String(i));
        assert.equal(await page.locator('.code-lines .is-current').count(),1,id+' highlight '+i);
      }
      assert.equal(await page.locator('#stdout').textContent(),output,id);
      if(id==='prefix'){await page.locator('#watch-array').selectOption('a');await seek.fill('18');assert.match(await page.locator('#stage').textContent(),/a · int/);await page.locator('#watch-array').selectOption('prefix');}
      if(id==='recursion'){await seek.fill('10');assert.ok(Number((await page.locator('#stack-count').textContent()).split(' ')[0])>2);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-recursion.png'),fullPage:true});}
    }
    await page.locator('#edit-tab').click();await source.fill('int main(){\nint a = ;\nreturn 0;\n}');await run.click();await wait();assert.equal(await page.locator('#error').isVisible(),true);assert.match(await page.locator('#error').textContent(),/Parsing Failure/);
    await source.fill('#include <iostream>\nusing namespace std;\nint main(){\nint a[2] = {1,2};\na[8]=5;\nreturn 0;\n}');await run.click();await wait();assert.match(await page.locator('#lab-status').textContent(),/已保留/);await seek.fill(await seek.getAttribute('max'));assert.equal(await page.locator('.lab-error-line').count(),1);
    await page.locator('#edit-tab').click();await source.fill('int main(){\nwhile(true) {}\nreturn 0;\n}');await run.click();await page.locator('#stop').click();assert.match(await page.locator('#lab-status').textContent(),/已停止/);
    await page.locator('#example').selectOption('bubble');await page.locator('#load-example').click();const old=await stdin.inputValue();await page.locator('#random-input').click();assert.notEqual(await stdin.inputValue(),old);await run.click();await wait();assert.equal(await page.locator('#error').isVisible(),false,'Fresh run after cancellation');
    await page.setViewportSize({width:390,height:844});await seek.fill('35');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile horizontal overflow');
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.resolve(__dirname,'../artifacts/cpp-lab-mobile.png'),fullPage:true});
    await page.locator('#edit-tab').click();await source.fill('int main(){\nint a[100];\nfor(int i=0;i<100;i++){\na[i]=i;\n}\nreturn 0;\n}');await run.click();await wait();await seek.fill('8');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Large arrays must scroll inside their stage');
    assert.match(await page.locator('#stage').textContent(),/前 64/);
    assert.ok(await page.locator('.lab-array-canvas').evaluate(e=>e.scrollWidth>e.clientWidth),'Large array remains readable with internal scrolling');
    await page.locator('#edit-tab').click();await source.fill('int main(){\nint a = 1;\nreturn a;\n}');
    const download=page.waitForEvent('download');await page.locator('#download-code').click();assert.equal((await download).suggestedFilename(),'main.cpp');
    const restore=await source.inputValue();await page.locator('#example').selectOption('prefix');page.removeAllListeners('dialog');page.once('dialog',d=>d.dismiss());await page.locator('#load-example').click();assert.equal(await source.inputValue(),restore,'Cancelling template overwrite must preserve user code');
    const io=require('./code-lab-io-cases.cjs');
    for(const header of ['iostream','bits/stdc++.h'])for(const [input,output]of io.cases){
      const code=io.code.replace('<iostream>','<'+header+'>');
      await page.locator('#edit-tab').click();await source.fill(code);await stdin.fill(input);await run.click();await wait();
      assert.equal(await page.locator('#error').isVisible(),false,'Qualified C++ stream program');
      await seek.fill(await seek.getAttribute('max'));assert.equal(await page.locator('#stdout').textContent(),output);
      assert.equal(await source.inputValue(),code,'Compatibility must not change the editable source');
      assert.ok((await page.locator('#code-lines').textContent()).includes('#include <'+header+'>'),'Replay displays the original header');
      assert.match(await page.locator('#code-lines').textContent(),/std::cin >> e;/,'Replay displays original qualified syntax');
      await page.evaluate(()=>{const seek=document.getElementById('seek');for(let i=0;i<=Number(seek.max);i++){seek.value=i;seek.dispatchEvent(new Event('input',{bubbles:true}));if(document.querySelectorAll('.code-lines .is-current').length!==1)throw Error('Invalid qualified stream highlight');}});
      await page.locator('#restart').click();await page.locator('#next').click();const snapshot=await page.locator('#variable-grid').textContent();await page.locator('#previous').click();await page.locator('#next').click();assert.equal(await page.locator('#variable-grid').textContent(),snapshot);
    }
    const blocked=await browser.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>'{invalid';Storage.prototype.setItem=()=>{throw Error('blocked');};});
    await blocked.goto('http://127.0.0.1:4173/extensions/code-lab/index.html');await blocked.locator('#source').fill('int main(){return 0;}');await blocked.locator('#run').click();await blocked.waitForFunction(()=>document.querySelector('#lab-status').textContent.startsWith('已生成'));assert.match(await blocked.locator('#draft-status').textContent(),/无法保存/);
    const url=require('node:url').pathToFileURL(path.resolve(__dirname,'../dist/extensions/code-lab/index.html')).href;
    await page.goto(url);await page.locator('#run').click();assert.match(await page.locator('#error').textContent(),/本地|preview|浏览器限制/);
    assert.deepEqual(errors,[]);console.log('Verified browser C++ editing/execution, all examples/frames, qualified standard I/O and bits/stdc++.h, playback, draft restore, errors, stop/retry, array selection and mobile layout.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
