(function(L){
  'use strict';
  L.register('array',(options={})=>{
    const a=options.values?.slice()||L.numbers(6),pos=options.pos??L.rand(0,a.length),value=options.value??L.rand(40,60),erasePos=options.erasePos??L.rand(0,a.length);
    const t=new L.Trace(`void editArray(vector<int>& a, int pos, int value, int erasePos) {
read|    int first = a.empty() ? -1 : a[0];
grow|    a.push_back(0);
shift|    for (int i = (int)a.size() - 1; i > pos; --i) {
move|        a[i] = a[i - 1];
    }
insert|    a[pos] = value;
delete|    for (int i = erasePos; i + 1 < (int)a.size(); ++i) {
left|        a[i] = a[i + 1];
    }
shrink|    a.pop_back();
}`,{values:a.slice(),pos,value,erasePos},L.array(a));const s=(l,m,v={},active=[])=>t.step(l,m,{pos,value,erasePos,...v},L.array(a,active,{pointers:{...(['delete','left','shrink'].includes(l)?{erasePos}:{pos}),...(Number.isInteger(v.i)?{i:v.i}:{})}}));s('read','数组支持按下标直接访问；先读取第一个元素。',{first:a[0]??-1},a.length?[0]:[]);a.push(0);s('grow','扩展一个末尾位置，为插入预留空间。');for(let i=a.length-1;;i--){s('shift','从右向左移动，避免覆盖尚未搬走的数据。',{i});if(i<=pos)break;a[i]=a[i-1];s('move','将前一个元素向右移动一格。',{i},[i-1,i]);}a[pos]=value;s('insert','写入新元素。',{},[pos]);for(let i=erasePos;;i++){s('delete','删除时将后面的元素依次向左搬移。',{i});if(i+1>=a.length)break;a[i]=a[i+1];s('left','把下一个元素搬到当前位置。',{i},[i,i+1]);}a.pop();s('shrink','移除重复的末尾位置，完成删除。');return t.done(a);
  });
  for(const id of ['singly-linked-list','doubly-linked-list'])L.register(id,(options={})=>{
    const doubly=id==='doubly-linked-list',a=options.values?.slice()||L.unique(5),pos=options.pos??L.rand(1,3),value=options.value??L.rand(50,70),nodes=[{id:0,value:'哨兵',next:null,prev:null}];let tail=nodes[0],p=null,tailReady=false;
    const t=new L.Trace(`${doubly?'struct Node { int value; Node *next, *prev; };':'struct Node { int value; Node *next; };'}
Node* demo(vector<int> values, int pos, int value) {
dummy|    Node dummy{0, nullptr${doubly?', nullptr':''}};
tail|    Node* tail = &dummy;
build|    for (int x : values) {
new|        Node* node = new Node{x, nullptr${doubly?', tail':''}};
link|        tail->next = node;
advance|        tail = node;
    }
pointer|    Node* p = &dummy;
walk|    for (int i = 0; i < pos; ++i) p = p->next;
create|    Node* node = new Node{value, p->next${doubly?', p':''}};
${doubly?'back|    if (p->next) p->next->prev = node;\n':''}insert|    p->next = node;
victim|    Node* victim = node->next;
check|    if (victim != nullptr) {
unlink|        node->next = victim->next;
${doubly?'repair|        if (victim->next) victim->next->prev = node;\n':''}free|        delete victim;
    }
${doubly?'head|    if (dummy.next) dummy.next->prev = nullptr;\n':''}return|    return dummy.next;
}`,{values:a,pos,value},{});
    const draw=(active=[])=>({kind:'graph',directed:true,nodes:nodes.filter(n=>!n.deleted).map((n,i)=>({id:n.id,label:String(n.value),x:8+i*84/Math.max(1,nodes.filter(x=>!x.deleted).length-1),y:50})),pointers:{...(tailReady&&!tail.deleted?{tail:tail.id}:{}),...(p&&!p.deleted?{p:p.id}:{})},edges:nodes.filter(n=>!n.deleted).flatMap(n=>[...(n.next?[{u:n.id,v:n.next.id}]:[]),...(doubly&&n.prev?[{u:n.id,v:n.prev.id,back:true}]:[])]),active,caption:doubly?'实线表示 next，虚线表示 prev':'箭头表示 next；哨兵简化头节点操作'});
    const s=(l,m,v={},active=[])=>{if(l==='tail')tailReady=true;return t.step(l,m,{pos,value,...v},draw(active));};s('dummy','建立不保存实际数据的哨兵节点。');s('tail','尾指针最初指向哨兵。',{tail:0},[0]);for(let i=0;;i++){s('build','读取下一个初始值。',{i});if(i>=a.length)break;const node={id:nodes.length,value:a[i],next:null,prev:doubly?tail:null};nodes.push(node);s('new','分配新节点。',{x:a[i]},[node.id]);tail.next=node;s('link','将原尾节点的 next 指向新节点。',{},[tail.id,node.id]);tail=node;s('advance','尾指针移动到新节点。',{tail:tail.value},[tail.id]);}p=nodes[0];s('pointer','从哨兵开始定位插入位置。',{p:p.value},[p.id]);for(let i=0;i<pos;i++){p=p.next;s('walk','沿 next 前进一步。',{i,p:p.value},[p.id]);}const node={id:nodes.length,value,next:p.next,prev:doubly?p:null};nodes.push(node);s('create','新节点先连接原来的后继。',{p:p.value},[node.id]);if(doubly){if(p.next)p.next.prev=node;s('back','原后继的 prev 改为新节点。',{},[node.id,p.next?.id].filter(x=>x!==undefined));}p.next=node;s('insert','前驱的 next 改为新节点，插入完成。',{},[p.id,node.id]);const victim=node.next;s('victim','下面演示删除新节点之后的原后继。',{victim:victim?.value??'null'},victim?[victim.id]:[]);s('check','只有后继存在时才能删除。');if(victim){node.next=victim.next;s('unlink','绕过待删除节点，连接到它的后继。',{},[node.id]);if(doubly){if(victim.next)victim.next.prev=node;s('repair','修复后继的 prev 指针。',{},[node.id]);}victim.deleted=true;s('free','释放已从链表断开的节点。');}const result=[];for(let q=nodes[0].next;q;q=q.next)result.push(q.value);if(doubly){if(nodes[0].next)nodes[0].next.prev=null;s('head','返回前将实际头节点的 prev 清空。');}s('return','返回哨兵之后的实际链表头。');return t.done(result);
  });
  L.register('circular-linked-list',(options={})=>{
    const values=options.values?.slice()||L.unique(6),n=values.length,step=options.step??L.rand(2,4),next=Array.from({length:n},(_,i)=>(i+1)%n),alive=Array(n).fill(true);let current=0,previous=n-1,remaining=n;
    const t=new L.Trace(`int josephus(vector<int> values, int step) {
size|    int n = values.size();
init|    vector<int> next(n);
link|    for (int i = 0; i < n; ++i) next[i] = (i + 1) % n;
start|    int current = 0, previous = n - 1, remaining = n;
loop|    while (remaining > 1) {
count|        for (int k = 1; k < step; ++k) {
previous|            previous = current;
advance|            current = next[current];
        }
unlink|        next[previous] = next[current];
remove|        --remaining;
next|        current = next[current];
    }
return|    return values[current];
}`,{values,step},{});
    const draw=()=>({kind:'graph',directed:true,nodes:values.map((value,i)=>({id:i,label:String(value),x:50+35*Math.cos(i*2*Math.PI/n-Math.PI/2),y:50+34*Math.sin(i*2*Math.PI/n-Math.PI/2),muted:!alive[i]})),edges:next.flatMap((v,i)=>alive[i]?[{u:i,v}]:[]),pointers:n?{current,previous}:{},active:[current],visited:alive.flatMap((x,i)=>x?[]:[i]),caption:'尾节点的 next 回到头节点，形成一个环'});const s=(l,m,v={})=>t.step(l,m,{current,previous,remaining,step,next,...v},draw());s('size','确定节点数量。',{n});s('init','为每个节点准备后继下标。');for(let i=0;i<n;i++)s('link','最后一个节点连接回第一个节点。',{i,'next[i]':next[i]});s('start','从第一个节点开始计数。');while(true){s('loop','只剩一个节点时结束。');if(remaining<=1)break;for(let k=1;;k++){s('count','报数到 step，当前节点将被移除。',{k});if(k>=step)break;previous=current;s('previous','记录前驱节点。');current=next[current];s('advance','沿循环指针前进一步。');}const removed=current;next[previous]=next[current];s('unlink','前驱跳过当前节点，完成断链。',{移除值:values[removed]});alive[removed]=false;remaining--;s('remove','剩余节点数减一。');current=next[current];s('next','从下一个存活节点重新报数。');}s('return','返回最后存活节点的值。');return t.done(values[current]);
  });
})(AlgoLab);

(function(L){
  'use strict';
  L.register('dynamic-array',(options={})=>{
    const a=options.a?.slice()||L.numbers(L.rand(5,9),1,30);
    let buffer=[],size=0,capacity=0,next=[];
    const t=L.lessonTrace('dynamic-array',{a:a.slice()},L.array([]));
    const draw=(active=[],vars={})=>L.array(buffer.map((x,i)=>i<size?x:'·'),active,{
      pointers:{size,...(Number.isInteger(vars.j)?{j:vars.j}:{})},
      caption:'size 指向下一写入位置，只有 [0, size) 内的元素有效；capacity 是容量。手动倍增为教学模型，实际 vector 增长策略由实现决定。',
      aux:[{label:'待追加的数据',values:a},...(next.length?[{label:'扩容后的新存储',values:next}]:[])]
    });
    const s=(label,message,vars={},active=[])=>t.step(label,message,{size,capacity,...vars},draw(active,vars));
    s('init','从容量为 0 的空数组开始。');
    for(let i=0;;i++){
      s('loop','依次读取一个待追加的元素。',{i});
      if(i>=a.length)break;
      const x=a[i];
      s('full','检查已有存储是否放得下新元素。',{i,x});
      if(size===capacity){
        const newCapacity=capacity===0?1:capacity*2;
        s('capacity','首次分配 1 个位置，之后每次将容量翻倍。',{i,x,newCapacity});
        next=Array(newCapacity).fill(0);
        s('allocate','创建更大的存储；新存储暂时全部为 0。',{i,x,newCapacity});
        for(let j=0;;j++){
          s('copyLoop','只搬移已有的有效元素。',{i,x,newCapacity,j});
          if(j>=size)break;
          next[j]=buffer[j];
          s('copy','把旧存储中的元素复制到相同下标。',{i,x,newCapacity,j},[j]);
        }
        buffer=next;next=[];
        s('replace','让数组使用新存储，旧存储不再需要。',{i,x,newCapacity});
        capacity=newCapacity;
        s('saveCapacity','记录新的容量。',{i,x,newCapacity});
      }
      buffer[size]=x;
      // The written slot is valid after the following size increment.
      t.step('append','在第一个空位置写入新元素。',{size,capacity,i,x},
        L.array(buffer.map((v,j)=>j<=size?v:'·'),[size],{pointers:{size},caption:draw().caption,aux:[{label:'待追加的数据',values:a}]}));
      size++;
      s('grow','有效元素数量加一。',{i,x},[size-1]);
    }
    const result=buffer.slice(0,size);
    s('result','返回有效元素，未使用的容量不属于数组内容。',{result});
    return t.done(result);
  });
})(AlgoLab);
