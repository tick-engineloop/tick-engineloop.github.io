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

    std::cout << ((long long)pB == (long long)pC) << std::endl;
    std::cout << ((long long)pA == (long long)pC) << std::endl;

    std::cout << (pB == pC) << std::endl;
    std::cout << (pA == pC) << std::endl;
}
```

输出：

```console
Address of pC: 0x55b8bd26beb0
Address of pB: 0x55b8bd26beb4
Address of pA: 0x55b8bd26beb0
0
1
1
1
```

解析：类 C 同时继承自类 A 和 类 B，属于多重继承的情况。这种继承结构中，不同基类子对象在内存中的位置是不同的，因此指针之间的转换会导致不同的地址。因为 C 继承了 A 和 B，且在继承关系中 A 排在 B 前，所以 C 类对象的内存布局如下：

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

pC 是指向 C 类对象的指针，pA 和 pB 指向 C 类对象的不同部分。pB 是通过 `static_cast<B*>` 从 pC 转换而来的指针，因为 B 是 C 的一个基类，所以 pB 指向的是 C 对象中 B 部分的起始地址，这个地址通常与 pC 是不同的。pA 是通过 `static_cast<A*>` 从 pC 转换而来的指针，因为 A 是 C 的另一个基类，所以 pA 指向的是 C 对象中 A 部分的起始地址，这个地址与 pC 可能相同，因为 A 是 C 对象的第一个基类子对象。若先将 pB、pC 转换为 long long 类型再进行比较，则比较的是指针中的地址值是否相等，因 pB 和 pC 中地址不同，所以比较结果为 false。若直接将指针变量 pB、pC 进行比较，尽管 pB 和 pC 中的实际内存地址不同，但编译器会正确调整这些地址以反映它们指向的同一个对象，因此比较结果为 true，这是一种编译器优化和处理方式，确保在多重继承情况下指针转换和比较是正确的。


## 题目5 类修饰符

### 继承关系

* **public 继承**：使用 public 继承时，基类的 public 和 protected 成员在派生类中分别保持 public 和 protected 访问级别，而基类的 private 成员仍然是 private，不可直接访问。
* **protected 继承**：使用 protected 继承时，基类的 public 和 protected 成员在派生类中都变为 protected，而基类的 private 成员仍然是 private，不可直接访问。
* **private 继承**：使用 private 继承时，基类的 public 和 protected 成员在派生类中都变为 private，而基类的 private 成员仍然是 private，不可直接访问。

### 访问控制

* **public 成员**：可以被任何类和函数访问。当你希望类的成员可以从类外部被访问时应使用 pbulic。
* **protected 成员**：可以被类自身及其派生类访问，但不能被其他类或函数访问。当你希望成员只能被类自身和其子类访问时应使用 protected，通常用于继承和多态设计。
* **private 成员**：只能被类自身访问，不能被派生类或任何其他类或函数访问。当你希望成员只能被类自身访问时应使用 private，通常用于实现数据封装和隐藏实现细节。

## 题目6 重写、重载和隐藏

重写（override）、重载（overload）和隐藏（overwrite）在 C++ 中是三个完全不同的概念，概念不清的话很容易混淆，导致误用或者混用。三者的区别如下：

* **重写（override）**：是指派生类重新定义基类中已定义的虚函数，派生类提供特定的实现以替换基类中的实现。派生类中要重写的函数必须和基类的虚函数有相同的函数签名和返回类型。

```c++
#include <iostream>

class Base {
public:
    virtual void display() const {
        std::cout << "Display Base class" << std::endl;
    }
};

class Derived : public Base {
public:
    void display() const override {
        std::cout << "Display Derived class" << std::endl;
    }
};

int main() {
    Base* basePtr = new Derived();
    basePtr->display();
    delete basePtr;
    return 0;
}
```

* **重载（overload）**：是指在同一个作用域内定义多个同名的函数，但这些函数的参数列表必须不同（即参数的类型、数量或顺序不同）。

```c++
#include <iostream>

void print(int i) {
    std::cout << "Printing int: " << i << std::endl;
}

void print(double f) {
    std::cout << "Printing double: " << f << std::endl;
}

void print(const char* c) {
    std::cout << "Printing string: " << c << std::endl;
}

int main() {
    print(10);
    print(3.14);
    print("Hello, World!");
    return 0;
}
```

* **隐藏（overwrite）**：是指基类成员函数，无论它是否为虚函数，当派生类出现同名函数时，如果派生类函数签名不同于基类函数，则基类函数会被隐藏。如果派生类函数签名与基类函数相同，则需要确定基类函数是否为虚函数，如果是虚函数，则这里的概念就是重写；否则基类函数也会被隐藏。另外，如果还想使用基类函数，可以使用 using 关键字将其引入派生类。

> **函数签名（Function Signature）** <br> 在 C++ 中，函数签名是指函数的标识信息，包括函数名以及参数的类型和顺序。需要注意的是函数签名并不包括返回类型。
{: .prompt-tip }

## 题目7 C++ 面向对象编程（OOP）的三大主要特性

* **继承**：允许一个类（称为子类或派生类）继承另一个类（称为基类或父类）的属性和方法。这使得派生类可以重用和扩展基类的功能。继承提高了代码的复用性和可维护性。

* **封装**：是将数据和操作数据的方法封装在一个类中，以保护数据免受外部干扰和滥用。通过访问控制（public、protected、private），封装提供了数据隐藏和访问控制的机制。

* **多态**：允许通过统一的接口调用不同对象的实现。多态性可以通过函数重载、运算符重载和虚函数来实现。多态可以分为两类：编译时多态（静态多态）和运行时多态（动态多态）。编译时多态主要通过函数重载和模板（泛型编程）来实现。运行时多态主要通过继承和虚函数来实现。通过基类指针或引用来调用派生类中的重写函数，实际调用的函数版本在运行时决定。

```c++
class Base {
public:
    virtual void display() {
        std::cout << "Display Base" << std::endl;
    }
};

class Derived : public Base {
public:
    void display() override {
        std::cout << "Display Derived" << std::endl;
    }
};

int main() {
    Base* basePtr = new Derived();
    basePtr->display();             // 输出：Display Derived
    delete basePtr;
    return 0;
}

```

## 题目8 类内存大小

在 C++ 中，类的内存大小（sizeof）取决于多个因素，包括其成员变量的类型、虚函数表指针（如果有虚函数的话）、继承方式（如是否有多重继承）、以及编译器优化和内存对齐等。以下是一些需要特别关注的点：

* **空类**：空类同样可以被实例化，为保证每个实例在内存中都有唯一的地址，C++ 规定类的内存大小至少应为 1 个字节，所以空类的大小通常被编译器设置为 1 个字节。

* **虚类**：当一个类包含虚函数时，编译器会为该类创建一个虚函数表（vtable），该表包含了类中所有虚函数的地址。每个带有虚函数的类在它的对象实例中都会包含一个指向其类的虚函数表的指针（称为vptr）。这个指针是对象内存布局的一部分，通常位于对象数据的开始位置。这个指针的大小通常是固定的，例如在32位系统上通常是 4 字节，在64位系统上通常是 8 字节。

* **继承**：在继承的情况下，派生类的内存大小还会包括基类的内存大小。如果是多重继承，派生类的内存大小会包括多个基类的内存大小。如果基类是空类，则在计算派生类内存大小时不将其考虑在内。

* **私有成员变量**：在继承的情况下，派生类包含基类的所有成员变量，无论这些成员变量是私有的、保护的，还是公共的。虽然派生类不能直接访问基类的私有成员变量，但是在内存布局中，基类的私有成员变量仍然被包含在派生类的对象中。所以基类的私有成员变量的大小也会算在派生类的内存大小中。

* **静态数据成员**：静态数据成员是属于类的，而不是属于类的某个特定实例。这意味着所有类的实例共享同一个静态数据成员。静态数据成员存储在全局数据区（静态存储区），而不是对象的内存布局中。这意味着无论创建了多少个类的实例，静态数据成员只占用一份内存空间。所以静态数据成员在类的内存布局中不占空间，而是作为类的全局属性存在。

> **空类** <br> 在 C++ 编程语言中，空类（Empty Class）指的是一个不包含任何成员变量或成员函数（除了可能的编译器自动生成的成员函数，如默认构造函数、析构函数、拷贝构造函数、赋值操作符等）的类。空类的定义非常简单，它只包含类的声明而不包含任何类的实现内容。
{: .prompt-tip }

```c++
#include <iostream>

class A {
private:
    int m_a;
public:
    virtual void display() {std::cout << "display A" << std::endl;}

    void func() { display(); }
};
class B {
public:
   virtual void print() {std::cout << "pirnt B" << std::endl;}
};
class C : public A, public B {
private:
    char m_c;
public:
    virtual void display() override {std::cout << "display C" << std::endl;}
    virtual void show() {std::cout << "show C" << std::endl;}
};

int main() {
   std::cout << sizeof(A) << std::endl;    // 需要考虑内存对齐
   std::cout << sizeof(B) << std::endl;
   std::cout << sizeof(C) << std::endl;    // 需要考虑内存对齐
   return 0;
}
```
```console
16
8
32
```

## 题目9 基类派生类构造与析构调用顺序

构造的顺序是先构造基类，再构造派生类。析构的顺序是先析构派生类，再析构基类。

```c++
#include <iostream>

class A {
public:
    A() { std::cout << "constructor A" << std::endl; }
    virtual ~A() { std::cout << "destructor A" << std::endl; }
};

class B {
public:
    B() { std::cout << "constructor B" << std::endl; }
    virtual ~B() { std::cout << "destructor B" << std::endl; }
};

class C : public A, public B {
public:
    C() { std::cout << "constructor C" << std::endl; }
    ~C() { std::cout << "destructor C" << std::endl; }
};

int main() {
   C* c1 = new C;
   delete c1;

   return 0;
}
```

输出：

```console
constructor A
constructor B
constructor C
destructor C
destructor B
destructor A
```

## 题目10 Virtual 析构函数

构造函数是不能为虚函数的。但析构函数能够且常常必须是虚的。当基类的析构函数是虚函数时，通过基类指针删除派生类对象会调用派生类的析构函数，确保对象完全析构。如果基类的析构函数不是虚函数，通过基类指针删除派生类对象不会调用派生类的析构函数，可能导致对象不完全析构引起资源泄漏。

```c++
#include <iostream>

class A {
public:
    virtual ~A() { std::cout << "destructor A" << std::endl; }     // 析构函数为虚函数
};

class B {
public:
    ~B() { std::cout << "destructor B" << std::endl; }             // 析构函数为非虚函数
};

class C : public A, public B {
public:
    ~C() { std::cout << "destructor C" << std::endl; }
};

int main() {
   C* c1 = new C;
   delete c1;
   std::cout << "----------------------" << std::endl;

   C* c2 = new C;
   A* a = static_cast<A*>(c2);
   delete a;
   std::cout << "----------------------" << std::endl;

   C* c3 = new C;
   B* b = static_cast<B*>(c3);
   delete b;

   return 0;
}
```

输出：

```console
destructor C
destructor B
destructor A
----------------------
destructor C
destructor B
destructor A
----------------------
destructor B
```

## 题目11 虚函数在构造函数中的行为

虚函数在构造函数中的行为有一些特殊之处，这主要是因为对象在构造期间的状态尚不完整，使得构造函数中的虚函数调用行为与其他地方不同。当在基类的构造函数中调用虚函数时，调用的是基类版本的虚函数。在派生类的构造函数中，虚函数的行为与平时一致，调用的是派生类的虚函数实现。

```c++
#include <iostream>

class A {
public:
    A() { display(); } 
    void func() { display(); }

    virtual void display() {std::cout << "display A" << std::endl;}
};

class B : public A {
public:
    virtual void display() override {std::cout << "display B" << std::endl;}
};

int main() {
   A* a = new B;
   a->func();
   return 0;
}
```

输出：

```console
display A
display B
```

## 题目12 double free

```c++
#include <iostream>

using namespace std;

int main()
{
   int* p = new int(2);
   
   delete p;
   delete p;    //  再次删除已被删除的指针
   
   return 0;
}
```

在 c++ 中再次删除已被删除的指针，会在运行时出现报错：

```console
free(): double free detected in tcache 2
Aborted (core dumped)
```

若将已删除指针设置为空指针，再删除则不会出现错误：

```c++
#include <iostream>

using namespace std;

int main()
{
   int* p = new int(2);
   
   delete p;
   p = nullptr;
   delete p;    //  再次删除已被删除的指针
   
   return 0;
}
```

## 题目13 智能指针

在 C++ 标准库中，智能指针是一种自动化管理动态分配内存的工具，目的是避免手动管理内存释放时发生的内存泄漏和悬挂指针问题。智能指针主要通过 RAII（资源获取即初始化）来实现，即在对象的生命周期内自动管理资源。C++11 标准库引入了以下几种主要的智能指针：

### unique_ptr

unique_ptr 是独占所有权的智能指针，确保同一时间只有一个指针管理某个对象。不能复制，但可以（使用移动语义）转移所有权。适用于需要明确所有权的场景。

```c++
#include <cassert>
#include <cstdio>
#include <iostream>
#include <memory>
#include <stdexcept>
 
// helper class for runtime polymorphism demo below
struct B
{
    virtual ~B() = default;
 
    virtual void bar() { std::cout << "B::bar\n"; }
};
 
struct D : B
{
    D() { std::cout << "D::D\n"; }
    ~D() { std::cout << "D::~D\n"; }
 
    void bar() override { std::cout << "D::bar\n"; }
};
 
// a function consuming a unique_ptr can take it by value or by rvalue reference
std::unique_ptr<D> pass_through(std::unique_ptr<D> p)
{
    p->bar();
    return p;
}
 
int main()
{
    std::cout << "1) Unique ownership semantics demo\n";
    {
        // Create a (uniquely owned) resource
        std::unique_ptr<D> p = std::make_unique<D>();
 
        // Transfer ownership to `pass_through`,
        // which in turn transfers ownership back through the return value
        std::unique_ptr<D> q = pass_through(std::move(p));
 
        // p is now in a moved-from 'empty' state, equal to nullptr
        assert(!p);
    }
 
    std::cout << "\n" "2) Runtime polymorphism demo\n";
    {
        // Create a derived resource and point to it via base type
        std::unique_ptr<B> p = std::make_unique<D>();
 
        // Dynamic dispatch works as expected
        p->bar();
    }
 
    std::cout << "\n" "3) Array form of unique_ptr demo\n";
    {
        std::unique_ptr<D[]> p(new D[3]);
    } // `D::~D()` is called 3 times
}
```

### shared_ptr

shared_ptr 是共享所有权的智能指针，允许多个指针共享同一对象。使用引用计数来管理对象的生存周期，当最后一个 shared_ptr 被销毁时，对象也会被释放。适用于需要共享对象的场景。

```c++
#include <iostream>
#include <memory>

struct B
{
    virtual ~B() = default;
 
    virtual void bar() { std::cout << "B::bar\n"; }
};
 
struct D : B
{
    D() { std::cout << "D::D\n"; }
    ~D() { std::cout << "D::~D\n"; }
 
    void bar() override { std::cout << "D::bar\n"; }
};

int main()
{
    std::shared_ptr<int> ptr1 = std::make_shared<int>(42); 
    std::cout<< ptr1.use_count() << std::endl;
    
    std::shared_ptr<int> ptr2 = ptr1; // ptr1 和 ptr2 共享同一对象
    std::cout<< ptr1.use_count() << std::endl;
    std::cout<< ptr2.use_count() << std::endl;

    // reset
    std::shared_ptr<int> ptr3 = std::make_shared<int>(5); 
    ptr3.reset();               // 释放该对象

    std::shared_ptr<int> ptr4 = std::make_shared<int>(10); 
    ptr4.reset(new int(20));    // 释放旧对象，指向新的 int 对象

    std::shared_ptr<int> ptr5 = std::make_shared<int>(12);
    std::shared_ptr<int> ptr6 = ptr5;
    ptr5.reset();               // ptr5 不再指向对象，但 ptr6 仍然持有引用该对象，所以对象不会被释放

    std::shared_ptr<B> pb = std::make_shared<D>();
    pb->bar();
}
```

```console
1
2
2
```

### weak_ptr

weak_ptr 是弱引用智能指针，不影响对象的引用计数。与 shared_ptr 搭配使用，用于解决循环引用问题。提供了一种非拥有关系的观察者模式。

```c++
#include <iostream>
#include <memory>
 
std::weak_ptr<int> gw;
 
void observe()
{
    std::cout << "gw.use_count() == " << gw.use_count() << "; ";
    // we have to make a copy of shared pointer before usage:
    if (std::shared_ptr<int> spt = gw.lock())   // lock() 方法的主要作用是安全地访问由 weak_ptr 观测的对象，获取一个指向 weak_ptr 管理的对象的 shared_ptr，而不会增加引用计数。如果 weak_ptr 关联的对象仍然存在并且没有被释放，lock() 方法将返回一个有效的 shared_ptr；如果对象已经被释放，lock() 将返回一个空的 shared_ptr。
        std::cout << "*spt == " << *spt << '\n';
    else
        std::cout << "gw is expired\n";
}
 
int main()
{
    {
        auto sp = std::make_shared<int>(42);
        gw = sp;    // 不增加引用计数
 
        observe();
    }
 
    observe();
}
```

## 题目14 C++ 标准库容器

### vector

* **描述**：动态数组，使用连续内存，支持自动扩容
* **算法时间复杂度**：下标索引访问是 O(1)，查找是 O(n)，插入和删除在开头和中间是 O(n) 在末尾是 O(1)
* **适用场景**：需要频繁访问和修改元素的场景

### list

* **描述**：双向链表，非连续内存，支持快速插入和删除操作
* **算法时间复杂度**：访问是 O(n)，查找是 O(n)，插入和删除是 O(1)
* **适用场景**：需要频繁插入和删除元素的场景

### map

* **描述**：有序映射，存储键值对，基于红黑树实现
* **算法时间复杂度**：查找、插入和删除是 O(logn)
* **适用场景**：需要存储键值对并进行快速查找的场景

### unordered_map

* **描述**：无序映射，存储键值对，基于哈希表实现
* **算法时间复杂度**：查找、插入和删除是 O(1)
* **适用场景**：需要存储键值对并进行快速查找的场景

### queue

* **描述**：队列，遵循先进先出（FIFO）原则。
* **算法时间复杂度**：只能访问队列第一个和最后一个元素，时间复杂度是 O(1)。只能在队尾插入元素，只能删除队列首元素，时间复杂度是 O(1)
* **适用场景**：需要先进先出数据结构，只关注队首和队尾元素的场景

### deque

* **描述**：双端队列，支持在两端进行快速插入和删除操作
* **算法时间复杂度**：两端访问是 O(1) 中间是 O(n)，查找是 O(n)，插入和删除两端是 O(1) 中间是 O(n)
* **适用场景**：需要在两端进行频繁插入和删除操作的场景

### set

* **描述**：有序集合，基于红黑树实现，每个元素都是唯一的，重复的元素不会被插入。元素按照特定的顺序排列，默认情况下是按升序排列。插入元素时，会自动对元素进行排序
* **算法时间复杂度**：查找、插入和删除是 O(logn)
* **适用场景**：需要存储唯一元素并进行快速查找的场景

### unordered_set

* **描述**：无序集合，基于哈希表实现，每个元素都是唯一的，重复的元素不会被插入。
* **算法时间复杂度**：查找、插入和删除是 O(1)
* **适用场景**：需要存储唯一元素并进行快速查找的场景

## 题目15 常用设计模式

