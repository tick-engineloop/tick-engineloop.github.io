---
title: Review C++
description: 记录与回顾
date: 2024-07-16 00:00:00 +0800
categories: [Cpp, LearnCpp]
tags: [const, char, array]     # TAG names should always be lowercase
math: true
mermaid: true
---

## 题目1 字符数组和字符指针

```c++
#include <iostream>

using namespace std;

int main()
{
    char str1[] = "abc";
    char str2[] = "abc";
    const char str3[] = "abc";
    const char str4[] = "abc";
    char *str5 = "abc";
    char *str6 = "abc";
    const char *str7 = "abc";
    const char *str8 = "abc";

    printf("str1 addr: %p, str2 addr: %p\n", str1, str2);
    printf("str3 addr: %p, str4 addr: %p\n", str3, str4);
    printf("str5 addr: %p, str6 addr: %p\n", str5, str6);
    printf("str5 addr: %p, str6 addr: %p\n", str7, str8);
    
    cout << (str1 == str2) << endl;
    cout << (str3 == str4) << endl;
    cout << (str5 == str6) << endl;
    cout << (str7 == str8) << endl;

    return 0;
}
```

输出：

```console
str1 addr: 0x7ffc5cb57d08, str2 addr: 0x7ffc5cb57d0c
str3 addr: 0x7ffc5cb57d10, str4 addr: 0x7ffc5cb57d14
str5 addr: 0x555ea2fa3004, str6 addr: 0x555ea2fa3004
str5 addr: 0x555ea2fa3004, str6 addr: 0x555ea2fa3004
0
0
1
1
```

解析：数组名在某些情况下可看成指向数组首元素的指针。str1 和 str2 是声明定义的两个字符数组，虽然用相同的内容进行了初始化，但 str1 和 str2 是两个独立的不同地址的数组，`str1 == str2` 可以看作是比较两个数组首元素的指针，而不是判断数组内容是否相同，也不是判断数组第一个字符是否相同，所以判断结果为 0。str3 和 str4 是声明定义的两个常量字符数组，表示数组内容不可修改，同样是两个独立的不同地址的数组，`str3 == str4` 同样可以看作是比较两个数组首元素的指针，所以判断结果同样为 0。str5 和 str6 是指向 char 类型值的指针，`str5 == str6` 是比较两个指针变量中存放的地址，因为使用相同的 char 字符串值进行初始化，而这个值在内存中只有一份，所以 str5 和 str6 具有相同的地址，`str5 == str6` 的判断结果为 1。str7 和 str8 是指向 const char 类型字符串值的指针，`str7 == str8` 同样是比较两个指针变量中存放的地址，同样因为使用相同的 const char 字符串值进行初始化，而这个值在内存中只有一份，所以 str7 和 str8 具有相同的地址，`str7 == str8` 的判断结果为 1。`const char str3[] = "abc"; const char str4[] = "abc";` 中 const 是修饰赋值表达式左侧的数组，`const char *str7 = "abc"; const char *str8 = "abc";` 中 const 是修饰赋值表达式右侧的右值。从汇编指令角度看：

```asm
.LC0:
        .string "abc"
main:
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-36], 6513249             // 对应 char str1[] = "abc" 语句。字符串 "abc" 转换为十进制形式为 6513249
        mov     DWORD PTR [rbp-40], 6513249             // 对应 char str2[] = "abc" 语句
        mov     DWORD PTR [rbp-44], 6513249             // 对应 const char str3[] = "abc" 语句
        mov     DWORD PTR [rbp-48], 6513249             // 对应 const char str4[] = "abc" 语句
        mov     QWORD PTR [rbp-8], OFFSET FLAT:.LC0     // 对应 char *str5 = "abc" 语句
        mov     QWORD PTR [rbp-16], OFFSET FLAT:.LC0    // 对应 char *str6 = "abc" 语句
        mov     QWORD PTR [rbp-24], OFFSET FLAT:.LC0    // 对应 const char *str7 = "abc" 语句
        mov     QWORD PTR [rbp-32], OFFSET FLAT:.LC0    // 对应 const char *str8 = "abc" 语句
        mov     eax, 0
        pop     rbp
        ret
```

`char str[]` 和 `const char str[]` 使用立即数就可以初始化，而 `char *` 和 `const char *` 则需要使用地址进行初始化，就需要先给字符串分配内存地址，再把字符串地址传给字符指针。

## 题目2 联合体

```c++
#include <iostream>

union Var {
  int i;
  char x[2];
} a;

int main()
{
    a.x[0] = 12;  // a.x[0] 二进制表示: 00001100，十六进制表示: 0x0C
    a.x[1] = 1;   // a.x[1] 二进制表示: 00000001，十六进制表示: 0x01

    printf("%x", x.i);
    return 0;
}

```

输出为 `0x10C`。联合体内成员变量共享内存位置，联合体的大小是联合体内最大数据成员的大小。在本例中，联合体变量 a 的大小就是 int 的大小为 4 字节，因 a 被声明定义为全局变量，所以将存储在 BSS 段，其 4 个字节在程序启动时被操作系统初始化为 0。`a.x[0] = 12` 将 12 存储在 a 的 4 个字节空间的最低字节，`a.x[1] = 1` 将 1 存储在 a 的 4 个字节空间的次低字节，a 的 4 个字节空间中其他两个字节上为 0，所以 a 的四个字节上内容就为：

$$
\textcolor{red}{0000 \space 0000} \space \textcolor{cyan}{0000 \space 0000} \space \textcolor{blue}{0000 \space 0001} \space \textcolor{green}{0000 \space 1100} \\
$$

转换为十六进制为 `0x10C`。

## 题目3 地址和指针操作

```c++
#include <iostream>

int main() {
    int arrayName[5] = {1, 2, 3, 4, 5};
    printf("%p, %p, %p\n", arrayName, &arrayName[0], arrayName + 1);
    printf("%p, %p\n", &arrayName, (&arrayName + 1));
    
    int *ptr = (int*)(&arrayName + 1);
    printf("%d, %d", *(arrayName + 1), *(ptr - 1));
}
```

输出：

```console
0x7ffd5f6fe9f0, 0x7ffd5f6fe9f0, 0x7ffd5f6fe9f4
0x7ffd5f6fe9f0, 0x7ffd5f6fea04
2, 5
```

解析：数组名在某些情况下可看成指向数组首元素的指针，如像 `arrayName + 1` 这样对数组名直接做加减算数运算、像 `int* arrPtr = arrayName;` 这样使用数组名直接初始化指针变量、像 `arrayName1 == arrayName2` 这样直接用两个数组名进行比较时。在一些情况下又代表数组整体，如像 `arrayName[0]` 这样使用下标运算符进行数组元素索引、像 `sizeof(arrayName)` 这样使用 sizeof 获取数组存储空间大小、像 `&arrayName` 这样对数组名使用地址运算符时。在 `arrayName + 1` 这样的语境中，数组名 `arrayName` 代表数组首元素的指针，`arrayName + 1` 可以看作是给数组首元素的指针加一，结果指向了数组内的第二个元素。在 `&arrayName + 1` 这样的语境中，数组名 `arrayName` 代表数组整体，`&arrayName` 是取数组整体的地址，`&arrayName + 1` 可以看作是在数组整体起始地址的基础上向后偏移整个数组的大小。

## 题目4 父子类转换

```c++
#include <iostream>

class A
{
    int m_a;
};

class B
{
    int m_b;
};

class C : public A, public B
{
    int m_c;
};

int main()
{
    C* pC = new C;
    B* pB = static_cast<B*>(pC);
    A* pA = static_cast<A*>(pC);

    std::cout << "Address of pC: " << pC << std::endl;
    std::cout << "Address of pB: " << pB << std::endl;
    std::cout << "Address of pA: " << pA << std::endl;

    std::cout << ((int)pB == (int)pC) << std::endl;
    std::cout << ((int)pA == (int)pC) << std::endl;
}
```

输出：

```
Address of pC: 0x55b8bd26beb0
Address of pB: 0x55b8bd26beb4
Address of pA: 0x55b8bd26beb0
0
1
```

解析：类 C 同时继承自类 A 和 类 B，属于多重继承的情况。这种继承结构中，不同基类子对象在内存中的位置是不同的，因此指针之间的转换会导致不同的地址。因为 C 继承了 A 和 B，且在继承关系中 A 排在 B 前，所以 C 的内存布局如下：

```
   类 C
   +———————————————————————————————+
   | | A 部分 || B 部分 || C 部分 | |
   +———————————————————————————————+
     ^        ^
     |        |
     pA       pB
     pC
```

pC 是指向 C 类对象的指针。pB 是通过 `static_cast<B*>` 从 pC 转换而来的指针，因为 B 是 C 的一个基类，所以 pB 指向的是 C 对象中 B 部分的起始地址，这个地址通常与 pC 是不同的。pA 是通过 `static_cast<A*>` 从 pC 转换而来的指针，因为 A 是 C 的另一个基类，所以 pA 指向的是 C 对象中 A 部分的起始地址，这个地址与 pC 可能相同，因为 A 是 C 对象的第一个基类子对象。


