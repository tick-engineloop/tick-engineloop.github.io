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

变量是 CMake 语言中存储的基本单元。它们的值始终是字符串类型。变量名称区分大小写，并且可以包含几乎任何文本，但我们建议坚持使用仅包含字母数字字符加上 `_` 和 `-` 的名称。使用 [`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 和 [`unset()`](https://cmake.com.cn/cmake/help/latest/command/unset.html#command:unset) 命令可显式设置或取消设置变量。

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

#### 4.2.1 变量类型

变量可分为普通变量、环境变量和缓存变量。

环境变量 
: 使用 `cmake -E environment` 命令行工具可显示所有当前环境变量。

缓存变量
: 由 `-D` 标志和 [`option()`](https://cmake.com.cn/cmake/help/latest/command/option.html#command:option) 命令创建的是缓存（cache）变量。缓存变量是全局可见的变量，且具有“粘性”，一旦设置后就很难改变。如果一个缓存变量被设置了一次，它将一直保留，直到被另一个 `-D` 标志覆盖。[`set()`](https://cmake.com.cn/cmake/help/latest/command/set.html#command:set) 也可以用来操作缓存变量，但不会改变已经创建的变量。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-top:16px;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:4,positionColumn:55,positionLineNumber:4,selectionStartColumn:55,selectionStartLineNumber:4,startColumn:55,startLineNumber:4),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,options:'',source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

  由于 `-D` 标志在任何项目命令之前处理，因此它们在设置缓存变量的值时具有优先权。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:55,endLineNumber:4,positionColumn:55,positionLineNumber:4,selectionStartColumn:55,selectionStartLineNumber:4,startColumn:55,startLineNumber:4),source:'set(StickyCacheVariable+%22I+will+not+change%22+CACHE+STRING+%22%22)%0Aset(StickyCacheVariable+%22Overwrite+StickyCache%22+CACHE+STRING+%22%22)%0A%0Amessage(%22StickyCacheVariable:+$%7BStickyCacheVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'0',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'-DStickyCacheVariable%3D%22Commandline+always+wins%22',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

  虽然缓存变量通常无法更改，但它们可以被普通变量隐藏（shadowed）。我们可以通过使用 set() 设置一个与缓存变量同名的变量，然后使用 unset() 删除该普通变量来观察这一点。

  <iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:45,endLineNumber:6,positionColumn:45,positionLineNumber:6,selectionStartColumn:45,selectionStartLineNumber:6,startColumn:45,startLineNumber:6),source:'set(ShadowVariable+%22In+the+shadows%22+CACHE+STRING+%22%22)%0Aset(ShadowVariable+%22Hiding+the+cache+variable%22)%0Amessage(%22ShadowVariable:+$%7BShadowVariable%7D%22)%0A%0Aunset(ShadowVariable)%0Amessage(%22ShadowVariable:+$%7BShadowVariable%7D%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

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

<iframe style="display:block;width:100%;max-width:800px;height:400px;margin:0 auto;margin-bottom:16px;border:0" src="https://godbolt.org/e?hideEditorToolbars=true#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,selection:(endColumn:14,endLineNumber:7,positionColumn:14,positionLineNumber:7,selectionStartColumn:14,selectionStartLineNumber:7,startColumn:14,startLineNumber:7),source:'macro(MyMacro+MacroArgument)%0A++message(%22$%7BMacroArgument%7D%5Cn%5Ct%5CtFrom+Macro%22)%0Aendmacro()%0A%0Afunction(MyFunc+FuncArgument)%0A++MyMacro(%22$%7BFuncArgument%7D%5Cn%5CtFrom+Function%22)%0Aendfunction()%0A%0AMyFunc(%22From+TopLevel%22)'),l:'5',n:'0',o:'CMakeScript+source+%231',t:'0')),k:100,l:'4',m:50,n:'0',o:'',s:0,t:'0'),(g:!((h:executor,i:(argsPanelShown:'1',compilationPanelShown:'1',compiler:cmake-3_31_5,compilerName:'',compilerOutShown:'1',execArgs:'',execStdin:'',fontScale:14,fontUsePx:'0',j:1,lang:cmakescript,libs:!(),options:'',overrides:!(),runtimeTools:!(),source:1,stdinPanelShown:'1',wrap:'1'),l:'5',n:'0',o:'Executor+cmake+3.31.5+(CMakeScript,+Editor+%231)',t:'0')),header:(),l:'4',m:50,n:'0',o:'',s:0,t:'0')),l:'3',n:'0',o:'',t:'0')),version:4"></iframe>

与许多语言一样，函数和宏的区别在于作用域。`macro()` 在语义上类似于文本替换，类似于 C/C++ 宏，因此宏产生的任何副作用在调用它的上下文中都是可见的。如果我们宏中创建或更改一个变量，调用者将会看到该更改。`function()` 会创建自己的变量作用域，因此副作用对调用者不可见。为了将更改传播给调用该函数的父级，我们必须使用 `set(<var> <value> PARENT_SCOPE)`，它的工作方式与 `set()` 相同，但仅针对属于调用者上下文的变量。

### 控制结构

#### 条件块

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

#### 循环

提供两种循环结构：[`while()`](https://cmake.com.cn/cmake/help/latest/command/while.html#command:while)（在检查循环变量时遵循与 if() 相同的规则）以及更有用的 [`foreach()`](https://cmake.com.cn/cmake/help/latest/command/foreach.html#command:foreach)（遍历字符串列表，已在“背景”部分演示）。




## References
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