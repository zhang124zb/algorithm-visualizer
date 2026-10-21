(function(L,C){
  L.register('win-lose',(o={})=>{
    const n=o.n??L.rand(9,18),win=Array(n+1).fill(false),t=C.trace('win-lose',{n,moves:[1,2,3],rule:'取到最后一颗获胜'},L.array([])),s=(l,msg,v={},active=[])=>t.step(l,msg,{n,...v},L.array(win.map(x=>x?'胜':'负'),active,{caption:'正常玩法：无合法操作为负态；每次可以取 1、2 或 3 颗'}));
    s('init','0 颗石子时当前玩家无法操作，是负态。');for(let i=1;i<=n;i++){s('state','按石子数由少到多判断。',{i},[i]);for(let take=1;take<=3;take++){s('move','枚举可以取走的数量。',{i,take});s('test','只要能走到一个负态，当前状态就是胜态。',{i,take},[i,i-take].filter(x=>x>=0));if(i>=take&&!win[i-take]){win[i]=true;s('win','找到一步把对手送入负态的选择。',{i,take},[i]);break;}}}s('return',win[n]?'双方都采取最优策略时，先手必胜。':'双方都采取最优策略时，先手必败。',{result:win[n]},[n]);return t.done(win[n]);
  });
  L.register('nim',(o={})=>{
    const piles=o.values?.slice()||L.numbers(5,1,12);let value=0;const t=C.trace('nim',{piles,rule:'普通 Nim：每次从一堆拿至少一颗，拿到最后一颗获胜'},L.array(piles)),s=(l,msg,v={},active=[])=>t.step(l,msg,{xor:value,...v},L.array(piles,active));
    s('init','普通 Nim 使用所有石堆数量的异或值。');for(let i=0;i<piles.length;i++){value^=piles[i];s('xor','将这一堆与累计结果异或。',{i,x:piles[i]},[i]);}s('lose','异或为 0 是败态。');if(!value)return t.done([-1,-1],'当前为败态，没有保证获胜的一步。');for(let i=0;i<piles.length;i++){s('loop','寻找可以减少的一堆。',{i},[i]);const target=piles[i]^value;s('target','试着把这一堆变为 piles[i] XOR value。',{i,target},[i]);s('move','目标更小时可以合法操作，操作后所有堆异或变成 0。',{i,target},[i]);if(target<piles[i])return t.done([i,target],'把第 '+i+' 堆减少到 '+target+'，即可进入对手的败态。');}s('return','未找到合法制胜操作。');return t.done([-1,-1]);
  });
})(AlgoLab,AlgoLab.competition);
