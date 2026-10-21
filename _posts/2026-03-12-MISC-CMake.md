---
title: CMake
description: CMake 是一个用于管理源代码构建的工具。最初，CMake 被设计为各种 Makefile 方言的生成器，如今 CMake 生成现代构建系统，如 Ninja，以及用于 Visual Studio 和 Xcode 等 IDE 的项目文件。
date: 2026-03-12 00:00:00 +0800
categories: [MISC, Tools]
tags: [cmake]     # TAG names should always be lowercase
---

## 1. 简介

CMake 是一个开源的、跨平台的配置程序，用于构建、测试和打包软件，有时被称为“元”构建系统，简单来说，它就是一个用于管理源代码构建的工具。它使用简单的独立配置文件来控制软件的编译过程，根据项目、环境和用户提供的配置信息生成一个构建系统。注意 CMake 仅被设计用于与本地构建环境协同工作，而不负责运行生成软件构建的命令。

![Cmake Icon](/assets/img/post/MISC-Tools-CMakeIcon.jpeg){: .shadow }

## 2. CMake 优势

### 2.1 为何选择 CMake？

CMake 是一个面向软件项目的开源构建系统生成器，开发人员可使用简单、可移植的文本文件格式来指定构建参数。之后，CMake 会使用该文件来生成面向本地构建工具（包括 Make/NMake 和 Ninja）的项目文件。 CMake 以简洁的方式处理软件构建的难点，如跨平台构建、系统自省和用户自定义构建，这使用户能够轻松地为复杂的硬件和软件系统定制构建。 CMake 的优势包括：

* 一套适用于所有平台的构建配置文件。 
* 能够测试机器字节顺序和其他特定硬件特征。 
* 能够自动搜索软件构建可能需要的程序、库和头文件。 
* 能够在源代码树外部的目录树中构建。这允许开发者删除整个构建目录，而不必担心删除源文件。能够在配置时选择可选组件。例如，VTK 的一些库是可选的，而且 CMake 为用户提供了一种简单的方法来选择要构建的库。 
* 能够轻松地在静态和共享构建之间切换。 
* 可以使用系统相关的信息配置文件，例如数据文件的位置和其他信息。 CMake 可以创建包含信息的标头文件，例如数据文件的路径和其他信息，形式为 #define 宏。系统特定标志也可以放在已配置的标头文件中

### 2.2 为何不使用 Autotools？

Autotools 是一组用于为软件包创建 GNU 构建系统的工具，主要包括 Autoconf、Automake 和 Libtool 等，其中 Autoconf 主要处理 configure 相关的事情，而 Automake 则负责 Makefile 相关的工作。因为它源自 GNU 项目，所以被称为 GNU 构建系统。与 CMake 相比：
* 项目类型上：Autotools 在 GNU 项目上使用居多，CMake 在中间件及应用层 C++ 项目上使用居多，有的项目同时提供 Autotools 和 CMake 构建方式。
* 工作流程上：Autotools 是一个松散耦合的工具链：Autoconf 根据 configure.ac 生成 configure 脚本，Automake 根据 Makefile.am 生成 Makefile.in 模板，然后 configure 脚本在用户机器上运行，生成最终的 Makefile。Autoconf 与 Automake 组合在一起提供了与 CMake 相同的部分功能。CMake 是一个元构建系统，它读取 CMakeLists.txt，然后生成指定平台的原生构建文件，例如 Unix Makefiles、Ninja、Visual Studio 项目文件。
* 跨平台支持：Autotools 对 Unix-like 系统支持的很好，但对 Windows 的支持较差。CMake 原生支持 Windows，可以生成 Visual Studio 项目文件，直接使用 MSVC 编译器，无需额外的 Unix 兼容层，这使得它成为跨平台（尤其是同时覆盖 Unix 和 Windows）项目的首选。
* 学习成本上：对于 Autotools 开发者需要同时掌握 Autoconf 的 M4 宏语法和 Automake 的 Makefile 语法，往往晦涩难懂，有时需要深入理解 shell、M4、sed 等多种工具。CMake 的 CMakeLists.txt 语法是自定义的，一致性更好，只需学习一种语法，通常比 Autotools 更易理解。

## 3. 基本的 CMake 用法

CMake 以一个或多个 CMakeLists 文件作为输入，并生成项目文件或 Makefile，以供各种本地开发工具使用。典型的 CMake 工作流程如下： 

1. 在一个或多个 CMakeLists 文件中定义项目构建任务
2. 配置并生成项目 
3. 使用喜欢的本地开发工具构建项目

### 3.1 创建 CMakeLists 文件

CMakeLists 文件（实际上是 CMakeLists.txt，但通常省略扩展名）使用 cmake-language 编写，表现为一系列注释、命令和变量组成项目描述的纯文本文件。首先，让我们考虑最简单的 CMakeLists 文件。要从一个源文件编译一个可执行文件，CMakeLists 文件将包含三行：

```cmake
cmake_minimum_required(VERSION 3.20) 
project(Hello) 
add_executable(Hello Hello.c)
```

CMakeLists 文件的第一行应始终是 cmake_minimum_required，指定项目要求的 CMake 最小版本。任何 CMakeLists 文件的下一行应该是 project 命令，此命令设置项目的名称。最后，使用 add_executable 命令将给定的源文件添加向项目可执行文件。在此示例中，源目录中有两个文件：CMakeLists.txt 和 Hello.c。

### 3.2 配置和生成

创建 CMakeLists 文件后，CMake 会处理文本文件并在缓存文件中创建条目。接下来，CMake 使用缓存条目在用户所需的构建系统（例如 Makefile 或 Visual Studio 解决方案）中生成项目。

#### 3.2.1 从命令行运行 CMake

从命令行，可以使用 cmake 可执行文件生成项目构建系统。要使用 cmake 构建项目，首先创建并切换到您希望放置二进制文件的目录。运行 cmake 并指定源码树的路径，并使用 -D 标志传入任何选项。

cmake -S dir
: 指定项目根目录，CMake 将在此找到要构建的项目。它包含根 CMakeLists.txt 文件。如果未指定，则默认为当前工作目录。

cmake -B dir
: 指定构建目录，CMake 将在此输出生成的构建系统的文件，以及在运行构建系统时产生的缓存文件。如果未指定，则默认为当前工作目录。

cmake --build dir
: 在指定的构建目录中运行构建系统。

向 CMake 指定生成器
: CMake 支持将多个构建系统作为配置过程的输出，这些输出后端被称为“生成器”。CMake 生成器负责为原生构建系统编写输入文件。必须为构建树选择 CMake 生成器中的一个来决定使用哪个原生构建系统。使用 -G 选项来为新的构建树指定生成器。

![Single Source Build](/assets/img/post/MISC-Tools-SingleSourceBuild.png){: .shadow }{: width="600" height="337" }

向 CMake 指定编译器
: 在某些系统上，您可能有多个编译器可供选择，或者您的编译器可能位于非标准位置。在这些情况下，您需要向 CMake 指定所需编译器的位置。有三种方法可以指定：生成器可以指定编译器；可以设置环境变量；或者可以设置缓存条目。可以使用在运行 CMake 之前设置的环境变量来抢占这些列表。CC 环境变量指定 C 编译器，而 CXX 指定 C++ 编译器。例如，您可以使用 -DCMAKE_CXX_COMPILER=cl 在命令行上直接指定编译器。编译器和链接器的标志也可以通过设置环境变量来更改，设置 LDFLAGS 将初始化链接标志的缓存值，而 CXXFLAGS 和 CFLAGS 将分别初始化 CMAKE_CXX_FLAGS 和 CMAKE_C_FLAGS。

指定构建配置
: 构建配置允许以调试、优化等不同的方式构建项目。默认情况下，CMake 支持 Debug、Release、MinSizeRel 和 RelWithDebInfo 配置。Debug 是启用基本的调试标志。Release 是启用基本的优化标志。MinSizeRel 具有生成最小目标代码的标志，但不一定是速度最快的代码。RelWithDebInfo 构建具有调试信息的优化版本。

  | 构建类型           | 编译选项             | 适用场景
  | ---               | ---                 | ---
  | Debug             | -g                  | 开发调试阶段，需要断点和变量查看
  | Release           | -O2 -DNDEBUG        | 生产发布，追求运行速度
  | RelWithDebInfo    | -O2 -g              | 需要性能分析或调试优化的发布版本
  | MinSizeRel        | -Os                 | 嵌入式或对体积敏感的场景

对于基于 Makefile 的生成器，在运行 CMake 时只能激活一个配置，并使用 CMAKE_BUILD_TYPE 变量指定。如果变量为空，则不会向构建添加任何标志。如果变量设置为配置的名称，则相应的变量和规则（例如 CMAKE_CXX_FLAGS_<ConfigName>）将添加到编译行。要构建调试和发布树，用户应使用 CMake 的源外构建功能创建多个构建目录，并将 CMAKE_BUILD_TYPE 设置为每个构建所需的选项。例如：

```cmake
# With source code in the directory MyProject
# to build MyProject-debug create that directory, cd into it and
cmake ../MyProject -DCMAKE_BUILD_TYPE=Debug
# the same idea is used for the release tree MyProject-release
cmake ../MyProject -DCMAKE_BUILD_TYPE=Release
```

#### 3.2.2 从 GUI 运行 CMake

更习惯 GUI 界面的用户可以使用 cmake-gui 工具来调用 CMake 并生成构建系统。请查看 [CMake GUI 工具交互指南](https://cmake.com.cn/cmake/help/latest/guide/user-interaction/index.html#cmake-gui-tool)。

### 3.3 构建您的项目

运行 CMake 后，您的项目将准备好构建。如果您的目标生成器基于 Makefile，则可以通过将目录更改为您的二进制树并键入 make（或 gmake 或 nmake，具体取决于情况）来构建项目。对于简单的项目，安装和运行 CMake 就这么简单。

## 4. CMake 语言基础

CMake 提供了一种图灵完备的领域特定语言来描述软件的构建过程。这门语言正式称为“CMake 语言”，或者更通俗地说，称为 CMakeLang。CMakeLang 中唯一的基础类型是字符串和列表。CMake 中的每个对象都是字符串，而列表本身也是包含分号作为分隔符的字符串。任何看起来操作非字符串（如布尔值、数字、JSON 对象等）的命令，实际上都是在解析一个字符串，执行一些内部转换逻辑（使用 CMakeLang 以外的语言），然后为任何潜在的输出转换回字符串。

### 4.1 注释

注释以 `#` 开头，该字符不在 **括号参数**、**引号参数** 中，也未被不带引号参数中的反斜杠转义。有两种类型的注释：**括号注释** 和 **行注释**。

#### 4.1.1 括号注释

一个紧跟 bracket_open 的 `#` 形成一个括号注释，包含整个括号的范围。例如：

```cmake
#[[This is a bracket comment.
It runs until the close bracket.]]
message("First Argument\n" #[[Bracket Comment]] "Second Argument")
```

#### 4.1.2 行注释

一个未紧跟 bracket_open 的 `#` 形成一个行注释，该注释一直持续到行尾。例如：

```cmake
# This is a line comment.
message("First Argument\n" # This is a line comment :)
        "Second Argument") # This is a line comment.
```

### 4.2 变量

变量是 CMake 语言中存储的基本单元。它们的值始终是字符串类型。变量名称区分大小写，并且可以包含几乎任何文本，但我们建议坚持使用仅包含字母数字字符加上 `_` 和 `-` 的名称。

#### 4.2.1 变量类型

变量可分为普通变量、环境变量和缓存变量。

##### 4.2.1.1 普通变量

使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 和 [`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 命令可显式设置或取消设置变量。

使用 `set()` 命令创建一个变量，也就是一个字符串的名称。并可以使用花括号扩展来访问变量的值。

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
| [`PROJECT_NAME`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_NAME.html)                             | 当前目录作用域或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所给出的名称
| [`PROJECT_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_VERSION.html)                       | 当前目录作用域或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所提供的版本号
| [`PROJECT_DESCRIPTION`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_VERSION.html)                   | 当前目录作用域或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时所提供的描述
| [`PROJECT_SOURCE_DIR`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_SOURCE_DIR.html)                 | 当前目录作用域或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时的源目录
| [`PROJECT_BINARY_DIR`](https://cmake.com.cn/cmake/help/latest/variable/PROJECT_BINARY_DIR.html)                 | 当前目录作用域或其上层目录中，<br>最近一次调用 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令时的二进制目录
| [`CMAKE_PROJECT_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_NAME.html)                 | 顶层 `CMakeLists.txt` 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目名称
| [`CMAKE_PROJECT_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_VERSION.html)           | 顶层 `CMakeLists.txt` 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目版本
| [`CMAKE_PROJECT_DESCRIPTION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROJECT_DESCRIPTION.html)   | 顶层 `CMakeLists.txt` 文件中通过 [`project()`](https://cmake.com.cn/cmake/help/latest/command/project.html#command:project) 命令指定的项目描述
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
| [`CMAKE_EXECUTABLE_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXECUTABLE_SUFFIX.html)          | 添加修改可执行文件后缀
| [`CMAKE_STATIC_LIBRARY_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LIBRARY_PREFIX.html)  | 静态库前缀
| [`CMAKE_STATIC_LIBRARY_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LIBRARY_SUFFIX.html)  | 静态库后缀
| [`CMAKE_SHARED_LIBRARY_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LIBRARY_PREFIX.html)  | 动态库前缀
| [`CMAKE_SHARED_LIBRARY_SUFFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LIBRARY_SUFFIX.html)  | 动态库后缀
| [`CMAKE_MINIMUM_REQUIRED_VERSION`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MINIMUM_REQUIRED_VERSION.html)  | CMake 被要求的最低版本
| [`CMAKE_PARENT_LIST_FILE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PARENT_LIST_FILE.html)                  | 包含当前 CMake 文件的那个文件的完整路径
| [`CMAKE_TOOLCHAIN_FILE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_TOOLCHAIN_FILE.html)                      | 工具链文件路径


| 改变行为的内置变量                          | 作用                                   
| ---                                       | ---    
| [`BUILD_SHARED_LIBS`](https://cmake.com.cn/cmake/help/latest/variable/BUILD_SHARED_LIBS.html)        | 在调用 [`add_library()`](https://cmake.com.cn/cmake/help/latest/command/add_library.html#command:add_library) 时若未明确指定库类型，<br>则默认使用 SHARED（动态）库而非 STATIC（静态）库
| [`CMAKE_BUILD_TYPE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html)          | 指定构建类型，典型值包括 `Debug`, `Release`, `RelWithDebInfo` 和 `MinSizeRel`
| [`CMAKE_INSTALL_PREFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INSTALL_PREFIX.html)  | 指定安装目录
| [`CMAKE_INCLUDE_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INCLUDE_PATH.html)      | 指定 [`find_file()`](https://cmake.com.cn/cmake/help/latest/command/find_file.html#command:find_file) 和 [`find_path()`](https://cmake.com.cn/cmake/help/latest/command/find_path.html#command:find_path) 命令的搜索路径列表
| [`CMAKE_LIBRARY_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LIBRARY_PATH.html)      | 指定 [`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library) 命令的搜索路径目录列表
| [`CMAKE_PREFIX_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PREFIX_PATH.html)        | 指定 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package)、[`find_library()`](https://cmake.com.cn/cmake/help/latest/command/find_library.html#command:find_library) 等的搜索前缀列表
| [`CMAKE_PROGRAM_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_PROGRAM_PATH.html)      | 指定 [`find_program()`](https://cmake.com.cn/cmake/help/latest/command/find_program.html#command:find_program) 命令的搜索路径目录列表
| [`CMAKE_MODULE_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_MODULE_PATH.html)        | 指定由 [`include()`](https://cmake.com.cn/cmake/help/latest/command/include.html#command:include) 或 [`find_package()`](https://cmake.com.cn/cmake/help/latest/command/find_package.html#command:find_package) 命令加载 CMake 模块的搜索路径
| [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) | 指定编译器的 --sysroot 标志的根目录路径
| [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html)  | 指定备选的根目录查找路径列表
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_INCLUDE.html)<br>[`ROOT_PATH_MODE_INCLUDE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_INCLUDE.html) | 控制查找文件和目录时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_LIBRARY.html)<br>[`ROOT_PATH_MODE_LIBRARY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_LIBRARY.html) | 控制查找库时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PACKAGE.html)<br>[`ROOT_PATH_MODE_PACKAGE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PACKAGE.html) | 控制查找包时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PROGRAM.html)<br>[`ROOT_PATH_MODE_PROGRAM`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH_MODE_PROGRAM.html) | 控制查找程序时，<br>是否搜索 [`CMAKE_FIND_ROOT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_ROOT_PATH.html) 和 [`CMAKE_SYSROOT`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSROOT.html) 中定义的路径
| [`CMAKE_FIND_`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH.html)<br>[`USE_SYSTEM_ENVIRONMENT_PATH`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH.html) | 默认为 TRUE，决定是否搜索由标准系统环境变量提供的路径

| 描述系统的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_SYSTEM_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSTEM_NAME.html)                     | 目标操作系统名称：`Linux/Windows/Android`
| [`CMAKE_SYSTEM_PROCESSOR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SYSTEM_PROCESSOR.html)           | 目标 CPU 架构：`x86_64/aarch64/loongarch64`
| [`CMAKE_HOST_SYSTEM_NAME`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_HOST_SYSTEM_NAME.html)           | 本机主机操作系统名称，即 CMake 运行所在的操作系统的名称
| [`CMAKE_HOST_SYSTEM_PROCESSOR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_HOST_SYSTEM_PROCESSOR.html) | 本机主机 CPU 架构，即 CMake 运行所在的机器 CPU 名称
| [`UNIX`](https://cmake.com.cn/cmake/help/latest/variable/UNIX.html)                                               | 当目标系统为 UNIX 或类 UNIX 系统时，设置为 true
| [`WIN32`](https://cmake.com.cn/cmake/help/latest/variable/WIN32.html)                                             | 当目标系统为 Windows（包括 Win64）时，设置为 true
| [`LINUX`](https://cmake.com.cn/cmake/help/latest/variable/LINUX.html)                                             | 当目标系统为 Linux 时，设置为 true
| [`ANDROID`](https://cmake.com.cn/cmake/help/latest/variable/ANDROID.html)                                         | 当目标系统为 Android 时，设置为 true


| 控制构建的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_LINKER_TYPE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LINKER_TYPE.html)                           | 指定链接步骤将使用的链接器
| [`CMAKE_EXE_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_EXE_LINKER_FLAGS.html)                 | 指定可执行文件的链接标志
| [`CMAKE_DEBUG_POSTFIX`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_DEBUG_POSTFIX.html)                       | Debug 版本库文件名后缀
| [`CMAKE_INCLUDE_CURRENT_DIR`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_INCLUDE_CURRENT_DIR.html)           | 自动将当前的源码目录和构建目录添加到包含路径中<br>默认情况下，`CMAKE_INCLUDE_CURRENT_DIR` 为 `OFF`
| [`CMAKE_SHARED_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_SHARED_LINKER_FLAGS.html)           | 指定动态库的链接标志
| [`CMAKE_STATIC_LINKER_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_STATIC_LINKER_FLAGS.html)           | 指定静态库的链接标志
| [`CMAKE_ARCHIVE_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_ARCHIVE_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`ARCHIVE`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#archive-output-artifacts) 目标文件的存放位置
| [`CMAKE_LIBRARY_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LIBRARY_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`LIBRARY`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#library-output-artifacts) 目标文件的存放位置
| [`CMAKE_RUNTIME_OUTPUT_DIRECTORY`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_RUNTIME_OUTPUT_DIRECTORY.html) | 指定构建时所有 [`RUNTIME`](https://cmake.com.cn/cmake/help/latest/manual/cmake-buildsystem.7.html#runtime-output-artifacts) 目标文件的存放位置
| [`CMAKE_POSITION_INDEPENDENT_CODE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_POSITION_INDEPENDENT_CODE.html) | 设置非 SHARED 或 MODULE 库目标上的 [`POSITION_INDEPENDENT_CODE`](https://cmake.com.cn/cmake/help/latest/prop_tgt/POSITION_INDEPENDENT_CODE.html#prop_tgt:POSITION_INDEPENDENT_CODE) 属性<br>无论如何设置此变量，SHARED 和 MODULE 库目标均默认启用 PIC


| 用于语言的内置变量                          | 作用                                   
| ---                                       | ---    
| [`CMAKE_C_COMPILER`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER.html)                          | 指定 `C` 编译器的完整路径
| [`CMAKE_C_COMPILER_ID`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER_ID.html)                    | 指定 `C` 编译器标识字符串
| [`CMAKE_C_STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_C_STANDARD.html)                             | 用于设置 [`C_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD.html#prop_tgt:C_STANDARD)，指定构建目标时所请求的 `C` 标准特性
| [`CMAKE_C_STANDARD_REQUIRED`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD_REQUIRED.html#prop_tgt:C_STANDARD_REQUIRED) | 布尔值，描述 [`C_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/C_STANDARD.html#prop_tgt:C_STANDARD) 的值是否为强制要求
| [`CMAKE_C_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS.html)                                | 指定 `C` 语言编译选项
| [`CMAKE_C_FLAGS_DEBUG`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_DEBUG.html)                    | `C` 语言在 `Debug` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_RELEASE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELEASE.html)                | `C` 语言在 `Release` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_RELWITHDEBINFO`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELWITHDEBINFO.html)  | `C` 语言在 `RelWithDebInfo` 配置下构建时使用的编译选项
| [`CMAKE_C_FLAGS_MINSIZEREL`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_MINSIZEREL.html)          | `C` 语言在 `MinSizeRel` 配置下构建时使用的编译选项
| [`CMAKE_CXX_COMPILER`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER.html)                        | `CXX` 编译器的完整路径
| [`CMAKE_CXX_COMPILER_ID`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_COMPILER_ID.html)                  | 指定 `CXX` 编译器标识字符串
| [`CMAKE_CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CXX_STANDARD.html)                         | 用于设置 [`CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/CXX_STANDARD.html#prop_tgt:CXX_STANDARD)，指定构建目标时所请求的 `CXX` 标准特性
| [`CMAKE_CXX_STANDARD_REQUIRED`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_CXX_STANDARD_REQUIRED.html)       | 布尔值，描述 [`CXX_STANDARD`](https://cmake.com.cn/cmake/help/latest/prop_tgt/CXX_STANDARD.html#prop_tgt:CXX_STANDARD) 的值是否为强制要求
| [`CMAKE_CXX_FLAGS`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS.html)                              | 指定 `CXX` 语言编译选项
| [`CMAKE_CXX_FLAGS_DEBUG`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_DEBUG.html)                  | `CXX` 语言在 `Debug` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_RELEASE`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELEASE.html)              | `CXX` 语言在 `Release` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_RELWITHDEBINFO`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_RELWITHDEBINFO.html) | `CXX` 语言在 `RelWithDebInfo` 配置下构建时使用的编译选项
| [`CMAKE_CXX_FLAGS_MINSIZEREL`](https://cmake.com.cn/cmake/help/latest/variable/CMAKE_LANG_FLAGS_MINSIZEREL.html)        | `CXX` 语言在 `MinSizeRel` 配置下构建时使用的编译选项

##### 4.2.1.2 环境变量 

根据用途可分为改变行为、控制构建和针对编程语言三类环境变量，使用 `cmake -E environment` 命令行工具可显示所有当前环境变量。

* 改变行为的环境变量

  | 环境变量                | 作用                                   
  | ---                    | ---                               
  | [`CMAKE_INCLUDE_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_INCLUDE_PATH.html)  | 供 find_file() 和 find_path() 命令搜索。
  | [`CMAKE_LIBRARY_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_LIBRARY_PATH.html)  | 供 find_library() 命令在其中进行搜索。
  | [`CMAKE_PROGRAM_PATH`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_PROGRAM_PATH.html)  | 供 find_program() 命令搜索。

  这些路径类型环境变量可以被设置为单个目录，或在 UNIX 上用 : 分隔，在 Windows 上用 ; 分隔的目录列表。

* 控制构建的环境变量

  | 环境变量                | 作用                        | 说明                                
  | ---                    | ---                         | --- 
  | [`CMAKE_BUILD_TYPE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_BUILD_TYPE.html) | 首次构建时为 CMAKE_BUILD_TYPE 变量提供默认值
  | [`CMAKE_GENERATOR`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_GENERATOR.html)   | 未使用 `-G` 指定生成器时，作为 CMake 默认生成器 | 传入无效值则使用 CMake 内置默认，无论如何最终生效值存入 CMAKE_GENERATOR 变量
  | [`CMAKE_INSTALL_PREFIX`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_INSTALL_PREFIX.html) | 覆盖 CMake 默认安装前缀    | 指定目录值必须是绝对路径
  | [`CMAKE_TOOLCHAIN_FILE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_TOOLCHAIN_FILE.html) | 首次构建时指定默认工具链文件  | 
  | [`DESTDIR`](https://cmake.com.cn/cmake/help/latest/envvar/DESTDIR.html)                           | 在 UNIX 系统上重定向安装路径  | 例如：make DESTDIR=/package/stage install
  | [`VERBOSE`](https://cmake.com.cn/cmake/help/latest/envvar/VERBOSE.html)                           | 开启 CMake 与底层构建工具的详细日志输出 |
  | [`CMAKE_NO_VERBOSE`](https://cmake.com.cn/cmake/help/latest/envvar/CMAKE_NO_VERBOSE.html)         | 禁用来自 CMake 的详细输出   |

* 针对编程语言的环境变量

  | 环境变量                | 作用                        | 说明                                          
  | ---                    | ---                         | ---   
  | [`CC`](https://cmake.com.cn/cmake/help/latest/envvar/CC.html)             | 指定 C 语言编译器               | 仅在首次配置生效，之后将存入 CMAKE_C_COMPILER 缓存；对于任何配置运行（包括首次），如果定义了 CMAKE_C_COMPILER 变量则该环境变量将被忽略
  | [`CFLAGS`](https://cmake.com.cn/cmake/help/latest/envvar/CFLAGS.html)     | 添加编译 C 文件时使用的编译选项  | 仅在首次配置生效；对于任何配置运行（包括首次），如果定义了 CMAKE_C_FLAGS 变量，则该环境变量将被忽略。
  | [`CXX`](https://cmake.com.cn/cmake/help/latest/envvar/CXX.html)           | 指定 CXX 语言编译器             | 仅在首次配置生效，之后将存入 CMAKE_CXX_COMPILER 缓存；对于任何配置运行（包括首次），如果定义了 CMAKE_CXX_COMPILER 变量则该环境变量将被忽略
  | [`CXXFLAGS`](https://cmake.com.cn/cmake/help/latest/envvar/CXXFLAGS.html) | 添加编译 C 文件时使用的编译选项   | 仅在首次配置生效；对于任何配置运行（包括首次），如果定义了 CMAKE_CXX_FLAGS 变量，则该环境变量将被忽略。

##### 4.2.1.3 缓存变量

由 `-D` 标志和 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option) 命令创建的是缓存（cache）变量。通常保存在 `CMakeCache.txt` 文件中。缓存变量是全局可见的变量，且具有“粘性”，一旦设置后就很难改变。如果一个缓存变量被设置了一次，它将一直保留，直到被另一个 `-D` 标志覆盖。[`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 也可以用来操作缓存变量，但不会改变已经创建的变量。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:4,positionColumn:55,positionLineNumber:4,selectionStartColumn:55,selectionStartLineNumber:4,startColumn:55,startLineNumber:4),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,options:'',source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

由于 `-D` 标志在任何项目命令之前处理，因此它们在设置缓存变量的值时具有优先权。

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:4,positionColumn:55,positionLineNumber:4,selectionStartColumn:55,selectionStartLineNumber:4,startColumn:55,startLineNumber:4),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'0',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'-DStickyCacheVariable%3D%22Commandline+always+wins%22',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

虽然缓存变量通常无法更改，但它们可以被普通变量隐藏（shadowed）。我们可以通过使用 set() 设置一个与缓存变量同名的变量，然后使用 unset() 删除该普通变量来观察这一点。

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

| 类型             | 作用                       | 说明                          
| ---             | ---                                    
| [`COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_DEFINITIONS.html#prop_tgt:COMPILE_DEFINITIONS)	        | 用于编译目标中源文件的编译定义列表。    | 它们以未指定的顺序通过 -D 标志或等效标志传递给编译器。
| [`COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_OPTIONS.html#prop_tgt:COMPILE_OPTIONS)	                    | 用于编译目标中源文件的编译选项列表。    | 它们按出现顺序作为标志传递给编译器。
| [`COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/COMPILE_FEATURES.html#prop_tgt:COMPILE_FEATURES)	                  | 编译目标中源文件所需的 编译特性 列表。  | 通常，这些确保目标的源文件使用足够的语言标准级别进行编译。
| [`INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INCLUDE_DIRECTORIES.html#prop_tgt:INCLUDE_DIRECTORIES)	        | 用于编译目标中源文件的包含目录列表。    | 它们按出现顺序通过 -I 或 -isystem 标志或等效标志传递给编译器。
| [`SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/SOURCES.html#prop_tgt:SOURCES)	                                            | 与目标关联的源文件列表。  | 包括在通过 add_executable()、add_library() 或 add_custom_target() 命令创建目标时指定的源文件。
| [`PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/PRECOMPILE_HEADERS.html#prop_tgt:PRECOMPILE_HEADERS)	            | 编译目标中源文件时要预编译并包含的头文件列表。

##### 5.2.2.2 目标链接属性

这些表示链接目标的 构建规范。如果目标是可执行文件、共享库或模块库，则

| 类型             | 作用                       | 说明                          
| ---             | ---                                    
| [`LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_LIBRARIES.html#prop_tgt:LINK_LIBRARIES)	        | 此项为链接该目标所需的链接库列表。    | 静态库 和 共享库 的条目通过其链接产物的路径，或使用 -l 标志或等效标志传递给链接器。对象库 的条目通过其对象文件的路径传递给链接器。
| [`LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DIRECTORIES.html#prop_tgt:LINK_DIRECTORIES)	  | 此项为链接该目标所需的链接目录列表。    | 目录通过 -L 标志或等效标志传递给链接器。
| [`LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_OPTIONS.html#prop_tgt:LINK_OPTIONS)	              | 此项为链接该目标所需的链接选项列表。  | 选项按出现顺序作为标志传递给链接器。
| [`LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/LINK_DEPENDS.html#prop_tgt:LINK_DEPENDS)	              | 此项为链接该目标所依赖的文件列表。  | 


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

| 类型             | 作用                       | 说明                          
| ---             | ---                                    
| [`INTERFACE_COMPILE_DEFINITIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_DEFINITIONS.html#prop_tgt:INTERFACE_COMPILE_DEFINITIONS)	                | 用于编译目标消费者中源文件的编译定义列表。    | 通常这些由目标的头文件使用。
| [`INTERFACE_COMPILE_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_OPTIONS.html#prop_tgt:INTERFACE_COMPILE_OPTIONS)	                    | 用于编译目标消费者中源文件的编译选项列表。    | 
| [`INTERFACE_COMPILE_FEATURES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_COMPILE_FEATURES.html#prop_tgt:INTERFACE_COMPILE_FEATURES)	                    | 用于编译目标消费者中源文件所需的 编译特性 列表。  | 通常，这些确保目标的头文件在消费者使用足够的语言标准级别编译时得到正确处理。
| [`INTERFACE_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_INCLUDE_DIRECTORIES)	                | 用于编译目标消费者中源文件的包含目录列表。    | 通常这些是目标头文件的位置。
| [`INTERFACE_SYSTEM_INCLUDE_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SYSTEM_INCLUDE_DIRECTORIES.html#prop_tgt:INTERFACE_SYSTEM_INCLUDE_DIRECTORIES)	          | 当指定为包含目录时，在编译目标消费者中的源文件时应被视为“系统”包含目录的目录列表。    | 例如通过 INCLUDE_DIRECTORIES 或 INTERFACE_INCLUDE_DIRECTORIES
| [`INTERFACE_SOURCES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_SOURCES.html#prop_tgt:INTERFACE_SOURCES)  | 要与目标消费者关联的源文件列表。  | 
| [`INTERFACE_PRECOMPILE_HEADERS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_PRECOMPILE_HEADERS.html#prop_tgt:INTERFACE_PRECOMPILE_HEADERS)	                  | 编译目标消费者中的源文件时要预编译并包含的头文件列表。

##### 5.2.3.2 传递链接属性

这些表示用于链接消费者的 使用要求。

| 类型             | 作用                                       
| ---             | ---                                    
| [`INTERFACE_LINK_LIBRARIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_LIBRARIES.html#prop_tgt:INTERFACE_LINK_LIBRARIES)	        | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接库列表。
| [`INTERFACE_LINK_DIRECTORIES`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DIRECTORIES.html#prop_tgt:INTERFACE_LINK_DIRECTORIES)	  | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接目录列表。
| [`INTERFACE_LINK_OPTIONS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_OPTIONS.html#prop_tgt:INTERFACE_LINK_OPTIONS)	              | 用于链接目标消费者（如果是可执行文件、共享库或模块库）的链接选项列表。
| [`INTERFACE_LINK_DEPENDS`](https://cmake.com.cn/cmake/help/latest/prop_tgt/INTERFACE_LINK_DEPENDS.html#prop_tgt:INTERFACE_LINK_DEPENDS)	              | 链接目标消费者（如果是可执行文件、共享库或模块库）所依赖的文件列表。

## 6. CMake 模块
## 7. CMake 包
## 8. CMake 属性
## 9. CMake 工具链
## 10. References
>
> * [GNU Automake](https://www.gnu.org/software/automake/manual/html_node/index.html)
>
> * [Autotools Tutorial --- Alexandre Duret-Lutz](https://www.lrde.epita.fr/~adl/autotools.html)
>
> * [CMake 参考文档英文版](https://cmake.org/cmake/help/latest/)
>
> * [CMake 参考文档中文版](https://cmake.com.cn/cmake/help/latest/)
>
> 

