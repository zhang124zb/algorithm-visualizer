(function (root) {
  'use strict';
  const Lab = root.AlgoLab = root.AlgoLab || {};
  Lab.builders = {};
  Lab.register = (id, build) => { Lab.builders[id] = build; };
  Lab.codeVersions = {};
  Lab.parseCode = source => {
    const labels = {};
    const code = source.trim().split('\n').map((line, i) => {
      const match = line.match(/^([A-Za-z]\w*(?:,[A-Za-z]\w*)*)\|(.*)$/);
      if (!match) return line;
      for (const label of match[1].split(',')) {
        if (labels[label]) throw new Error('重复的代码标签：' + label);
        labels[label] = i + 1;
      }
      return match[2];
    });
    return { code, labels };
  };
  Lab.addCode = (id, python, java) => {
    Lab.codeVersions[id] = { python: Lab.parseCode(python), java: Lab.parseCode(java) };
  };
  const lessonSources = {};
  Lab.addLesson = (id, cpp, python, java) => { lessonSources[id] = cpp; Lab.addCode(id, python, java); };
  Lab.lessonTrace = (id, input, view) => new Lab.Trace(lessonSources[id], input, view);
  Lab.getCode = (id, trace, language) => {
    if (language === 'cpp') return { code: trace.code, labels: trace.labels };
    const version = Lab.codeVersions[id]?.[language];
    if (!version) throw new Error('该语言尚未接入：' + language);
    return version;
  };
  Lab.watchVars = (trace, index, version, language) => {
    const step = trace.steps[index], vars = { ...step.vars };
    if (language !== 'python') return vars;
    const line = version.labels[step.label], source = version.code[line - 1];
    const loop = source.match(/^\s*for\s+(\w+)\s+in\s+.*:\s*$/);
    if (loop) {
      const indent = source.length - source.trimStart().length;
      const labelled = new Set(Object.values(version.labels));
      let firstBody;
      for (let next = line; next < version.code.length; next++) {
        const body = version.code[next];
        if (!body.trim()) continue;
        if (body.length - body.trimStart().length <= indent) break;
        if (labelled.has(next + 1)) { firstBody = next + 1; break; }
      }
      // Python for does not assign the out-of-range sentinel recorded by a C++ for condition.
      if (version.labels[trace.steps[index + 1]?.label] !== firstBody || firstBody === undefined) delete vars[loop[1]];
    }
    for (const [original, translated] of Object.entries({sum:'total',hash:'hash_value',len:'length',erasePos:'erase_pos'})) {
      if (Object.prototype.hasOwnProperty.call(vars, original) && version.code.some(line => new RegExp('\\b' + translated + '\\b').test(line))) {
        vars[translated] = vars[original]; delete vars[original];
      }
    }
    return vars;
  };
  Lab.copy = value => JSON.parse(JSON.stringify(value, (_, v) => v === Infinity ? '∞' : v === -Infinity ? '-∞' : v));
  Lab.rand = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
  Lab.shuffle = values => {
    const a = values.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Lab.rand(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  Lab.numbers = (n = 8, low = 2, high = 35) => Array.from({ length: n }, () => Lab.rand(low, high));
  Lab.unique = (n = 8) => Lab.shuffle(Array.from({ length: 38 }, (_, i) => i + 2)).slice(0, n);
  Lab.array = (values, active = [], extra = {}) => ({ kind: 'array', values: values.slice(), active, ...extra });
  Lab.matrix = (rows, active = [], extra = {}) => ({ kind: 'matrix', rows, active, ...extra });
  Lab.graph = (n = 6, directed = false, weighted = false) => {
    const nodes = Array.from({ length: n }, (_, i) => ({ id: i, label: String.fromCharCode(65 + i), x: 50 + 36 * Math.cos(-Math.PI / 2 + 2 * Math.PI * i / n), y: 50 + 35 * Math.sin(-Math.PI / 2 + 2 * Math.PI * i / n) }));
    const edges = [];
    const add = (u, v) => { if (!edges.some(e => e.u === u && e.v === v || !directed && e.u === v && e.v === u)) edges.push({ u, v, w: weighted ? Lab.rand(1, 9) : 1 }); };
    for (let i = 1; i < n; i++) add(Lab.rand(0, i - 1), i);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.random() < .24) add(i, j);
    return { kind: 'graph', nodes, edges, directed, weighted };
  };
  Lab.adjacency = graph => {
    const adj = graph.nodes.map(() => []);
    graph.edges.forEach(e => { adj[e.u].push([e.v, e.w]); if (!graph.directed) adj[e.v].push([e.u, e.w]); });
    return adj;
  };
  Lab.tree = (node, active = [], extra = {}) => {
    const nodes = [], edges = [];
    let count = 0;
    function visit(t, depth) {
      if (!t) return;
      visit(t.left, depth + 1);
      nodes.push({ id: t.id ?? t.value, label: String(t.value), x: count++ * 1, y: depth, badge: t.badge });
      if (t.left) edges.push({ u: t.id ?? t.value, v: t.left.id ?? t.left.value });
      if (t.right) edges.push({ u: t.id ?? t.value, v: t.right.id ?? t.right.value });
      visit(t.right, depth + 1);
    }
    visit(node, 0);
    const maxDepth = Math.max(1, ...nodes.map(n => n.y));
    nodes.forEach(n => { n.x = 10 + n.x / Math.max(1, count - 1) * 80; n.y = 13 + n.y / maxDepth * 70; });
    return { kind: 'graph', nodes, edges, active, tree: true, ...extra };
  };
  Lab.binaryTree = values => {
    const nodes = values.map(value => ({ value, left: null, right: null }));
    nodes.forEach((node, i) => { node.left = nodes[2 * i + 1] || null; node.right = nodes[2 * i + 2] || null; });
    return nodes[0] || null;
  };
  Lab.bst = values => {
    let rootNode = null;
    for (const value of values) {
      const node = { value, left: null, right: null };
      if (!rootNode) { rootNode = node; continue; }
      let p = rootNode;
      while (true) { const k = value < p.value ? 'left' : 'right'; if (!p[k]) { p[k] = node; break; } p = p[k]; }
    }
    return rootNode;
  };
  Lab.Trace = class {
    constructor(code, input, initialView) {
      const parsed = Lab.parseCode(code);
      this.labels = parsed.labels;
      this.code = parsed.code;
      this.input = input;
      this.steps = [];
      this.current = { view: initialView, vars: {}, output: [] };
      this.result = null;
    }
    step(line, message, vars = {}, view, extra = {}) {
      const label = typeof line === 'string' ? line : Object.keys(this.labels).find(key => this.labels[key] === line);
      if (typeof line === 'string') line = this.labels[line];
      if (!Number.isInteger(line) || line < 1 || line > this.code.length) throw new Error('代码行映射越界：' + line);
      if (this.steps.length >= 12000) throw new Error('演示步骤过多，请缩小随机数据规模。');
      this.current = { ...this.current, line, label, message, vars, ...(view ? { view } : {}), ...extra };
      this.steps.push(Lab.copy(this.current));
    }
    done(result, message = '执行完成') {
      this.result = Lab.copy(result);
      this.step(this.current.line || 1, message, this.current.vars, undefined, { finished: true });
      return this;
    }
  };
})(typeof window === 'undefined' ? globalThis : window);
