(function(L){
  'use strict';
  L.register('hash-chaining',(options={})=>{
    const capacity=7,base=L.rand(1,6),keys=options.values?.slice()||[base,base+7,base+14,...L.unique(3)],buckets=Array.from({length:capacity},()=>[]),target=options.target??keys[L.rand(0,keys.length-1)];
    const t=new L.Trace(`bool chaining(vector<int> keys, int target) {
init|    vector<vector<int>> buckets(7);
loop|    for (int key : keys) {
hash|        int index = key % 7;
insert|        buckets[index].push_back(key);
    }
target|    int index = target % 7;
scan|    for (int value : buckets[index]) {
test|        if (value == target) return true;
    }
missing|    return false;
}`,{keys,target,capacity},{});const s=(l,m,v={},active=[])=>t.step(l,m,{target,...v},{kind:'buckets',buckets,active,caption:'哈希函数 h(key) = key % 7，同桶内保存冲突键'});s('init','初始化 7 个空桶。');for(let i=0;;i++){s('loop','读取下一个键。',{i});if(i>=keys.length)break;const key=keys[i],index=key%capacity;s('hash','计算这个键所属的桶。',{key,index},[index]);buckets[index].push(key);s('insert','即使发生冲突，也追加到同一个桶中。',{key,index},[index]);}const index=target%capacity;s('target','查询时使用同样的哈希函数定位桶。',{index},[index]);for(let i=0;;i++){s('scan','只扫描目标桶中的元素。',{index,i},[index]);if(i>=buckets[index].length)break;const value=buckets[index][i];s('test','比较桶内的键是否等于目标。',{index,value},[index]);if(value===target)return t.done(true,'在冲突链中找到目标键。');}s('missing','目标桶中不存在这个键。');return t.done(false);
  });
  L.register('hash-probing',(options={})=>{
    const capacity=11,base=L.rand(1,5),keys=options.values?.slice()||[base,base+11,base+22,...L.unique(4)],table=Array(capacity).fill(-1),target=options.target??keys[L.rand(0,keys.length-1)];
    const t=new L.Trace(`bool probing(vector<int> keys, int target) {
init|    vector<int> table(11, -1);
loop|    for (int key : keys) {
hash|        int slot = key % 11;
scan|        while (table[slot] != -1) {
advance|            slot = (slot + 1) % 11;
        }
insert|        table[slot] = key;
    }
target|    int slot = target % 11;
search|    for (int tried = 0; tried < 11 && table[slot] != -1; ++tried) {
test|        if (table[slot] == target) return true;
next|        slot = (slot + 1) % 11;
    }
missing|    return false;
}`,{keys,target,capacity},L.array(table));const s=(l,m,v={},active=[])=>t.step(l,m,{target,...v},L.array(table.map(x=>x===-1?'空':x),active,{caption:'h(key) = key % 11，发生冲突后向右探测'}));s('init','空槽使用 -1 标记。');for(let i=0;;i++){s('loop','读取下一个键。',{i});if(i>=keys.length)break;const key=keys[i];let slot=key%capacity;s('hash','定位初始槽位。',{key,slot},[slot]);let tried=0;while(true){s('scan','当前槽位已占用时继续探测。',{key,slot},[slot]);if(table[slot]===-1)break;if(++tried>=capacity)throw new Error('演示哈希表已满，请减少键的数量。');slot=(slot+1)%capacity;s('advance','向后移动一个槽位，末尾绕回开头。',{key,slot},[slot]);}table[slot]=key;s('insert','在空槽中写入键。',{key,slot},[slot]);}let slot=target%capacity;s('target','从目标键的哈希槽位开始查询。',{slot},[slot]);for(let tried=0;;tried++){s('search','遇到空槽或完整扫描一圈时结束。',{slot,tried},[slot]);if(tried>=capacity||table[slot]===-1)break;s('test','检查当前槽位是否是目标键。',{slot},[slot]);if(table[slot]===target)return t.done(true,'找到目标键。');slot=(slot+1)%capacity;s('next','继续沿探测序列查询。',{slot},[slot]);}s('missing','没有找到目标键。');return t.done(false);
  });
})(AlgoLab);

(function(L){
  'use strict';
  for(const id of ['ordered-set','hash-set','ordered-map','hash-map']){
    L.register(id,(options={})=>{
      const ordered=id.startsWith('ordered'),mapping=id.endsWith('map');
      const a=options.a?.slice()||L.numbers(8,-3,8),query=options.query??a[0]??0,eraseValue=options.eraseValue??a[a.length-1]??0;
      const entries=new Map(),input={a:a.slice(),query,eraseValue};
      const t=L.lessonTrace(id,input,{});
      const sortedKeys=()=>[...entries.keys()].sort((x,y)=>x-y);
      const draw=(key)=>{
        const keys=ordered?sortedKeys():[...entries.keys()];
        const caption=ordered
          ?'按键升序展示；C++ / Java 使用有序容器，Python 用二分查找和列表模拟，插入、删除需要 O(n)。'
          :'桶位置仅按 ((key % 5) + 5) % 5 作教学示意，不代表标准容器的内部布局或遍历顺序。';
        if(ordered)return L.array(keys,keys.includes(key)?[keys.indexOf(key)]:[],{
          caption,...(mapping?{aux:[{label:'对应出现次数',values:keys.map(k=>entries.get(k))}]}:{})
        });
        const buckets=Array.from({length:5},()=>[]);
        for(const k of keys)buckets[((k%5)+5)%5].push(mapping?`${k} → ${entries.get(k)}`:k);
        return {kind:'buckets',buckets,active:key===undefined?[]:[((key%5)+5)%5],caption};
      };
      const s=(label,message,vars={},key)=>t.step(label,message,{query,eraseValue,...vars},draw(key));
      s('init',mapping?'建立空映射，每个键对应一个出现次数。':'建立空集合，每个值最多保存一次。');
      for(let i=0;;i++){
        s('loop','读取下一个输入值。',{i});
        if(i>=a.length)break;
        const x=a[i],existing=entries.has(x);
        s('contains','检查这个键是否已经存在。',{i,x,existing},x);
        s('test',existing?'键已存在，无需创建新条目。':'首次遇到这个键，需要创建条目。',{i,x,existing},x);
        if(!existing){
          entries.set(x,mapping?0:1);
          s('insert',mapping?'建立新键，并把计数初始化为 0。':'插入这个新值；集合自动去重。',{i,x},x);
        }
        if(mapping){
          entries.set(x,entries.get(x)+1);
          s('count','把当前键的出现次数加一。',{i,x,count:entries.get(x)},x);
        }
      }
      const found=mapping?(entries.get(query)??0):entries.has(query);
      s('query',mapping?'查询指定键的计数，键不存在时得到 0。':'查询指定值是否属于集合。',{found},query);
      entries.delete(eraseValue);
      s('erase','删除指定键；键不存在时容器保持原样。',{found},eraseValue);
      const result=[];
      s('output','准备返回结果。',{result});
      const keys=ordered?sortedKeys():[...entries.keys()];
      if(mapping){
        for(let i=0;;i++){
          s('collect','把映射中的键和次数写入结果。',{i,result});
          if(i>=keys.length)break;
          const key=keys[i];
          result.push([key,entries.get(key)]);
          s('write','保存一组 [键, 次数]。',{key,count:entries.get(key),result},key);
        }
      }else{
        result.push(...keys);
        s('collect','读取集合中的剩余元素。',{result});
      }
      result.sort((x,y)=>mapping?x[0]-y[0]:x-y);
      s('sort','将返回结果按键升序排列，便于核对；哈希容器本身不保证这个顺序。',{result});
      s('return','返回删除后的容器内容。',{result});
      return t.done(result);
    });
  }
})(AlgoLab);
