(function(L){
  'use strict';
  for(const id of ['stack','queue'])L.register(id,(options={})=>{
    const stack=id==='stack',values=options.values?.slice()||L.numbers(6),commands=[...[0,1,2].map(i=>[1,values[i]]),[0,0],[0,0],...[3,4,5].map(i=>[1,values[i]]),...[0,0,0,0,0].map(()=>[0,0])],data=[],removed=[];
    const t=new L.Trace(`vector<int> demo(vector<pair<int,int>> commands) {
init|    ${stack?'vector<int> data;':'queue<int> data;'}
output|    vector<int> removed;
loop|    for (auto [type, value] : commands) {
pushTest|        if (type == 1) {
push|            data.${stack?'push_back':'push'}(value);
        } else {
empty|            if (!data.empty()) {
read|                removed.push_back(data.${stack?'back':'front'}());
pop|                data.${stack?'pop_back':'pop'}();
            }
        }
    }
return|    return removed;
}`,{操作:commands.map(([type,value])=>type?`加入 ${value}`:'取出')},L.array(data));const s=(l,m,v={})=>t.step(l,m,{当前内容:data.slice(),removed:removed.slice(),...v},L.array(data,data.length?[stack?data.length-1:0]:[],{caption:stack?'右端为栈顶：后进先出':'左端为队首，右端为队尾：先进先出',pointers:data.length?stack?{top:data.length-1}:{front:0,rear:data.length-1}:{}}));s('init',stack?'建立一个空栈。':'建立一个空队列。');s('output','记录取出的元素顺序。');for(let k=0;;k++){s('loop','读取下一条操作。',{操作下标:k});if(k>=commands.length)break;const [type,value]=commands[k];s('pushTest','判断当前操作是加入还是取出。',{type,value});if(type){data.push(value);s('push',stack?'元素加入栈顶。':'元素加入队尾。',{type,value});}else{s('empty','空结构不能继续取出元素。');if(data.length){removed.push(stack?data[data.length-1]:data[0]);s('read',stack?'读取栈顶元素。':'读取队首元素。');if(stack)data.pop();else data.shift();s('pop',stack?'删除栈顶。':'删除队首，后续元素成为新队首。');}}}s('return','返回按操作顺序取出的元素。');return t.done(removed);
  });
  L.register('deque',(options={})=>{
    const v=options.values?.slice()||L.numbers(6),commands=[[0,v[0]],[1,v[1]],[0,v[2]],[1,v[3]],[2,0],[3,0],[1,v[4]],[0,v[5]],[2,0],[3,0]],data=[],removed=[];
    const t=new L.Trace(`vector<int> demo(vector<pair<int,int>> commands) {
init|    deque<int> data;
output|    vector<int> removed;
loop|    for (auto [type, value] : commands) {
front|        if (type == 0) data.push_front(value);
back|        else if (type == 1) data.push_back(value);
popFront|        else if (type == 2 && !data.empty()) {
readFront|            removed.push_back(data.front());
eraseFront|            data.pop_front();
        }
popBack|        else if (type == 3 && !data.empty()) {
readBack|            removed.push_back(data.back());
eraseBack|            data.pop_back();
        }
    }
return|    return removed;
}`,{操作:commands.map(([type,value])=>['头部加入 '+value,'尾部加入 '+value,'头部取出','尾部取出'][type])},L.array(data));const s=(l,m,vars={})=>t.step(l,m,{data:data.slice(),removed:removed.slice(),...vars},L.array(data,[],{pointers:data.length?{front:0,back:data.length-1}:{},caption:'两端均可加入和取出'}));s('init','建立空双端队列。');s('output','记录取出的元素。');for(let i=0;;i++){s('loop','读取下一条双端操作。',{i});if(i>=commands.length)break;const [type,value]=commands[i];if(type===0){data.unshift(value);s('front','从队首加入元素。',{type,value});}else{s('front','本次不是队首加入。',{type,value});if(type===1){data.push(value);s('back','从队尾加入元素。',{type,value});}else{s('back','本次不是队尾加入。',{type,value});s('popFront','检查是否从队首取出。',{type});if(type===2&&data.length){removed.push(data[0]);s('readFront','读取队首元素。');data.shift();s('eraseFront','移除队首。');}else{s('popBack','检查是否从队尾取出。',{type});if(type===3&&data.length){removed.push(data[data.length-1]);s('readBack','读取队尾元素。');data.pop();s('eraseBack','移除队尾。');}}}}}s('return','返回取出顺序。');return t.done(removed);
  });
  L.register('circular-queue',(options={})=>{
    const capacity=5,values=options.values?.slice()||L.numbers(9),commands=[[1,values[0]],[1,values[1]],[1,values[2]],[0,0],[0,0],...[3,4,5,6,7,8].map(i=>[1,values[i]]),[0,0],[0,0]],data=Array(capacity).fill('—'),removed=[];let front=0,count=0;
    const t=new L.Trace(`vector<int> demo(vector<pair<int,int>> commands) {
capacity|    const int capacity = 5;
init|    vector<int> data(capacity), removed;
state|    int front = 0, count = 0;
loop|    for (auto [type, value] : commands) {
pushTest|        if (type == 1) {
full|            if (count == capacity) continue;
rear|            int rear = (front + count) % capacity;
write|            data[rear] = value;
increase|            ++count;
        } else {
empty|            if (count == 0) continue;
read|            removed.push_back(data[front]);
advance|            front = (front + 1) % capacity;
decrease|            --count;
        }
    }
return|    return removed;
}`,{capacity,操作:commands.map(([type,value])=>type?'入队 '+value:'出队')},L.array(data));const s=(l,m,v={},active=[])=>t.step(l,m,{front,count,capacity,下一写入位置:(front+count)%capacity,removed:removed.slice(),...v},L.array(data,active,{pointers:{front,rear:(front+count)%capacity},found:Array.from({length:count},(_,i)=>(front+i)%capacity),caption:'固定 5 个存储槽，计数区分队空与队满；浅色数值可能是已出队的旧内容'}));s('capacity','固定容量为 5。');s('init','准备底层存储槽。');s('state','队首和有效元素数初始化为 0。');for(let k=0;;k++){s('loop','读取下一条操作。',{k});if(k>=commands.length)break;const [type,value]=commands[k];s('pushTest','判断是否为入队操作。',{type,value});if(type){s('full','队满时拒绝入队。');if(count===capacity)continue;const rear=(front+count)%capacity;s('rear','取模使写入位置绕回数组开头。',{rear},[rear]);data[rear]=value;s('write','写入新元素。',{rear,value},[rear]);count++;s('increase','有效元素数量加一。');}else{s('empty','空队列不能出队。');if(!count)continue;removed.push(data[front]);s('read','读取队首的有效元素。',{},[front]);front=(front+1)%capacity;s('advance','队首指针向前移动并取模。',{},[front]);count--;s('decrease','有效元素数量减一。');}}s('return','返回成功出队的元素。');return t.done(removed);
  });
})(AlgoLab);
