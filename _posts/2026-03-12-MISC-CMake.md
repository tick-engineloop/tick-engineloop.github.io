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

包用于向构建系统提供依赖信息。第 6 章介绍的查找模块解决的是“如何找到依赖”，而一个完整的包还要描述自身导出的目标及其使用要求，使依赖可以被直接链接使用。下游项目统一通过 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 查找包，得到的结果通常是一组 [`IMPORTED`](https://cmake.com.cn/cmake/help/latest/prop_tgt/IMPORTED.html) 目标，也可能是一组由包提供的变量。

CMake 直接支持两类包：

* **配置文件包**：由上游随库一起提供 `FooConfig.cmake` 或 `foo-config.cmake`，其中记录了包的位置、导出的目标及其使用要求；
* **查找模块包**：由下游编写 `FindFoo.cmake`，通过搜索头文件、库等资源推断包的位置，适用于未使用 CMake 构建、也没有提供配置文件的上游。

现代依赖大多以配置文件包的形式发布，因此本节以配置文件包为主；查找模块的编写方式已在第 6 章介绍。

### 7.1 查找和使用包

[`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html) 的基本形式是指定包名，并按需补充版本和关键字：

```cmake
find_package(OpenSSL 3.0 REQUIRED)
find_package(Qt6 6.5 REQUIRED COMPONENTS Core Gui)
```

常用关键字如下：

| 关键字 | 作用 |
| --- | --- |
| `REQUIRED` | 找不到包时终止配置 |
| `QUIET` | 抑制默认的查找信息，结果仍由 `<PackageName>_FOUND` 表示 |
| `CONFIG` | 只使用配置文件包 |
| `MODULE` | 只使用查找模块包 |
| `COMPONENTS` | 指定需要的组件 |
| `OPTIONAL_COMPONENTS` | 指定可选组件，缺失时不视为失败 |

找到包之后，应优先链接包提供的导入目标，而不是自行填写头文件目录和库文件路径：

```cmake
target_link_libraries(app PRIVATE OpenSSL::SSL Qt6::Core)
```

这些名称通常带有 `::` 命名空间，由包配置文件或查找模块定义。导入目标携带了依赖所需的包含目录、编译定义和链接库，会沿依赖关系自动传递给使用方，正是第 5 章所述“使用要求”在包场景下的体现。一旦链接了导入目标，CMake 还能在下游未查找该包时给出明确诊断。

若包是可选依赖，应去掉 `REQUIRED`，并通过 `<PackageName>_FOUND` 判断结果：

```cmake
find_package(Foo QUIET)

if(Foo_FOUND)
  target_link_libraries(app PRIVATE Foo::Foo)
endif()
```

当依赖安装在非标准前缀时，可通过 `CMAKE_PREFIX_PATH` 告知 CMake 搜索位置：

```sh
cmake -S . -B build -DCMAKE_PREFIX_PATH=/opt/deps
```

> 提示：已知上游提供配置文件时，在调用中显式写出 `CONFIG`，可以让找不到包时的诊断信息更准确。
{: .prompt-tip }

### 7.2 导出并安装包

要让其他项目通过 `find_package(Foo)` 使用自己的库，除了安装库文件和头文件，还需要随安装提供包配置文件和版本文件。一个最小可用的结构如下：

```cmake
project(Foo VERSION 1.2.0 LANGUAGES CXX)

include(GNUInstallDirs)
include(CMakePackageConfigHelpers)

add_library(Foo foo.cpp)
add_library(Foo::Foo ALIAS Foo)

target_include_directories(Foo PUBLIC
  "$<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>"
  "$<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>"
)

install(TARGETS Foo
  EXPORT FooTargets
  ARCHIVE DESTINATION "${CMAKE_INSTALL_LIBDIR}"
  LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}"
  RUNTIME DESTINATION "${CMAKE_INSTALL_BINDIR}"
)

install(DIRECTORY include/ DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}")

set(Foo_INSTALL_CMAKEDIR "${CMAKE_INSTALL_LIBDIR}/cmake/Foo")

install(EXPORT FooTargets
  FILE FooTargets.cmake
  NAMESPACE Foo::
  DESTINATION "${Foo_INSTALL_CMAKEDIR}"
)

configure_package_config_file(
  cmake/FooConfig.cmake.in
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfig.cmake"
  INSTALL_DESTINATION "${Foo_INSTALL_CMAKEDIR}"
)

write_basic_package_version_file(
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfigVersion.cmake"
  VERSION "${PROJECT_VERSION}"
  COMPATIBILITY SameMajorVersion
)

install(FILES
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfig.cmake"
  "${CMAKE_CURRENT_BINARY_DIR}/FooConfigVersion.cmake"
  DESTINATION "${Foo_INSTALL_CMAKEDIR}"
)
```

上述命令各自承担一部分工作：

* `add_library(Foo::Foo ALIAS Foo)` 让项目内部与下游使用同一个目标名称；
* `BUILD_INTERFACE` 与 `INSTALL_INTERFACE` 分别描述构建树和安装树中的包含目录，后者是相对安装前缀的路径；
* `install(TARGETS ... EXPORT FooTargets)` 把 `Foo` 加入名为 `FooTargets` 的导出集，`install(EXPORT)` 据此生成供下游读取的目标文件；
* `NAMESPACE Foo::` 使导出的目标名为 `Foo::Foo`；
* `configure_package_config_file()` 生成 `FooConfig.cmake`，`write_basic_package_version_file()` 生成版本文件，二者与 `FooTargets.cmake` 安装到同一目录，一次完整的查找才得以成立。

包配置模板通常只负责引入导出的目标：

```cmake
@PACKAGE_INIT@

include("${CMAKE_CURRENT_LIST_DIR}/FooTargets.cmake")

check_required_components(Foo)
```

`@PACKAGE_INIT@` 会被展开为根据配置文件自身位置推算安装前缀的代码，使包可以随安装目录移动；`check_required_components()` 则校验下游通过 `COMPONENTS` 请求的组件是否齐全。安装完成后，其他项目即可按常规方式使用：

```cmake
find_package(Foo 1.2 REQUIRED)
target_link_libraries(app PRIVATE Foo::Foo)
```

版本文件决定 `find_package()` 请求的版本是否被接受，其 `COMPATIBILITY` 应与项目的兼容策略一致。常用的 `SameMajorVersion` 表示同一主版本内向后兼容，因此版本 1.3 可以满足对 1.2 的请求，而 2.0 不能。

### 7.3 公开依赖与可重定位

如果 `Foo` 的公开头文件依赖另一个包 `Bar`，就应将其声明为 `PUBLIC` 依赖，并在包配置文件中一并查找：

```cmake
# CMakeLists.txt
find_package(Bar 2.0 REQUIRED)
target_link_libraries(Foo PUBLIC Bar::Bar)
```

```cmake
# cmake/FooConfig.cmake.in
@PACKAGE_INIT@

include(CMakeFindDependencyMacro)
find_dependency(Bar 2.0)

include("${CMAKE_CURRENT_LIST_DIR}/FooTargets.cmake")

check_required_components(Foo)
```

[`find_dependency()`](https://cmake.com.cn/cmake/help/latest/module/CMakeFindDependencyMacro.html) 会沿用下游调用 `find_package(Foo)` 时的 `REQUIRED`、`QUIET` 等状态查找依赖，未找到时将 `Foo_FOUND` 置为 `FALSE` 并提前返回，从而避免下游拿到一个缺少依赖的 `Foo::Foo`。仅供 `Foo` 实现使用的私有依赖则应声明为 `PRIVATE`，无需在配置文件中暴露。

为了让安装后的包可以整体移动，包中不应出现构建机器上的绝对路径。`$<INSTALL_INTERFACE:...>` 中的路径应相对安装前缀书写，外部依赖也应通过导入目标引用，而不是把查找结果中的绝对路径写入接口：

```cmake
# 错误：硬编码安装前缀，移动后失效
target_include_directories(Foo INTERFACE
  "$<INSTALL_INTERFACE:${CMAKE_INSTALL_PREFIX}/include>"
)

# 正确：相对安装前缀
target_include_directories(Foo INTERFACE
  "$<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>"
)
```

由 `install(EXPORT)` 生成的目标文件与 `configure_package_config_file()` 生成的配置文件都以包自身位置为基准解析路径，按上述方式书写接口即可得到可重定位的包。相比之下，`export(TARGETS)`、`export(EXPORT)` 生成的构建树导出文件包含构建目录中的绝对路径，只适合本机调试，不应随安装分发。

## 8. CMake 属性

CMake 属性用于保存和读取构建过程中的配置信息。属性与变量相似，但归属于特定作用域，例如全局作用域、目录、目标、源文件、测试或缓存项。配置和生成构建系统时，CMake 会读取这些属性，并转换为编译器、链接器和构建工具所需的选项。

属性的主要作用范围包括：

| 作用范围 | 常用属性示例 | 典型用途 |
| --- | --- | --- |
| 全局属性 | `USE_FOLDERS` | 控制整个构建系统的行为 |
| 目录属性 | `COMPILE_DEFINITIONS`、`INCLUDE_DIRECTORIES` | 为目录及其子目录中的目标设置默认配置 |
| 目标属性 | `CXX_STANDARD`、`OUTPUT_NAME`、`INTERFACE_INCLUDE_DIRECTORIES` | 描述目标的编译、链接、输出和使用要求 |
| 源文件属性 | `COMPILE_OPTIONS`、`LANGUAGE` | 为单个源文件设置例外配置 |
| 测试属性 | `TIMEOUT`、`LABELS`、`ENVIRONMENT` | 配置测试的运行方式 |
| 缓存项属性 | `ADVANCED`、`HELPSTRING` | 控制缓存变量在 CMake GUI 中的显示方式 |

属性名区分大小写。同一个名称也可能同时属于多个作用域，例如 `COMPILE_DEFINITIONS` 既是目录属性，也是目标属性，因此使用前应先确认它属于哪个作用域。

### 8.1 属性的读取和设置

设置属性的通用命令是 [`set_property()`](https://cmake.com.cn/cmake/help/latest/command/set_property.html)，配合 `APPEND` 可在已有取值之后追加内容：

```cmake
set_property(TARGET app PROPERTY CXX_STANDARD 20)

set_property(TARGET app APPEND PROPERTY
  COMPILE_DEFINITIONS APP_WITH_NETWORK
)
```

需要一次性设置多个目标属性时，[`set_target_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_target_properties.html) 更简洁；读取属性则使用 [`get_property()`](https://cmake.com.cn/cmake/help/latest/command/get_property.html) 或具有特定作用域的便捷命令：

```cmake
set_target_properties(app PROPERTIES
  CXX_STANDARD 20
  CXX_STANDARD_REQUIRED YES
  CXX_EXTENSIONS NO
  OUTPUT_NAME my_app
)

get_target_property(app_standard app CXX_STANDARD)
message(STATUS "app standard: ${app_standard}")
```

如果目标属性尚未定义，[`get_target_property()`](https://cmake.com.cn/cmake/help/latest/command/get_target_property.html) 会把变量设置为 `app-NOTFOUND`，因此读取结果后应先判断是否符合预期，再用于后续逻辑。

对于已有专用目标命令的属性，第 5 章介绍了推荐的写法：目标命令能通过 `PRIVATE`、`PUBLIC` 和 `INTERFACE` 明确区分目标自身的设置与提供给使用方的使用要求，因此日常项目应优先使用目标命令。通用属性写法适合设置没有专用命令的属性，或一次性集中设置多个属性。

### 8.2 全局和目录属性

全局属性通过 `set_property(GLOBAL ...)` 设置，日常主要用到 `USE_FOLDERS`，让支持的 IDE 按目标或目录组织工程：

```cmake
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
```

目录属性为当前目录及其子目录中的目标提供默认配置，`add_compile_definitions()`、`add_compile_options()` 和 `include_directories()` 等便捷命令填充的正是这些属性：

```cmake
add_compile_definitions(PROJECT_WITH_GUI)
add_compile_options(-Wall)
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/include")
```

这些设置会被目录内的所有目标及其子目录继承，容易掩盖目标之间的差异，因此现代 CMake 更推荐用第 5 章的目标命令描述编译和链接设置。确有需要时，`COMPILE_DEFINITIONS`、`COMPILE_OPTIONS`、`INCLUDE_DIRECTORIES` 和 `LINK_OPTIONS` 是最常用的目录属性，也可通过 `set_property(DIRECTORY ...)` 显式设置。

### 8.3 目标属性

目标属性是使用频次最高的一类属性。第 5 章已结合目标命令介绍了描述构建规范的 `COMPILE_*`、`LINK_*` 属性和描述使用要求的 `INTERFACE_*` 属性，这里再列举几类没有专用目标命令、只能直接设置的属性：

| 属性 | 作用 |
| --- | --- |
| `CXX_STANDARD` | 指定 C++ 语言标准 |
| `CXX_STANDARD_REQUIRED` | 是否严格要求使用指定标准，而不是回退到编译器默认的旧标准 |
| `CXX_EXTENSIONS` | 是否允许编译器扩展的 C++ 语言特性 |
| `OUTPUT_NAME` | 输出文件的基础名称，不含平台前缀和扩展名 |
| `RUNTIME_OUTPUT_DIRECTORY` | 可执行文件等运行时产物的输出目录 |
| `LIBRARY_OUTPUT_DIRECTORY` | 共享库和模块库的输出目录 |
| `ARCHIVE_OUTPUT_DIRECTORY` | 静态库和导入库的输出目录 |
| `DEBUG_POSTFIX` | 调试构建时追加到文件名后的后缀 |
| `POSITION_INDEPENDENT_CODE` | 是否生成位置无关代码 |

下面把语言标准、输出名称和输出目录集中设置，C 语言项目只需把 `CXX_STANDARD` 等换成 `C_STANDARD` 等对应属性：

```cmake
set_target_properties(app PROPERTIES
  CXX_STANDARD 20
  CXX_STANDARD_REQUIRED YES
  CXX_EXTENSIONS NO
  OUTPUT_NAME tool
  RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
  DEBUG_POSTFIX "_d"
)
```

上例把目标产物统一输出到构建目录的 `bin` 下，调试构建生成 `tool_d`，其它配置生成 `tool`。名称中的前缀和扩展名由 CMake 按平台补全，例如名为 `Foo` 的库在 Linux 上生成 `libFoo.so`，在 Windows 上生成 `Foo.dll`。使用多配置生成器时，还可用 `RUNTIME_OUTPUT_DIRECTORY_DEBUG`、`RUNTIME_OUTPUT_DIRECTORY_RELEASE` 等带配置后缀的属性，为每种配置分别指定输出目录。

### 8.4 源文件属性

源文件属性用于为单个文件设置例外的编译配置，例如为生成代码添加宏，或为遗留代码关闭告警：

```cmake
set_property(SOURCE src/generated.cpp APPEND PROPERTY
  COMPILE_DEFINITIONS GENERATED_SOURCE
)

set_property(SOURCE src/legacy.cpp PROPERTY
  COMPILE_OPTIONS -Wno-deprecated
)
```

除 `COMPILE_DEFINITIONS`、`COMPILE_OPTIONS` 和 `INCLUDE_DIRECTORIES` 外，`LANGUAGE` 可指定源文件的编译语言。如果一组文件都需要相同配置，应优先使用目标属性；只有少量文件需要例外时才使用源文件属性。

### 8.5 测试属性

启用 [`CTest`](https://cmake.com.cn/cmake/help/latest/module/CTest.html) 后，可为测试设置超时、标签、工作目录和运行环境等属性：

```cmake
include(CTest)

add_test(NAME math_test COMMAND math_test)

set_tests_properties(math_test PROPERTIES
  TIMEOUT 30
  LABELS "unit;math"
  WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
)
```

常用测试属性中，`TIMEOUT` 限定单个测试的最长运行时间；`LABELS` 为测试打标签，便于用 `ctest -L` 筛选测试集；`WORKING_DIRECTORY` 指定测试进程的工作目录；`ENVIRONMENT` 设置测试进程的环境变量；`RUN_SERIAL` 要求该测试独占执行，不与其他测试并行。这些属性既可用 [`set_tests_properties()`](https://cmake.com.cn/cmake/help/latest/command/set_tests_properties.html) 集中设置，也可通过 [`set_property(TEST ...)`](https://cmake.com.cn/cmake/help/latest/command/set_property.html) 设置。

### 8.6 缓存变量属性

缓存变量由变量系统创建，但可以附加属性，最常用的是控制它在 CMake GUI 中的显示方式：

```cmake
set(LOG_LEVEL "INFO" CACHE STRING "Log level")
set_property(CACHE LOG_LEVEL PROPERTY STRINGS DEBUG INFO WARN ERROR)

mark_as_advanced(ENABLE_TRACE)
```

`STRINGS` 让字符串缓存变量以选项列表呈现；`HELPSTRING` 补充或修改说明文本；`ADVANCED` 把变量折叠进高级选项，通常通过 `mark_as_advanced()` 设置，避免普通用户被大量调试开关干扰。

属性所在的作用域决定了配置的传播范围：目录属性影响本目录及其子目录中的目标，目标属性只影响自身，`INTERFACE_` 开头的属性随依赖关系传递给使用方，源文件属性、测试属性和缓存变量属性则只作用于对应对象。日常项目中应优先用目标命令表达编译、链接和使用要求，仅在目标命令无法表达时才回退到通用属性写法，并避免把个别目标的需求提升为全局或目录级配置。

## 9. CMake 自定义命令

软件项目的构建过程并不只有编译库和可执行文件，还经常需要额外任务，例如用脚本生成源代码、拷贝资源文件，或在构建完成后对产物进行后处理。CMake 用两个命令描述这类任务：[`add_custom_command()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_command.html) 为某个目标或某个待生成的文件定义构建规则，[`add_custom_target()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_target.html) 定义一个没有编译产物的“动作”目标。前者描述“某个文件如何生成、某个目标构建后做什么”，后者描述“执行某个动作”。

### 9.1 添加自定义命令

[`add_custom_command()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_command.html) 有 `TARGET` 和 `OUTPUT` 两种常用形式。以 `TARGET ... POST_BUILD` 形式在目标构建完成后追加动作，适合拷贝产物或运行后处理工具：

```cmake
add_executable(app main.cpp)

add_custom_command(TARGET app POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E make_directory "${CMAKE_BINARY_DIR}/dist"
  COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:app> "${CMAKE_BINARY_DIR}/dist"
  COMMENT "Copying app to dist"
)
```

上例在 `app` 链接完成后，先创建输出目录，再把刚生成的可执行文件复制过去。`$<TARGET_FILE:app>` 是生成器表达式，在生成阶段才展开为产物的完整路径，因此不受平台前缀、后缀和输出目录的影响。一次调用可以包含多条 `COMMAND`，它们按书写顺序执行。

以 `OUTPUT` 形式声明一个待生成的文件，适合代码生成：

```cmake
add_custom_command(
  OUTPUT "${CMAKE_CURRENT_BINARY_DIR}/proto/message.pb.cc"
  COMMAND protoc --cpp_out "${CMAKE_CURRENT_BINARY_DIR}/proto" message.proto
  DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/message.proto"
  COMMENT "Generating protobuf sources"
  VERBATIM
)

add_library(messages "${CMAKE_CURRENT_BINARY_DIR}/proto/message.pb.cc")
```

`DEPENDS` 声明输入文件，输入变化时 CMake 会重新执行命令；`VERBATIM` 让参数按原样传给命令，路径中含空格或特殊字符时尤其必要。这种形式的命令只在同一目录中、有目标把它的输出作为源文件或依赖时才会执行，因此必须像上例那样把输出加入目标，而不是只写一条孤立的 `OUTPUT`。

两种形式都支持用 `COMMENT` 打印构建说明，用 `WORKING_DIRECTORY` 指定命令的执行目录。

### 9.2 添加自定义目标

通常情况下，CMake 目标指的是可执行文件和库。在此之外，还支持一种更通用的目标，称为自定义目标，用于需要目标概念、但最终产物不是库或可执行文件的场景，即定义一个“动作”目标。要添加自定义目标，请使用 [`add_custom_target()`](https://cmake.com.cn/cmake/help/latest/command/add_custom_target.html) 命令：

```cmake
find_package(Python COMPONENTS Interpreter REQUIRED)

add_custom_target(run_setup
  COMMAND ${Python_EXECUTABLE} "${CMAKE_CURRENT_SOURCE_DIR}/scripts/setup.py"
  COMMENT "Running setup script"
)
```

该目标不会自动执行，需要显式指定：

```sh
cmake --build build --target run_setup
```

为它加上 `ALL` 参数，即可让目标参与默认构建，`COMMAND` 同样可以有多条：

```cmake
add_custom_target(copy_assets ALL
  COMMAND ${CMAKE_COMMAND} -E make_directory "${CMAKE_BINARY_DIR}/assets"
  COMMAND ${CMAKE_COMMAND} -E copy_directory
          "${CMAKE_CURRENT_SOURCE_DIR}/assets" "${CMAKE_BINARY_DIR}/assets"
  COMMENT "Copying assets"
)
```

自定义目标与普通目标之间没有隐含的顺序关系，即使两者都参与默认构建，`copy_assets` 也可能在 `app` 之后才执行。需要保证顺序时，用 [`add_dependencies()`](https://cmake.com.cn/cmake/help/latest/command/add_dependencies.html) 声明依赖：

```cmake
add_dependencies(app copy_assets)
```

此外，自定义目标没有输出文件，CMake 每次都认为它已过期，其 `COMMAND` 会在每次构建时执行，因此它适合“总要做”的动作。需要按输入变化决定是否重新生成时，应改用带 `OUTPUT` 的自定义命令，再通过 `add_custom_target(... DEPENDS <output>)` 或目标的源文件引用它的输出。

两个命令经常配合使用：用 `OUTPUT` 形式描述生成规则，再用 `add_custom_target()` 把生成过程聚合成一个可单独调用的目标，使代码生成既能参与默认构建，也能按需触发。

## 10. CMake 工具链

CMake 默认在当前主机上自动探测编译器、链接器和构建工具，即使用宿主工具链。当需要换一套编译器，或为其它平台交叉编译（如 aarch64 嵌入式 Linux、Android）时，自动探测会得到与目标不一致的结果，此时需要用工具链文件（toolchain file）描述本次配置要使用的编译器、目标系统和搜索路径。工具链文件是普通的 `.cmake` 脚本，在 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html) 之前由 CMake 读取，通过预先设置编译器相关的变量来改变探测方式。

### 10.1 指定工具链文件

通过 `CMAKE_TOOLCHAIN_FILE` 缓存变量传入工具链文件路径，建议使用绝对路径：

```sh
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=/path/to/toolchains/aarch64-linux.cmake
```

也可以在 `CMakePresets.json` 的 `toolchainFile` 字段中指定，或用同名环境变量提供默认值，效果一致。有两点需要留意：该变量在首次配置时生效并写入缓存，更换工具链后应删除构建目录重新配置，否则编译器探测结果仍会沿用旧值；工具链文件只负责“用哪套工具编译”，项目本身的构建逻辑仍由 `CMakeLists.txt` 描述。

没有交叉编译需求时，工具链文件同样适合在同一主机上固定编译器，例如为 Windows 构建改用 MinGW 的 `gcc`，此时只需设置 `CMAKE_C_COMPILER` 和 `CMAKE_CXX_COMPILER` 两个变量。

### 10.2 编写工具链文件

交叉编译是最典型的场景。以在 x86_64 主机上构建 aarch64 Linux 程序为例：

```cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

set(CMAKE_C_COMPILER aarch64-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER aarch64-linux-gnu-g++)

set(CMAKE_SYSROOT /opt/sysroot/aarch64)
set(CMAKE_FIND_ROOT_PATH "${CMAKE_SYSROOT}")

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)
```

上述变量各自的作用是：

| 变量 | 作用 |
| --- | --- |
| `CMAKE_SYSTEM_NAME` | 目标系统名称，设为非空值即进入交叉编译模式，`CMAKE_CROSSCOMPILING` 随之为真 |
| `CMAKE_SYSTEM_PROCESSOR` | 目标处理器架构，供项目内条件判断使用 |
| `CMAKE_C_COMPILER`、`CMAKE_CXX_COMPILER` | 目标平台的 C 和 C++ 编译器，可写绝对路径，也可写 `PATH` 中的名字 |
| `CMAKE_SYSROOT` | 目标根文件系统，编译器据此查找目标平台的头文件和运行库 |
| `CMAKE_FIND_ROOT_PATH` | `find_package()`、`find_library()` 等命令的搜索根目录，指向目标平台的安装前缀 |
| `CMAKE_FIND_ROOT_PATH_MODE_*` | 控制各类 `find_*()` 命令是否在搜索根目录内查找 |

将 `CMAKE_FIND_ROOT_PATH_MODE_PROGRAM` 设为 `NEVER`，是因为代码生成器一类的工具（如 `protoc`）需要在主机上运行，只有库、头文件和包才应从目标平台的前缀中查找，这正是第 7 章中 `find_package()` 在交叉编译环境下的搜索依据。若工具链没有可用的链接器（常见于裸机嵌入式），可再设置 `CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY`，让 CMake 改用静态库完成编译器探测，避免因链接失败而误判编译器不可用。

### 10.3 与包管理器配合

除交叉编译外，工具链文件最常用于接入包管理器。以 vcpkg 为例，把它的工具链文件传给 CMake，`find_package()` 便会从 vcpkg 安装的依赖中查找：

```sh
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake
```

配合 `VCPKG_TARGET_TRIPLET` 可以选择目标三元组，例如 `x64-windows-static` 使用静态链接的依赖，`x64-linux` 用于 Linux 目标。由于 `CMAKE_TOOLCHAIN_FILE` 只能有一个，需要同时做交叉编译时，应改用 vcpkg 的 `VCPKG_CHAINLOAD_TOOLCHAIN_FILE` 指定自己的工具链文件，由 vcpkg 工具链在其后加载，两套设置才能叠加生效。

工具链文件把“如何找到并驱动编译器”从项目中分离出来，同一份 `CMakeLists.txt` 只需切换工具链文件，就能分别构建主机程序和目标平台程序。日常使用中最需要记住三点：工具链文件在 `project()` 之前生效，更换工具链后要重新配置构建目录，交叉编译时的库和头文件应通过搜索根路径查找，而不是写死绝对路径。

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
