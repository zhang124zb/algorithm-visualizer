(function (L) {
  'use strict';
  L.register('linear-search', function (options = {}) {
    const a = options.values?.slice() || L.numbers(), target = options.target ?? a[L.rand(0, a.length - 1)];
    const t = new L.Trace(`int linearSearch(const vector<int>& a, int target) {
loop|    for (int i = 0; i < (int)a.size(); ++i) {
compare|        if (a[i] == target) {
found|            return i;
        }
    }
missing|    return -1;
}`, { values: a, target }, L.array(a));
    for (let i = 0; ; i++) {
      t.step('loop', i < a.length ? '检查循环条件，访问下一个元素。' : '已检查所有元素，结束循环。', { i, target }, L.array(a, i < a.length ? [i] : []));
      if (i >= a.length) break;
      t.step('compare', `比较 ${a[i]} 与目标 ${target}。`, { i, target, 'a[i]': a[i] });
      if (a[i] === target) { t.step('found', `找到目标，返回下标 ${i}。`, { i, target }, L.array(a, [i], { found: [i] })); return t.done(i); }
    }
    t.step('missing', '数组中没有目标，返回 -1。', { target }); return t.done(-1);
  });
  for (const id of ['binary-search','lower-bound','upper-bound']) L.register(id, function (options = {}) {
    const a = (options.values?.slice() || L.numbers()).sort((x,y)=>x-y);
    const target = options.target ?? (Math.random() < .25 ? L.rand(1,36) : a[L.rand(0,a.length-1)]);
    const binary = id === 'binary-search', upper = id === 'upper-bound';
    const code = binary ? `int binarySearch(const vector<int>& a, int target) {
init|    int left = 0, right = (int)a.size() - 1;
loop|    while (left <= right) {
mid|        int mid = left + (right - left) / 2;
equal|        if (a[mid] == target) {
found|            return mid;
        }
compare|        if (a[mid] < target) {
left|            left = mid + 1;
        } else {
right|            right = mid - 1;
        }
    }
missing|    return -1;
}` : `int ${upper ? 'upperBound' : 'lowerBound'}(const vector<int>& a, int target) {
init|    int left = 0, right = (int)a.size();
loop|    while (left < right) {
mid|        int mid = left + (right - left) / 2;
compare|        if (a[mid] ${upper ? '<=' : '<'} target) {
left|            left = mid + 1;
        } else {
right|            right = mid;
        }
    }
found|    return left;
}`;
    let left = 0, right = binary ? a.length - 1 : a.length, mid = null;
    const t = new L.Trace(code, { values: a, target }, L.array(a));
    const draw = () => L.array(a, mid === null ? [] : [mid], { range: [left, binary ? right : right - 1], pointers: { left, right, ...(mid === null ? {} : { mid }) } });
    const step = (l,m) => t.step(l,m,{left,right,mid:mid ?? '—',target},draw());
    step('init', binary ? '初始化闭区间 [left, right]。' : '初始化左闭右开区间 [left, right)。right 可以指向数组末尾之后。');
    while (true) {
      step('loop', '检查候选区间是否仍然非空。');
      if (!(binary ? left <= right : left < right)) break;
      mid = left + Math.floor((right-left)/2); step('mid','计算中点 mid。');
      if (binary) {
        step('equal','检查中间元素是否就是目标。');
        if (a[mid] === target) { step('found',`找到目标，返回下标 ${mid}。`); return t.done(mid); }
      }
      const moveRight = upper ? a[mid] <= target : a[mid] < target;
      step('compare', `比较 a[mid] = ${a[mid]} 与 target = ${target}。`);
      if (moveRight) { left = mid + 1; step('left','排除中点及其左侧，移动左边界。'); }
      else { right = binary ? mid - 1 : mid; step('right','保留更靠左的候选位置，移动右边界。'); }
    }
    step(binary ? 'missing' : 'found', binary ? '候选区间为空，目标不存在。' : `边界收敛在 ${left}，返回该插入位置${left === a.length ? '（数组末尾之后）' : ''}。`);
    return t.done(binary ? -1 : left);
  });
})(AlgoLab);
