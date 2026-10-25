const code=String.raw`#include <iostream>
void solve() {
    int cash = 0;
    int bank = 0;
    for (int month = 1; month <= 12; month++) {
        int e;
        std::cin >> e;
        cash += 300 - e;
        if (cash < 0) {
            std::cout << -month << "\n";
            return;
        }
        bank += cash / 100 * 100;
        cash %= 100;
    }
    std::cout << cash + bank / 100 * 120 << "\n";
}

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    solve();
    return 0;
}`;
module.exports={code,cases:[
  ['290 230 280 200 300 170 340 50 90 80 200 60','-7\n'],
  ['290 230 280 200 300 170 330 50 90 80 200 60','1580\n'],
  [Array(12).fill(0).join(' '),'4320\n'],
  ['301','-1\n']
]};
