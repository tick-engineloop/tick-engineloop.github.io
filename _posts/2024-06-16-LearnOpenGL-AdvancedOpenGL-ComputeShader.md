---
title: Compute Shader
description: 计算着色器是一种完全用于计算任意信息的着色器阶段。虽然它可以进行渲染，但一般用于与绘制三角形和像素没有直接关系的任务。
date: 2024-06-16 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedOpenGL]
tags: [computergraphics, learnopengl, computeshader]     # TAG names should always be lowercase
---

## Compute space

The "space" that a compute shader operates on is largely abstract. There is the concept of a work group, this is the smallest amount of compute operations that the user can execute. The number of work groups that a compute operation is executed with is defined by the user when they invoke the compute operation. Work item is the smallest unit in work group.

计算着色器操作的空间是极其抽象的。在这里有一个工作组的概念，它是用户可以执行的计算操作的最小数量。执行计算操作的工作组数由用户在调用计算操作时定义。工作组中的最小单位称为工作项。

When the system actually computes the work groups, it can do so in any order. So if it is given a work group set of (3, 1, 2), it could execute group (0, 0, 0) first, then skip to group (1, 0, 1), then jump to (2, 0, 0), etc. So your compute shader should not rely on the order in which individual groups are processed.

当系统实际计算工作组时，它可以按任何顺序进行计算。因此，如果给它一个 （3， 1， 2） 的工作组集，它可以先执行组 （0， 0， 0），然后跳到组 （1， 0， 1），然后跳转到 （2， 0， 0） 等。因此，计算着色器不应依赖于处理各个组的顺序。

Do not think that a single work group is the same thing as a single compute shader invocation; there's a reason why it is called a "group". Within a single work group, there may be many compute shader invocations. How many is defined by the compute shader itself, This is known as the local size of the work group.

不要认为单个工作组与单个计算着色器调用是一回事；它被称为“组”是有原因的。在单个工作组中，可能有许多计算着色器调用。多少由计算着色器本身定义，这称为工作组的局部大小。

Every compute shader has a three-dimensional local size. This defines the number of invocations of the shader that will take place within each work group.

每个计算着色器都有一个三维局部大小。这定义了将在每个工作组中发生的着色器调用次数。

The individual invocations within a work group will be executed "in parallel". The main purpose of the distinction between work group count and local size is that the different compute shader invocations within a work group can communicate through a set of shared variables and special functions. Invocations in different work groups (within the same compute shader dispatch) cannot effectively communicate. 

工作组内的单个调用将“并行”执行。区分工作组数量和本地大小的主要目的是，工作组中的不同计算着色器调用可以通过一组共享变量和特殊函数进行通信。不同工作组中的调用（在同一计算着色器调度中）无法有效通信。

## Inputs and Output

### Inputs
Compute shaders cannot have any user-defined input variables. If you wish to provide input to a CS, you must use the implementation-defined inputs coupled with resources like storage buffers or Textures. 

计算着色器不能有任何用户定义的输入变量。如果要向 CS 提供输入，则必须使用与资源（像存储缓冲区或纹理等）相结合的实现定义输入。

Compute Shaders have the following built-in input variables.

计算着色器有以下内置输入变量。


```glsl
// In the compute language, gl_NumWorkGroups contains the total number of work groups that will execute the compute shader. 
// The components of gl_NumWorkGroups are equal to the num_groups_x, num_groups_y, and num_groups_z parameters passed to the glDispatchCompute command.
in uvec3 gl_NumWorkGroups ;         // 将执行计算着色器的工作组的总数量

// In the compute language, gl_WorkGroupSize contains the size of a workgroup declared by a compute shader. 
// The size of the work group in the X, Y, and Z dimensions is stored in the x, y, and z components of gl_WorkGroupSize. 
// The values stored in gl_WorkGroupSize match those specified in the required local_size_x, local_size_y, and local_size_z layout qualifiers for the current shader. 
// This value is constant so that it can be used to size arrays of memory that can be shared within the local work group.
const uvec3 gl_WorkGroupSize ;      // 由一个计算着色器声明的一个工作组的大小

// In the compute language, gl_WorkGroupID contains the 3-dimensional index of the global work group that the current compute shader invocation is executing within. 
// The possible values range across the parameters passed into glDispatchCompute, i.e., from (0, 0, 0) to (gl_NumWorkGroups.x - 1, gl_NumWorkGroups.y - 1, gl_NumWorkGroups.z - 1).
in uvec3 gl_WorkGroupID ;           // 当前计算着色器调用正执行在全局工作组内索引为 gl_WorkGroupID 的工作组上，即代表了当前计算着色器调用发生在哪个工作组内

// In the compute language, gl_LocalInvocationID is an input variable containing the n-dimensional index of the local work invocation within the work group that the current shader is executing in. 
// The possible values for this variable range across the local work group size, i.e., (0,0,0) to (gl_WorkGroupSize.x - 1, gl_WorkGroupSize.y - 1, gl_WorkGroupSize.z - 1).
in uvec3 gl_LocalInvocationID ;     // 当前计算着色器正执行在工作组内索引为 gl_LocalInvocationID 的局部工作调用里，即代表了当前计算着色器调用发生在工作组内的哪个位置

// In the compute language, gl_GlobalInvocationID is a derived input variable containing the n-dimensional index of the work invocation within the global work group that the current shader is executing on. 
// The value of gl_GlobalInvocationID is equal to gl_WorkGroupID * gl_WorkGroupSize + gl_LocalInvocationID.
in uvec3 gl_GlobalInvocationID ;    // 当前计算着色器正执行在全局工作组内索引为 gl_GlobalInvocationID 的工作调用上

// In the compute language, gl_LocalInvocationIndex is a derived input variable containing the 1-dimensional linearized index of the work invocation within the work group that the current shader is executing on. 
// The value of gl_LocalInvocationIndex is equal to gl_LocalInvocationID.z * gl_WorkGroupSize.x * gl_WorkGroupSize.y + gl_LocalInvocationID.y * gl_WorkGroupSize.x + gl_LocalInvocationID.x.
in uint gl_LocalInvocationIndex ;   // 当前计算着色器正执行在工作组内一维线性索引为 gl_LocalInvocationIndex 的工作调用上。是区别于局部工作调用的三维索引 gl_LocalInvocationID，对工作组内的所有调用按一维线性排序，依次为每个调用安排一个一维索引值，这个索引值就是 gl_LocalInvocationIndex 的值
```

在一个计算着色器里面，gl_NumWorkGroups 代表了一个 dispatch compute 指令指定的工作组数量；gl_WorkGroupSize 代表了工作组大小，gl_WorkGroupID 说明了当前计算着色器调用是在哪个工作组内；gl_LocalInvocationID 说明了是在 gl_WorkGroupID 这个工作组内的哪个调用上，是一个工作组内部的局部索引；将所有工作组的所有调用统筹考虑，gl_GlobalInvocationID 是当前计算着色器执行在全局的哪个调用上。

#### Local size

The local size of a compute shader is defined within the shader, using a special layout input declaration:

计算着色器的局部大小是在着色器中定义的，使用特殊的布局输入声明：

```glsl
layout(local_size_x = X​, local_size_y = Y​, local_size_z = Z​) in;
```

By default, the local sizes are 1, so if you only want a 1D or 2D work group space, you can specify just the X​ or the X​ and Y​ components.

默认情况下，局部大小为 1，因此，如果您只需要 1D 或 2D 工作组空间，则可以仅指定 X 或 X 和 Y 组件。

### Outputs
Compute shaders do not have output variables. If you wish to have a CS generate some output, you must use a resource to do so. Shader storage buffers and Image Load Store operations are useful ways to output data from a CS.

计算着色器没有输出变量。如果您希望让 CS 生成一些输出，则必须使用资源来执行此操作。着色器存储缓冲区和图像加载存储操作是从 CS 输出数据的有用方法。

## Shared variables

Global variables in compute shaders can be declared with the shared storage qualifier. The value of such variables are shared between all invocations within a work group. You cannot declare any opaque types as shared, but aggregates (arrays and structs) are fine.

可以使用共享存储限定符声明计算着色器中的全局变量。此类变量的值在工作组内的所有调用之间共享。您不能将任何不透明类型声明为共享类型，但聚合（数组和结构）是可以的。

At the beginning of a work group, these values are uninitialized. Also, the variable declaration cannot have initializers, so this is illegal:

在工作组开始时，这些值是未初始化的。此外，变量声明不能有初始值设定项，因此这是非法的：

```glsl
shared uint foo = 0; // No initializers for shared variables.
```

## Shared memory coherency

While all invocations within a work group are said to execute "in parallel", that doesn't mean that you can assume that all of them are executing in lock-step. If you need to ensure that an invocation has written to some variable so that you can read it, you need to synchronize execution with the invocations, not just issue a memory barrier (you still need the memory barrier though).

虽然说工作组中的所有调用是“并行”执行的，但这并不意味着您可以认为所有调用都是同步执行的。如果你需要确保一个调用已经写入某个变量以便你可以读取它，你需要将执行与调用同步，而不仅仅是发出内存屏障（尽管你仍然需要内存屏障）。

To synchronize reads and writes between invocations within a work group, you must employ the barrier() function. This forces an explicit synchronization between all invocations in the work group. Execution within the work group will not proceed until all other invocations have reach this barrier. Once past the barrier(), all shared variables previously written across all invocations in the group will be visible.

若要在工作组内的调用之间同步读取和写入，必须使用 barrier（） 函数。这将强制在工作组中的所有调用之间显式同步。在所有其他调用到达此障碍之前，工作组内的执行不会继续进行。一旦越过 barrier（），之前在组中所有调用中写入的所有共享变量都将可见。

## Atomic operations

A number of atomic operations can be performed on shared variables of integral type (and vectors/arrays/structs of them). 

可以对整型的共享变量（以及它们的向量/数组/结构体）执行一系列原子操作。

All of the atomic functions return the original value. The term "nint" can be int or uint.

所有原子函数都返回原始值。术语“nint”可以是 int 或 uint。

```glsl
nint atomicAdd(inout nint mem​, nint data​)
nint atomicAdd(inout nint mem, nint data)
```

将 data​ 与 mem 中的内容执行原子相加，然后将相加值写入 mem, 并返回相加前 mem 中的原始内容。

```glsl
nint atomicMin(inout nint mem​, nint data​)
nint atomicMin(inout nint mem, nint data)
```

将 data 与 mem 中的内容进行原子比较，然后将最小值写入 mem，并返回比较前 mem 中的原始内容。

## References
>
> * [Compute Shader](https://www.khronos.org/opengl/wiki/Compute_Shader)
>
> * [glDispatchCompute](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glDispatchCompute.xhtml)