(function(root){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const value=(id,label,type,address,stored,status='live')=>({id,label,type,address,value:stored,kind:'value',status});
  const pointer=(id,label,type,address,stored,status='live')=>({id,label,type,address,value:stored,kind:'pointer',status});
  const link=(from,to)=>({from,to});
  const source=name=>'https://eel.is/c++draft/'+name;
  function lesson(info,markedCode,build){
    const labels={},lines=markedCode.trim().split('\n').map((line,index)=>{
      const match=/^([A-Za-z]\w*)\|(.*)$/.exec(line);
      if(!match)return line;
      if(labels[match[1]])throw Error('重复指针课程行标记：'+match[1]);
      labels[match[1]]=index+1;return match[2];
    });
    const frame=(label,message,cells,links=[],extra={})=>{
      if(!labels[label])throw Error('缺少指针课程行标记：'+label);
      return clone({line:labels[label],message,cells,links,...extra});
    };
    return {...info,code:lines.join('\n'),steps:build(frame)};
  }
  const lessons=[];

  lessons.push(lesson({
    id:'value-address',level:'beginner',title:'变量的值、地址与 &',goal:'分清变量里存的值、变量自己的地址，以及指针保存的地址。',
    explanation:[
      '变量可以先想成一个有名字的存储位置。int x = 7 把整数 7 放进 x；&x 则取得 x 这个对象的地址，不是取得数值 7。',
      'int* p = &x 创建另一个变量 p。p 自己也有存放位置，但它保存的值是 x 的地址。图中的箭头从 p 出发，表示通过这个地址能找到 x。',
      'A0、P0 只是本课的地址符号，不是程序打印出的真实地址，也不暗示 int 或指针占多少字节。不同课程里的同名地址符号彼此独立。'
    ],
    pitfall:'p 保存的地址与 &p 不同：p 的值是 A0，p 自己的位置是 P0。不要把指针变量和它指向的对象当成同一个变量。',
    practice:{question:'图中 x 位于 A0，p 自己位于 P0，执行 int* p = &x 后，p 保存什么？',options:['A0','P0','整数 7'],answer:0,explanation:'&x 取得 x 的地址 A0，复制到 p；P0 是指针变量自己的地址。'},
    related:[{path:'structures/linear/array.html',title:'数组中的存储位置'}],sources:[source('expr.unary.op'),source('dcl.ptr')]
  },`#include <iostream>
int main() {
x|    int x = 7;
p|    int* p = &x;
printX|    std::cout << x << '\\n';
printP|    std::cout << *p << '\\n';
}`,f=>{
    const x=()=>value('x','x','int','A0',7),p=()=>pointer('p','p','int*','P0','A0');
    return [f('x','x 的值为 7，示意地址为 A0。',[x()]),f('p','p 自己在 P0，保存的值为 A0；箭头指向 x。',[x(),p()],[link('p','x')]),f('printX','直接按变量名读取 x，输出 7。',[x(),p()],[link('p','x')],{outputs:['7']}),f('printP','沿 p 找到同一个 x，再读取它，仍输出 7。',[x(),p()],[link('p','x')],{outputs:['7','7']})];
  }));

  lessons.push(lesson({
    id:'dereference',level:'beginner',title:'用 * 读取与修改目标',goal:'看见解引用读取的是谁、写入改变的是谁。',
    explanation:[
      '当 p 确实指向一个仍然存在的 int 对象时，表达式 *p 就代表那个对象。读取 *p，读到的是目标的值；给 *p 赋值，改的是目标。',
      'int saved = *p 会复制当时读到的整数，不会让 saved 变成 x 的别名。随后通过 *p 修改 x，并不会把旧副本 saved 也改掉。',
      '声明中的 int* 表示类型，表达式中的 *p 表示一次解引用。这两个星号看起来相同，出现的位置和作用不同。'
    ],
    pitfall:'修改 *p 不等于修改 p。前者改变目标对象的值，后者改变指针保存的地址。解引用前还必须保证目标有效。',
    practice:{question:'先执行 saved = *p 得到 7，再执行 *p = 12，saved 现在是多少？',options:['12','7','A0'],answer:1,explanation:'saved 是整数副本，仍为 7；x 变成 12，p 仍保存 x 的地址。'},
    related:[{path:'structures/linear/array.html',title:'数组元素的读取与写入'}],sources:[source('expr.unary.op')]
  },`int main() {
x|    int x = 7;
p|    int* p = &x;
read|    int saved = *p;
write|    *p = 12;
}`,f=>{
    const cells=(x,saved)=>[value('x','x','int','A0',x),pointer('p','p','int*','P0','A0'),...(saved===undefined?[]:[value('saved','saved（读取时的副本）','int','A1',saved)])];
    return [f('x','创建 x，当前值为 7。',[value('x','x','int','A0',7)]),f('p','p 指向 x，此时尚未读取或改写 x。',cells(7),[link('p','x')]),f('read','读取 *p 得到 7，再把这个整数复制给 saved。',cells(7,7),[link('p','x')]),f('write','通过 *p 将 x 改为 12；p 的地址值和 saved 的旧副本都没有改变。',cells(12,7),[link('p','x')])];
  }));

  lessons.push(lesson({
    id:'aliases',level:'beginner',title:'重新指向与同址别名',goal:'分清复制一个地址和让两个指针永久绑定。',
    explanation:[
      'int* q = p 复制的是 p 当时保存的地址。此时 p、q 都能找到 x，因此通过其中任意一个写入 x，另一个也会看到 x 的新值。',
      'p = &y 只改变 p 保存的地址，不会移动 x 或 y，也不会连带修改 q。q 仍保留此前复制的 x 的地址。'
    ],
    pitfall:'q = p 并不是让 q 指向指针变量 p 本身。想保存 &p，需要另一种类型 int**，后面的二级指针课会介绍。',
    practice:{question:'q 复制 p 指向 x 的地址后，又执行 p = &y，q 仍指向谁？',options:['指针变量 p 本身','y','x'],answer:2,explanation:'p、q 是两个独立变量。重新给 p 赋地址值，不会改变 q 已保存的地址。'},
    related:[{path:'structures/linear/singly-linked-list.html',title:'链表中的节点连接'}],sources:[source('dcl.ptr'),source('expr.unary.op')]
  },`int main() {
values|    int x = 10, y = 20;
p|    int* p = &x;
q|    int* q = p;
aliasWrite|    *q = 12;
redirect|    p = &y;
writeY|    *p = 25;
}`,f=>{
    const cells=(x,y,p='A0',q=false)=>[value('x','x','int','A0',x),value('y','y','int','A1',y),pointer('p','p','int*','P0',p),...(q?[pointer('q','q','int*','P1','A0')]:[])];
    return [f('values','x 与 y 是两个独立的整数对象。',[value('x','x','int','A0',10),value('y','y','int','A1',20)]),f('p','p 保存 x 的地址。',cells(10,20),[link('p','x')]),f('q','q 复制 A0，现在两条箭头指向同一个 x。',cells(10,20,'A0',true),[link('p','x'),link('q','x')]),f('aliasWrite','通过 q 写入 x，x 变为 12；p 也能读到这个新值。',cells(12,20,'A0',true),[link('p','x'),link('q','x')]),f('redirect','只把 p 改为指向 y；q 仍指向 x。',cells(12,20,'A1',true),[link('p','y'),link('q','x')]),f('writeY','通过 p 把 y 改为 25，x 仍为 12。',cells(12,25,'A1',true),[link('p','y'),link('q','x')])];
  }));

  lessons.push(lesson({
    id:'nullptr',level:'beginner',title:'nullptr 与先判空',goal:'知道空指针不指向对象，理解本例的判空分支。',
    explanation:[
      'nullptr 可以用来初始化空指针，表示此刻没有要指向的对象。空指针不是一个装着默认整数的对象，不能通过 *p 去读写。',
      '本例先把 p 设为空，因此第一次 if 的条件为假，内部写入被跳过；后来 p 指向仍在作用域内的 x，才进入第二次写入。',
      '判空只检查是否为空。一个非空地址也可能已经悬空或越界，因此“不是 nullptr”不能单独证明任意解引用都安全。'
    ],
    pitfall:'不要声明 int* p 后直接使用而不初始化。也不要把 if(p) 当成自动检测悬空、越界或对象类型的工具。',
    practice:{question:'p 为 nullptr 时，下面哪一种操作可以做？',options:['通过 *p 写入整数','检查 p 是否等于 nullptr','把 *p 的值复制给另一个整数'],answer:1,explanation:'空指针可以参与判空比较，但没有可供解引用读写的目标对象。'},
    related:[{path:'structures/linear/singly-linked-list.html',title:'链表末尾的空连接'}],sources:[source('conv.ptr'),source('expr.unary.op')]
  },`int main() {
null|    int* p = nullptr;
blocked|    // *p = 9; // 禁止：空指针没有可写目标
skip|    if (p != nullptr) {
        *p = 9;
    }
x|    int x = 4;
point|    p = &x;
guard|    if (p != nullptr) {
write|        *p = 9;
    }
}`,f=>{
    const empty=()=>pointer('p','p','int*','P0','nullptr');
    const cells=x=>[value('x','x','int','A0',x),pointer('p','p','int*','P0','A0')];
    return [f('null','p 是空指针，没有通向对象的箭头。',[empty()]),f('blocked','这行只是错误尝试的注释，未执行；不能对 nullptr 解引用。',[empty()],[],{blocked:true}),f('skip','条件为假，跳过 if 内的写入；这不是一次解引用。',[empty()]),f('x','创建仍在当前作用域内的 x，p 暂时仍为空。',[value('x','x','int','A0',4),empty()]),f('point','把 x 的地址交给 p。',cells(4),[link('p','x')]),f('guard','本次条件为真，并且本例中的 x 仍然有效。',cells(4),[link('p','x')]),f('write','进入分支，通过 p 把 x 改为 9。',cells(9),[link('p','x')])];
  }));

  lessons.push(lesson({
    id:'array-arithmetic',level:'basic',title:'数组指针运算与尾后位置',goal:'理解 p+1 按元素移动，认识有效尾后指针与禁止解引用的边界。',
    explanation:[
      '在这里，数组名 a 转换成指向首元素的 int*。p+1 表示同一数组中的下一个 int 元素位置，不是简单地把真实地址数值加一字节。',
      'a+3 是这个三元素数组的尾后位置，可以作为遍历结束标记。图中 E0 只是边界占位，不是 a[3] 这个实际元素。',
      '同一数组内的元素位置和尾后位置可以进行本例中的指针运算与比较，但到达尾后后不能解引用，也不能再向前越过它。'
    ],
    pitfall:'数组不是一个能够随意移动的指针变量。a 的数组对象类型与 p 的指针类型不同；尾后指针有效不代表尾后有一个可读写元素。',
    practice:{question:'当 p 已等于 end，也就是尾后位置时，以下哪项允许？',options:['比较 p 与 end 是否相等','读取 *p 的值','再执行 ++p 越过尾后位置'],answer:0,explanation:'尾后可用于结束比较，不能被当成元素解引用；本例中再前进会越过允许范围。'},
    related:[{path:'structures/linear/array.html',title:'数组下标与连续元素'},{path:'structures/linear/dynamic-array.html',title:'动态数组的有效元素与容量'}],sources:[source('conv.array'),source('expr.add'),source('basic.compound')]
  },`int main() {
array|    int a[3] = {10, 20, 30};
p|    int* p = a;
end|    int* end = a + 3;
advance|    ++p;
write|    *p = 25;
finish|    p = end;
blocked|    // *p = 99; // 禁止：尾后位置不是数组元素
}`,f=>{
    const cells=(middle,pAddress,endPresent)=>[value('a0','a[0]','int','A0',10),value('a1','a[1]','int','A1',middle),value('a2','a[2]','int','A2',30),...(pAddress?[pointer('p','p','int*','P0',pAddress)]:[]),...(endPresent?[pointer('end','end','int*','P1','E0'),{id:'after',label:'尾后边界（不是元素）',type:'边界占位',address:'E0',value:'不可解引用',kind:'boundary',status:'boundary'}]:[])];
    return [f('array','数组有且只有 3 个 int 元素。',cells(20)),f('p','a 转换为首元素地址，p 指向 a[0]。',cells(20,'A0'),[link('p','a0')]),f('end','保存尾后标记 E0；边界占位不占一个额外数组元素。',cells(20,'A0',true),[link('p','a0'),link('end','after')]),f('advance','p 按 int 元素前进一步，改为指向 a[1]。',cells(20,'A1',true),[link('p','a1'),link('end','after')]),f('write','通过 *p 把第二个元素改为 25。',cells(25,'A1',true),[link('p','a1'),link('end','after')]),f('finish','p 与 end 保存相同的尾后位置，此时只能用于允许的边界操作。',cells(25,'E0',true),[link('p','after'),link('end','after')]),f('blocked','错误写入留在注释中；没有执行，也没有创建 a[3]。',cells(25,'E0',true),[link('p','after'),link('end','after')],{blocked:true})];
  }));

  lessons.push(lesson({
    id:'pointer-parameters',level:'basic',title:'指针传参：改目标与改局部副本',goal:'看清函数形参与调用者指针是两个变量。',
    explanation:[
      '函数参数 int* q 仍然是按值传递：它获得调用者指针保存的地址副本。两个指针变量虽然不同，却暂时指向同一个 x。',
      'write_value 通过 *q 写入共同目标，所以 main 中的 x 会变为 9；reset_local 只把自己的 q 改为空，不会改掉 main 中 p 保存的地址。',
      '函数返回后，形参变量的生命周期结束。图中会保留一张灰色的已结束记录，方便回看，但它已不是可继续使用的局部变量。'
    ],
    pitfall:'“传入了指针”不等于“函数能直接重设调用者的指针变量”。要重设调用者 p，可以另学 int** 或 int*&；不能靠给形参副本赋值实现。',
    practice:{question:'调用 reset_local(p) 后，main 里的 p 会怎样？',options:['自动变成 nullptr','x 自动变成 0','仍保存 x 的地址 A0'],answer:2,explanation:'reset_local 修改的是自己的形参 q；调用者 p 的地址值没有被赋新值。'},
    related:[{path:'structures/linear/singly-linked-list.html',title:'函数中的链表节点操作'}],sources:[source('expr.call'),source('basic.life'),source('dcl.ptr')]
  },`void write_value(int* q) {
write|    *q = 9;
writeEnd|}
void reset_local(int* q) {
reset|    q = nullptr;
resetEnd|}
int main() {
x|    int x = 1;
p|    int* p = &x;
callWrite|    write_value(p);
callReset|    reset_local(p);
}`,f=>{
    const main=x=>[value('x','main 的 x','int','A0',x),pointer('p','main 的 p','int*','P0','A0')];
    const writeQ=(status='live')=>pointer('writeQ','write_value 的 q','int*','Q0',status==='ended'?'作用域结束':'A0',status);
    const resetQ=(stored='A0',status='live')=>pointer('resetQ','reset_local 的 q','int*','Q1',stored,status);
    return [f('x','main 创建 x。',[value('x','main 的 x','int','A0',1)]),f('p','main 的 p 指向 x。',main(1),[link('p','x')]),f('callWrite','进入 write_value，形参 q 在 Q0 获得地址值 A0 的副本。',[...main(1),writeQ()],[link('p','x'),link('writeQ','x')]),f('write','通过形参 *q 写入共同的 x，x 变为 9。',[...main(9),writeQ()],[link('p','x'),link('writeQ','x')]),f('writeEnd','函数返回，write_value 的 q 生命周期结束；main 的 p 仍然存在。',[...main(9),writeQ('ended')],[link('p','x')]),f('callReset','另一个函数获得新的形参副本，地址 Q1 也是示意位置。',[...main(9),writeQ('ended'),resetQ()],[link('p','x'),link('resetQ','x')]),f('reset','只把 reset_local 的 q 设为空，main 的 p 仍保存 A0。',[...main(9),writeQ('ended'),resetQ('nullptr')],[link('p','x')]),f('resetEnd','reset_local 返回，形参记录结束；x 仍为 9，main 的 p 仍指向 x。',[...main(9),writeQ('ended'),resetQ('作用域结束','ended')],[link('p','x')])];
  }));

  lessons.push(lesson({
    id:'const-pointers',level:'basic',title:'const 指针的三种读法',goal:'区分不能经它修改目标、不能更改指向，以及两者都受限。',
    explanation:[
      'const int* readOnly 表示不能通过 *readOnly 修改目标；readOnly 自己仍可保存另一个兼容对象的地址。若原来的 x 并不是 const，仍可通过 x 本身或其他合法可写途径修改它。',
      'int* const fixed 表示指针变量保存的地址不能再改，但 *fixed 指向的 int 仍可修改。const int* const both 则同时限制这两种操作。',
      '本课把不允许的尝试全部保留为代码注释，并用拦截帧说明编译限制；它们没有作为合法语句执行。'
    ],
    pitfall:'不要只看声明里有没有 const：先判断它限制的是经指针修改目标，还是重新给指针赋一个地址值。const int* 不会把原本可变的 x 永久冻结。',
    practice:{question:'对于 const int* readOnly = &x，以下哪项被禁止？',options:['若 x 本身非 const，通过 x = 3 修改 x','令 readOnly = &y，改为指向另一个 int','通过 *readOnly = 5 修改目标'],answer:2,explanation:'只读的是经 readOnly 这条访问路径的目标；指针自身没有顶层 const，所以可以重新指向。'},
    related:[{path:'structures/stl/index.html',title:'容器元素与接口约束'}],sources:[source('dcl.ptr'),source('dcl.type.cv')]
  },`int main() {
x|    int x = 1;
y|    int y = 2;
readOnly|    const int* readOnly = &x;
otherAccess|    x = 3;
redirect|    readOnly = &y;
fixed|    int* const fixed = &x;
write|    *fixed = 4;
both|    const int* const both = &x;
blockedRead|    // *readOnly = 5; // 不允许：经只读指针写目标
blockedFixed|    // fixed = &y; // 不允许：更改 const 指针的地址值
blockedBothValue|    // *both = 6; // 不允许：经 both 写目标
blockedBothAddress|    // both = &y; // 不允许：更改 both 的地址值
}`,f=>{
    const cells=(x,read='A0',fixed=false,both=false)=>[value('x','x（本身非 const）','int','A0',x),value('y','y','int','A1',2),pointer('readOnly','readOnly','const int*','P0',read),...(fixed?[pointer('fixed','fixed','int* const','P1','A0')]:[]),...(both?[pointer('both','both','const int* const','P2','A0')]:[])];
    const links=(read,fixed=false,both=false)=>[link('readOnly',read==='A0'?'x':'y'),...(fixed?[link('fixed','x')]:[]),...(both?[link('both','x')]:[])];
    return [f('x','先创建可变的 x。',[value('x','x（本身非 const）','int','A0',1)]),f('y','再创建可变的 y。',[value('x','x（本身非 const）','int','A0',1),value('y','y','int','A1',2)]),f('readOnly','经 readOnly 只能读取 x；readOnly 自身尚可改向。',cells(1),links('A0')),f('otherAccess','x 本身没有声明 const，因此直接修改 x 是允许的。',cells(3),links('A0')),f('redirect','允许把 readOnly 改为保存 y 的地址。',cells(3,'A1'),links('A1')),f('fixed','fixed 的地址值固定为 A0，但其目标 int 可写。',cells(3,'A1',true),links('A1',true)),f('write','允许通过 *fixed 把 x 改为 4。',cells(4,'A1',true),links('A1',true)),f('both','both 同时限制经它写目标和更改它自己的地址值。',cells(4,'A1',true,true),links('A1',true,true)),f('blockedRead','注释中的写入若去掉注释会编译失败，状态不变。',cells(4,'A1',true,true),links('A1',true,true),{blocked:true}),f('blockedFixed','注释中的重新赋地址若执行会违反 fixed 的 const 限制。',cells(4,'A1',true,true),links('A1',true,true),{blocked:true}),f('blockedBothValue','both 不能作为修改目标值的访问路径。',cells(4,'A1',true,true),links('A1',true,true),{blocked:true}),f('blockedBothAddress','both 的地址值也不能改；这行同样没有执行。',cells(4,'A1',true,true),links('A1',true,true),{blocked:true})];
  }));

  lessons.push(lesson({
    id:'row-pointers',level:'basic',title:'二维数组的行指针',goal:'认识 int (*)[3]，避免把二维数组当成 int**。',
    explanation:[
      'int a[2][3] 是包含两行的数组，每一行的类型是 int[3]。这里 a 转换得到的是指向首行的指针，所以 row 的类型写成 int (*)[3]。',
      'row 前进一步会跨过一整行，也就是 3 个 int 元素的范围；不需要假设每个 int 的字节数。(*row)[1] 先选中当前行，再选这一行的第二个元素。',
      'int** 保存的是 int* 对象的地址。这个二维数组没有为每一行额外存放一个 int* 变量，因此不能把它直接赋给 int**。'
    ],
    pitfall:'括号不能省略：int (*row)[3] 是指向三元素数组的指针，而 int* row[3] 是三个 int* 组成的数组。R0、R1 代表行位置，不是固定字节地址。',
    practice:{question:'row 的类型为 int (*)[3]，执行 ++row 会移动到哪里？',options:['同一行的下一个 int 元素','下一行，也就是下一个 int[3] 对象','指针变量 row 自己的地址'],answer:1,explanation:'指针加一按其所指类型跨一步；这里所指类型是整行 int[3]。'},
    related:[{path:'structures/graphs/adjacency-matrix.html',title:'二维表与邻接矩阵'}],sources:[source('conv.array'),source('dcl.array'),source('expr.add')]
  },`int main() {
array|    int a[2][3] = {{1, 2, 3}, {4, 5, 6}};
row|    int (*row)[3] = a;
read|    int saved = (*row)[1];
advance|    ++row;
write|    (*row)[1] = 50;
blocked|    // int** bad = a; // 不允许：类型不匹配
}`,f=>{
    const cells=(rowAddress,saved=false,changed=false)=>[value('row0','a[0]：第一行','int[3]','R0',[1,2,3]),value('row1','a[1]：第二行','int[3]','R1',[4,changed?50:5,6]),...(rowAddress?[pointer('row','row','int (*)[3]','P0',rowAddress)]:[]),...(saved?[value('saved','saved','int','A0',2)]:[])];
    return [f('array','创建两行，每行各包含 3 个 int；行之间没有额外的行指针表。',cells()),f('row','row 指向第一行 R0，而不是指向一个 int* 变量。',cells('R0'),[link('row','row0')]),f('read','(*row)[1] 读取第一行的第二个元素，复制得到 saved = 2。',cells('R0',true),[link('row','row0')]),f('advance','row 按整行前进，指向第二行 R1。',cells('R1',true),[link('row','row1')]),f('write','改写第二行的第二个元素，第一行与 saved 都保持原值。',cells('R1',true,true),[link('row','row1')]),f('blocked','注释中的 int** 声明若去掉注释会类型不匹配；没有执行强制转换。',cells('R1',true,true),[link('row','row1')],{blocked:true})];
  }));

  lessons.push(lesson({
    id:'double-pointer',level:'advanced',title:'二级指针：指向指针变量',goal:'沿 pp → p → 对象的两步关系，区分 *pp 和 **pp。',
    explanation:[
      'p 的类型是 int*，所以 &p 的类型是 int**。pp 保存的是指针变量 p 自己的地址 P0；先沿 pp 找到 p，再沿 p 才能找到整数对象。',
      '*pp 代表 p 这个指针变量，因此 *pp = &y 会把 p 改向 y。**pp 则代表 p 当前指向的整数，因此给 **pp 赋值会写入 x 或 y。',
      '二级指针仍然只是存地址的变量，没有自动创建第二份整数。每多一层 *，都要确认这一层确实有相应类型且仍有效的目标。'
    ],
    pitfall:'pp = &p 与 pp = p 不是同一种类型的赋值。不要数箭头猜类型，应从目标对象的实际类型逐层读声明。',
    practice:{question:'pp 指向 p，执行 *pp = &y 后，哪一项被修改？',options:['p 保存的地址','pp 自己保存的地址','x 的整数值'],answer:0,explanation:'*pp 代表指针变量 p，所以这次赋值改变 p 的指向；pp 仍保存 &p。'},
    related:[{path:'structures/linear/singly-linked-list.html',title:'修改链表连接关系'}],sources:[source('dcl.ptr'),source('expr.unary.op')]
  },`int main() {
values|    int x = 3, y = 8;
p|    int* p = &x;
pp|    int** pp = &p;
writeX|    **pp = 5;
redirect|    *pp = &y;
writeY|    **pp = 9;
}`,f=>{
    const cells=(x,y,pAddress,pp=false)=>[value('x','x','int','A0',x),value('y','y','int','A1',y),...(pAddress?[pointer('p','p','int*','P0',pAddress)]:[]),...(pp?[pointer('pp','pp','int**','P1','P0')]:[])];
    return [f('values','创建两个独立整数对象。',cells(3,8)),f('p','p 保存 A0，指向 x。',cells(3,8,'A0'),[link('p','x')]),f('pp','pp 保存 P0，也就是 p 自己的地址。',cells(3,8,'A0',true),[link('pp','p'),link('p','x')]),f('writeX','沿两步关系找到 x，通过 **pp 将 x 改为 5。',cells(5,8,'A0',true),[link('pp','p'),link('p','x')]),f('redirect','*pp 就是 p；给它写入 A1，让 p 改为指向 y。',cells(5,8,'A1',true),[link('pp','p'),link('p','y')]),f('writeY','pp 仍指向 p，但第二步现在到达 y，所以 **pp 将 y 改为 9。',cells(5,9,'A1',true),[link('pp','p'),link('p','y')])];
  }));

  lessons.push(lesson({
    id:'linked-nodes',level:'advanced',title:'链表里的 -> 与 next',goal:'把成员访问与指针重新赋值放进真实节点关系中理解。',
    explanation:[
      '若 p 指向有效的 Node，p->value 可以理解为 (*p).value：先找到节点，再访问其中的成员。value 是整数成员，next 则是能够保存另一个节点地址的成员。',
      'p = p->next 先读取当前节点 next 中保存的地址，再把该地址写入 p。它不会移动节点，也不会改变节点内部已有的 next 连接。',
      '画面把 Node 对象和 next 成员单独放大显示。R0.next 只是成员位置的示意名字，并非真实字节偏移；箭头从 next 出发指向下一个完整节点。'
    ],
    pitfall:'p->next 是 next 成员保存的地址，&p->next 才是这个指针成员自己的地址。到达 nullptr 后不能继续 p->value 或 p->next。',
    practice:{question:'first.next 保存 R1，p 原先指向 first；执行 p = p->next 后，p 保存什么？',options:['R0.next：next 成员自己的地址','R0：first 节点的地址','R1：second 节点的地址'],answer:2,explanation:'成员访问读出 next 的值 R1，再将这个地址值赋给 p。'},
    related:[{path:'structures/linear/singly-linked-list.html',title:'单链表'},{path:'structures/linear/doubly-linked-list.html',title:'双向链表'}],sources:[source('expr.ref'),source('dcl.ptr')]
  },`struct Node { int value; Node* next; };
int main() {
second|    Node second{20, nullptr};
first|    Node first{10, &second};
p|    Node* p = &first;
write|    p->value = 11;
next|    p = p->next;
read|    int saved = p->value;
}`,f=>{
    const second=()=>[value('second','second（Node 对象）','Node','R1',['value = 20','next = nullptr']),pointer('secondNext','second.next（成员放大）','Node*','R1.next','nullptr')];
    const cells=(firstValue,pAddress,saved=false)=>[...second(),value('first','first（Node 对象）','Node','R0',['value = '+firstValue,'next = R1']),pointer('firstNext','first.next（成员放大）','Node*','R0.next','R1'),...(pAddress?[pointer('p','p','Node*','P0',pAddress)]:[]),...(saved?[value('saved','saved','int','A0',20)]:[])];
    return [f('second','先创建末尾节点 second，它的 next 为空。',second()),f('first','创建 first，把 second 的地址放进 first.next。',cells(10),[link('firstNext','second')]),f('p','p 指向整个 first 节点；next 成员仍保留原有连接。',cells(10,'R0'),[link('p','first'),link('firstNext','second')]),f('write','通过 p->value 修改 first 的整数成员，next 不受影响。',cells(11,'R0'),[link('p','first'),link('firstNext','second')]),f('next','读出 first.next 中的 R1，再让 p 改为指向 second。',cells(11,'R1'),[link('p','second'),link('firstNext','second')]),f('read','现在 p->value 来自 second，所以 saved 得到 20。',cells(11,'R1',true),[link('p','second'),link('firstNext','second')])];
  }));

  lessons.push(lesson({
    id:'dynamic-lifetime',level:'advanced',title:'new、delete 与悬空别名',goal:'区分指针变量还在与目标对象已经结束。',
    explanation:[
      'new int(7) 成功时创建一个动态存储期的整数对象，并把指向它的地址交给 p。把 p 复制给 q，只是多了一个能找到同一对象的普通指针，没有创建第二个整数。',
      'delete p 结束动态对象的生命周期并释放其存储。p、q 这两个局部指针变量仍存在，但它们原来保存的地址已不再指向可访问的对象，称为悬空状态。',
      '随后 p = nullptr 只清理 p，不会自动清理 q。本课对旧目标的读取只作为被拦截的注释说明，真正的代码不会访问已经释放的对象。'
    ],
    pitfall:'不能经悬空别名访问旧对象，也不能对同一对象重复 delete。new[] 应与 delete[] 配对，本课仅演示单个 int 的 new/delete。',
    practice:{question:'delete p 后把 p 设为 nullptr，原来复制过 p 的 q 会自动安全吗？',options:['会，q 也自动变为 nullptr','不会，q 仍须独立处理，不能访问已释放对象','会，q 自动获得一份新整数'],answer:1,explanation:'普通指针之间没有自动同步清空机制。对象释放后，旧别名不能继续当作有效目标使用。'},
    related:[{path:'structures/linear/dynamic-array.html',title:'扩容与存储替换'},{path:'structures/linear/singly-linked-list.html',title:'链表删除节点'}],sources:[source('expr.new'),source('expr.delete'),source('basic.life')]
  },`int main() {
allocate|    int* p = new int(7);
alias|    int* q = p;
release|    delete p;
clearP|    p = nullptr;
blocked|    // *q = 9; // 禁止：目标已释放，q 已悬空
clearQ|    q = nullptr;
}`,f=>{
    const heap=(freed=false)=>value('heap','动态 int 对象','int','H0',freed?'已释放，不可读取':7,freed?'freed':'live');
    return [f('allocate','new 成功后，p 保存动态对象的示意地址 H0。',[heap(),pointer('p','p','int*','P0','H0')],[link('p','heap')]),f('alias','q 复制同一个地址；只有一个动态 int 对象。',[heap(),pointer('p','p','int*','P0','H0'),pointer('q','q','int*','P1','H0')],[link('p','heap'),link('q','heap')]),f('release','目标已释放；红色关系是失效的旧指向，不表示还能访问对象。',[heap(true),pointer('p','p（悬空）','int*','P0','H0','dangling'),pointer('q','q（悬空）','int*','P1','H0','dangling')],[link('p','heap'),link('q','heap')]),f('clearP','给 p 写入 nullptr，不会连带改变另一个变量 q。',[heap(true),pointer('p','p','int*','P0','nullptr'),pointer('q','q（悬空）','int*','P1','H0','dangling')],[link('q','heap')]),f('blocked','错误访问在注释中被拦截，没有写入任何已释放内存。',[heap(true),pointer('p','p','int*','P0','nullptr'),pointer('q','q（悬空）','int*','P1','H0','dangling')],[link('q','heap')],{blocked:true}),f('clearQ','直接给 q 赋空值，不读取旧目标；两个指针现在都不再保存旧地址。',[heap(true),pointer('p','p','int*','P0','nullptr'),pointer('q','q','int*','P1','nullptr')])];
  }));

  lessons.push(lesson({
    id:'unique-ownership',level:'advanced',title:'unique_ptr、所有权与 RAII',goal:'把负责释放的所有者与不负责释放的普通观察指针分开。',
    explanation:[
      'std::unique_ptr 是管理独占所有权的标准库对象，不是另一种原生指针类型。这里由 make_unique 创建整数，owner 负责在适当时机释放它；observer 只是从 get() 得到的普通指针，不拥有它。',
      'unique_ptr 不能这样复制所有权，但可以通过 std::move 转移。转移后 moved 接手，owner 变为空；被管理的整数没有因此搬到另一个地址，仍存于示意位置 H0。',
      '本例先主动清空 observer，再离开内部作用域。moved 在作用域结束时析构，自动释放它仍拥有的对象，这就是把资源生命周期绑定到管理对象生命周期的 RAII 用法。'
    ],
    pitfall:'get() 返回的观察指针不会跟随所有者销毁而自动置空。不要对 get() 的结果手动 delete；不能把所有权转移误认为会复制目标对象或让两个 unique_ptr 共享所有权。',
    practice:{question:'执行 auto moved = std::move(owner) 后，本例的所有权在哪里？',options:['owner 仍是唯一所有者，moved 只是普通别名','moved 接手所有权，owner 为空','owner 与 moved 开始共享所有权'],answer:1,explanation:'这是独占所有权的移动构造；对象仍是原来那个，唯一所有者变为 moved。'},
    related:[{path:'structures/stl/index.html',title:'C++ 标准库专题'},{path:'structures/linear/dynamic-array.html',title:'存储与对象的生命周期'}],sources:[source('unique.ptr.single'),source('unique.ptr.single.ctor'),source('unique.ptr.single.dtor')]
  },`#include <memory>
#include <utility>
int main() {
    {
create|        auto owner = std::make_unique<int>(9);
observe|        int* observer = owner.get();
blocked|        // auto copy = owner; // 不允许复制 unique_ptr
move|        auto moved = std::move(owner);
write|        *moved = 12;
clear|        observer = nullptr;
end|    } // moved 析构，自动释放它拥有的对象
}`,f=>{
    const heap=(stored=9,status='live')=>value('heap','被管理的 int 对象','int','H0',stored,status);
    const owner=(stored='H0',status='live')=>pointer('owner','owner（独占所有者）','std::unique_ptr<int>','P0',stored,status);
    const observer=(stored='H0',status='live')=>pointer('observer','observer（无所有权）','int*','P1',stored,status);
    const moved=(stored='H0',status='live')=>pointer('moved','moved（独占所有者）','std::unique_ptr<int>','P2',stored,status);
    return [f('create','owner 接管一个值为 9 的动态 int 对象。',[heap(),owner()],[link('owner','heap')]),f('observe','observer 仅保存借用地址，不负责释放对象。',[heap(),owner(),observer()],[link('owner','heap'),link('observer','heap')]),f('blocked','复制 unique_ptr 的尝试保留在注释里；没有创建第二个所有者。',[heap(),owner(),observer()],[link('owner','heap'),link('observer','heap')],{blocked:true}),f('move','移动只转移所有权：owner 为空，moved 接管 H0；observer 仍观察同一个活对象。',[heap(),owner('nullptr'),observer(),moved()],[link('moved','heap'),link('observer','heap')]),f('write','经 moved 写入后，对象值变为 12。',[heap(12),owner('nullptr'),observer(),moved()],[link('moved','heap'),link('observer','heap')]),f('clear','在对象销毁前主动清空不拥有资源的 observer。',[heap(12),owner('nullptr'),observer('nullptr'),moved()],[link('moved','heap')]),f('end','内部作用域结束，moved 析构并释放对象；三个局部变量的生命周期也已结束。',[heap('已释放，不可读取','freed'),owner('作用域结束','ended'),observer('作用域结束','ended'),moved('对象已析构','ended')])];
  }));

  root.PointerCourse={
    levels:[
      {id:'beginner',title:'零基础',description:'从变量的位置与值开始，理解一个箭头到底表示什么。'},
      {id:'basic',title:'基础',description:'把指针放进数组、函数、const 与二维数组，建立类型和边界意识。'},
      {id:'advanced',title:'进阶',description:'理解多层连接、节点关系、对象生命周期和独占所有权。'}
    ],
    lessons
  };
})(typeof window==='undefined'?globalThis:window);
