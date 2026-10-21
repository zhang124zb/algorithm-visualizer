# 算法演示室

使用原生 HTML、CSS、JavaScript 的算法可视化网站。网页文件在 `dist/`，直接打开 `dist/index.html` 即可使用学习演示，无需安装依赖。代码实验室需要通过网站或下文的本地预览地址打开，以启用浏览器执行线程。

## 使用

GitHub Pages 访问地址：https://zhang124zb.github.io/algorithm-visualizer/ 。首次启用需在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

`.github/workflows/pages.yml` 在 `main` 更新或手动运行时自动生成页面、运行检查，再把 `dist/` 发布到 Pages。无需安装 npm 依赖，也不需要服务器或额外密钥。构建或检查失败时不会发布。发布状态可在仓库 Actions 的 **Publish algorithm visualizer** 查看；启用 Pages 后可重跑之前的发布任务。

1. 打开 `dist/index.html`，选择数据结构或算法方向。
2. 点击具体条目，在浏览器新标签页中打开演示。
3. 右侧黄色框标出当前执行代码，左侧动画、变量和步骤解释同步变化。
4. 使用自动播放、暂停、调速、上一步、下一步和重新开始，也可拖动进度条。
5. 重新开始会重播同一组数据；重新生成数据会创建新案例。
6. 在“教学代码”右上角选择 C++、Python 或 Java。切换时暂停播放，保留输入、画面和当前步骤，并记住语言偏好。

桌面采用左侧 60%、右侧 40% 布局；手机窄屏下改为上下排列。空格控制播放/暂停，左右方向键单步，R 重新开始。

## 目录约定

- `dist/structures/<方向>/`：数据结构页面和该方向的演示逻辑。
- `dist/algorithms/<方向>/`：算法页面和该方向的演示逻辑。
- `dist/assets/`：共享样式、目录数据、动画渲染和播放控制。
- `dist/extensions/competition/<方向>/`：12 个竞赛方向的独立 HTML、动画逻辑与三语言教学代码。
- `dist/extensions/code-lab/`：以 C++ 为主的代码实验室，共享交互与动画集中维护，Python / Java 接入按语言分文件保存。
- `scripts/`：静态页面生成和验证工具，不参与网页运行。

保留首版 65 个演示，补齐 19 个基础主题，再加上 12 个方向、36 个竞赛拓展演示，共 120 个，均提供 C++、Python、Java 教学代码。自定义代码实验室支持三种语言的教学子集，以 C++ 为主要语言。

## 基础目录补齐

新增动态数组、有序/哈希集合与映射、按大小合并的并查集、枚举、轮转模拟、递归、分治、剪枝、记忆化搜索、两类网格 DP、连通分量、字符串统计与比较、LCM 和模运算，共 19 项。目录按“入门 / 常用提高 / 选学”标注，新增页面附建议先学的主题。

基础分类中的单调栈、ST 表、二分答案等直接链接到已有竞赛页面；每个算法只维护一份页面和实现。`group.items` 是文件归属，`group.entries` 是分类展示入口。并查集独立为 `structures/sets/`，旧版路径压缩演示仍保留原地址，面包屑进入新的并查集分类。

新增片段在对应组的 `code-variants.js` 中使用 `AlgoLab.addLesson(id, cpp, python, java)` 注册，动画文件使用 `AlgoLab.lessonTrace`。动态数组采用手动倍增的教学容量模型；Python 有序集合/映射用排序列表与字典组合演示，列表插入为 O(n)，区别于 C++ / Java 的树容器。哈希桶仅展示教学映射，不代表标准库实际桶布局。剪枝限定非负子集和，网格只向右/下走，字符串基础限定小写英文字母，模运算限定小规模安全整数和正模数。固定教学片段与代码实验室的语言子集支持范围分别维护。

`node scripts/verify-foundations.cjs` 验证新增算法的独立参考结果、边界情况、三语言行映射、目录关联与旧链接。

## 竞赛拓展

从主页或顶部导航进入“竞赛拓展”。目录支持搜索，具体算法在新标签页打开，沿用原有的 60% 动画 / 40% 教学代码、随机数据、变量观察和前后回放。主页搜索也能找到竞赛专题。

已开放基础技巧 5 项、查找与排序 3 项、搜索 3 项、数据结构 3 项、动态规划 4 项、图论 2 项、树上算法 3 项、字符串 2 项、数学与组合 4 项、计算几何 3 项、博弈 2 项、离线算法 2 项。包括二维前缀和/差分、二分答案、归并逆序对、单调栈/队列、完全/分组背包、堆优化 Dijkstra、倍增 LCA、Z / Manacher、凸包和莫队等。

较复杂的后续专题放在目录底部的“查看后续专题”，明确标注当前没有演示。每个方向的 `code-variants.js` 使用 `AlgoLab.competition.code(id, cpp, python, java)` 保存三语言片段；同目录 `<方向>.js` 保存动画构建逻辑。`support.js` 只共享代码注册、轨迹创建和小规模树/几何数据生成，播放器仍复用主站资源。

教学约定：二维矩形和数组查询使用闭区间；DFS 子树区间为 `[tin,tout)`；ST 表演示静态最小值；背包允许不装满；二分答案使用非负数组；树直径使用无权树；Nim 为正常玩法；Manacher 同时展示奇偶半径；几何使用小规模整数坐标；大整数加法的输入为无前导零的非负整数字符串。演示数据规模用于教学，片段不包含所有生产输入检查，竞赛代码中的数值范围、溢出与递归栈仍需按题目约束处理。

`npm run check` 包含竞赛算法的独立参考结果、边界情况及三语言步骤映射。启动预览后运行 `node scripts/verify-competition-browser.cjs` 检查全部 36 页和三语言逐帧画面。`node scripts/verify-competition-native.cjs` 使用本机 C++17 / Python 3 / JDK 编译运行竞赛 36 项与新增基础 19 项的全部 165 份片段；可通过 `ALGOLAB_CXX`、`ALGOLAB_PYTHON`、`ALGOLAB_JAVA`、`ALGOLAB_JAVAC` 指定工具。

## 代码实验室（C++ 为主）

从主页的“C++ 代码实验室”进入，默认选择 C++，也可切换 Python 或 Java。在新标签页编辑完整的单文件程序（Python 为脚本），设置标准输入，再点击“运行并生成动画”。三种语言均真实解释执行用户代码，记录数组、变量、函数调用和标准输出；无须自行添加动画指令。

- 每种语言内置冒泡排序、二分查找、前缀和、二维数组/列表、递归五个可修改示例。
- 同时展示当前作用域的 1～3 个数组/矩阵；超过 3 个时，优先展示本步变化、本行实际使用、使用频繁的数组，最多 3 个。可手动保留一个数组，其他位置仍自动选择，收起的数组可在变量观察中查看。每个数组的动画独立同步，回退会恢复全部可见数组。
- 支持递归调用栈、黄色代码行高亮、单步前后回放、重播、暂停、调速及进度拖动。
- 三种语言分别保存本机代码、输入及示例选择，切换不会覆盖其他语言的草稿；每次打开仍默认 C++。可下载 `main.cpp`、`main.py` 或 `Main.java`，支持示例随机输入和语法/运行错误显示。切换语言、修改代码或输入会清除旧执行记录，避免误播。
- C++ 黄色行显示当前执行位置；Python / Java 通过解释器在语句执行前暂停，黄色行是即将执行的行，下一步显示执行后的变化。回放语法高亮随语言切换。
- 程序在独立 Web Worker 内运行，不上传代码；上限为约 5 秒、2000 个记录步骤、16000 个输出字符。页面可主动停止，超限后仍可回放已生成的记录（浏览器强制超时除外）。
- 当前使用自托管 JSCPP 2.0.9，支持基础语法、普通数组、二维数组、函数/递归和部分头文件；**尚不支持完整 C++ 标准、STL 容器、类/模板或多文件**。不支持 `bits/stdc++.h`、`cstdlib`、`cstdio` 及系统调用。64 位整数精度受 JavaScript 数值范围限制。指针和库函数的支持同样有限，复杂竞赛代码应使用本地编译器。
- Python 使用自托管 Skulpt 1.2.0 的 Python 3 兼容模式，支持列表、二维列表、条件、循环、函数、递归、`input()` / `print()` 及少量标准库；不包含第三方包、文件/网络、异步或完整现代 Python 语法。列表和 `range` 按教学规模限制为最多 4096 项。
- Java 使用自托管 Java-Chan 教学解释器，支持单类的 static 方法、基本类型、普通/二维数组、循环、递归、`Scanner` 基本读取、`System.out`、部分 `Math` / `String` 及 `Arrays.sort` / `toString`。不包含完整 JVM、完整类型检查、long、集合、对象/继承、泛型或多文件；int 溢出会中止。**Java 运行器采用 PolyForm Noncommercial 1.0.0，仅用于非商业教学等许可允许的用途**，作者声明与许可随网站分发。
- 每个数组最多 4096 个计算元素；动画展示前 64 项或 16 × 16 矩阵，每个函数最多展示 64 个变量。循环下标按常用变量名辅助显示，不会推断任意算法或自动生成自定义图、树结构。全局初始化在进入 `main` 前完成，同一行的多个语句合为一次行步骤。

页面模板位于 `scripts/code-lab-template.cjs`；其余文件按功能集中在 `dist/extensions/code-lab/`。C++ 示例/执行在 `examples.js` / `engine.js`；三语言元数据、新增示例和适配器在 `languages/`。数组优先级规则集中在 `scene.js`，所有语言共用。解释器与三方许可证位于 `vendor/`，只加载本次选择的语言，不依赖外部 CDN。更新解释器请参阅该目录的 `README.md`。

`npm run check` 包含实验室实际执行、代码修改结果、递归、多数组筛选与同步、错误和资源限制测试。启动本地预览后，可运行 `node scripts/verify-code-lab-browser.cjs` 检查页面交互及手机布局，运行 `node scripts/verify-code-lab-arrays-browser.cjs` 检查多个数组的展示、回退、手动保留及作用域切换。

`node scripts/verify-lab-languages-browser.cjs` 检查 Python / Java 的真实 Worker 执行、示例、切换、独立草稿、多数组和手机布局。可选 `node scripts/verify-lab-native.cjs` 使用本地 Python 3 和 JDK 核对新增的 10 个示例，支持下文相同的 `ALGOLAB_PYTHON` / `ALGOLAB_JAVA` / `ALGOLAB_JAVAC` 环境变量。

## 更新页面

基础页面按 8 个数据结构方向、11 个算法方向分组，竞赛另有 12 个方向，共 120 个演示、154 个 HTML 页面。每组的 HTML 与该组演示逻辑放在同一个文件夹，共享播放器和样式统一维护。`groups` / `items` 保持基础目录兼容，`allGroups` / `allItems` 同时包含竞赛拓展。

每组的 `code-variants.js` 保存 Python、Java 代码及其步骤标签；原有 `<方向>.js` 保存 C++ 代码和动画逻辑。三种语言按语义标签对应代码行，切换时复用同一组状态快照。

修改 `dist/assets/js/catalog.js` 或 `scripts/generate-pages.cjs` 后，运行 `npm run generate` 更新静态 HTML。直接修改某个生成的 HTML 也会立即生效，但下次生成时会被模板覆盖。

运行 `npm run check` 检查算法结果、代码行映射及页面链接。可选运行 `node scripts/verify-cpp.cjs` 检查首版 65 项 C++ 教学代码（需要 g++）。浏览器测试脚本使用开发时放在 `artifacts/` 的临时 Playwright 测试工具，不是网站运行依赖。

运行 `node scripts/verify-code-versions.cjs` 可实际执行首版 65 项的 Python、Java 片段（需要 Python 3、JDK 9+ 编译器；Java 代码按 Java 8 兼容模式验证）。如果 Windows 的 Python 启动器限制子进程，可通过 `ALGOLAB_PYTHON` 指向实际解释器；`ALGOLAB_JAVA`、`ALGOLAB_JAVAC` 可指定验证使用的运行器和编译器。

如果希望通过本地网址打开，在项目文件夹运行 `npm run preview` 后访问 `http://127.0.0.1:4173`，运行期间保持终端开启。Windows CMD 跨盘进入项目时用 `cd /d "项目绝对路径"`；PowerShell 使用 `cd "项目绝对路径"`。网页本身不依赖 Node.js。

扩展约定详见 `dist/extensions/README.md`。
