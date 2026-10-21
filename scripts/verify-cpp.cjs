const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..','dist'),context=vm.createContext({console});
for(const file of ['assets/js/core.js','assets/js/catalog.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const L=context.AlgoLab;
// The original 65 fixtures stay here; new lessons use verify-competition-native.cjs.
const originalItems=L.items.filter(item=>!L.foundationIds.includes(item.id));
for(const group of L.groups)vm.runInContext(fs.readFileSync(path.join(root,group.section,group.id,group.id+'.js'),'utf8'),context);
const ns=id=>'n_'+id.replaceAll('-','_');
let source='#include <bits/stdc++.h>\nusing namespace std;\n';
for(const item of originalItems)source+=`namespace ${ns(item.id)} {\n${L.builders[item.id]().code.join('\n')}\n}\n`;
source+=String.raw`
int main() {
  vector<int> input={8,2,8,1,5,3};
  vector<int> sorted=input; sort(sorted.begin(),sorted.end());
  {auto a=input; n_bubble_sort::bubbleSort(a); assert(a==sorted);}
  {auto a=input; n_selection_sort::selectionSort(a); assert(a==sorted);}
  {auto a=input; n_insertion_sort::insertionSort(a); assert(a==sorted);}
  {auto a=input; n_merge_sort::mergeSort(a,0,(int)a.size()-1); assert(a==sorted);}
  {auto a=input; n_quick_sort::quickSort(a,0,(int)a.size()-1); assert(a==sorted);}
  {auto a=input; n_heap_sort::heapSort(a); assert(a==sorted);}
  {auto a=input; n_counting_sort::countingSort(a); assert(a==sorted);}
  assert(n_binary_search::binarySearch(sorted,5)==3);
  assert(n_linear_search::linearSearch(input,5)==4);
  assert(n_lower_bound::lowerBound(sorted,8)==4);
  assert(n_upper_bound::upperBound(sorted,8)==6);
  assert(n_naive_match::findPattern("ABABABAC","ABAC")==4);
  assert(n_kmp::kmp("ABABABAC","ABAC")==4);
  assert(n_rolling_hash::rollingHash("ABABABAC","ABAC")==4);
  assert(n_gcd::gcd(84,30)==6);
  assert(n_fast_power::power(3,13,97)==31);
  assert(n_sieve::sieve(10)==vector<int>({2,3,5,7}));
  assert(n_prefix_sum::rangeSum({1,2,3,4,5},1,3)==9);
  assert(n_difference::rangeAdd({1,2,3,4,5},1,3,2)==vector<int>({1,4,5,6,5}));
  assert(n_two_pointers::pairSum({1,2,3,4,5},6)==make_pair(0,4));
  assert(n_sliding_window::maxWindowSum({1,2,3,4,5},3)==12);
  assert(n_recurrence::fibonacci(10)==55);
  assert(n_knapsack::knapsack({2,3,4},{4,5,7},6)==11);
  assert(n_lis::lis({3,1,2,2,5})==3);
  assert(n_lcs::lcs("ABCBDAB","BDCABA")==4);
  assert(n_interval_dp::mergeStones({1,2,3,4})==19);
  assert(n_interval_scheduling::selectIntervals({{0,2},{1,4},{2,5},{5,7}})==3);
  assert(n_interval_cover::cover({{0,3},{2,7},{6,10}},10)==3);
  assert(n_optimal_merge::optimalMerge({1,2,3,4})==19);
  {vector<int> col(4,-1); vector<vector<int>> solutions; n_n_queens::queens(0,col,solutions); assert(solutions.size()==2);}
  {vector<int> a={1,2,3},p; vector<bool> used(3); vector<vector<int>> result; n_permutations::permute(a,used,p,result); assert(result.size()==6);}
  assert(n_maze::maze({{0,0},{1,0}}).size()==3);
  assert(n_bfs::bfs({{1,2},{0,2},{0,1}},0)==vector<int>({0,1,2}));
  {vector<bool> seen(3); vector<int> order; n_dfs::dfs(0,{{1,2},{0,2},{0,1}},seen,order); assert(order==vector<int>({0,1,2}));}
  assert(n_dijkstra::dijkstra({{{1,3},{2,1}},{{0,3},{2,1},{3,2}},{{0,1},{1,1},{3,6}},{{1,2},{2,6}}},0)==vector<int>({0,2,1,4}));
  assert(n_bellman_ford::bellmanFord(3,{{0,1,2},{1,2,-1}},0).second==vector<int>({0,2,1}));
  assert(n_floyd::floyd(3,{{0,1,2},{1,2,3}},true)[0][2]==5);
  assert(n_topological_sort::topologicalSort({{1},{2},{}})==vector<int>({0,1,2}));
  assert(n_prim::prim({{{1,3},{2,1}},{{0,3},{2,1},{3,2}},{{0,1},{1,1},{3,6}},{{1,2},{2,6}}})==4);
  assert(n_kruskal::kruskal(4,{{3,0,1},{1,0,2},{1,2,1},{2,1,3},{6,2,3}})==4);
  {vector<int> a={1,2,3}; n_array::editArray(a,1,9,2); assert(a==vector<int>({1,9,3}));}
  {auto p=n_singly_linked_list::demo({1,2,3},1,9); assert(p->value==1 && p->next->value==9 && p->next->next->value==3);}
  {auto p=n_doubly_linked_list::demo({1,2,3},1,9); assert(p->prev==nullptr && p->next->prev==p);}
  assert(n_circular_linked_list::josephus({1,2,3,4,5},2)==3);
  assert(n_stack::demo({{1,3},{1,7},{0,0},{0,0},{0,0}})==vector<int>({7,3}));
  assert(n_queue::demo({{1,3},{1,7},{0,0},{0,0},{0,0}})==vector<int>({3,7}));
  assert(n_deque::demo({{0,3},{1,7},{2,0},{3,0}})==vector<int>({3,7}));
  assert(n_circular_queue::demo({{1,3},{1,7},{0,0},{0,0}})==vector<int>({3,7}));
  assert(n_hash_chaining::chaining({1,8,15},15));
  assert(n_hash_probing::probing({1,12,23},23));
  assert(n_binary_tree::build({1,2,3},0)->right->value==3);
  assert(n_bst::demo({3,1,4,2},2));
  {auto p=n_avl::demo({30,10,20}); assert(p->value==20 && p->height==2);}
  assert(n_trie::trieDemo({"CAT","CAR"},"CAR"));
  {auto a=n_max_heap::demo({3,1,7,2},9); for(int i=1;i<(int)a.size();i++)assert(a[(i-1)/2]>=a[i]);}
  {auto a=n_min_heap::demo({3,1,7,2},0); for(int i=1;i<(int)a.size();i++)assert(a[(i-1)/2]<=a[i]);}
  assert(n_adjacency_matrix::build(3,{{0,1},{1,2}})[1][2]==1);
  assert(n_adjacency_list::build(3,{{0,1},{1,2}})[1]==vector<int>({0,2}));
  assert(n_disjoint_set::demo(4,{{0,1},{1,2}},0)==2);
  assert(n_fenwick::demo({1,2,3,4,5},3,4,4)==14);
  assert(n_segment_tree::demo({1,2,3,4,5,6},2,10,1,4)==21);
  cout << "C++ teaching snippets compiled and runtime examples passed." << endl;
}
`;
const dir=path.resolve(__dirname,'..','artifacts');fs.mkdirSync(dir,{recursive:true});
const cpp=path.join(dir,'teaching-code.cpp'),exe=path.join(dir,'teaching-code.exe');fs.writeFileSync(cpp,source);
const compiled=spawnSync('g++',['-std=c++17','-O0','-finput-charset=UTF-8','teaching-code.cpp','-o','teaching-code.exe'],{cwd:dir,encoding:'utf8',timeout:60000});
if(compiled.status!==0){console.error(compiled.stderr||compiled.error);process.exit(1);}
const result=spawnSync(exe,[],{encoding:'utf8',timeout:10000});console.log(result.stdout);if(result.status!==0){console.error(result.stderr||result.error);process.exit(1);}
