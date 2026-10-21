(function(L){
  'use strict';
  function input(options){const text=options.text??Array.from({length:13},()=>'ABCD'[L.rand(0,3)]).join('');return {text,pattern:options.pattern??text.slice(5,9)};}
  const view=(text,pattern,offset=0,activeText=[],activePattern=[],pi)=>({kind:'strings',text,pattern,offset,activeText,activePattern,pi});
  L.register('naive-match',(options={})=>{
    const {text,pattern}=input(options);const t=new L.Trace(`int findPattern(string text, string pattern) {
outer|    for (int i = 0; i + (int)pattern.size() <= (int)text.size(); ++i) {
init|        int j = 0;
loop|        while (j < (int)pattern.size() && text[i + j] == pattern[j]) {
advance|            ++j;
        }
found|        if (j == (int)pattern.size()) return i;
    }
missing|    return -1;
}`,{text,pattern},view(text,pattern));
    for(let i=0;;i++){t.step('outer','尝试下一个可能的匹配起点。',{i},view(text,pattern,i));if(i+pattern.length>text.length)break;let j=0;t.step('init','每次从模式串开头重新比较。',{i,j});while(true){t.step('loop','比较当前文本字符与模式字符。',{i,j},view(text,pattern,i,[i+j],[j]));if(!(j<pattern.length&&text[i+j]===pattern[j]))break;j++;t.step('advance','字符相同，继续比较下一个字符。',{i,j});}t.step('found','检查模式串是否全部匹配。',{i,j});if(j===pattern.length)return t.done(i,'找到完整匹配。');}t.step('missing','所有起点均失败，返回 -1。');return t.done(-1);
  });
  L.register('kmp',(options={})=>{
    const {text,pattern}=input(options),pi=Array(pattern.length).fill(0);
    const t=new L.Trace(`int kmp(string text, string pattern) {
empty|    if (pattern.empty()) return 0;
init|    vector<int> pi(pattern.size(), 0);
prefix|    for (int i = 1, j = 0; i < (int)pattern.size(); ++i) {
fallback|        while (j > 0 && pattern[i] != pattern[j]) j = pi[j - 1];
equal|        if (pattern[i] == pattern[j]) ++j;
save|        pi[i] = j;
    }
search|    for (int i = 0, j = 0; i < (int)text.size(); ++i) {
back|        while (j > 0 && text[i] != pattern[j]) j = pi[j - 1];
match|        if (text[i] == pattern[j]) ++j;
found|        if (j == (int)pattern.size()) return i - j + 1;
    }
missing|    return -1;
}`,{text,pattern},view(text,pattern));
    const s=(l,m,v={},offset=0,at=[],ap=[])=>t.step(l,m,{...v,pi},view(text,pattern,offset,at,ap,pi));s('empty','空模式串在位置 0 匹配。');if(!pattern.length)return t.done(0);s('init','前缀函数 pi 初始为零。');let j=0;
    for(let i=1;;i++){s('prefix','计算模式串当前前缀的最长相等真前后缀。',{i,j},0,[],[i,j]);if(i>=pattern.length)break;while(true){const mismatch=j>0&&pattern[i]!==pattern[j];if(mismatch)j=pi[j-1];s('fallback',mismatch?'失配，沿 pi 回退前缀长度。':'无需继续回退。',{i,j},0,[],[i,j]);if(!mismatch)break;}if(pattern[i]===pattern[j])j++;s('equal','相等时扩展前缀长度。',{i,j});pi[i]=j;s('save','记录当前前缀的 pi 值。',{i,j});}
    j=0;for(let i=0;;i++){s('search','扫描文本，j 是已经匹配的字符数。',{i,j},Math.max(0,i-j),[i],[j]);if(i>=text.length)break;while(true){const mismatch=j>0&&text[i]!==pattern[j];if(mismatch)j=pi[j-1];s('back',mismatch?'失配，文本指针不动，只回退模式指针。':'回退检查结束。',{i,j},i-j,[i],[j]);if(!mismatch)break;}if(text[i]===pattern[j])j++;s('match','字符相等则增加已匹配长度。',{i,j},i-j+1,[i],[j-1]);s('found','检查是否已经匹配整个模式串。',{i,j},i-j+1);if(j===pattern.length)return t.done(i-j+1,'找到完整匹配。');}s('missing','扫描结束，没有找到匹配。');return t.done(-1);
  });
  L.register('rolling-hash',(options={})=>{
    const {text,pattern}=input(options),base=31,mod=101;let target=0,hash=0,power=1;
    const t=new L.Trace(`int rollingHash(string text, string pattern) {
size|    int n = text.size(), m = pattern.size();
empty|    if (m == 0) return 0;
long|    if (m > n) return -1;
init|    long long target = 0, hash = 0, power = 1;
build|    for (int j = 0; j < m; ++j) {
pattern|        target = (target * 31 + pattern[j]) % 101;
text|        hash = (hash * 31 + text[j]) % 101;
power|        if (j + 1 < m) power = power * 31 % 101;
    }
loop|    for (int i = 0; i + m <= n; ++i) {
test|        if (hash == target && text.compare(i, m, pattern) == 0) return i;
slide|        if (i + m < n) {
remove|            hash = (hash - text[i] * power % 101 + 101) % 101;
add|            hash = (hash * 31 + text[i + m]) % 101;
        }
    }
missing|    return -1;
}`,{text,pattern,base,mod},view(text,pattern));const s=(l,m,v={},offset=0)=>t.step(l,m,{target,hash,power,base,mod,...v},view(text,pattern,offset));s('size','确定文本和模式串的长度。',{n:text.length,m:pattern.length});s('empty','检查空模式串。');if(!pattern.length)return t.done(0);s('long','模式串不能长于文本。');if(pattern.length>text.length)return t.done(-1);s('init','初始化滚动哈希，字符使用 ASCII 数值。');for(let j=0;;j++){s('build','计算模式串和第一个窗口的哈希。',{j});if(j>=pattern.length)break;target=(target*base+pattern.charCodeAt(j))%mod;s('pattern','将一个模式字符加入哈希。',{j});hash=(hash*base+text.charCodeAt(j))%mod;s('text','将一个文本字符加入窗口哈希。',{j});if(j+1<pattern.length)power=power*base%mod;s('power','计算移除窗口首字符所需的最高位权。',{j});}for(let i=0;;i++){s('loop','检查当前窗口。',{i},i);if(i+pattern.length>text.length)break;s('test','哈希相等后再逐字符核验，避免碰撞造成误判。',{i,哈希相等:hash===target},i);if(hash===target&&text.slice(i,i+pattern.length)===pattern)return t.done(i,'哈希与字符核验均通过，找到匹配。');s('slide','检查是否还能向右移动窗口。',{i},i);if(i+pattern.length<text.length){hash=(hash-text.charCodeAt(i)*power%mod+mod)%mod;s('remove','移除窗口最左侧字符的贡献。',{i},i);hash=(hash*base+text.charCodeAt(i+pattern.length))%mod;s('add','加入右侧新字符。',{i},i+1);}}s('missing','所有窗口都不匹配。');return t.done(-1);
  });
})(AlgoLab);

(function(L){
  'use strict';
  const randomText=()=>Array.from({length:L.rand(5,9)},()=>'abcde'[L.rand(0,4)]).join('');
  L.register('string-count',(options={})=>{
    const text=options.text??randomText(),counts=Array(26).fill(0);
    if(!/^[a-z]*$/.test(text))throw new Error('此演示统计小写 ASCII 字母 a 到 z。');
    const alphabet=Array.from({length:26},(_,i)=>String.fromCharCode(97+i));
    const view=(active=[])=>L.matrix([counts.slice(0,13),counts.slice(13)].map((row,r)=>row.map((count,c)=>`${alphabet[r*13+c]}: ${count}`)),active.map(i=>[Math.floor(i/13),i%13]),{rowLabels:['a–m','n–z'],colLabels:Array(13).fill(''),
      caption:'下标 0…25 对应 a…z；每读到一个字符，对应计数加一。',
      aux:[{label:'输入字符串',values:[...text]}]});
    const t=L.lessonTrace('string-count',{text},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{text,...vars},view(active));
    s('init','为 26 个小写字母建立零计数。');
    for(let i=0;;i++){
      s('loop','按顺序读取字符串中的字符。',{i});if(i>=text.length)break;
      const index=text.charCodeAt(i)-97;s('index','当前字符减去 a 的字符编码，得到计数数组下标。',{i,字符:text[i],index},[index]);
      counts[index]++;s('add','对应字母的出现次数加一。',{i,index,次数:counts[index]},[index]);
    }
    s('return','返回按 a…z 排列的 26 个计数；空串得到全零数组。');
    return t.done(counts);
  });
  L.register('string-compare',(options={})=>{
    const a=options.a??randomText(),b=options.b??randomText();
    if(!/^[\x00-\x7f]*$/.test(a)||!/^[\x00-\x7f]*$/.test(b))throw new Error('此演示按 ASCII 字符编码比较字符串。');
    let i=0;const length=Math.max(a.length,b.length);
    const view=(active=[])=>L.matrix([Array.from({length},(_,j)=>a[j]??'∅'),Array.from({length},(_,j)=>b[j]??'∅')],active,
      {rowLabels:['a','b'],caption:'从左向右比较 ASCII 编码；首个不同字符决定顺序。公共前缀相同时，较短字符串在前。∅ 表示该位置没有字符。'});
    const t=L.lessonTrace('string-compare',{a,b},view());
    const s=(label,message,vars={},active=[])=>t.step(label,message,{a,b,i,...vars},view(active));
    s('init','从两个字符串的下标 0 开始。');
    while(true){
      s('loop','两串都还有字符时，逐个比较。',{},i<a.length&&i<b.length?[[0,i],[1,i]]:[]);
      if(i>=a.length||i>=b.length)break;
      const active=[[0,i],[1,i]],vars={当前a:a[i],当前b:b[i],编码a:a.charCodeAt(i),编码b:b.charCodeAt(i)};
      s('less','若 a 的当前字符较小，整个 a 就排在 b 前面。',vars,active);
      if(a[i]<b[i]){s('smaller','返回 -1，表示 a 小于 b。',vars,active);return t.done(-1);}
      s('greater','若 a 的当前字符较大，整个 a 就排在 b 后面。',vars,active);
      if(a[i]>b[i]){s('larger','返回 1，表示 a 大于 b。',vars,active);return t.done(1);}
      i++;s('advance','当前字符相等，继续比较下一对。');
    }
    s('shorter','公共前缀相同，检查 a 是否更短。');
    if(a.length<b.length){s('shortResult','较短的 a 在前，返回 -1。');return t.done(-1);}
    s('longer','检查 b 是否更短。');
    if(a.length>b.length){s('longResult','较长的 a 在后，返回 1。');return t.done(1);}
    s('equal','字符与长度都一致，返回 0。');return t.done(0);
  });
})(AlgoLab);
