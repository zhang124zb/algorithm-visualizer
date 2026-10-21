(function(L){
  'use strict';
  L.addCode('linear-search',`def linear_search(a, target):
loop|    for i in range(len(a)):
compare|        if a[i] == target:
found|            return i
missing|    return -1`,
`static int linearSearch(int[] a, int target) {
loop|    for (int i = 0; i < a.length; i++) {
compare|        if (a[i] == target) {
found|            return i;
        }
    }
missing|    return -1;
}`);
  for(const id of ['binary-search','lower-bound','upper-bound']){
    const binary=id==='binary-search',upper=id==='upper-bound',name=binary?'binary_search':upper?'upper_bound':'lower_bound',javaName=binary?'binarySearch':upper?'upperBound':'lowerBound';
    L.addCode(id,`def ${name}(a, target):
init|    left, right = 0, len(a)${binary?' - 1':''}
loop|    while left ${binary?'<=':'<'} right:
mid|        mid = left + (right - left) // 2
${binary?`equal|        if a[mid] == target:
found|            return mid
`:''}compare|        if a[mid] ${upper?'<=':'<'} target:
left|            left = mid + 1
        else:
right|            right = mid${binary?' - 1':''}
${binary?'missing|    return -1':'found|    return left'}`,
`static int ${javaName}(int[] a, int target) {
init|    int left = 0, right = a.length${binary?' - 1':''};
loop|    while (left ${binary?'<=':'<'} right) {
mid|        int mid = left + (right - left) / 2;
${binary?`equal|        if (a[mid] == target) {
found|            return mid;
        }
`:''}compare|        if (a[mid] ${upper?'<=':'<'} target) {
left|            left = mid + 1;
        } else {
right|            right = mid${binary?' - 1':''};
        }
    }
${binary?'missing|    return -1;':'found|    return left;'}
}`);
  }
})(AlgoLab);
