const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=path.join(root,'artifacts/python-research/package');
const dest=path.join(root,'dist/extensions/code-lab/vendor/python');fs.mkdirSync(dest,{recursive:true});
for(const [from,to]of [['dist/skulpt.min.js','skulpt.min.js'],['dist/skulpt-stdlib.js','stdlib.js'],['LICENSE','LICENSE.txt']])fs.copyFileSync(path.join(source,from),path.join(dest,to));
console.log('Vendored Skulpt 1.2.0 and its standard library for Python 3 teaching mode.');
