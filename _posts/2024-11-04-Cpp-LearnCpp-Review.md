---
title: Review C++
description: 记录与回顾
date: 2024-07-16 00:00:00 +0800
categories: [Cpp, LearnCpp]
tags: [const, char, array]     # TAG names should always be lowercase
---

题目1：

```c++
#include <iostream>

using namespace std;

int main()
{
    char str1[] = "abc";
    char str2[] = "abc";
    const char str3[] = "abc";
    const char str4[] = "abc";
    const char *str5 = "abc";
    const char *str6 = "abc";

    printf("str1 addr: %p, str2 addr: %p\n", str1, str2);
    printf("str3 addr: %p, str4 addr: %p\n", str3, str4);
    printf("str5 addr: %p, str6 addr: %p\n", str5, str6);
    
    cout << (str1==str2) << endl;
    cout << (str3==str4) << endl;
    cout << (str5==str6) << endl;

    return 0;
}
```

解析：str1 和 str2 是声明定义的两个字符数组，数组名代表数组地址，也是数组第一个元素地址。

输出：

```console
str1 addr: 0x7ffcaf8a9418, str2 addr: 0x7ffcaf8a941c
str3 addr: 0x7ffcaf8a9420, str4 addr: 0x7ffcaf8a9424
str5 addr: 0x5642bfcad004, str6 addr: 0x5642bfcad004
0
0
1
```