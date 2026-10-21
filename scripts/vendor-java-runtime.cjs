const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'artifacts/java-research/java-chan');
const dest=path.join(root,'dist/extensions/code-lab/vendor/java');fs.mkdirSync(dest,{recursive:true});
const esbuild=require(path.join(root,'artifacts/jscpp-build/node_modules/esbuild'));
esbuild.buildSync({stdin:{contents:"export {Lexer,TokenType} from './Lexer.js';export {Parser} from './Parser.js';export {Evaluator,ReturnSignal} from './Evaluator.js';export {Environment} from './Environment.js';export * from './StandardLibrary.js';",resolveDir:source,sourcefile:'java-lab-runtime.js'},bundle:true,minify:true,format:'iife',globalName:'JavaRuntime',platform:'browser',outfile:path.join(dest,'java-runtime.js'),banner:{js:'/*! Java-Chan cc846c19f7133626df8843b965353cbccaa00ade. Required Notice: Copyright 2026 Omega Mu Gamma Studio (https://github.com/Omega-Mu-Gamma-Studio). PolyForm Noncommercial 1.0.0: https://polyformproject.org/licenses/noncommercial/1.0.0/ — see LICENSE.txt. */'}});
fs.copyFileSync(path.join(source,'LICENSE'),path.join(dest,'LICENSE.txt'));
console.log('Vendored Java-Chan for noncommercial educational use.');
