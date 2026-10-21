(function(L,C){
  L.register('z-function',(o={})=>{
    const text=o.text??L.shuffle(['ABABABAC','AAAAABAAA','AABAACAAB'])[0],z=Array(text.length).fill(0);let l=0,r=0;
    const t=C.trace('z-function',{text},L.array(z)),s=(line,msg,v={},active=[])=>t.step(line,msg,{l,r,z,...v},L.array(z,active,{labels:[...text].map((c,i)=>c+'·'+i),caption:'z[i]：从 i 开始的后缀与原串前缀相同的最长长度；约定 z[0]=0'}));
    s('init','维护匹配区间 [l,r)，初始为空。');for(let i=1;i<text.length;i++){s('loop','处理下一个后缀。',{i},[i]);if(i<r)z[i]=Math.min(r-i,z[i-l]);s('reuse','若在已知区间内，复用镜像前缀信息，但不能超过右端点。',{i},[i]);while(i+z[i]<text.length&&text[z[i]]===text[i+z[i]]){z[i]++;s('expand','继续比较超出已知范围的字符。',{i},[i]);}s('expand','扩展在不同字符或字符串末尾停止。',{i},[i]);if(i+z[i]>r){l=i;r=i+z[i];}s('box','如果到达更右的位置，就更新匹配区间。',{i},[i]);}s('return','完成全部后缀的前缀匹配长度。');return t.done(z);
  });
  L.register('manacher',(o={})=>{
    const text=o.text??L.shuffle(['ABACABA','ABBAAB','ABCBAAA'])[0],n=text.length,odd=Array(n).fill(0),even=Array(n).fill(0);let answer=0,l=0,r=-1;
    const t=C.trace('manacher',{text},L.array(odd)),s=(line,msg,v={},active=[])=>t.step(line,msg,{l,r,answer,...v},L.array([...text],active,{range:[l,r],aux:[{label:'奇数半径（含中心）',values:odd},{label:'偶数半径（中心位于 i-1 与 i 之间）',values:even}]}));
    s('init','分别记录奇数和偶数回文半径，维护最右回文区间。');for(let i=0;i<n;i++){s('oddLoop','以一个字符为中心。',{i},[i]);let k=i>r?1:Math.min(odd[l+r-i],r-i+1);s('oddSeed','利用对称中心复用半径，边界外从 1 开始。',{i,k});while(i-k>=0&&i+k<n&&text[i-k]===text[i+k]){k++;s('oddExpand','两侧字符相同，继续扩展。',{i,k},[i-k+1,i+k-1]);}s('oddExpand','奇数回文扩展结束。',{i,k});odd[i]=k;answer=Math.max(answer,2*k-1);s('oddSave','保存半径并更新最长长度。',{i,k});if(i+k-1>r){l=i-k+1;r=i+k-1;}s('oddBox','更新最右覆盖的奇数回文区间。',{i,k});}l=0;r=-1;s('reset','偶数回文重新维护边界。');for(let i=0;i<n;i++){s('evenLoop','以字符间隙为中心。',{i},[i]);let k=i>r?0:Math.min(even[l+r-i+1],r-i+1);s('evenSeed','偶数回文起始半径为 0，镜像位置偏移一格。',{i,k});while(i-k-1>=0&&i+k<n&&text[i-k-1]===text[i+k]){k++;s('evenExpand','比较间隙两侧对称的字符。',{i,k},[i-k,i+k-1]);}s('evenExpand','偶数回文扩展结束。',{i,k});even[i]=k;answer=Math.max(answer,2*k);s('evenSave','保存偶数半径并更新最长长度。',{i,k});if(i+k-1>r){l=i-k;r=i+k-1;}s('evenBox','更新最右覆盖的偶数回文区间。',{i,k});}s('return','返回奇数与偶数回文中最大的长度。');return t.done(answer);
  });
})(AlgoLab,AlgoLab.competition);
