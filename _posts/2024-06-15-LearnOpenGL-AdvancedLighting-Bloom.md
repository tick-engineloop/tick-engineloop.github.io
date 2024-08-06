---
title: Bloom
description: 泛光（Bloom）是一种常用的渲染技术，用于给光源加上辉光效果，在视觉上增强光源的亮度。
date: 2024-06-15 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess, bloom]     # TAG names should always be lowercase
math: true
---

## Introduction

Bright light sources and brightly lit regions are often difficult to convey to the viewer as the intensity range of a monitor is limited. One way to distinguish bright light sources on a monitor is by making them glow; the light then bleeds around the light source. This effectively gives the viewer the illusion these light sources or bright regions are intensely bright.

由于显示器的强度范围有限，明亮的光源和被照亮的明亮区域通常很难表达给观众。在显示器上区分明亮光源的一种方法是让它们发光，然后让光源周围的光渗出。这能有效地让观众产生这些光源或明亮区域非常明亮的错觉。

This light bleeding, or glow effect, is achieved with a post-processing effect called Bloom. Bloom gives all brightly lit regions of a scene a glow-like effect. An example of a scene with and without glow can be seen below (image courtesy of Epic Games):

这种光渗或发光效果是通过一种名为“泛光”的后期处理效果实现的。泛光可为场景中所有亮光区域提供类似发光的效果。下面是一个有泛光和没有泛光的场景示例（图片由 Epic Games 提供）：

![Bloom Example](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-Examples.png) 

Bloom gives noticeable visual cues about the brightness of objects. When done in a subtle fashion (which some games drastically fail to do) Bloom significantly boosts the lighting of your scene and allows for a large range of dramatic effects.

泛光可为物体亮度提供明显的视觉提示。当以一种微妙的方式进行时（有些游戏完全做不到这一点），泛光会大大增强场景的光照效果，从而生成一种大范围戏剧性的效果。

Bloom works best in combination with HDR rendering. To implement Bloom, we render a lit scene as usual and extract both the scene's HDR color buffer and an image of the scene with only its bright regions visible. This extracted brightness image is then blurred and the result added on top of the original HDR scene image.

泛光通常和 HDR 结合使用。为了实现泛光，我们会像往常一样渲染一个光照场景，提取出场景的 HDR 颜色缓冲和仅有明亮区域可见的场景图像。然后对提取的亮光图像进行模糊处理，并将结果添加到原始 HDR 场景图像之上。

Let's illustrate this process in a step by step fashion. We render a scene filled with 4 bright light sources, visualized as colored cubes. The colored light cubes have a brightness values between 1.5 and 15.0. If we were to render this to an HDR color buffer the scene looks as follows:

让我们来逐步说明这一过程。我们在场景中渲染 4 个明亮的彩色立方体光源。彩色立方体的亮度值在 1.5 和 15.0 之间。如果我们将其渲染到 HDR 颜色缓冲区，场景看起来是下面这样：

![HDR](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-HDR.png)

We take this HDR color buffer texture and extract all the fragments that exceed a certain brightness. This gives us an image that only show the bright colored regions as their fragment intensities exceeded a certain threshold:

我们利用 HDR 颜色缓冲纹理，提取所有亮度超过一定值的片段。这样得到的图像只显示亮光区域，因为它们的片段强度超过了一定的阈值：

![Extracted Bright Regions](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-ExtractedBrightRegions.png)

We then take this thresholded brightness texture and blur the result. The strength of the bloom effect is largely determined by the range and strength of the blur filter used.

然后，我们将这个超过一定亮度阈值的亮光纹理进行模糊处理。泛光效果的强度主要取决于所使用的模糊滤波器的范围和强度。

![Blurred Bright Regions](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-BlurredBrightRegions.png)

The resulting blurred texture is what we use to get the glow or light-bleeding effect. This blurred texture is added on top of the original HDR scene texture. Because the bright regions are extended in both width and height due to the blur filter, the bright regions of the scene appear to glow or bleed light.

产生的模糊纹理被添加到原始 HDR 场景纹理上之后，就形成了发光或渗光效果。由于模糊滤波器的作用，亮光区域的宽度和高度都得到了延伸，因此场景中的亮光区域看起来会发光或渗光。

![Combined HDR With Blurred Bright](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-CombinedHDRWithBlurredBright.png)

Bloom by itself isn't a complicated technique, but difficult to get exactly right. Most of its visual quality is determined by the quality and type of blur filter used for blurring the extracted brightness regions. Simply tweaking the blur filter can drastically change the quality of the Bloom effect.

泛光本身并不是一项复杂的技术，但却很难做到精准。它的视觉效果主要取决于，在对提取的亮光区域进行模糊时，所选择的模糊滤波器的质量和类型。只需调整模糊滤波器，就能大大改变泛光效果的质量。

Following these steps gives us the Bloom post-processing effect. The next image briefly summarizes the required steps for implementing Bloom:

按照这些步骤，我们就能得到泛光后期处理效果。下图简要总结了实现泛光所需的步骤：

![Bloom Steps](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-BloomSteps.png)

The first step requires us to extract all the bright colors of a scene based on some threshold. Let's first delve into that.

第一步要求我们根据某个阈值提取场景中的所有亮色。让我们先深入探讨一下这个问题。

## Extracting bright color

The first step requires us to extract two images from a rendered scene. We could render the scene twice, both rendering to a different framebuffer with different shaders, but we can also use a neat little trick called Multiple Render Targets (MRT) that allows us to specify more than one fragment shader output; this gives us the option to extract the first two images in a single render pass. By specifying a layout location specifier before a fragment shader's output we can control to which color buffer a fragment shader writes to:

第一步要求我们从渲染的场景中提取两幅图像。我们可以对场景进行两次渲染，两次渲染都使用不同的着色器渲染到不同的帧缓冲区，但我们也可以使用一个名为 "多重渲染目标"（Multiple Render Targets，MRT）的小技巧，它允许我们指定多个片段着色器输出；这样我们就可以在一次渲染中提取前两幅图像。通过在片段着色器输出前指定布局位置指定符，我们可以控制片段着色器写入哪个颜色缓冲区：

```glsl
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;
```

This only works if we actually have multiple buffers to write to. As a requirement for using multiple fragment shader outputs we need multiple color buffers attached to the currently bound framebuffer object. You may remember from the framebuffers chapter that we can specify a color attachment number when linking a texture as a framebuffer's color buffer. Up until now we've always used GL_COLOR_ATTACHMENT0, but by also using GL_COLOR_ATTACHMENT1 we can have two color buffers attached to a framebuffer object:

这只有在我们确实有多个缓冲区要写入时才能起作用。作为使用多个片段着色器输出的要求，我们需要将多个颜色缓冲区连接到当前绑定的帧缓冲区对象。大家可能还记得，在帧缓冲器一章中，我们可以在将纹理链接为帧缓冲器的颜色缓冲区时指定一个颜色附件编号。到目前为止，我们一直使用 GL_COLOR_ATTACHMENT0，但通过同时使用 GL_COLOR_ATTACHMENT1，我们可以在一个帧缓冲器对象上附加两个颜色缓冲器：

```c++
// set up floating point framebuffer to render scene to
unsigned int hdrFBO;
glGenFramebuffers(1, &hdrFBO);
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
unsigned int colorBuffers[2];
glGenTextures(2, colorBuffers);
for (unsigned int i = 0; i < 2; i++)
{
    glBindTexture(GL_TEXTURE_2D, colorBuffers[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    // attach texture to framebuffer
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + i, GL_TEXTURE_2D, colorBuffers[i], 0
    );
} 
```

We do have to explicitly tell OpenGL we're rendering to multiple colorbuffers via glDrawBuffers. OpenGL, by default, only renders to a framebuffer's first color attachment, ignoring all others. We can do this by passing an array of color attachment enums that we'd like to render to in subsequent operations:

我们必须通过 glDrawBuffers 明确告诉 OpenGL 我们要渲染到多个色彩缓冲区。默认情况下，OpenGL 只渲染帧缓冲的第一个颜色附件，而忽略其他所有附件。我们可以通过传递一个色彩附件枚举数组来实现这一点，我们希望在后续操作中渲染这些色彩附件：

```c++
unsigned int attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);
```

When rendering into this framebuffer, whenever a fragment shader uses the layout location specifier, the respective color buffer is used to render the fragment to. This is great as this saves us an extra render pass for extracting bright regions as we can now directly extract them from the to-be-rendered fragment:

在渲染到该帧缓冲区时，只要片段着色器使用布局位置指定符，就会使用相应的颜色缓冲区来渲染片段。这样做非常好，因为我们现在可以直接从将要渲染的片段中提取亮色区域，从而节省了提取亮色区域的额外渲染过程：

```glsl
#version 330 core
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;

[...]

void main()
{            
    [...] // first do normal lighting calculations and output results
    FragColor = vec4(lighting, 1.0);
    // check whether fragment output is higher than threshold, if so output as brightness color
    float brightness = dot(FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 1.0)
        BrightColor = vec4(FragColor.rgb, 1.0);
    else
        BrightColor = vec4(0.0, 0.0, 0.0, 1.0);
}
```

Here we first calculate lighting as normal and pass it to the first fragment shader's output variable FragColor. Then we use what is currently stored in FragColor to determine if its brightness exceeds a certain threshold. We calculate the brightness of a fragment by properly transforming it to grayscale first (by taking the dot product of both vectors we effectively multiply each individual component of both vectors and add the results together). If the brightness exceeds a certain threshold, we output the color to the second color buffer. We do the same for the light cubes.

在这里，我们首先按照正常方法计算光照，并将其传递给第一个片段着色器的输出变量 FragColor。然后，我们使用 FragColor 中当前存储的内容来确定其亮度是否超过某个阈值。我们首先将片段适当转换为灰度，计算出片段的亮度（通过两个向量的点乘，我们实际上是将两个向量的每个分量相乘，然后将结果相加）。如果亮度超过某个阈值，我们就会将颜色输出到第二个颜色缓冲区。我们对光立方体也是这样做的。

Luminance is a single scalar value which measures how bright we view something. Converting a linear RGB triple to a luminance value is easy:

亮度是一个单一的标量值，它衡量我们看到某物的亮度。将线性 RGB 三元组转换为亮度值非常简单：

$$
L = 0.2126R + 0.7152G + 0.0722B
$$

This also shows why Bloom works incredibly well with HDR rendering. Because we render in high dynamic range, color values can exceed 1.0 which allows us to specify a brightness threshold outside the default range, giving us much more control over what is considered bright. Without HDR we'd have to set the threshold lower than 1.0, which is still possible, but regions are much quicker considered bright. This sometimes leads to the glow effect becoming too dominant (think of white glowing snow for example).

这也说明了 Bloom 为何能与 HDR 渲染完美结合。因为我们在高动态范围内进行渲染，色彩值可以超过 1.0，这就允许我们在默认范围之外指定一个亮度阈值，从而让我们能够更有效地控制亮度。如果没有 HDR，我们就必须将阈值设置得低于 1.0，这仍然是可能的，但区域会更快地被认为是明亮的。这有时会导致光晕效果变得过于明显（例如白色发光的雪）。

With these two color buffers we have an image of the scene as normal, and an image of the extracted bright regions; all generated in a single render pass.

有了这两个颜色缓冲区，我们就有了一张正常场景的图像，以及一张提取的明亮区域的图像；所有这些都是在一次渲染中生成的。

![Attachments](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-Attachments.png)

With an image of the extracted bright regions we now need to blur the image. We can do this with a simple box filter as we've done in the post-processing section of the framebufers chapter, but we'd rather use a more advanced (and better-looking) blur filter called Gaussian blur.

有了提取的亮区图像，我们现在需要对图像进行模糊处理。我们可以使用一个简单的方框滤镜，就像我们在帧模糊器章节的后期处理部分所做的那样，但我们更愿意使用一种更高级（也更美观）的模糊滤镜，即高斯模糊。