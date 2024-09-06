---
title: Shadow Mapping
description: 阴影是光线被遮挡后在被遮挡区域出现的一种光照缺失的现象。阴影为光照场景增添了许多真实感，使观众更容易观察到物体之间的空间关系。
date: 2024-06-18 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess，shadow]     # TAG names should always be lowercase
math: true
---

## Introduction

Shadows are a result of the absence of light due to occlusion. When a light source's light rays do not hit an object because it gets occluded by some other object, the object is in shadow. Shadows add a great deal of realism to a lit scene and make it easier for a viewer to observe spatial relationships between objects. They give a greater sense of depth to our scene and objects. For example, take a look at the following image of a scene with and without shadows:

阴影是光线被遮挡后在被遮挡区域出现的一种光照缺失的现象。当光源的光线由于被其他物体遮挡而无法照射到物体时，该物体就处于阴影中。阴影为光照场景增添了许多真实感，使观众更容易观察到物体之间的空间关系。它会使我们的场景和物体更具深度感。例如，请看下面有阴影和没有阴影的场景图像：

![WithoutShadow And WithShadow](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithoutShadowAndWithShadow.png)

You can see that with shadows it becomes much more obvious how the objects relate to each other. For instance, the fact that one of the cubes is floating above the others is only really noticeable when we have shadows.

你可以看到，有了阴影之后，物体之间的关系就变得更加明显了。例如，其中一个立方体漂浮在其他立方体之上的事实，只有在有阴影的情况下才会非常明显。

Shadows are a bit tricky to implement though, specifically because in current real-time (rasterized graphics) research a perfect shadow algorithm hasn't been developed yet. There are several good shadow approximation techniques, but they all have their little quirks and annoyances which we have to take into account.

不过阴影的实现有点棘手，特别是因为在当前的实时（光栅化图形）研究中，还没有开发出完美的阴影算法。虽然有几种很好的阴影近似技术，但它们都有各自的小瑕疵和恼人之处，这是不容忽视的。

One technique used by most videogames that gives decent results and is relatively easy to implement is shadow mapping. Shadow mapping is not too difficult to understand, doesn't cost too much in performance and quite easily extends into more advanced algorithms (like Omnidirectional Shadow Maps and Cascaded Shadow Maps).

与之相比较而言，下面介绍的阴影贴图就很容易理解，而且实现起来很简单，在带来不错效果的同时，也不会对性能造成太大影响，很容易就能扩展到更高级的算法（如全向阴影贴图和级联阴影贴图），是大多数电子游戏都会使用的一种技术。

## Shadow mapping

The idea behind shadow mapping is quite simple: we render the scene from the light's point of view and everything we see from the light's perspective is lit and everything we can't see must be in shadow. Imagine a floor section with a large box between itself and a light source. Since the light source will see this box and not the floor section when looking in its direction that specific floor section should be in shadow.

阴影贴图背后的原理非常简单：我们从光源的视角来渲染场景，这样视野范围内能看到的所有东西都是亮的，其他看不到的东西都必然处于阴影当中。试想一下，在地板和光源之间有一个大盒子。由于光源从它的方向看去会看到这个盒子，而不是地板部分，所以地板部分应该处于阴影中。

![Theory](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-Theory.png)

Here all the blue lines represent the fragments that the light source can see. The occluded fragments are shown as black lines: these are rendered as being shadowed. If we were to draw a line or ray from the light source to a fragment on the right-most box we can see the ray first hits the floating container before hitting the right-most container. As a result, the floating container's fragment is lit and the right-most container's fragment is not lit and thus in shadow.

上图中所有用蓝色标识的区域代表光源可以照射到的片段。用黑色标识的区域是被遮挡的片段：这些片段会被渲染为阴影。如果我们在光源和最右边盒子上的片段之间画一条线或射线，可以看到射线首先击中悬浮的盒子，然后才击中最右边的盒子。因此，悬浮盒子上用蓝色标识的首先被击中的片段会被照亮，而最右边盒子上用黑色标识的后来才被击中的片段不会被照亮，从而处于阴影中。

We want to get the point on the ray where it first hit an object and compare this closest point to other points on this ray. We then do a basic test to see if a test point's ray position is further down the ray than the closest point and if so, the test point must be in shadow. Iterating through possibly thousands of light rays from such a light source is an extremely inefficient approach and doesn't lend itself too well for real-time rendering. We can do something similar, but without casting light rays. Instead, we use something we're quite familiar with: the depth buffer.

从光源发出的射线可能会与场景里众多物体相交，随之产生一系列相交点，我们希望得到的是射线最先击中的物体上离光源最近的交点，并将这个最近的点与射线上的其他点进行比较，看看其他点是否比最近点更远，如果是，则这个测试点一定处于阴影中。但是从这样一个光源中迭代可能成千上万条光线是一种效率极低的方法，而且不太适合实时渲染。所以我们可以使用深度缓冲来做类似的事情，这样就可以避免投射光线。

You may remember from the depth testing chapter that a value in the depth buffer corresponds to the depth of a fragment clamped to [0,1] from the camera's point of view. What if we were to render the scene from the light's perspective and store the resulting depth values in a texture? This way, we can sample the closest depth values as seen from the light's perspective. After all, the depth values show the first fragment visible from the light's perspective. We store all these depth values in a texture that we call a depth map or shadow map.

大家可能还记得，在深度测试一章中，深度缓冲区中的值对应于摄像机视角下被限制在 [0,1] 范围内的片段深度。如果我们从光源的视角渲染场景，并将生成的深度值存储在纹理中，会怎么样呢？通过这种方式，我们就可以采样光源视角下的最近深度值。毕竟，深度纹理中存储的深度值代表的是光源视角下第一个可见片段的深度信息。我们将存储所有这些深度值的纹理称之为深度图或阴影贴图。

![Light Space](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-LightSpace.png)

The left image shows a directional light source (all light rays are parallel) casting a shadow on the surface below the cube. Using the depth values stored in the depth map we find the closest point and use that to determine whether fragments are in shadow. We create the depth map by rendering the scene (from the light's perspective) using a view and projection matrix specific to that light source. This projection and view matrix together form a transformation $T$ that transforms any 3D position to the light's (visible) coordinate space.

左图显示的是一个定向光（所有光线都是平行的）在立方体下方的表面上投射了一块阴影，其中黄色标识区域场景片段的深度将被存储到深度图中。我们通过使用光源专用的视图和投影矩阵渲染场景（从光源的视角）来创建深度图。投影矩阵和视图矩阵共同构成一个变换 $T$，可将场景中任何三维位置变换到光源的（视图）坐标空间。利用深度图中存储的深度值，我们可以在光线与场景众多物体的一系列交点中找到离光源最近的点，并以此来确定观察者视角下看到的片段是否处于阴影中。

> A directional light doesn't have a position as it's modelled to be infinitely far away. However, for the sake of shadow mapping we need to render the scene from a light's perspective and thus render the scene from a position somewhere along the lines of the light direction. <br> <br> 类似于太阳光这样的定向光没有光源位置，因为它被视为无穷远的。但是，在实现阴影贴图时，从光源的视角来渲染场景又是我们所需要的，因此可以选择光线方向上某个合适的位置来进行渲染。
{: .prompt-tip }

In the right image we see the same directional light and the viewer. We render a fragment at point $\bar{\color{red}{P}}$ for which we have to determine whether it is in shadow. To do this, we first transform point $\bar{\color{red}{P}}$ to the light's coordinate space using $T$. Since point $\bar{\color{red}{P}}$ is now as seen from the light's perspective, its `z` coordinate corresponds to its depth which in this example is `0.9`. Using point $\bar{\color{red}{P}}$ we can also index the depth/shadow map to obtain the closest visible depth from the light's perspective, which is at point $\bar{\color{green}{C}}$ with a sampled depth of `0.4`. Since indexing the depth map returns a depth smaller than the depth at point $\bar{\color{red}{P}}$ we can conclude point $\bar{\color{red}{P}}$ is occluded and thus in shadow. 

在右图中，我们看到了方向相同的光线和观察者。我们渲染一个在 $\bar{\color{red}{P}}$ 点处的片段，需要确定它是否处于阴影当中。为此，我们首先使用 $T$ 将 $\bar{\color{red}{P}}$ 点转换到光源的视图坐标空间。由于 $\bar{\color{red}{P}}$ 点现在是从光源的视角看到的，所以它的 `z` 坐标对应于深度，在本例中为 `0.9`。通过使用点 $\bar{\color{red}{P}}$，我们还可以对深度/阴影贴图进行索引，以获得从光源视角看时最近的可见深度，即采样深度为 `0.4` 的点 $\bar{\color{green}{C}}$。由于深度图索引返回的深度小于  $\bar{\color{red}{P}}$ 点的深度，我们可以得出结论：$\bar{\color{red}{P}}$ 点被遮挡，因此它处于阴影当中。

Shadow mapping therefore consists of two passes: first we render the depth map, and in the second pass we render the scene as normal and use the generated depth map to calculate whether fragments are in shadow. It may sound a bit complicated, but as soon as we walk through the technique step-by-step it'll likely start to make sense.

因此，阴影映射由两部分组成：第一部分是渲染深度图，第二部分是像往常一样渲染场景，并使用生成的深度图来计算片段是否处于阴影当中。这听起来可能有点复杂，但只要我们一步一步地了解这项技术，就会明白其中的道理。

## The depth map

The first pass requires us to generate a depth map. The depth map is the depth texture as rendered from the light's perspective that we'll be using for testing for shadows. Because we need to store the rendered result of a scene into a texture we're going to need [framebuffers](https://learnopengl.com/Advanced-OpenGL/Framebuffers) again.

第一个通道用来生成深度图。深度图是以光源的视角渲染的深度纹理，我们将使用它来计算阴影。因为需要将场景的渲染结果存储到纹理中，所以我们再一次需要[帧缓冲](https://learnopengl.com/Advanced-OpenGL/Framebuffers)。

First we'll create a framebuffer object for rendering the depth map:

首先，我们要为渲染深度图创建一个帧缓冲对象：

```c++
unsigned int depthMapFBO;
glGenFramebuffers(1, &depthMapFBO); 
```

Next we create a 2D texture that we'll use as the framebuffer's depth buffer:

接下来，创建一个 2D 纹理，用作帧缓冲的深度缓冲：

```c++
const unsigned int SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;

unsigned int depthMap;
glGenTextures(1, &depthMap);
glBindTexture(GL_TEXTURE_2D, depthMap);
glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, 
             SHADOW_WIDTH, SHADOW_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT); 
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```
Generating the depth map shouldn't look too complicated. Because we only care about depth values we specify the texture's formats as GL_DEPTH_COMPONENT. We also give the texture a width and height of `1024`: this is the resolution of the depth map.

生成深度图看起来并不复杂。因为我们只关心深度值，所以将纹理的格式指定为了 GL_DEPTH_COMPONENT。我们还将纹理的宽度和高度设定为 `1024`：这就是深度图的分辨率。

With the generated depth texture we can attach it as the framebuffer's depth buffer:

有了生成的深度纹理，我们就可以关联它将其作为帧缓冲的深度缓冲：

```c++
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMap, 0);
glDrawBuffer(GL_NONE);
glReadBuffer(GL_NONE);
glBindFramebuffer(GL_FRAMEBUFFER, 0);  
```

We only need the depth information when rendering the scene from the light's perspective so there is no need for a color buffer. A framebuffer object however is not complete without a color buffer so we need to explicitly tell OpenGL we're not going to render any color data. We do this by setting both the read and draw buffer to GL_NONE with glDrawBuffer and glReadbuffer.

在从光源的视角渲染场景时，我们只需要其中的深度信息，因此不需要颜色缓冲区。然而，没有颜色缓冲区的帧缓冲对象是不完整的，因此需要明确告诉 OpenGL 我们不会渲染任何颜色数据。为此，可以使用 glDrawBuffer 和 glReadbuffer 将读取和绘制缓冲区都设置为 GL_NONE。

With a properly configured framebuffer that renders depth values to a texture we can start the first pass: generate the depth map. When combined with the second pass, the complete rendering stage will look a bit like this:

有了正确配置的帧缓冲，就能将深度值渲染到纹理，然后我们可以开始第一个通道了：生成深度图。结合第二个通道，整个渲染阶段看起来就是这样：

```c++
// 1. first render to depth map
glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glClear(GL_DEPTH_BUFFER_BIT);
    ConfigureShaderAndMatrices();
    RenderScene();
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// 2. then render scene as normal with shadow mapping (using depth map)
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
glBindTexture(GL_TEXTURE_2D, depthMap);
RenderScene();
```

This code left out some details, but it'll give you the general idea of shadow mapping. What is important to note here are the calls to glViewport. Because shadow maps often have a different resolution compared to what we originally render the scene in (usually the window resolution), we need to change the viewport parameters to accommodate for the size of the shadow map. If we forget to update the viewport parameters, the resulting depth map will be either incomplete or too small.

这段代码隐藏了一些细节，但可以让你大致了解阴影贴图的一般思想。这里需要注意的是对 glViewport 的调用。由于阴影贴图的分辨率通常不同于我们最初渲染场景的分辨率（通常是窗口分辨率），因此需要在生成深度图的通道中一开始就更改视口参数，以适应阴影贴图的大小。如果忘记更改视口参数，那么生成的深度图可能会不完整或者尺寸过小。

### Light space transform

An unknown in the previous snippet of code is the ConfigureShaderAndMatrices function. In the second pass this is business as usual: make sure proper projection and view matrices are set, and set the relevant model matrices per object. However, in the first pass we need to use a different projection and view matrix to render the scene from the light's point of view.

上一段代码中的一个未知项是配置着色器和矩阵函数（ConfigureShaderAndMatrices）。在第二个通道中，这个函数做的事情与往常一样：确保设置了适当的投影和视图矩阵，并为每个对象设置了相关的模型矩阵。不过，在第一个通道中，我们需要使用不同的投影和视图矩阵，以便从光源的视角渲染场景。

Because we're modelling a directional light source, all its light rays are parallel. For this reason, we're going to use an orthographic projection matrix for the light source where there is no perspective deform:

因为我们要模拟的是一个定向光源，所以它的所有光线都是平行的。基于这个原因，我们将为光源使用正交投影矩阵，这样就不存在透视变形：

```c++
float near_plane = 1.0f, far_plane = 7.5f;
glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane); 
```

Here is an example orthographic projection matrix as used in this chapter's demo scene. Because a projection matrix indirectly determines the range of what is visible (e.g. what is not clipped) you want to make sure the size of the projection frustum correctly contains the objects you want to be in the depth map. When objects or fragments are not in the depth map they will not produce shadows.

上面是本章演示场景中使用的正交投影矩阵示例。由于投影矩阵间接决定了可见区域的范围（例如什么物体不会被裁剪），因此您需要确保投影视锥体拥有合适的大小，能够正确包含您希望在深度图中出现的物体。当物体或片段因为被裁剪而不在深度图中时，它们就不会生成阴影。

To create a view matrix to transform each object so they're visible from the light's point of view, we're going to use the infamous glm::lookAt function; this time with the light source's position looking at the scene's center.

为了把每个物体转换到光源视点的视图空间中，我们将使用大名鼎鼎的 glm::lookAt 函数创建一个视图矩阵；这次光源的位置是在场景中心。

```c++
glm::mat4 lightView = glm::lookAt(glm::vec3(-2.0f, 4.0f, -1.0f), 
                                  glm::vec3( 0.0f, 0.0f,  0.0f), 
                                  glm::vec3( 0.0f, 1.0f,  0.0f)); 
```

Combining these two gives us a light space transformation matrix that transforms each world-space vector into the space as visible from the light source; exactly what we need to render the depth map.

将视图和投影矩阵这两者结合起来，我们就得到了一个光源空间变换矩阵，它能将每个世界空间位置向量变换到光源视角下的可见空间中去；这正是我们渲染深度图所需要的。

```c++
glm::mat4 lightSpaceMatrix = lightProjection * lightView;
```

This lightSpaceMatrix is the transformation matrix that we earlier denoted as $T$. With this lightSpaceMatrix, we can render the scene as usual as long as we give each shader the light-space equivalents of the projection and view matrices. However, we only care about depth values and not all the expensive fragment (lighting) calculations. To save performance we're going to use a different, but much simpler shader for rendering to the depth map.

这个 lightSpaceMatrix 就是我们之前用 $T$ 表示的变换矩阵。有了这个 lightSpaceMatrix，只要给每个着色器提供光源视角空间变换矩阵，我们就可以像往常一样渲染场景。不过，我们只关心深度值，而不是所有昂贵的片段（光照）计算。为了提升性能，我们将使用另一种更简单的着色器来渲染深度图。

### Render to depth map

When we render the scene from the light's perspective we'd much rather use a simple shader that only transforms the vertices to light space and not much more. For such a simple shader called simpleDepthShader we'll use the following vertex shader:

在从光源的视角渲染场景时，我们会使用一个比较简单的着色器，只将顶点转换到光源视角可见空间，而不做其他的事情。对于这样的简单着色器我们将其命名为 simpleDepthShader：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
} 
```

This vertex shader takes a per-object model, a vertex, and transforms all vertices to light space using lightSpaceMatrix.

这个顶点着色器接收每个物体对象的模型矩阵和一个顶点，并使用 lightSpaceMatrix 将所有顶点转换到光源视角可见空间。

Since we have no color buffer and disabled the draw and read buffers, the resulting fragments do not require any processing so we can simply use an empty fragment shader:

由于禁用了绘制和读取缓冲，我们就没有了颜色缓冲，所以生成的片段不需要任何处理，只需使用空的片段着色器即可：

```glsl
#version 330 core

void main()
{             
    // gl_FragDepth = gl_FragCoord.z;
}  
```

This empty fragment shader does no processing whatsoever, and at the end of its run the depth buffer is updated. We could explicitly set the depth by uncommenting its one line, but this is effectively what happens behind the scene anyways.

这个空的片段着色器什么都不做，运行结束时会更新深度缓冲区。我们可以通过取消注释那一行来显式地设置深度，无论哪种方式实际上都是幕后发生的事情。

Rendering the depth/shadow map now effectively becomes:

现在，渲染深度/阴影贴图实际上变成了：

```c++
simpleDepthShader.use();
glUniformMatrix4fv(lightSpaceMatrixLocation, 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));

glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glClear(GL_DEPTH_BUFFER_BIT);
    RenderScene(simpleDepthShader);
glBindFramebuffer(GL_FRAMEBUFFER, 0); 
```

Here the RenderScene function takes a shader program, calls all relevant drawing functions and sets the corresponding model matrices where necessary.

在这里，RenderScene 函数接收着色器程序，调用所有相关的绘图函数，并在必要时设置相应的模型矩阵。

The result is a nicely filled depth buffer holding the closest depth of each visible fragment from the light's perspective. By rendering this texture onto a 2D quad that fills the screen (similar to what we did in the post-processing section at the end of the [framebuffers](https://learnopengl.com/Advanced-OpenGL/Framebuffers) chapter) we get something like this:

最终生成了一个深度缓冲，其中保存了从光源视角看到的每个可见片段的深度值。通过将此纹理渲染到填充窗口屏幕的 2D 四边形上（类似于在[帧缓冲](https://learnopengl.com/Advanced-OpenGL/Framebuffers)章节末尾的后处理中，我们所做的工作），我们可以得到类似下面的结果：

![Depth Map](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-DepthMap.png)

For rendering the depth map onto a quad we used the following fragment shader:

为了将深度图渲染到四边形上，我们使用下面的片段着色器：

```glsl
#version 330 core
out vec4 FragColor;
  
in vec2 TexCoords;

uniform sampler2D depthMap;

void main()
{             
    float depthValue = texture(depthMap, TexCoords).r;
    FragColor = vec4(vec3(depthValue), 1.0);
}
```

Note that there are some subtle changes when displaying depth using a perspective projection matrix instead of an orthographic projection matrix as depth is non-linear when using perspective projection. At the end of this chapter we'll discuss some of these subtle differences.

请注意，因为相较于正交投影而言，透视投影变换后深度是非线性的，所以在使用透视投影生成深度贴图后，深度可视化会有一些微妙的变化。在本章结尾，我们将讨论其中的一些细微差别。

You can find the source code for rendering a scene to a depth map [here](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.1.shadow_mapping_depth).

您可以在[此处](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.1.shadow_mapping_depth)找到将场景渲染为深度图的源代码。

## Rendering shadows

With a properly generated depth map we can start rendering the actual shadows. The code to check if a fragment is in shadow is (quite obviously) executed in the fragment shader, but we do the light-space transformation in the vertex shader:

正确地生成深度图后，我们就可以开始渲染实际的阴影了。检查片段是否处于阴影中的代码（很明显）是在片段着色器中执行的，不过在此之前，我们还要在顶点着色器中把顶点从世界空间转换到光源视角下的可见空间：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

void main()
{    
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0));
    vs_out.Normal = transpose(inverse(mat3(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
}
```

What is new here is the extra output vector FragPosLightSpace. We take the same lightSpaceMatrix (used to transform vertices to light space in the depth map stage) and transform the world-space vertex position to light space for use in the fragment shader.

这里新添加了额外的输出向量 FragPosLightSpace。我们使用相同的 lightSpaceMatrix（在生成深度图阶段，这个矩阵也被用于将顶点转换到光源视角下的可见空间），将世界空间顶点位置转换到光源视角下的可见空间中去，供片段着色器使用。

The main fragment shader we'll use to render the scene uses the Blinn-Phong lighting model. Within the fragment shader we then calculate a shadow value that is either 1.0 when the fragment is in shadow or 0.0 when not in shadow. The resulting diffuse and specular components are then multiplied by this shadow component. Because shadows are rarely completely dark (due to light scattering) we leave the ambient component out of the shadow multiplications.

主片段着色器使用 Blinn-Phong 光照模型来渲染场景。然后，我们在片段着色器中计算 `shadow`，当它是 1.0 时，片段处于阴影当中；当它是 0.0 时，片段不处于阴影当中。最后将得到的漫反射和镜面反射分量乘以这个阴影部件。由于阴影很少是完全黑暗的（由于光散射），所以我们在执行阴影乘操作时把环境分量排除在外。

```glsl
#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} fs_in;

uniform sampler2D diffuseTexture;
uniform sampler2D shadowMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
}

void main()
{           
    vec3 color = texture(diffuseTexture, fs_in.TexCoords).rgb;
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightColor = vec3(1.0);
    // ambient
    vec3 ambient = 0.15 * lightColor;
    // diffuse
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // specular
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;    
    // calculate shadow
    float shadow = ShadowCalculation(fs_in.FragPosLightSpace);       
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;    
    
    FragColor = vec4(lighting, 1.0);
}
```

The fragment shader is largely a copy from what we used in the advanced lighting chapter, but with an added shadow calculation. We declared a function ShadowCalculation that does most of the shadow work. At the end of the fragment shader, we multiply the diffuse and specular contributions by the inverse of the shadow component e.g. how much the fragment is not in shadow. This fragment shader takes as extra input the light-space fragment position and the depth map generated from the first render pass.

片段着色器中很大一部分是从高级光照章节中我们使用过的着色器里复制而来，但增加了阴影计算。我们声明了一个函数 ShadowCalculation，它做了大部分阴影计算工作。在片段着色器的末尾，我们将漫反射和镜面反射对光照的贡献乘以 `1.0 - shadow`（这表示一个片段中有多少部分没有在阴影中）。这个片段着色器还需要两个额外输入，一个是光源视角下可见空间内的片段位置，另一个是第一个渲染通道中得到的深度图。

The first thing to do to check whether a fragment is in shadow, is transform the light-space fragment position in clip-space to normalized device coordinates. When we output a clip-space vertex position to gl_Position in the vertex shader, OpenGL automatically does a perspective divide e.g. transform clip-space coordinates in the range [-w,w] to [-1,1] by dividing the x, y and z component by the vector's w component. As the clip-space FragPosLightSpace is not passed to the fragment shader through gl_Position, we have to do this perspective divide ourselves:

要检查片段是否处于阴影当中，首先要做的是将光源视角裁剪空间中片段位置转换为归一化设备坐标。当我们将裁剪空间顶点位置输出到顶点着色器中的 gl_Position 时，OpenGL 会自动进行透视除，例如，通过将向量的 x、y 和 z 分量分别除以其 w 分量，可以将范围为 [-w, w] 的裁剪空间坐标转换到 [-1, 1] 。由于裁剪空间坐标 FragPosLightSpace 并未通过 gl_Position 传递给片段着色器，因此我们必须自己进行透视除：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    [...]
}
```

This returns the fragment's light-space position in the range [-1, 1].

这返回片段的光源视角归一化设备坐标位置，位于 [-1, 1] 范围之内。

> When using an orthographic projection matrix the w component of a vertex remains untouched so this step is actually quite meaningless. However, it is necessary when using perspective projection so keeping this line ensures it works with both projection matrices. <br> <br> 在使用正交投影矩阵时，顶点的 w 分量不会产生任何影响，因此这一步实际上毫无意义。不过，在使用透视投影时，这一步是必要的，因此保留这一行可确保在两种投影矩阵下都能正常工作。
{: .prompt-tip }

Because the depth from the depth map is in the range [0, 1] and we also want to use projCoords to sample from the depth map, we transform the NDC coordinates to the range [0, 1]:

由于深度图中的深度范围是 [0, 1]，并且我们要使用 projCoords 从深度图中采样，因此我们将其 NDC 坐标转换到 [0, 1] 范围：

```glsl
projCoords = projCoords * 0.5 + 0.5;
```

With these projected coordinates we can sample the depth map as the resulting [0, 1] coordinates from projCoords directly correspond to the transformed NDC coordinates from the first render pass. This gives us the closest depth from the light's point of view:

有了这个 [0, 1] 范围内的 projCoords，就可以对深度图进行采样。这样，我们就能获得光源视角下最近可见物体片段的深度：

```glsl
float closestDepth = texture(shadowMap, projCoords.xy).r; 
```

To get the current depth at this fragment we simply retrieve the projected vector's z coordinate which equals the depth of this fragment from the light's perspective.

要获得这个片段的当前深度，我们只需查询 projCoords 的 z 坐标，它等于从光源视角看向该片段时的深度。

```glsl
float currentDepth = projCoords.z; 
```

The actual comparison is then simply a check whether currentDepth is higher than closestDepth and if so, the fragment is in shadow:

目前的比较只是检查 currentDepth 是否大于 closestDepth，如果是，则片段处于阴影当中：

```glsl
float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;
```

The complete ShadowCalculation function then becomes:

完整的 ShadowCalculation 函数是下面这样：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, projCoords.xy).r; 
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;

    return shadow;
}  
```

Activating this shader, binding the proper textures, and activating the default projection and view matrices in the second render pass should give you a result similar to the image below:

应用这个着色器，绑定适当的纹理，并在第二个渲染通道中使用观察者的投影矩阵和视图矩阵，就可以得到类似下图的效果：

![Shadows](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-Shadows.png)

If you did things right you should indeed see (albeit with quite a few artifacts) shadows on the floor and the cubes. You can find the source code of the demo application [here](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.2.shadow_mapping_base).

如果操作得当，你应该可以看到地板和立方体上的阴影（尽管有不少伪影）。你可以在这里找到演示程序的[源代码](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.2.shadow_mapping_base)。

## Improving shadow maps

We managed to get the basics of shadow mapping working, but as you can we're not there yet due to several (clearly visible) artifacts related to shadow mapping we need to fix. We'll focus on fixing these artifacts in the next sections.

我们成功地完成了阴影贴图的基础工作，但正如你所看到的，因为存在着与阴影贴图相关的几个（清晰可见的）处理痕迹，所以现在还没有达到期望的效果。我们将在接下来的章节中重点修复这些瑕疵。

### Shadow acne

It is obvious something is wrong from the previous image. A closer zoom shows us a very obvious Moiré-like pattern:

从上一张图片中可以明显看出问题。近距离放大后，有非常显眼的摩尔纹：

![Acne](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-Acne.png)

We can see a large part of the floor quad rendered with obvious black lines in an alternating fashion. This shadow mapping artifact is called shadow acne and can be explained by the following image:

我们可以明显的在四边形地板上看到很大一部分交替呈现的黑色线条。这种阴影映射的人工处理痕迹被称为 "阴影失真"，可以用下面的图片来解释：

![Acne Diagram](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-AcneDiagram.png)

Because the shadow map is limited by resolution, multiple fragments can sample the same value from the depth map when they're relatively far away from the light source. The image shows the floor where each yellow tilted panel represents a single texel of the depth map. As you can see, several fragments sample the same depth sample.

因为阴影贴图有分辨率的限制，在距离光源比较远的情况下，多个片段可能从深度图的同一个坐标位置采样。上图中每个黄色斜坡代表深度图的一个像素。可以看到，地板上多个片段采样了相同的深度样本。

While this is generally okay, it becomes an issue when the light source looks at an angle towards the surface as in that case the depth map is also rendered from an angle. Several fragments then access the same tilted depth texel while some are above and some below the floor; we get a shadow discrepancy. Because of this, some fragments are considered to be in shadow and some are not, giving the striped pattern from the image.

虽然一般情况下是正常的，但当光源以一定角度照射表面时就会出现问题，因为在这种情况下，光源视角下的深度图也是从这个角度渲染的。这时，深度贴图的分辨率会小于场景实际分辨率，多个片段就会从同一个斜坡的深度纹理像素中采样，这些片段中有一些大于这一深度值，还有一些小于这一深度值。因此，一些片段被判断处于阴影中，而另一些片段则不在阴影中，这就产生了图片中的条纹图案，得到了一个不真实的阴影。

We can solve this issue with a small little hack called a **shadow bias** where we simply offset the depth of the surface (or the shadow map) by a small bias amount such that the fragments are not incorrectly considered above the surface.

我们可以用一个叫做**阴影偏置**的小技巧来解决这个问题，只需将表面的深度偏移一个小的偏置量（给表面片段的深度减去一个偏置，或给采样到的阴影贴图深度加上一个偏置），这样就不会错误地将片段判断在阴影之中。

![Acne Bias](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-AcneBias.png)

With the bias applied, all the samples get a depth smaller than the surface's depth and thus the entire surface is correctly lit without any shadows. We can implement such a bias as follows:

应用偏置后，对应到同一深度纹理像素的那些表面片段其深度都会小于采样到的深度值，因此整个表面都会被正确照亮，不会出现任何阴影失真。我们可以通过以下方式实现这种偏置：

```glsl
float bias = 0.005;
float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0; 
```

A shadow bias of 0.005 solves the issues of our scene by a large extent, but you can imagine the bias value is highly dependent on the angle between the light source and the surface. If the surface would have a steep angle to the light source, the shadows may still display shadow acne. A more solid approach would be to change the amount of bias based on the surface angle towards the light: something we can solve with the dot product:

0.005 的阴影偏置量在很大程度上解决了我们场景中的问题，但可以想象到偏置量主要取决于光线和表面之间的角度。如果光线以非常倾斜的角度照射到表面，那么仍然可能会出现阴影失真。一种更可靠的方法是根据表面与光线的角度来改变偏置量：我们可以利用点积来解决这个问题：

```glsl
float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005); 
```

Here we have a maximum bias of 0.05 and a minimum of 0.005 based on the surface's normal and light direction. This way, surfaces like the floor that are almost perpendicular to the light source get a small bias, while surfaces like the cube's side-faces get a much larger bias. The following image shows the same scene but now with a shadow bias:

在这里，我们根据表面的法线和光照方向，将偏置最大值设定为 0.05，最小值设定为 0.005。这样，像地板这种几乎垂直于光线的表面就会得到较小的偏置，而像立方体侧面这样的表面就会得到较大的偏置。下图显示了应用阴影偏置后的相同场景：

![With Bias](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithBias.png)

Choosing the correct bias value(s) requires some tweaking as this will be different for each scene, but most of the time it's simply a matter of slowly incrementing the bias until all acne is removed.

因为每个场景都不尽相同，所以需要进行一些调整才能选出合适的偏置值，在大多数情况下，可以缓慢增加偏置值，直到消除所有失真现象。

### Peter panning

A disadvantage of using a shadow bias is that you're applying an offset to the actual depth of objects. As a result, the bias may become large enough to see a visible offset of shadows compared to the actual object locations as you can see below (with an exaggerated bias value):

使用阴影偏置的一个缺点是：在实际应该要产生阴影的位置上，因为有偏置的存在，可能导致该位置点被判断为非阴影点。因此，当偏置值变得足够大时，参照物体实际位置，可以明显看到阴影发生了一定的偏移，如下图所示（使用一个夸张的偏置值）：

![Peter Panning](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-PeterPanning.png)

This shadow artifact is called peter panning since objects seem slightly detached from their shadows. We can use a little trick to solve most of the peter panning issue by using front face culling when rendering the depth map. You may remember from the [face culling](https://learnopengl.com/Advanced-OpenGL/Face-Culling) chapter that OpenGL by default culls back-faces. By telling OpenGL we want to cull front faces during the shadow map stage we're switching that order around.

这种阴影位置偏移现象被称为彼得平移，因为物体看起来与它们的阴影稍有分离。我们可以使用一个小技巧来解决大部分的彼得平移问题，那就是在渲染深度图时使用正面剔除。你可能还记得，在[面剔除](https://learnopengl.com/Advanced-OpenGL/Face-Culling)一章中，OpenGL 默认剔除的是背面。通过在生成阴影贴图的阶段告诉 OpenGL 剔除正面，我们就可以切换这一面剔除指令。

Because we only need depth values for the depth map it shouldn't matter for solid objects whether we take the depth of their front faces or their back faces. Using their back face depths doesn't give wrong results as it doesn't matter if we have shadows inside objects; we can't see there anyways.

因为我们只需要深度图的深度值，所以对于实体物体来说，是取其正面的深度还是背面的深度并不重要。使用物体背面的深度并不会产生错误的结果，因为物体内部是否有阴影并不重要，反正我们也看不到。

![Without Culling](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithoutCulling.png)
_depths recorded in depth map at the light's perspective without front face culling_

![With Culling](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithCulling.png)
_depths recorded in depth map at the light's perspective with front face culling_

To fix peter panning we cull all front faces during the shadow map generation. Note that you need to enable GL_CULL_FACE first.

为了解决彼得平移问题，我们会在生成阴影贴图时剔除所有正面。请注意，你需要先启用 GL_CULL_FACE。

```glsl
glCullFace(GL_FRONT);
RenderSceneToDepthMap();
glCullFace(GL_BACK); // don't forget to reset original culling face
```

This effectively solves the peter panning issues, but only for solid objects that actually have an inside without openings. In our scene for example, this works perfectly fine on the cubes. However, on the floor it won't work as well as culling the front face completely removes the floor from the equation. The floor is a single plane and would thus be completely culled. If one wants to solve peter panning with this trick, care has to be taken to only cull the front faces of objects where it makes sense.

这可以有效解决彼得平移问题，但只适用于拥有封闭内部的实体物体。例如，在我们的场景中，这对立方体完全有效。但是，在地板上就不行了，因为剔除正面后，地板就完全不存在了。地板是一个平面，因此会被完全删除。如果想用这一技巧解决彼得平移问题，就必须注意只在有意义的地方去使用正面剔除。

> 阴影偏置解决了阴影失真问题，但过大的偏置值会带来彼得平移。选择正面剔除的方案也可以解决阴影失真问题，同时还不会有阴影偏置那样的彼得平移，但就是只对拥有封闭内部的实体物体有效。
{: .prompt-tip }

Another consideration is that objects that are close to the shadow receiver (like the distant cube) may still give incorrect results. However, with normal bias values you can generally avoid peter panning.

当然，如果使用恰当的偏置值，一般可以避免彼得平移。另一个要考虑的点是，靠近阴影接收器的物体（如远处的立方体）可能仍然会产生不正确的结果。

### Over sampling

Another visual discrepancy which you may like or dislike is that regions outside the light's visible frustum are considered to be in shadow while they're (usually) not. This happens because projected coordinates outside the light's frustum are higher than 1.0 and will thus sample the depth texture outside its default range of [0,1]. Based on the texture's wrapping method, we will get incorrect depth results not based on the real depth values from the light source.

另一个与现实情况不一致的视觉差异是，光源可见视锥体以外的区域被看作位于阴影当中，但实际上它们（通常）并不是。出现这种问题的原因是，光源视锥体之外的投影坐标大于 1.0，使用这样的坐标去采样深度纹理，会超出其默认的 [0, 1] 范围。根据纹理的环绕方式，我们会得到不正确的深度结果，而不是基于光源的真实深度值。

![Outside Frustum](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-OutsideFrustum.png)

You can see in the image that there is some sort of imaginary region of light, and a large part outside this area is in shadow; this area represents the size of the depth map projected onto the floor. The reason this happens is that we earlier set the depth map's wrapping options to GL_REPEAT.

从图像中可以看到，光照照亮了一个区域，而该区域外的很大一部分处于阴影中；该区域代表了投射到地板上的深度图的大小。出现这种情况的原因是我们之前将深度图的环绕方式设置为了 GL_REPEAT。

What we'd rather have is that all coordinates outside the depth map's range have a depth of 1.0 which as a result means these coordinates will never be in shadow (as no object will have a depth larger than 1.0). We can do this by configuring a texture border color and set the depth map's texture wrap options to GL_CLAMP_TO_BORDER:

我们更希望深度图范围之外的所有坐标的深度都是 1.0，这意味着这些坐标永远不会出现在阴影中（因为没有物体的深度会大于 1.0）。我们可以通过配置纹理边框颜色并将深度图的纹理环绕方式设置为 GL_CLAMP_TO_BORDER 来实现这一点：

```c++
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);
float borderColor[] = { 1.0f, 1.0f, 1.0f, 1.0f };
glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);
```

Now whenever we sample outside the depth map's [0,1] coordinate range, the texture function will always return a depth of 1.0, producing a shadow value of 0.0. The result now looks more plausible:

现在，每当我们在深度图的 [0, 1] 坐标范围外采样时，纹理采样函数将始终返回 1.0 的深度，从而产生 0.0 的阴影值。现在的结果看起来更合理了：

![Clamp Edge](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-ClampEdge.png)

> 在计算片段是否是阴影点时，若该片段是以光源为视角的视图体范围之外的场景片段，那么其在光源视图体内裁剪坐标是超出 [-w, w] 范围之外的（正射视图 w = 1.0），从光源视角的场景深度图采样深度值的时候，裁剪坐标转换到纹理坐标会超出 [0.0, 1.0] 范围之外，超出纹理范围之外 OpenGL 默认的行为是重复这个纹理图像进行采样，光源视图体区域外就会有一些地方显示阴影不正确的情况。其实在以光源为视角的视图体范围之外的片段应该处理为非阴影点，所以我们更希望所有超出深度图范围的坐标的采样返回值是 1.0，因此可以设置纹理边框颜色 z 分量为 1.0，并设置纹理环绕方式为超出坐标为用户指定的边缘颜色 GL_CLAMP_TO_BORDER。这一步限制的是采样深度图后返回的深度值。
{: .prompt-tip }

There seems to still be one part showing a dark region. Those are the coordinates outside the far plane of the light's orthographic frustum. You can see that this dark region always occurs at the far end of the light source's frustum by looking at the shadow directions.

似乎仍有一部分显示为黑暗区域。这些是光源正交视锥体远平面外的坐标。通过阴影方向可以看到，这个黑暗区域总是出现在光源视锥体的远端。

A light-space projected fragment coordinate is further than the light's far plane when its z coordinate is larger than 1.0. In that case the GL_CLAMP_TO_BORDER wrapping method doesn't work anymore as we compare the coordinate's z component with the depth map values; this always returns true for z larger than 1.0.

当片段被投影到光源空间后，如果它的坐标的 z 分量大于 1.0，该坐标会比光源视锥体的远平面更远。在这种情况下，GL_CLAMP_TO_BORDER 环绕方式将不再起作用，因为我们要将坐标的 z 分量与深度图中的深度值进行比较；对于大于 1.0 的 z ，返回值总是 true。

The fix for this is also relatively easy as we simply force the shadow value to 0.0 whenever the projected vector's z coordinate is larger than 1.0:

解决这个问题的方法也比较简单，只要投影向量的 z 坐标大于 1.0，我们就可以将阴影值强制设置为 0.0：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
    if(projCoords.z > 1.0)
        shadow = 0.0;
    
    return shadow;
}  
```

Checking the far plane and clamping the depth map to a manually specified border color solves the over-sampling of the depth map. This finally gives us the result we are looking for:

检查远平面并将深度图限制到手动指定的边界颜色，可以解决深度图过度采样的问题。最终，我们得到了想要的结果：

![OverSampling Fixed](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-OverSamplingFixed.png)

The result of all this does mean that we only have shadows where the projected fragment coordinates sit inside the depth map range so anything outside the light frustum will have no visible shadows.

这样做的结果是，只有当投影片段坐标位于深度图范围内时，我们才会产生阴影，因此在光源视锥体范围之外的任何东西都不会产生可见的阴影。

> 在计算片段是否是阴影点时，若该片段是以光源为视角的视图体范围之外的场景片段，那么其在光源视图体内裁剪坐标是超出 [-w, w] 范围之外的（正射视图 w = 1.0），归一化深度值也是大于 1.0 的。其实在以光源为视角的视图体范围之外的片段应该处理为非阴影点，所以我们在光源视图体内片段的裁剪坐标深度值大于 w.0 时直接认定为非阴影点。这一步限制的是片段在光源视图体内深度值。
{: .prompt-tip }

## Soft Shadow Map

### PCF

The shadows right now are a nice addition to the scenery, but it's still not exactly what we want. If you were to zoom in on the shadows the resolution dependency of shadow mapping quickly becomes apparent.

现在的阴影为场景增色不少，但仍然不是我们想要的效果。如果拉近看向阴影边缘，阴影映射对于深度图分辨率的依赖性很快就会显现出来。

![Look At Shadow Edge](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-LookAtShadowEdge.png)

Because the depth map has a fixed resolution, the depth frequently usually spans more than one fragment per texel. As a result, multiple fragments sample the same depth value from the depth map and come to the same shadow conclusions, which produces these jagged blocky edges.

由于深度图的分辨率是固定的，因此在渲染场景做片段是否处于阴影判断时，深度图中每个像素上存储的深度值通常会被多个片段请求采样。这样的话，多个片段在阴影判断中会从深度图采样到相同的深度值，并得出相同的阴影结论，从而产生锯齿状的块状边缘。

You can reduce these blocky shadows by increasing the depth map resolution, or by trying to fit the light frustum as closely to the scene as possible.

你可以通过提高深度图的分辨率，或尽量选取适合场景的光源视锥体来减少这些块状阴影。

Another (partial) solution to these jagged edges is called PCF, or percentage-closer filtering, which is a term that hosts many different filtering functions that produce softer shadows, making them appear less blocky or hard. The idea is to sample more than once from the depth map, each time with slightly different texture coordinates. For each individual sample we check whether it is in shadow or not. All the sub-results are then combined and averaged and we get a nice soft looking shadow.

另一种消除这些锯齿状边缘的（部分）方法是 PCF(percentage-closer filtering)，它有许多包含不同滤波函数的变体，可以生成更柔和的（看起来不那么块状的或硬的）阴影。其原理是在深度图中目标像素周围多次采样。对于采样到的每个样本值，我们都用它来检查片段是否处于阴影当中。然后将所有的子结果相加并求取平均值，就能得到看起来很柔和的阴影。

One simple implementation of PCF is to simply sample the surrounding texels of the depth map and average the results:

PCF 的一个简单实现方法是对深度图中目标像素周围的像素进行简单采样，然后对基于这些采样值的阴影判断结果求和并取平均值：

```glsl
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
for(int x = -1; x <= 1; ++x)
{
    for(int y = -1; y <= 1; ++y)
    {
        float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r; 
        shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;        
    }    
}
shadow /= 9.0;
```
Here textureSize returns a vec2 of the width and height of the given sampler texture at mipmap level 0. 1 divided over this returns the size of a single texel that we use to offset the texture coordinates, making sure each new sample samples a different depth value. Here we sample 9 values around the projected coordinate's x and y value, test for shadow occlusion, and finally average the results by the total number of samples taken.

`textureSize` 函数返回给定的采样器纹理在 mipmap 级别为 0 时的宽度和高度，数据类型为 vec2。将 1 除以 `textureSize` 函数的返回值可以获得单个纹素的大小，我们用它来偏移纹理坐标，确保每次新的采样都能获取到差异化的深度值。上述代码中，我们在值为 x 和 y 的投影坐标周围取了 9 个采样点，测试其对片段的遮挡情况，最后根据采样总数对遮挡累加结果求取平均值。

By using more samples and/or varying the texelSize variable you can increase the quality of the soft shadows. Below you can see the shadows with simple PCF applied:

通过使用更多的样本和/或改变 texelSize 变量，可以提高阴影柔和的质量。下面是应用了简单 PCF 的阴影效果：

![PCF Soft Shadow Map](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-PCFSoftShadowMap.png)

From a distance the shadows look a lot better and less hard. If you zoom in you can still see the resolution artifacts of shadow mapping, but in general this gives good results for most applications.

从远处看，阴影效果变得更好了，也不那么生硬了。但如果拉近，你仍然是可以看到阴影映射的分辨率伪影的，不过，这种效果对大多数应用来说已经算是比较好的了。

You can find the complete source code of the example [here](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.3.shadow_mapping).

你可以在[这里](https://github.com/tick-engineloop/LearnOpenGL/tree/master/src/5.advanced_lighting/3.1.3.shadow_mapping)找到该示例的完整源代码。

There is actually much more to PCF and quite a few techniques to considerably improve the quality of soft shadows, but for the sake of this chapter's length we'll leave that for a later discussion.

实际上，PCF 还有很多内容，而且有很多技术可以大大提高软阴影的质量，但由于本章篇幅有限，我们将留待以后讨论。