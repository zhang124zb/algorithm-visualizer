module.exports=({header,icon})=>`${header('../../',true)}
<main class="player-wrap lab-main">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">主页</a><span>/</span>代码实验室</nav>
  <div class="player-title lab-title"><div><div class="eyebrow">C++ FIRST · CODE LAB</div><h1>写一段代码，看见每一步。</h1><p>以 C++ 为主，也可选择 Python、Java，观察自己的代码如何执行。</p><p id="support-note" class="lab-support-note">C++ 为主。当前支持基础语法、数组、函数与递归，暂不支持 STL。</p></div><span id="runtime-badge" class="badge blue">C++ · 浏览器内执行</span></div>
  <section class="lab-toolbar" aria-label="实验设置">
    <label class="lab-example">语言<select id="lab-language" aria-label="实验室代码语言"><option value="cpp" selected>C++（主要）</option><option value="python">Python</option><option value="java">Java</option></select></label>
    <label class="lab-example">从示例开始<select id="example" aria-label="选择 C++ 示例"></select></label>
    <button id="load-example" class="button" type="button">载入示例</button>
    <span id="draft-status" class="draft-status" role="status">草稿自动保存在本机</span>
    <div class="lab-actions"><button id="download-code" class="button" type="button">下载 .cpp</button><button id="run" class="button primary" type="button">${icon('step')}运行并生成动画</button><button id="stop" class="button hidden" type="button">停止执行</button></div>
  </section>
  <div id="error" class="error-message hidden" role="alert"></div>
  <div id="lab-status" class="lab-status" role="status">先编辑右侧代码，或直接运行示例。</div>
  <div class="workspace lab-workspace">
    <section class="panel visualization-panel" aria-label="代码执行动画">
      <div class="panel-header"><span class="panel-title">${icon('picture')}运行画面</span><label class="watch-picker">数组展示<select id="watch-array" aria-label="选择手动保留的数组"><option value="">自动（最多 3 个）</option></select></label></div>
      <div class="visual-content"><p id="array-summary" class="lab-array-summary"></p><div id="stage" class="stage"><div class="lab-empty"><span>[ ]</span><b>你的代码，会在这里动起来。</b><p>最多同时展示 3 个数组或矩阵；<br>没有数组时，展示函数调用过程。</p></div></div></div>
      <div class="step-explanation"><span id="step-label" class="step-label">READY</span><p id="step-message" class="step-message" aria-live="polite">修改示例也可以。动画始终来自本次代码的实际执行。</p></div>
      <div class="variables"><div class="variables-heading"><span>变量观察</span><span>黄色标出发生变化的值</span></div><div id="variable-grid" class="variable-grid"><span class="panel-meta">运行后显示当前函数的变量。</span></div></div>
      <details class="lab-stack"><summary>函数调用栈 <span id="stack-count">0 层</span></summary><div id="call-stack"></div></details>
    </section>
    <section id="code-editor-panel" class="panel code-panel lab-code-panel" aria-label="C++ 代码编辑与回放">
      <div class="panel-header"><div class="lab-tabs" role="tablist" aria-label="代码模式"><button id="edit-tab" role="tab" aria-controls="editor-panel" aria-selected="true" type="button">编辑代码</button><button id="replay-tab" role="tab" aria-controls="replay-panel" aria-selected="false" type="button" disabled>执行回放</button></div><span id="code-file" class="panel-meta">main.cpp · C++</span></div>
      <div class="code-note"><span id="code-note">自由编辑 · Tab 缩进 · Ctrl / ⌘ + Enter 运行</span><span id="source-size"></span></div>
      <div id="editor-panel" role="tabpanel" aria-labelledby="edit-tab" class="lab-editor"><pre id="editor-lines" aria-hidden="true">1</pre><label id="source-label" class="sr-only" for="source">C++ 源代码</label><textarea id="source" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" maxlength="24000"></textarea></div>
      <div id="replay-panel" role="tabpanel" aria-labelledby="replay-tab" class="hidden"><div id="code-scroll" class="code-scroll" tabindex="0" aria-label="执行回放代码"><ol id="code-lines" class="code-lines"></ol></div></div>
      <div class="code-footer"><span id="play-status">尚未运行</span><span id="current-line">C++ 教学模式</span></div>
    </section>
  </div>
  <section class="transport" aria-label="执行回放控制">
    <div class="transport-buttons"><button id="restart" class="control" type="button" aria-label="重新开始" title="重新开始">${icon('restart')}</button><button id="previous" class="control" type="button" aria-label="上一步">${icon('back')}</button><button id="play" class="control play" type="button" aria-pressed="false">自动播放</button><button id="next" class="control" type="button" aria-label="下一步">${icon('step')}</button></div>
    <div class="progress-area"><label class="sr-only" for="seek">执行进度</label><input id="seek" type="range" min="0" max="0" value="0"><span id="step-count" class="step-count">0 / 0</span></div>
    <label class="speed-control">速度<select id="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
  </section>
  <div class="player-bottom"><span id="execution-note">黄色行跟随当前执行位置；回退会同步还原变量、画面和输出。</span><span class="keys"><kbd>空格</kbd>播放 / 暂停 <kbd>←</kbd><kbd>→</kbd>单步</span></div>
  <div class="lab-io">
    <section class="panel"><div class="panel-header"><label id="input-label" class="panel-title" for="stdin">标准输入 · cin</label><button id="random-input" class="lab-text-button" type="button">随机示例数据 ↻</button></div><textarea id="stdin" spellcheck="false" maxlength="16000" placeholder="例如：先输入数组长度，再输入各个元素"></textarea><p class="lab-input-note">输入要与代码约定一致。C++ / Java 示例数组容量为 8；编辑代码时请同步调整。</p></section>
    <section class="panel"><div class="panel-header"><span id="output-label" class="panel-title">标准输出 · cout</span><span id="exit-code" class="panel-meta">跟随当前步骤</span></div><pre id="stdout" class="lab-output" tabindex="0" aria-label="当前步骤的标准输出">运行后显示输出。</pre></section>
  </div>
  <details class="lab-help"><summary>使用说明与语言支持范围</summary><div class="lab-help-content"><article><h3>怎样生成动画</h3><p>C++ 为默认主要语言，也可选择 Python 或 Java。每种语言分别保存代码、标准输入与示例选择，切换后需要重新运行。C++ / Java 请输入含 main 的程序；Python 可直接编写脚本。无需添加动画函数：1～3 个数组或列表全部展示，超过 3 个时按变化和使用情况筛选；也可手动保留一个数组。回退会还原画面、变量和输出。</p><p>C++ 黄色行显示当前执行位置；Python / Java 黄色行表示即将执行，变量是执行前状态。按下一步即可观察变化。循环下标按 i、j、mid 等常见名字辅助显示，不代表自动理解算法。载入示例前会询问是否覆盖当前语言的代码；下载会生成相应的 .cpp / .py / .java 文件。</p></article><article><h3>三种语言的范围</h3><p><b>C++（主要）：</b>基础类型、数组、循环、函数与递归，以及部分 iostream / cmath / cctype / cstring / iomanip。暂不支持 STL、类、模板、bits/stdc++.h 和完整 C++ 标准。</p><p><b>Python：</b>Python 3 教学兼容模式，支持列表、二维列表、条件、循环、函数、递归和 input / print；部分标准库可用。不支持第三方包、文件网络操作、异步调用或完整的现代 Python 语法。</p><p><b>Java：</b>单个类中的 static 方法、int / double / boolean / char / String、一维和二维数组、Scanner 基本读取、System.out、部分 Math / String 及 Arrays.toString / sort。暂不支持 long、集合、对象与继承、泛型、多文件和完整类型检查；int 溢出会中止。Java 运行器仅用于非商业教学，许可与作者声明见下方链接。</p></article><article><h3>执行限制与许可</h3><p>每次最多记录 2000 步、运行约 5 秒，输出最多 16000 字符，三种语言均在本浏览器内执行，不上传代码。普通数组最多显示前 64 项，矩阵最多 16 × 16，每个函数最多显示 64 个变量。列表或数组规模按教学目的限制；Python 的 range 最多 4096 项。复杂程序请使用本地编译器或解释器。</p><p>请通过网站或本地预览地址打开，直接双击 HTML 会受浏览器线程限制。<a href="vendor/LICENSES.txt">C++ 许可</a> · <a href="vendor/python/LICENSE.txt">Python 许可</a> · <a href="vendor/java/LICENSE.txt">Java 非商业许可</a></p><p>Required Notice: Copyright 2026 Omega Mu Gamma Studio (<a href="https://github.com/Omega-Mu-Gamma-Studio" target="_blank" rel="noopener">Java 运行器作者</a>)</p></article></div></details>
</main>`;
