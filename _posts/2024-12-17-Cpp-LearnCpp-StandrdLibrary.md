---
title: C++ Standard Library
description: C++ 标准库提供了可在标准 C++ 中使用的各种工具。
date: 2024-12-17 00:00:00 +0800
categories: [Cpp, LearnCpp]
tags: [operator]     # TAG names should always be lowercase
---

## underlying_type

std::underlying_type 是 C++ 标准库中的一个模板，它用于获取枚举类型的基础类型（underlying type）。枚举类型在 C++ 中实际上是由某个基础整数类型（通常是 int，但也可以是 unsigned int、long、unsigned long 等）表示的。std::underlying_type 可以帮助你查询这个基础类型是什么。使用 std::underlying_type 通常需要包含 <type_traits> 头文件，并且其结果通常通过 ::type 成员来访问。

```c++
#include <iostream>  
#include <type_traits>  
  
enum class MyEnum : unsigned int {  
    Value1,  
    Value2,  
    // ...  
};  
  
int main() {  
    typedef std::underlying_type<MyEnum>::type UnderlyingType;  
    std::cout << typeid(UnderlyingType).name() << std::endl; // 输出可能是 "u"，这取决于编译器和平台  
    return 0;  
}
```

在这个例子中，我们定义了一个名为 MyEnum 的枚举类型，它明确指定其基础类型为 unsigned int。然后，我们使用 std::underlying_type 来查询这个枚举类型的基础类型，并通过 ::type 成员来访问它。最后，我们使用 typeid 和 name 函数来输出这个基础类型的名称（注意：name 函数的输出可能因编译器和平台而异，所以这里只是一个示例）。