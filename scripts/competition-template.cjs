module.exports=({L,E,header,footer,icon})=>`${header('../../')}
<main class="wrap competition-main">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">主页</a><span>/</span>竞赛拓展</nav>
  <div class="competition-hero">
    <div class="category-hero">
      <div class="eyebrow">COMPETITION · C++ FIRST</div>
      <h1>把竞赛技巧，逐步拆开。</h1>
      <p>面向蓝桥杯与 ICPC / CCPC 基础训练，从熟悉的算法走向更灵活的解题方法。</p>
      <div class="competition-overview"><span><b>${L.competitionGroups.length}</b> 个学习方向</span><span><b>${L.competitionItems.length}</b> 个可交互演示</span><span>C++ / Python / Java</span></div>
    </div>
    <div class="competition-search-panel">
      <div class="search-box">${icon('search')}<label class="sr-only" for="competition-search">搜索竞赛专题</label><input id="competition-search" type="search" placeholder="搜索：单调栈 / LCA / 莫队" autocomplete="off"><span class="search-context" aria-hidden="true">竞赛拓展</span></div>
      <p>随机数据 · 逐行回放 · 三种语言</p>
    </div>
  </div>
  <section aria-labelledby="competition-directory-title">
    <h2 id="competition-directory-title" class="sr-only">竞赛拓展学习方向</h2>
    <p id="competition-count" class="section-description" role="status" aria-live="polite"></p>
    <div id="competition-results" class="search-results hidden"></div>
    <div id="competition-groups" class="category-grid">${L.competitionGroups.map(g=>`
      <a class="category-card competition-card" data-direction="${E(g.id)}" href="${g.id}/index.html">
        <span class="direction-number" aria-hidden="true">${g.number}</span>
        <h3>${E(g.title)}</h3>
        <p>${E(g.description)}</p>
        <div class="topic-tags">${g.items.slice(0,3).map(x=>`<span>${E(x.title)}</span>`).join('')}</div>
        <div class="competition-card-status"><span class="badge blue">已开放 ${g.items.length} 项</span></div>
        <div class="card-bottom"><span>${g.items.length} 个演示 · 3 种语言</span><span class="arrow" aria-hidden="true">↗</span></div>
      </a>`).join('')}
    </div>
  </section>
  <div class="notice">${icon('check')}<span>建议先掌握主页的基础算法，再进入对应拓展。示例使用小规模数据，方便观察每一次更新。</span></div>
  <details class="input-details competition-future" open>
    <summary><span>后续专题</span><span class="future-summary-meta">保留开发位置</span></summary>
    <p class="future-intro">以下专题尚未提供可运行演示。</p>
    <div class="extension-list">${[
      ['查找与排序','桶排序、基数排序、快速选择'],['搜索','双向 BFS、迭代加深'],['数据结构','带权并查集、懒标记线段树、01 Trie、分块'],['动态规划','多重背包、计数 DP、树形 / 换根 / 状压 / 数位 DP'],['图论与树','SPFA、负环、差分约束、强连通分量、割点、桥、欧拉路径、树的重心和距离查询'],['数学','逆元、欧拉函数、容斥、矩阵快速幂、高斯消元'],['计算几何','点积、多边形面积、旋转卡壳、扫描线'],['概率与离线','概率 DP、期望 DP、启发式合并']
    ].map(([title,description])=>`<article><h3>${E(title)}<span class="badge">后续内容</span></h3><p>${E(description)}</p></article>`).join('')}</div>
  </details>
</main>${footer()}`;
