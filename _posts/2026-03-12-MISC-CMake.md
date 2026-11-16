---
title: CMake
description: CMake 是一个用于管理源代码构建的工具。最初，CMake 被设计为各种 Makefile 方言的生成器，如今 CMake 生成现代构建系统，如 Ninja，以及用于 Visual Studio 和 Xcode 等 IDE 的项目文件。
date: 2026-03-12 00:00:00 +0800
categories: [MISC, Tools]
tags: [cmake]     # TAG names should always be lowercase
---

## 1. 简介

CMake 是一个开源的、跨平台的配置程序，用于构建、测试和打包软件，有时被称为“元”构建系统，简单来说，它就是一个用于管理源代码构建的工具。CMake 被设计用于与本地构建环境协同工作，它使用简单的独立配置文件来控制软件的编译过程，根据项目、环境和用户提供的配置信息生成一个构建系统。

![Cmake Icon](/assets/img/post/MISC-Tools-CMakeIcon.jpeg){: .shadow }

## 2. CMake 优势

### 2.1 为何选择 CMake？

CMake 是一个面向软件项目的开源构建系统生成器，它以简洁的方式处理软件构建的难点，开发人员可使用简单、可移植的文本文件格式来指定构建参数，之后，CMake 会使用该文件来生成面向本地构建工具（包括 Make/NMake 和 Ninja）的项目文件。CMake 的优势包括：

* 构建配置文件可适用于所有平台。 
* 能够测试机器字节顺序和其他特定硬件特征。 
* 能够自动搜索软件构建可能需要的程序、库和头文件。 
* 能够在源代码树外部的目录树中构建。这允许开发者删除整个构建目录，而不必担心删除源文件。
* 能够轻松地在静态和共享构建之间切换。 
* 可以使用系统相关的信息配置文件，例如数据文件的位置和其他信息。

### 2.2 为何不使用 Autotools？

Autotools 是一组用于为软件包创建 GNU 构建系统的工具，主要包括 Autoconf、Automake 和 Libtool 等，其中 Autoconf 主要处理 configure 相关的事情，而 Automake 则负责 Makefile 相关的工作。因为它源自 GNU 项目，所以被称为 GNU 构建系统。与 CMake 相比：

* 项目类型上：Autotools 在 GNU 项目上使用居多，CMake 在中间件及应用层 C++ 项目上使用居多，有的项目同时提供 Autotools 和 CMake 构建方式。
* 工作流程上：Autotools 是一个松散耦合的工具链：Autoconf 根据 configure.ac 生成 configure 脚本，Automake 根据 Makefile.am 生成 Makefile.in 模板，然后 configure 脚本在用户机器上运行，生成最终的 Makefile。Autoconf 与 Automake 组合在一起提供了与 CMake 相同的部分功能。CMake 是一个元构建系统，它读取 CMakeLists.txt，然后生成指定平台的原生构建文件，例如 Unix Makefiles、Ninja、Visual Studio 项目文件。
* 跨平台支持：Autotools 对 Unix-like 系统支持的很好，但对 Windows 的支持较差。CMake 原生支持 Windows，可以生成 Visual Studio 项目文件，直接使用 MSVC 编译器，无需额外的 Unix 兼容层，这使得它成为跨平台（尤其是同时覆盖 Unix 和 Windows）项目的首选。
* 学习成本上：对于 Autotools 开发者需要同时掌握 Autoconf 的 M4 宏语法和 Automake 的 Makefile 语法，往往晦涩难懂，有时需要深入理解 shell、M4、sed 等多种工具。CMake 的 CMakeLists.txt 语法是自定义的，一致性更好，只需学习一种语法，通常比 Autotools 更易理解。

## 3. CMake 基本用法

CMake 读取项目中的 `CMakeLists.txt`，根据所选生成器生成相应构建系统的规则；随后由该构建系统执行编译和链接。典型工作流程如下：

1. 在一个或多个 `CMakeLists.txt` 文件中描述项目，声明目标及其源文件、依赖和构建属性。
2. 运行 CMake 配置项目，并按所选生成器生成构建规则。
3. 通过 `cmake --build`，或直接使用对应的构建工具或 IDE，执行编译和链接。

### 3.1 创建 CMakeLists 文件

CMakeLists 文件（即 CMakeLists.txt）使用 cmake-language 编写，表现为一系列注释、命令和变量组成项目描述的纯文本文件。首先，让我们考虑最简单的 CMakeLists 文件：

```cmake
cmake_minimum_required(VERSION 3.20) 
project(Hello) 
add_executable(Hello Hello.c)
```

CMakeLists 文件的第一行应始终是 [`cmake_minimum_required`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html)，指定项目要求的 CMake 最小版本。任何 CMakeLists 文件的下一行应该是 [`project`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令，此命令设置项目的名称。最后，使用 [`add_executable`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html) 命令将给定的源文件添加向项目可执行文件。在此示例中，源目录中有两个文件：CMakeLists.txt 和 Hello.c。

### 3.2 配置和生成

上面的 `CMakeLists.txt` 描述了项目及其可执行目标，但这份描述还不是可直接执行的构建规则。接下来需要运行 CMake，对项目进行配置并生成所选构建系统的规则。通常可通过 `cmake -S <源码目录> -B <构建目录>` 指定源码目录和构建目录；CMake 随后从源码目录的顶层 `CMakeLists.txt` 开始执行配置过程，并按项目逻辑处理 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include)、[`add_subdirectory()`](https://cmake.com.cn/cmake/help/latest/command/add_subdirectory.html) 等命令引入的其他 CMake 文件。

配置过程中，CMake 会根据工具链、平台和项目条件评估构建描述，建立目标及其依赖关系。配置完成后，CMake 根据选定的生成器进入生成阶段，把配置结果转换为对应构建系统可读取的文件：例如 Ninja 生成 `build.ninja`，Unix Makefiles 生成 Makefile，Visual Studio 生成解决方案和项目文件。这个过程主要是描述和生成构建规则，不会因此编译源文件，当运行 `cmake --build <构建目录>` 后，才会调用该构建目录对应的原生构建工具执行编译、链接等任务。修改构建描述或相关配置后，CMake 也可能在构建前重新配置并生成这些规则。

#### 3.2.1 从命令行运行 CMake

在命令行中运行 `cmake`，并通过参数指定源码目录、构建目录及所需配置，即可完成项目配置并生成对应的构建系统文件。下面介绍几个常用参数。

cmake -S dir
: 指定项目根目录，该目录应包含根 CMakeLists.txt 文件，CMake 将在此寻找要构建的项目。如果未指定，则默认为当前工作目录。

cmake -B dir
: 指定构建目录，CMake 将在此目录中输出生成的构建系统的文件，以及在运行构建系统时产生的缓存文件。如果未指定，则默认为当前工作目录。

cmake --build dir
: 在指定的构建目录中运行构建系统。

cmake -G
: 指定生成器，生成器决定 CMake 为构建目录生成哪种原生构建系统文件，例如 Ninja 或 Makefile。

![Single Source Build](/assets/img/post/MISC-Tools-SingleSourceBuild.png){: .shadow }{: width="600" height="337" }

向 CMake 指定编译器
: 若需使用特定编译器，可在首次配置时通过 `CMAKE_C_COMPILER`、`CMAKE_CXX_COMPILER` 指定，或使用 `CC`、`CXX` 环境变量。`CFLAGS`、`CXXFLAGS` 和 `LDFLAGS` 可用于初始化相应的编译或链接标志。编译器选择会记录在构建目录的缓存中；更换编译器时，建议使用新的构建目录。

向 CMake 指定构建配置
: 构建配置允许以调试、优化等不同的方式构建项目。默认情况下，CMake 支持 `Debug`、`Release`、`MinSizeRel` 和 `RelWithDebInfo` 配置。`Debug` 是启用基本的调试标志。`Release` 是启用基本的优化标志。`MinSizeRel` 具有生成最小目标代码的标志，但不一定是速度最快的代码。`RelWithDebInfo` 构建具有调试信息的优化版本。

  | 构建类型             | 编译选项               | 适用场景
  | ---                 | ---                   | ---
  | `Debug`             | `-g`                  | 开发调试阶段，需要断点和变量查看
  | `Release`           | `-O2 -DNDEBUG`        | 生产发布，追求运行速度
  | `RelWithDebInfo`    | `-O2 -g`              | 需要性能分析或调试优化的发布版本
  | `MinSizeRel`        | `-Os`                 | 嵌入式或对体积敏感的场景

对于基于 Makefile 的生成器，在运行 CMake 时只能激活一个配置，并使用 `CMAKE_BUILD_TYPE` 变量指定。如果变量为空，则不会向构建添加任何标志。要构建调试和发布树，用户应使用 CMake 的源外构建功能创建多个构建目录，并将 `CMAKE_BUILD_TYPE` 设置为每个构建所需的选项。例如：

```cmake
# With source code in the directory MyProject
# to build MyProject-debug create that directory, cd into it and
cmake ../MyProjectd -DCMAKE_BUILD_TYPE=Debug
# the same idea is used for the release tree MyProject-release
cmake ../MyProject -DCMAKE_BUILD_TYPE=Release
```

#### 3.2.2 从 GUI 运行 CMake

更习惯 GUI 界面的用户可以使用 cmake-gui 工具来调用 CMake 并生成构建系统。请查看 [CMake GUI 工具交互指南](https://cmake.com.cn/cmake/help/latest/guide/user-interaction/index.html#cmake-gui-tool)。

### 3.3 构建您的项目

完成配置和生成后，即可构建项目。推荐运行 `cmake --build <构建目录>`，由 CMake 调用该构建目录对应的原生构建工具；也可以直接调用生成器对应的工具，例如在 Makefile 构建目录中运行 `make`。构建完成后，便可运行生成的程序。

<iframe style="display:block;width:100%;height:clamp(480px,80vh,800px);margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((g:!((h:tree,i:(buildSystem:cmake,buildSystemArgs:(cmake:'-DCMAKE_BUILD_TYPE%3DRelWithDebInfo'),cmakeArgs:'-DCMAKE_BUILD_TYPE%3DRelWithDebInfo',compilerLanguageId:c%2B%2B,customOutputFilename:Hello,files:!((editorId:6,fileId:14,filename:Hello.cpp,g:'',isIncluded:'0',isMainSource:'1',isOpen:'0',langId:''),(editorId:1,fileId:15,filename:CMakeLists.txt,g:'project(shapes)%0A%0Acmake_minimum_required(VERSION+3.5)%0A%0Aadd_executable(shapesquare%0A++++shapes/circle.cpp%0A++++shapes/rectangle.cpp%0A++++main.cpp)%0A%0Atarget_link_libraries(shapesquare%0A++++fmtd)%0A',isIncluded:'0',isMainSource:'0',isOpen:'0',langId:cmake)),isCMakeProject:'0',j:1,newFileId:21),l:'5',n:'0',o:'Tree+%231',t:'0')),k:20.547945205479454,l:'4',m:45.87412587412587,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'0',compilationPanelShown:'0',compiler:g152,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:c%2B%2B,libs:!((name:fmt,ver:'713')),options:'-std%3Dc%2B%2B20+-O3+-flto',overrides:!(),runtimeTools:!(),stdinPanelShown:'1',tree:1,wrap:'1'),l:'5',n:'0',o:'Executor+x86-64+gcc+15.2+(C%2B%2B,+Tree+%231)',t:'0'),(h:compiler,i:(compiler:g152,filters:(b:'0',binary:'1',binaryObject:'1',commentOnly:'0',debugCalls:'1',demangle:'0',directives:'0',execute:'1',intel:'0',libraryCode:'0',trim:'1',verboseDemangling:'0'),flagsViewOpen:'1',fontScale:14,fontUsePx:'0',j:3,lang:c%2B%2B,libs:!((name:fmt,ver:'713')),options:'-std%3Dc%2B%2B20+-O3+-flto',overrides:!(),selection:(endColumn:1,endLineNumber:1,positionColumn:1,positionLineNumber:1,selectionStartColumn:1,selectionStartLineNumber:1,startColumn:1,startLineNumber:1),tree:1),l:'5',n:'0',o:'+x86-64+gcc+15.2+(Tree+%231)',t:'0')),header:(),l:'4',m:54.12587412587413,n:'0',o:'',s:0,t:'0')),k:33.00553165334972,l:'3',n:'0',o:'',t:'0'),(g:!((g:!((h:codeEditor,i:(filename:Hello.cpp,fontScale:14,fontUsePx:'0',j:6,lang:c%2B%2B,selection:(endColumn:45,endLineNumber:4,positionColumn:45,positionLineNumber:4,selectionStartColumn:45,selectionStartLineNumber:4,startColumn:45,startLineNumber:4),source:'%23include+%3Ciostream%3E%0A%0Aint+main()+%7B%0A++++std::cout+%3C%3C+%22Hello+World!!%22+%3C%3C+std::endl%3B%0A%7D%0A'),l:'5',n:'0',o:Hello.cpp,t:'0'),(h:codeEditor,i:(filename:CMakeLists.txt,fontScale:14,fontUsePx:'0',j:1,lang:cmake,selection:(endColumn:1,endLineNumber:7,positionColumn:1,positionLineNumber:7,selectionStartColumn:1,selectionStartLineNumber:7,startColumn:1,startLineNumber:7),source:'cmake_minimum_required(VERSION+3.20)%0A%0Aproject(Hello)%0A%0Aadd_executable(Hello+%0A++++Hello.cpp)%0A%0A'),l:'5',n:'0',o:CMakeLists.txt,t:'0')),header:(),k:48.44444444444444,l:'4',m:62.125340599455036,n:'0',o:'',s:1,t:'0'),(g:!((h:output,i:(fontScale:14,fontUsePx:'0',j:3,treeid:1,wrap:'1'),l:'5',n:'0',o:'Output+of+x86-64+gcc+15.2+(Compiler+%233)',t:'0')),header:(),l:'4',m:37.874659400544964,n:'0',o:'',s:0,t:'0')),k:66.99446834665028,l:'3',n:'0',o:'',t:'0')),l:'2',n:'0',o:'',t:'0')),version:4"></iframe>

## 4. CMake 语言基础

CMake 使用专门的语言描述和控制构建过程，通常称为 CMake 语言（CMakeLang）。CMakeLang 中唯一的基础类型是字符串和列表。普通变量的值以字符串形式表示；列表则通常表示为以分号分隔的字符串序列。布尔值和数字等含义由具体命令根据参数用途解释，并不是通用的独立变量类型。因此，阅读 CMake 代码时，需要结合命令的参数规则理解字符串和列表如何被解析。

### 4.1 注释

在 CMake 语言中，`#` 可用于开始注释，但位于括号参数或引号参数内部时不作为注释起始符；在不带引号的参数中，若 `#` 被反斜杠转义，也不开始注释。注释分为 **行注释** 和 **括号注释** 两种。

#### 4.1.1 括号注释

当 `#` 后紧接左方括号分隔符（如 `#[[` 或 `#[=[`）时，开始一个括号注释；注释在对应的右方括号分隔符（如 `]]` 或 `]=]`）处结束。例如：

```cmake
#[[This is a bracket comment.
It runs until the close bracket.]]

message("First Argument\n" #[[Bracket Comment]] "Second Argument")
```

#### 4.1.2 行注释

在可开始注释的位置，若 `#` 后没有紧跟左方括号分隔符，它就开始一个行注释，注释内容延续到行尾。例如：

```cmake
# This is a line comment.
message("First Argument\n" # This is a line comment :)
        "Second Argument") # This is a line comment.
```

### 4.2 变量

变量是 CMake 语言中用于存储值的基本单位。变量的值始终是字符串类型，不过某些命令会将这些字符串按其他类型解释。变量名区分大小写。虽然变量名可以包含多种字符，实际编写时通常使用字母、数字、下划线（`_`）和连字符（`-`），以提高可读性并减少引用时的歧义。

#### 4.2.1 变量类型

变量可分为普通变量、环境变量和缓存变量。

##### 4.2.1.1 普通变量

使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 设置普通变量的值，使用 [`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 移除普通变量定义。[`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 会移除普通变量的定义，而不是将其设为空字符串把它定义为值为空的变量；若存在同名缓存变量，移除普通变量后，引用该名称时可能会读到缓存值。引用变量时，可用 `${<variable>}` 展开其值，例如：

```cmake
set(var "World!")
message("Hello ${var}")
```

通过脚本模式去验证:

```shell
$ cmake -P CMakeLists.txt
Hello World!
```

> 提示：cmake -P 被称为“脚本模式”，它告诉 CMake 该文件不包含 project() 命令。我们不构建任何软件，而是仅将 CMake 用作命令解释器。
{: .prompt-tip }

CMake 内置了五种类别的变量，分别是提供信息、改变行为、描述系统、控制构建和用于语言的变量。

| 提供信息的内置变量                          | 作用                                   
| ---                                       | ---                               
| [`PROJECT_NAME`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_NAME.html)                             | 当前目录或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所提供的名称
| [`PROJECT_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_VERSION.html)                       | 当前目录或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所提供的版本号
| [`PROJECT_DESCRIPTION`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_VERSION.html)                   | 当前目录或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所提供的描述
| [`PROJECT_SOURCE_DIR`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_SOURCE_DIR.html)                 | 当前目录或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时的源目录
| [`PROJECT_BINARY_DIR`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_BINARY_DIR.html)                 | 当前目录或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时的二进制目录
| [`CMAKE_PROJECT_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_NAME.html)                 | 顶层 CMakeLists.txt 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目名称
| [`CMAKE_PROJECT_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_VERSION.html)           | 顶层 CMakeLists.txt 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目版本
| [`CMAKE_PROJECT_DESCRIPTION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_DESCRIPTION.html)   | 顶层 CMakeLists.txt 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目描述
| [`CMAKE_SOURCE_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SOURCE_DIR.html)                     | 源码树顶层目录的完整路径
| [`CMAKE_BINARY_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_BINARY_DIR.html)                                                                                                             | 构建树顶层目录的完整路径
| [`CMAKE_CURRENT_SOURCE_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_SOURCE_DIR.html)     | 当前正在处理的源目录的完整路径
| [`CMAKE_CURRENT_BINARY_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_BINARY_DIR.html)     | 当前正在处理的二进制目录的完整路径
| [`CMAKE_CURRENT_LIST_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_LIST_DIR.html)         | 当 CMake 处理项目中的列表文件时，<br>该变量为正在处理的列表文件所在的完整目录
| [`CMAKE_CURRENT_LIST_FILE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CURRENT_LIST_FILE.html)       | 当 CMake 处理项目中的列表文件时，<br>该变量为当前正在处理的列表文件，包含完整路径
| [`CMAKE_GENERATOR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_GENERATOR.html)                       | 当前使用的构建生成器
| [`CMAKE_CROSSCOMPILING`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CROSSCOMPILING.html)             | 指示是否处于交叉编译模式，布尔值
| [`CMAKE_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_VERSION.html)                                                                                                             | CMake 版本字符串
| [`CMAKE_MAJOR_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MAJOR_VERSION.html)               | [`CMAKE_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_VERSION.html#variable:CMAKE_VERSION) 变量的版本号第一个组成部分
| [`CMAKE_MINOR_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MINOR_VERSION.html)               | [`CMAKE_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_VERSION.html#variable:CMAKE_VERSION) 变量的版本号第二个组成部分
| [`CMAKE_COMMAND`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_COMMAND.html)                           | [`cmake`](https://cmake.com.cn/cmake/help/latest/manual/cmake.1.html#manual:cmake(1)) 可执行程序完整路径
| [`CMAKE_EXECUTABLE_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXECUTABLE_SUFFIX.html)          | 可执行文件名使用的后缀
| [`CMAKE_STATIC_LIBRARY_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LIBRARY_PREFIX.html)  | 静态库文件名使用的前缀
| [`CMAKE_STATIC_LIBRARY_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LIBRARY_SUFFIX.html)  | 静态库文件名使用的后缀
| [`CMAKE_SHARED_LIBRARY_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LIBRARY_PREFIX.html)  | 共享库文件名使用的前缀
| [`CMAKE_SHARED_LIBRARY_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LIBRARY_SUFFIX.html)  | 共享库文件名使用的后缀
| [`CMAKE_MINIMUM_REQUIRED_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MINIMUM_REQUIRED_VERSION.html)  | CMake 被要求的最低版本
| [`CMAKE_PARENT_LIST_FILE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PARENT_LIST_FILE.html)                  | 包含当前 CMake 文件的那个文件的完整路径
| [`CMAKE_TOOLCHAIN_FILE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_TOOLCHAIN_FILE.html)                      | 工具链文件路径


| 改变行为的内置变量                          | 作用                                   
| ---                                       | ---    
| [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html)        | 开启后，在调用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 时若未明确指定库类型，<br>则默认使用 `SHARED`（动态）库而非 `STATIC`（静态）库
| [`CMAKE_BUILD_TYPE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html)          | 指定构建类型，<br>典型值包括 `Debug`, `Release`, `RelWithDebInfo` 和 `MinSizeRel`
| [`CMAKE_INSTALL_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INSTALL_PREFIX.html)  | 指定安装目录
| [`CMAKE_INCLUDE_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INCLUDE_PATH.html)      | 指定 [`find_file()`](https://cmake.com.cn/cmake/help/latest/command/find_file.html#command:find_file) 和 [`find_path()`](https://cmake.com.cn/cmake/help/latest/command/find_path.html#command:find_path) 命令的搜索路径列表
| [`CMAKE_LIBRARY_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LIBRARY_PATH.html)      | 指定 [`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library) 命令的搜索路径列表
| [`CMAKE_PREFIX_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PREFIX_PATH.html)        | 指定 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package)、[`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library) 等的搜索路径前缀列表
| [`CMAKE_PROGRAM_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROGRAM_PATH.html)      | 指定 [`find_program()`](https://cmake.com.cn/cmake/help/latest/command/find_program.html#command:find_program) 命令的搜索路径列表
| [`CMAKE_MODULE_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MODULE_PATH.html)        | 指定由 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 或 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package) 命令加载 CMake 模块的搜索路径
| [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) | 指定编译器的 `--sysroot` 标志的根目录路径
| [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html)  | 指定备选的根目录查找路径列表
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_INCLUDE.html)<br>[`ROOT_PATH_MODE_INCLUDE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_INCLUDE.html) | 控制查找文件和目录时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_LIBRARY.html)<br>[`ROOT_PATH_MODE_LIBRARY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_LIBRARY.html) | 控制查找库时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PACKAGE.html)<br>[`ROOT_PATH_MODE_PACKAGE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PACKAGE.html) | 控制查找包时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PROGRAM.html)<br>[`ROOT_PATH_MODE_PROGRAM`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PROGRAM.html) | 控制查找程序时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH.html)<br>[`USE_SYSTEM_ENVIRONMENT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH.html) | 默认为 `TRUE`，决定是否搜索由标准系统环境变量提供的路径

| 描述系统的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_SYSTEM_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSTEM_NAME.html)                     | 目标操作系统名称：`Linux/Windows/Android`
| [`CMAKE_SYSTEM_PROCESSOR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSTEM_PROCESSOR.html)           | 目标 CPU 架构：`x86_64/aarch64/loongarch64`
| [`CMAKE_HOST_SYSTEM_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_HOST_SYSTEM_NAME.html)           | 本机主机操作系统名称，即 CMake 运行所在的操作系统的名称
| [`CMAKE_HOST_SYSTEM_PROCESSOR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_HOST_SYSTEM_PROCESSOR.html) | 本机主机 CPU 架构，即 CMake 运行所在的机器 CPU 名称
| [`UNIX`](https://cmake.com.cn/cmake/help/latest/variable/UNIX.html)                                               | 当目标系统为 UNIX 或类 UNIX 系统时，设置为 `true`
| [`WIN32`](https://cmake.com.cn/cmake/help/latest/variable/WIN32.html)                                             | 当目标系统为 Windows（包括 Win64）时，设置为 `true`
| [`LINUX`](https://cmake.com.cn/cmake/help/latest/variable/LINUX.html)                                             | 当目标系统为 Linux 时，设置为 `true`
| [`ANDROID`](https://cmake.com.cn/cmake/help/latest/variable/ANDROID.html)                                         | 当目标系统为 Android 时，设置为 `true`


| 控制构建的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_LINKER_TYPE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LINKER_TYPE.html)                           | 指定链接步骤将使用的链接器
| [`CMAKE_EXE_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXE_LINKER_FLAGS.html)                 | 指定可执行文件的链接标志
| [`CMAKE_DEBUG_POSTFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_DEBUG_POSTFIX.html)                       | `Debug` 版本库文件名后缀
| [`CMAKE_INCLUDE_CURRENT_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INCLUDE_CURRENT_DIR.html)           | 自动将当前的源码目录和构建目录添加到包含路径中，<br>默认情况下，`CMAKE_INCLUDE_CURRENT_DIR` 为 `OFF`
| [`CMAKE_SHARED_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LINKER_FLAGS.html)           | 指定动态库的链接标志
| [`CMAKE_STATIC_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LINKER_FLAGS.html)           | 指定静态库的链接标志
| [`CMAKE_ARCHIVE_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_ARCHIVE_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`ARCHIVE`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#archive-output-artifacts) 目标文件的存放位置
| [`CMAKE_LIBRARY_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LIBRARY_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`LIBRARY`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#library-output-artifacts) 目标文件的存放位置
| [`CMAKE_RUNTIME_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_RUNTIME_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`RUNTIME`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#runtime-output-artifacts) 目标文件的存放位置
| [`CMAKE_POSITION_INDEPENDENT_CODE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_POSITION_INDEPENDENT_CODE.html) | 设置非 SHARED 或 MODULE 库上的 [`POSITION_INDEPENDENT_CODE`](https://cmake.com.cn/cmake/help/latest/prop_tgt/POSITION_INDEPENDENT_CODE.html#prop_tgt:POSITION_INDEPENDENT_CODE) 属性，<br>无论如何设置此变量，SHARED 和 MODULE 库目标均默认启用 `PIC`


| 用于语言的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_C_COMPILER`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER.html)                          | 指定 C 编译器的完整路径
| [`CMAKE_C_COMPILER_ID`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER_ID.html)                    | 指定 C 编译器标识字符串
| [`CMAKE_C_STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_C_STANDARD.html)                             | 用于设置 [`C_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD.html#prop_tgt:C_STANDARD)，指定构建目标时所请求的 C 标准特性
| [`CMAKE_C_STANDARD_REQUIRED`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD_REQUIRED.html#prop_tgt:C_STANDARD_REQUIRED) | 布尔值，描述 [`C_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD.html#prop_tgt:C_STANDARD) 的值是否为强制要求
| [`CMAKE_C_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS.html)                                | 指定 C 语言编译选项
| [`CMAKE_C_FLAGS_DEBUG`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_DEBUG.html)                    | C 语言在 `Debug` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_RELEASE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELEASE.html)                | C 语言在 `Release` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_RELWITHDEBINFO`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELWITHDEBINFO.html)  | C 语言在 `RelWithDebInfo` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_MINSIZEREL`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_MINSIZEREL.html)          | C 语言在 `MinSizeRel` 配置下构建时使用的编译选项
| [`CMAKE_CXX_COMPILER`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER.html)                        | CXX 编译器的完整路径
| [`CMAKE_CXX_COMPILER_ID`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER_ID.html)                  | 指定 CXX 编译器标识字符串
| [`CMAKE_CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CXX_STANDARD.html)                         | 用于设置 [`CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/CXX_STANDARD.html#prop_tgt:CXX_STANDARD)，指定构建目标时所请求的 CXX 标准特性
| [`CMAKE_CXX_STANDARD_REQUIRED`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CXX_STANDARD_REQUIRED.html)       | 布尔值，描述 [`CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/CXX_STANDARD.html#prop_tgt:CXX_STANDARD) 的值是否为强制要求
| [`CMAKE_CXX_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS.html)                              | 指定 CXX 语言编译选项
| [`CMAKE_CXX_FLAGS_DEBUG`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_DEBUG.html)                  | CXX 语言在 `Debug` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_RELEASE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELEASE.html)              | CXX 语言在 `Release` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_RELWITHDEBINFO`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELWITHDEBINFO.html) | CXX 语言在 `RelWithDebInfo` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_MINSIZEREL`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_MINSIZEREL.html)        | CXX 语言在 `MinSizeRel` 配置下构建时使用的编译选项

##### 4.2.1.2 环境变量 

根据用途可分为改变行为、控制构建和针对编程语言三类环境变量，使用 `cmake -E environment` 命令行工具可显示所有当前环境变量。

* 改变行为的环境变量

  | 环境变量                | 作用                                   
  | ---                    | ---                               
  | [`CMAKE_INCLUDE_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_INCLUDE_PATH.html)  | 供 [`find_file()`](https://cmake.com.cn/cmake/help/latest/command/find_file.html#command:find_file) 和 [`find_path()`](https://cmake.com.cn/cmake/help/latest/command/find_path.html#command:find_path) 命令搜索。
  | [`CMAKE_LIBRARY_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_LIBRARY_PATH.html)  | 供 [`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library) 命令在其中进行搜索。
  | [`CMAKE_PROGRAM_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_PROGRAM_PATH.html)  | 供 [`find_program()`](https://cmake.com.cn/cmake/help/latest/command/find_program.html#command:find_program) 命令搜索。

  这些环境变量的值可以是单个目录，也可以是目录列表；列表中的目录在 Unix 上以冒号 `:` 分隔，在 Windows 上以分号 `;` 分隔。

* 控制构建的环境变量

  | 环境变量                | 作用                                    
  | ---                    | ---              
  | [`CMAKE_BUILD_TYPE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_BUILD_TYPE.html)         | 首次构建时为 CMAKE_BUILD_TYPE 变量提供默认值
  | [`CMAKE_GENERATOR`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_GENERATOR.html)           | 未通过 `-G` 指定生成器时，作为默认生成器
  | [`CMAKE_INSTALL_PREFIX`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_INSTALL_PREFIX.html) | 覆盖 CMake 默认安装前缀，指定目录值必须是绝对路径
  | [`CMAKE_TOOLCHAIN_FILE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_TOOLCHAIN_FILE.html) | 首次构建时指定默认工具链文件
  | [`DESTDIR`](https://cmake.com.cn/cmake/help/latest/envvar/DESTDIR.html)                           | 在 UNIX 系统上重定向安装路径，如：`make DESTDIR=/package/stage install`
  | [`VERBOSE`](https://cmake.com.cn/cmake/help/latest/envvar/VERBOSE.html)                           | 开启 CMake 与底层构建工具的详细日志输出 
  | [`CMAKE_NO_VERBOSE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_NO_VERBOSE.html)         | 禁用来自 CMake 的详细输出   

* 针对编程语言的环境变量

  首次为相应语言配置构建树时，若对应的 CMake 变量尚未定义，CMake 会用这些环境变量初始化相应的缓存项；变量已定义时，环境变量会被忽略。后续配置使用缓存值。

  | 环境变量                | 用途                         | 对应的 CMake 缓存变量
  | ---                    | ---                          | ---
  | [`CC`](https://cmake.com.cn/cmake/help/latest/envvar/CC.html)             | 指定 C 编译器                 | `CMAKE_C_COMPILER`
  | [`CFLAGS`](https://cmake.com.cn/cmake/help/latest/envvar/CFLAGS.html)     | 提供 C 源文件的默认编译选项    | `CMAKE_C_FLAGS`
  | [`CXX`](https://cmake.com.cn/cmake/help/latest/envvar/CXX.html)           | 指定 C++ 编译器               | `CMAKE_CXX_COMPILER`
  | [`CXXFLAGS`](https://cmake.com.cn/cmake/help/latest/envvar/CXXFLAGS.html) | 提供 C++ 源文件的默认编译选项  | `CMAKE_CXX_FLAGS`

##### 4.2.1.3 缓存变量

缓存变量可通过命令行参数 `-D` 设置，也可在 CMake 代码中使用 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option) 或 [`set(... CACHE ...)`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 定义。它们通常保存在构建目录的 CMakeCache.txt 中。缓存变量是全局可见的变量，通常会在后续配置中保留其值，直到用户或项目显式修改、删除该项，或清除构建目录中的缓存。对于已经存在的缓存项，使用 [`set(... CACHE ...)`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 时默认不会覆盖其值，需要显式覆盖时可使用 `FORCE`。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:8,positionColumn:55,positionLineNumber:8,selectionStartColumn:55,selectionStartLineNumber:8,startColumn:55,startLineNumber:8),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)%0A%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22+FORCE)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

当使用命令行参数 `-D` 设置缓存项时，命令行参数 -D 会在项目命令执行前设置缓存项。项目随后调用 [`set(... CACHE ...)`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 时，如果同名缓存项已存在，默认保留其值；若指定 `FORCE`，则会用 [`set(... CACHE ... FORCE)`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 提供的值覆盖现有缓存值。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:7,positionColumn:55,positionLineNumber:7,selectionStartColumn:55,selectionStartLineNumber:7,startColumn:55,startLineNumber:7),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)%0A%0Aset(StickyCacheVariable+%22Force+Overwrite+StickyCache%22+CACHE+STRING+%22%22+FORCE)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'0',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'-DStickyCacheVariable%3D%22Commandline+always+wins%22',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

同名普通变量可以遮蔽缓存变量。我们可以通过使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 设置一个与缓存变量同名的变量，然后使用 [`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 删除该普通变量来观察这一点。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:45,endLineNumber:6,positionColumn:45,positionLineNumber:6,selectionStartColumn:45,selectionStartLineNumber:6,startColumn:45,startLineNumber:6),source:'set(ShadowVariable+%22In+the+shadows%22+CACHE+STRING+%22%22)%0Aset(ShadowVariable+%22Hiding+the+cache+variable%22)%0Amessage(%22ShadowVariable:+$%7BShadowVariable%7D%22)%0A%0Aunset(ShadowVariable)%0Amessage(%22ShadowVariable:+$%7BShadowVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

#### 4.2.2 变量引用

普通变量
: 引用形式为 `${<variable>}`，并在 带引号参数 或 不带引号参数 中进行评估。变量引用将被指定变量或缓存条目的值替换，如果两者都未设置，则替换为空字符串。变量引用可以嵌套，并从内向外评估，例如：`${outer_${inner_variable}_variable}`。

环境变量 
: 引用形式为 `$ENV{<variable>}`。

缓存变量
: 引用形式为 `$CACHE{<variable>}`，它会被指定缓存条目的值替换，而无需检查同名的常规变量。如果缓存条目不存在，则替换为空字符串。

> 注意：`if()` 命令具有特殊条件语法，允许使用 `<variable>` 的短形式而不是 `${<variable>}` 进行变量引用。但是，环境变量始终需要引用为 `$ENV{<variable>}`。
{: .prompt-warning }

#### 4.2.3 变量作用域

变量具有动态作用域。

块作用域
: [`block()`](https://cmake.com.cn/cmake/help/latest/command/block.html#command:block) 命令可以为变量绑定创建新的作用域。

函数作用域
: [`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 命令可以为变量绑定创建新的作用域。

目录作用域
: 不在函数调用内部的 “设置” 或 “取消设置” 操作会绑定到当前目录作用域。源码树中的每个目录都有其自己的变量绑定。在处理目录的 CMakeLists.txt 文件之前，CMake 会复制父目录中当前定义的所有变量绑定（如果有），以初始化新的目录作用域。

持久化缓存
: CMake 存储了一组独立的“缓存”变量或“缓存条目”，其值在项目构建树的多次运行中保持不变。缓存条目具有独立的绑定作用域，仅通过显式请求进行修改，例如使用 set() 和 unset() 命令的 CACHE 选项。

> 提示：环境变量在 CMake 进程中具有全局作用域，它们永远不会被缓存。
{: .prompt-info }

### 4.3 列表

CMake 中的列表是一组用 `;` 分隔的字符串。CMake 中没有数组，只有列表，它是 CMake 最基础的容器。要创建列表，可以使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 命令。例如：

```cmake
set(srcs a.c b.c c.c) # sets "srcs" to "a.c;b.c;c.c"
message(${srcs}) # the output is "a.c b.c c.c"
```
列表子命令分为三类，包括读取（GET、LENGTH、SUBLIST）、搜索（FIND）和修改（APPEND、PREPEND、INSERT、REMOVE_ITEM、REMOVE_AT、REMOVE_DUPLICATES、REVERSE、SORT、TRANSFORM）。

| 子命令            | 作用                                    | 示例
| ---               | ---                                    | ---
| GET	              | 返回列表中指定索引对应的元素列表         | [`list(GET <list> <element index> [<index> ...] <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#get)
| LENGTH            | 获取列表元素个数                        | [`list(LENGTH <list> <output variable>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#length)
| SUBLIST	          | 截取一段子列表	                        | [`list(SUBLIST <list> <begin> <length> <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#sublist)
| FIND              | 查找元素，返回索引；找不到返回-1          | [`list(FIND <list> <value> <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#find)
| APPEND            | 追加元素到列表尾部	                    | [`list(APPEND <list> [<element>...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#append)
| PREPEND	          | 插入到列表头部                          | [`list(PREPEND <list> [<element>...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#prepend)
| INSERT            | 在指定索引位置插入元素	                | [`list(INSERT <list> <element_index> <element> [<element> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#insert)
| REMOVE_ITEM       | 从列表中移除指定项目的所有实例            | [`list(REMOVE_ITEM <list> <value> [<value> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-item)
| REMOVE_AT         | 移除列表中给定索引处的项目               | [`list(REMOVE_AT <list> <index> [<index> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-at)
| REMOVE_DUPLICATES | 移除列表中的重复项目                     | [`list(REMOVE_DUPLICATES <list>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-duplicates)
| REVERSE	          | 反转列表                                | [`list(REVERSE <list>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#reverse)
| SORT	            | 按字母顺序原地排序列表                  | [`list(SORT <list> [...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#sort)
| TRANSFORM	        | 将 `<ACTION>` 应用于所有元素	          | [`list(TRANSFORM <list> <ACTION> [...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-duplicates)

### 4.3 命令

CMake 命令分为 [脚本命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#id3)、[项目命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#project-commands) 和 [CTest 命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#ctest-commands)。

#### 4.3.1 命令参数

命令调用中有三种类型的参数：括号参数、引号参数和无引号参数。

##### 4.3.1.1 括号参数

将内容括在等长的左右“括号”之间。左括号的写法是 `[` 后跟零个或多个 `=`，再后跟 `[`。对应的右括号写法是 `]` 后跟相同数量的 `=`，再后跟 `]`。括号不能嵌套。

括号参数的内容包含左右括号之间的所有文本，但紧跟在左括号后的换行符（如果有）会被忽略。不对括起来的内容进行任何求值（如 转义序列 或 变量引用）。括号参数始终作为一个单一参数传递给命令调用。

```cmake
message([=[
This is the first line in a bracket argument with bracket length 1.
No \-escape sequences or ${variable} references are evaluated.
This is always one argument even though it contains a ; character.
The text does not end on a closing bracket of length 0 like ]].
It does end in a closing bracket of length 1.
]=])
```

##### 4.3.1.2 带引号参数

引号参数将内容括在左右双引号字符之间。引号参数的内容包含左右引号之间的所有文本。转义序列 和 变量引用 都会被求值。引号参数始终作为一个单一参数传递给命令调用。

```cmake
message("This is a quoted argument containing multiple lines.
This is always one argument even though it contains a ; character.
Both \\-escape sequences and ${variable} references are evaluated.
The text does not end on an escaped double-quote like \".
It does end in an unescaped double quote.
")
```

在任何以奇数个反斜杠结尾的行上，最后的 `\` 会被视为续行符，并与紧随其后的换行符一起被忽略。例如：

```cmake
message("\
This is the first line of a quoted argument. \
In fact it is the only line but since it is long \
the source code uses line continuation.\
")
```

##### 4.3.1.3 不带引号参数

无引号参数不被任何引号语法括起来。它不能包含任何空格、`(`、`)`、`#`、`"` 或 `\`，除非这些字符被反斜杠转义。无引号参数的内容由连续的允许字符或转义字符块组成。转义序列 和 变量引用 都会被求值。生成的值会按照 列表 分割元素的方式进行拆分。每个非空元素都被作为一个参数传递给命令调用。因此，一个无引号参数可能作为零个或多个参数传递给命令调用。

```cmake
foreach(arg
    NoSpace
    Escaped\ Space
    This;Divides;Into;Five;Arguments
    Escaped\;Semicolon
    )
  message("${arg}")
endforeach()
```

#### 4.3.2 命令调用

命令调用是一个名称，后跟括号括起来的由空格分隔的参数。例如：

```cmake
add_executable(hello world.c)
```
命令名称不区分大小写。

#### 4.3.3 命令分类

##### 4.3.3.1 脚本命令

可在脚本模式下执行的命令称为脚本命令，常用的脚本命令列举如下：

| 类型             | 作用                                          
| ---             | --- 
| [`cmake_host_system_information`](https://cmake.com.cn/cmake/help/latest/command/cmake_host_system_information.html) | 查询各类主机系统信息
| [`cmake_minimum_required`](https://cmake.com.cn/cmake/help/latest/command/cmake_minimum_required.html) | 设置项目的 CMake 最低要求版本
| [`cmake_parse_arguments`](https://cmake.com.cn/cmake/help/latest/command/cmake_parse_arguments.html) | 解析函数或宏的参数
| [`cmake_path`](https://cmake.com.cn/cmake/help/latest/command/cmake_path.html) | 路径操作
| [`cmake_pkg_config`](https://cmake.com.cn/cmake/help/latest/command/cmake_pkg_config.html) | 处理 pkg-config 格式的包文件
| [`configure_file`](https://cmake.com.cn/cmake/help/latest/command/configure_file.html) | 将文件复制到另一个位置并修改其内容
| [`block`](https://cmake.com.cn/cmake/help/latest/command/block.html) / [`endblock`](https://cmake.com.cn/cmake/help/latest/command/endblock.html) | 在一个专用的变量和/或策略作用域内执行一组命令
| [`break`](https://cmake.com.cn/cmake/help/latest/command/break.html) | 从外层的 foreach 或 while 循环中跳出
| [`continue`](https://cmake.com.cn/cmake/help/latest/command/continue.html) | 继续执行外层 foreach 或 while 循环的顶部
| [`if`](https://cmake.com.cn/cmake/help/latest/command/if.html) / [`elseif`](https://cmake.com.cn/cmake/help/latest/command/elseif.html) / [`else`](https://cmake.com.cn/cmake/help/latest/command/else.html) / [`endif`](https://cmake.com.cn/cmake/help/latest/command/endif.html) | 有条件地执行一组命令
| [`execute_process`](https://cmake.com.cn/cmake/help/latest/command/execute_process.html) | 执行一个或多个子进程
| [`file`](https://cmake.com.cn/cmake/help/latest/command/file.html) | 文件操作
| [`find_file`](https://cmake.com.cn/cmake/help/latest/command/find_file.html) | 查找指定文件的完整路径
| [`find_library`](https://cmake.com.cn/cmake/help/latest/command/find_library.html) | 查找库
| [`find_package`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) | 查找包
| [`find_path`](https://cmake.com.cn/cmake/help/latest/command/find_path.html) | 查找包含指定文件的目录
| [`find_program`](https://cmake.com.cn/cmake/help/latest/command/find_program.html) | 查找程序
| [`foreach`](https://cmake.com.cn/cmake/help/latest/command/foreach.html) / [`endforeach`](https://cmake.com.cn/cmake/help/latest/command/endforeach.html) | 针对列表中的每一项执行一组命令
| [`function`](https://cmake.com.cn/cmake/help/latest/command/function.html) / [`endfunction`](https://cmake.com.cn/cmake/help/latest/command/endfunction.html) | 定义一个函数
| [`get_directory_property`](https://cmake.com.cn/cmake/help/latest/command/get_directory_property.html) | 获取目录作用域的属性
| [`get_filename_component`](https://cmake.com.cn/cmake/help/latest/command/get_filename_component.html) | 获取完整文件名的特定部分
| [`get_property`](https://cmake.com.cn/cmake/help/latest/command/get_property.html) | 获取一个属性
| [`include`](https://cmake.com.cn/cmake/help/latest/command/include.html) | 从文件或模块加载并运行 CMake 代码
| [`list`](https://cmake.com.cn/cmake/help/latest/command/list.html) | 对分号分隔的列表进行操作
| [`macro`](https://cmake.com.cn/cmake/help/latest/command/macro.html) / [`endmacro`](https://cmake.com.cn/cmake/help/latest/command/endmacro.html) | 定义一个宏
| [`message`](https://cmake.com.cn/cmake/help/latest/command/message.html) | 记录并输出消息
| [`option`](https://cmake.com.cn/cmake/help/latest/command/option.html) | 提供可以选择的布尔选项
| [`return`](https://cmake.com.cn/cmake/help/latest/command/return.html) | 从文件、目录或函数中返回
| [`separate_arguments`](https://cmake.com.cn/cmake/help/latest/command/separate_arguments.html) | 将命令行参数解析为以分号分隔的列表
| [`set`](https://cmake.com.cn/cmake/help/latest/command/set.html) / [`unset`](https://cmake.com.cn/cmake/help/latest/command/unset.html) | 设置/取消变量、缓存变量或环境变量
| [`set_directory_properties`](https://cmake.com.cn/cmake/help/latest/command/set_directory_properties.html) | 设置当前目录及其子目录的属性
| [`set_property`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) | 在给定的作用域内设置命名的属性
| [`string`](https://cmake.com.cn/cmake/help/latest/command/string.html) | 字符串操作
| [`variable_watch`](https://cmake.com.cn/cmake/help/latest/command/variable_watch.html) | 监视 CMake 变量的变化
| [`while`](https://cmake.com.cn/cmake/help/latest/command/while.html) / [`endwhile`](https://cmake.com.cn/cmake/help/latest/command/endwhile.html) | 在条件为真时执行一组命令

##### 4.3.3.2 项目命令

只能在项目模式中使用，不能在脚本模式中使用的命令为项目命令，常用的项目命令列举如下：

| 类型             | 作用                                          
| ---             | --- 
| [`add_compile_definitions`](https://cmake.com.cn/cmake/help/latest/command/add_compile_definitions.html) | 向编译器添加预处理器定义
| [`add_compile_options`](https://cmake.com.cn/cmake/help/latest/command/add_compile_options.html) | 向编译器添加编译选项，这些选项不会用于链接阶段
| [`add_custom_command`](https://cmake.com.cn/cmake/help/latest/command/add_custom_command.html) | 添加自定义命令
| [`add_custom_target`](https://cmake.com.cn/cmake/help/latest/command/add_custom_target.html) | 添加自定义目标
| [`add_definitions`](https://cmake.com.cn/cmake/help/latest/command/add_definitions.html) | 为源文件的编译添加 `-D` 定义标志
| [`add_dependencies`](https://cmake.com.cn/cmake/help/latest/command/add_dependencies.html) | 在顶层目标之间添加依赖关系
| [`add_executable`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html) | 添加一个可执行文件
| [`add_library`](https://cmake.com.cn/cmake/help/latest/command/add_library.html) | 添加一个库目标
| [`add_link_options`](https://cmake.com.cn/cmake/help/latest/command/add_link_options.html) | 添加链接选项，不能用于为静态库目标添加选项，因为它们不使用链接器
| [`add_subdirectory`](https://cmake.com.cn/cmake/help/latest/command/add_subdirectory.html) | 向构建中添加一个子目录
| [`aux_source_directory`](https://cmake.com.cn/cmake/help/latest/command/aux_source_directory.html) | 收集指定目录中所有源文件的名称
| [`get_source_file_property`](https://cmake.com.cn/cmake/help/latest/command/get_source_file_property.html) | 获取源文件的属性
| [`get_target_property`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html) | 获取目标的属性
| [`include_directories`](https://cmake.com.cn/cmake/help/latest/command/include_directories.html) | 向构建中添加头文件搜索目录
| [`install`](https://cmake.com.cn/cmake/help/latest/command/install.html) | 指定在安装时运行的规则
| [`link_directories`](https://cmake.com.cn/cmake/help/latest/command/link_directories.html) | 添加链接器查找库时所使用的目录
| [`project`](https://cmake.com.cn/cmake/help/latest/command/project.html) | 设置项目名称
| [`remove_definitions`](https://cmake.com.cn/cmake/help/latest/command/remove_definitions.html) | 移除由 `add_compile_definitions()` 或 `add_definitions()` 添加的编译定义
| [`set_source_files_properties`](https://cmake.com.cn/cmake/help/latest/command/set_source_files_properties.html) | 设置源文件的属性
| [`set_target_properties`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html) | 设置目标的属性
| [`target_compile_definitions`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html) | 向目标添加编译定义
| [`target_compile_features`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html) | 向目标添加所需的编译器特性
| [`target_compile_options`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html) | 向目标添加编译选项
| [`target_include_directories`](https://cmake.com.cn/cmake/help/latest/command/target_include_directories.html) | 为目标添加包含目录
| [`target_link_directories`](https://cmake.com.cn/cmake/help/latest/command/target_link_directories.html) | 为目标添加链接目录
| [`target_link_libraries`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html) | 为目标添加链接库
| [`target_link_options`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html) | 为目标添加链接选项
| [`target_precompile_headers`](https://cmake.com.cn/cmake/help/latest/command/target_precompile_headers.html) | 添加一个需要预编译的头文件列表
| [`target_sources`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html) | 向目标添加源文件
| [`try_compile`](https://cmake.com.cn/cmake/help/latest/command/try_compile.html) | 尝试构建一些代码
| [`try_run`](https://cmake.com.cn/cmake/help/latest/command/try_run.html) | 尝试编译并运行一些代码

### 4.4 函数和宏

通过将相同或相似的功能进行抽象形成宏或函数，可避免在文件中出现大量重复相似的命令集，这可以借助 [`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 和 [`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro) 来实现。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:14,endLineNumber:7,positionColumn:14,positionLineNumber:7,selectionStartColumn:14,selectionStartLineNumber:7,startColumn:14,startLineNumber:7),source:'macro(MyMacro+MacroArgument)%0A++message(%22$%7BMacroArgument%7D%5Cn%5Ct%5CtFrom+Macro%22)%0Aendmacro()%0A%0Afunction(MyFunc+FuncArgument)%0A++MyMacro(%22$%7BFuncArgument%7D%5Cn%5CtFrom+Function%22)%0Aendfunction()%0A%0AMyFunc(%22From+TopLevel%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

与许多语言一样，函数和宏的区别在于作用域。`macro()` 在语义上类似于文本替换，类似于 C/C++ 宏，因此宏产生的任何副作用在调用它的上下文中都是可见的。如果我们宏中创建或更改一个变量，调用者将会看到该更改。`function()` 会创建自己的变量作用域，因此副作用对调用者不可见。为了将更改传播给调用该函数的父级，我们必须使用 `set(<var> <value> PARENT_SCOPE)`，它的工作方式与 `set()` 相同，但仅针对属于调用者上下文的变量。

### 4.5 控制结构

#### 4.5.1 条件块

有条件地执行一组命令，由 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 命令组织。

```cmake
if(<condition>)
  <commands>
elseif(<condition>) # optional block, can be repeated
  <commands>
else()              # optional block
  <commands>
endif()
```

根据下文描述的 条件语法 评估 if 子句的 condition 参数。如果结果为真，则执行 if 块中的 commands。否则，将以相同方式处理可选的 elseif 块。最后，如果没有任何 condition 为真，则执行可选的 else 块中的 commands。

##### 4.5.1.1 基础表达式

`if(<constant>)`
: 如果常量为 1、ON、YES、TRUE、Y 或非零数字（包括浮点数），则为真。如果常量为 0、OFF、NO、FALSE、N、IGNORE、NOTFOUND、空字符串或以 -NOTFOUND 后缀结尾，则为假。布尔常量不区分大小写。如果参数不是这些特定常量之一，它将被视为变量或字符串（请参阅下文的 变量展开），并适用以下两种形式之一。

`if(<variable>)`
: 如果给定的变量定义为非假常量的某个值，则为真。否则为假，包括变量未定义的情况。注意，宏参数不是变量。环境变量 也不能以这种方式测试，例如 if(ENV{some_var}) 的求值结果永远为假。

`if(<string>)`
: 引号括起来的字符串总是被判定为假，除非字符串的值是真常量之一。

`if()`
: 如果未提供参数，则为假。

##### 4.5.1.2 逻辑运算符

`if(NOT <condition>)`
: 如果条件不为真，则为真。

`if(<cond1> AND <cond2>)`
: 如果两个条件都为真，则为真。

`if(<cond1> OR <cond2>)`
: 如果两个条件中任一条件被视为真，则为真。

`if((condition) AND (condition OR (condition)))`
: 圆括号内的条件首先被求值，然后剩余的条件按其他示例中的方式求值。如果存在嵌套的圆括号，最内层的圆括号会作为评估包含它们的条件的一部分进行求值。

##### 4.5.1.3 存在性检查

`if(COMMAND <command-name>)`
: 如果给定名称是可调用的命令、宏或函数，则为真。

`if(TARGET <target-name>)`
: 如果给定名称是一个已存在的逻辑目标名称，且已通过调用 add_executable()、add_library() 或 add_custom_target() 命令（在任何目录中）创建，则为真。

`if(TEST <test-name>)`
: 如果给定名称是由 add_test() 命令创建的现有测试名称，则为真。

`if(DEFINED <name>|CACHE{<name>}|ENV{<name>})`
: 如果定义了具有给定 <name> 的变量、缓存变量或环境变量，则为真。变量的值无关紧要。注意以下注意事项：
  * 宏参数不是变量。
  * 无法直接测试 <name> 是否为非缓存变量。如果缓存变量或非缓存变量 someName 存在，表达式 if(DEFINED someName) 将为真。相比之下，表达式 if(DEFINED CACHE{someName}) 仅在缓存变量 someName 存在时才为真。如果您需要了解非缓存变量是否存在，则必须测试这两个表达式：if(DEFINED someName AND NOT DEFINED CACHE{someName})。

`if(<variable|string> IN_LIST <variable>)`
: 如果给定的元素包含在命名的列表变量中，则为真。

##### 4.5.1.4 文件操作

`if(EXISTS <path-to-file-or-directory>)`
: 如果命名文件或目录存在且可读，则为真。行为仅对明确的完整路径定义良好（路径开头的 ~/ 不会展开为主目录，并被视为相对路径）。解析符号链接，即如果命名文件或目录是符号链接，则在符号链接的目标存在时返回真。如果给定路径为空字符串，则为假。

`if(IS_READABLE <path-to-file-or-directory>)`
: 如果命名文件或目录可读，则为真。行为仅对明确的完整路径定义良好。解析符号链接，即如果命名文件或目录是符号链接，则在符号链接的目标可读时返回真。如果给定路径为空字符串，则为假。

`if(IS_WRITABLE <path-to-file-or-directory>)`
: 如果命名文件或目录可写，则为真。行为仅对明确的完整路径定义良好。解析符号链接，即如果命名文件或目录是符号链接，则在符号链接的目标可写时返回真。如果给定路径为空字符串，则为假。

`if(IS_EXECUTABLE <path-to-file-or-directory>)`
: 如果命名文件或目录可执行，则为真。行为仅对明确的完整路径定义良好。解析符号链接，即如果命名文件或目录是符号链接，则在符号链接的目标可执行时返回真。如果给定路径为空字符串，则为假。

`if(IS_DIRECTORY <path>)`
: 如果 path 是一个目录，则为真。行为仅对完整路径定义良好。如果给定路径为空字符串，则为假。

`if(IS_SYMLINK <path>)`
: 如果给定路径是符号链接，则为真。行为仅对完整路径定义良好。

`if(IS_ABSOLUTE <path>)`
: 如果给定路径是绝对路径，则为真。注意以下特殊情况：
  * 空 path 会评估为假。
  * 在 Windows 主机上，任何以驱动器号加冒号（例如 C:）、正斜杠或反斜杠开头的 path 都会评估为真。
  * 在非 Windows 主机上，任何以波浪号（~）开头的 path 都会评估为真。
  
`if(<file1> IS_NEWER_THAN <file2>)`
: 如果 file1 比 file2 新，或者两个文件中的一个不存在，则为真。行为仅对完整路径定义良好。如果文件时间戳完全相同，IS_NEWER_THAN 比较将返回真，以便在平局时发生任何相关的构建操作。这包括为 file1 和 file2 传递相同文件名的情形。

##### 4.5.1.4 比较

`if(<variable|string> MATCHES <regex>)`
: 如果给定的字符串或变量的值与给定的正则表达式匹配，则为真。

`if(<variable|string> LESS/GREATER/EQUAL/LESS_EQUAL/GREATER_EQUAL <variable|string>)`
: 如果给定的字符串或变量的值被解析为实数（类似于 C 语言中的 double）且小于/大于/等于/小于等于/大于等于右侧的值，则为真。

`if(<variable|string> STRLESS/STRGREATER/STREQUAL/STRLESS_EQUAL/STRGREATER_EQUAL <variable|string>)`
: 如果给定的字符串或变量的值在字典序上小于/大于/等于/小于等于/大于等于右侧的字符串或变量，则为真。

#### 4.5.2 循环

CMake 提供两种循环结构：[`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 以及更有用的 [`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach)。

##### 4.5.2.1 [`foreach`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#foreach)

针对列表中的每个值评估一组命令。

```cmake
foreach(<loop_var> <items>)
  <commands>
endforeach()
```

其中 `<items>` 是由分号或空格分隔的项目列表。[`foreach`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#foreach) 和对应的 [`endforeach`](https://cmake.com.cn/cmake/help/latest/command/endforeach.html#command:endforeach) 之间的所有命令都会被记录而不会立即执行。一旦评估到 `endforeach`，记录的命令列表将针对 `<items>` 中的每个项目执行一次。在每次迭代开始时，变量 `<loop_var>` 将被设置为当前项目的值。

> 提示：`<loop_var>` 的作用域仅限于循环内部。
{: .prompt-info }

`foreach` 在上述标准格式基础上存在多种变体，如：

`foreach(<loop_var> RANGE <stop>)`
: 在此变体中，`foreach` 遍历从 0、1 开始直到（并包含）非负整数 `<stop>` 的数字。

`foreach(<loop_var> RANGE <start> <stop> [<step>])`
: 在此变体中，`foreach` 以 `<step>` 为步长，遍历从 `<start>` 开始到最多 `<stop>` 的数字。如果未指定 `<step>`，则步长为 1。三个参数 <`start>`、`<stop>` 和 `<step>` 都必须是非负整数，且 `<stop>` 不得小于 `<start>`，否则，将引发未定义行为。

`foreach(<loop_var> IN [LISTS [<lists>]] [ITEMS [<items>]])`
: 在此变体中，`<lists>` 是由空格或分号分隔的列表变量列表。`foreach` 命令遍历每个给定列表中的每一项。`ITEMS` 关键字后面的 `<items>` 将按照 `foreach` 命令的第一种变体进行处理。格式 `LISTS A` 和 `ITEMS ${A}` 是等效的。如果没有提供 `<lists>` 或 `<items>`，则循环体永远不会被执行（即被处理为空）。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:11,endLineNumber:1,positionColumn:11,positionLineNumber:1,selectionStartColumn:11,selectionStartLineNumber:1,startColumn:11,startLineNumber:1),source:'set(A+0%3B1)%0Aset(B+2+3)%0Aset(C+%224+5%22)%0Aset(D+6%3B7+8)%0Aset(E+%22%22)%0Aforeach(X+IN+LISTS+A+B+C+D+E)%0A++++message(STATUS+%22X%3D$%7BX%7D%22)%0Aendforeach()'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

`foreach(<loop_var>... IN ZIP_LISTS <lists>)`
: 在此变体中，`<lists>` 是由空格或分号分隔的列表变量列表。`foreach` 命令同时遍历每个列表，并按如下方式设置迭代变量：
  * 如果只给定一个 loop_var，则它会设置一系列 loop_var_N 变量为对应列表中的当前项；
  * 如果传递了多个变量名，则它会将每个变量设置为对应列表中的当前项。迭代变量的数量必须与列表变量的数量相匹配。

  如果没有提供 <lists>，则循环体永远不会被执行（即被处理为空）。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:13,endLineNumber:10,positionColumn:13,positionLineNumber:10,selectionStartColumn:13,selectionStartLineNumber:10,startColumn:13,startLineNumber:10),source:'list(APPEND+English+one+two+three+four)%0Alist(APPEND+Bahasa+satu+dua+tiga)%0A%0Aforeach(num+IN+ZIP_LISTS+English+Bahasa)%0A++++message(STATUS+%22num_0%3D$%7Bnum_0%7D,+num_1%3D$%7Bnum_1%7D%22)%0Aendforeach()%0A%0Aforeach(en+ba+IN+ZIP_LISTS+English+Bahasa)%0A++++message(STATUS+%22en%3D$%7Ben%7D,+ba%3D$%7Bba%7D%22)%0Aendforeach()'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

##### 4.5.2.2 [`while`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while)

在条件为真时执行一组命令

```cmake
while(<condition>)
  <commands>
endwhile()
```

[`while`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 与匹配的 [`endwhile()`](https://cmake.com.cn/cmake/help/latest/command/endwhile.html#command:endwhile) 之间的所有命令都会被记录而不会立即执行。一旦 endwhile() 被求值，只要 `<condition>` 为真，记录的命令列表就会被执行。

`<condition>` 的语法与求值逻辑与 `if()` 命令中详细描述的内容一致。

##### 4.5.2.3 跳出控制流

命令 [`break()`](https://cmake.com.cn/cmake/help/latest/command/break.html#command:break) 和 [`continue()`](https://cmake.com.cn/cmake/help/latest/command/continue.html#command:continue) 提供了跳出正常控制流的手段。break() 命令从外层的 foreach 或 while 循环中跳出。continue() 命令中止 foreach() 或 while() 循环当前迭代的剩余部分，并从下一次迭代的顶部开始。

## 5. CMake 构建系统

基于 CMake 的构建系统组织为一组高层级的逻辑目标。每个目标对应一个可执行文件或库，或者是一个包含自定义命令的自定义目标。目标之间的依赖关系在构建系统中进行表达，以确定构建顺序以及在发生变更时进行重新生成的规则。

<iframe style="display:block;width:100%;height:clamp(480px,80vh,800px);margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#z:OYLghAFBqd5TKALEAXATgU0wGgJYgQBGArngDYAmAygJ4DOqmAtiAMbMCGA1rqRTQZNmAQXTB6hDj0wgA5AFoAIgGEAsiIDSAUQD6AIQCqASQAyS3QBUAmgAVtAUgDMSgEqZyAdTyokSzETGAHYAZgD2cgCUONK8YhLyyupaekZmFjb2zm4e3r7%2BgaERMWHMAA4UmOimnEHAJJzAmMaU7A4ATPod%2BjEkjKUA8iSoZcMAYpVBnMyyvpi6mAAemGzDnETkuCGVkrCYlD5h6C0gAGw425snAIwALBeT07JceEEAdGxlZTigcnL49GCbHIJEo%2B3kAAZ/nh6GpOK9qGESOg2LI5NdofQBmVMEFIf9yLVgCc/tEIPtDsdWtcHldqQBWWm4p4gdQyUww1D0N6oRaoH7yMroMIAKxWqAg9CQnBx9EiDghIgVIli82YrzwzBIzF0WAAjmQsJQIAA1bSuajGAYAOQA1E43vT5YrlZxKJQFstVqh1ptJdLZQbOFhlbaw7apTLMPQAPRsPAozYfL6h8OR2UxrBsH11JOfMqpsMvd7551KxU%2B8SYVC6civbi1vBEdDBvDR/1R%2BhBkOK8O2kLMVCUMuYoEgsGtORQgFwhFIlFo6cw7G4/E4Ql1E6qskU1BHE7tJk3c6XZkzEBYejz1GxpAechhHl8gVyZUACXvYRwtoA7kcqGAYDKsqCigQoyqWHetraEElDKqOQTAqC4JTpis5BIiyKovIGIAiueKoeuRJbt03Q7gce5UiAThHtSACcTJTOeeCPvmL4IUhE5rjC6GYQuOGYvha4bsSk5RDg5IUfurT3KeB4QoxLIsW8SDsQCY7IZOS6wvCGHXmiuHLjiBHTiJJJRNEMJsrwtjCmK2ZriKIA0kEmA/hMdIgO01zROQ8j0v8Jn/GE8iWFgmC2h0Ti4ag%2BKRNE3BeRCjq3AA7HRtz0u0EL0mlGW5eu8i3P8rCnO0bzXO09JOLcOV0fl9IQk45xBTgIV/DgkgKbFqFkogEAoEsKzDEc%2BCEMGEi2LUHjUEgYQ/gRuFsKUFSEqgLFBFNrnkLN82Lf8y3lJU6AgMA1xZSUR2bOg1osh1h2rVUQyoLtC0CTgQ1sPEkiXvpt6fk%2B/KfdQQ6vPI/zhEEL1sJwmzObJYRQ4Y9CYLYiyOc5RF1G0nTdOuTa7FATGyAO/IAG5VPIqXXE4FltWU62I5IiiMHBLhsKRnTZbaCgDE4PMhOQe7BRT6DoHgYKE9E6AkFDmqYJYYRhOQUudaDm3TTtc1vei/wYNgmM/i2ZQCb5/mBWu7XaF6I3oLaiwABynAopy3LawBsGwtrnW87S2hAKicz0tphdgkXtNFkR63FEkoA9x1jRA8fXad52HpcTDoJIxBrkQrzBrQ7151M6C0AMRD2T1S2lDMUMDEE5CF4RYKkMAKiwyr71glwuaLv8BxZutFPM9On3DAZ0JQx4wlNi2pcqGEYJrhgmrvaLRBhCj/g98AdbY71FyEhIJptj%2BQm6xciPQ7Dsh3JfSMo2jGM0SJONdJ0%2BNEITEDEyApM4KLKmNM6ZhAZhtZmChWbZA5rjLmEIeZ8wFkLYoYRRbi0lvAaIKNNjZg2oQXElAF4gmYHia45wCEclctabURBKaVRwGUTePgNpEO1KQ84jD6DMMRpQzA1DmC0JOvQ7B4oNog2DKgVhJDnLnBEbgxG4j0CoF4fwwRzlDyMAkVI9hasJEqJoXQ9o0R9a3zNnIAKOBWrtXtk7F2bsPZex9n7CAocIpRR8tHXq0Q7xukphAMxxUcCsCcKlN4DtUq3FOPSDKEIcq3FuHRV2ljLbg06iAbqcUErUQdLE%2Bk1UyHVRqnRVKh4/JyFpskwi7VPFQj6vAOAsA46L0wNoKS6BE6nl/sWZM3xIbXzhnfPpyNUbo0Ik5c4r8YHvx6HIxmeJySwW0ZjChrw%2BEGJOg7BhTC5lLJpJw7hQR9ECMpps2ZYjKySOVmwzGZyFEXKOWo05Fzdm6KUQ8k5WD9LyCiq8TibinAqFJnGI4mAVLOEcC6F0Edfnjjce0doykkAdHaMBRUrxUC2mLP4yKqUui9nDKTEAIAhToogMijyEVlpTyhpIBw9IVBBAcLiplShkXfiaDWSgnAfT%2BPlE4PFSpUqssVOJMpFirEgG6WxHqtTY7sGaa0ykHTHjnmspgDkjBuS8n5H06gMMBkIwfiMjGNJJlcF4J1DwojEb4MWVc6RNIVlUPWc5PZ2yWH2tIVsrhcz3lCJpLcjCzzPU3KtfIoNejVmqLoQG4NxCvWaLeVGl11wfKdS%2BXIVUuh1RBE1NqXUmADQJn2Kac0lobT2kdGWZUQpRTig7LKatio3QejHj6DYmAIBzE9MNdtmxCy2mUvmAdUqvhNpEJWDljYggNjrM2Vs7Zu1tt9JgAdpNhzwTMeKlJaqNVckBjgGV4kBryrBIqyiyrNi/1%2BlhaMMY7zkAfAe3V%2Brb6GtQMMp%2BYyvJY1AFMvGgbbWEJDY62CfqzjeoOS8/Zvrk3HJOrIsNczFGXPjaGnByH7lwbUbIuN1zY2RudfBs4nzb3fMVB%2BR9X5fz/koIBVFIgwLgUVJBCKME4Iiq3RbKpF5ox/XvQDbVh6Y4nuWmetpl6zyyCHV8e%2B/S31yc/aM6cTkX5EjfgBpDeCFnAbQ6Byg4GGIwY9XpyDsGiNqIYoGlDLzrNYYs5TKzeGHWvOUdhxzpH%2BKvmhYhWFkUAUhEYFgaY4LgI%2Bb%2Bf5lQQXXjAFC5CkQrMiXRbqO7asuguU8siDigVfZEsgDwIF/W0xB2BbJfCm9C5/pUcBsivlOXwx9Bi7aYwGLsgRiHESzkwWBEkBCLoHwVRuVHGcCoNg0p0Chf5QOrAqBkRBHa60EAyXgAQBaxAArcpvxrfis4AVLLN2FXMdx6cIUZPfCPWSJp4mlUEAgJ0pSj5VIvpvvDRTj9lP/CcvcSZQdLUYe0wQl5Tq1nEaM%2B6xG0HweHPcydKzWm7laJA3961Eak0Odh652z9mQeWc89hbzTgCuwUwCEW0YwBgDF0G%2BMLTgwTbFcmTinVOGM/N88hSLy24vlgSx1pbK8UtToy5wfxu2WcRwIQVg7YrjvBXy494TXicA%2BLBCdfxOBEq3Adm8eJOvdd68O4E0q5VKrVVqtEhqTUWopI6pIGkF2JL9RQEiEYwwOlXz1S9wZV8lPP0PeFCWhtjam0O9unjchnqjAxWEUnjtnau3dp7b29Jfb%2BwXldKo4cnBOCjgr2p3jMC%2BNVwEkq1FQnhMidE2qcSElJIlTb9Jue6aJVOKcN49V4mnAdjVFvjV2ibLKRUuvNS6ZlPaDLtqqSLvRFFlwm1twgA"></iframe>

### 5.1 二进制目标

使用 add_executable() 和 add_library() 命令定义可执行文件和库。生成的二进制文件具有目标平台适用的 PREFIX、SUFFIX 和扩展名。二进制目标之间的依赖关系使用 target_link_libraries() 命令表达。

```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
add_executable(zipapp zipapp.cpp)
target_link_libraries(zipapp archive)
```

archive 被定义为 STATIC 库——一个包含由 archive.cpp、zip.cpp 和 lzma.cpp 编译生成的对象文件的归档。 zipapp 被定义为通过编译并链接 zipapp.cpp 形成的可执行文件。链接 zipapp 可执行文件时，会链接入 archive 静态库。

#### 5.1.1 可执行文件

可执行文件是通过链接对象文件在一起创建的二进制文件，其中一个包含程序入口点，例如 main。通过 add_executable() 命令定义一个可执行目标。

```cmake
add_executable(mytool mytool.cpp)
```

CMake 生成构建规则，将源文件编译为对象文件，并将它们链接成可执行文件。

可执行文件的链接依赖项可以使用 target_link_libraries() 命令指定。链接器从编译自可执行文件自身源文件的对象文件开始，然后通过搜索链接的库来解析剩余的符号依赖项。

#### 5.1.2 静态库

静态库是对象文件的归档。它们由归档工具而非链接器产生。可执行文件、共享库 和 模块库 可以链接到静态库作为依赖项。链接器根据需要从静态库中选择对象文件子集以解析符号，并将它们链接到消耗它们的二进制文件中。每个链接到静态库的二进制文件都会获得一份符号副本，且静态库本身在运行时不需要。

add_library() 命令在调用时使用 STATIC 库类型定义静态库目标

```cmake
add_library(archive STATIC archive.cpp zip.cpp lzma.cpp)
```

或者当 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS) 变量为 false 时，不指定类型。

```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
```

CMake 生成构建规则，将源文件编译为对象文件，并将其归档到静态库中。

静态库的链接依赖项可以使用 target_link_libraries() 命令指定。由于静态库是归档而非链接的二进制文件，来自其链接依赖项的对象文件不会包含在库本身中（指定为直接链接依赖项的 对象库 除外）。相反，CMake 会记录静态库的链接依赖项，以便在链接消耗它们的二进制文件时进行传递性使用。

#### 5.1.3 共享库

共享库是通过链接对象文件在一起创建的二进制文件。可执行文件、其他共享库和 模块库 可以链接到共享库作为依赖项。链接器在消耗它们的二进制文件中记录对共享库的引用。在运行时，动态加载器在磁盘上搜索引用的共享库并加载它们的符号。

add_library() 命令在调用时使用 SHARED 库类型定义共享库目标

```cmake
add_library(archive SHARED archive.cpp zip.cpp lzma.cpp)
```

或者当 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS) 变量为 true 时，不指定类型。

```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
```

CMake 生成构建规则，将源文件编译为对象文件，并将它们链接成共享库。

共享库的链接依赖项可以使用 target_link_libraries() 命令指定。链接器从编译自共享库自身源文件的对象文件开始，然后通过搜索链接的库来解析剩余的符号依赖项。

#### 5.1.4 模块库

模块库是通过链接对象文件在一起创建的二进制文件。与 共享库 不同，模块库不能被其他二进制文件作为依赖项链接 —— 不要将它们列在 target_link_libraries() 命令的右侧。相反，模块库是应用程序可以在运行时按需动态加载的插件，例如通过 dlopen 加载。

add_library() 命令在调用时使用 MODULE 库类型定义模块库目标。

```cmake
add_library(archivePlugin MODULE 7z.cpp)
```

CMake 生成构建规则，将源文件编译为对象文件，并将它们链接成模块库。

模块库的链接依赖项可以使用 target_link_libraries() 命令指定。链接器从编译自模块库自身源文件的对象文件开始，然后通过搜索链接的库来解析剩余的符号依赖项。

#### 5.1.5 对象库

对象库是编译源文件产生的对象文件的集合，不进行任何归档或链接。这些对象文件可以在链接 可执行文件、共享库 和 模块库 时使用，或者在归档 静态库 时使用。

add_library() 命令在调用时使用 OBJECT 库类型定义对象库目标。

```cmake
add_library(archiveObjs OBJECT archive.cpp zip.cpp lzma.cpp)
```

CMake 生成构建规则，将源文件编译为对象文件。

其他目标可以使用 生成器表达式 语法 `$<TARGET_OBJECTS:name>` 将这些对象文件指定为源输入。

```cmake
add_library(archiveExtras STATIC $<TARGET_OBJECTS:archiveObjs> extras.cpp)

add_executable(test_exe $<TARGET_OBJECTS:archiveObjs> test.cpp)
```

消耗这些对象的目标在链接（或归档）时，既使用它们自身的源文件，也使用命名对象库中的对象文件。

或者，也可以将对象库指定为其他目标的链接依赖项。

```cmake
add_library(archiveExtras STATIC extras.cpp)
target_link_libraries(archiveExtras PUBLIC archiveObjs)

add_executable(test_exe test.cpp)
target_link_libraries(test_exe archiveObjs)
```

消耗这些对象的目标在链接（或归档）时，既使用它们自身的源文件，也使用由 target_link_libraries() 指定为直接链接依赖项的对象库中的对象文件。

### 5.2 构建规范与使用要求

目标的构建遵循其自身的 构建规范，并结合从其链接依赖项传递而来的 使用要求。两者都可以使用特定于目标的 命令 来指定。

#### 5.2.1 目标命令

特定于目标的命令会填充 二进制目标 的 构建规范，以及 二进制目标、接口库 和 导入目标 的 使用要求。

| 类型                                          | 填充构建规范属性                         | 填充使用要求属性     
| ---                                           | ---                                    | --- 
| [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions) |  COMPILE_DEFINITIONS | INTERFACE_COMPILE_DEFINITIONS     
| [`target_compile_options()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html#command:target_compile_options) |  COMPILE_OPTIONS | INTERFACE_COMPILE_OPTIONS      
| [`target_compile_features()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html#command:target_compile_features)  | COMPILE_FEATURES | INTERFACE_COMPILE_FEATURES 
| [`target_include_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_include_directories.html#command:target_include_directories) | INCLUDE_DIRECTORIES | INTERFACE_INCLUDE_DIRECTORIES
| [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources)| SOURCES | INTERFACE_SOURCES
| [`target_precompile_headers()`](https://cmake.com.cn/cmake/help/latest/command/target_precompile_headers.html#command:target_precompile_headers)| PRECOMPILE_HEADERS | INTERFACE_PRECOMPILE_HEADERS
| [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) | LINK_LIBRARIES | INTERFACE_LINK_LIBRARIES
| [`target_link_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_link_directories.html#command:target_link_directories) | LINK_DIRECTORIES | INTERFACE_LINK_DIRECTORIES
| [`target_link_options()`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html#command:target_link_options) | LINK_OPTIONS | INTERFACE_LINK_OPTIONS

调用必须指定作用域关键字，每个关键字影响其后参数的可见性。作用域包括：

| 类型             | 作用                                 
| ---             | ---                                    
| PUBLIC	        | 同时填充 构建 属性和 使用 目标的属性。     
| PRIVATE	        | 仅填充 构建 目标的属性。     
| INTERFACE	      | 仅填充 使用 目标的属性。     

#### 5.2.2 目标构建规范

二进制目标 的构建规范由目标属性表示。对于以下每一项 编译 和 链接 属性，目标的编译和链接既受其自身值的影响，也受从链接依赖项的传递闭包中收集的、以 INTERFACE_ 为前缀的对应 使用要求 属性的影响。

##### 5.2.2.1 目标编译属性

这些表示编译目标的 构建规范。

| 类型             | 作用                                     
| ---             | ---                                    
| [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS)	        | 用于编译目标中源文件的编译定义列表。    <br> 它们以未指定的顺序通过 -D 标志或等效标志传递给编译器。
| [`COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_OPTIONS.html#prop_tgt:COMPILE_OPTIONS)	                    | 用于编译目标中源文件的编译选项列表。    <br> 它们按出现顺序作为标志传递给编译器。
| [`COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_FEATURES.html#prop_tgt:COMPILE_FEATURES)	                  | 编译目标中源文件所需的 编译特性 列表。  <br> 通常，这些确保目标的源文件使用足够的语言标准级别进行编译。
| [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INCLUDE_DIRECTORIES.html#prop_tgt:INCLUDE_DIRECTORIES)	        | 用于编译目标中源文件的包含目录列表。    <br> 它们按出现顺序通过 -I 或 -isystem 标志或等效标志传递给编译器。
| [`SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/SOURCES.html#prop_tgt:SOURCES)	                                            | 与目标关联的源文件列表。  <br> 包括在通过 add_executable()、add_library() 或 add_custom_target() 命令创建目标时指定的源文件。
| [`PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/PRECOMPILE_HEADERS.html#prop_tgt:PRECOMPILE_HEADERS)	            | 编译目标中源文件时要预编译并包含的头文件列表。

##### 5.2.2.2 目标链接属性

这些表示链接目标的 构建规范。如果目标是可执行文件、共享库或模块库，则

| 类型             | 作用                                          
| ---             | ---                                    
| [`LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_LIBRARIES.html#prop_tgt:LINK_LIBRARIES)	        | 此项为链接该目标所需的链接库列表。  <br> 静态库 和 共享库 的条目通过其链接产物的路径，或使用 -l 标志或等效标志传递给链接器。
| [`LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DIRECTORIES.html#prop_tgt:LINK_DIRECTORIES)	  | 此项为链接该目标所需的链接目录列表。  <br> 目录通过 -L 标志或等效标志传递给链接器。
| [`LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_OPTIONS.html#prop_tgt:LINK_OPTIONS)	              | 此项为链接该目标所需的链接选项列表。  <br> 选项按出现顺序作为标志传递给链接器。
| [`LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DEPENDS.html#prop_tgt:LINK_DEPENDS)	              | 此项为链接该目标所依赖的文件列表。  

#### 5.2.3 目标使用要求

目标的 使用要求 是传播给消费者的设置，消费者通过 target_link_libraries() 链接到该目标，以便正确与其编译和链接。它们由传递性 编译 和 链接 属性表示。

请注意，使用要求的设计目的并非仅为了方便让下游使用特定的 COMPILE_OPTIONS、COMPILE_DEFINITIONS 等。属性的内容必须是 要求，而不仅仅是建议。

目标的使用要求可以传递性地传播给依赖者。 target_link_libraries() 命令具有 PRIVATE、INTERFACE 和 PUBLIC 关键字来控制传播。

```cmake
add_library(archive archive.cpp)
target_compile_definitions(archive INTERFACE USING_ARCHIVE_LIB)

add_library(serialization serialization.cpp)
target_compile_definitions(serialization INTERFACE USING_SERIALIZATION_LIB)

add_library(archiveExtras extras.cpp)
target_link_libraries(archiveExtras PUBLIC archive)
target_link_libraries(archiveExtras PRIVATE serialization)
# archiveExtras is compiled with -DUSING_ARCHIVE_LIB
# and -DUSING_SERIALIZATION_LIB

add_executable(consumer consumer.cpp)
# consumer is compiled with -DUSING_ARCHIVE_LIB
target_link_libraries(consumer archiveExtras)
```

因为 archive 是 archiveExtras 的 PUBLIC 依赖项，所以它的使用要求也传播到了 consumer。

因为 serialization 是 archiveExtras 的 PRIVATE 依赖项，所以它的使用要求不会传播到 consumer。

通常，如果一个依赖项仅由库的实现使用，而不用于头文件，则应在 target_link_libraries() 的使用中使用 PRIVATE 关键字指定。如果一个依赖项此外还用于库的头文件中（例如用于类继承），则应将其指定为 PUBLIC 依赖项。不被库的实现使用，仅由其头文件使用的依赖项应指定为 INTERFACE 依赖项。 target_link_libraries() 命令可以使用每个关键字的多次调用进行调用。

```cmake
target_link_libraries(archiveExtras
  PUBLIC archive
  PRIVATE serialization
)
```

使用要求通过读取来自依赖项的目标属性的 INTERFACE_ 变体，并将这些值追加到操作数的非 INTERFACE_ 变体中来传播。例如，读取依赖项的 INTERFACE_INCLUDE_DIRECTORIES 并将其追加到操作数的 INCLUDE_DIRECTORIES 中。在顺序相关且被维护的情况下，如果 target_link_libraries() 调用产生的顺序不允许正确编译，则使用适当的命令直接设置属性可能会更新该顺序。

例如，如果目标的链接库必须按 lib1 lib2 lib3 的顺序指定，但包含目录必须按 lib3 lib1 lib2 的顺序指定。

```cmake
target_link_libraries(myExe lib1 lib2 lib3)
target_include_directories(myExe
  PRIVATE $<TARGET_PROPERTY:lib3,INTERFACE_INCLUDE_DIRECTORIES>)
```

##### 5.2.3.1 传递编译属性

这些表示用于编译消费者的 使用要求。

| 类型             | 作用                                          
| ---             | ---                                    
| [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS)	        | 用于编译目标消费者中源文件的编译定义列表。    <br> 通常这些由目标的头文件使用。
| [`INTERFACE_COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_OPTIONS.html#prop_tgt:INTERFACE_COMPILE_OPTIONS)	                    | 用于编译目标消费者中源文件的编译选项列表。     
| [`INTERFACE_COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_FEATURES.html#prop_tgt:INTERFACE_COMPILE_FEATURES)	                  | 用于编译目标消费者中源文件所需的 编译特性 列表。  
| [`INTERFACE_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_INCLUDE_DIRECTORIES)	        | 用于编译目标消费者中源文件的包含目录列表。    <br> 通常这些是目标头文件的位置。
| [`INTERFACE_SYSTEM_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SYSTEM_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_SYSTEM_INCLUDE_DIRECTORIES)	                                                                                                                    | 当指定为包含目录时，<br> 在编译目标消费者中的源文件时应被视为“系统”包含目录的目录列表。
| [`INTERFACE_SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SOURCES.html#prop_tgt:INTERFACE_SOURCES)  | 要与目标消费者关联的源文件列表。  
| [`INTERFACE_PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_PRECOMPILE_HEADERS.html#prop_tgt:INTERFACE_PRECOMPILE_HEADERS)	            | 编译目标消费者中的源文件时要预编译并包含的头文件列表。

##### 5.2.3.2 传递链接属性

这些表示用于链接消费者的 使用要求。

| 类型             | 作用                                       
| ---             | ---                                    
| [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES)	        | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接库列表。
| [`INTERFACE_LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DIRECTORIES.html#prop_tgt:INTERFACE_LINK_DIRECTORIES)	  | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接目录列表。
| [`INTERFACE_LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_OPTIONS.html#prop_tgt:INTERFACE_LINK_OPTIONS)	              | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接选项列表。
| [`INTERFACE_LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DEPENDS.html#prop_tgt:INTERFACE_LINK_DEPENDS)	              | 链接目标消费者（如果是可执行文件、共享库或模块库）所依赖的文件列表。

## 6. CMake 模块

CMake 利用代码重用技术创建可重用的模块，称之 [`cmake-modules`](https://cmake.com.cn/cmake/help/latest/manual/cmake-modules.7.html)。模块的位置可以使用模块文件的完整路径指定，也可以让 CMake 自己查找模块。CMake 将在 CMAKE_MODULE_PATH 指定的目录中查找模块；如果无法在该目录中找到模块，它将在 Modules 安装子目录中查找。模块可以细分为几个主要类别：

### 6.1 查找模块

以下列举了 CMake 提供的常用内置查找模块，更多的请查阅 [`cmake-modules`](https://cmake.com.cn/cmake/help/latest/manual/cmake-modules.7.html)：
           
| [`FindALSA`](https://cmake.com.cn/cmake/help/latest/module/FindALSA.html) | [`FindBLAS`](https://cmake.com.cn/cmake/help/latest/module/FindBLAS.html) | [`FindCURL`](https://cmake.com.cn/cmake/help/latest/module/FindCURL.html) | [`FindEXPAT`](https://cmake.com.cn/cmake/help/latest/module/FindEXPAT.html)  | [`FindFLEX`](https://cmake.com.cn/cmake/help/latest/module/FindFLEX.html) | [`FindFontconfig`](https://cmake.com.cn/cmake/help/latest/module/FindFontconfig.html)
| [`FindFreetype`](https://cmake.com.cn/cmake/help/latest/module/FindFreetype.html) | [`FindGit`](https://cmake.com.cn/cmake/help/latest/module/FindGit.html) | [`FindGLEW`](https://cmake.com.cn/cmake/help/latest/module/FindGLEW.html) | [`FindGLUT`](https://cmake.com.cn/cmake/help/latest/module/FindGLUT.html) | [`FindGTK`](https://cmake.com.cn/cmake/help/latest/module/FindGTK.html) | [`FindGTK2`](https://cmake.com.cn/cmake/help/latest/module/FindGTK2.html)
| [`FindIconv`](https://cmake.com.cn/cmake/help/latest/module/FindIconv.html) | [`FindJava`](https://cmake.com.cn/cmake/help/latest/module/FindJava.html) | [`FindJPEG`](https://cmake.com.cn/cmake/help/latest/module/FindJPEG.html) | [`FindLAPACK`](https://cmake.com.cn/cmake/help/latest/module/FindLAPACK.html) | [`FindLATEX`](https://cmake.com.cn/cmake/help/latest/module/FindLATEX.html) | [`FindLibXml2`](https://cmake.com.cn/cmake/help/latest/module/FindLibXml2.html) 
| [`FindLua`](https://cmake.com.cn/cmake/help/latest/module/FindLua.html) | [`FindMPEG`](https://cmake.com.cn/cmake/help/latest/module/FindMPEG.html) | [`FindODBC`](https://cmake.com.cn/cmake/help/latest/module/FindODBC.html) | [`FindOpenCL`](https://cmake.com.cn/cmake/help/latest/module/FindOpenCL.html) | [`FindOpenGL`](https://cmake.com.cn/cmake/help/latest/module/FindOpenGL.html) | [`FindOpenThreads`](https://cmake.com.cn/cmake/help/latest/module/FindOpenThreads.html)
| [`FindOpenAL`](https://cmake.com.cn/cmake/help/latest/module/FindOpenAL.html) | [`FindOpenSSL`](https://cmake.com.cn/cmake/help/latest/module/FindOpenSSL.html) | [`FindOpenMP`](https://cmake.com.cn/cmake/help/latest/module/FindOpenMP.html) | [`FindPatch`](https://cmake.com.cn/cmake/help/latest/module/FindPatch.html) | [`FindPNG`](https://cmake.com.cn/cmake/help/latest/module/FindPNG.html) | [`FindPkgConfig`](https://cmake.com.cn/cmake/help/latest/module/FindPkgConfig.html) 
| [`FindProtobuf`](https://cmake.com.cn/cmake/help/latest/module/FindProtobuf.html) | [`FindPython`](https://cmake.com.cn/cmake/help/latest/module/FindPython.html) | [`FindPython2`](https://cmake.com.cn/cmake/help/latest/module/FindPython2.html) | [`FindPython3`](https://cmake.com.cn/cmake/help/latest/module/FindPython3.html) | [`FindRTI`](https://cmake.com.cn/cmake/help/latest/module/FindRTI.html) | [`FindRuby`](https://cmake.com.cn/cmake/help/latest/module/FindRuby.html)
| [`FindSDL`](https://cmake.com.cn/cmake/help/latest/module/FindSDL.html) | [`FindSQLite3`](https://cmake.com.cn/cmake/help/latest/module/FindSQLite3.html) | [`FindSWIG`](https://cmake.com.cn/cmake/help/latest/module/FindSWIG.html) | [`FindThreads`](https://cmake.com.cn/cmake/help/latest/module/FindThreads.html) | [`FindTIFF`](https://cmake.com.cn/cmake/help/latest/module/FindTIFF.html) | [`FindVulkan`](https://cmake.com.cn/cmake/help/latest/module/FindVulkan.html)
| [`FindWget`](https://cmake.com.cn/cmake/help/latest/module/FindWget.html) | [`FindX11`](https://cmake.com.cn/cmake/help/latest/module/FindX11.html) | [`FindZLIB`](https://cmake.com.cn/cmake/help/latest/module/FindZLIB.html)

以 [`FindZLIB`](https://cmake.com.cn/cmake/help/latest/module/FindZLIB.html) 模块为例，查找 `zlib` 并将其链接到项目目标，使用方式如下：

```cmake
find_package(ZLIB)
target_link_libraries(project_target PRIVATE ZLIB::ZLIB)
```

### 6.2 实用程序模块

以下列举了 CMake 提供的常用内置实用程序模块，更多的请查阅 [`cmake-modules`](https://cmake.com.cn/cmake/help/latest/manual/cmake-modules.7.html)：

| 模块名称         | 说明
| ---             | ---          
| [`CheckCompilerFlag`](https://cmake.com.cn/cmake/help/latest/module/CheckCompilerFlag.html)                     | 提供检查编译器是否支持给定标志的命令
| [`CheckSourceCompiles`](https://cmake.com.cn/cmake/help/latest/module/CheckSourceCompiles.html)                 | 提供检查给定语言的源代码能否被构建的命令
| [`CheckSourceRuns`](https://cmake.com.cn/cmake/help/latest/module/CheckSourceRuns.html)                         | 提供检查源代码是否可以构建并运行的命令
| [`CheckCCompilerFlag`](https://cmake.com.cn/cmake/help/latest/module/CheckCCompilerFlag.html)                   | 提供命令用于检查 C 编译器是否支持给定的标志
| [`CheckCSourceCompiles`](https://cmake.com.cn/cmake/help/latest/module/CheckCSourceCompiles.html)               | 提供检查 C 源代码是否能够构建的命令
| [`CheckCSourceRuns`](https://cmake.com.cn/cmake/help/latest/module/CheckCSourceRuns.html)                       | 提供检查 C 源代码是否可以构建并运行的命令
| [`CheckCXXCompilerFlag`](https://cmake.com.cn/cmake/help/latest/module/CheckCXXCompilerFlag.html)               | 提供检查 C++ 编译器是否支持给定标志的命令
| [`CheckCXXSourceCompiles`](https://cmake.com.cn/cmake/help/latest/module/CheckCXXSourceCompiles.html)           | 提供检查 C++ 源代码是否可以构建的命令
| [`CheckCXXSourceRuns`](https://cmake.com.cn/cmake/help/latest/module/CheckCXXSourceRuns.html)                   | 提供检查 C++ 源代码是否可以被构建并运行
| [`CheckCXXSymbolExists`](https://cmake.com.cn/cmake/help/latest/module/CheckCXXSymbolExists.html)               | 提供检查 C++ 符号是否存在的命令
| [`CheckFunctionExists`](https://cmake.com.cn/cmake/help/latest/module/CheckFunctionExists.html)                 | 提供检查 C 函数是否存在的命令
| [`CheckIncludeFile`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFile.html)                       | 提供检查 C 头文件的命令
| [`CheckIncludeFileCXX`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFileCXX.html)                 | 提供检查 C++ 头文件的命令
| [`CheckIncludeFiles`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFiles.html)                     | 提供检查一个或多个 C/C++ 头文件的命令
| [`CheckIPOSupported`](https://cmake.com.cn/cmake/help/latest/module/CheckIPOSupported.html)                     | 提供检查编译器是否支持过程间优化（IPO/LTO）的命令
| [`CheckLibraryExists`](https://cmake.com.cn/cmake/help/latest/module/CheckLibraryExists.html)                   | 提供检查 C 语言库是否存在的命令
| [`CheckLinkerFlag`](https://cmake.com.cn/cmake/help/latest/module/CheckLinkerFlag.html)                         | 提供检查编译器是否支持给定链接器标志的命令
| [`CheckPIESupported`](https://cmake.com.cn/cmake/help/latest/module/CheckPIESupported.html)                     | 提供命令用于检查链接器是否支持可执行文件的位置无关代码 (PIE) 
| [`CheckStructHasMember`](https://cmake.com.cn/cmake/help/latest/module/CheckStructHasMember.html)               | 提供检查结构体或类是否包含指定成员变量的命令
| [`CheckSymbolExists`](https://cmake.com.cn/cmake/help/latest/module/CheckSymbolExists.html)                     | 提供检查 C 语言符号是否存在的命令
| [`CheckTypeSize`](https://cmake.com.cn/cmake/help/latest/module/CheckTypeSize.html)                             | 提供检查 C/C++ 类型或表达式大小的命令
| [`CheckVariableExists`](https://cmake.com.cn/cmake/help/latest/module/CheckVariableExists.html)                 | 提供检查 C 语言变量是否存在的命令
| [`CMakePrintHelpers`](https://cmake.com.cn/cmake/help/latest/module/CMakePrintHelpers.html)                     | 提供打印属性和变量值的命令
| [`CMakePrintSystemInformation`](https://cmake.com.cn/cmake/help/latest/module/CMakePrintSystemInformation.html) | 包含此模块将会自动打印系统信息
| [`CMakePackageConfigHelpers`](https://cmake.com.cn/cmake/help/latest/module/CMakePackageConfigHelpers.html)     | 提供命令用于创建可被其他项目包含以查找和使用包的配置文件
| [`CMakeDependentOption`](https://cmake.com.cn/cmake/help/latest/module/CMakeDependentOption.html)               | 提供用于定义布尔选项的命令
| [`CPack`](https://cmake.com.cn/cmake/help/latest/module/CPack.html)                                             | 该模块为二进制安装程序和源码包配置生成器
| [`CTest`](https://cmake.com.cn/cmake/help/latest/module/CTest.html)                                             | 在项目的顶层 `CMakeLists.txt` 文件中包含此模块，可启用 `CTest` 测试
| [`ExternalData`](https://cmake.com.cn/cmake/help/latest/module/ExternalData.html)                               | 提供用于管理存储在源树之外的数据文件的命令
| [`ExternalProject`](https://cmake.com.cn/cmake/help/latest/module/ExternalProject.html)                         | 提供在 CMake 构建阶段下载并构建外部项目的命令
| [`FeatureSummary`](https://cmake.com.cn/cmake/help/latest/module/FeatureSummary.html)                           | 提供用于生成已启用/已禁用特性摘要的命令
| [`FetchContent`](https://cmake.com.cn/cmake/help/latest/module/FetchContent.html)                               | 提供在配置时或作为调用脚本的一部分来填充内容的命令
| [`FindPackageMessage`](https://cmake.com.cn/cmake/help/latest/module/FindPackageMessage.html)                   | 提供用于打印查找结果消息的命令
| [`GenerateExportHeader`](https://cmake.com.cn/cmake/help/latest/module/GenerateExportHeader.html)               | 提供用于生成头文件的命令
| [`GoogleTest`](https://cmake.com.cn/cmake/help/latest/module/GoogleTest.html)                                   | 提供用于辅助使用 Google Test 框架的命令
| [`ProcessorCount`](https://cmake.com.cn/cmake/help/latest/module/ProcessorCount.html)                           | 提供用于确定处理器/核心数量的命令

以 [`CheckIncludeFile`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFile.html) 检查 C 头文件模块为例，查找 C 头文件 <unistd.h> 是否存在，并将检查结果存储在 `HAVE_UNISTD_H` 缓存变量中。使用方式如下：

```cmake
include(CheckIncludeFile)

check_include_file(unistd.h HAVE_UNISTD_H)
```

### 6.3 自定义模块

自定义模块是一个以 .cmake 为扩展名的文件，其中定义了可被 include 加载的 CMake 函数和宏。其创建步骤是：

1. 创建自定义模块存放文件夹
2. 在自定义模块文件夹下创建模块文件，编写模块内容，实现模块功能
3. 扩展 CMake 模块搜索路径，在 CMakeLists.txt 中通过 CMAKE_MODULE_PATH 注册该目录
4. 加载模块并使用模块函数，使用 include() 引入模块并调用其中的函数

创建自定义模块并命名为 CustomModule.cmake，编写模块内容：

```cmake
function(custom_module_function)
   message(STATUS "This is a custom function!")
endfunction()
```

假设模块文件创建在 `${CMAKE_SOURCE_DIR}/cmake` 文件夹中，在 CMakeLists.txt 中加载该自定义模块：

```cmake

# 将 cmake/ 目录添加到模块搜索路径
list(APPEND CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake")

# 加载自定义模块
include(CustomModule)

# 调用模块中的自定义函数
custom_module_function()
```

CMAKE_MODULE_PATH 是 CMake 查找模块文件时的搜索路径列表。CMake 会先在内置模块路径中查找，找不到时再到 CMAKE_MODULE_PATH 指定的路径中查找。

## 7. CMake 包

## 8. CMake 属性

## 9. CMake 自定义命令

通常，软件项目的构建过程不仅包括编译库和可执行文件。在许多情况下，在构建过程期间或之后可能需要额外的任务。常见的示例包括：移动生成的可执行文件；对可执行文件进行后处理等。CMake 支持使用 add_custom_command 和 add_custom_target 命令来执行这些其他任务。本章将描述如何使用自定义命令和目标来执行 CMake 本身不支持的复杂任务。

### 9.1 添加自定义命令

要添加一个自定义命令，请使用 [`add_custom_command`](https://cmake.com.cn/cmake/help/latest/command/add_custom_command.html#command:add_custom_command) 命令。现在自定义一个在可执行文件构建后对其进行复制的命令：

```cmake
# first define the executable target as usual
add_executable(Foo bar.c)

# then add the custom command to copy it
add_custom_command(
  TARGET Foo
  POST_BUILD
  COMMAND ${CMAKE_COMMAND}
  ARGS -E copy $<TARGET_FILE:Foo> /testing_department/files
  )
```

这将在构建后把生成的 Foo 可执行文件从其构建位置复制到 /testing_department/files 目录。

### 9.2 添加自定义目标

通常情况下，CMake 目标是指可执行文件和库。在此之外，CMake 还支持一个更通用的目标概念，称为自定义目标，可以在你想要目标概念但不想要最终产品是库或可执行文件时使用，即定义一个“动作”目标。要添加一个自定义目标，请使用 [`add_custom_target`](https://cmake.com.cn/cmake/help/latest/command/add_custom_target.html#command:add_custom_target) 命令。以下示例展示了如何使用 add_custom_target 创建一个目标来运行 Python 脚本：

```cmake
# 创建一个自定义目标，运行 Python 脚本
add_custom_target(run_script
   COMMAND ${PYTHON_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/scripts/setup.py
   COMMENT "Running setup script..."
)
```

运行 `make run_script` 即可触发该目标，执行脚本。如果希望自定义目标成为默认构建的一部分，可以添加 `ALL` 参数：

```cmake
add_custom_target(clean_all ALL
   COMMAND ${CMAKE_COMMAND} -E remove_directory ${CMAKE_BINARY_DIR}/output
   COMMENT "Cleaning all generated files..."
)
```

直接运行 `make` 时，该目标会自动执行。如果自定义目标依赖其他内容，可使用 `DEPENDS` 参数指定：

```cmake
add_custom_command(
    OUTPUT printout
    COMMAND ${CMAKE_COMMAND} -E echo "Compile finish"
)
add_custom_target(finish ALL DEPENDS printout)

```

## 10. CMake 工具链

## 11. References

> [GNU Automake](https://www.gnu.org/software/automake/manual/html_node/index.html)
{: .hover-card }

> [Autotools Tutorial --- Alexandre Duret-Lutz](https://www.lrde.epita.fr/~adl/autotools.html)
{: .hover-card }

> [CMake 参考文档英文版](https://cmake.org/cmake/help/latest/)
{: .hover-card }

> [CMake 参考文档中文版](https://cmake.com.cn/cmake/help/latest/)
{: .hover-card }

> [精通 CMake](https://cmake.com.cn/cmake/help/book/mastering-cmake/index.html)
{: .hover-card }

> [Modern CMake](https://cliutils.gitlab.io/modern-cmake/)
{: .hover-card }
