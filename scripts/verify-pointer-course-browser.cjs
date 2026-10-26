'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'..'),cache=path.join(project,'artifacts/npm-cache/_npx');
const pkg=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/playwright')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
if(!pkg)throw Error('Playwright is unavailable in the local test cache.');
const {chromium}=require(pkg),base=(process.env.ALGOLAB_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,''),courseURL=base+'/structures/pointers/index.html';
const data=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(project,'dist/structures/pointers/lessons.js'),'utf8'),data);
const course=JSON.parse(JSON.stringify(data.PointerCourse)),lessonById=id=>course.lessons.find(lesson=>lesson.id===id);
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.url().startsWith(base+'/')&&response.status()>=400)errors.push(response.status()+' '+response.url());});
    const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const capture=async name=>{await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(project,'artifacts/'+name+'.png'),fullPage:true});};
    const noOverflow=async name=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' viewport overflow');
    async function selectLesson(id){
      const lesson=lessonById(id);assert.ok(lesson);
      await page.locator('#pointer-levels button[data-level="'+lesson.level+'"]').click();
      assert.equal(await page.locator('#pointer-lessons button[data-lesson]').count(),4,lesson.level+' shows its four lessons');
      await page.locator('#pointer-lessons button[data-lesson="'+id+'"]').click();
      await settle();assert.equal(await page.locator('#pointer-lesson-title').textContent(),lesson.title);
      assert.equal(await page.locator('#pointer-levels [aria-selected="true"]').getAttribute('data-level'),lesson.level);
      assert.equal(await page.locator('#pointer-lessons [aria-pressed="true"]').getAttribute('data-lesson'),id);
      assert.equal(new URL(page.url()).hash,'#lesson='+id);
      return lesson;
    }
    const seek=async index=>{await page.locator('#pointer-seek').fill(String(index));await settle();};
    const memoryState=()=>page.locator('#pointer-memory').evaluate(element=>({
      cells:[...element.querySelectorAll('.pointer-cell[data-cell]')].map(node=>({id:node.dataset.cell,text:node.textContent.replace(/\s+/g,' ').trim(),status:[...node.classList].filter(name=>/^is-(?:danger|freed|ended|dangling|boundary)$/.test(name)).sort()})).sort((a,b)=>a.id.localeCompare(b.id)),
      links:[...element.querySelectorAll('path.pointer-memory-link')].map(node=>({from:node.dataset.from,to:node.dataset.to,danger:node.classList.contains('is-danger')})).sort((a,b)=>(a.from+':'+a.to).localeCompare(b.from+':'+b.to))
    }));
    async function linkGeometry(name){
      const result=await page.locator('#pointer-memory').evaluate(memory=>{
        const errors=[],paths=[...memory.querySelectorAll('path.pointer-memory-link')];
        for(const link of paths){
          const source=memory.querySelector('[data-cell="'+link.dataset.from+'"]'),target=memory.querySelector('[data-cell="'+link.dataset.to+'"]');
          const matrix=link.getScreenCTM(),first=link.getPointAtLength(0),last=link.getPointAtLength(link.getTotalLength());
          const start=new DOMPoint(first.x,first.y).matrixTransform(matrix),end=new DOMPoint(last.x,last.y).matrixTransform(matrix),a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
          if(![start.x,start.y,end.x,end.y].every(Number.isFinite))errors.push('Nonfinite SVG coordinate');
          if(Math.abs(start.x-a.right)>4||Math.abs(start.y-(a.top+a.height/2))>3)errors.push(link.dataset.from+' arrow starts away from its object');
          if(Math.min(Math.abs(end.x-b.left),Math.abs(end.x-b.right))>9||Math.abs(end.y-(b.top+b.height/2))>3)errors.push(link.dataset.to+' arrow ends away from its target');
        }
        return {count:paths.length,errors};
      });
      assert.ok(result.count>0,name+' has a measurable relationship');assert.deepEqual(result.errors,[],name+' SVG geometry');
    }

    await page.goto(base+'/');
    assert.equal(await page.locator('#structure-grid a[href="structures/pointers/index.html"]').count(),1,'The structure catalog includes the pointer course');
    await page.locator('#search-input').fill('指针');
    assert.equal(await page.locator('.result-row[href="structures/pointers/index.html"]').count(),1,'Searching pointers finds the independent course');
    await page.goto(courseURL);await settle();
    assert.equal(await page.locator('#pointer-levels button[data-level]').count(),3);
    let frames=0;
    for(const level of course.levels){
      for(const lesson of course.lessons.filter(item=>item.level===level.id)){
        await selectLesson(lesson.id);
        assert.equal(await page.locator('#pointer-code li[data-line]').count(),lesson.code.split('\n').length,lesson.id+' original teaching code');
        assert.equal(Number(await page.locator('#pointer-seek').getAttribute('max')),lesson.steps.length-1);
        for(let index=0;index<lesson.steps.length;index++){
          const step=lesson.steps[index];await seek(index);frames++;
          assert.equal(await page.locator('#pointer-code li.is-current').count(),1,lesson.id+' exactly one current line');
          assert.equal(Number(await page.locator('#pointer-code li.is-current').getAttribute('data-line')),step.line,lesson.id+' step line');
          assert.equal(await page.locator('#pointer-message').textContent(),step.message,lesson.id+' step explanation');
          assert.match(await page.locator('#pointer-step-count').textContent(),new RegExp('\\b'+(index+1)+'\\s*/\\s*'+lesson.steps.length+'\\b'));
          const actual=await memoryState();
          assert.equal(actual.cells.length,step.cells.length,lesson.id+' visible memory objects');
          assert.deepEqual(actual.cells.map(item=>item.id),step.cells.map(item=>item.id).sort(),lesson.id+' memory IDs');
          assert.deepEqual(actual.links.map(link=>link.from+':'+link.to),step.links.map(link=>link.from+':'+link.to).sort(),lesson.id+' pointer targets');
          for(const cell of step.cells){
            const shown=actual.cells.find(item=>item.id===cell.id);assert.ok(shown.text.includes(cell.address),lesson.id+' shows the storage address of '+cell.id);
            if(cell.value==='nullptr'||cell.status==='ended')assert.ok(!actual.links.some(link=>link.from===cell.id),lesson.id+' null/ended pointer has no arrow');
            if(['freed','ended','dangling'].includes(cell.status))assert.ok(shown.status.includes('is-'+cell.status),lesson.id+' lifetime state of '+cell.id);
          }
        }
        const middle=Math.max(1,Math.floor(lesson.steps.length/2));await seek(middle);const snapshot=await memoryState(),message=await page.locator('#pointer-message').textContent();
        await page.locator('#pointer-previous').click();await settle();await page.locator('#pointer-next').click();await settle();
        assert.deepEqual(await memoryState(),snapshot,lesson.id+' previous/next restores memory');
        assert.equal(await page.locator('#pointer-message').textContent(),message);
        await page.locator('#pointer-restart').click();await settle();assert.equal(await page.locator('#pointer-seek').inputValue(),'0');
        assert.equal(await page.locator('#pointer-previous').isDisabled(),true);
        assert.equal(await page.locator('#pointer-sources a').count(),lesson.sources.length,lesson.id+' authoritative sources');
        assert.equal(await page.locator('#pointer-related a').count(),lesson.related.length,lesson.id+' related lessons');
        for(const [index,related]of lesson.related.entries())assert.ok((await page.locator('#pointer-related a').nth(index).getAttribute('href')).endsWith(related.path),lesson.id+' related URL');
        assert.equal(await page.locator('#pointer-question').textContent(),lesson.practice.question);
        assert.equal(await page.locator('#pointer-options button[data-option]').count(),lesson.practice.options.length);
      }
    }

    const intro=await selectLesson('value-address'),wrong=(intro.practice.answer+1)%intro.practice.options.length;
    await page.locator('#pointer-options button[data-option="'+wrong+'"]').click();
    assert.ok(await page.locator('#pointer-feedback').evaluate(node=>node.classList.contains('is-incorrect')),'Wrong answer receives explicit feedback');
    await page.locator('#pointer-options button[data-option="'+intro.practice.answer+'"]').click();
    assert.ok(await page.locator('#pointer-feedback').evaluate(node=>node.classList.contains('is-correct')),'Correct answer receives explicit feedback');
    assert.ok((await page.locator('#pointer-feedback').textContent()).includes(intro.practice.explanation));
    assert.equal(await page.locator('#pointer-options [aria-pressed="true"]').getAttribute('data-option'),String(intro.practice.answer));
    await seek(1);await linkGeometry('Value/address desktop');await capture('pointer-course-address-desktop');

    await selectLesson('nullptr');assert.equal(await page.locator('#pointer-memory .pointer-memory-link').count(),0);
    await page.locator('#pointer-speed').selectOption('2');await page.locator('#pointer-play').click();
    await page.waitForFunction(()=>document.getElementById('pointer-play').getAttribute('aria-pressed')==='false');
    assert.equal(await page.locator('#pointer-seek').inputValue(),'1','Playback stops at the commented unsafe access');
    assert.match(await page.locator('#pointer-message').textContent(),/未执行|不能/);

    const lifetime=await selectLesson('dynamic-lifetime'),freed=lifetime.steps.findIndex(step=>step.cells.some(cell=>cell.status==='freed'));
    await seek(freed);
    assert.equal(await page.locator('#pointer-memory .pointer-cell.is-freed').count(),1);
    assert.equal(await page.locator('#pointer-memory .pointer-cell.is-dangling').count(),2);
    assert.equal(await page.locator('#pointer-memory .pointer-memory-link.is-danger').count(),2);
    await linkGeometry('Dangling aliases desktop');await capture('pointer-course-lifetime-desktop');

    const row=await selectLesson('row-pointers'),rowIndex=row.steps.findIndex(step=>step.cells.find(cell=>cell.id==='row1')?.value[1]===50);
    await seek(rowIndex);
    assert.ok((await page.locator('#pointer-memory [data-cell="row0"]').textContent()).includes('R0'));
    assert.ok((await page.locator('#pointer-memory [data-cell="row1"]').textContent()).includes('50'));
    assert.equal(await page.locator('#pointer-memory .pointer-memory-link[data-from="row"][data-to="row1"]').count(),1);
    await page.setViewportSize({width:390,height:844});await settle();await noOverflow('Pointer course mobile');
    assert.equal(await page.locator('#pointer-memory .pointer-memory-link[data-from="row"][data-to="row1"]').count(),1,'Resize retains the row target');
    await linkGeometry('Row pointer after mobile resize');
    await capture('pointer-course-rows-mobile');
    await selectLesson('dynamic-lifetime');await seek(freed);await noOverflow('Lifetime mobile');await linkGeometry('Dangling aliases mobile');await capture('pointer-course-lifetime-mobile');

    await page.goto(courseURL+'#lesson=row-pointers');await settle();
    assert.equal(await page.locator('#pointer-lesson-title').textContent(),row.title,'Deep links select the requested lesson');
    assert.equal(await page.locator('#pointer-levels [aria-selected="true"]').getAttribute('data-level'),'basic');
    await page.goto(courseURL+'#lesson=unknown-lesson');await settle();
    assert.equal(await page.locator('#pointer-lesson-title').textContent(),row.title,'An unknown hash preserves the currently valid lesson');
    await page.reload();await settle();
    assert.equal(await page.locator('#pointer-lesson-title').textContent(),course.lessons[0].title,'An initially unknown lesson falls back safely');
    await page.goto(courseURL+'#lesson=%E0%A4%A');await settle();
    assert.equal(await page.locator('#pointer-lesson-title').textContent(),course.lessons[0].title,'Malformed hash encoding falls back safely');
    await page.setViewportSize({width:1440,height:1000});await selectLesson('value-address');
    await page.locator('#pointer-speed').selectOption('2');await page.locator('#pointer-play').click();
    await page.waitForFunction(()=>document.getElementById('pointer-play').getAttribute('aria-pressed')==='false');
    assert.equal(await page.locator('#pointer-seek').inputValue(),String(intro.steps.length-1),'Playback stops at lesson completion');
    assert.deepEqual(errors,[]);
    console.log('Verified pointer-course catalog/search entry, 3 levels and 12 lessons, '+frames+' rendered frames, controls/rewind, quizzes, null/dangling/row states, mobile/resize, deep-link fallbacks and error-free browser execution.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
