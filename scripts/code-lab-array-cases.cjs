module.exports={
  two:`int main() {
    int a[3] = {1, 2, 3};
    int b[3] = {0};
    b[0] = a[0] + 5;
    b[1] = a[1] + 5;
    return 0;
}`,
  three:`int main() {
    int a[3] = {1, 2, 3};
    int b[3] = {0};
    int c[3] = {0};
    b[0] = a[0] + 5;
    c[0] = b[0] + 7;
    return 0;
}`,
  many:`int main() {
    int unused[2] = {9, 9};
    int a[2] = {1, 2};
    int b[2] = {0};
    int c[2] = {0};
    int d[2] = {0};
    for (int i = 0; i < 2; i++) {
        b[i] = a[i] * 2;
        c[i] = b[i] + 1;
        d[i] = c[i] + a[i];
    }
    // unused[0] is mentioned only in this comment.
    return 0;
}`,
  mixed:`int main() {
    int matrix[2][2];
    int values[2] = {4, 8};
    matrix[0][0] = values[0];
    matrix[0][1] = values[1];
    matrix[1][0] = 12;
    matrix[1][1] = 16;
    return 0;
}`,
  shadow:`int main() {
    int a[2] = {1, 2};
    {
        int a[3] = {3, 4, 5};
        a[0] = 8;
    }
    a[1] = 9;
    return 0;
}`,
  scope:`int main() {
    int base[2] = {1, 2};
    {
        int scratch[2] = {4, 5};
        base[0] = scratch[1];
    }
    base[1] = 9;
    return 0;
}`
};
