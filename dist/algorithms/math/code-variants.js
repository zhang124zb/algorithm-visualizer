(function(L){
  'use strict';
  L.addCode('gcd',`def gcd(a, b):
loop|    while b != 0:
remainder|        r = a % b
move|        a = b
next|        b = r
result|    return a`,
`static int gcd(int a, int b) {
loop|    while (b != 0) {
remainder|        int r = a % b;
move|        a = b;
next|        b = r;
    }
result|    return a;
}`);
  L.addCode('fast-power',`def power(a, n, mod):
init|    result = 1
loop|    while n > 0:
odd|        if n & 1:
multiply|            result = result * a % mod
square|        a = a * a % mod
half|        n >>= 1
return|    return result`,
`static long power(long a, int n, int mod) {
init|    long result = 1;
loop|    while (n > 0) {
odd|        if ((n & 1) != 0) {
multiply|            result = result * a % mod;
        }
square|        a = a * a % mod;
half|        n >>= 1;
    }
return|    return result;
}`);
  L.addCode('sieve',`def sieve(n):
init|    prime = [True] * (n + 1)
zero|    prime[0] = False
one|    if n >= 1: prime[1] = False
outer|    for p in range(2, int(n ** 0.5) + 1):
test|        if not prime[p]: continue
inner|        for x in range(p * p, n + 1, p):
mark|            prime[x] = False
list|    answer = []
collect|    for x in range(2, n + 1):
push|        if prime[x]: answer.append(x)
return|    return answer`,
`static List<Integer> sieve(int n) {
init|    boolean[] prime = new boolean[n + 1]; Arrays.fill(prime, true);
zero|    prime[0] = false;
one|    if (n >= 1) prime[1] = false;
outer|    for (int p = 2; p * p <= n; p++) {
test|        if (!prime[p]) continue;
inner|        for (int x = p * p; x <= n; x += p) {
mark|            prime[x] = false;
        }
    }
list|    List<Integer> answer = new ArrayList<>();
collect|    for (int x = 2; x <= n; x++) {
push|        if (prime[x]) answer.add(x);
    }
return|    return answer;
}`);
})(AlgoLab);

(function(L){
  L.addLesson('lcm',`long long leastCommonMultiple(long long a, long long b) {
zero|    if (a == 0 || b == 0) {
zeroResult|        return 0;
    }
copy|    long long x = a, y = b;
loop|    while (y != 0) {
remainder|        long long r = x % y;
move|        x = y;
next|        y = r;
    }
calculate|    long long result = (a / x) * b;
return|    return result;
}`,`def least_common_multiple(a, b):
zero|    if a == 0 or b == 0:
zeroResult|        return 0
copy|    x, y = a, b
loop|    while y != 0:
remainder|        r = x % y
move|        x = y
next|        y = r
calculate|    result = (a // x) * b
return|    return result`,`static long leastCommonMultiple(long a, long b) {
zero|    if (a == 0 || b == 0) {
zeroResult|        return 0;
    }
copy|    long x = a, y = b;
loop|    while (y != 0) {
remainder|        long r = x % y;
move|        x = y;
next|        y = r;
    }
calculate|    long result = (a / x) * b;
return|    return result;
}`);
  L.addLesson('mod-arithmetic',`vector<long long> modArithmetic(long long a, long long b, long long modulus) {
normalizeA|    long long x = ((a % modulus) + modulus) % modulus;
normalizeB|    long long y = ((b % modulus) + modulus) % modulus;
add|    long long add = (x + y) % modulus;
subtract|    long long subtract = (x - y + modulus) % modulus;
multiply|    long long multiply = (x * y) % modulus;
return|    return {add, subtract, multiply};
}`,`def mod_arithmetic(a, b, modulus):
normalizeA|    x = ((a % modulus) + modulus) % modulus
normalizeB|    y = ((b % modulus) + modulus) % modulus
add|    add = (x + y) % modulus
subtract|    subtract = (x - y + modulus) % modulus
multiply|    multiply = (x * y) % modulus
return|    return [add, subtract, multiply]`,`static long[] modArithmetic(long a, long b, long modulus) {
normalizeA|    long x = ((a % modulus) + modulus) % modulus;
normalizeB|    long y = ((b % modulus) + modulus) % modulus;
add|    long add = (x + y) % modulus;
subtract|    long subtract = (x - y + modulus) % modulus;
multiply|    long multiply = (x * y) % modulus;
return|    return new long[]{add, subtract, multiply};
}`);
})(AlgoLab);
