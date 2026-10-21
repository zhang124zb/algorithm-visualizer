const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cache=path.resolve(__dirname,'../artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(n=>path.join(cache,n,'node_modules/playwright')).find(d=>fs.existsSync(path.join(d,'package.json')));
const {chromium}=require(pkg),url='http://127.0.0.1:4173/extensions/code-lab/index.html';
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.goto(url);
    const language=page.locator('#lab-language'),source=page.locator('#source'),stdin=page.locator('#stdin'),seek=page.locator('#seek');
    const run=async()=>{await page.locator('#run').click();await page.waitForFunction(()=>!document.querySelector('#run').classList.contains('hidden')&&/已生成|已保留|执行未完成/.test(document.querySelector('#lab-status').textContent));};
    const last=async()=>seek.fill(await seek.getAttribute('max'));
    assert.equal(await language.inputValue(),'cpp');
    await source.fill('int main(){\nint kept = 7;\nreturn 0;\n}');await stdin.fill('cpp draft');
    for(const lang of ['python','java']){
      await language.selectOption(lang);
      assert.equal(await source.inputValue().then(x=>x.includes('kept')),false);
      assert.match(await page.locator('#code-file').textContent(),lang==='python'?/main.py/:/Main.java/);
      assert.equal(await page.locator('#play').isDisabled(),true);
      for(const [id,output]of [['bubble',lang==='python'?'8 13 17 26 29 35 42 51\n':'8 13 17 26 29 35 42 51 '],['prefix','37\n'],['matrix','100\n'],['recursion','120\n'],['binary','3\n']]){
        await page.locator('#example').selectOption(id);await page.locator('#load-example').click();await run();
        assert.equal(await page.locator('#error').isVisible(),false,lang+'/'+id+': '+await page.locator('#error').textContent());
        assert.match(await page.locator('#code-note').textContent(),/即将执行/);await last();
        assert.equal(await page.locator('#stdout').textContent(),output,lang+'/'+id);
        assert.equal(await page.locator('.code-lines .is-current').count(),1);
        if(id==='prefix'){
          assert.equal(await page.locator('.lab-array-card').count(),2);
          const vars=await page.locator('#variable-grid').textContent();await page.locator('#previous').click();await page.locator('#next').click();assert.equal(await page.locator('#variable-grid').textContent(),vars);
          await page.locator('#restart').click();await page.locator('#next').click();assert.equal(await seek.inputValue(),'1');
          await page.locator('#speed').selectOption('4');await page.locator('#play').click();await page.waitForTimeout(400);await page.locator('#play').click();
          const paused=await seek.inputValue();assert.ok(Number(paused)>1);await page.waitForTimeout(200);assert.equal(await seek.inputValue(),paused);
          await last();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/'+lang+'-lab-desktop.png'),fullPage:true});
        }
        if(id==='recursion'){
          let max=0;for(let i=0;i<=Number(await seek.getAttribute('max'));i++){await seek.fill(String(i));max=Math.max(max,Number((await page.locator('#stack-count').textContent()).split(' ')[0]));}assert.ok(max>=6);
        }
      }
      await page.locator('#edit-tab').click();
      const code=lang==='python'?'a = [1, 2]\nb = [3, 4]\nc = [5, 6]\nd = [7, 8]\nb[0] = a[0] + 9\nprint(b[0])':'public class Main {\npublic static void main(String[] args) {\nint[] a={1,2};\nint[] b={3,4};\nint[] c={5,6};\nint[] d={7,8};\nb[0]=a[0]+9;\nSystem.out.println(b[0]);\n}\n}';
      await source.fill(code);await stdin.fill('');await run();await last();assert.equal(await page.locator('#stdout').textContent(),'10\n');
      assert.equal(await page.locator('.lab-array-card').count(),3);assert.match(await page.locator('#array-summary').textContent(),/4 个数组/);
      await page.locator('#watch-array').selectOption('d');assert.equal(await page.locator('.lab-array-card[data-array="d"]').count(),1);
      await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../artifacts/'+lang+'-lab-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:1050});
      await page.locator('#edit-tab').click();await source.fill(lang==='python'?'x = ;':'public class Main { public static void main(String[] args) { int x = ; } }');await run();assert.equal(await page.locator('#error').isVisible(),true);
      await source.fill(code);await run();assert.equal(await page.locator('#error').isVisible(),false,'retry after syntax error');
      await page.locator('#edit-tab').click();
      const download=page.waitForEvent('download');await page.locator('#download-code').click();assert.equal((await download).suggestedFilename(),lang==='python'?'main.py':'Main.java');
      await stdin.fill(lang+' draft');
    }
    await language.selectOption('python');assert.match(await source.inputValue(),/a = \[1, 2\]/);assert.equal(await stdin.inputValue(),'python draft');
    await language.selectOption('cpp');assert.match(await source.inputValue(),/kept = 7/);assert.equal(await stdin.inputValue(),'cpp draft');
    await language.selectOption('java');assert.equal(await stdin.inputValue(),'java draft');await page.reload();
    assert.equal(await language.inputValue(),'cpp');assert.match(await source.inputValue(),/kept = 7/);await language.selectOption('java');assert.equal(await stdin.inputValue(),'java draft');
    await page.locator('#example').selectOption('bubble');await page.locator('#load-example').click();const original=await stdin.inputValue();await page.locator('#random-input').click();assert.notEqual(await stdin.inputValue(),original);await run();assert.equal(await page.locator('#error').isVisible(),false);
    const blocked=await browser.newPage();blocked.on('pageerror',e=>errors.push(e.message));
    await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>'{broken';Storage.prototype.setItem=()=>{throw Error('blocked');};});await blocked.goto(url);
    await blocked.locator('#lab-language').selectOption('python');await blocked.locator('#source').fill('print(42)');await blocked.locator('#lab-language').selectOption('java');await blocked.locator('#lab-language').selectOption('python');
    assert.equal(await blocked.locator('#source').inputValue(),'print(42)');assert.match(await blocked.locator('#draft-status').textContent(),/仅保留|无法保存/);
    assert.deepEqual(errors,[]);console.log('Verified Python/Java workers, 10 examples, playback, recursion, 4-array selection, downloads, isolated drafts, C++ default, errors/retry and mobile layout.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
