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
: 引用形式为 `${<variable>}`，会在引号参数或无引号参数中展开。CMake 优先使用同名普通变量的值；如果普通变量未定义，则使用同名缓存变量的值。两者都未定义时，引用会展开为空字符串。变量引用可以嵌套，并从内向外求值，例如：`${outer_${inner_variable}_variable}`。

环境变量
: 引用形式为 `$ENV{<variable>}`。如果该环境变量未设置，引用会展开为空字符串。

缓存变量
: 引用形式为 `$CACHE{<variable>}`，用于读取指定缓存条目的值，不受同名普通变量影响。如果缓存条目不存在，引用会展开为空字符串。

> 注意：[`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 命令使用特殊的条件语法，可以直接写变量名（如 `if(<variable>)`），而不必写成 `${<variable>}`。但引用环境变量时，仍须使用 `$ENV{<variable>}`。
{: .prompt-warning }

#### 4.2.3 变量作用域

变量具有动态作用域。

块作用域
: [`block()`](https://cmake.com.cn/cmake/help/latest/command/block.html#command:block) 命令会创建新的变量作用域。

函数作用域
: [`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 命令会创建新的变量作用域。函数中查找变量时，也会沿调用链查找外层作用域中的变量。

目录作用域
: 在函数调用之外设置或取消设置变量时，操作会作用于当前目录作用域。处理子目录的 `CMakeLists.txt` 之前，CMake 会将父目录当前定义的变量绑定复制到新的目录作用域中，作为其初始值。

缓存
: CMake 将缓存条目保存在构建目录的 `CMakeCache.txt` 中，因此在同一构建树中多次运行 CMake 时，其值通常会保留。缓存条目独立于普通变量的作用域，仅可以通过 `set(... CACHE ...)` 或 `unset(... CACHE)` 等显式方式修改或删除。

> 提示：环境变量属于 CMake 进程的环境，不受普通变量作用域影响，也不会自动写入缓存。
{: .prompt-info }

### 4.3 列表

CMake 中的列表是一组用 `;` 分隔的字符串。CMake 中没有数组，只有列表，它是 CMake 最基础的容器。要创建列表，可以使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 命令。例如：

```cmake
set(srcs a.c b.c c.c) # sets "srcs" to "a.c;b.c;c.c"
message(${srcs}) # the output is "a.c b.c c.c"
```
列表子命令分为三类，包括读取（`GET`、`LENGTH`、`SUBLIST`）、搜索（`FIND`）和修改（`APPEND`、`PREPEND`、`INSERT`、`REMOVE_ITEM`、`REMOVE_AT`、`REMOVE_DUPLICATES`、`REVERSE`、`SORT`、`TRANSFORM`）。

| 子命令            | 说明                               
| ---               | ---                                  
| `GET`	              | 返回列表中指定索引对应的元素列表         <br> 格式：[`list(GET <list> <element index> [<index> ...] <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#get)
| `LENGTH`            | 获取列表元素个数                        <br> 格式：[`list(LENGTH <list> <output variable>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#length)
| `SUBLIST`	          | 截取一段子列表	                        <br> 格式：[`list(SUBLIST <list> <begin> <length> <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#sublist)
| `FIND`              | 查找元素，返回索引；找不到返回 `-1`          <br> 格式：[`list(FIND <list> <value> <out-var>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#find)
| `APPEND`            | 追加元素到列表尾部	                    <br> 格式：[`list(APPEND <list> [<element>...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#append)
| `PREPEND`	          | 插入到列表头部                          <br> 格式：[`list(PREPEND <list> [<element>...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#prepend)
| `INSERT`            | 在指定索引位置插入元素	                <br> 格式：[`list(INSERT <list> <element_index> <element> [<element> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#insert)
| `REMOVE_ITEM`       | 从列表中移除指定项目的所有实例            <br> 格式：[`list(REMOVE_ITEM <list> <value> [<value> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-item)
| `REMOVE_AT`         | 移除列表中给定索引处的项目               <br> 格式：[`list(REMOVE_AT <list> <index> [<index> ...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-at)
| `REMOVE_DUPLICATES` | 移除列表中的重复项目                     <br> 格式：[`list(REMOVE_DUPLICATES <list>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-duplicates)
| `REVERSE`	          | 反转列表                                <br> 格式：[`list(REVERSE <list>)`](https://cmake.com.cn/cmake/help/latest/command/list.html#reverse)
| `SORT`	            | 按字母顺序原地排序列表                  <br> 格式：[`list(SORT <list> [...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#sort)
| `TRANSFORM`	        | 将 `<ACTION>` 应用于所有元素	          <br> 格式：[`list(TRANSFORM <list> <ACTION> [...])`](https://cmake.com.cn/cmake/help/latest/command/list.html#remove-duplicates)

### 4.3 命令

CMake 命令分为 [脚本命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#id3)、[项目命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#project-commands) 和 [CTest 命令](https://cmake.com.cn/cmake/help/latest/manual/cmake-commands.7.html#ctest-commands)。

#### 4.3.1 命令参数

命令调用中有三种类型的参数：括号参数、带引号参数和无引号参数。

##### 4.3.1.1 括号参数

括号参数由一对方括号分隔符界定。起始分隔符由 `[`、零个或多个 `=` 和 `[` 组成；结束分隔符由 `]`、相同数量的 `=` 和 `]` 组成。例如，`[[...]]` 和 `[=[...]=]` 分别使用零个和一个等号。分隔符中的等号数量决定匹配关系，括号参数本身不支持嵌套。

括号参数的内容是起始分隔符与匹配的结束分隔符之间的文本；若起始分隔符后紧接换行符，该换行符会被忽略。内容按字面值传递，不进行转义序列或变量引用求值。括号参数始终作为一个单一参数传递给命令调用。

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

带引号参数由一对双引号（`"`）界定。两引号之间的内容构成参数内容，其中的转义序列和变量引用会被求值。带引号参数在命令调用中始终作为一个参数传递，即使内容包含空白字符或分号也不会因此拆分。

```cmake
message("This is a quoted argument containing multiple lines.
This is always one argument even though it contains a ; character.
Both \\-escape sequences and ${variable} references are evaluated.
The text does not end on an escaped double-quote like \".
It does end in an unescaped double quote.
")
```

若某行以奇数个连续反斜杠结尾，则最后一个反斜杠及其后的换行符会被忽略，使下一行内容紧接在本行内容之后，最后一个反斜杠之前成对出现的反斜杠则为转义反斜杠。例如：

```cmake
message("\
This is the first line of a quoted argument. \
In fact it is the only line but since it is long \
the source code uses line continuation.\
")
```

##### 4.3.1.3 无引号参数

无引号参数不由引号界定，其内容由允许的普通字符、转义序列和变量引用组成。其中不能直接出现空白字符（空格、制表符、换行）以及 `(`、`)`、`#`、`"` 和 `\`：未转义的空白会终止当前参数，其余字符同样需转义后才能成为参数内容的一部分，例如下文示例中的 `Escaped\ Space` 即表示含一个空格的内容。转义序列和变量引用会被求值，所得内容再按 CMake 列表规则拆分。拆分后，每个非空元素分别作为一个参数传递给命令调用。因此，一个无引号参数最终可能产生零个或多个命令参数。

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

命令调用由命令名和圆括号括起的参数列表构成，参数之间以空白字符分隔。参数可采用括号参数、带引号参数或无引号参数的形式。例如：

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
| [`cmake_path`](https://cmake.com.cn/cmake/help/latest/command/cmake_path.html) | 对路径进行解析、查询、转换和修改，不访问文件系统
| [`cmake_pkg_config`](https://cmake.com.cn/cmake/help/latest/command/cmake_pkg_config.html) | 处理 pkg-config 格式的包文件
| [`configure_file`](https://cmake.com.cn/cmake/help/latest/command/configure_file.html) | 将文件复制到另一个位置并修改其内容
| [`block`](https://cmake.com.cn/cmake/help/latest/command/block.html) / [`endblock`](https://cmake.com.cn/cmake/help/latest/command/endblock.html) | 在一个专用的变量和/或策略作用域内执行一组命令
| [`break`](https://cmake.com.cn/cmake/help/latest/command/break.html) | 从外层的 foreach 或 while 循环中跳出
| [`continue`](https://cmake.com.cn/cmake/help/latest/command/continue.html) | 继续执行外层 foreach 或 while 循环的顶部
| [`if`](https://cmake.com.cn/cmake/help/latest/command/if.html) / [`elseif`](https://cmake.com.cn/cmake/help/latest/command/elseif.html) / [`else`](https://cmake.com.cn/cmake/help/latest/command/else.html) / [`endif`](https://cmake.com.cn/cmake/help/latest/command/endif.html) | 有条件地执行一组命令
| [`execute_process`](https://cmake.com.cn/cmake/help/latest/command/execute_process.html) | 执行一个或多个子进程
| [`file`](https://cmake.com.cn/cmake/help/latest/command/file.html) | 专用于需要访问文件系统的文件和路径操作
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

仅在项目模式下可用（不能在脚本模式中使用）的命令称为项目命令，常用的项目命令列举如下：

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

可以将重复使用的一组 CMake 命令封装为函数或宏，以减少重复代码并提高可复用性，这可以借助 [`function()`](https://cmake.com.cn/cmake/help/latest/command/function.html#command:function) 和 [`macro()`](https://cmake.com.cn/cmake/help/latest/command/macro.html#command:macro) 来实现。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:14,endLineNumber:7,positionColumn:14,positionLineNumber:7,selectionStartColumn:14,selectionStartLineNumber:7,startColumn:14,startLineNumber:7),source:'macro(MyMacro+MacroArgument)%0A++message(%22$%7BMacroArgument%7D%5Cn%5Ct%5CtFrom+Macro%22)%0Aendmacro()%0A%0Afunction(MyFunc+FuncArgument)%0A++MyMacro(%22$%7BFuncArgument%7D%5Cn%5CtFrom+Function%22)%0Aendfunction()%0A%0AMyFunc(%22From+TopLevel%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

函数和宏的一个重要区别在于变量作用域。`macro()` 不创建新的变量作用域，其主体在调用处展开执行，因此宏中对普通变量的赋值会影响调用者当前作用域。`function()` 则创建新的变量作用域，函数内对普通变量的赋值默认仅在该函数作用域内可见；若需将变量值传回调用者的父作用域，可使用 `set(<var> <value> PARENT_SCOPE)`，它的工作方式与 `set()` 相同，但仅针对属于调用者上下文的变量。

### 4.5 控制结构

#### 4.5.1 条件块

[`if() ... elseif() ... else() ... endif()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 根据条件选择要执行的命令块：

```cmake
if(<condition>)
  <commands>
elseif(<condition>) # optional block, can be repeated
  <commands>
else()              # optional block
  <commands>
endif()
```

[`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 按照下文所述的条件语法对条件进行求值。条件为真时执行 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 块中的命令；否则依次检查可选的 [`elseif()`](https://cmake.com.cn/cmake/help/latest/command/elseif.html) 条件。若都不为真，则执行可选的 [`else()`](https://cmake.com.cn/cmake/help/latest/command/else.html) 块。

##### 4.5.1.1 基础表达式

`if(<constant>)`
: 参数为 `1`、`ON`、`YES`、`TRUE`、`Y` 或非零数字（包括浮点数）时为真；为 `0`、`OFF`、`NO`、`FALSE`、`N`、`IGNORE`、`NOTFOUND`、空字符串，或以 `-NOTFOUND` 结尾时为假。布尔常量不区分大小写。如果参数不是这些特定常量，将按变量名或字符串处理（见下文“变量展开”）。

`if(<variable>)`
: 如果该变量已定义，且其值不是上述假值，则为真；变量未定义时为假。宏参数不是变量。不能用这种形式判断环境变量的值，例如 `if(ENV{some_var})` 始终为假。可用 `if(DEFINED ENV{some_var})` 检查环境变量是否已定义；若需判断其值，应显式展开 `$ENV{some_var}` 后进行比较。

`if(<string>)`
: 引号括起来的字符串通常为假，除非其值是上述真值之一。

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
: 先对圆括号内的条件求值，再按运算符优先级处理其余部分；嵌套时先处理最内层的圆括号。逻辑运算符的优先级依次为 `NOT`、`AND`、`OR`；同级的 `AND` 和 `OR` 从左向右求值，且不会短路。

##### 4.5.1.3 存在性检查

`if(COMMAND <command-name>)`
: 如果给定名称对应一个可调用的命令、宏或函数，则为真。

`if(TARGET <target-name>)`
: 如果给定名称对应一个已创建的逻辑目标，则为真。目标须已由 `add_executable()`、`add_library()` 或 `add_custom_target()` 创建。

`if(TEST <test-name>)`
: 如果给定名称对应一个已由 `add_test()` 创建的测试，则为真。

`if(DEFINED <name>)`、`if(DEFINED CACHE{<name>})`、`if(DEFINED ENV{<name>})`
: 如果指定名称的普通变量、缓存变量或环境变量已定义，则为真，与变量的值无关。注意：
  * 宏参数不是变量。
  * `if(DEFINED someName)` 在同名普通变量或缓存变量存在时都会为真；`if(DEFINED CACHE{someName})` 则只检查缓存变量。若要确认普通变量存在而缓存变量不存在，可使用 `if(DEFINED someName AND NOT DEFINED CACHE{someName})`。
  * `CACHE{<name>}` 形式从 CMake 3.14 起可用。

`if(<variable|string> IN_LIST <variable>)`
: 如果左侧的值是右侧命名列表变量中的一个元素，则为真。

##### 4.5.1.4 文件操作

`if(EXISTS <path-to-file-or-directory>)`
: 如果指定的文件或目录存在且可读，则为真。此检查仅对明确的完整路径有明确定义；路径开头的 `~/` 不会展开为主目录，而会被视为相对路径。检查会解析符号链接：当链接目标存在时结果为真。如果给定路径为空字符串，则为假。

`if(IS_READABLE <path-to-file-or-directory>)`
: 如果指定的文件或目录可读，则为真。此检查仅对明确的完整路径有明确定义；路径开头的 `~/` 不会展开为主目录。检查会解析符号链接，并以链接目标是否可读为准。如果给定路径为空字符串，则为假。

`if(IS_WRITABLE <path-to-file-or-directory>)`
: 如果指定的文件或目录可写，则为真。此检查仅对明确的完整路径有明确定义；路径开头的 `~/` 不会展开为主目录。检查会解析符号链接，并以链接目标是否可写为准。如果给定路径为空字符串，则为假。

`if(IS_EXECUTABLE <path-to-file-or-directory>)`
: 如果指定的文件或目录可执行，则为真。此检查仅对明确的完整路径有明确定义；路径开头的 `~/` 不会展开为主目录。检查会解析符号链接，并以链接目标是否可执行为准。如果给定路径为空字符串，则为假。

`if(IS_DIRECTORY <path>)`
: 如果指定路径是目录，则为真。此检查仅对完整路径有明确定义；如果给定路径为空字符串，则为假。

`if(IS_SYMLINK <path>)`
: 如果指定路径是符号链接，则为真。此检查仅对完整路径有明确定义。

`if(IS_ABSOLUTE <path>)`
: 如果指定路径是绝对路径，则为真。注意以下特殊情况：
  * 空 path 会被视为假。
  * 在 Windows 主机上，以驱动器号和冒号（如 `C:`）、正斜杠或反斜杠开头的路径都会被判定为绝对路径。
  * 在非 Windows 主机上，以波浪号（`~`）开头的路径会被判定为绝对路径。
  
`if(<file1> IS_NEWER_THAN <file2>)`
: 如果 `<file1>` 比 `<file2>` 新，或者其中一个文件不存在，则为真。此检查仅对完整路径有明确定义。若两个文件的时间戳相同，比较结果也为真，以确保时间戳相同时仍会执行相关构建操作；两侧使用相同文件名时也适用。

##### 4.5.1.5 比较

`if(<variable|string> MATCHES <regex>)`
: 如果左侧字符串（或变量的值）与给定正则表达式匹配，则为真。

`if(<variable|string> LESS <variable|string>)`、`if(<variable|string> GREATER <variable|string>)`、`if(<variable|string> EQUAL <variable|string>)`、`if(<variable|string> LESS_EQUAL <variable|string>)`、`if(<variable|string> GREATER_EQUAL <variable|string>)`
: 分别将两侧的字符串（或变量的值）解析为实数（类似于 C 语言中的 `double`），并判断左侧是否小于、大于、等于、小于等于或大于等于右侧。

`if(<variable|string> STRLESS <variable|string>)`、`if(<variable|string> STRGREATER <variable|string>)`、`if(<variable|string> STREQUAL <variable|string>)`、`if(<variable|string> STRLESS_EQUAL <variable|string>)`、`if(<variable|string> STRGREATER_EQUAL <variable|string>)`
: 分别按字典序判断左侧字符串（或变量的值）是否小于、大于、等于、小于等于或大于等于右侧字符串（或变量的值）。

#### 4.5.2 循环

CMake 提供 [`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach) 和 [`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 两种循环结构，分别用于遍历列表项和根据条件重复执行命令。

##### 4.5.2.1 `foreach`

对列表中的每一项执行一组命令。其格式如下：

```cmake
foreach(<loop_var> <items>)
  <commands>
endforeach()
```

其中 `<items>` 是由分号或空白字符分隔的项目列表。[`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach) 与匹配的 [`endforeach()`](https://cmake.com.cn/cmake/help/latest/command/endforeach.html) 之间的命令会先被记录，而不是立即执行，在到达 [`endforeach()`](https://cmake.com.cn/cmake/help/latest/command/endforeach.html) 时，才会针对 `<items>` 中的每一项执行一次。在每次迭代开始时，循环变量 `<loop_var>` 会被设为当前项的值。

> 提示：`<loop_var>` 的作用域仅限于循环内部。
{: .prompt-info }

`foreach` 在上述标准格式基础上存在多种变体，如：

`foreach(<loop_var> RANGE <stop>)`
: 在此形式中，遍历从 `0` 开始，依次递增至（并包含）非负整数 `<stop>`。

`foreach(<loop_var> RANGE <start> <stop> [<step>])`
: 在此形式中，以 `<step>` 为步长，从 `<start>` 遍历到不超过 `<stop>` 的数值。省略 `<step>` 时步长为 `1`。三个参数都必须是非负整数，且 `<stop>` 不得小于 `<start>`；不满足这些要求时将引发未定义行为。

`foreach(<loop_var> IN [LISTS [<lists>]] [ITEMS [<items>]])`
: 在此形式中，`<lists>` 是由空白字符或分号分隔的列表变量名；循环会依次遍历这些变量中的每一项。`ITEMS` 后的 `<items>` 按标准形式中的列表项处理。因此，`LISTS A` 与 `ITEMS ${A}` 等效。若未提供 `<lists>` 和 `<items>`，循环体不会执行。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:11,endLineNumber:1,positionColumn:11,positionLineNumber:1,selectionStartColumn:11,selectionStartLineNumber:1,startColumn:11,startLineNumber:1),source:'set(A+0%3B1)%0Aset(B+2+3)%0Aset(C+%224+5%22)%0Aset(D+6%3B7+8)%0Aset(E+%22%22)%0Aforeach(X+IN+LISTS+A+B+C+D+E)%0A++++message(STATUS+%22X%3D$%7BX%7D%22)%0Aendforeach()'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

##### 4.5.2.2 `while`

只要条件为真，就重复执行一组命令。其格式如下：

```cmake
while(<condition>)
  <commands>
endwhile()
```

执行到 [`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 时，CMake 会先记录 [`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 与匹配的 [`endwhile()`](https://cmake.com.cn/cmake/help/latest/command/endwhile.html) 之间的命令块，不会立即运行。直到执行到 [`endwhile()`](https://cmake.com.cn/cmake/help/latest/command/endwhile.html)，才开始循环：每轮迭代前重新计算 `<condition>`，为真则执行该命令块，为假则结束循环。因此条件一开始就为假时，循环体一次也不会执行；而命令块中的变量引用会在每轮迭代时重新求值。

`<condition>` 的语法和求值规则与 [`if()`](https://cmake.com.cn/cmake/help/latest/command/if.html#command:if) 相同。

##### 4.5.2.3 跳出控制流

[`break()`](https://cmake.com.cn/cmake/help/latest/command/break.html#command:break) 和 [`continue()`](https://cmake.com.cn/cmake/help/latest/command/continue.html#command:continue) 可用于改变循环控制流。[`break()`](https://cmake.com.cn/cmake/help/latest/command/break.html#command:break) 退出当前最内层的 [`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach) 或 [`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while) 循环；[`continue()`](https://cmake.com.cn/cmake/help/latest/command/continue.html#command:continue) 跳过当前迭代剩余的命令，并开始下一次迭代。

## 5. CMake 构建系统

CMake 构建系统由一组逻辑目标及其依赖关系、构建规范和使用要求组成，用于组织整个构建过程。逻辑目标包括可执行文件、库和自定义目标等；CMake 根据这些目标生成原生构建工具所需的规则，并利用文件级依赖关系和自定义命令的依赖信息，在源文件或其他输入发生变化时决定需要重新执行的编译、链接及其他步骤。

### 5.1 二进制目标

二进制目标包括可执行文件和库，是逻辑目标的主要子类，可分别通过 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable) 和 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令定义。CMake 会根据目标平台为生成的文件确定名称前缀、后缀和扩展名；目标之间的链接关系则通过 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 命令建立。下面的示例展示了一个可执行目标及其依赖的库目标。

<iframe style="display:block;width:100%;height:clamp(480px,80vh,800px);margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#z:OYLghAFBqd5TKALEAXATgU0wGgJYgQBGArngDYAmAygJ4DOqmAtiAMbMCGA1rqRTQZNmAQXTB6hDj0wgA5AFoAIgGEAsiIDSAUQD6AIQCqASQAyS3QBUAmgAVtAUgDMSgEqZyAdTyokSzETGAHYAZgD2cgCUONK8YhLyyupaekZmFjb2zm4e3r7%2BgaERMWHMAA4UmOimnEHAJJzAmMaU7A4ATPod%2BjEkjKUA8iSoZcMAYpVBnMyymAAemGzDnETkuCGVkrCYlD5h6C0gAGw4G2uHAIwALKeT07JceEEAdGxlZTigcnL49MFs5BIlB28gADD88PQ1JwntQwiR0GxZHILhD6AMypggmCfuRasBDt9ohAdnsDq0LrdzhSAKxUrH3EDqGSmSGoejPVBzVCfeRldBhABWi1QEHoSE4mPokQcoJEspEsUwumYTzwzBIzF0WAAjmQsJQIAA1bSuajGAYAOQA1E5njSZXKFZxKJRdPNFstVpgxRKpXrOFgFdaQ9bxZLMPQAPRsPCItavd7B0PhqVRrBsVD4hNvMrJkOPF65x3yuVZ8SYVC6chPbjVvBEdCBvCR30R%2BgBoNy0PWkLMVCUEto/6A4GtOTg37Q2HwxHIyeQjFYnE4PF1Q5K4mk1D7Q7temXE5nBkzEBYeizpHRpAechhTnc3lyBUACVvYRw1oA7vsqGAwAqCoKMBCgKpYN7WtoQSUAqw5BACQIghOaLTkEcIIki8ior8S7Yshq74hu3TdFuuw7uSIBOAeFIAJz0lMp54PeuZPnBCFjiukKoehc5YWiuErmuBLjlEOAkmRu6tDcx57qC9GMkxzxIKxvwjoh44LlCMJoZeyLYYumJ4ZOQmElE0SQsyvC2AKwqZiugogJSQSYF%2BEzUiA7QXNE5DyDSPxGT8YTyJYWCYNaHRONhqA4pE0TcB5oL2lcADsNFXDS7SgjSKVpdlq7yFcPysEc7TPBc7Q0k4VxZTRuU0qCTgnAFOBBd8OCSHJ0XIcSiAQCgHpLOR%2BCEIGEi2LUHjUEgYRfnh2FsKUFR4qgTFBONznkFNM1zT8C3lJU6AgMAFwZSU%2B1rOglqMm1e1LVUQyoFts18TgA3xJI566de74PjyA3UAOTzyD84RBI9bCcGsjnSWEYOGPQmC2HM9mOQRdRtJ03Srg2WxQAxsh9jyABuVTyMlFxOGZLVlCtsOSIojAwS4bDEZ0mXWgoAxOBzITkDugUk%2Bg6B4MCuPROgJBg%2BqmCWGEYTkGL7WA2tE2bdNz0oj8GDYKjX5NmUfHeb5/krq12gLIN%2BzWnMAAcRwKEcVzWsAbBsNaJ3PO01oQCorM9NaIXYOF7SRZEWsxWJKC3Qdw0QNHF1HSd%2B5nEw6CSMQK5EE8ga0C9WdTOgtADEQtldfNpQzGDAxBOQuf4cCpDACokMKy9wJcHUUP13GIp4CT9OTgNwx6RCYMeIJDZNoXKhhMCK4YOqL2C0QYQI/4HfADW6PdaceISEaLZfgJmunLD4OQ7I1yn3DCNIyjVFCRjXSdNjRC4xA%2BMgITOCC2TFNU2EGmq16YKEZtkFmmM2agg5lzHmfNihhEFsLUW8BogIzWJmVahAsSUBnoCZg2JKQ4NZM5S0moiCk0pGUVePhVp4M1IQnA1D6C0NhiQzAZDmAUMOpSdBvdYYA0DKgehBDUZ8MwQI8sqB2GcO4WIqRIjGGMCETI8hlDoja0vkbOQfkcDNVatbO2DsnYuzdh7L2EBA5hQil5cO3Vog3hdKTCA2jCo4FYE4ZKzwbbJSuEcGkaVQRZSuFcGijs9Gm2Bu1EAnUYpxUonaIJNJKoXH8U4KqNFkr7h8nISmET8KtTseCHq8A4CwCjrPTA2gJLoFjseT%2BhZEwfFBufKGV8Wnw0RsjfCDkTiPwgc/Ho4jabYhJNBRRqNiFPA4Wow6NsmE0JGRMqhizVqqK4aTeZwzVqCPQMI%2BWDCxEeH4WhKR6y5FbIUQc0RvCznTNkZstBul5ARSeOxaxTgVCExjPsTASlnCOCdE6EObzRzWPaO0RSSAOjtEAnKJ4qBrSFhceFZKXRuyhkJiAEA/IEUQBhW5MKC0x5g0kA4GkKgggODRdSpQMLPxNCrJQTgWYXEyicOi%2BUyU6VylEjk3R%2BiQCNJYl1Ypkd2CVOqWSOpdxTyWUwKyRgHIuQ8hadQCGbSYY3y6SjSk/SuC8HasciRoycETPaMlV60Fzmk0tcw1hQRzV2tWWw%2B5syQCWu2ZIoRTqjUYJGbs6RbqNmHU9Vc/B2ILVKxUcGuRyUnkYWREqFUaoNRal1PqHYxpTTmitLaT2oISwKn5EKEUbYpRFrlC6N0NZGw5wgExa01AXwiFcNoJQ1pFLFjhSIat7oLZejWCSAdWZvRIu0k0ytIhyyMvrEEOstap4tnoMOz0o61j5l7P2GCGKQxMSHNogVkT5WKvZL9HAorRJ9QlcCKVQ0CAQHqYyT6ibvrkDvOetVGrL5atQJ0u%2BPSPJo1AAMrGXrTXjOuYwqZpD3UnHtUsqDqMENrNjaTE44HA3LL9ScwNNrDoYfDYc25MbYMhuOAm3iz45RvnfR%2Bb8v5KD/h7SBUCcpwJhSgjukQfLjb5MnEFF9c430fpVReiO16Fq3pqTKtYn8u3vGvq0n9Sn/3dMnA5B%2B%2BIn5geNSM7BkGI2TOtWhw6dEUOw2wxZoI%2BGQB0Uw0Rm5OGTV4dM3Z6NezsPKL2bZmilHMLPhBfBMF4VPkhEYFgaYALAJBfeaFlQEWnjAGi0CkQjNsWJbqM7SsuhmWssiKizlPZ0sgDwOF7W0xO3hfxRCoTV4ow3jo79GF7Kiuhj6El60xhEXZDDAObFbJItcJICEXQPgqgsv2M4FQbAJToGixyzdWBUAIiCH11oIBMvAAgN1ht4XohddFLFZwnLaWwUPSbAppXmKKcvcSCp0npUPqfYxe8ykv0X2hqp2%2B6mfgORuP0v2zn9NjNwUhohJmyNyPMy6x14OFksJGb54HOzHNKL06j0jMzyP2bR/IrHDyzP%2BeRK8kI0FMAhGtGMAYAxdAvhi04YEGxnJU5p3TntrzguIXi1tlLpY0v9c2wvLLs68ucBcSdjnIccFlfO/lHRl2BPXaUuJ%2BxOBHHAkOi4nA8Urg22eCEw3Rvjfy7ccVUq5VKrVQCXVBqTVIltUkJSO7YleooHhCMYYdSz7qs%2B%2B0s%2Ban74XtCiLXW%2BtDby6PVduQD1RiIrCJT229tHbO1du7GkntvYz3OlUYO6Sw6q%2BKQ4zATiteuKKpRLxPi/EBOqsE0J4TBWO5iYXqm8UjhHGeLVEJRwbZVQ7/Vdo8ycl5Kb0UqmOT2iK8ClEu70RBYsNhiAK4QA%3D%3D%3D"></iframe>

上例中，`io` 是一个 `SHARED` 类型的库目标，`executable` 是由 `main.cpp` 编译并链接而成的可执行文件。通过 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 将 `fmtd` 和 `io` 链接到 `executable` 后，CMake 会根据目标之间的依赖关系安排构建和链接顺序，并在需要时将库中的符号用于解析可执行文件的引用。

#### 5.1.1 可执行文件

可执行文件是由链接器将一个或多个对象文件组合而成的二进制文件。其中至少一个对象文件通常包含程序入口点，例如 C++ 程序中的 `main()`。可执行目标通过 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable) 命令定义：

```cmake
add_executable(mytool mytool.cpp)
```

CMake 会为该目标生成构建规则，构建工具按照构建规则将源文件编译为对象文件，再将这些对象文件及所需的库链接成可执行文件。

可执行文件的链接依赖项可通过 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 命令指定。链接器首先处理可执行文件自身对象文件中产生的符号引用，再按命令中设定的顺序搜索链接库，以解析剩余的符号依赖。

#### 5.1.2 静态库

静态库是对象文件的归档，由归档工具而不是链接器生成。可执行文件、共享库和模块库都可以将静态库作为依赖项。链接时，链接器会根据需要从静态库中提取对象文件，以解析符号引用，并将提取出的对象文件链接到需要它们的二进制目标中。静态库只参与构建时的链接过程，运行时不需要加载该归档文件。

使用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令并指定 `STATIC` 类型，可以显式定义静态库目标：

```cmake
add_library(archive STATIC archive.cpp zip.cpp lzma.cpp)
```

也可以省略库类型；当 [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html#variable:BUILD_SHARED_LIBS) 未设置或为假时，CMake 将把目标创建为静态库：

```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
```

CMake 会生成构建规则，构建工具按照构建规则将源文件编译为对象文件，再使用归档工具创建静态库。

静态库的链接依赖项同样可以使用 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 指定。由于静态库本身只是归档文件，除直接链接的对象库外，其依赖项中的对象文件不会包含在静态库中。CMake 会记录这些依赖关系，以便链接其他二进制目标时按需传递并解析符号。

#### 5.1.3 共享库

共享库是由链接器将对象文件组合而成的二进制文件。可执行文件、其他共享库和模块库都可以将共享库作为依赖项。链接时，链接共享库的目标会记录对该库的引用；运行时，动态加载器会在磁盘上查找并加载共享库及其符号。

使用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令并指定 `SHARED` 类型，可以显式定义共享库目标：

```cmake
add_library(archive SHARED archive.cpp zip.cpp lzma.cpp)
```

也可以省略库类型；当 `BUILD_SHARED_LIBS` 为真时，CMake 将把目标创建为共享库：

```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
```

CMake 会生成构建规则，构建工具按照构建规则将源文件编译为对象文件，再将这些对象文件及所需的库链接成共享库。

共享库的链接依赖项同样可以使用 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 指定。链接器首先处理共享库自身对象文件中的符号引用，再搜索链接的库以解析剩余依赖。

#### 5.1.4 模块库

模块库是由链接器将对象文件组合而成的二进制文件。与共享库不同，模块库不能作为普通链接依赖项供其他二进制目标链接，因此通常不应将模块库放在 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 命令的右侧。模块库更适合作为应用程序在运行时按需加载的插件，例如通过 `dlopen` 加载。

使用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令并指定 `MODULE` 类型，可以定义模块库目标：

```cmake
add_library(archivePlugin MODULE 7z.cpp)
```

CMake 会生成构建规则，构建工具按照构建规则将源文件编译为对象文件，再将这些对象文件链接成模块库。

模块库的链接依赖项可以使用 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 指定。链接器首先处理模块库自身对象文件中的符号引用，再搜索链接的库以解析剩余依赖。

#### 5.1.5 对象库

对象库是由源文件编译得到的一组对象文件集合，不会将这些文件进一步归档或链接。对象库中的对象文件可以用于链接可执行文件、共享库和模块库，也可以用于归档静态库。

使用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 命令并指定 `OBJECT` 类型，可以定义对象库目标：

```cmake
add_library(archiveObjs OBJECT archive.cpp zip.cpp lzma.cpp)
```

CMake 会生成构建规则，构建工具按照构建规则将对象库的源文件编译为对象文件，但不会对这些对象文件进行归档或链接。

其他目标可以通过生成器表达式语法 `$<TARGET_OBJECTS:name>` 将对象库中的对象文件作为源输入：

```cmake
add_library(archiveExtras STATIC $<TARGET_OBJECTS:archiveObjs> extras.cpp)

add_executable(test_exe $<TARGET_OBJECTS:archiveObjs> test.cpp)
```

使用这些对象文件的目标在链接或归档时，会同时包含自身源文件编译得到的对象文件和指定对象库中的对象文件。

或者，也可以将对象库指定为其他目标的链接依赖项：

```cmake
add_library(archiveExtras STATIC extras.cpp)
target_link_libraries(archiveExtras PUBLIC archiveObjs)

add_executable(test_exe test.cpp)
target_link_libraries(test_exe archiveObjs)
```

将对象库作为直接链接依赖项的目标，在链接或归档时会同时包含自身源文件编译得到的对象文件和该对象库中的对象文件。

### 5.2 构建规范与使用要求

每个目标的构建都由两部分设置共同决定：目标自身的构建规范，以及它所链接的依赖项传递而来的使用要求。CMake 通过一组特定于目标的命令配置这些设置。

构建规范描述如何构建目标自身，决定该目标在编译和链接时使用哪些设置，例如自身源文件使用的宏、编译选项、包含目录和链接选项。它们通常对应不带 `INTERFACE_` 前缀的目标属性，只作用于目标自身，不直接描述使用方应如何构建。

使用要求描述该目标提供给使用方的构建约束，决定链接或依赖该目标时，使用方的编译和链接是否需要继承哪些设置，例如公开头文件所在的目录、公开宏、公开编译特性和公开链接库。使用要求通常对应名称以 `INTERFACE_` 开头的目标属性，并沿目标的依赖关系传递给使用方。

下面的综合示例展示了目标命令、构建规范属性、使用要求属性以及作用域关键字的基本用法：

<iframe style="display:block;width:100%;height:clamp(480px,80vh,800px);margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#z:OYLghAFBqd5TKALEAXATgU0wGgJYgQBGArngDYAmAygJ4DOqmAtiAMbMCGA1rqRTQZNmAQXTB6hDj0wgA5HICUOabzET5clQHtmABwqZ0AGU4A7YCU7BMASUrsApACYAQi9cqSjXQHkSqHoBAGKGZpzMspx6ejgAZoaSsAD6qaByqpjJzHhmeMwkzMlYAI5kWJQQAGoAogBK1La%2BAHIA1ADMAHTOAAyKjj0ieujaAFaYbKgQACqc4pioAAojekaoeJj0ACIs2q3GIs0A4gCqIkc11K0AwgAat/2DCWaUyXqcbNzWmDNIWJyUeitOo1ACKJ1sIK2jxEAxEANe5DwRHQc1oEDY2iwrUxWE6bBiMNQcxsqGS9G0JHQbE2GKxmFaizqtiqImmNRx9PxhLhxPmZMx%2BkMyUomGeeHW2jM9Dp2MWJ1cxls11aJ0ax2S118IMZzNZ7Ju2pqyVszXZdWaImMRJJC2SgoM5Cy2j0kulsoZTJZbI5AFoAOqccjkG38%2B26R1ZOKYTioKm03GehVKlVsAAeafJqFeAEYAOyh0nJXJscgkUUivBYSZYjYyxOM5PK1oAEkcedc1wAsiIANLG64nOogs3Jai%2BIfXY1bSHtrYAehLZdFhbtSLM3GSSJRczrHtapvNwREU9a0z%2BMcBIBA5/%2BgJhcIRyUwaYmAU4RCdEGielaXFy3J6KuZIUlSNIyj%2Burega/5mIBwHhkKToimKuQSngUoQTEUH6hyrgQsYM4aiIiyLAhDrCi6bpYb%2BXq4a0AYvhgnAIeum7bqi6B7pBdE%2BpyWCsbkm5URh7o8XqfEBuQOC%2Br6nD0L6ZjYKKlAPk89IfEgEDDC6B5tLY7JdlcWpdostjGNONTBKaBlNM0xm%2BKZ5nGr4izTHZDlORZyTBDUbJDpcenXMYJxbNOkI1Nc0zarYgXjpOgVKs0vbJEqrh1CIzKJaaKWue5LTUDCrStEWfJFjpqzoKg6IAG5BiQDKQW2HYVXORV/ps9DfBA1DTP5VwuM4P6dM1ritXmWyOO0WyjXVZaYHOg0wpgLxxBpbBaYoWiYJQEpYvYIA5vEhgHTmR0JE64SRCA3YyMYeCMPQnSoGmqD4PQthmKW5Y7SAqTJD071dpwuTUJS1KyHIPRaA9virGYf2pEd5DmMAB2ZMoED/ekLjtEuP2tFN1yJp0SAxFNNRwrj%2BOioT7TXBhjD/MwFNwrkqB/iDZgQIohMdlTzh43EopxKq6pHJqRpwsVjAOOwlIc0TRP8Vkc0NTzdPXMrYByI4ACs1xmDrU3uIMuMrbtcRUxN227ag%2B0OM4x1OqdTsXStESyLBgHvZ930qYjANA1zYNgZDOYw/QcMrYHyOo%2BjHgeJj2PyNTX3LgyRMk2Teis4M7Mq8kas/Lz7auK0WBxugZitAALM4Jt81stt7egB3tM7dgODmHfu1dsgkwSsQPX7GcOP9gMPcDoPgzS8gR%2B90cI/9ccWAnbhJzgWNpKngvDNYXCtFKNJs2YHOJkX9UlybLf223Di153p2P33nsgDTmDztnMS%2B%2BnP3j6kSe9Bp5mFDhDeekcl6B0BijNeDg2CJzcIoZQD1bq8GWGMCYqB5DQxwKMQ6OAlIAHdQgu27nrZQ5B5B6y0AjKGWhtDyGmFgTOgsF7YPocgnA3AQDODzN0AAbHmAAnAInoOZa4CIABx8NrlInAVC5C1y0KwAROZOh6ykT0doUiJF5h7lI0Rj86G4MYQoHAkhAYcOhpjRAEAUAvjfHffAhAST0EWOYTA5BqBIG0EQuhC8KIozdB4pS3jfH%2BIgToJCRgQDABzHrJ2QSjDNDfuY5J6B/CoB8X4gJ21XxsHUJIcxji2DUGzLkTQ8QpTZLYEGWQEjqlnxOPQTAiw0w4K0Pg1eoAEEbzcAo5ESQeY4BEpheQvpZZTS2H09wbh8wMJqkYLiophnKHQCQM%2B%2BRMDTG0NocgayLEVLMKErxOTIlyHYSwghRDUR6AgZQ6htDOmjPkDUApAQsStDTFIgRvoBG1xKmwNgrQEndFaBALW/TPBnhYYTNhW0cDWKUMoJAl5YkjMUconArAdGdFrjmUROYpGJN%2BTmbRAjCEvLMVoSxSLOlcJ4e0ZwnQBECOEWddoIiczOGEYkp2ij2jPPoa88xyLbHwDgLAFAmJRQ1DtliFxEBX7XTQZge6j1nqvSabU%2Bph0X41JaW0jpIrukKNRuwLgvALGz0hpkbIaEChFFKOUHa1R6iNBaB0bofQ4Q6XGJMGYtolgrDWHWHYzA9gHGOGcC4xl7gwmeK8d4nxuq3kvECEE4IIrQipoMJ8HE0T7kHjyQYZU7SgQhvWekOE%2BIlqAryYNiFIwoXFNRfc8pFTNjVKaCWWodS8QNP240h56iWmtI2sMyTkhjPdA2QdfpAzBnIhGYU0ZYzxmrXKJsqYMxZlzAWSdRYP6VmrHfPc86d2tjLt2PsA4hwjmmGOCcdQpzJBnHUOci4/4riPWuISW5kScQvTW0ddRjynnTQCSQN4LzQbUvCSgrxSnvk/D8SC3sh4IUreBb82EF2cwAlhv9ApV3IRFmhdt4loJ4QIkRCWJEyIkebZRV0okaK1oNIxV6qJBIbkAzuLitJqP0UTHx4SbHMJ4dohJLj/ppKyXkopZSO0ENrX%2BBtbSKw9IHkMp5My3kwrWWaLZAqhovIuTch5czBnjS%2BX8iCK4ppgqhXCiCKKMU4ovqnFcJKKU0oZSyr5nKyQ8oeXaqVJtFU1i1Svq0JqZdxq5sGMVSI9Auo2B6n1aYap4VDRiCNRLKxFrTVmlfRazhnDLVWutTaSgFFPKpSKxhaqNWoCei9N64qt4yu0HKhV6AlUqoHlyIeOrqB1KdPqnVRr2kvPwR3WBvTEGeFaU6SYolCAW2uPswoCNmU4AtvdJSzRChEFiU7PQ2h6DoSlDtsszB9uXeu7dswx3MCneYOd9AvCLFeKwaJcpcxUD3b2yAA7a2AdSiB1Vd7n3vu/cYMD0Hj3wdOyR7D3IH2zsXeUDhyGad/aZ3pt/XO7RKb5zPoXYuGsy4VwWFSGu9dG5znq4omhTXTHyzxGN7r9j5b9dbkNsIb8P5fy5Dncbk2GkGuaa0ubpqQCPyW04aFf31tui2y8FHCNiWHZeHDnHP3ns3bdDrw68irum9Eobr7F31dQ9AXyEHu3Ud68hxt6HzvbcI/R87837vvdY/h7jm1Ydd7tH3sAQ%2Bx8FqU/PvSS%2B80eY30eXIDnJiGHvx/Z/Un9LOE9YF5geVQuCDKpF9dTDP81pnwm3qxpNfUCzZNbg/BAqLWzI8A7z3CMIDbddwjJ2R3g9G5AHmHAVvXvm5N69n3sTx8e7dDDl3D3B/d6X0Hk7o%2BF/%2B4H4jzf2O7c/YLGH8ButBYf01qTvOsIL8581ozDAMYWbk9PhzWCtP%2BZmwv8LMUYte2SwgjSytCyzXiYgBCazKwXw06lz0zay6wGxGy6ztCmy37tAWx4BWxmw2xp4Z7UogBV6xDipp7YqqLqKaLaK6K1z6I6JGKc5Z7mJ0p852IoAKxBBvRl4ZKpLXRyA/J/IApAogpgrOBaCN515TYN6Gry4t5dIEJP6YB4Ddw4C3LRAPINbp7Cpc5yBZLsFHyix8H/KArADAqgp6zgqQpkZGDwrtA5iIp869YxKDacGWE/bxKJLOxMDoCSDEBRJEC5Boi%2BH%2BHoC0C%2BBEABocKBK6CRBny%2BBmDkC0BRKiikDADXBBgHKJEsCoxTYiq7Rnp4BLLFILwoZMAvLsxeJRKFrBE7aigvIYD5BRJLLoBEDXaYARpZG5DpA2LxAowSBVAbBEJQKXKiE1LiEy4zbSHzYEIq6d4DLbiHKzrFKTLZjTIzGuALKjKNErKbDwB47/Y95a6UAB766UBz4/ZHST5m577nEvZuinEEKL6A676r73F7Eb7A53FHQY4r5g6fEH4h5nHKDyGHS4GaEMHfK/KGGCGmHmHMLYDWG2FaDEHqGkHg5SL4qEpqIkrOBkoUr0Giq0ogBWIMrKA8JCKdDtDtA9BSK/K9BSJ5g9DUF6zqFCp4k0r542Jp4iGslVJImNE3ZShK5AA%3D%3D%3D"></iframe>

上例中，通过 [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources) 和 [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions) 等目标命令设置源文件、宏定义、编译选项、语言特性、包含目录和链接选项。`core` 使用 `PUBLIC` 和 `INTERFACE` 暴露供使用方使用的宏、语言特性、包含目录和链接库，使用 `PRIVATE` 设置只用于自身构建或链接的选项和宏。最后通过 [`get_target_property()`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html) 查看由这些命令填充的目标属性。

#### 5.2.1 目标命令

特定于目标的命令用于设置目标自身的构建规范和使用要求。下表列出常用命令及其对应的目标属性：

| 类型                                          | 填充构建规范属性                         | 填充使用要求属性     
| ---                                           | ---                                    | --- 
| [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html#command:target_compile_definitions) |  [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS) | [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS)     
| [`target_compile_options()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_options.html#command:target_compile_options) |  [`COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_OPTIONS.html#prop_tgt:COMPILE_OPTIONS) | [`INTERFACE_COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_OPTIONS.html#prop_tgt:INTERFACE_COMPILE_OPTIONS)      
| [`target_compile_features()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_features.html#command:target_compile_features)  | [`COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_FEATURES.html#prop_tgt:COMPILE_FEATURES) | [`INTERFACE_COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_FEATURES.html#prop_tgt:INTERFACE_COMPILE_FEATURES)
| [`target_include_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_include_directories.html#command:target_include_directories) | [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INCLUDE_DIRECTORIES.html#prop_tgt:INCLUDE_DIRECTORIES) | [`INTERFACE_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_INCLUDE_DIRECTORIES)
| [`target_sources()`](https://cmake.com.cn/cmake/help/latest/command/target_sources.html#command:target_sources) | [`SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/SOURCES.html#prop_tgt:SOURCES) | [`INTERFACE_SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SOURCES.html#prop_tgt:INTERFACE_SOURCES)
| [`target_precompile_headers()`](https://cmake.com.cn/cmake/help/latest/command/target_precompile_headers.html#command:target_precompile_headers) | [`PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/PRECOMPILE_HEADERS.html#prop_tgt:PRECOMPILE_HEADERS) | [`INTERFACE_PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_PRECOMPILE_HEADERS.html#prop_tgt:INTERFACE_PRECOMPILE_HEADERS)
| [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) | [`LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_LIBRARIES.html#prop_tgt:LINK_LIBRARIES) | [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES)
| [`target_link_directories()`](https://cmake.com.cn/cmake/help/latest/command/target_link_directories.html#command:target_link_directories) | [`LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DIRECTORIES.html#prop_tgt:LINK_DIRECTORIES) | [`INTERFACE_LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DIRECTORIES.html#prop_tgt:INTERFACE_LINK_DIRECTORIES)
| [`target_link_options()`](https://cmake.com.cn/cmake/help/latest/command/target_link_options.html#command:target_link_options) | [`LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_OPTIONS.html#prop_tgt:LINK_OPTIONS) | [`INTERFACE_LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_OPTIONS.html#prop_tgt:INTERFACE_LINK_OPTIONS)

这些命令使用作用域关键字来指定设置的适用范围：仅当前目标、仅使用该目标的目标，或两者。每个关键字之后的参数都按该范围处理：

| 类型             | 作用                                 
| ---             | ---                                    
| `PUBLIC`    | 同时设置当前目标自身的构建属性和供使用方使用的接口属性。 |
| `PRIVATE`   | 仅设置当前目标自身的构建属性。 |
| `INTERFACE` | 仅设置供使用方使用的接口属性。 |

目标构建规范属性和使用要求属性既可以通过对应的目标命令设置，也可以通过通用属性命令直接设置。如：

```cmake
target_compile_definitions(mylib
  PUBLIC MYLIB_FEATURE=1
)
```

等价于：

```cmake
set_property(TARGET mylib
  APPEND PROPERTY COMPILE_DEFINITIONS MYLIB_FEATURE=1
)

set_property(TARGET mylib
  APPEND PROPERTY INTERFACE_COMPILE_DEFINITIONS MYLIB_FEATURE=1
)
```

或等价于：

```cmake
set_target_properties(mylib PROPERTIES
  COMPILE_DEFINITIONS "MYLIB_FEATURE=1"
  INTERFACE_COMPILE_DEFINITIONS "MYLIB_FEATURE=1"
)
```

> 提示：对于有相应目标命令的属性在设置时，通常推荐优先使用对应的目标命令，而非选择通用的属性设置方法，如在设置 [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS) 和 [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS) 时更推荐使用 [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html)，而非使用 [`set_property()`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 和 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html)。[`set_property()`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 和 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html) 是通用的属性设置方式。<br><br>目标命令相比于通用属性设置方法能直接表达设置的语义，并通过 `PRIVATE`、`PUBLIC`、`INTERFACE` 明确区分自身属性和传递给使用方的接口属性，因而是日常 CMake 项目中最常用的写法。例如，使用目标命令 [`target_compile_definitions()`](https://cmake.com.cn/cmake/help/latest/command/target_compile_definitions.html) 设置编译定义时会同时维护当前目标的 [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS) 和供使用方读取的 [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS) 属性；而通用属性设置命令则需要直接写出目标属性名及其预期作用，适合设置没有专用目标命令的属性，或一次性集中设置多个属性。
{: .prompt-tip }

#### 5.2.2 目标构建规范

二进制目标的构建规范由一组目标属性表示。编译和链接目标时，CMake 会综合考虑目标自身的属性，以及从其链接依赖项传递而来的、名称以 `INTERFACE_` 开头的对应使用要求属性。

##### 5.2.2.1 目标编译属性

下列属性描述目标源文件的编译设置：

| 类型             | 作用                                     
| ---             | ---                                    
| [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS)	        | 用于编译目标中源文件的编译定义列表,    <br> 它们以未指定的顺序通过 -D 标志或等效标志传递给编译器。
| [`COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_OPTIONS.html#prop_tgt:COMPILE_OPTIONS)	                    | 用于编译目标中源文件的编译选项列表,    <br> 它们按出现顺序作为标志传递给编译器。
| [`COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_FEATURES.html#prop_tgt:COMPILE_FEATURES)	                  | 编译目标中源文件所需的编译特性列表,  <br> 通常，这些确保目标的源文件使用足够的语言标准级别进行编译。
| [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INCLUDE_DIRECTORIES.html#prop_tgt:INCLUDE_DIRECTORIES)	        | 用于编译目标中源文件的包含目录列表,    <br> 它们按出现顺序通过 `-I` 或 `-isystem` 标志或等效标志传递给编译器。
| [`SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/SOURCES.html#prop_tgt:SOURCES)	                                            | 与目标关联的源文件列表,  <br> 包括在通过 [`add_executable()`](https://cmake.com.cn/cmake/help/latest/command/add_executable.html#command:add_executable)、[`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 或 [`add_custom_target()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_target.html) 命令创建目标时指定的源文件。
| [`PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/PRECOMPILE_HEADERS.html#prop_tgt:PRECOMPILE_HEADERS)	            | 编译目标中源文件时要预编译并包含的头文件列表。

##### 5.2.2.2 目标链接属性

下列属性描述目标的链接设置。可执行文件、共享库和模块库会执行链接步骤并使用相应设置；静态库本身不执行链接步骤，但会记录其链接库依赖，以便后续链接依赖它的目标时使用。

| 类型             | 作用                                          
| ---             | ---                                    
| [`LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_LIBRARIES.html#prop_tgt:LINK_LIBRARIES) | 链接该目标时使用的库或目标列表；CMake 会将其转换为当前工具链所需的链接输入。 |
| [`LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DIRECTORIES.html#prop_tgt:LINK_DIRECTORIES) | 链接该目标时使用的目录列表。<br>目录通常通过 `-L` 等链接器选项传递给链接器。 |
| [`LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_OPTIONS.html#prop_tgt:LINK_OPTIONS) | 链接该目标时使用的选项列表，按顺序传递给链接器。 |
| [`LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DEPENDS.html#prop_tgt:LINK_DEPENDS) | 链接该目标所依赖的文件列表。 |

#### 5.2.3 目标使用要求

目标的使用要求是为正确使用该目标而需要应用到使用方的编译和链接设置，包括公开头文件目录、编译宏、编译选项、编译特性、预编译头文件，以及需要传递的链接库、链接目录和链接选项等。关键字 `PRIVATE`、`PUBLIC` 和 `INTERFACE` 可用于控制使用要求是否应当用于当前目标和当前目标的使用方。

> 注意：不要仅为方便向下游目标传递任意编译选项或宏定义而滥用使用要求。只有当下游目标确实需要某项设置才能正确使用该目标时，才应将其设为使用要求。
{: .prompt-warning }

```cmake
add_library(archive archive.cpp)
target_compile_definitions(archive INTERFACE USING_ARCHIVE_LIB)

add_library(serialization serialization.cpp)
target_compile_definitions(serialization INTERFACE USING_SERIALIZATION_LIB)

add_library(archiveExtras extras.cpp)
target_link_libraries(archiveExtras PUBLIC archive)
target_link_libraries(archiveExtras PRIVATE serialization)
# archiveExtras is compiled with -DUSING_ARCHIVE_LIB and -DUSING_SERIALIZATION_LIB

add_executable(consumer consumer.cpp)
target_link_libraries(consumer archiveExtras)
# consumer is compiled with -DUSING_ARCHIVE_LIB
```

上例中，`archive` 是 `archiveExtras` 的 `PUBLIC` 依赖项，因此 `archive` 的使用要求既应用于 `archiveExtras`，也会继续传递给 `consumer`。`serialization` 是 `archiveExtras` 的 `PRIVATE` 依赖项，因此其使用要求应用于 `archiveExtras`，但不会通过该依赖关系继续传递给 `consumer`。

通常，仅供库实现使用、而不用于其公共头文件的依赖项应通过 `PRIVATE` 指定。如果依赖项既供库实现使用，也供公共头文件使用（例如用于公开类的基类），则应通过 `PUBLIC` 指定。如果依赖项只供公共头文件使用，而库实现本身不需要它，则应通过 `INTERFACE` 指定。一次 [`target_link_libraries()`](https://cmake.com.cn/cmake/help/latest/command/target_link_libraries.html#command:target_link_libraries) 调用可以包含多个作用域关键字，也可以分多次调用。

```cmake
target_link_libraries(archiveExtras
  PUBLIC archive
  PRIVATE serialization
)
```

##### 5.2.3.1 传递的编译属性

以下属性表示需要传递给使用方的编译设置：

| 类型 | 作用 |
| --- | --- |
| [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS) | 编译使用方目标的源文件时要使用的编译宏列表，<br>通常供目标的头文件使用。 |
| [`INTERFACE_COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_OPTIONS.html#prop_tgt:INTERFACE_COMPILE_OPTIONS) | 编译使用方目标的源文件时要使用的编译选项列表。 |
| [`INTERFACE_COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_FEATURES.html#prop_tgt:INTERFACE_COMPILE_FEATURES) | 编译使用方目标的源文件时所需的编译特性列表。 |
| [`INTERFACE_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_INCLUDE_DIRECTORIES) | 编译使用方目标的源文件时要搜索的头文件目录列表，<br>通常包含目标公开头文件所在的位置。 |
| [`INTERFACE_SYSTEM_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SYSTEM_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_SYSTEM_INCLUDE_DIRECTORIES) | 编译使用方目标的源文件时应作为系统包含目录的目录列表。 |
| [`INTERFACE_SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SOURCES.html#prop_tgt:INTERFACE_SOURCES) | 在使用方目标中需要加入构建的源文件列表。 |
| [`INTERFACE_PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_PRECOMPILE_HEADERS.html#prop_tgt:INTERFACE_PRECOMPILE_HEADERS) | 编译使用方目标的源文件时要预编译并包含的头文件列表。 |

##### 5.2.3.2 传递的链接属性

以下属性表示需要传递给使用方的链接设置：

| 类型 | 作用 |
| --- | --- |
| [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES) | 链接使用方二进制目标时要包含的库或目标列表。 |
| [`INTERFACE_LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DIRECTORIES.html#prop_tgt:INTERFACE_LINK_DIRECTORIES) | 链接使用方二进制目标时要搜索的库目录列表。 |
| [`INTERFACE_LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_OPTIONS.html#prop_tgt:INTERFACE_LINK_OPTIONS) | 链接使用方二进制目标时要传递给链接器的选项列表。 |
| [`INTERFACE_LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DEPENDS.html#prop_tgt:INTERFACE_LINK_DEPENDS) | 链接使用方二进制目标时所依赖的文件列表。 |

## 6. CMake 模块

CMake 利用代码重用技术创建可重用的模块，称之为 [`cmake-modules`](https://cmake.com.cn/cmake/help/latest/manual/cmake-modules.7.html)。模块的位置可以使用模块文件的完整路径指定，也可以让 CMake 自己查找模块。CMake 将在 CMAKE_MODULE_PATH 指定的目录中查找模块；如果无法在该目录中找到模块，它将在 Modules 安装子目录中查找。模块可以细分为以下几个主要类别：

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

以 [`CheckIncludeFile`](https://cmake.com.cn/cmake/help/latest/module/CheckIncludeFile.html) 检查 C 头文件模块为例，查找 C 头文件 `<unistd.h>` 是否存在，并将检查结果存储在 `HAVE_UNISTD_H` 缓存变量中。使用方式如下：

```cmake
include(CheckIncludeFile)

check_include_file(unistd.h HAVE_UNISTD_H)
```

### 6.3 自定义模块

自定义模块是一个以 .cmake 为扩展名的文件，其中定义了可被 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 加载的 CMake 函数和宏。其创建步骤是：

1. 创建存放自定义模块的文件夹；
2. 在自定义模块文件夹下创建模块文件，编写模块内容，实现模块功能；
3. 扩展 CMake 模块搜索路径，在 CMakeLists.txt 中通过 `CMAKE_MODULE_PATH` 注册该目录；
4. 加载模块并使用模块函数，使用 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 引入模块并调用其中的函数。

例如，创建自定义模块并命名为 CustomModule.cmake，编写模块内容：

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

`CMAKE_MODULE_PATH` 是 CMake 查找模块文件时的搜索路径列表。CMake 会先在内置模块路径中查找，找不到时再到 `CMAKE_MODULE_PATH` 指定的路径中查找。

## 7. CMake 包

包为基于 CMake 的构建系统提供依赖信息。下游项目通过 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 查找包，使用结果通常是一组 [`IMPORTED`](https://cmake.com.cn/cmake/help/latest/prop_tgt/IMPORTED.html) 目标，也可能是一组由包提供的变量。

CMake 直接支持两类包：

* **配置文件包**：由上游提供 `*Config.cmake` 或 `*-config.cmake` 文件，其中包含包的位置、导出的目标及使用要求；
* **查找模块包**：由下游提供 `Find<PackageName>.cmake` 文件，通过搜索平台中的头文件、库等资源来发现包。

此外，CMake 可通过 [`FindPkgConfig`](https://cmake.com.cn/cmake/help/latest/module/FindPkgConfig.html) 模块间接支持 `pkg-config` 包。

### 7.1 查找和使用包

[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 的基本形式如下：

```cmake
find_package(ZLIB)
target_link_libraries(app PRIVATE ZLIB::ZLIB)
```

使用包时，可指定最低版本、必需状态、包类型和组件：

```cmake
find_package(OpenSSL 3.0 REQUIRED)
find_package(Qt6 6.5 REQUIRED COMPONENTS Core Gui)
find_package(Foo 2.0 CONFIG REQUIRED)
find_package(Bar 1.2 MODULE QUIET)
```

其中：

* `REQUIRED` 表示找不到包时立即终止配置；
* `QUIET` 表示找不到包时不打印默认查找信息；
* `CONFIG` 表示只使用配置文件包；
* `MODULE` 表示只使用查找模块包；
* `COMPONENTS` 表示请求包中的指定组件；
* `OPTIONAL_COMPONENTS` 表示请求可选组件，缺少时仍允许继续配置。

包配置文件通常会提供带有命名空间的 [`IMPORTED`](https://cmake.com.cn/cmake/help/latest/prop_tgt/IMPORTED.html) 目标，例如 `Foo::Foo` 和 `Qt6::Core`。推荐优先链接这些目标，而不是直接在项目中填写头文件目录和库文件路径。导入目标携带了头文件目录、编译宏、链接库等使用要求，能让下游保持简单、统一的使用方式。

如果需要判断包是否找到，可使用 `<PackageName>_FOUND`：

```cmake
find_package(Foo QUIET)

if(Foo_FOUND)
  target_link_libraries(app PRIVATE Foo::Foo)
else()
  message(STATUS "Foo was not found")
endif()
```

使用配置文件包时，CMake 会设置：

* `<PackageName>_FOUND`：记录包是否找到；
* `<PackageName>_DIR`：记录包配置文件所在目录；
* 一组由包提供的版本变量，例如 `<PackageName>_VERSION`；
* 包自己的目标或变量，例如 `Foo::Foo`、`Foo_INCLUDE_DIRS`。

查找模块包与配置文件包的区别在于：查找模块包的查找规则由下游定义，通常没有统一的 `<PackageName>_DIR` 或完整的导入目标约定；因此，查找模块文件应自行设置 `<PackageName>_FOUND`，并尽量提供形如 `<PackageName>::<Name>` 的导入目标。

### 7.2 包配置文件和版本文件

配置文件包通常位于安装前缀的以下位置：

```text
<prefix>/lib/cmake/Foo/FooConfig.cmake
<prefix>/lib/cmake/Foo/FooConfigVersion.cmake
```

它们也可以放在 `lib*/cmake/Foo` 等 CMake 约定的位置。给定包名 `Foo` 后，[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 会查找 `FooConfig.cmake` 或 `foo-config.cmake`；找到候选配置文件后，再查找相邻的版本文件。

包配置文件负责加载导出的目标、查找依赖项并检查组件：

```cmake
# FooConfig.cmake

include(CMakeFindDependencyMacro)
find_dependency(Bar 2.0)

include("${CMAKE_CURRENT_LIST_DIR}/FooTargets.cmake")
```

其中，[`find_dependency()`](https://cmake.com.cn/cmake/help/latest/module/CMakeFindDependencyMacro.html) 用于在包配置文件中查找其依赖项，并根据依赖项是否找到设置包的 `<PackageName>_FOUND` 状态。这里的包依赖关系应与目标的 `PUBLIC` 或 `INTERFACE` 使用要求保持一致：

* 包自己的实现私有依赖可以不暴露给下游；
* `PUBLIC` 和 `INTERFACE` 依赖应由包配置文件查找；
* 依赖项最好使用导入目标，而不是变量中的绝对库路径。

包版本文件由 [`write_basic_package_version_file()`](https://cmake.com.cn/cmake/help/latest/module/CMakePackageConfigHelpers.html) 生成，用于判断包版本是否与下游请求兼容：

```cmake
include(CMakePackageConfigHelpers)

write_basic_package_version_file(
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfigVersion.cmake"
  VERSION ${Foo_VERSION}
  COMPATIBILITY SameMajorVersion
)
```

常用兼容模式包括：

| 兼容模式 | 含义 |
| --- | --- |
| `ExactVersion` | 只接受精确版本 |
| `SameMajorVersion` | 接受相同主版本的更高版本 |
| `SameMinorVersion` | 接受相同主次版本的更高补丁版本 |
| `AnyNewerVersion` | 接受不低于请求版本的任意版本 |
| `SemanticVersion` | 主版本大于零时按 `SameMajorVersion`，主版本为零时按 `SameMinorVersion` |
| `SamePatchVersion` | 只接受相同主版本、次版本和补丁版本 |
| `SameFullVersion` | 要求所有指定版本组件完全匹配 |
| `ExactVersion` | 要求精确版本；CMake 4.4 起已弃用 |

兼容规则最终应由项目的 API 和 ABI 策略决定，而不应机械地选择最宽松的规则。

### 7.3 创建可供下游使用的包

为项目生成包时，一般需要完成以下工作：

1. 使用 `install(TARGETS)` 安装库、可执行文件或头文件；
2. 使用 `install(EXPORT)` 导出目标并生成目标配置文件；
3. 使用 `configure_package_config_file()` 生成包含安装路径的包配置文件；
4. 使用 `write_basic_package_version_file()` 生成包版本文件；
5. 使用 `install(FILES)` 将配置文件和版本文件安装到相同目录。

假设项目提供了名为 `Foo` 的库，可采用下面的结构：

```cmake
add_library(Foo foo.cpp)
add_library(Foo::Foo ALIAS Foo)

target_include_directories(Foo
  PUBLIC
    "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>"
    "$<INSTALL_INTERFACE:include>"
)

set_target_properties(Foo PROPERTIES
  EXPORT_NAME Foo
)

install(TARGETS Foo
  EXPORT FooTargets
  LIBRARY DESTINATION lib
  ARCHIVE DESTINATION lib
  RUNTIME DESTINATION bin
  INCLUDES DESTINATION include
)

install(DIRECTORY include/
  DESTINATION include
)

install(EXPORT FooTargets
  FILE FooTargets.cmake
  NAMESPACE Foo::
  DESTINATION lib/cmake/Foo
)
```

这里的：

* `add_library(Foo::Foo ALIAS Foo)` 为构建树提供与安装包相同的目标名称；
* `BUILD_INTERFACE` 描述源码目录中的头文件位置；
* `INSTALL_INTERFACE` 描述安装后相对于安装前缀的头文件位置；
* `NAMESPACE Foo::` 确保下游得到 `Foo::Foo` 等导入目标。

接着，项目可使用 [`CMakePackageConfigHelpers`](https://cmake.com.cn/cmake/help/latest/module/CMakePackageConfigHelpers.html) 创建配置文件：

```cmake
include(CMakePackageConfigHelpers)

configure_package_config_file(
  cmake/FooConfig.cmake.in
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfig.cmake"
  INSTALL_DESTINATION lib/cmake/Foo
)

write_basic_package_version_file(
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfigVersion.cmake"
  VERSION ${PROJECT_VERSION}
  COMPATIBILITY SameMajorVersion
)

install(FILES
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfig.cmake"
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfigVersion.cmake"
  DESTINATION lib/cmake/Foo
)
```

包配置模板通常只需要包含导出的目标：

```cmake
@PACKAGE_INIT@

include("${CMAKE_CURRENT_LIST_DIR}/FooTargets.cmake")

check_required_components(Foo)
```

模板中的 `@PACKAGE_INIT@` 会初始化包的安装前缀处理逻辑；需要查找外部依赖时，也应在此处使用 `find_dependency()`。

### 7.4 为构建树导出包

包不一定非要先安装后使用。项目可使用 [`export(EXPORT)`](https://cmake.com.cn/cmake/help/latest/command/export.html) 或 [`export(TARGETS)`](https://cmake.com.cn/cmake/help/latest/command/export.html) 导出目标供构建树中的其他项目使用：

```cmake
export(EXPORT FooTargets
  FILE "${CMAKE_CURRENT_BINARY_DIR}/FooTargets.cmake"
  NAMESPACE Foo::
)
```

也可在顶层构建目录中配置包配置文件和版本文件，使下游项目无需安装即可查找包。但这种导出的目标通常包含构建目录中的绝对路径，只适合本机的构建树，不应作为可重定位的发行包。

下游项目可通过以下方式查找构建目录中的包：

```cmake
set(Foo_DIR "/path/to/build/Foo")
find_package(Foo CONFIG REQUIRED)
```

或者将构建目录加入 `CMAKE_PREFIX_PATH`：

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/path/to/build
```

构建目录中的包主要用于开发和测试，不应替代正式的安装包。

### 7.5 创建可重定位的包

可重定位的包不应在配置文件中引用制作该包的机器上的绝对路径。[`install(EXPORT)`](https://cmake.com.cn/cmake/help/latest/command/install.html) 导出的目标会使用相对于包自身位置的路径，因此应优先使用它创建发行包。

在声明目标的安装接口时，包含目录应使用相对于安装前缀的相对路径：

```cmake
# 错误：硬编码构建机器的安装前缀
target_include_directories(Foo INTERFACE
  "$<INSTALL_INTERFACE:${CMAKE_INSTALL_PREFIX}/include/Foo>"
)

# 正确：相对于安装前缀
target_include_directories(Foo INTERFACE
  "$<INSTALL_INTERFACE:include/Foo>"
)
```

也不要在可重定位包中直接填写外部依赖的绝对库路径：

```cmake
# 不推荐：Bar_INCLUDE_DIRS 和 Bar_LIBRARIES
# 可能包含制作包机器上的绝对路径
target_link_libraries(Foo INTERFACE
  ${Bar_LIBRARIES}
)
target_include_directories(Foo INTERFACE
  "$<INSTALL_INTERFACE:${Bar_INCLUDE_DIRS}>"
)
```

应该让外部依赖提供自己的导入目标，并在本项目中按目标链接：

```cmake
find_package(Bar 2.0 REQUIRED)
target_link_libraries(Foo PUBLIC Bar::Bar)
```

对应的 `FooConfig.cmake` 应查找 `Bar` 包：

```cmake
include(CMakeFindDependencyMacro)
find_dependency(Bar 2.0)

include("${CMAKE_CURRENT_LIST_DIR}/FooTargets.cmake")
```

下游加载 `Foo` 包时，CMake 会根据自身机器上的位置查找 `Bar`，并填充 `Bar::Bar` 导入目标。这样一来，`Foo` 包只需引用 `Bar::Bar` 这个稳定名称，而不需要记录依赖项在制作机器上的绝对路径。

如果依赖项本身只提供旧式变量而没有导入目标，可以通过查找模块提供包装目标；或者在打包时将库名写成 `foo` 等链接器可解析的名称，而不是硬编码绝路径。

### 7.6 包注册表

CMake 还提供包注册表，用于记录构建树或安装树中包配置文件的位置。当包安装在非标准位置，或正在本地开发尚未安装的包时，注册表可以帮助 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 发现包。

项目可在配置阶段使用 [`export(PACKAGE)`](https://cmake.com.cn/cmake/help/latest/command/export.html) 将构建树注册到用户包注册表：

```cmake
export(PACKAGE Foo)
```

注册表分为：

* 用户包注册表：记录当前用户的包，Windows 存储在 `HKEY_CURRENT_USER`，Unix-like 平台存储在 `~/.cmake/packages`；
* 系统包注册表：记录系统范围的包，Windows 存储在 `HKEY_LOCAL_MACHINE`，非 Windows 平台通常没有系统包注册表。

包注册表主要作为便利机制，不应取代明确的包查找参数。在脚本、CI 和可重复构建环境中，通常应优先使用 `CMAKE_PREFIX_PATH`、工具链文件或包管理器提供的安装前缀来定位依赖项。

若不希望使用包注册表，可按策略禁用：

* 将 [`CMAKE_FIND_USE_PACKAGE_REGISTRY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_PACKAGE_REGISTRY.html) 设置为 `FALSE` 可以在所有 `find_package()` 调用中禁用用户包注册表；
* 将 [`CMAKE_FIND_USE_SYSTEM_PACKAGE_REGISTRY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_SYSTEM_PACKAGE_REGISTRY.html) 设置为 `FALSE` 可以禁用系统包注册表；
* 在策略 `CMP0090` 为 `NEW` 时，将 [`CMAKE_EXPORT_PACKAGE_REGISTRY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXPORT_PACKAGE_REGISTRY.html) 设置为 `TRUE` 可以允许 `export(PACKAGE)` 向用户包注册表写入内容；未启用时则默认禁用；
* 在策略 `CMP0090` 未设为 `NEW` 时，可通过 [`CMAKE_EXPORT_NO_PACKAGE_REGISTRY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXPORT_NO_PACKAGE_REGISTRY.html) 禁止 `export(PACKAGE)` 向注册表写入内容。

## 8. CMake 属性

CMake 属性用于保存和读取构建过程中的配置信息。属性与变量相似，但归属于特定作用域，例如全局作用域、目录、目标、源文件、测试、缓存项或已安装文件。配置和生成构建系统时，CMake 会读取这些属性，并将其转换为编译器、链接器和构建工具所需的选项。

属性的主要作用范围包括：

| 作用范围 | 常用属性前缀或示例 | 典型用途 |
| --- | --- | --- |
| 全局属性 | `USE_FOLDERS`、`DEBUG_CONFIGURATIONS` | 控制整个构建系统的行为 |
| 目录属性 | `COMPILE_DEFINITIONS`、`INCLUDE_DIRECTORIES` | 为目录及其子目录中的目标设置默认配置 |
| 目标属性 | `CXX_STANDARD`、`SOURCES`、`OUTPUT_NAME` | 描述目标的源码、编译、链接、输出和使用要求 |
| 源文件属性 | `COMPILE_DEFINITIONS`、`COMPILE_OPTIONS` | 为某个源文件设置特殊编译选项 |
| 测试属性 | `TIMEOUT`、`LABELS`、`ENVIRONMENT` | 配置测试的运行方式 |
| 缓存项属性 | `ADVANCED`、`HELPSTRING` | 配置缓存变量在 GUI 或界面中的显示方式 |
| 已安装文件属性 | `CPACK_` 等打包属性 | 控制构建产物的安装和打包 |

属性名区分大小写。一个属性既可能存在于多个作用域，也可能只属于一个作用域；例如，`COMPILE_DEFINITIONS` 既是目录属性，也是目标属性，而不是所有属性都能在任意作用域中使用。

### 8.1 属性的读取和设置

设置属性的通用命令是 [`set_property()`](https://cmake.com.cn/cmake/help/latest/command/set_property.html)：

```cmake
set_property(TARGET app PROPERTY CXX_STANDARD 20)

set_property(TARGET app APPEND PROPERTY
  COMPILE_DEFINITIONS APP_WITH_NETWORK
)

set_property(SOURCE src/main.cpp APPEND PROPERTY
  COMPILE_DEFINITIONS USE_MAIN_ENTRY
)
```

没有复杂追加需求时，也可使用 [`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html) 集中设置多个目标属性：

```cmake
set_target_properties(app PROPERTIES
  CXX_STANDARD 20
  CXX_STANDARD_REQUIRED YES
  CXX_EXTENSIONS NO
  OUTPUT_NAME my_app
)
```

读取属性时，可使用 [`get_property()`](https://cmake.com.cn/cmake/help/latest/command/get_property.html) 或具有特定作用域的便捷命令：

```cmake
get_property(app_sources
  TARGET app
  PROPERTY SOURCES
)

get_target_property(app_standard app CXX_STANDARD)

message(STATUS "app sources: ${app_sources}")
```

如果目标属性尚未定义，[`get_target_property()`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html) 将把变量设置为 `app-NOTFOUND`。因此，读取属性时应先判断变量是否为预期值，避免将未定义属性误用于后续逻辑。

对于有专用目标命令的属性，通常优先使用目标命令。例如：

```cmake
# 推荐
target_include_directories(app PRIVATE include)
target_compile_features(app PRIVATE cxx_std_20)
target_link_libraries(app PRIVATE Foo::Foo)

# 通用属性写法，等价含义较多
set_property(TARGET app APPEND PROPERTY INCLUDE_DIRECTORIES include)
set_property(TARGET app APPEND PROPERTY COMPILE_FEATURES cxx_std_20)
set_property(TARGET app APPEND PROPERTY LINK_LIBRARIES Foo::Foo)
```

专用目标命令能通过 `PRIVATE`、`PUBLIC` 和 `INTERFACE` 明确区分目标自身的编译设置与提供给使用方的使用要求，因此在日常项目中更适合使用。

> 提醒：不要为了简化代码就把所有属性都设置到全局或顶层目录。只有确实适用于作用域内所有目标的设置才适合放在目录属性中。
{: .prompt-tip }

### 8.2 全局和目录属性

全局属性影响整个构建系统，通常由 [`set_property(GLOBAL ...)`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 设置：

```cmake
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
```

常用全局属性包括：

| 属性 | 作用 |
| --- | --- |
| `USE_FOLDERS` | 在支持的 IDE 中按目标、工程或自定义文件夹组织目标 |
| `DEBUG_CONFIGURATIONS` | 指定哪些构建配置应被视为调试配置 |
| `PREDEFINED_TARGETS_FOLDER` | 指定 CMake 自动生成的预定义目标所在的 IDE 文件夹 |
| `PACKAGES_FOUND` | 记录已找到的包名称 |
| `PACKAGES_NOT_FOUND` | 记录未找到的包名称 |

目录属性用于影响当前目录及其由 `add_subdirectory()` 或其他方式引入的子目录中的目标：

```cmake
add_compile_definitions(PROJECT_WITH_GUI)
add_compile_options(-Wall)
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/include")
```

上述便捷命令分别填充目录的 `COMPILE_DEFINITIONS`、`COMPILE_OPTIONS` 和 `INCLUDE_DIRECTORIES` 属性。目录属性可通过 [`set_property(DIRECTORY ...)`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 显式设置：

```cmake
set_property(DIRECTORY PROPERTY
  COMPILE_DEFINITIONS PROJECT_WITH_GUI
)
```

常用目录属性包括：

| 属性 | 作用 |
| --- | --- |
| `COMPILE_DEFINITIONS` | 为目录及其子目录中的目标添加编译宏 |
| `COMPILE_OPTIONS` | 为目录及其子目录中的目标添加编译选项 |
| `INCLUDE_DIRECTORIES` | 为目录及其子目录中的目标添加包含目录 |
| `LINK_DIRECTORIES` | 为目录及其子目录中的目标添加链接搜索目录 |
| `LINK_OPTIONS` | 为目录及其子目录中的目标添加链接选项 |
| `SOURCE_DIR` | 只读属性，获取目录的源码目录 |
| `BINARY_DIR` | 只读属性，获取目录的构建目录 |

目录属性对构建规范具有继承关系，但现代 CMake 更推荐优先使用目标命令。目标命令具有更明确的依赖关系，也能把设置限制在需要该设置的目标范围内。

### 8.3 常用目标属性

目标属性是 CMake 中最常用的属性类型。它们可描述目标所需的语言标准、源文件、编译参数、链接参数、输出位置以及向下游暴露的使用要求。

#### 8.3.1 编译属性

| 属性 | 作用 |
| --- | --- |
| `C_STANDARD` | 指定 C 语言标准 |
| `CXX_STANDARD` | 指定 C++ 语言标准 |
| `C_STANDARD_REQUIRED` | 是否要求严格使用指定的 C 语言标准 |
| `CXX_STANDARD_REQUIRED` | 是否要求严格使用指定的 C++ 语言标准 |
| `C_EXTENSIONS` | 是否允许编译器扩展的 C 语言特性 |
| `CXX_EXTENSIONS` | 是否允许编译器扩展的 C++ 语言特性 |
| `COMPILE_DEFINITIONS` | 编译目标源文件时使用的编译宏 |
| `COMPILE_FEATURES` | 编译目标所需的语言或编译器特性 |
| `COMPILE_OPTIONS` | 编译目标源文件时使用的编译选项 |
| `INCLUDE_DIRECTORIES` | 编译目标源文件时搜索头文件的目录 |
| `PRECOMPILE_HEADERS` | 编译目标时需要预编译的头文件 |
| `COMPILE_WARNING_AS_ERROR` | 是否将编译警告视为错误 |

常用写法是直接使用目标命令：

```cmake
target_compile_features(app PRIVATE cxx_std_20)
target_compile_definitions(app PRIVATE APP_VERSION=\"1.0\")
target_compile_options(app PRIVATE -Wall -Wextra)
target_include_directories(app PRIVATE include)
target_precompile_headers(app PRIVATE include/pch.h)
```

设置语言标准时，还可使用以下属性：

```cmake
set_target_properties(app PROPERTIES
  CXX_STANDARD 20
  CXX_STANDARD_REQUIRED YES
  CXX_EXTENSIONS NO
)
```

#### 8.3.2 链接属性

| 属性 | 作用 |
| --- | --- |
| `LINK_LIBRARIES` | 链接目标时使用的库或目标 |
| `LINK_DIRECTORIES` | 链接目标时搜索库的目录 |
| `LINK_OPTIONS` | 链接目标时传递给链接器的选项 |
| `LINK_DEPENDS` | 链接目标所依赖的文件 |
| `INTERPROCEDURAL_OPTIMIZATION` | 是否启用过程间优化或链接时优化 |
| `BUILD_RPATH` | 构建产物运行时搜索共享库的路径 |
| `INSTALL_RPATH` | 安装产物运行时搜索共享库的路径 |

例如：

```cmake
target_link_libraries(app PRIVATE Foo::Foo)
target_link_options(app PRIVATE -Wl,--as-needed)

set_target_properties(app PROPERTIES
  BUILD_RPATH_USE_ORIGIN YES
  INSTALL_RPATH "$ORIGIN/../lib"
)
```

一般应优先让依赖项通过导入目标提供链接和包含目录，而不是在目标上直接写绝对库路径。

#### 8.3.3 输出属性

| 属性 | 作用 |
| --- | --- |
| `OUTPUT_NAME` | 设置输出文件的基础名称 |
| `ARCHIVE_OUTPUT_DIRECTORY` | 设置静态库的输出目录 |
| `LIBRARY_OUTPUT_DIRECTORY` | 设置共享库和模块库的输出目录 |
| `RUNTIME_OUTPUT_DIRECTORY` | 设置可执行文件和共享库运行时产物的输出目录 |
| `PDB_OUTPUT_DIRECTORY` | 设置程序数据库文件的输出目录 |
| `DEBUG_POSTFIX` | 调试构建产物附加的文件名后缀 |
| `POSITION_INDEPENDENT_CODE` | 是否使用位置无关代码 |

多配置生成器还可通过带配置后缀的属性分别指定每种配置：

```cmake
set_target_properties(app PROPERTIES
  OUTPUT_NAME "tool"
  RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
  DEBUG_POSTFIX "_d"
)

set_target_properties(app PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_BINARY_DIR}/bin/Debug"
  RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_BINARY_DIR}/bin/Release"
)
```

`OUTPUT_NAME` 设置的是产物的基础名称，不包括平台生成的前缀和扩展名。例如，名为 `Foo` 的库在 Linux 上可能生成 `libFoo.so`，在 Windows 上可能生成 `Foo.dll`。

#### 8.3.4 使用要求属性

名称以 `INTERFACE_` 开头的目标属性表示该目标提供给使用方的使用要求：

| 属性 | 作用 |
| --- | --- |
| `INTERFACE_COMPILE_DEFINITIONS` | 使用方需要的编译宏 |
| `INTERFACE_COMPILE_FEATURES` | 使用方需要的编译语言特性 |
| `INTERFACE_COMPILE_OPTIONS` | 使用方需要的编译选项 |
| `INTERFACE_INCLUDE_DIRECTORIES` | 使用方需要的公开头文件目录 |
| `INTERFACE_LINK_LIBRARIES` | 使用方需要链接的库或目标 |
| `INTERFACE_LINK_DIRECTORIES` | 使用方需要的链接搜索目录 |
| `INTERFACE_LINK_OPTIONS` | 使用方需要的链接选项 |
| `INTERFACE_SOURCES` | 使用方构建时需要加入的源文件 |

使用要求应通过作用域关键字设置：

```cmake
add_library(Foo foo.cpp)

target_include_directories(Foo
  PUBLIC
    "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>"
    "$<INSTALL_INTERFACE:include>"
)

target_link_libraries(Foo
  PUBLIC FooCore
  PRIVATE FooInternal
)
```

上例中，`FooCore` 的使用要求会继续传递给 `Foo` 的使用方；`FooInternal` 只用于构建 `Foo`，不会传递给使用方。公开头文件使用的依赖和配置应当由 `PUBLIC` 或 `INTERFACE` 暴露，专供实现使用的依赖应使用 `PRIVATE`。

### 8.4 源文件属性

源文件属性可为单个文件设置特殊编译配置：

```cmake
set_property(SOURCE src/generated.cpp APPEND PROPERTY
  COMPILE_DEFINITIONS GENERATED_SOURCE
)

set_property(SOURCE src/legacy.cpp PROPERTY
  COMPILE_OPTIONS -Wno-deprecated
)
```

常用源文件属性包括：

| 属性 | 作用 |
| --- | --- |
| `COMPILE_DEFINITIONS` | 为该源文件设置编译宏 |
| `COMPILE_OPTIONS` | 为该源文件设置编译选项 |
| `INCLUDE_DIRECTORIES` | 为该源文件设置包含目录 |
| `LANGUAGE` | 指定源文件的编译语言 |
| `SKIP_UNITY_BUILD_INCLUSION` | 不把该源文件加入统一构建 |
| `HEADER_FILE_ONLY` | 将该文件视为头文件，不直接参与编译 |

如果一组源文件都需要相同配置，优先使用目标属性；只有少量文件需要例外配置时，再使用源文件属性。

### 8.5 测试属性

启用 [`CTest`](https://cmake.com.cn/cmake/help/latest/module/CTest.html) 后，可为测试设置超时、标签、工作目录、环境变量和失败重试等属性：

```cmake
include(CTest)

add_test(NAME math_test COMMAND math_test)

set_tests_properties(math_test PROPERTIES
  TIMEOUT 30
  LABELS "unit;math"
  WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
)
```

常用测试属性包括：

| 属性 | 作用 |
| --- | --- |
| `TIMEOUT` | 测试允许的最长运行时间 |
| `LABELS` | 测试标签，可用于筛选执行的测试集 |
| `WORKING_DIRECTORY` | 测试进程的工作目录 |
| `ENVIRONMENT` | 测试进程的环境变量 |
| `ENVIRONMENT_MODIFICATION` | 以更精细的方式修改测试环境变量 |
| `WILL_FAIL` | 测试的预期结果是否为失败 |
| `RUN_SERIAL` | 测试是否要求串行执行 |
| `REQUIRED_FILES` | 测试运行前必须存在的文件 |

测试属性可通过 [`set_tests_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_tests_properties.html) 集中设置，也可通过 [`set_property(TEST ...)`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 一般方法设置。

### 8.6 缓存变量属性

缓存变量本身由变量管理，但可以附加属性，常用于控制 CMake GUI 中的显示方式：

```cmake
set(ENABLE_TRACE OFF CACHE BOOL "Enable trace logging")

mark_as_advanced(ENABLE_TRACE)

set_property(CACHE ENABLE_TRACE PROPERTY
  HELPSTRING "Enable detailed runtime trace logging"
)
```

常用缓存变量属性包括：

| 属性 | 作用 |
| --- | --- |
| `HELPSTRING` | 缓存变量的说明文本 |
| `ADVANCED` | 是否将变量显示在高级选项中 |
| `STRINGS` | 使字符串缓存变量在界面中以选项列表呈现 |

例如：

```cmake
set(LOG_LEVEL "INFO" CACHE STRING "Log level")
set_property(CACHE LOG_LEVEL PROPERTY STRINGS DEBUG INFO WARN ERROR)
```

这样，CMake GUI 可将 `LOG_LEVEL` 显示为下拉选项，而不是普通的文本框。

### 8.7 属性的继承和作用域

属性的作用范围不同，继承和传递方式也不同：

* 目录属性主要影响当前目录及其子目录中的目标；
* 目标自身属性只影响该目标；
* 以 `INTERFACE_` 开头的目标属性用于影响依赖该目标的使用方；
* 源文件属性只影响指定源文件；
* 测试属性只影响指定测试；
* 全局属性影响整个构建系统。

使用属性时，可遵循以下原则：

1. 优先使用目标命令表达目标的编译、链接和使用要求；
2. 只有少量目标确实需要同一配置时，再考虑目录属性；
3. 优先使用导入目标传递依赖，而不是直接传递绝对目录和库路径；
4. 公开头文件和公开依赖项使用 `PUBLIC` 或 `INTERFACE`，实现私有依赖使用 `PRIVATE`；
5. 只在文件确实需要例外配置时使用源文件属性；
6. 用 `RUNTIME_OUTPUT_DIRECTORY`、`LIBRARY_OUTPUT_DIRECTORY` 和 `ARCHIVE_OUTPUT_DIRECTORY` 管理产物位置，而不是依赖构建系统的默认位置。

合理使用属性可以让编译配置随目标和依赖关系准确传递。滥用全局目录属性或接口属性则可能导致配置意外扩散，使不同平台、目标和构建模式之间的行为难以预料。

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
