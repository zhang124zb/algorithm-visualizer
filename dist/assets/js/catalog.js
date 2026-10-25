(function (root) {
  'use strict';
  const L = root.AlgoLab;
  const groups = [
    ['structures','linear','数组与链表','01','从连续存储到指针连接，观察数据如何组织。',[
      ['array','数组','按下标访问、插入与删除','O(n)'],['singly-linked-list','单链表','沿 next 指针完成插入与删除','O(n)'],['doubly-linked-list','双向链表','同时维护前驱和后继指针','O(n)'],['circular-linked-list','循环链表','沿循环链表完成约瑟夫消除','O(n²)']]],
    ['structures','stack-queue','栈与队列','02','从先进后出到先进先出，理解不同的处理顺序。',[
      ['stack','栈','入栈与出栈，观察栈顶变化','O(1) / 次'],['queue','普通队列','入队与出队，观察队首变化','O(1) / 次'],['circular-queue','循环队列','下标取模，让队尾回到数组开头','O(1) / 次'],['deque','双端队列','在队首与队尾两端操作','O(1) / 次']]],
    ['structures','hash','哈希表','03','把键映射到桶，直观看懂冲突如何解决。',[
      ['hash-chaining','链地址法','冲突元素连接到同一个桶','平均 O(1)'],['hash-probing','开放寻址法','线性探测寻找下一个空位','平均 O(1)']]],
    ['structures','trees','树','04','观察树的层次、查找路径和旋转调整。',[
      ['binary-tree','二叉树','递归建立一棵二叉树','O(n)'],['bst','二叉搜索树','插入节点并沿大小关系查找','平均 O(log n)'],['avl','AVL 树','插入后通过旋转恢复平衡','O(log n) / 次'],['trie','字典树','将共享前缀合并到同一条路径','O(字符总数)']]],
    ['structures','heaps','堆与优先队列','05','建堆、插入和删除，始终把极值放到顶部。',[
      ['max-heap','大根堆','父节点始终不小于子节点','O(log n) / 次'],['min-heap','小根堆','父节点始终不大于子节点','O(log n) / 次']]],
    ['structures','graphs','图的存储','06','用矩阵和邻接表表示同一组节点与边。',[
      ['adjacency-matrix','邻接矩阵','用二维表记录节点之间的连接','O(V²) 空间'],['adjacency-list','邻接表','为每个节点保存相邻节点','O(V + E) 空间']]],
    ['structures','advanced','常用进阶结构','07','通过小规模示例理解集合合并与区间查询。',[
      ['disjoint-set','并查集','查找代表元素并合并集合','近似 O(1) / 次'],['fenwick','树状数组','沿 lowbit 更新与查询前缀和','O(log n) / 次'],['segment-tree','线段树','建树、单点更新与区间求和','O(log n) / 次']]],
    ['algorithms','search','查找','01','从逐个比较到不断缩小候选范围。',[
      ['linear-search','顺序查找','逐个比较元素与查找目标','O(n)'],['binary-search','二分查找','比较中点，每次排除一半区间','O(log n)'],['lower-bound','二分查找左边界','寻找第一个不小于目标的位置','O(log n)'],['upper-bound','二分查找右边界','寻找第一个大于目标的位置','O(log n)']]],
    ['algorithms','sorting','排序','02','观察比较、移动与交换如何让序列变得有序。',[
      ['bubble-sort','冒泡排序','相邻比较，将较大值逐步向右移动','O(n²)'],['selection-sort','选择排序','每轮选出未排序部分的最小值','O(n²)'],['insertion-sort','插入排序','把当前元素插入有序前缀','O(n²)'],['merge-sort','归并排序','先拆分，再合并两个有序区间','O(n log n)'],['quick-sort','快速排序','围绕基准划分并递归处理','平均 O(n log n)'],['heap-sort','堆排序','反复取出大根堆的最大值','O(n log n)'],['counting-sort','计数排序','统计每个值的出现次数并重建序列','O(n + K)']]],
    ['algorithms','traversal','搜索与回溯','03','沿状态空间前进，在必要时回退。',[
      ['bfs','BFS 广度优先搜索','通过队列逐层访问节点','O(V + E)'],['dfs','DFS 深度优先搜索','沿一条路径深入再回溯','O(V + E)'],['permutations','全排列','选择、递归、撤销选择','O(n · n!)'],['maze','迷宫搜索','寻找从起点到终点的路径','O(行 × 列)'],['n-queens','N 皇后','按行放置皇后并检查冲突','O(N!)']]],
    ['algorithms','tree-traversal','树的遍历','04','比较不同访问顺序下的递归与队列过程。',[
      ['preorder','前序遍历','根 → 左 → 右','O(n)'],['inorder','中序遍历','左 → 根 → 右','O(n)'],['postorder','后序遍历','左 → 右 → 根','O(n)'],['level-order','层序遍历','使用队列从上到下逐层访问','O(n)']]],
    ['algorithms','graph','图论','05','观察路径松弛、依赖消除和最小生成树的形成。',[
      ['dijkstra','Dijkstra 最短路','在非负权图上逐个确定最短距离','O(V²)'],['bellman-ford','Bellman–Ford','多轮松弛所有边','O(VE)'],['floyd','Floyd 全源最短路','枚举中转点更新距离矩阵','O(V³)'],['topological-sort','拓扑排序','依次移除入度为零的节点','O(V + E)'],['prim','Prim 最小生成树','从已选节点向外连接最便宜的边','O(V²)'],['kruskal','Kruskal 最小生成树','按边权排序，避免形成环','O(E log E)']]],
    ['algorithms','techniques','基础技巧','06','通过区间信息和指针移动减少重复计算。',[
      ['prefix-sum','前缀和','先累加，再快速计算区间和','O(n) 预处理'],['difference','差分','标记区间两端，再还原整体变化','O(n + 操作数)'],['two-pointers','双指针','在有序数组两端寻找目标和','O(n)'],['sliding-window','滑动窗口','维护固定长度窗口的最大和','O(n)']]],
    ['algorithms','dp','动态规划','07','把子问题的答案记录下来，一步步推出结果。',[
      ['recurrence','基础递推','用斐波那契数列认识递推状态','O(n)'],['knapsack','0/1 背包','倒序更新容量，每件物品只能选一次','O(物品数 × 容量)'],['lis','最长上升子序列','比较此前状态，延长严格递增序列','O(n²)'],['lcs','最长公共子序列','在二维表中匹配与继承已有结果','O(nm)'],['interval-dp','区间 DP','通过石子合并观察区间划分','O(n³)']]],
    ['algorithms','greedy','贪心','08','理解当前选择如何推动整体目标。',[
      ['interval-scheduling','区间选择','优先选择结束时间最早的区间','O(n log n)'],['interval-cover','区间覆盖','在可连接区间中尽量向右延伸','O(n log n)'],['optimal-merge','最优合并','每次合并最小的两堆','O(n log n)']]],
    ['algorithms','strings','字符串','09','逐字符比较，观察匹配位置和前缀信息。',[
      ['naive-match','朴素匹配','尝试文本中的每个起始位置','O(nm)'],['kmp','KMP','借助前缀函数减少重复比较','O(n + m)'],['rolling-hash','字符串哈希','用滚动哈希筛选并核对候选子串','O(n + m + 核验成本)']]],
    ['algorithms','math','数学基础','10','把数论计算变成可跟随的状态变化。',[
      ['gcd','最大公约数','辗转相除，直到余数为零','O(log min(a,b))'],['fast-power','快速幂','将指数拆成二进制逐步累乘','O(log 指数)'],['sieve','素数筛','逐轮划去素数的倍数','O(n log log n)']]]
  ];
  const additions = {
    linear:[['dynamic-array','动态数组','观察容量不足时的扩容、复制与追加','追加均摊 O(1)，扩容 O(n)']],
    hash:[['ordered-set','有序集合','插入去重、查找与删除，按值有序展示','O(log n) / 次'],['ordered-map','有序映射','用键关联计数，按键有序展示','O(log n) / 次'],['hash-set','哈希集合','用哈希集合去重、查找与删除','平均 O(1) / 次'],['hash-map','哈希映射','用哈希映射维护键值与频次','平均 O(1) / 次']],
    traversal:[['pruning','剪枝搜索','非负子集和搜索，排除超限或不可能达到的分支','最坏 O(2ⁿ)'],['memo-search','记忆化搜索','缓存递归子问题，避免重复计算','O(n) 时间 / 空间']],
    dp:[['grid-paths','网格路径计数','只能向右或向下，统计避开障碍的路径','O(nm)'],['grid-min-path','网格最小路径和','从上方或左方转移，选择代价更小的路径','O(nm)']],
    graph:[['components','无向图连通分量','逐个选择未访问起点，标记每个连通分量','O(V + E)']],
    strings:[['string-count','字符串遍历与统计','按下标遍历小写英文字母，统计字符频次','O(n)'],['string-compare','字符串比较','逐字符比较，理解字典序和前缀关系','O(min(n,m))']],
    math:[['lcm','最小公倍数','先求 GCD，再通过除法与乘法计算 LCM','O(log min(a,b))'],['mod-arithmetic','模运算基础','负数归一化，观察加、减、乘的取模结果','O(1)']]
  };
  for(const g of groups)g[5].push(...(additions[g[1]]||[]));
  groups.push(['structures','sets','并查集','08','用集合代表、路径压缩与合并优化处理连通关系。',[
    ['dsu-size','按大小合并与路径压缩','把较小集合接到较大集合，压缩查找路径','均摊 O(α(n)) / 次']]]);
  groups.push(['algorithms','methods','基础方法','00','从枚举和模拟开始，再理解递归与分治。',[
    ['enumeration','枚举','逐个尝试不同下标的数对，寻找目标和','O(n²)'],['simulation','模拟：轮转服务','按时间片处理队列中的任务，记录完成顺序','O(任务轮转次数)'],['recursion','递归基础','用阶乘观察终止条件、调用与返回','O(n) 时间 / 空间'],['divide-conquer','分治基础','拆分区间、递归求解，再合并最大值','O(n) 时间 / O(log n) 栈空间']]]);
  const names={hash:'集合、映射与哈希',advanced:'区间查询结构',search:'查找与二分','tree-traversal':'树上算法',math:'数学与组合'};
  const descriptions={hash:'从集合去重和键值关联，到观察哈希冲突的处理。',advanced:'维护区间信息，比较更新、预处理和查询的不同代价。','tree-traversal':'从四种遍历走向 DFS 序、树的直径与祖先查询。',math:'从整除和模运算开始，逐步认识素数、方程与组合计数。'};
  for(const g of groups){g[2]=names[g[1]]||g[2];g[4]=descriptions[g[1]]||g[4];}
  const order=['linear','stack-queue','heaps','hash','trees','sets','advanced','graphs','methods','techniques','search','sorting','traversal','tree-traversal','graph','dp','greedy','strings','math'];
  groups.sort((a,b)=>order.indexOf(a[1])-order.indexOf(b[1]));
  const sectionNumbers={structures:0,algorithms:0};
  L.groups = groups.map(([section,id,title,number,description,items]) => ({section,id,title,number:String(++sectionNumbers[section]).padStart(2,'0'),description,items:items.map(([id,title,description,complexity])=>({id,title,description,complexity}))}));
  L.guideGroups=[{section:'structures',id:'stl',title:'STL 标准模板库',number:'09',description:'从 vector、string 到 stack、queue、set 与 map，学习 C++ 常用容器和算法。',guide:true,tags:['vector / string','stack / queue','set / map'],items:[],entries:[]}];
  L.catalogGroups=[...L.groups.filter(g=>g.section==='structures'),...L.guideGroups,...L.groups.filter(g=>g.section==='algorithms')];
  L.foundationIds = [...Object.values(additions).flat().map(x=>x[0]),'dsu-size','enumeration','simulation','recursion','divide-conquer'];
  L.items = L.groups.flatMap(group => group.items.map(item => ({...item,group:group.id,groupTitle:group.title,section:group.section,path:group.section+'/'+group.id+'/'+item.id+'.html'})));
  const competition = [
    ['foundations','基础技巧拓展','位、坐标和二维区间，从基础操作积累竞赛工具。',[
      ['bit-count','位运算与二进制','通过 lowbit 消去最低位的 1','O(log n)'],['compression','离散化','排序去重，将数值映射为排名','O(n log n)'],['prefix-2d','二维前缀和','容斥组合四块前缀，查询子矩阵','O(nm) 预处理'],['difference-2d','二维差分','四个角标记矩形加，再累加还原','O(nm + q)'],['big-add','高精度加法','从低位到高位逐位计算进位','O(位数)']]],
    ['selection','查找与排序拓展','用单调性与分治处理答案和计数。',[
      ['binary-answer','二分答案','将非负数组分成至多 k 段，最小化最大段和','O(n log 总和)'],['real-binary','实数二分','固定迭代次数逼近平方根','O(迭代次数)'],['inversions','逆序对','归并时一次统计跨越左右两半的逆序','O(n log n)']]],
    ['searching','搜索拓展','从多个起点扩展，或按边权调整队列顺序。',[
      ['flood-fill','Flood Fill','四连通搜索并填充同一块区域','O(nm)'],['multi-bfs','多源 BFS','多个起点同时入队，计算最近距离','O(nm)'],['zero-one-bfs','0-1 BFS','零权边入队首，一权边入队尾','O(V + E)']]],
    ['ranges','数据结构拓展','维护单调性，减少窗口和区间里的重复工作。',[
      ['mono-stack','单调栈','为每个元素寻找右侧第一个更大值','O(n)'],['mono-queue','单调队列','维护滑动窗口最大值的候选下标','O(n)'],['sparse-table','ST 表','倍增长度预处理静态区间最小值','O(n log n) 预处理']]],
    ['dynamic','动态规划拓展','理解状态、转移和背包更新方向。',[
      ['max-subarray','最大子段和','决定延长当前段，还是重新开始','O(n)'],['edit-distance','编辑距离','比较插入、删除和替换三种转移','O(nm)'],['complete-pack','完全背包','正序遍历容量，让同一物品重复使用','O(nC)'],['group-pack','分组背包','读取上一组状态，每组最多选一件','O(物品总数 × C)']]],
    ['networks','图论拓展','借助优先队列和染色处理常见图问题。',[
      ['heap-dijkstra','堆优化 Dijkstra','跳过过期状态，只扩展当前最短距离','O((V + E) log V)'],['bipartite-color','二分图染色','相邻节点染不同颜色，检查奇环','O(V + E)']]],
    ['tree-paths','树上算法','把树映射到序列，沿深度与祖先关系查询。',[
      ['dfs-order','DFS 序','记录进入与离开时间，定位子树区间','O(n)'],['tree-diameter','树的直径','两次 BFS 寻找无权树中最远的两个端点','O(n)'],['binary-lca','倍增 LCA','预处理 2 的幂次祖先，再同步向上跳','O(n log n) 预处理']]],
    ['text','字符串拓展','复用已匹配区间，观察对称与前缀关系。',[
      ['z-function','Z 算法','维护与字符串前缀相同的最长区间','O(n)'],['manacher','Manacher','利用回文对称性扩展奇偶回文半径','O(n)']]],
    ['number-theory','数学与组合','观察分解、筛选与递推的每一步。',[
      ['factorization','质因数分解','试除并反复除尽当前质因子','O(√n)'],['extended-gcd','扩展欧几里得','在余数回溯中构造贝祖等式系数','O(log min(a,b))'],['linear-sieve','线性筛','让每个合数只被最小质因子标记一次','O(n)'],['pascal','组合数递推','从上一行左右两项推出当前组合数','O(n²)']]],
    ['geometry','计算几何','通过平面上的点、方向和边理解几何判定。',[
      ['cross-product','叉积与方向','观察向量叉积的正负和三点转向','O(1)'],['segment-intersection','线段相交','跨立与端点共线检查，含边界相交','O(1)'],['convex-hull','凸包','按字典序排序，用单调链维护外边界','O(n log n)']]],
    ['games','博弈入门','从有限胜负态走到多堆 Nim 的异或结论。',[
      ['win-lose','胜负态递推','每次取 1～3 个，寻找能到达败态的选择','O(n)'],['nim','Nim 游戏','异或所有石堆，构造一步制胜方案','O(n)']]],
    ['offline','离线算法','重新安排询问顺序，再把答案放回原编号。',[
      ['offline-threshold','离线阈值查询','按阈值激活元素，用树状数组计数','O((n + q) log n)'],['mo-distinct','莫队算法','按块排序区间，移动端点维护不同数个数','O((n + q)√n)']]]
  ];
  L.competitionGroups = competition.map(([id,title,description,items],i)=>({section:'extensions/competition',id,title,description,number:String(i+1).padStart(2,'0'),items:items.map(([id,title,description,complexity])=>({id,title,description,complexity}))}));
  L.competitionItems = L.competitionGroups.flatMap(group=>group.items.map(item=>({...item,group:group.id,groupTitle:group.title,section:group.section,path:group.section+'/'+group.id+'/'+item.id+'.html'})));
  L.allGroups = [...L.catalogGroups,...L.competitionGroups];
  L.allItems = [...L.items,...L.competitionItems];
  const optional=new Set(['avl','manacher','mo-distinct','convex-hull','binary-lca','interval-dp']);
  for(const item of L.allItems)item.level=optional.has(item.id)?'选学':item.section==='extensions/competition'||['dsu-size','pruning','memo-search','grid-paths','grid-min-path','dijkstra','bellman-ford','floyd','fenwick','segment-tree','kmp'].includes(item.id)?'常用提高':'入门';
  const overrides={array:['数组','访问 O(1)，中间插入/删除 O(n)'],recurrence:['基础递推：斐波那契','O(n)'], 'interval-dp':['区间 DP：石子合并','O(n³)'],'lower-bound':['二分：第一个 ≥ 目标','O(log n)'],'upper-bound':['二分：第一个 > 目标','O(log n)'],'sparse-table':['ST 表','预处理 O(n log n)，查询 O(1)'],'binary-lca':['倍增 LCA','预处理 O(n log n)，查询 O(log n)'],'bit-count':['位运算：lowbit 与位计数','O(log n)'],'disjoint-set':['并查集：路径压缩','演示路径压缩，未使用按秩合并']};
  for(const item of L.allItems)if(overrides[item.id]){[item.title,item.complexity]=overrides[item.id];}
  for(const id of ['ordered-set','ordered-map'])L.allItems.find(x=>x.id===id).complexity='C++ / Java O(log n)，Python 列表插入 O(n)';
  for(const group of L.allGroups)for(const item of group.items)Object.assign(item,L.allItems.find(x=>x.id===item.id));
  const related={
    'stack-queue':['mono-stack','mono-queue'],sets:['disjoint-set'],advanced:['fenwick','segment-tree','sparse-table'],
    techniques:['bit-count','compression','prefix-2d','difference-2d','big-add'],search:['binary-answer','real-binary'],sorting:['inversions'],traversal:['flood-fill','multi-bfs','zero-one-bfs'],
    'tree-traversal':['dfs-order','tree-diameter','binary-lca'],graph:['heap-dijkstra','zero-one-bfs','bipartite-color'],dp:['max-subarray','edit-distance','complete-pack','group-pack'],strings:['z-function','manacher'],math:['factorization','extended-gcd','linear-sieve','pascal']
  };
  for(const group of L.groups){
    const ids=group.id==='advanced'?related.advanced:[...group.items.map(x=>x.id),...(related[group.id]||[])];
    group.entries=[...new Set(ids)].map(id=>L.allItems.find(x=>x.id===id));
  }
  const firstEntries={sets:['disjoint-set','dsu-size'],hash:['ordered-set','hash-set','ordered-map','hash-map'],strings:['string-count','string-compare'],math:['gcd','lcm','mod-arithmetic','fast-power','sieve'],dp:['recurrence','grid-paths','grid-min-path']};
  for(const group of L.groups)if(firstEntries[group.id]){
    const first=firstEntries[group.id];
    group.entries.sort((a,b)=>(first.includes(a.id)?first.indexOf(a.id):first.length)-(first.includes(b.id)?first.indexOf(b.id):first.length));
  }
  L.guideGroups[0].entries=['dynamic-array','string-count','string-compare','stack','queue','deque','max-heap','min-heap','ordered-set','ordered-map','hash-set','hash-map','lower-bound','upper-bound','quick-sort','compression'].map(id=>L.allItems.find(x=>x.id===id));
  L.searchItems=[...L.allItems,...L.guideGroups.map(g=>({id:g.id,title:g.title,description:g.description,groupTitle:'数据结构 · C++ 专题',path:g.section+'/'+g.id+'/index.html'}))];
  const prerequisites={
    'dynamic-array':['array'],'ordered-set':['array'],'ordered-map':['ordered-set'],'hash-set':['hash-chaining'],'hash-map':['hash-set'],
    'dsu-size':['disjoint-set'],enumeration:['array'],simulation:['queue'],recursion:['stack'],'divide-conquer':['recursion'],
    pruning:['recursion'], 'memo-search':['recursion','recurrence'],'grid-paths':['recurrence'],'grid-min-path':['grid-paths'],
    components:['adjacency-list','bfs'],'string-count':['array'],'string-compare':['string-count'],lcm:['gcd'],'mod-arithmetic':['gcd']
  };
  L.prerequisites=id=>(prerequisites[id]||[]).map(key=>L.allItems.find(x=>x.id===key));
  L.categoryFor=id=>L.groups.find(g=>g.entries.some(x=>x.id===id));
  for(const item of L.items)item.groupTitle=L.categoryFor(item.id)?.title||item.groupTitle;
  L.item = id => L.allItems.find(item => item.id === id);
  L.extensions = [
    ['基础技巧拓展','位运算、离散化、二维前缀和与差分、高精度'],
    ['查找与排序拓展','二分答案、实数二分、桶排序、基数排序、快速选择、逆序对'],
    ['搜索拓展','Flood Fill、多源 BFS、双向 BFS、0-1 BFS、剪枝、记忆化搜索、迭代加深'],
    ['数据结构拓展','单调栈、单调队列、ST 表、带权并查集、懒标记、01 Trie、分块'],
    ['动态规划拓展','最大子段和、编辑距离、完全/多重/分组背包、计数、树形/换根/状压/数位 DP'],
    ['图论拓展','堆优化 Dijkstra、SPFA、负环、差分约束、二分图、强连通分量、割点、桥、欧拉路径'],
    ['树上算法','DFS 序、直径、重心、倍增、LCA、树上距离'],
    ['字符串拓展','Z 算法、Manacher'],
    ['数学与组合','质因数分解、扩展欧几里得、逆元、线性筛、欧拉函数、组合数、容斥、矩阵快速幂、高斯消元'],
    ['计算几何','点积、叉积、位置判定、线段相交、多边形、凸包、旋转卡壳、扫描线'],
    ['博弈与概率','胜负态、Nim、概率 DP、期望 DP'],
    ['离线算法','离线查询、莫队、启发式合并']
  ];
})(typeof window === 'undefined' ? globalThis : window);
