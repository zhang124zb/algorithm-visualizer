(function(L){
  'use strict';
  L.register('bfs',(options={})=>{
    const g=options.graph||L.graph(),adj=L.adjacency(g),start=options.start??0,q=[],visited=Array(g.nodes.length).fill(false),order=[];
    const t=new L.Trace(`vector<int> bfs(vector<vector<int>> adj, int start) {
init|    vector<bool> visited(adj.size(), false);
output|    vector<int> order;
queue|    queue<int> q;
mark|    visited[start] = true;
push|    q.push(start);
loop|    while (!q.empty()) {
pop|        int u = q.front(); q.pop();
visit|        order.push_back(u);
neighbors|        for (int v : adj[u]) {
test|            if (!visited[v]) {
seen|                visited[v] = true;
enqueue|                q.push(v);
            }
        }
    }
return|    return order;
}`,{起点:g.nodes[start].label,边:g.edges},g);const s=(l,m,v={},active=[])=>t.step(l,m,{queue:q.map(i=>g.nodes[i].label),order:order.map(i=>g.nodes[i].label),...v},{...g,active,visited:visited.flatMap((x,i)=>x?[i]:[]),aux:[{label:'队列：左侧为队首',values:q.map(i=>g.nodes[i].label)}]});s('init','所有节点都尚未发现。');s('output','初始化访问结果。');s('queue','建立先进先出的队列。');visited[start]=true;s('mark','起点标记为已发现，防止重复入队。',{},[start]);q.push(start);s('push','起点入队。',{},[start]);while(true){s('loop','检查队列是否非空。');if(!q.length)break;const u=q.shift();s('pop','取出队首节点。',{u:g.nodes[u].label},[u]);order.push(u);s('visit','记录当前节点的访问顺序。',{u:g.nodes[u].label},[u]);for(let k=0;;k++){s('neighbors','检查下一个相邻节点。',{u:g.nodes[u].label,邻接下标:k},[u]);if(k>=adj[u].length)break;const v=adj[u][k][0];s('test','只有尚未发现的节点才会入队。',{u:g.nodes[u].label,v:g.nodes[v].label},[u,v]);if(!visited[v]){visited[v]=true;s('seen','先标记，再入队。',{v:g.nodes[v].label},[v]);q.push(v);s('enqueue','稍后按先进先出的顺序访问。',{v:g.nodes[v].label},[v]);}}}s('return','返回从起点可达的节点访问顺序。');return t.done(order);
  });
  L.register('dfs',(options={})=>{
    const g=options.graph||L.graph(),adj=L.adjacency(g),visited=Array(g.nodes.length).fill(false),order=[],stack=[];const start=options.start??0;
    const t=new L.Trace(`void dfs(int u, const vector<vector<int>>& adj,
         vector<bool>& visited, vector<int>& order) {
mark|    visited[u] = true;
visit|    order.push_back(u);
loop|    for (int v : adj[u]) {
test|        if (!visited[v]) {
recurse|            dfs(v, adj, visited, order);
        }
    }
}`,{起点:g.nodes[start].label,边:g.edges},g);
    const s=(l,m,u,v)=>t.step(l,m,{u:g.nodes[u].label,v:v===undefined?'—':g.nodes[v].label,调用栈:stack.map(x=>g.nodes[x].label),order:order.map(x=>g.nodes[x].label)},{...g,active:[u],visited:visited.flatMap((x,i)=>x?[i]:[]),aux:[{label:'递归调用栈',values:stack.map(x=>g.nodes[x].label)}]});function dfs(u){stack.push(u);visited[u]=true;s('mark','进入节点并标记为已访问。',u);order.push(u);s('visit','把当前节点加入访问结果。',u);for(let k=0;;k++){s('loop','依次检查相邻节点。',u);if(k>=adj[u].length)break;const v=adj[u][k][0];s('test','判断邻居是否尚未访问。',u,v);if(!visited[v]){s('recurse','沿这条边继续深入。',u,v);dfs(v);}}stack.pop();}dfs(start);return t.done(order,'所有可达分支探索结束。');
  });
  L.register('permutations',(options={})=>{
    const a=options.values?.slice()||L.unique(4),used=Array(a.length).fill(false),path=[],result=[];
    const t=new L.Trace(`void permute(const vector<int>& a, vector<bool>& used,
             vector<int>& path, vector<vector<int>>& result) {
complete|    if (path.size() == a.size()) {
save|        result.push_back(path);
return|        return;
    }
loop|    for (int i = 0; i < (int)a.size(); ++i) {
skip|        if (used[i]) continue;
mark|        used[i] = true;
choose|        path.push_back(a[i]);
recurse|        permute(a, used, path, result);
undo|        path.pop_back();
unmark|        used[i] = false;
    }
}`,{values:a},L.array(a));const s=(l,m,i=-1)=>t.step(l,m,{i,path:path.slice(),used:used.slice(),已生成:result.length},L.array(a,i>=0?[i]:[],{found:used.flatMap((x,j)=>x?[j]:[]),aux:[{label:'当前排列',values:path},{label:'最近生成的排列',values:result.slice(-1).flat()}]}));function dfs(){s('complete','检查是否已选满所有位置。');if(path.length===a.length){result.push(path.slice());s('save','保存一组完整排列。');s('return','返回上一层，继续尝试其他选择。');return;}for(let i=0;;i++){s('loop','尝试把一个未使用的元素放到下个位置。',i);if(i>=a.length)break;s('skip','已经使用的元素不能重复选择。',i);if(used[i])continue;used[i]=true;s('mark','标记当前元素已使用。',i);path.push(a[i]);s('choose','将当前元素加入排列。',i);s('recurse','递归填写下一个位置。',i);dfs();path.pop();s('undo','撤销本次选择，移除最后一个元素。',i);used[i]=false;s('unmark','恢复可用状态，准备其他分支。',i);}}dfs();return t.done(result,`共生成 ${result.length} 组排列。`);
  });
  L.register('maze',(options={})=>{
    const rows=5,cols=6,grid=options.grid?.map(r=>r.slice())||Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>r===0||c===cols-1?0:Math.random()<.27?1:0));const n=grid.length,m=grid[0].length,q=[],visited=Array.from({length:n},()=>Array(m).fill(false)),parent={},path=[];
    const t=new L.Trace(`vector<pair<int,int>> maze(vector<vector<int>> grid) {
size|    int n = grid.size(), m = grid[0].size();
init|    vector<vector<bool>> seen(n, vector<bool>(m, false));
parent|    map<pair<int,int>, pair<int,int>> parent;
queue|    queue<pair<int,int>> q;
start|    q.push({0, 0}); seen[0][0] = true;
directions|    vector<pair<int,int>> dirs = {{1,0},{0,1},{-1,0},{0,-1}};
loop|    while (!q.empty()) {
pop|        auto [x, y] = q.front(); q.pop();
goal|        if (x == n - 1 && y == m - 1) break;
neighbors|        for (auto [dx, dy] : dirs) {
next|            int nx = x + dx, ny = y + dy;
test|            if (nx < 0 || nx >= n || ny < 0 || ny >= m || grid[nx][ny] || seen[nx][ny]) continue;
mark|            seen[nx][ny] = true;
save|            parent[{nx,ny}] = {x,y};
push|            q.push({nx,ny});
        }
    }
path|    vector<pair<int,int>> path;
fail|    if (!seen[n-1][m-1]) return path;
back|    for (pair<int,int> p = {n-1,m-1}; ; p = parent[p]) {
record|        path.push_back(p);
stop|        if (p == make_pair(0,0)) break;
    }
reverse|    reverse(path.begin(), path.end());
return|    return path;
}`,{grid},{});const s=(l,message,vars={},active=[])=>t.step(l,message,{queue:q.map(x=>x.join(',')),...vars},{kind:'grid',rows:grid,active,visited:visited.flatMap((r,x)=>r.flatMap((v,y)=>v?[[x,y]]:[])),path,start:[0,0],goal:[n-1,m-1]});s('size','确定迷宫的行列数；1 是墙，0 是通路。',{n,m});s('init','所有格子初始化为未访问。');s('parent','建立前驱记录，以便最后还原路径。');s('queue','建立 BFS 队列。');q.push([0,0]);visited[0][0]=true;s('start','起点标记后入队。',{},[[0,0]]);const dirs=[[1,0],[0,1],[-1,0],[0,-1]];s('directions','允许上下左右四个方向移动。');while(true){s('loop','检查是否还有待探索的格子。');if(!q.length)break;const [x,y]=q.shift();s('pop','取出距离起点最近的待处理格子。',{x,y},[[x,y]]);s('goal','检查是否到达终点。',{x,y},[[x,y]]);if(x===n-1&&y===m-1)break;for(let d=0;;d++){s('neighbors','枚举四个方向。',{x,y,d});if(d>=dirs.length)break;const [dx,dy]=dirs[d],nx=x+dx,ny=y+dy;s('next','计算相邻格子的坐标。',{x,y,nx,ny},[[x,y]]);s('test','越界、墙或已经访问的格子直接跳过。',{x,y,nx,ny});if(nx<0||nx>=n||ny<0||ny>=m||grid[nx][ny]||visited[nx][ny])continue;visited[nx][ny]=true;s('mark','标记这个格子已发现。',{nx,ny},[[nx,ny]]);parent[[nx,ny]]=[x,y];s('save','记录从哪个格子走到这里。',{nx,ny,前驱:[x,y]},[[nx,ny]]);q.push([nx,ny]);s('push','相邻格子入队。',{nx,ny},[[nx,ny]]);}}s('path','准备从终点回溯路径。');s('fail','如果终点未被访问，则不存在通路。');if(!visited[n-1][m-1])return t.done(path,'终点不可达。');let p=[n-1,m-1];while(true){s('back','沿前驱向起点回溯。',{p});path.push(p.slice());s('record','把当前位置加入路径。',{p},[p]);s('stop','到达起点时停止回溯。',{p});if(p[0]===0&&p[1]===0)break;p=parent[p];}path.reverse();s('reverse','反转后得到从起点到终点的最短路径。');s('return','返回最短路径。');return t.done(path);
  });
  L.register('n-queens',(options={})=>{
    const n=options.n??L.rand(4,5),col=Array(n).fill(-1),solutions=[];
    const t=new L.Trace(`bool safe(int row, int c, const vector<int>& col) {
previous|    for (int r = 0; r < row; ++r) {
conflict|        if (col[r] == c || abs(col[r] - c) == row - r) return false;
    }
valid|    return true;
}
void queens(int row, vector<int>& col, vector<vector<int>>& solutions) {
complete|    if (row == (int)col.size()) {
save|        solutions.push_back(col);
return|        return;
    }
loop|    for (int c = 0; c < (int)col.size(); ++c) {
test|        if (!safe(row, c, col)) continue;
place|        col[row] = c;
recurse|        queens(row + 1, col, solutions);
remove|        col[row] = -1;
    }
}`,{n},{});
    const s=(l,m,row,c=-1)=>t.step(l,m,{row,c,col:col.slice(),解的数量:solutions.length},{kind:'queens',n,col:col.slice(),active:row<n&&c>=0&&c<n?[[row,c]]:[]});function safe(row,c){for(let r=0;;r++){s('previous','依次检查此前放置的皇后。',row,c);if(r>=row)break;const conflict=col[r]===c||Math.abs(col[r]-c)===row-r;t.step('conflict',conflict?'同列或同一斜线，发生冲突。':'与这位皇后不冲突。',{row,c,r,之前皇后列:col[r],冲突:conflict},{kind:'queens',n,col:col.slice(),active:[[row,c],[r,col[r]]],conflict});if(conflict)return false;}s('valid','与所有已放置皇后均不冲突。',row,c);return true;}
    function dfs(row){s('complete','检查所有行是否都已放置皇后。',row);if(row===n){solutions.push(col.slice());s('save','保存一个完整解。',row);s('return','返回上一行寻找其他解。',row);return;}for(let c=0;;c++){s('loop','尝试当前行的下一个列位置。',row,c);if(c>=n)break;s('test','调用 safe 检查这个位置。',row,c);if(!safe(row,c))continue;col[row]=c;s('place','放置当前行的皇后。',row,c);s('recurse','递归处理下一行。',row,c);dfs(row+1);col[row]=-1;s('remove','移除皇后，恢复到本次选择之前的状态。',row,c);}}dfs(0);return t.done(solutions,`${n} 皇后共有 ${solutions.length} 个解。`);
  });
})(AlgoLab);

(function(L) {
  'use strict';
  L.register('pruning',(o={})=>{
    const a=o.a?.slice()||L.numbers(6,1,9),target=o.target??L.rand(8,25);
    if(!Number.isInteger(target)||target<0||a.some(x=>!Number.isInteger(x)||x<0))throw new Error('此剪枝演示要求数组元素和目标都是非负整数。');
    const suffix=Array(a.length+1).fill(0),chosen=[],stack=[];
    const t=L.lessonTrace('pruning',{a,target},L.array(a));
    const s=(label,message,vars={})=>t.step(label,message,{target,已选下标:chosen.slice(),调用栈:stack.slice(),...vars},L.array(a,vars.i>=0&&vars.i<a.length?[vars.i]:[],{found:chosen.slice(),caption:'每个元素最多选一次。黄色是待决定元素，绿色是当前分支已选择的元素。',aux:[{label:'suffix[i]：从 i 到末尾的元素和',values:suffix},{label:'当前选择',values:chosen.map(i=>a[i])},{label:'调用栈（位置, 当前和）',values:stack.map(x=>`${x.i}, ${x.sum}`)}]}));
    s('suffix','建立长度 n + 1 的后缀和数组，末尾为 0。');
    for(let i=a.length-1;;i--){s('build','从右向左累计剩余元素之和。',{i});if(i<0)break;suffix[i]=suffix[i+1]+a[i];s('sumSuffix','这一项等于后面的和加上当前元素。',{i});}
    function dfs(i,sum){
      stack.push({i,sum});
      s('goal','先检查是否已经凑出目标。',{i,sum});
      if(sum===target){s('success','找到一组选择，立即返回成功。',{i,sum});stack.pop();return true;}
      s('over','所有元素非负，当前和超过目标后不可能再减小。',{i,sum});
      if(sum>target){s('overReturn','剪掉当前和过大的整条分支。',{i,sum});stack.pop();return false;}
      s('end','检查是否已经决定完所有元素。',{i,sum});
      if(i===a.length){s('endReturn','元素已用完且尚未达到目标。',{i,sum});stack.pop();return false;}
      s('shortage','即使选完所有剩余元素，也必须能够达到目标。',{i,sum,最大可达:sum+suffix[i]});
      if(sum+suffix[i]<target){s('shortReturn','剩余元素总和不够，剪掉这条分支。',{i,sum});stack.pop();return false;}
      s('include','先搜索选择当前元素的分支。',{i,sum});chosen.push(i);
      const take=dfs(i+1,sum+a[i]);
      s('checkTake','检查选择当前元素的子问题是否成功。',{i,sum,take});
      if(take){s('takeReturn','子问题成功，逐层向上返回。',{i,sum,take});stack.pop();return true;}
      chosen.pop();s('exclude','选择当前元素失败，撤回这次选择，搜索不选它的分支。',{i,sum,take});
      const result=dfs(i+1,sum);stack.pop();return result;
    }
    s('start','从第 0 个元素开始，当前和为 0。',{i:0,sum:0});
    const result=dfs(0,0);s('start','搜索已经结束，所有调用均已返回。',{result});return t.done(result,result?'存在满足目标的子集。':'所有可能分支均已检查或被剪掉，不存在满足目标的子集。');
  });

  L.register('memo-search',(o={})=>{
    const n=o.n??L.rand(6,9);
    if(!Number.isInteger(n)||n<0||n>30)throw new Error('记忆化演示支持 0 到 30 的整数。');
    const memo=Array(n+1).fill(-1),stack=[];
    const t=L.lessonTrace('memo-search',{n},L.array(memo));
    const s=(label,message,vars={})=>t.step(label,message,{...vars,调用栈:stack.slice()},L.array(memo,vars.n===undefined?[]:[vars.n],{found:memo.flatMap((x,i)=>x>=0?[i]:[]),caption:'memo[n] 保存 F(n)，-1 表示尚未求解；F(0)=0，F(1)=1。',aux:[{label:'递归调用栈（右侧是当前层）',values:stack.map(x=>`F(${x})`)}]}));
    s('init','所有子问题先标记为未求解。');
    function dfs(k){
      stack.push(k);s('cached','每次调用先检查缓存，已有结果可以直接复用。',{n:k});
      if(memo[k]!==-1){s('hit','缓存命中，直接返回，不再展开递归。',{n:k,result:memo[k]});stack.pop();return memo[k];}
      s('base','没有缓存时，检查是否属于 F(0) 或 F(1)。',{n:k});
      if(k<=1){memo[k]=k;s('seed','保存基础情况，后续调用也可以复用。',{n:k});}
      else{
        s('left','递归求 F(n - 1)。',{n:k});const left=dfs(k-1);
        s('right','F(n - 1) 已返回，继续求 F(n - 2)。',{n:k,left});const right=dfs(k-2);
        memo[k]=left+right;s('store','把两个子问题相加，并将结果保存进缓存。',{n:k,left,right});
      }
      s('return','返回本层计算并保存的结果。',{n:k,result:memo[k]});stack.pop();return memo[k];
    }
    s('start','从需要求解的 F(n) 出发，自顶向下递归。',{n});
    const result=dfs(n);s('start','最外层调用返回最终结果，调用栈清空，缓存保留。',{n,result});return t.done(result,`F(${n}) = ${result}；每个不同的子问题只计算一次。`);
  });
})(AlgoLab);
