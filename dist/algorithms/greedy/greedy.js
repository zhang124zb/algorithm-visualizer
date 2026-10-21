(function(L){
  'use strict';
  const intervals=()=>Array.from({length:7},()=>{const l=L.rand(0,11);return [l,l+L.rand(2,6)];});
  L.register('interval-scheduling',(options={})=>{
    const a=options.intervals?.map(x=>x.slice())||intervals();a.sort((x,y)=>x[1]-y[1]);let end=-Infinity,answer=0;const selected=[];
    const t=new L.Trace(`int selectIntervals(vector<pair<int,int>> a) {
sort|    sort(a.begin(), a.end(), [](auto x, auto y) { return x.second < y.second; });
init|    int end = INT_MIN, answer = 0;
loop|    for (int i = 0; i < (int)a.size(); ++i) {
test|        if (a[i].first >= end) {
end|            end = a[i].second;
count|            ++answer;
        }
    }
return|    return answer;
}`,{intervals:a},{});
    const s=(l,m,i=-1)=>t.step(l,m,{i,end,answer,selected}, {kind:'intervals',intervals:a,active:i,selected});s('sort','按结束时间从早到晚排序。');s('init','还没有选择任何区间。');for(let i=0;;i++){s('loop','尝试下一个结束时间最早的区间。',i);if(i>=a.length)break;s('test','当前区间是否与上一个已选区间不重叠？端点相接允许。',i);if(a[i][0]>=end){end=a[i][1];selected.push(i);s('end','选择该区间，并更新结束时间。',i);answer++;s('count','可选区间数量加一。',i);}}s('return','得到最多的不重叠区间数量。');return t.done(answer);
  });
  L.register('interval-cover',(options={})=>{
    const target=options.target??12;const a=options.intervals?.map(x=>x.slice())||[[0,L.rand(3,5)],[1,6],[3,8],[5,9],[7,12],[9,14],[2,4]];a.sort((x,y)=>x[0]-y[0]);let current=0,i=0,count=0;const selected=[];
    const t=new L.Trace(`int cover(vector<pair<int,int>> a, int target) {
sort|    sort(a.begin(), a.end());
init|    int current = 0, i = 0, count = 0;
outer|    while (current < target) {
best|        int farthest = current, chosen = -1;
inner|        while (i < (int)a.size() && a[i].first <= current) {
test|            if (a[i].second > farthest) {
update|                farthest = a[i].second, chosen = i;
            }
advance|            ++i;
        }
fail|        if (farthest == current) return -1;
extend|        current = farthest;
count|        ++count;
    }
return|    return count;
}`,{intervals:a,target},{});
    const s=(l,m,extra={})=>t.step(l,m,{current,i,count,target,...extra},{kind:'intervals',intervals:a,active:i,selected,target,current});s('sort','按区间起点排序。');s('init','从 0 开始覆盖目标区间。');while(true){s('outer','检查是否已经覆盖目标终点。');if(current>=target)break;let farthest=current,chosen=-1;s('best','初始化本轮能到达的最远位置。',{farthest,chosen});while(true){s('inner','枚举起点不超过当前覆盖终点的所有区间。',{farthest,chosen});if(!(i<a.length&&a[i][0]<=current))break;s('test','比较哪个区间能够延伸得更远。',{farthest,chosen});if(a[i][1]>farthest){farthest=a[i][1];chosen=i;s('update','更新本轮最优区间。',{farthest,chosen});}i++;s('advance','继续检查下一个区间。',{farthest,chosen});}s('fail','如果无法向右延伸，说明目标区间存在空缺。',{farthest,chosen});if(farthest===current)return t.done(-1,'存在无法覆盖的空缺。');selected.push(chosen);current=farthest;s('extend','选用本轮延伸最远的区间。',{farthest,chosen});count++;s('count','使用的区间数加一。');}s('return','已经覆盖整个目标区间。');return t.done(count);
  });
  L.register('optimal-merge',(options={})=>{
    const input=options.values?.slice()||L.numbers(6,2,18),a=input.slice().sort((x,y)=>x-y);let cost=0;
    const t=new L.Trace(`int optimalMerge(vector<int> a) {
init|    priority_queue<int, vector<int>, greater<int>> q(a.begin(), a.end());
cost|    int cost = 0;
loop|    while (q.size() > 1) {
first|        int x = q.top(); q.pop();
second|        int y = q.top(); q.pop();
add|        cost += x + y;
push|        q.push(x + y);
    }
return|    return cost;
}`,{values:input},L.array(a));
    const s=(l,m,v={})=>t.step(l,m,{cost,...v},L.array(a,[],{caption:'小根优先队列按数值展开'}));s('init','将所有堆放入小根优先队列。');s('cost','总成本初始为 0。');while(true){s('loop','只要还有两堆，就继续合并。');if(a.length<=1)break;const x=a.shift();s('first','取出最小的一堆。',{x});const y=a.shift();s('second','取出第二小的一堆。',{x,y});cost+=x+y;s('add','把本次合并的大小计入总成本。',{x,y});a.push(x+y);a.sort((p,q)=>p-q);s('push','新堆重新加入优先队列。',{x,y});}s('return','所有堆合并完成。');return t.done(cost);
  });
})(AlgoLab);
