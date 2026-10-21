(function (L) {
  'use strict';
  function setup(code, options) {
    const a = options.values?.slice() || L.unique();
    const t = new L.Trace(code, { values: a.slice() }, L.array(a));
    const s = (line,msg,vars = {},active = [],extra = {}) => t.step(line,msg,vars,L.array(a,active,extra));
    return {a,t,s};
  }
  L.register('bubble-sort', (options = {}) => {
    const {a,t,s} = setup(`void bubbleSort(vector<int>& a) {
outer|    for (int end = (int)a.size() - 1; end > 0; --end) {
inner|        for (int j = 0; j < end; ++j) {
compare|            if (a[j] > a[j + 1]) {
swap|                swap(a[j], a[j + 1]);
            }
        }
    }
}`, options);
    for (let end=a.length-1; ;end--) {
      s('outer','检查本轮尚未排序区间。',{end},[],{sorted:Array.from({length:a.length-1-end},(_,i)=>end+1+i)}); if(end<=0)break;
      for(let j=0;;j++) {s('inner','推进相邻元素的比较位置。',{end,j},j<end?[j,j+1]:[]);if(j>=end)break;
        s('compare','比较相邻两个元素。',{end,j},[j,j+1]);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];s('swap','左边更大，交换它们。',{end,j},[j,j+1]);}
      }
    } return t.done(a,'排序完成，整个序列已经有序。');
  });
  L.register('selection-sort', (options = {}) => {
    const {a,t,s}=setup(`void selectionSort(vector<int>& a) {
outer|    for (int i = 0; i < (int)a.size(); ++i) {
init|        int best = i;
inner|        for (int j = i + 1; j < (int)a.size(); ++j) {
compare|            if (a[j] < a[best]) {
best|                best = j;
            }
        }
swap|        swap(a[i], a[best]);
    }
}`,options);
    for(let i=0;;i++){s('outer','确定下一处需要放置最小值的位置。',{i},[],{sorted:Array.from({length:Math.min(i,a.length)},(_,j)=>j)});if(i>=a.length)break;
      let best=i;s('init','暂把当前位置当作最小值。',{i,best},[best]);
      for(let j=i+1;;j++){s('inner','扫描未排序部分。',{i,j,best},j<a.length?[j,best]:[best]);if(j>=a.length)break;s('compare','与目前最小值比较。',{i,j,best},[j,best]);if(a[j]<a[best]){best=j;s('best','更新最小值下标。',{i,j,best},[best]);}}
      [a[i],a[best]]=[a[best],a[i]];s('swap','把本轮最小值放到有序区末尾。',{i,best},[i,best]);
    }return t.done(a);
  });
  L.register('insertion-sort',(options={})=>{
    const {a,t,s}=setup(`void insertionSort(vector<int>& a) {
outer|    for (int i = 1; i < (int)a.size(); ++i) {
key|        int key = a[i];
init|        int j = i - 1;
loop|        while (j >= 0 && a[j] > key) {
move|            a[j + 1] = a[j];
back|            --j;
        }
insert|        a[j + 1] = key;
    }
}`,options);
    for(let i=1;;i++){s('outer','取出下一个需要插入的元素。',{i});if(i>=a.length)break;const key=a[i];s('key','单独保存 key，避免移动时丢失它。',{i,key},[i]);let j=i-1;s('init','从有序前缀的末尾开始比较。',{i,j,key},[j]);
      while(true){s('loop','检查当前位置是否大于 key。',{i,j,key},j>=0?[j]:[]);if(!(j>=0&&a[j]>key))break;a[j+1]=a[j];s('move','较大元素向右移动一格。',{i,j,key},[j,j+1]);--j;s('back','继续向左寻找插入位置。',{i,j,key},j>=0?[j]:[]);}
      a[j+1]=key;s('insert','将 key 放入空出的位置。',{i,j,key},[j+1]);
    }return t.done(a);
  });
  L.register('merge-sort',(options={})=>{
    const {a,t,s}=setup(`void mergeSort(vector<int>& a, int l, int r) {
base|    if (l >= r) return;
mid|    int m = l + (r - l) / 2;
left|    mergeSort(a, l, m);
right|    mergeSort(a, m + 1, r);
temp|    vector<int> b;
init|    int i = l, j = m + 1;
loop|    while (i <= m || j <= r) {
compare|        if (j > r || (i <= m && a[i] <= a[j])) {
takeLeft|            b.push_back(a[i++]);
        } else {
takeRight|            b.push_back(a[j++]);
        }
    }
copyLoop|    for (int k = 0; k < (int)b.size(); ++k) {
copy|        a[l + k] = b[k];
    }
}`,options);
    const stack=[];
    function sort(l,r){stack.push(`[${l},${r}]`);let vars={l,r,调用栈:stack.slice()};s('base','区间只有一个或零个元素时直接返回。',vars,[],{range:[l,r]});if(l>=r){stack.pop();return;}
      const m=l+Math.floor((r-l)/2);vars={...vars,m};s('mid','把当前区间分成左右两半。',vars,[m]);s('left','递归排序左半区间。',vars);sort(l,m);s('right','递归排序右半区间。',vars);sort(m+1,r);
      const b=[];s('temp','建立临时数组，准备合并。',{...vars,b:b.slice()});let i=l,j=m+1;const v=()=>({...vars,i,j,b:b.slice()});s('init','两个指针分别指向左右有序区间。',v(),[i,j]);
      while(true){s('loop','检查左右两侧是否还有未取出的元素。',v());if(!(i<=m||j<=r))break;s('compare','从两侧尚未取出的元素中选择较小者。',v(),[i,j].filter(x=>x<=r));if(j>r||(i<=m&&a[i]<=a[j])){b.push(a[i++]);s('takeLeft','取出左侧元素，左指针前进。',v());}else{b.push(a[j++]);s('takeRight','取出右侧元素，右指针前进。',v());}}
      for(let k=0;;k++){s('copyLoop','把合并结果逐个写回原区间。',{...v(),k});if(k>=b.length)break;a[l+k]=b[k];s('copy','写回一个元素。',{...v(),k},[l+k]);}stack.pop();
    }sort(0,a.length-1);return t.done(a);
  });
  L.register('quick-sort',(options={})=>{
    const {a,t,s}=setup(`void quickSort(vector<int>& a, int l, int r) {
base|    if (l >= r) return;
pivot|    int pivot = a[r];
init|    int i = l;
loop|    for (int j = l; j < r; ++j) {
compare|        if (a[j] < pivot) {
swap|            swap(a[i], a[j]);
advance|            ++i;
        }
    }
place|    swap(a[i], a[r]);
left|    quickSort(a, l, i - 1);
right|    quickSort(a, i + 1, r);
}`,options);
    const stack=[];function sort(l,r){stack.push(`[${l},${r}]`);const base={l,r,调用栈:stack.slice()};s('base','检查当前区间是否还需要划分。',base,[],{range:[l,r]});if(l>=r){stack.pop();return;}const pivot=a[r];s('pivot','选择区间最后一个元素作为基准。',{...base,pivot},[r]);let i=l;s('init','i 表示下一个小于基准的元素应放的位置。',{...base,pivot,i});
      for(let j=l;;j++){const v=()=>({...base,pivot,i,j});s('loop','扫描基准之前的元素。',v(),j<r?[j,r]:[r]);if(j>=r)break;s('compare','判断当前元素是否小于基准。',v(),[j,r]);if(a[j]<pivot){[a[i],a[j]]=[a[j],a[i]];s('swap','把较小的元素放入左侧。',v(),[i,j]);i++;s('advance','扩大左侧较小元素区域。',v());}}
      [a[i],a[r]]=[a[r],a[i]];s('place','将基准放到最终位置。',{...base,pivot,i},[i,r]);s('left','递归处理基准左边。',{...base,pivot,i});sort(l,i-1);s('right','递归处理基准右边。',{...base,pivot,i});sort(i+1,r);stack.pop();
    }sort(0,a.length-1);return t.done(a);
  });
  L.register('heap-sort',(options={})=>{
    const {a,t,s}=setup(`void siftDown(vector<int>& a, int n, int u) {
loop|    while (2 * u + 1 < n) {
child|        int v = 2 * u + 1;
choose|        if (v + 1 < n && a[v + 1] > a[v]) ++v;
stop|        if (a[u] >= a[v]) break;
swap|        swap(a[u], a[v]);
down|        u = v;
    }
}
void heapSort(vector<int>& a) {
build|    for (int u = (int)a.size() / 2 - 1; u >= 0; --u) {
adjust|        siftDown(a, (int)a.size(), u);
    }
outer|    for (int end = (int)a.size() - 1; end > 0; --end) {
extract|        swap(a[0], a[end]);
repair|        siftDown(a, end, 0);
    }
}`,options);
    function down(n,u){while(true){s('loop','检查当前节点是否存在左孩子。',{n,u},[u]);if(2*u+1>=n)break;let v=2*u+1;s('child','先选择左孩子。',{n,u,v},[u,v]);const right=v+1<n&&a[v+1]>a[v];if(right)v++;s('choose','选择两个孩子中较大的一个。',{n,u,v},[u,v]);s('stop','父节点已经不小于孩子时停止下沉。',{n,u,v},[u,v]);if(a[u]>=a[v])break;[a[u],a[v]]=[a[v],a[u]];s('swap','交换父节点和较大的孩子。',{n,u,v},[u,v]);u=v;s('down','继续向下检查。',{n,u,v},[u]);}}
    for(let u=Math.floor(a.length/2)-1;;u--){s('build','从最后一个非叶子节点向前建堆。',{u});if(u<0)break;s('adjust','调整当前子树。',{u},[u]);down(a.length,u);}
    for(let end=a.length-1;;end--){s('outer','逐次把最大值放到数组末尾。',{end});if(end<=0)break;[a[0],a[end]]=[a[end],a[0]];s('extract','交换堆顶与未排序区末尾。',{end},[0,end]);s('repair','缩小堆的范围，并恢复堆性质。',{end});down(end,0);}return t.done(a);
  });
  L.register('counting-sort',(options={})=>{
    const {a,t,s}=setup(`void countingSort(vector<int>& a) {
maximum|    int maximum = a.empty() ? 0 : *max_element(a.begin(), a.end());
init|    vector<int> count(maximum + 1, 0);
loop|    for (int x : a) {
count|        ++count[x];
    }
index|    int k = 0;
values|    for (int x = 0; x <= maximum; ++x) {
repeat|        while (count[x] > 0) {
write|            a[k++] = x;
decrease|            --count[x];
        }
    }
}`,{...options,values:options.values || L.numbers(9,1,8)});
    const maximum=a.length?Math.max(...a):0;s('maximum','确定计数桶的范围。',{maximum});const count=Array(maximum+1).fill(0);s('init','所有值的出现次数初始为零。',{count});for(const x of a.slice()){s('loop','读取一个待统计的值。',{x,count});count[x]++;s('count','对应计数桶加一。',{x,count});}let k=0;s('index','准备从数组开头写回。',{k,count});for(let x=0;x<=maximum+1;x++){s('values','按数值从小到大检查计数桶。',{x,k,count});if(x>maximum)break;while(true){s('repeat','检查当前数值是否还有剩余次数。',{x,k,count});if(count[x]<=0)break;a[k++]=x;s('write','写入当前值，并移动写入位置。',{x,k,count},[k-1]);count[x]--;s('decrease','消耗一次计数。',{x,k,count});}}return t.done(a);
  });
})(AlgoLab);
