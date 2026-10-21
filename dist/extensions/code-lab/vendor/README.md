# 浏览器内语言执行引擎

`cpp-runtime.js` 从 [JSCPP 2.0.9](https://github.com/felixhao28/JSCPP) 打包而来，依赖 lodash 4.18.1、pegjs-util 1.4.21。MIT 许可证原文保存在 `LICENSES.txt`。所有运行资源随网站自托管，用户代码不发送给外部服务。

这是 C++ 教学子集解释器，不是完整的标准 C++ 编译器。支持范围见实验室页面。

## 重建

仅开发者更新供应商包时需要 Node.js 和临时构建工具，正常使用网站不需要安装任何依赖。在项目根目录执行：

```text
npm install --prefix artifacts/jscpp-build --ignore-scripts --no-audit --no-fund --save-exact JSCPP@2.0.9 esbuild@0.25.12 lodash@4.18.1 pegjs-util@1.4.21
node scripts/build-cpp-runtime.cjs
npm run check
```

构建脚本移除 `cstdlib`（上游含 JavaScript `eval` 形式的 `system`）、`cstdio`、`ctime` 和示例类，仅保留已列出的头文件，并添加数组大小、执行操作、运行时间、分配和嵌套限制。不得直接用上游的浏览器包覆盖此文件，避免恢复上游 `system` 功能。

运行过程进一步受到独立 Worker、页面 6 秒强制终止、记录步骤和输出大小限制。语法解析出错、越界或不支持的语法会显示错误；已有记录可继续回放。引擎不提供宿主文件、操作系统或网络 API。

初始打包 SHA-256：`29be4e404fc5c961bd3f5d144bd508599697c6d00dc21bf658f307f79463caba`。

## Python

`python/skulpt.min.js` 和 `python/stdlib.js` 来自 [Skulpt 1.2.0](https://github.com/skulpt/skulpt/tree/1.2.0) 的 npm 发布包，按 Python 3 兼容模式运行。MIT / PSF 许可原文保存在 `python/LICENSE.txt`。适配器 `../languages/python.js` 使用解释器调试暂停点记录真实作用域和调用栈，仅开放列出的本地标准库资源。不是完整的现代 CPython。

重建时，在 `artifacts/python-research/` 下载并解压 `npm pack skulpt@1.2.0` 的包至 `package/`，运行 `node scripts/vendor-python-runtime.cjs`。测试不需重建，运行 `npm run check` 即可。

## Java

`java/java-runtime.js` 从 [Java-Chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan/tree/cc846c19f7133626df8843b965353cbccaa00ade) 固定提交 `cc846c19f7133626df8843b965353cbccaa00ade` 的词法分析器、语法分析器和树遍历解释器打包而来。适配器 `../languages/java.js` 添加真实行号/作用域跟踪、受控标准输入、数组限制和快照；不包含上游聊天界面、JavaObject、网络能力或完整 JVM。

**Java-Chan 使用 [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)，适用于非商业教学等该许可允许的用途。** 原文保存在 `java/LICENSE.txt`，分发时必须一并保留许可和作者声明；若未来用于商业产品，需要替换执行引擎或取得相应授权。网站帮助与运行包头部均附有以下原始声明：

Required Notice: Copyright 2026 Omega Mu Gamma Studio (https://github.com/Omega-Mu-Gamma-Studio)

重建时将固定提交的 `Lexer.js`、`Parser.js`、`Evaluator.js`、`Environment.js`、`StandardLibrary.js`、`InterpreterError.js` 和 `LICENSE` 放入 `artifacts/java-research/java-chan/`；使用上文的 esbuild 工具运行 `node scripts/vendor-java-runtime.cjs`，再运行 `npm run check`。三种运行器分别加载，C++ 为默认语言。
