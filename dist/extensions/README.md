# 后续扩展约定

竞赛拓展已开放 12 个方向的 36 个常用专题；更复杂的内容继续预留。代码实验室支持 C++、Python 和 Java，以 C++ 为主，按独立目录维护。

## 新增一个算法

1. 在 `assets/js/catalog.js` 中加入对应方向与条目。
2. 在该方向的 `<方向>.js` 中通过 `AlgoLab.register(id, builder)` 注册演示。
3. builder 返回 `AlgoLab.Trace`：包含教学代码、输入、逐行状态快照及最终结果。
4. 每个快照保存语义标签、C++ 行号、步骤说明、变量以及数组/矩阵/图/棋盘等可视状态。代码中用 `标签|代码` 绑定行号，页面只显示标签右侧的代码。
5. 在同组 `code-variants.js` 中调用 `AlgoLab.addCode(id, python, java)` 注册 Python、Java 片段，覆盖 C++ 演示的全部步骤标签；不使用 C++ 行号兜底。
6. 运行项目根目录的 `npm run generate` 生成分类与独立 HTML 页面，再运行 `npm run check`。

## Python、Java

全部 120 个演示已支持 Python、Java。播放器切换语言时暂停并保留当前数据、步骤与画面，按照语义标签选择该语言的代码行；语法高亮区分 Python 的整数除法和注释。语言偏好保存在浏览器本地。

变量观察按语言调整命名；Python `for` 的终止检查不显示 C++ 专属的越界循环下标。后续增加语言时应继续独立维护代码与标签映射。

## 竞赛拓展

`competition/index.html` 是方向目录，`competition/catalog.js` 负责目录搜索。基础和竞赛的元数据统一在 `assets/js/catalog.js`：`competitionGroups` / `competitionItems` 单独提供竞赛目录，`allGroups` / `allItems` 用于全站生成和搜索，原 `groups` / `items` 继续表示基础内容。

每组独立存放在 `competition/<方向>/`，包含 `<方向>.js`、`code-variants.js`、分类 `index.html` 和算法 HTML。使用 `competition/support.js` 的 `code(id,cpp,python,java)` 注册三语言片段，`trace(id,input,view)` 创建相同接口的轨迹。页面深度为三层，资源路径和面包屑由生成器统一处理。竞赛入口模板是 `scripts/competition-template.cjs`，后续专题保持为说明文本，不创建无功能的演示链接。

新增算法后，添加 `verify-competition.cjs` 中的独立参考结果与边界校验，并更新 `verify-competition-native.cjs` 的实际代码执行用例。浏览器测试会检查全部竞赛页面的三语言逐帧高亮、画面、回放、随机数据、离线打开和手机布局。

## 代码实验室

入口位于 `code-lab/index.html`，始终默认 C++。该目录单独保存共享的 `lab.css`、`lab.js`、`scene.js`、`worker.js`；原 C++ 示例和适配器仍在 `examples.js` / `engine.js`。新增语言的元数据和示例位于 `languages/examples.js`，Python / Java 适配器分别位于 `languages/python.js`、`languages/java.js`。`vendor/python/`、`vendor/java/` 分开保存执行引擎和许可证，便于各自更新。HTML 模板位于 `scripts/code-lab-template.cjs`。

代码与输入可编辑，运行时在独立 Web Worker 内按所选语言加载 JSCPP / Skulpt / Java-Chan，真实解释执行，生成逐行变量/数组/调用栈/输出快照，复用共享数组与矩阵渲染器。C++ 保留当前行语义；Python / Java 在语句执行前捕获状态，黄色行表示即将执行。切换语言或编辑会清除旧回放；每种语言分别保存代码和输入，原 C++ 草稿键保持兼容。

`scene.js` 统一选择当前作用域的数组，1～3 个时全部展示，多于 3 个时按手动保留、本步变化、本行实际使用、执行中使用频率排序，最多显示 3 个。每个可见数组有独立渲染器。`engine.js` 的 `accessed` 保存本行实际读到的数组标识符，不把注释或未执行分支计为使用。局部变量在离开作用域之前记录最后的值，以便最后一行与回退仍能正确展示。

Java 的 `accessed` 同样由实际数组读取生成。Python 根据当前执行行的语法名称辅助判断使用情况，同一行内的条件表达式可能同时计入候选数组；数值变化仍来自真实执行快照，需要时可手动保留目标数组。

三种语言均为教学子集，运行范围与资源上限详见页面说明和项目 README。C++ 尚不支持 STL；Python 不包含第三方包或完整现代语法；Java 不包含完整 JVM、集合或完整类型检查。Java-Chan 使用 PolyForm Noncommercial 1.0.0，须保留作者声明，限非商业教学等许可允许的用途。现有固定教学演示继续使用人工编写的 JavaScript 轨迹，不受实验室影响。后续拓展语言时应独立接入实际执行与快照生成，不应把用户输入映射到固定演示结果。

## 首版边界

普通线段树演示建树、单点赋值和区间求和，区间懒标记作为后续拓展。背包首版为 0/1 背包，其他背包变体留在竞赛拓展。算法随机数据按教学目的控制规模与前置条件。

基础分类可以通过 `group.entries` 引用已有竞赛条目，保持原始 `path`；`group.items` 仍作为唯一文件归属。新增基础演示使用公共 `AlgoLab.addLesson` / `AlgoLab.lessonTrace`，与竞赛共享三语言注册和轨迹接口。
