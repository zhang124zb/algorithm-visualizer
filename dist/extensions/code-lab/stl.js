(function(root){
  'use strict';
  const MAX=4096,BUCKET_MAX=16384,PREVIEW=64,HEADERS=['vector','string','queue','stack','utility','set','map','unordered_set','unordered_map'];
  const KINDS=new Set(['vector','string','queue','stack','pair','set','map','unordered_set','unordered_map']);
  const isMap=kind=>kind==='map'||kind==='unordered_map',isHash=kind=>kind==='unordered_set'||kind==='unordered_map';
  const RESERVED=new Set(['reverse','sort','priority_queue','deque']);
  const PRIMITIVES=new Set(['int','double','char','bool','float','long','short','unsigned','signed']);
  const TOKEN=/^[\t ]*#(?:\\\n|[^\n])*|\/\/(?:\\\n|[^\n])*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))|R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|"(?:\\[\s\S]|[^"\\])*(?:"|$)|'(?:\\[\s\S]|[^'\\])*(?:'|$)|[A-Za-z_]\w*|::|->|[^\s]/gm;
  function lex(code){return [...code.matchAll(TOKEN)].map(t=>({text:t[0],start:t.index,end:t.index+t[0].length}));}
  function fail(source,token,message){const line=source.slice(0,token?.start||0).split('\n').length;throw Error('line '+line+': '+message);}
  function prepare(source){
    const all=lex(source),tokens=all.filter(t=>!/^\s*#|^\/[/\*]/.test(t.text)),changes=[],specs=[],byKey=new Map(),occurrences=[],reservedCalls=[];
    const text=i=>tokens[i]?.text;
    const spec=(kind,args=[])=>{const key=kind+(args.length?'<'+args.map(a=>typeof a==='string'?a:a.key).join(',')+'>':'');if(byKey.has(key))return byKey.get(key);const s={kind,args,key,alias:'_S'+specs.length};specs.push(s);byKey.set(key,s);return s;};
    function typeAt(index,depth=0){
      if(depth>3)fail(source,tokens[index],'浏览器 STL 暂只支持最多三层容器，请简化类型或改用本机 C++。');
      let i=index;if(text(i)==='std'&&text(i+1)==='::')i+=2;
      const kind=text(i);
      if(kind==='string')return {spec:spec('string'),end:i+1};
      if(PRIMITIVES.has(kind)){let words=[];while(PRIMITIVES.has(text(i)))words.push(text(i++));return {spec:words.join(' '),end:i};}
      if(!KINDS.has(kind)||text(i+1)!=='<')return null;
      i+=2;const args=[];
      while(true){const a=typeAt(i,depth+1);if(!a)fail(source,tokens[i],'此 STL 类型参数尚未支持；请使用 int、double、char、bool、string 或已开放容器。');args.push(a.spec);i=a.end;if(text(i)===','){i++;continue;}if(text(i)!=='>')fail(source,tokens[i],'此 STL 模板语法尚未支持，请使用普通类型参数。');i++;break;}
      if(args.length!==(['map','unordered_map','pair'].includes(kind)?2:1))fail(source,tokens[index],kind+' 的类型参数数量不正确；自定义比较器、哈希器、分配器尚未开放。');
      const comparable=t=>typeof t==='string'||t.kind==='string'||(t.kind==='pair'&&t.args.every(comparable));
      if(['set','map'].includes(kind)&&!comparable(args[0]))fail(source,tokens[index],'浏览器 set/map 的键暂只支持基础类型、string 或这些类型组成的 pair；其他键类型尚未开放。');
      if(isHash(kind)&&typeof args[0]!=='string'&&args[0].kind!=='string')fail(source,tokens[index],'浏览器 unordered_set/unordered_map 的键暂只支持基础类型或 string；pair、自定义哈希器及其他键类型尚未开放。');
      return {spec:spec(kind,args),end:i};
    }
    for(let i=0;i<tokens.length;i++){
      const t=tokens[i],name=text(i),qualified=name==='std'&&text(i+1)==='::';
      const k=qualified?text(i+2):name;
      const afterName=text(i+(qualified?3:1));
      if(RESERVED.has(k)&&!['.','->'].includes(text(i-1))&&(afterName==='<'||(!['priority_queue','deque'].includes(k)&&afterName==='(')))reservedCalls.push({token:t,index:i,name:k,qualified});
      if(['.','->','::'].includes(text(i-1)))continue;
      if(k==='make_pair'&&qualified){changes.push({start:t.start,end:tokens[i+1].end,value:''});i++;continue;}
      if(k==='getline'&&qualified){changes.push({start:t.start,end:tokens[i+1].end,value:''});i++;continue;}
      if(!KINDS.has(k))continue;
      if(k==='string'&&!qualified&&!/^[A-Za-z_]\w*$/.test(text(i+1)||'')&&!['&','*','('].includes(text(i+1)))continue;
      const found=typeAt(i);if(!found||typeof found.spec==='string')continue;
      const end=tokens[found.end-1].end;
      changes.push({start:t.start,end,value:found.spec.alias});occurrences.push({index:i,end:found.end,spec:found.spec,change:changes.at(-1)});i=found.end-1;
    }
    const userFunctions=new Set();
    for(let i=0;i<tokens.length;i++)if(['sort','reverse'].includes(text(i))&&text(i+1)==='('&&!['::','.','->'].includes(text(i-1))){let depth=0;for(let j=i+1;j<tokens.length;j++){if(text(j)==='(')depth++;if(text(j)===')'&&!--depth){if(text(j+1)==='{'||((PRIMITIVES.has(text(i-1))||text(i-1)==='void')&&text(j+1)===';'))userFunctions.add(text(i));break;}}}
    const stlContext=specs.length||all.some(t=>/^\s*#\s*include\s*[<"](?:bits\/stdc\+\+\.h|__algolab_all|algorithm|vector|string|queue|stack|utility|set|map|unordered_set|unordered_map)[>"]/.test(t.text));
    for(const call of reservedCalls)if(['priority_queue','deque'].includes(call.name)||call.qualified||(stlContext&&!userFunctions.has(call.name)))fail(source,call.token,call.name+' 尚未开放，已预留后续开发位置；请暂用本机 C++。');
    if(specs.length){
      for(let i=0;i<tokens.length;i++){
        if(text(i)==='auto')fail(source,tokens[i],'浏览器 STL 暂不支持 auto，请写出明确类型；遍历请使用普通 for 或 while。');
        if(['begin','end','cbegin','cend','rbegin','rend','find','lower_bound','upper_bound','emplace','emplace_back'].includes(text(i))&&['.','->','::'].includes(text(i-1)))fail(source,tokens[i],'浏览器 STL 暂不支持 '+text(i)+'；迭代器及其算法将在后续开放。');
        if(text(i)==='for'&&text(i+1)==='('){let depth=0;for(let j=i+1;j<tokens.length;j++){if(text(j)==='(')depth++;if(text(j)===')'&&!--depth)break;if(depth===1&&text(j)===':')fail(source,tokens[j],'浏览器 STL 暂不支持范围 for，请改用下标 for 或 while。');}}
      }
    }
    const refs={};
    function closeAt(index,open,close){let depth=0;for(let j=index;j<tokens.length;j++){if(text(j)===open)depth++;if(text(j)===close&&!--depth)return j;}fail(source,tokens[index],'括号没有闭合。');}
    for(const o of occurrences){
      let i=o.end;
      if(text(i)==='&'){const alias='_R'+o.spec.alias.slice(2);refs[alias]=o.spec.alias;o.change.value=alias;changes.push({start:tokens[i].start,end:tokens[i].end,value:''});i++;}
      if(text(i)==='('){o.change.value='_c'+o.spec.alias.slice(2);continue;}
      if(!/^[A-Za-z_]\w*$/.test(text(i)||''))continue;
      const next=i+1;
      if(text(next)==='('){
        const close=closeAt(next,'(',')');
        // A typed parameter list declares a function; expression arguments construct a value.
        const argType=typeAt(next+1),afterType=argType&&text(argType.end);
        if(close===next+1||['{','const'].includes(text(close+1))||(argType&&(/^[A-Za-z_]\w*$/.test(afterType||'')||['&','*'].includes(afterType))))continue;
        changes.push({start:tokens[next].start,end:tokens[next].end,value:' = _c'+o.spec.alias.slice(2)+'('});
      }else if(text(next)==='{'||(text(next)==='='&&text(next+1)==='{')){
        const open=text(next)==='{'?next:next+1,close=closeAt(open,'{','}');
        for(let j=open+1;j<close;j++)if(text(j)==='{')fail(source,tokens[j],'嵌套花括号初始化尚未支持，请先构造元素再 push_back 或赋值。');
        changes.push({start:tokens[open].start,end:tokens[open].end,value:(open===next?' = ':'')+'_l'+o.spec.alias.slice(2)+'('});changes.push({start:tokens[close].start,end:tokens[close].end,value:')'});
      }
    }
    // A map's insert(make_pair(...)) also needs the corresponding pair value type.
    for(const s of specs.slice())if(isMap(s.kind))spec('pair',s.args);
    for(const t of all){const inc=/^([\t ]*#[\t ]*include[\t ]*)"(vector|string|queue|stack|utility|set|map|unordered_set|unordered_map)"/.exec(t.text);if(inc)changes.push({start:t.start+inc[1].length,end:t.start+inc[0].length,value:'<'+inc[2]+'>'});}
    changes.sort((a,b)=>b.start-a.start);let code=source;
    for(const c of changes){const before=source.slice(c.start,c.end),nl=(before.match(/\n/g)||[]).length;code=code.slice(0,c.start)+c.value+'\n'.repeat(nl)+code.slice(c.end);}
    return {code,specs,refs};
  }
  function snapshot(variable){
    const st=variable?.v?.stl;if(variable?.left===false||!st||!KINDS.has(st.kind))return null;
    function plain(v,depth=0){if(depth>3)return '…';if(v?.v?.stl){const d=snapshot(v);return d?.value;}if(v?.t?.name==='char')return String.fromCharCode(v.v);if(v?.t?.name==='bool')return !!v.v;return Number.isFinite(v?.v)?v.v:typeof v?.v==='number'?'未初始化':null;}
    const values=st.kind==='pair'?[variable.v.members.first,variable.v.members.second]:st.items;
    const metadata=['vector','string'].includes(st.kind)?{capacity:st.capacity}:isHash(st.kind)?{bucketCount:st.bucketCount,loadFactor:st.items.length/st.bucketCount,maxLoadFactor:st.maxLoadFactor}:{};
    if(st.kind==='string')return {kind:st.kind,type:st.type,value:st.items.slice(0,PREVIEW).map(v=>String.fromCharCode(v.v)).join(''),length:st.items.length,truncated:st.items.length>PREVIEW,...metadata};
    return {kind:st.kind,type:st.type,value:values.slice(0,PREVIEW).map(v=>isMap(st.kind)?{key:plain(v.key),value:plain(v.value)}:plain(v)),length:values.length,truncated:values.length>PREVIEW,...metadata};
  }
  function install(runtime,prepared){
    const oldHeaders=new Map(),previousAll=runtime.includes.__algolab_all,previousIO=runtime.includes.iostream;
    const loaded=new WeakSet();
    function load(rt){
      if(loaded.has(rt))return;loaded.add(rt);
      const types=new Map(),specByAlias=new Map(prepared.specs.map(s=>[s.alias,s]));
      for(const s of prepared.specs)types.set(s.alias,rt.newClass(s.alias,[]));
      const primitive=t=>typeof t==='string'?rt.primitiveType(t):types.get(t.alias),voidValue=()=>rt.val(rt.voidTypeLiteral,undefined),num=n=>rt.val(rt.intTypeLiteral,n),bool=b=>rt.val(rt.boolTypeLiteral,b?1:0);
      const die=message=>rt.raiseException(message),limit=n=>{if(!Number.isInteger(n)||n<0||n>MAX)die('浏览器 STL 容器最多 '+MAX+' 个元素，长度必须为非负整数。');return n;};
      const checkArgs=(args,min,max=min)=>{if(args.length<min||args.length>max)die('此 STL 操作的参数数量不正确。');};
      function sizeArg(v,label='容量',maximum=MAX){const n=v?.v;if(!v?.t||!rt.isNumericType(v.t)||!Number.isSafeInteger(n)||n<0||n>maximum)die(label+' 必须是 0 到 '+maximum+' 的整数。');return n;}
      function bucketLimit(n){if(!Number.isSafeInteger(n)||n<1||n>BUCKET_MAX)die('教学哈希桶数超过限制：最多 '+BUCKET_MAX+' 个桶，请减少预留量或提高 max_load_factor。');return n;}
      // Teaching metadata only: spare slots and hash buckets are not allocated or compiler-specific.
      function grow(v,n){limit(n);const st=v.v.stl;if(n>st.capacity)st.capacity=Math.min(MAX,Math.max(n,st.capacity*2,1));}
      function hashBuckets(v,n){const st=v.v.stl;return bucketLimit(Math.max(1,Math.ceil(n/st.maxLoadFactor)));}
      function hashGrow(v,n){const st=v.v.stl;if(n/st.bucketCount>st.maxLoadFactor)st.bucketCount=Math.max(hashBuckets(v,n),Math.min(BUCKET_MAX,st.bucketCount*2));}
      function weight(v){const st=v?.v?.stl;if(!st)return 0;if(st.kind==='pair')return 2+weight(v.v.members.first)+weight(v.v.members.second);return st.items.reduce((n,x)=>n+(isMap(st.kind)?2+weight(x.key)+weight(x.value):1+weight(x)),0);}
      function room(v,extra=0){limit(weight(v)+extra);}
      function copy(value){if(!value?.v?.stl)return rt.val(value.t,value.v,true);room(value);const s=specByAlias.get(value.t.name),v=make(s);if(s.kind==='pair'){v.v.members.first=copy(value.v.members.first);v.v.members.second=copy(value.v.members.second);}else v.v.stl.items=value.v.stl.items.map(x=>isMap(s.kind)?{key:copy(x.key),value:copy(x.value)}:copy(x));for(const key of ['capacity','bucketCount','maxLoadFactor'])if(key in value.v.stl)v.v.stl[key]=value.v.stl[key];return v;}
      function zero(t){if(typeof t==='string')return rt.val(primitive(t),0,true);return make(t);}
      function str(v){if(v?.v?.stl?.kind==='string')return v.v.stl.items.map(c=>String.fromCharCode(c.v)).join('');if(rt.isStringType(v))return rt.getStringFromCharArray(v);die('此操作需要 string 或字符串字面量。');}
      function convert(t,v){if(typeof t!=='string'&&t.kind==='string'&&rt.isStringType(v))return fromString(t,str(v));const target=primitive(t);if(!rt.isTypeEqualTo(target,v.t)&&(!rt.isNumericType(target)||!rt.isNumericType(v.t)))die('STL 元素类型不匹配，目标为 '+(typeof t==='string'?t:t.key)+'。');return copy(rt.cast(target,v));}
      function make(s){const metadata=['vector','string'].includes(s.kind)?{capacity:0}:isHash(s.kind)?{bucketCount:1,maxLoadFactor:1}:{};const v=rt.val(types.get(s.alias),{members:{},stl:{kind:s.kind,type:s.key,items:[],...metadata}},true);if(s.kind==='pair'){v.v.members.first=zero(s.args[0]);v.v.members.second=zero(s.args[1]);}return v;}
      function fromString(s,text){limit(text.length);const v=make(s);v.v.stl.items=[...text].map(c=>rt.val(rt.charTypeLiteral,c.charCodeAt(0),true));v.v.stl.capacity=v.v.stl.items.length;return v;}
      function writeString(v,s,text){const fresh=fromString(s,text),length=fresh.v.stl.items.length;grow(v,length);v.v.stl.items=fresh.v.stl.items;return v;}
      function at(v,index){const a=v.v.stl.items,i=rt.cast(rt.intTypeLiteral,index).v;if(!Number.isInteger(i)||i<0||i>=a.length)die('STL 下标 '+i+' 越界，当前长度为 '+a.length+'。');return a[i];}
      function nonempty(v){if(!v.v.stl.items.length)die(v.v.stl.kind+' 为空，不能读取或删除元素。');return v.v.stl.items;}
      const raw=v=>v.v?.stl?.kind==='string'?str(v):v.v?.stl?.kind==='pair'?[raw(v.v.members.first),raw(v.v.members.second)]:v.v;
      const compareRaw=(a,b)=>{if(Array.isArray(a)){for(let i=0;i<a.length;i++){const c=compareRaw(a[i],b[i]);if(c)return c;}return 0;}return a<b?-1:a>b?1:0;};
      const compare=(a,b)=>compareRaw(raw(a),raw(b));
      function method(type,name,fn){rt.regFunc(fn,type,name,['?'],rt.voidTypeLiteral);}
      function operator(type,name,fn){rt.types[rt.getTypeSignature(type)].handlers[rt.makeOperatorFuncName(name)]={default:fn};}
      const oldClone=rt.clone,oldCast=rt.cast,oldCastable=rt.castable,oldSimple=rt.simpleType,oldDef=rt.defVar,oldMember=rt.getMember;
      rt.clone=function(v,initial){return v?.v?.stl?copy(v):oldClone.call(this,v,initial);};
      rt.cast=function(t,v){if(specByAlias.get(t?.name)?.kind==='string'&&this.isStringType(v))return fromString(specByAlias.get(t.name),str(v));return oldCast.call(this,t,v);};
      rt.castable=function(a,b){if(this.isClassType(a)||this.isClassType(b))return this.isTypeEqualTo(a,b)||(specByAlias.get(b?.name)?.kind==='string'&&this.isStringType(a));return oldCastable.call(this,a,b);};
      rt.simpleType=function(t){const name=Array.isArray(t)?t.filter(x=>x!=='const').join(' '):t;if(prepared.refs[name])return {...types.get(prepared.refs[name]),stlRef:true};return oldSimple.call(this,t);};
      rt.defVar=function(name,type,init){if(type?.stlRef){if(!init?.left||!this.isTypeEqualTo(type,init.t))die('STL 引用需要相同类型的已有变量。');this.scope.at(-1).variables[name]=init;return;}return oldDef.call(this,name,type,init);};
      rt.getMember=function(v,name){if(v?.v?.stl&&!Object.hasOwn(v.v.members,name)&&!Object.hasOwn(this.types[this.getTypeSignature(v.t)].handlers,name))die(v.v.stl.kind+' 不支持成员方法 '+name+'，请检查该容器的接口。');return oldMember.call(this,v,name);};
      for(const s of prepared.specs){
        const type=types.get(s.alias),items=v=>v.v.stl.items,id=s.alias.slice(2);
        rt.types[rt.getTypeSignature(type)].cConstructor=(_rt,v)=>{const fresh=make(s);v.v=fresh.v;};
        const constructor=(_rt,_this,...args)=>{
          if(args.length===1&&rt.isTypeEqualTo(args[0].t,type))return copy(args[0]);
          const v=make(s);
          if(s.kind==='pair'){checkArgs(args,0,2);if(args.length===1)die('pair 构造需要两个值，或一个相同类型的 pair。');if(args.length){v.v.members.first=convert(s.args[0],args[0]);v.v.members.second=convert(s.args[1],args[1]);}}
          else if(s.kind==='string'){checkArgs(args,0,2);if(args.length===1)return fromString(s,str(args[0]));if(args.length===2){const n=sizeArg(args[0],'字符串长度'),c=rt.cast(rt.charTypeLiteral,args[1]);v.v.stl.items=Array.from({length:n},()=>copy(c));v.v.stl.capacity=n;}}
          else if(s.kind==='vector'){checkArgs(args,0,2);if(args.length){const n=sizeArg(args[0],'vector 长度'),fill=args.length===2?convert(s.args[0],args[1]):zero(s.args[0]);limit(n*(1+weight(fill)));v.v.stl.items=Array.from({length:n},()=>copy(fill));v.v.stl.capacity=n;}}
          else if(isHash(s.kind)){checkArgs(args,0,1);if(args.length)v.v.stl.bucketCount=Math.max(1,sizeArg(args[0],'桶数',BUCKET_MAX));}
          else checkArgs(args,0);
          return v;
        };
        method('global','_c'+id,constructor);
        method('global','_l'+id,(_rt,_this,...args)=>{limit(args.length);if(s.kind==='pair')return constructor(_rt,_this,...args);if(s.kind==='string'){if(args.length===1&&rt.isStringType(args[0]))return fromString(s,str(args[0]));const v=make(s);v.v.stl.items=args.map(a=>convert('char',a));v.v.stl.capacity=items(v).length;return v;}if(!['vector','set','unordered_set'].includes(s.kind))die(s.kind+' 暂不支持花括号初始化，请先默认构造后逐项加入。');const v=make(s);for(const a of args){const x=convert(s.args[0],a);if(s.kind==='vector'||!items(v).some(z=>compare(z,x)===0)){room(v,1+weight(x));items(v).push(x);}}if(s.kind==='set')items(v).sort(compare);if(s.kind==='vector')v.v.stl.capacity=items(v).length;if(isHash(s.kind))hashGrow(v,items(v).length);return v;});
        operator(type,'=',(_rt,a,b)=>{if(!a.left)die('赋值目标必须为变量。');const v=convert(s,b);if(['vector','string'].includes(s.kind)){v.v.stl.capacity=a.v.stl.capacity;grow(v,items(v).length);}a.v=v.v;return a;});
        if(s.kind==='pair')continue;
        method(type,'size',(_rt,v,...a)=>{checkArgs(a,0);return num(items(v).length);});
        method(type,'empty',(_rt,v,...a)=>{checkArgs(a,0);return bool(!items(v).length);});
        if(!['queue','stack'].includes(s.kind))method(type,'clear',(_rt,v,...a)=>{checkArgs(a,0);items(v).length=0;return voidValue();});
        if(['vector','string'].includes(s.kind)){
          method(type,'reserve',(_rt,v,...a)=>{checkArgs(a,1);const n=sizeArg(a[0]);v.v.stl.capacity=Math.max(v.v.stl.capacity,n);return voidValue();});
          method(type,'capacity',(_rt,v,...a)=>{checkArgs(a,0);return num(v.v.stl.capacity);});
          method(type,'shrink_to_fit',(_rt,v,...a)=>{checkArgs(a,0);v.v.stl.capacity=items(v).length;return voidValue();});
          operator(type,'[]',(_rt,v,i)=>at(v,i));method(type,'at',(_rt,v,...a)=>{checkArgs(a,1);return at(v,a[0]);});
          method(type,'front',(_rt,v,...a)=>{checkArgs(a,0);return nonempty(v)[0];});method(type,'back',(_rt,v,...a)=>{checkArgs(a,0);return nonempty(v).at(-1);});
          method(type,'push_back',(_rt,v,...a)=>{checkArgs(a,1);const x=convert(s.kind==='string'?'char':s.args[0],a[0]);room(v,1+weight(x));grow(v,items(v).length+1);items(v).push(x);return voidValue();});
          method(type,'pop_back',(_rt,v,...a)=>{checkArgs(a,0);nonempty(v).pop();return voidValue();});
          method(type,'resize',(_rt,v,...a)=>{checkArgs(a,1,2);const n=sizeArg(a[0],'resize 长度'),t=s.kind==='string'?'char':s.args[0],fill=a.length===2?convert(t,a[1]):zero(t);if(n<items(v).length)items(v).length=n;else{room(v,(n-items(v).length)*(1+weight(fill)));grow(v,n);while(items(v).length<n)items(v).push(copy(fill));}return voidValue();});
          if(s.kind==='vector')method(type,'assign',(_rt,v,...a)=>{checkArgs(a,2);const n=sizeArg(a[0],'assign 长度'),x=convert(s.args[0],a[1]);limit(n*(1+weight(x)));grow(v,n);v.v.stl.items=Array.from({length:n},()=>copy(x));return voidValue();});
        }
        if(s.kind==='string'){
          method(type,'length',(_rt,v,...a)=>{checkArgs(a,0);return num(items(v).length);});
          const stringArg=a=>a.t.name==='char'?String.fromCharCode(a.v):str(a);
          operator(type,'+=',(_rt,v,a)=>writeString(v,s,str(v)+stringArg(a)));
          operator(type,'+',(_rt,v,a)=>fromString(s,str(v)+stringArg(a)));
          for(const op of ['==','!=','<','<=','>','>='])operator(type,op,(_rt,a,b)=>{const x=str(a),y=str(b);return bool(op==='=='?x===y:op==='!='?x!==y:op==='<'?x<y:op==='<='?x<=y:op==='>'?x>y:x>=y);});
          method(type,'append',(_rt,v,...a)=>{checkArgs(a,1);return writeString(v,s,str(v)+stringArg(a[0]));});
          method(type,'assign',(_rt,v,...a)=>{checkArgs(a,1,2);if(a.length===1)return writeString(v,s,str(a[0]));const n=sizeArg(a[0],'assign 长度'),c=rt.cast(rt.charTypeLiteral,a[1]);return writeString(v,s,String.fromCharCode(c.v).repeat(n));});
          method(type,'substr',(_rt,v,...a)=>{checkArgs(a,1,2);const start=rt.cast(rt.intTypeLiteral,a[0]).v,n=a.length===2?rt.cast(rt.intTypeLiteral,a[1]).v:items(v).length;if(start<0||start>items(v).length||n<0)die('string.substr 的起点或长度越界。');return fromString(s,str(v).slice(start,start+n));});
        }
        if(['queue','stack'].includes(s.kind)){
          method(type,'push',(_rt,v,...a)=>{checkArgs(a,1);const x=convert(s.args[0],a[0]);room(v,1+weight(x));items(v).push(x);return voidValue();});
          method(type,'pop',(_rt,v,...a)=>{checkArgs(a,0);s.kind==='queue'?nonempty(v).shift():nonempty(v).pop();return voidValue();});
          if(s.kind==='stack')method(type,'top',(_rt,v,...a)=>{checkArgs(a,0);return nonempty(v).at(-1);});
          else{method(type,'front',(_rt,v,...a)=>{checkArgs(a,0);return nonempty(v)[0];});method(type,'back',(_rt,v,...a)=>{checkArgs(a,0);return nonempty(v).at(-1);});}
        }
        if(isHash(s.kind)){
          method(type,'reserve',(_rt,v,...a)=>{checkArgs(a,1);const n=sizeArg(a[0],'哈希预留元素数');v.v.stl.bucketCount=hashBuckets(v,Math.max(n,items(v).length));return voidValue();});
          method(type,'rehash',(_rt,v,...a)=>{checkArgs(a,1);const n=sizeArg(a[0],'rehash 桶数',BUCKET_MAX);v.v.stl.bucketCount=bucketLimit(Math.max(1,n,hashBuckets(v,items(v).length)));return voidValue();});
          method(type,'bucket_count',(_rt,v,...a)=>{checkArgs(a,0);return num(v.v.stl.bucketCount);});
          method(type,'load_factor',(_rt,v,...a)=>{checkArgs(a,0);return rt.val(rt.doubleTypeLiteral,items(v).length/v.v.stl.bucketCount);});
          method(type,'max_load_factor',(_rt,v,...a)=>{checkArgs(a,0,1);if(!a.length)return rt.val(rt.doubleTypeLiteral,v.v.stl.maxLoadFactor);const factor=a[0]?.v;if(!rt.isNumericType(a[0]?.t)||!Number.isFinite(factor)||factor<=0)die('max_load_factor 必须为大于 0 的有限数值。');v.v.stl.maxLoadFactor=factor;return voidValue();});
        }
        if(['set','map','unordered_set','unordered_map'].includes(s.kind)){
          const map=isMap(s.kind),hash=isHash(s.kind),keyOf=x=>map?x.key:x,locate=(v,k)=>items(v).findIndex(x=>compare(keyOf(x),k)===0);
          method(type,'count',(_rt,v,...a)=>{checkArgs(a,1);return num(locate(v,convert(s.args[0],a[0]))>=0?1:0);});
          method(type,'erase',(_rt,v,...a)=>{checkArgs(a,1);const i=locate(v,convert(s.args[0],a[0]));if(i<0)return num(0);items(v).splice(i,1);return num(1);});
          method(type,'insert',(_rt,v,...a)=>{checkArgs(a,1);let key,value;if(map){if(a[0]?.v?.stl?.kind!=='pair')die(s.kind+'.insert 需要 make_pair(key, value)。');key=convert(s.args[0],a[0].v.members.first);value=convert(s.args[1],a[0].v.members.second);}else key=convert(s.args[0],a[0]);if(locate(v,key)<0){room(v,map?2+weight(key)+weight(value):1+weight(key));if(hash)hashGrow(v,items(v).length+1);items(v).push(map?{key,value}:key);if(!hash)items(v).sort((x,y)=>compare(keyOf(x),keyOf(y)));}return voidValue();});
          if(map){
            operator(type,'[]',(_rt,v,k)=>{const key=convert(s.args[0],k);let i=locate(v,key);if(i<0){const entry={key,value:zero(s.args[1])};room(v,2+weight(key)+weight(entry.value));if(hash)hashGrow(v,items(v).length+1);items(v).push(entry);if(!hash)items(v).sort((x,y)=>compare(x.key,y.key));return entry.value;}return items(v)[i].value;});
            method(type,'at',(_rt,v,...a)=>{checkArgs(a,1);const i=locate(v,convert(s.args[0],a[0]));if(i<0)die('map.at 的键不存在。');return items(v)[i].value;});
          }
        }
      }
      const pairs=prepared.specs.filter(s=>s.kind==='pair');
      if(pairs.length)method('global','make_pair',(_rt,_this,...args)=>{checkArgs(args,2);let exact=pairs.find(s=>s.args.every((t,i)=>rt.isTypeEqualTo(primitive(t),args[i].t)||(t==='int'&&args[i].t.name==='unsigned int')||(typeof t!=='string'&&t.kind==='string'&&rt.isStringType(args[i]))));if(!exact){const compatible=pairs.filter(s=>s.args.every((t,i)=>(typeof t==='string'&&rt.isNumericType(primitive(t))&&rt.isNumericType(args[i].t))||(typeof t!=='string'&&t.kind==='string'&&rt.isStringType(args[i]))));if(compatible.length===1)exact=compatible[0];}if(!exact)die('make_pair 的元素类型尚未声明或存在歧义，请明确写出对应的 pair<T, U> 构造。');const v=make(exact);v.v.members.first=convert(exact.args[0],args[0]);v.v.members.second=convert(exact.args[1],args[1]);return v;});
      function streams(){
        const cin=rt.scope[0].variables.cin,cout=rt.scope[0].variables.cout;
        const stringSpec=prepared.specs.find(s=>s.kind==='string');if(!stringSpec||!cin||!cout||cout.v.stlPatched)return;cout.v.stlPatched=true;
        const ih=rt.types[rt.getTypeSignature(cin.t)].handlers['o(>>)'],oh=rt.types[rt.getTypeSignature(cout.t)].handlers['o(<<)'],input=ih.default,output=oh.default;
        ih.default=function(_rt,c,v){if(v?.v?.stl?.kind!=='string')return input(_rt,c,v);if(!v.left)die('cin 的目标必须为 string 变量。');const b=c.v.buf.replace(/^\s+/,''),word=/^\S*/.exec(b)[0];if(!word.length)die('标准输入不足，无法读取 string。');writeString(v,stringSpec,word);c.v.buf=b.slice(word.length);return c;};
        oh.default=function(_rt,c,v){if(v?.v?.stl?.kind!=='string')return output(_rt,c,v);c.v.ostream.write(str(v));return c;};
        method('global','getline',(_rt,_this,...a)=>{checkArgs(a,2,3);if(a[0].t.name!=='istream'||a[1]?.v?.stl?.kind!=='string'||!a[1].left)die('getline 需要 getline(cin, string变量)。');const delimiter=a.length===3?String.fromCharCode(rt.cast(rt.charTypeLiteral,a[2]).v):'\n',b=a[0].v.buf,i=b.indexOf(delimiter);writeString(a[1],stringSpec,i<0?b:b.slice(0,i));a[0].v.buf=i<0?'':b.slice(i+1);return a[0];});
      }
      rt.__algolabSTLStreams=streams;streams();
    }
    const set=(name,value)=>{oldHeaders.set(name,runtime.includes[name]);runtime.includes[name]=value;};
    for(const header of HEADERS)set(header,{load});
    set('iostream',{load(rt){previousIO.load(rt);rt.__algolabSTLStreams?.();}});
    set('__algolab_all',{load(rt){previousAll?.load(rt);load(rt);}});
    return function restore(){for(const [name,value]of oldHeaders)if(value===undefined)delete runtime.includes[name];else runtime.includes[name]=value;};
  }
  root.CppLabSTL={prepare,install,snapshot,LIMITS:{elements:MAX,capacity:MAX,buckets:BUCKET_MAX,snapshot:PREVIEW}};
})(typeof self==='undefined'?globalThis:self);
