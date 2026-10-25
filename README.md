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
- `dist/structures/stl/`：独立的 C++ STL 教学专题，样式与页面按组存放；模板为 `scripts/stl-template.cjs`。
- `dist/algorithms/<方向>/`：算法页面和该方向的演示逻辑。
- `dist/assets/`：共享样式、目录数据、动画渲染和播放控制。
- `dist/extensions/competition/<方向>/`：12 个竞赛方向的独立 HTML、动画逻辑与三语言教学代码。
- `dist/extensions/code-lab/`：以 C++ 为主的代码实验室，共享交互与动画集中维护，Python / Java 接入按语言分文件保存。
- `scripts/`：静态页面生成和验证工具；`scripts/local-lab/` 为可选的本机 C++ 服务。

保留首版 65 个演示，补齐 19 个基础主题，再加上 12 个方向、36 个竞赛拓展演示，共 120 个，均提供 C++、Python、Java 教学代码。自定义代码实验室支持三种语言的教学子集，以 C++ 为主要语言。

数据结构目录另设“STL 标准模板库”入口，可从首页搜索 STL 或 vector 找到。专题包含顺序容器、容器适配器、集合映射与 pair、算法与迭代器四组，共 12 个固定 C++17 示例，说明常用接口、复杂度和易错点，并链接现有原理动画。专题不会增加或复制算法执行页面。浏览器实验室已提供上述 9 类容器的基础操作；专题中的完整 C++17 教学片段仍可能使用未开放的语法，应从实验室内置示例开始运行。本机模式可编译 STL，容器动画读取仍按实验室当前范围提供。

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
- 当前使用自托管 JSCPP 2.0.9，支持基础语法、普通数组、二维数组、函数/递归和部分头文件。支持 `std::cin`、`std::cout`、`std::endl`；独立语句形式的 `ios::sync_with_stdio(false/true/0/1)`（含 `std::ios` / `std::ios_base`）和 `cin/cout.tie(nullptr/NULL/0)` 在浏览器中作为空操作，输入输出即时采集，保留源代码与回放行号。此兼容仅限上述标准流写法。已提供 `vector`、`string`、`queue`、`stack`、`pair`、`set`、`map`、`unordered_set`、`unordered_map` 的教学子集（构造、基础增删访问、大小/判空、按键计数、复制和引用），配有 9 个可编辑示例及分类动画。vector/string 支持 reserve、capacity、resize、shrink_to_fit；unordered_set/map 支持 reserve、rehash、bucket_count、load_factor、max_load_factor。预留不增加 size；容量与桶数为教学模型，不复刻实际标准库分配策略、内存地址或桶布局。vector/string 教学容量上限 4096，哈希桶数上限 16384；实际元素与嵌套预算仍受原有约束。暂不支持 `auto`、范围 for、迭代器、自定义比较器/哈希函数和用户模板；`reverse`、`sort`、`priority_queue`、`deque` 在示例菜单保留禁用位置。**尚不支持完整 C++ 标准、用户类/模板或多文件**。支持 `bits/stdc++.h` 兼容头，聚合已有的 `iostream`、`cmath`、`cctype`、`cstring`、`iomanip`；保留代码与回放行号，支持重复及混合引用。聚合头的可用功能由 `stl.js` 与已有库共同决定，不支持 `cstdlib`、`cstdio` 及系统调用。64 位整数精度受 JavaScript 数值范围限制。指针和库函数的支持同样有限，复杂竞赛代码应使用本地编译器。
- Python 使用自托管 Skulpt 1.2.0 的 Python 3 兼容模式，支持列表、二维列表、条件、循环、函数、递归、`input()` / `print()` 及少量标准库；不包含第三方包、文件/网络、异步或完整现代 Python 语法。列表和 `range` 按教学规模限制为最多 4096 项。
- Java 使用自托管 Java-Chan 教学解释器，支持单类的 static 方法、基本类型、普通/二维数组、循环、递归、`Scanner` 基本读取、`System.out`、部分 `Math` / `String` 及 `Arrays.sort` / `toString`。不包含完整 JVM、完整类型检查、long、集合、对象/继承、泛型或多文件；int 溢出会中止。**Java 运行器采用 PolyForm Noncommercial 1.0.0，仅用于非商业教学等许可允许的用途**，作者声明与许可随网站分发。
- 每个数组最多 4096 个计算元素；动画展示前 64 项或 16 × 16 矩阵，每个函数最多展示 64 个变量。循环下标按常用变量名辅助显示，不会推断任意算法或自动生成自定义图、树结构。全局初始化在进入 `main` 前完成，同一行的多个语句合为一次行步骤。

页面模板位于 `scripts/code-lab-template.cjs`；其余文件按功能集中在 `dist/extensions/code-lab/`。C++ 示例/执行在 `examples.js` / `engine.js`；三语言元数据、新增示例和适配器在 `languages/`。STL 类型与运行适配位于 `stl.js`；9 个示例源于 `scripts/code-lab-stl-cases.cjs`，生成至 `stl-examples.js`。数组与容器的选取和绘图集中在 `scene.js`，所有语言共用，最多显示 3 个。解释器与三方许可证位于 `vendor/`，只加载本次选择的语言，不依赖外部 CDN。更新解释器请参阅该目录的 `README.md`。

`npm run check` 包含实验室实际执行、代码修改结果、递归、多数组筛选与同步、错误和资源限制测试。启动本地预览后，可运行 `node scripts/verify-code-lab-browser.cjs` 检查页面交互及手机布局，运行 `node scripts/verify-code-lab-arrays-browser.cjs` 检查多个数组的展示、回退、手动保留及作用域切换。

`node scripts/verify-lab-languages-browser.cjs` 检查 Python / Java 的真实 Worker 执行、示例、切换、独立草稿、多数组和手机布局。可选 `node scripts/verify-lab-native.cjs` 使用本地 Python 3 和 JDK 核对新增的 10 个示例，支持下文相同的 `ALGOLAB_PYTHON` / `ALGOLAB_JAVA` / `ALGOLAB_JAVAC` 环境变量。

## 本机 C++ 隔离执行与 GDB 动画

本机模式仅使用一次性 Docker Linux 容器。网页服务把代码和输入通过标准输入交给容器，在容器内执行 g++（C++17）和 GDB/MI，返回快照后复用原有动画。宿主机不调用 g++ 或 GDB；隔离环境不可用时禁用本机执行，保留三语言浏览器模式，不会回退到宿主机执行。

先安装 Node.js 18+ 和 Docker Desktop，启动 Docker Desktop 并选择 Linux 容器。Windows CMD 中运行：

```bat
cd /d "D:\OneDrive\桌面\校队\26年校队纳新及培训\algorithm-visualizer"
npm run lab:sandbox:build
npm run lab:local
```

首次准备镜像需要联网下载基础镜像、容器内编译器和调试器，耗时取决于网络。镜像准备后，每次执行不联网，也不自动拉取镜像。打开 http://127.0.0.1:4173/extensions/code-lab/，选择 **C++ → 本机 C++ · 隔离执行**。保持终端开启，Ctrl+C 关闭服务。若端口已被预览占用，请先停止原预览；`ALGOLAB_PORT` 可指定其他端口。PowerShell 进入目录不使用 /d。

如果构建镜像时无法连接 `auth.docker.io`，而电脑使用本机代理，请在构建终端将 `HTTP_PROXY`、`HTTPS_PROXY` 指向已有代理后重试。代理只用于准备镜像；运行容器会清空代理环境变量，并保持网络关闭。当前用户安装的 Docker Desktop 会被服务自动识别，无需手动修改系统 PATH。

隔离规则：

- 每次运行独立容器；代码和输入通过 stdin 传入，不挂载工作区、磁盘、用户目录、Docker socket 或宿主机设备，不传入宿主机环境变量。仅接受本机 Docker 的 Unix socket / Windows named pipe 连接，拒绝远程 Docker。
- 编译和调试全部位于容器。关闭网络、只读镜像文件系统，以 UID 10001 普通用户运行；临时编译目录仅在 128 MiB 的内存文件系统中可写。容器可读取自身系统库，但看不到电脑文件目录。
- 限制为 512 MiB 内存（含交换总额同为 512 MiB）、1 核 CPU、64 个进程、单文件 16 MiB；禁止提权，保留 Docker 默认 seccomp 保护，移除默认 capabilities，仅添加 GDB 所需的 SYS_PTRACE。不开启 privileged，不共享宿主机 PID、网络或 IPC。
- 编译最多 20 秒、调试最多 60 秒；宿主机另设 85 秒容器调用超时和返回数据上限。容器启动失败、返回异常、停止和超时都清理该次容器；清理失败会锁住后续执行，需在 Docker Desktop 中确认清理后重启服务。
- Host、Origin、会话令牌校验继续生效，不开放 CORS。GitHub Pages 和普通静态预览仅使用浏览器执行，不会自动连接访客电脑的编译器。

动画支持原生一维/二维数组、libstdc++ 一维数值 vector、简单局部/全局变量及递归调用栈。1～3 个数组全部展示，超过 3 个沿用筛选和手动保留。其他容器、对象、指针和别名不保证自动可视化；未初始化变量可能显示原始内存值。GDB 仅记录用户源文件的可执行行，黄色表示即将执行；同一行多个语句请拆行。数组显示前 64 项，矩阵最多 16 × 16；每帧最多 64 个变量，调用栈最多 32 层，最多 2000 步或 12 MB 快照，输出最多 16000 字节。标准输入是事先提供的文本，标准输出启用即时刷新。

容器隔离仍依赖 Docker、Linux 内核和系统更新，不能保证抵御所有容器逃逸漏洞。多线程、子进程程序不在当前逐行动画支持范围内。回退与重播只回放快照；程序在容器中的临时文件随本次运行清理。隔离配置参考 [Docker 运行限制](https://docs.docker.com/engine/containers/run/) 和 [关闭网络](https://docs.docker.com/engine/network/drivers/none/)。

服务集中在 `scripts/local-lab/`：`server.cjs` 为网页接口，`sandbox.cjs` 为宿主机容器边界，`sandbox/Dockerfile` 和 `sandbox/worker.cjs` 为隔离环境；`trace.cjs` / `mi.cjs` 仅负责容器内编译调试。升级这些文件后请重新运行 `npm run lab:sandbox:build`。

- `npm run check:sandbox`：无需 Docker，验证宿主机禁用直接执行、容器约束、拒绝远程 Docker、取消清理和清理失败锁定；包含模拟 Docker 调用，不能代替真实隔离测试。
- `npm run check:sandbox:access`：需要真实 Docker 镜像，检查宿主机文件哨兵无法读取/修改、网络被关闭、镜像只读、Docker socket 未暴露以及普通用户运行。
- `npm run check:local`：在真实隔离容器中验证 C++17、STL、数组、递归、输入输出、异常与资源限制。
- `node scripts/verify-local-lab-browser.cjs`：在真实隔离环境中验证网页动画、停止、筛选和原有三语言模式。

## 更新页面

基础页面按 8 个数据结构方向、11 个算法方向分组，竞赛另有 12 个方向，共 120 个演示、154 个 HTML 页面。每组的 HTML 与该组演示逻辑放在同一个文件夹，共享播放器和样式统一维护。`groups` / `items` 保持基础目录兼容，`allGroups` / `allItems` 同时包含竞赛拓展。

每组的 `code-variants.js` 保存 Python、Java 代码及其步骤标签；原有 `<方向>.js` 保存 C++ 代码和动画逻辑。三种语言按语义标签对应代码行，切换时复用同一组状态快照。

修改 `dist/assets/js/catalog.js` 或 `scripts/generate-pages.cjs` 后，运行 `npm run generate` 更新静态 HTML。直接修改某个生成的 HTML 也会立即生效，但下次生成时会被模板覆盖。

运行 `npm run check` 检查算法结果、代码行映射及页面链接。可选运行 `node scripts/verify-cpp.cjs` 检查首版 65 项 C++ 教学代码（需要 g++）。浏览器测试脚本使用开发时放在 `artifacts/` 的临时 Playwright 测试工具，不是网站运行依赖。

运行 `node scripts/verify-code-versions.cjs` 可实际执行首版 65 项的 Python、Java 片段（需要 Python 3、JDK 9+ 编译器；Java 代码按 Java 8 兼容模式验证）。如果 Windows 的 Python 启动器限制子进程，可通过 `ALGOLAB_PYTHON` 指向实际解释器；`ALGOLAB_JAVA`、`ALGOLAB_JAVAC` 可指定验证使用的运行器和编译器。

如果希望通过本地网址打开，在项目文件夹运行 `npm run preview` 后访问 `http://127.0.0.1:4173`，运行期间保持终端开启。Windows CMD 跨盘进入项目时用 `cd /d "项目绝对路径"`；PowerShell 使用 `cd "项目绝对路径"`。网页本身不依赖 Node.js。

扩展约定详见 `dist/extensions/README.md`。
