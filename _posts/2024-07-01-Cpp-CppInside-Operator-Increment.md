---
title: Increment Operator
description: 从汇编指令层面理解自增运算
date: 2024-07-01 00:00:00 +0800
categories: [Cpp, CppInside]
tags: [incrementoperator, assembly, cplusplus]     # TAG names should always be lowercase
---

## 运算符后置

```c++
int func1() {
    int num = 0;
    return num++;
}
```

对应汇编代码：

```asm
func1():
        push    rbp                     // 将 rbp 寄存器的值压入栈中，以便在函数结束时恢复。rbp 是栈基址指针
        mov     rbp, rsp                // 将 rbp 寄存器的值设置为当前栈指针 rsp，以创建一个新的栈帧。rsp 是栈指针
        mov     DWORD PTR [rbp-4], 0    // 将常数 0 放到 [rbp-4] 表示的内存地址上。DWORD PTR 表示操作数是 32 位内存地址，[rbp-4] 即是整型变量 num 的内存地址
        mov     eax, DWORD PTR [rbp-4]  // 将 [rbp-4] 内存地址上的值存储到寄存器 eax 中
        lea     edx, [rax+1]            // 将 rax 寄存器中的值和 1 相加后，把结果存储到寄存器 edx 中。eax 是 rax 寄存器的低 32 位部分，lea 是一个 64 位指令，所以需要使用 rax 来替换 eax
        mov     DWORD PTR [rbp-4], edx  // 将 edx 寄存器中的值放到 [rbp-4] 内存地址上
        pop     rbp                     // 函数结束时，从栈中弹出 rbp 寄存器的值，恢复现场。
        ret                             // 在 x86 架构中，函数的返回值通常由 eax 提供。
```

可以看到 num++ 执行时，先将 num 的值存到 eax 寄存器，产生了一个 num 的临时复制，然后才对 num 递增，最后返回 num 递增之前的临时复制。

## 运算符前置

```c++
int func2() {
    int num = 0;
    return ++num;
}
```

对应汇编代码：

```asm
func2():
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-4], 0    // 将常数 0 放到 [rbp-4] 表示的内存地址上
        add     DWORD PTR [rbp-4], 1    // 给 [rbp-4] 内存地址上的值加 1
        mov     eax, DWORD PTR [rbp-4]  // 将 [rbp-4] 内存地址上的值存储到寄存器 eax 中
        pop     rbp
        ret
```

## 运算符前置与后置相结合

```c++
int func3() {
    int num = 0;
    return num++ + ++num;
}
```

对应汇编代码：

```asm
func3():
        push    rbp
        mov     rbp, rsp
        mov     DWORD PTR [rbp-4], 0    // 将常数 0 放到 [rbp-4] 表示的内存地址上
        mov     eax, DWORD PTR [rbp-4]  // 将 [rbp-4] 内存地址上的值存储到寄存器 eax 中
        lea     edx, [rax+1]            // 将 rax 寄存器中的值和 1 相加后，把结果存储到寄存器 edx 中
        mov     DWORD PTR [rbp-4], edx  // 将 edx 寄存器中的值存到 [rbp-4] 内存地址上
        add     DWORD PTR [rbp-4], 1    // 给 [rbp-4] 内存地址上的值加 1
        mov     edx, DWORD PTR [rbp-4]  // 将 [rbp-4] 内存地址上的值存储到寄存器 edx 中
        add     eax, edx                // 将 eax 和 edx 寄存器中的值相加，结果存到 eax 中
        pop     rbp
        ret
```

可以从变量和表达式的角度来看待问题，num++ + ++num 由表达式 num++ 以及表达式 ++num 相加组成。依照从左到右的运算顺序，首先计算表达式 num++ 的结果，执行 num++ 后该表达式返回值 0，变量 num 值加 1 变为 1。然后计算表达式 ++num 的结果，执行 ++num 后，变量 num 值加 1 变为 2，该表达式返回值 2。最后将两个表达式返回值相加就是最终的结果。