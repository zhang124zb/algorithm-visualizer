# STL 标准模板库题单

[返回总目录](../README.md) · [题目总索引](../题目索引.md)

本文件包含 16 个知识点；每节按模板、基础、进阶、困难顺序练习。困难题选做，分层为本题单建议，不等同于平台官方评级。

本页知识点：

- [vector](#stl-vector)
- [string](#stl-string)
- [deque](#stl-deque)
- [stack](#stl-stack)
- [queue](#stl-queue)
- [priority_queue](#stl-priority-queue)
- [set](#stl-set)
- [map](#stl-map)
- [unordered_set](#stl-unordered-set)
- [unordered_map](#stl-unordered-map)
- [pair](#stl-pair)
- [sort](#stl-sort)
- [reverse](#stl-reverse)
- [lower_bound](#stl-lower-bound)
- [upper_bound](#stl-upper-bound)
- [unique + erase](#stl-unique)

<a id="stl-vector"></a>

## vector

训练范围：C++ vector 接口、范围与动态存储。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-vector)。

选题说明：用真实编译器练 vector；可在本地额外自测 reserve/resize/size/capacity 的区别，但容量数值不是这些 OJ 的评测要求。 题目可以用其他合法容器通过；这里建议统一用 vector 重写。

- [ ] **模板** · [CSES 1083 · Missing Number](https://cses.fi/problemset/task/1083/)
  - 训练重点：将输入逐项 push_back 到动态数组，再遍历检查缺失值。
- [ ] **基础** · [洛谷 P3613 · 〖深基15.例2〗寄包柜](https://www.luogu.com.cn/problem/P3613)
  - 训练重点：按柜号分配外层 vector，柜内按已访问的最大格号增长，避免一次开满二维数组。
  - 提醒：题面保证格号不超过 10^5、所有柜子的格子总数不超过 10^7；需估算 vector 的容量冗余和内存，不能一次开 n×最大格号。物品值可达 10^9，不是格号；也可改用关联容器稀疏存储。
- [ ] **基础** · [CSES 1621 · Distinct Numbers](https://cses.fi/problemset/task/1621/)
  - 训练重点：把数据保存到 vector 后排序去重，区分长度与预留容量。
- [ ] **进阶** · [洛谷 B3643 · 图的存储](https://www.luogu.com.cn/problem/B3643)
  - 训练重点：用 vector&lt;vector&lt;int&gt;&gt; 按顶点增长邻接表。
- [ ] **进阶** · [洛谷 P5318 · 〖深基18.例3〗查找文献](https://www.luogu.com.cn/problem/P5318)
  - 训练重点：逐条追加邻居、排序每个邻接表，再进行遍历。
  - 提醒：还需先学基础 DFS/BFS。
- [ ] **困难 · 选做** · [Codeforces 1512D · Corrupted Array](https://codeforces.com/problemset/problem/1512/D)
  - 训练重点：读入可变长度序列并整理多余元素，注意真正删除后的长度。
  - 提醒：先推导总和条件，再决定哪些元素需要移除。

<a id="stl-string"></a>

## string

训练范围：字符访问、比较、拼接、子串与构造。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-string)。

选题说明：可在本地为结果串 reserve 预计长度，观察 size 不变和后续增长；OJ 不检查容量，也不保证浏览器子集支持题目需要的全部接口。

- [ ] **模板** · [CSES 1069 · Repetitions](https://cses.fi/problemset/task/1069/)
  - 训练重点：按下标读取字符，维护相同字符的连续段。
- [ ] **基础** · [Codeforces 71A · Way Too Long Words](https://codeforces.com/problemset/problem/71/A)
  - 训练重点：读取单词长度，组合首字母、长度与尾字母。
- [ ] **基础** · [Codeforces 112A · Petya and Strings](https://codeforces.com/problemset/problem/112/A)
  - 训练重点：统一大小写后按字典序比较两个字符串。
- [ ] **进阶** · [Codeforces 118A · String Task](https://codeforces.com/problemset/problem/118/A)
  - 训练重点：逐字符过滤和转换，再追加到结果 string。
- [ ] **进阶** · [CSES 1755 · Palindrome Reorder](https://cses.fi/problemset/task/1755/)
  - 训练重点：统计频次后拼出回文，区分左右半段及中心字符。
- [ ] **困难 · 选做** · [Codeforces 1560E · Polycarp and String Transformation](https://codeforces.com/problemset/problem/1560/E)
  - 训练重点：根据末尾出现顺序还原删除过程，构造并验证候选原串。
  - 提醒：提高题：需要频次推理和字符串模拟，不是仅练某个成员函数。

<a id="stl-deque"></a>

## deque

训练范围：C++ deque 的两端接口与下标/窗口应用。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-deque)。

选题说明：建议用 std::deque 复练；单调队列和树状数组等提高题前置仍然适用。OJ 不强制 STL 容器。

- [ ] **模板** · [Codeforces 1579E1 · Permutation Minimization by Deque](https://codeforces.com/problemset/problem/1579/E1)
  - 训练重点：每次比较新元素与队首，选择向前或向后插入。
- [ ] **基础** · [洛谷 P1996 · 约瑟夫问题](https://www.luogu.com.cn/problem/P1996)
  - 训练重点：用 deque 的队首删除和队尾追加完成报数模拟。
  - 提醒：本题只用 deque 的部分接口，作为基础熟悉练习。
- [ ] **基础** · [Codeforces 1179A · Valeriy and Deque](https://codeforces.com/problemset/problem/1179/A)
  - 训练重点：反复取出前两个元素，并分别送回两端。
- [ ] **进阶** · [洛谷 P1886 · 〖模板〗单调队列 / 滑动窗口](https://www.luogu.com.cn/problem/P1886)
  - 训练重点：从两端删除过期或被支配候选，维护窗口最值。
  - 提醒：需先学习单调队列，不要把普通 deque 与单调性混为一谈。
- [ ] **进阶** · [CSES 1644 · Maximum Subarray Sum II](https://cses.fi/problemset/task/1644/)
  - 训练重点：在前缀和的有效区间内维护最小候选，求受长度限制的最大子段和。
  - 提醒：需要前缀和和单调队列。
- [ ] **困难 · 选做** · [Codeforces 1579E2 · Array Optimization by Deque](https://codeforces.com/problemset/problem/1579/E2)
  - 训练重点：比较新元素放在两端产生的逆序数，使用有序计数辅助判断。
  - 提醒：选学提高：还需离散化与树状数组；不是只调用 deque 就能通过。

<a id="stl-stack"></a>

## stack

训练范围：C++ stack 的 push/top/pop/empty 接口。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-stack)。

选题说明：建议使用 std::stack 复练，pop 不返回被移除元素；提高题仍需额外状态或下标。OJ 不强制此适配器。

- [ ] **模板** · [洛谷 P1739 · 表达式括号匹配](https://www.luogu.com.cn/problem/P1739)
  - 训练重点：用栈检查括号匹配，并测试空栈与结束时残留。
- [ ] **基础** · [Codeforces 26B · Regular Bracket Sequence](https://codeforces.com/problemset/problem/26/B)
  - 训练重点：用栈保存尚未匹配的左括号，累计可以配对的长度。
  - 提醒：只含一种括号时也可用计数器，本题不强制栈。
- [ ] **基础** · [洛谷 P1449 · 后缀表达式](https://www.luogu.com.cn/problem/P1449)
  - 训练重点：读入完整操作数，按运算顺序弹出右操作数与左操作数。
- [ ] **进阶** · [洛谷 P4387 · 〖深基15.习9〗验证栈序列](https://www.luogu.com.cn/problem/P4387)
  - 训练重点：按出栈目标推动入栈过程，判断何时应该弹出。
- [ ] **进阶** · [Codeforces 343B · Alternating Current](https://codeforces.com/problemset/problem/343/B)
  - 训练重点：用栈消去相邻可抵消元素，观察连锁消除。
- [ ] **困难 · 选做** · [Codeforces 5C · Longest Regular Bracket Sequence](https://codeforces.com/problemset/problem/5/C)
  - 训练重点：维护未匹配位置和有效区间边界，统计最长合法长度及次数。
  - 提醒：提高题：在普通括号栈上增加下标与断点处理。

<a id="stl-queue"></a>

## queue

训练范围：C++ queue 的 push/front/back/pop 接口。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-queue)。

选题说明：建议使用 std::queue 复练。普通队列不提供随机下标和迭代器，BFS 等题先满足算法前置。

- [ ] **模板** · [Codeforces 450A · Jzzhu and Children](https://codeforces.com/problemset/problem/450/A)
  - 训练重点：将尚未满足需求的人出队后重新入队，记录最后处理对象。
  - 提醒：这是队列模拟的入门模板，也有更简洁的数学做法。
- [ ] **基础** · [洛谷 P1540 · \[NOIP 2010 提高组\] 机器翻译](https://www.luogu.com.cn/problem/P1540)
  - 训练重点：维护按进入顺序淘汰的缓存，区分队列与存在标记。
- [ ] **基础** · [洛谷 P1996 · 约瑟夫问题](https://www.luogu.com.cn/problem/P1996)
  - 训练重点：把未出圈者移动到队尾，在报数位置弹出。
- [ ] **进阶** · [洛谷 P1443 · 马的遍历](https://www.luogu.com.cn/problem/P1443)
  - 训练重点：用队列按层扩展棋盘位置，第一次访问时记录距离。
  - 提醒：需要先学 BFS，重点练队列元素与访问标记的配合。
- [ ] **进阶** · [洛谷 P2058 · \[NOIP 2016 普及组\] 海港](https://www.luogu.com.cn/problem/P2058)
  - 训练重点：按时间从队首移除过期记录，同步维护国籍频次。
- [ ] **困难 · 选做** · [Codeforces 644B · Processing Queries](https://codeforces.com/problemset/problem/644/B)
  - 训练重点：维护等待队列和完成时间，区分空闲处理与缓冲区已满。
  - 提醒：提高题：事件到达顺序和任务完成时刻必须严格区分。

<a id="stl-priority-queue"></a>

## priority_queue

训练范围：默认大根堆、greater 小根堆与自定义比较。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-priority-queue)。

选题说明：标准优先队列不支持随意删除内部元素或直接修改堆顶；浏览器实验室尚预留此接口，题目在真实 C++17 编译器中练习。

- [ ] **模板** · [洛谷 P3378 · 〖模板〗堆](https://www.luogu.com.cn/problem/P3378)
  - 训练重点：使用 greater&lt;int&gt; 实现最小值优先，理解比较方向。
- [ ] **基础** · [洛谷 P1090 · \[NOIP 2004 提高组\] 合并果子](https://www.luogu.com.cn/problem/P1090)
  - 训练重点：每次取出两个最小项，合并后重新 push。
- [ ] **基础** · [Codeforces 160A · Twins](https://codeforces.com/problemset/problem/160/A)
  - 训练重点：使用默认大根堆，逐个取最大硬币。
- [ ] **进阶** · [Codeforces 681C · Heap Operations](https://codeforces.com/problemset/problem/681/C)
  - 训练重点：在 top 前确认非空，用最少补充操作修复序列。
- [ ] **进阶** · [Codeforces 1353D · Constructing the Array](https://codeforces.com/problemset/problem/1353/D)
  - 训练重点：将区间长度和左端点共同写入严格比较规则。
- [ ] **困难 · 选做** · [洛谷 P1801 · 黑匣子](https://www.luogu.com.cn/problem/P1801)
  - 训练重点：组合大根和小根优先队列，维护第 k 小分界。

<a id="stl-set"></a>

## set

训练范围：std::set 去重、有序键、边界迭代器与删除。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-set-map)。

选题说明：题目不强制 set；重复值要通过带编号的 pair 保存，或在真实编译器中学习 multiset，不能默默丢弃重复元素。

- [ ] **模板** · [洛谷 P1059 · \[NOIP 2006 普及组\] 明明的随机数](https://www.luogu.com.cn/problem/P1059)
  - 训练重点：用集合去重并按值递增遍历。
- [ ] **基础** · [CSES 1621 · Distinct Numbers](https://cses.fi/problemset/task/1621/)
  - 训练重点：插入所有整数，最后读取集合大小。
- [ ] **基础** · [CSES 1091 · Concert Tickets](https://cses.fi/problemset/task/1091/)
  - 训练重点：找不超过预算的最大票价并删除一张票。
  - 提醒：存在重复票价：可用 set&lt;pair&lt;票价,编号&gt;&gt;，不能用 set&lt;int&gt; 丢掉重复票。
- [ ] **进阶** · [CSES 1073 · Towers](https://cses.fi/problemset/task/1073/)
  - 训练重点：查找严格更大的塔顶并替换它。
  - 提醒：塔顶可重复，应采用带编号的 set 或 multiset；核心是 upper_bound 语义。
- [ ] **进阶** · [CSES 1163 · Traffic Lights](https://cses.fi/problemset/task/1163/)
  - 训练重点：用前驱与后继拆分路段，再维护路段长度的多重集合。
- [ ] **困难 · 选做** · [CSES 1632 · Movie Festival II](https://cses.fi/problemset/task/1632/)
  - 训练重点：为每场电影查找可用成员的最晚结束时间并更新。
  - 提醒：提高题：需贪心论证；成员结束时间可重复，要区分实例。

<a id="stl-map"></a>

## map

训练范围：std::map 的键值、find/count、下标默认插入与 erase。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-set-map)。

选题说明：建议用 std::map 练习标准接口；map[key] 在缺键时会插入默认值，只读查询应按需要选 find/count。排序或更复杂算法不是 map 自动完成的。

- [ ] **模板** · [洛谷 P5266 · 〖深基17.例6〗学籍管理](https://www.luogu.com.cn/problem/P5266)
  - 训练重点：练习按姓名插入覆盖、查询、删除及统计键数。
- [ ] **基础** · [洛谷 P1918 · 保龄球](https://www.luogu.com.cn/problem/P1918)
  - 训练重点：保存数值与原下标的关联，处理不存在的键。
- [ ] **基础** · [Codeforces 4C · Registration System](https://codeforces.com/problemset/problem/4/C)
  - 训练重点：把名字映射到使用次数，避免查询造成不必要的插入。
- [ ] **进阶** · [Codeforces 37A · Towers](https://codeforces.com/problemset/problem/37/A)
  - 训练重点：按数值统计频次，分别得到不同值数量与最高计数。
- [ ] **进阶** · [CSES 1661 · Subarray Sums II](https://cses.fi/problemset/task/1661/)
  - 训练重点：按前缀和维护频次，查询所需的历史前缀。
  - 提醒：需先学前缀和；负数使简单滑动窗口不再适用。
- [ ] **困难 · 选做** · [Codeforces 1490F · Equalize the Array](https://codeforces.com/problemset/problem/1490/F)
  - 训练重点：先用映射汇总频率，再比较保留不同目标频数的代价。
  - 提醒：提高题：需要额外整理频数，不能对每种候选重复扫描全部数据。

<a id="stl-unordered-set"></a>

## unordered_set

训练范围：std::unordered_set 成员语义、哈希键与预留桶。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-unordered)。

选题说明：reserve/rehash/bucket_count/load_factor 可另做本地观测，不设具体桶数答案；这些题不强制哈希容器，预留不能保证无碰撞或不超时。

- [ ] **模板** · [洛谷 P4305 · \[JLOI2011\] 不重复数字](https://www.luogu.com.cn/problem/P4305)
  - 训练重点：使用哈希集合识别首次出现，输出顺序由输入顺序决定。
- [ ] **基础** · [Codeforces 443A · Anton and Letters](https://codeforces.com/problemset/problem/443/A)
  - 训练重点：把出现过的字母插入集合，读取不同字母数。
- [ ] **基础** · [Codeforces 469A · I Wanna Be the Guy](https://codeforces.com/problemset/problem/469/A)
  - 训练重点：合并两个通关记录的集合，检查是否覆盖全部关卡。
- [ ] **进阶** · [CSES 1621 · Distinct Numbers](https://cses.fi/problemset/task/1621/)
  - 训练重点：在大值域下去重，不按最大数值开数组。
- [ ] **进阶** · [洛谷 P2580 · 于是他错误的点名开始了](https://www.luogu.com.cn/problem/P2580)
  - 训练重点：分别保存合法姓名与已经点过的姓名，区分不存在和重复。
- [ ] **困难 · 选做** · [CSES 1141 · Playlist](https://cses.fi/problemset/task/1141/)
  - 训练重点：在移动窗口时删除离开的元素，维护窗口内不重复。
  - 提醒：提高题：需要双指针；也可用映射保存最后出现位置。

<a id="stl-unordered-map"></a>

## unordered_map

训练范围：std::unordered_map 字典与频次、原键等值和默认插入。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-unordered)。

选题说明：先正确维护键值语义，再在本地自测 reserve 和负载阈值；预留不会创建元素，也不设后续元素上限。OJ 不验收具体桶数或哈希顺序。

- [ ] **模板** · [洛谷 P5266 · 〖深基17.例6〗学籍管理](https://www.luogu.com.cn/problem/P5266)
  - 训练重点：按字符串键完成插入、覆盖、查询和删除。
- [ ] **基础** · [洛谷 P1918 · 保龄球](https://www.luogu.com.cn/problem/P1918)
  - 训练重点：通过键查询原下标，避免值域过大时直接开表。
- [ ] **基础** · [Codeforces 4C · Registration System](https://codeforces.com/problemset/problem/4/C)
  - 训练重点：按用户名累计次数并生成可用的新名称。
- [ ] **进阶** · [Codeforces 1520D · Same Differences](https://codeforces.com/problemset/problem/1520/D)
  - 训练重点：将下标和值的关系转成同键计数问题。
- [ ] **进阶** · [CSES 1661 · Subarray Sums II](https://cses.fi/problemset/task/1661/)
  - 训练重点：按前缀和统计所需历史值，注意先查询再增加当前频次。
- [ ] **困难 · 选做** · [Codeforces 873B · Balanced Substring](https://codeforces.com/problemset/problem/873/B)
  - 训练重点：把前缀差映射到最早下标，求最长平衡区间。
  - 提醒：提高题：需要先把字符映射为 +1/-1，并解释保留最早下标的原因。

<a id="stl-pair"></a>

## pair

训练范围：同时保存两项数据、字典序比较与原编号。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-pair)。

选题说明：OJ 不要求 pair，也可用 struct；本组重点是避免数值、下标和时间之间失去对应。

- [ ] **模板** · [洛谷 P1208 · \[USACO1.3\] 混合牛奶 Mixing Milk](https://www.luogu.com.cn/problem/P1208)
  - 训练重点：用 pair&lt;单价,产量&gt; 统一保存、排序并取用供应信息。
- [ ] **基础** · [Codeforces 230A · Dragons](https://codeforces.com/problemset/problem/230/A)
  - 训练重点：把需求与奖励配成一项，按需求排序后逐个处理。
- [ ] **基础** · [洛谷 P1918 · 保龄球](https://www.luogu.com.cn/problem/P1918)
  - 训练重点：保存 pair&lt;数值,原下标&gt;，排序后仍能回答原位置。
- [ ] **进阶** · [CSES 1640 · Sum of Two Values](https://cses.fi/problemset/task/1640/)
  - 训练重点：用 pair 保存数值及下标，找到和后输出两个不同原下标。
- [ ] **进阶** · [Codeforces 1650C · Weight of the System of Nested Segments](https://codeforces.com/problemset/problem/1650/C)
  - 训练重点：先按权值选择点，再按坐标排列并保留原编号。
- [ ] **困难 · 选做** · [CSES 1164 · Room Allocation](https://cses.fi/problemset/task/1164/)
  - 训练重点：在事件与小根堆中分别保存时间和编号，恢复原输入顺序。
  - 提醒：提高题：还需排序与优先队列，不是只创建 pair 就完成。

<a id="stl-sort"></a>

## sort

训练范围：随机访问区间排序、比较规则与排序后的算法。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-sort-reverse)。

选题说明：本组练 std::sort 接口及排序后处理；不声称 std::sort 内部就是本网站演示的快速排序。

- [ ] **模板** · [洛谷 P1177 · 〖模板〗排序](https://www.luogu.com.cn/problem/P1177)
  - 训练重点：用 sort(begin,end) 完成升序排序，理解尾后区间。
- [ ] **基础** · [洛谷 P1059 · \[NOIP 2006 普及组\] 明明的随机数](https://www.luogu.com.cn/problem/P1059)
  - 训练重点：先排序，再把重复值压缩成一个输出。
- [ ] **基础** · [Codeforces 339A · Helpful Maths](https://codeforces.com/problemset/problem/339/A)
  - 训练重点：提取待排序字符后重新组织输出。
- [ ] **进阶** · [Codeforces 230A · Dragons](https://codeforces.com/problemset/problem/230/A)
  - 训练重点：对 pair 按需求排序，解释为什么此顺序安全。
- [ ] **进阶** · [CSES 1084 · Apartments](https://cses.fi/problemset/task/1084/)
  - 训练重点：排序两组数后配合双指针，不对每个申请人重新扫描。
- [ ] **困难 · 选做** · [Codeforces 1443C · The Delivery Dilemma](https://codeforces.com/problemset/problem/1443/C)
  - 训练重点：按一项指标排序，比较分界两侧的两种处理代价。
  - 提醒：提高题：需要后缀和或累计量与贪心推理。

<a id="stl-reverse"></a>

## reverse

训练范围：整个字符串或子区间反转，保持符号和区间边界。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-sort-reverse)。

选题说明：困难相对于该接口的综合运用，不是平台最高难度。reverse 本身为线性操作；本组未选反复长区间反转会超时的题来误导直接调用。

- [ ] **模板** · [洛谷 P5705 · 〖深基2.例7〗数字反转](https://www.luogu.com.cn/problem/P5705)
  - 训练重点：把输入当字符串，反转整个字符序列。
- [ ] **基础** · [Codeforces 41A · Translation](https://codeforces.com/problemset/problem/41/A)
  - 训练重点：反转第一个字符串后比较，不修改第二个串的含义。
- [ ] **基础** · [洛谷 P1307 · \[NOIP 2011 普及组\] 数字反转](https://www.luogu.com.cn/problem/P1307)
  - 训练重点：只反转数字部分，再规范符号与前导零。
- [ ] **进阶** · [Codeforces 451B · Sort the Array](https://codeforces.com/problemset/problem/451/B)
  - 训练重点：定位唯一需要反转的区间，反转后验证整体有序。
- [ ] **进阶** · [洛谷 P1553 · 数字反转（升级版）](https://www.luogu.com.cn/problem/P1553)
  - 训练重点：先识别分隔符，再分别反转各数字区间。
- [ ] **困难 · 选做** · [Codeforces 1616B · Mirror in the String](https://codeforces.com/problemset/problem/1616/B)
  - 训练重点：选出应保留的前缀，拼接它的逆序得到镜像字符串。
  - 提醒：提高在于前缀选择的贪心，而不是 reverse 的实现难度。

<a id="stl-lower-bound"></a>

## lower_bound

训练范围：升序区间第一个不小于目标的位置与 end 检查。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-bounds)。

选题说明：先确保区间有序且比较规则一致；题目可用其他算法解决，建议在本组明确使用标准 lower_bound。

- [ ] **模板** · [洛谷 P2249 · 〖深基13.例1〗查找](https://www.luogu.com.cn/problem/P2249)
  - 训练重点：定位首次出现位置，检查是否 end 以及找到的值是否相等。
- [ ] **基础** · [Codeforces 474B · Worms](https://codeforces.com/problemset/problem/474/B)
  - 训练重点：在前缀和数组中找第一个覆盖查询位置的边界。
- [ ] **基础** · [洛谷 P1678 · 烦恼的高考志愿](https://www.luogu.com.cn/problem/P1678)
  - 训练重点：找第一个不小于估分的学校，并检查它左边的候选。
- [ ] **进阶** · [CSES 1640 · Sum of Two Values](https://cses.fi/problemset/task/1640/)
  - 训练重点：只在当前元素之后查找补数，保证使用不同下标。
- [ ] **进阶** · [Codeforces 702C · Cellular Network](https://codeforces.com/problemset/problem/702/C)
  - 训练重点：定位右侧最近基站，并与左侧基站比较距离。
- [ ] **困难 · 选做** · [洛谷 P1102 · A-B 数对](https://www.luogu.com.cn/problem/P1102)
  - 训练重点：配合 upper_bound 统计满足差值的重复数个数。
  - 提醒：需要保留重复元素和使用 64 位答案，不能先去重后直接计数。

<a id="stl-upper-bound"></a>

## upper_bound

训练范围：升序区间第一个严格大于目标的位置与计数。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-bounds)。

选题说明：vector 的 upper_bound 可用迭代器差得到下标；对 set/map 要优先使用容器自己的边界成员函数。

- [ ] **模板** · [Codeforces 706B · Interesting drink](https://codeforces.com/problemset/problem/706/B)
  - 训练重点：把 upper_bound 的位置转成不超过预算的价格数。
- [ ] **基础** · [Codeforces 600B · Queries about less or equal elements](https://codeforces.com/problemset/problem/600/B)
  - 训练重点：对每次询问计算小于等于给定值的元素个数。
- [ ] **基础** · [CSES 1073 · Towers](https://cses.fi/problemset/task/1073/)
  - 训练重点：查找严格大于当前方块的塔顶，不能误用 lower_bound。
- [ ] **进阶** · [洛谷 P1102 · A-B 数对](https://www.luogu.com.cn/problem/P1102)
  - 训练重点：与 lower_bound 配合得到同一目标值的完整重复范围。
- [ ] **进阶** · [CSES 1091 · Concert Tickets](https://cses.fi/problemset/task/1091/)
  - 训练重点：先找严格大于预算的位置，再安全退一格取可买票。
  - 提醒：必须先检查是否位于 begin；票价可重复。
- [ ] **困难 · 选做** · [CSES 1632 · Movie Festival II](https://cses.fi/problemset/task/1632/)
  - 训练重点：对可用时间找不超过开始时间的前驱，分配成员并更新。
  - 提醒：提高题：需要有序多重集合或带编号的 set；不要对 set 使用线性前进的通用算法冒充对数时间成员函数。

<a id="stl-unique"></a>

## unique + erase

训练范围：相邻去重、逻辑末尾、保留出现顺序与离散化。

配套学习：[网站演示或教学页](https://zhang124zb.github.io/algorithm-visualizer/structures/stl/index.html#stl-unique)。

选题说明：unique 只合并相邻相等项；模板组通过排序令它们相邻，erase 才真正删除尾部。综合题不保证只靠该接口即可解决。

- [ ] **模板** · [洛谷 P1059 · \[NOIP 2006 普及组\] 明明的随机数](https://www.luogu.com.cn/problem/P1059)
  - 训练重点：完整执行 sort → unique → erase，再输出真正的 size。
- [ ] **基础** · [CSES 1621 · Distinct Numbers](https://cses.fi/problemset/task/1621/)
  - 训练重点：排序后去重，验证 unique 本身不修改容器长度。
- [ ] **基础** · [Codeforces 443A · Anton and Letters](https://codeforces.com/problemset/problem/443/A)
  - 训练重点：收集所有字母，排序并去重后得到不同字符数。
- [ ] **进阶** · [洛谷 P4305 · \[JLOI2011\] 不重复数字](https://www.luogu.com.cn/problem/P4305)
  - 训练重点：保留每个数的首次出现位置，再恢复按首次出现的输出顺序。
  - 提醒：不能仅 sort/unique 后直接输出；它会改变题目要求的首次出现顺序。
- [ ] **进阶** · [洛谷 P1496 · 火烧赤壁](https://www.luogu.com.cn/problem/P1496)
  - 训练重点：收集区间端点后排序去重，按离散坐标维护覆盖长度。
  - 提醒：这是可选解法，也可直接排序合并区间；需要保留原坐标距离。
- [ ] **困难 · 选做** · [洛谷 P1955 · \[NOI2015\] 程序自动分析](https://www.luogu.com.cn/problem/P1955)
  - 训练重点：排序去重所有变量编号，映射成紧凑下标后交给并查集。
  - 提醒：提高题：需要先学并查集并先处理等式；去重只是离散化步骤。
