(function(L){
  'use strict';
  L.competition={
    code:L.addLesson,
    trace:L.lessonTrace,
    tree(n=7){const g=L.graph(n);g.edges=[];for(let v=1;v<n;v++)g.edges.push({u:L.rand(0,v-1),v,w:1});return g;},
    geometry(points,edges=[],active=[]){
      const minX=Math.min(...points.map(p=>p[0]),0),maxX=Math.max(...points.map(p=>p[0]),1),minY=Math.min(...points.map(p=>p[1]),0),maxY=Math.max(...points.map(p=>p[1]),1);
      return {kind:'graph',nodes:points.map(([x,y],id)=>({id,label:String.fromCharCode(65+id),x:12+(x-minX)/Math.max(1,maxX-minX)*76,y:84-(y-minY)/Math.max(1,maxY-minY)*66,badge:'('+x+','+y+')'})),edges:edges.map(([u,v])=>({u,v})),active};
    },
    points(n=7){const points=[];while(points.length<n){const p=[L.rand(0,9),L.rand(0,9)];if(!points.some(q=>q[0]===p[0]&&q[1]===p[1]))points.push(p);}return points;}
  };
})(AlgoLab);
