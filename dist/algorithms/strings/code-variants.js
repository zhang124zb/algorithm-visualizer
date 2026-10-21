(function(L){
  'use strict';
  L.addCode('naive-match',`def find_pattern(text, pattern):
outer|    for i in range(len(text) - len(pattern) + 1):
init|        j = 0
loop|        while j < len(pattern) and text[i + j] == pattern[j]:
advance|            j += 1
found|        if j == len(pattern): return i
missing|    return -1`,
`static int findPattern(String text, String pattern) {
outer|    for (int i = 0; i + pattern.length() <= text.length(); i++) {
init|        int j = 0;
loop|        while (j < pattern.length() && text.charAt(i + j) == pattern.charAt(j)) {
advance|            j++;
        }
found|        if (j == pattern.length()) return i;
    }
missing|    return -1;
}`);
  L.addCode('kmp',`def kmp(text, pattern):
empty|    if not pattern: return 0
init|    pi = [0] * len(pattern)
    j = 0
prefix|    for i in range(1, len(pattern)):
fallback|        while j > 0 and pattern[i] != pattern[j]: j = pi[j - 1]
equal|        if pattern[i] == pattern[j]: j += 1
save|        pi[i] = j
    j = 0
search|    for i in range(len(text)):
back|        while j > 0 and text[i] != pattern[j]: j = pi[j - 1]
match|        if text[i] == pattern[j]: j += 1
found|        if j == len(pattern): return i - j + 1
missing|    return -1`,
`static int kmp(String text, String pattern) {
empty|    if (pattern.isEmpty()) return 0;
init|    int[] pi = new int[pattern.length()];
prefix|    for (int i = 1, j = 0; i < pattern.length(); i++) {
fallback|        while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) j = pi[j - 1];
equal|        if (pattern.charAt(i) == pattern.charAt(j)) j++;
save|        pi[i] = j;
    }
search|    for (int i = 0, j = 0; i < text.length(); i++) {
back|        while (j > 0 && text.charAt(i) != pattern.charAt(j)) j = pi[j - 1];
match|        if (text.charAt(i) == pattern.charAt(j)) j++;
found|        if (j == pattern.length()) return i - j + 1;
    }
missing|    return -1;
}`);
  L.addCode('rolling-hash',`def rolling_hash(text, pattern):
size|    n, m = len(text), len(pattern)
empty|    if m == 0: return 0
long|    if m > n: return -1
init|    target, hash_value, power = 0, 0, 1
build|    for j in range(m):
pattern|        target = (target * 31 + ord(pattern[j])) % 101
text|        hash_value = (hash_value * 31 + ord(text[j])) % 101
power|        if j + 1 < m: power = power * 31 % 101
loop|    for i in range(n - m + 1):
test|        if hash_value == target and text[i:i + m] == pattern: return i
slide|        if i + m < n:
remove|            hash_value = (hash_value - ord(text[i]) * power % 101 + 101) % 101
add|            hash_value = (hash_value * 31 + ord(text[i + m])) % 101
missing|    return -1`,
`static int rollingHash(String text, String pattern) {
size|    int n = text.length(), m = pattern.length();
empty|    if (m == 0) return 0;
long|    if (m > n) return -1;
init|    long target = 0, hash = 0, power = 1;
build|    for (int j = 0; j < m; j++) {
pattern|        target = (target * 31 + pattern.charAt(j)) % 101;
text|        hash = (hash * 31 + text.charAt(j)) % 101;
power|        if (j + 1 < m) power = power * 31 % 101;
    }
loop|    for (int i = 0; i + m <= n; i++) {
test|        if (hash == target && text.regionMatches(i, pattern, 0, m)) return i;
slide|        if (i + m < n) {
remove|            hash = (hash - text.charAt(i) * power % 101 + 101) % 101;
add|            hash = (hash * 31 + text.charAt(i + m)) % 101;
        }
    }
missing|    return -1;
}`);
})(AlgoLab);

(function(L){
  L.addLesson('string-count',`vector<int> stringCount(string text) {
init|    vector<int> counts(26, 0);
loop|    for (int i = 0; i < (int)text.size(); ++i) {
index|        int index = text[i] - 'a';
add|        ++counts[index];
    }
return|    return counts;
}`,`def string_count(text):
init|    counts = [0] * 26
loop|    for i in range(len(text)):
index|        index = ord(text[i]) - ord('a')
add|        counts[index] += 1
return|    return counts`,`static int[] stringCount(String text) {
init|    int[] counts = new int[26];
loop|    for (int i = 0; i < text.length(); ++i) {
index|        int index = text.charAt(i) - 'a';
add|        ++counts[index];
    }
return|    return counts;
}`);
  L.addLesson('string-compare',`int stringCompare(string a, string b) {
init|    int i = 0;
loop|    while (i < (int)a.size() && i < (int)b.size()) {
less|        if (a[i] < b[i]) {
smaller|            return -1;
        }
greater|        if (a[i] > b[i]) {
larger|            return 1;
        }
advance|        ++i;
    }
shorter|    if (a.size() < b.size()) {
shortResult|        return -1;
    }
longer|    if (a.size() > b.size()) {
longResult|        return 1;
    }
equal|    return 0;
}`,`def string_compare(a, b):
init|    i = 0
loop|    while i < len(a) and i < len(b):
less|        if a[i] < b[i]:
smaller|            return -1
greater|        if a[i] > b[i]:
larger|            return 1
advance|        i += 1
shorter|    if len(a) < len(b):
shortResult|        return -1
longer|    if len(a) > len(b):
longResult|        return 1
equal|    return 0`,`static int stringCompare(String a, String b) {
init|    int i = 0;
loop|    while (i < a.length() && i < b.length()) {
less|        if (a.charAt(i) < b.charAt(i)) {
smaller|            return -1;
        }
greater|        if (a.charAt(i) > b.charAt(i)) {
larger|            return 1;
        }
advance|        ++i;
    }
shorter|    if (a.length() < b.length()) {
shortResult|        return -1;
    }
longer|    if (a.length() > b.length()) {
longResult|        return 1;
    }
equal|    return 0;
}`);
})(AlgoLab);
