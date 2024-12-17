---
title: overload operator new and delete
description: 重载运算符 new 和 delete 的写法
date: 2024-12-17 00:00:00 +0800
categories: [Cpp, LearnCpp]
tags: [operator]     # TAG names should always be lowercase
---

## operator new

### Formats

#### replaceable allocation functions

```c++
void* operator new  ( std::size_t count );
void* operator new[]( std::size_t count );
void* operator new  ( std::size_t count, std::align_val_t al ); // (since C++17)
void* operator new[]( std::size_t count, std::align_val_t al ); // (since C++17)
```

#### non-allocating placement allocation functions

```c++
void* operator new  ( std::size_t count, void* ptr );
void* operator new[]( std::size_t count, void* ptr );
```

#### user-defined placement allocation functions

```c++
void* operator new  ( std::size_t count, user-defined-args... );
void* operator new[]( std::size_t count, user-defined-args... );
void* operator new  ( std::size_t count, std::align_val_t al, user-defined-args... ); // (since C++17)
void* operator new[]( std::size_t count, std::align_val_t al, user-defined-args... ); // (since C++17)
```

### Parameters

count	-	number of bytes to allocate
ptr	    -	pointer to a memory area to initialize the object at
al	    -	alignment to use. The behavior is undefined if this is not a valid alignment value

### Examples

#### Global replacements

```c++
#include <cstdio>
#include <cstdlib>
 
// no inline, required by [replacement.functions]/3
void* operator new(std::size_t sz)
{
    std::printf("1) new(size_t), size = %zu\n", sz);
    if (sz == 0)
        ++sz; // avoid std::malloc(0) which may return nullptr on success
 
    if (void *ptr = std::malloc(sz))
        return ptr;
}

void* operator new(std::size_t sz, void* p)
{
    std::printf("2) new(size_t，void*), size = %zu, p = %p\n", sz, p);
    if (sz == 0)
        ++sz; // avoid std::malloc(0) which may return nullptr on success
 
    if (void *ptr = p)
        return ptr;
}
 
// no inline, required by [replacement.functions]/3
void* operator new[](std::size_t sz)
{
    std::printf("3) new[](size_t), size = %zu\n", sz);
    if (sz == 0)
        ++sz; // avoid std::malloc(0) which may return nullptr on success
 
    if (void *ptr = std::malloc(sz))
        return ptr;
}
 
void operator delete(void* ptr) noexcept
{
    std::puts("4) delete(void*)");
    std::free(ptr);
}
 
void operator delete(void* ptr, std::size_t size) noexcept
{
    std::printf("5) delete(void*, size_t), size = %zu\n", size);
    std::free(ptr);
}
 
void operator delete[](void* ptr) noexcept
{
    std::puts("6) delete[](void* ptr)");
    std::free(ptr);
}
 
void operator delete[](void* ptr, std::size_t size) noexcept
{
    std::printf("7) delete[](void*, size_t), size = %zu\n", size);
    std::free(ptr);
}
 
int main()
{
    int* p1 = new int;
    int* p11 = new(p1) int;
    delete p1;
 
    int* p2 = new int[10]; // guaranteed to call the replacement in C++11
    delete[] p2;
}
```

Possible output:

```
1) new(size_t), size = 4
2) new(size_t，void*), size = 4, p = 0x55ef6cc832c0
5) delete(void*, size_t), size = 4
3) new[](size_t), size = 40
6) delete[](void* ptr)
```

#### Class-specific overloads

```c++
#include <cstddef>
#include <iostream>
 
// class-specific allocation functions
struct X
{
    static void* operator new(std::size_t count)
    {
        std::cout << "custom new for size " << count << '\n';
        return ::operator new(count);
    }

    static void* operator new(std::size_t count, void* p)
    {
        std::cout << "custom new for size " << count << ", addr: " << p << '\n';
        return p;
    }
 
    static void* operator new[](std::size_t count)
    {
        std::cout << "custom new[] for size " << count << '\n';
        return ::operator new[](count);
    }
};
 
int main()
{
    X* p1 = new X;
    X* p11 = new(p1) X;
    delete p1;
    X* p2 = new X[10];
    delete[] p2;
}
```

Possible output:

```
custom new for size 1
custom new for size 1, addr: 0x558422d9a2c0
custom new[] for size 10
```

> ## References
>
> * [operator new - cppreference](https://en.cppreference.com/w/cpp/memory/new/operator_new)
>
> * [operator delete - cppreference](https://en.cppreference.com/w/cpp/memory/new/operator_delete)
>
> * [new - cplusplus](https://legacy.cplusplus.com/reference/new/)
>