module.exports=(topic,E)=>{
  const levels=['模板','基础','进阶','困难'];
  return `<section class="practice-list" data-topic="${E(topic.id)}" aria-labelledby="practice-heading">
  <div class="practice-heading"><div><span class="practice-eyebrow">学完这一节，动手练习</span><h2 id="practice-heading">对应题单 · ${E(topic.title)}</h2></div><span class="practice-total">${topic.problems.length} 道练习</span></div>
  <p class="practice-intro">训练范围：${E(topic.scope)}</p>
  ${topic.note?`<p class="practice-note">选题说明：${E(topic.note)}</p>`:''}
  <div class="practice-tiers">${levels.map(level=>`<section class="practice-tier" data-level="${level}"><h3>${level}${level==='困难'?' <small>选做</small>':''}</h3><ol class="practice-problems">${topic.problems.filter(problem=>problem.level===level).map(problem=>`<li class="practice-problem"><div class="practice-problem-heading"><span class="practice-platform">${E(problem.platform+' '+problem.id)}</span><a class="practice-problem-link" href="${E(problem.url)}" target="_blank" rel="noopener noreferrer">${E(problem.title)} <span aria-hidden="true">↗</span></a></div><p class="practice-focus">训练重点：${E(problem.focus)}</p>${problem.note?`<p class="practice-problem-note">提醒：${E(problem.note)}</p>`:''}</li>`).join('')}</ol></section>`).join('')}</div>
  <p class="practice-footnote">建议先做模板，再练基础与进阶；困难题选做。分层为本站训练建议，不等同于平台官方评级。点击题目将在新标签页打开原题。</p>
</section>`;
};
