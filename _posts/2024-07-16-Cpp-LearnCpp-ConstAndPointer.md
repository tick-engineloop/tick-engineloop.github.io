---
title: const And pointer
description: 正确区分"指向 const 的指针"与"const 指针"
date: 2024-07-16 00:00:00 +0800
categories: [Cpp, LearnCpp]
tags: [const, pointer]     # TAG names should always be lowercase
---

## 引言

当 const 伴随指针使用时，有两种形式：const 修饰指针正指向的变量，或者 const 修饰在指针里存储的地址。这两种书写形式非常相近，会使人经常容易混淆。

## 指向 const 的指针

const 修饰变量类型名称时，可以在类型名称的前面，也可以在类型名称的后面，所以下面的定义均是可以的：

```c++
const int i = 1;
int const ii = 2;
```

进而，在指向 const 的指针声明定义中，也会出现两种书写形式。如下面的声明均指的是指针 p 指向一个 const int 类型的变量：

```c++
const int* p;
int const* pp;
```

这两种书写形式 const 均在指针声明符左侧，因此，可以得到这样的结论：const 在指针声明符左侧时，其修饰的是指针指向的变量。

## const 指针

要使指针本身成为一个 const 指针，就必须把 const 放在指针声明符的右边，如：

```c++
int i = 1;
int* const p = &i;
```

这定义了一个常量指针 p，其指向 int 类型变量 i。常量指针 p 里存储的地址值是不可改变的，指向的变量 i 中的值是可以改变的。p 固定指向 i，且这种指向关系不可改变。换句话说就是，常量指针固定指向其初始化时使用的变量。

## 指向 const 对象的 const 指针

结合上述两种情况，我们还可以把一个 const 指针指向一个 const 对象：

```c++
int i = 1;
const int* const p = &i;
int const* const pp = &i;
```

这定义了一个常量指针 p 和 pp，他们均指向一个整型常量。这里，因为 i 在定义时未使用 const 修饰，所以当使用指针 p 和 pp 访问变量 i 时，i 的值不可改变，但直接使用变量名称 i 时，其值是可以改变的。

## 总结

在指针声明符左侧的 const 修饰的是指针指向的变量，在指针声明符右侧的 const 修饰的是指针变量。