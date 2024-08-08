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

第一步要求我们从渲染的场景中提取两幅图像。我们可以渲染两遍场景，每遍使用不同的着色器渲染到不同的帧缓冲，也可以使用一个名为 "多重渲染目标"（Multiple Render Targets，MRT）的小技巧，它允许我们指定多个片段着色器输出，这样我们就可以在单个渲染通道中提取出前述的两幅图像。通过在片段着色器输出变量前指定布局位置限定符，我们可以控制片段着色器写入哪个颜色缓冲区：

```glsl
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;
```

This only works if we actually have multiple buffers to write to. As a requirement for using multiple fragment shader outputs we need multiple color buffers attached to the currently bound framebuffer object. You may remember from the framebuffers chapter that we can specify a color attachment number when linking a texture as a framebuffer's color buffer. Up until now we've always used GL_COLOR_ATTACHMENT0, but by also using GL_COLOR_ATTACHMENT1 we can have two color buffers attached to a framebuffer object:

这只有在我们确实有多个缓冲区要写入时才能起作用。使用多个片段着色器输出的一个必要条件是，我们已将多个颜色缓冲链接到了当前绑定的帧缓冲对象上。大家可能还记得，在帧缓冲一章中，我们在将纹理链接为帧缓冲的颜色缓冲时可以指定一个颜色附件编号。到目前为止，我们一直使用 GL_COLOR_ATTACHMENT0，但通过同时使用 GL_COLOR_ATTACHMENT1，我们可以在一个帧缓冲对象上附加两个颜色缓冲：

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

必须通过 glDrawBuffers 明确告诉 OpenGL 我们要渲染到多个颜色缓冲区。默认情况下，OpenGL 只渲染到帧缓冲的第一个颜色附件，而忽略其他所有颜色附件。我们可以通过传递一个颜色附件枚举数组来告诉 OpenGL，我们希望在后续操作中渲染这些颜色附件：

```c++
unsigned int attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);
```

When rendering into this framebuffer, whenever a fragment shader uses the layout location specifier, the respective color buffer is used to render the fragment to. This is great as this saves us an extra render pass for extracting bright regions as we can now directly extract them from the to-be-rendered fragment:

在渲染到这个帧缓冲区时，只要片段着色器使用了布局位置限定符，片段就会被渲染到帧缓冲相应的颜色缓冲区中去。这样非常棒，因为现在我们可以在平常的渲染通道中，直接在片段着色器里分辨出亮光和非亮光区域的片段，将其颜色值修改后输出到相应的颜色缓冲中，从而省去了使用额外的渲染通道提取它们的步骤：

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

Here we first calculate lighting as normal and pass it to the first fragment shader's output variable FragColor. Then we use what is currently stored in FragColor to determine if its brightness exceeds a certain threshold. We calculate the brightness of a fragment by properly transforming it to grayscale first (by taking the dot product of both vectors we effectively multiply each individual component of both vectors and add the results together). Luminance is a single scalar value which measures how bright we view something. Converting a linear RGB triple to a luminance value is easy:

这里我们首先按照通常的方法计算光照，并将其传递给片段着色器的第一个输出变量 FragColor。然后，我们使用 FragColor 中存储的当前片段颜色值来确定其亮度是否超过某个阈值。先将片段颜色值进行适当转换使其变为灰度，从而计算出片段的亮度（通过两个向量的点乘，实际上是将两个向量的每个分量相乘，然后将结果相加）。亮度是一个单一的标量值，它衡量我们看到物体的明亮程度。将线性 RGB 三元组转换为亮度值非常简单，有多种方式，下面是其中一种计算方法：

$$
L = 0.2126R + 0.7152G + 0.0722B
$$

If the brightness exceeds a certain threshold, we output the color to the second color buffer. We do the same for the light cubes.

如果亮度超过某个阈值，我们就会将颜色值输出到第二个颜色缓冲区，否则输出黑色或不做处理。我们对光立方体也是这样做的。

This also shows why Bloom works incredibly well with HDR rendering. Because we render in high dynamic range, color values can exceed 1.0 which allows us to specify a brightness threshold outside the default range, giving us much more control over what is considered bright. Without HDR we'd have to set the threshold lower than 1.0, which is still possible, but regions are much quicker considered bright. This sometimes leads to the glow effect becoming too dominant (think of white glowing snow for example).

这也说明了 Bloom 为何能与 HDR 渲染完美结合。因为我们在高动态范围内进行渲染的话，颜色值可以超过 1.0，这就允许我们在默认范围之外指定一个亮度阈值，从而让我们能够在判断哪些地方是明亮的上面有更多的控制权。如果没有 HDR，我们就必须将阈值设置得低于 1.0，这仍然是可能的，但目标区域会更容易被认为是明亮的。这有时会导致光晕效果变得过于明显（例如白色发光的雪）。

With these two color buffers we have an image of the scene as normal, and an image of the extracted bright regions; all generated in a single render pass.

有了这两个颜色缓冲区，我们就有了一张正常场景的图像，以及一张提取的亮光区域的图像；所有这些都是在一次渲染中生成的。

![Attachments](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-Attachments.png)

With an image of the extracted bright regions we now need to blur the image. We can do this with a simple box filter as we've done in the post-processing section of the framebufers chapter, but we'd rather use a more advanced (and better-looking) blur filter called Gaussian blur.

有了提取的亮光区域图像，我们现在需要对图像进行模糊处理。就像在帧缓冲章节的后期处理部分所做的那样，我们可以使用一个简单的箱式滤波器，但我们更愿意使用一种更高级（也更美观）的模糊滤波器，即高斯模糊。

## Gaussian blur

In the post-processing chapter's blur we took the average of all surrounding pixels of an image. While it does give us an easy blur, it doesn't give the best results. A Gaussian blur is based on the Gaussian curve which is commonly described as a bell-shaped curve giving high values close to its center that gradually wear off over distance. The Gaussian curve can be mathematically represented in different forms, but generally has the following shape:

在后处理一章的模糊处理中，我们取的是图像周围所有像素的平均值。虽然这样做很容易实现模糊，但效果并不理想。高斯模糊是以高斯曲线为基础的，高斯曲线通常被描述为一条钟形曲线，其中心附近的数值较高，随着向两边距离的增加，数值逐渐减小。高斯曲线可以用不同的数学形式表示，但一般具有以下形状：

![Gaussian](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-Gaussian.png)

As the Gaussian curve has a larger area close to its center, using its values as weights to blur an image give more natural results as samples close by have a higher precedence. If we for instance sample a 32x32 box around a fragment, we use progressively smaller weights the larger the distance to the fragment; this gives a better and more realistic blur which is known as a Gaussian blur.

由于高斯曲线靠近中心区域的值较大，使用其值作为权重来模糊图像的效果会更加自然，因为靠近中心的样本具有更高的优先级。例如，如果我们在片段周围采样一个 32x32 的方框，与片段的距离越远，权重就越小；这样就能获得更好、更逼真的模糊效果，这就是所谓的高斯模糊。

To implement a Gaussian blur filter we'd need a two-dimensional box of weights that we can obtain from a 2 dimensional Gaussian curve equation. The problem with this approach however is that it quickly becomes extremely heavy on performance. Take a blur kernel of 32 by 32 for example, this would require us to sample a texture a total of 1024 times for each fragment!

要实现高斯模糊滤波器，我们需要一个二维的权重框，我们可以从二维高斯曲线方程中获得权重。但这种方法的问题在于，随着权重框增大它的性能会变得极差。以 32 x 32 的模糊核为例，对于每个片段这就要求我们总共采样 1024 次纹理！

Luckily for us, the Gaussian equation has a very neat property that allows us to separate the two-dimensional equation into two smaller one-dimensional equations: one that describes the horizontal weights and the other that describes the vertical weights. We'd then first do a horizontal blur with the horizontal weights on the scene texture, and then on the resulting texture do a vertical blur. Due to this property the results are exactly the same, but this time saving us an incredible amount of performance as we'd now only have to do 32 + 32 samples compared to 1024! This is known as two-pass Gaussian blur.

幸运的是，高斯方程有一个非常巧妙的特性，允许我们将二维方程分离成两个较小的一维方程：一个描述水平权重，另一个描述垂直权重。然后，我们首先在场景纹理上使用水平权重进行水平模糊，然后在得到的纹理上进行垂直模糊。利用这一特性，可以获得完全一样的结果，同时因为我们现在只需进行 32 + 32 次采样，而不是 1024 次采样，所以为我们避免了大量的性能损耗！这就是所谓的双通道高斯模糊。

![Two Pass Gaussian](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-GaussianTwoPass.png)

This does mean we need to blur an image at least two times and this works best with the use of framebuffer objects. Specifically for the two-pass Gaussian blur we're going to implement ping-pong framebuffers. That is a pair of framebuffers where we render and swap, a given number of times, the other framebuffer's color buffer into the current framebuffer's color buffer with an alternating shader effect. We basically continuously switch the framebuffer to render to and the texture to draw with. This allows us to first blur the scene's texture in the first framebuffer, then blur the first framebuffer's color buffer into the second framebuffer, and then the second framebuffer's color buffer into the first, and so on.

这就意味着我们需要对图像进行至少两次模糊处理，使用帧缓冲对象能很好的应对这种需求。具体来说，对于两次高斯模糊，我们将使用乒乓帧缓冲。乒乓帧缓冲是一对帧缓冲，我们在其中渲染并进行一定次数的交换，交换是将另一个帧缓冲的颜色缓冲应用效果后输出到当前帧缓冲的颜色缓冲中。基本上，我们会不断切换要渲染的帧缓冲和要绘制的纹理。这使得我们可以先在第一个帧缓冲区中模糊场景的纹理，然后将第一个帧缓冲区的颜色缓冲区模糊到第二个帧缓冲区，再将第二个帧缓冲区的颜色缓冲区模糊到第一个帧缓冲区，以此类推。

Before we delve into the framebuffers let's first discuss the Gaussian blur's fragment shader:

在深入研究帧缓冲区之前，我们先来讨论一下高斯模糊的片段着色器：

```glsl
#version 330 core
out vec4 FragColor;
  
in vec2 TexCoords;

uniform sampler2D image;
  
uniform bool horizontal;
uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main()
{             
    vec2 tex_offset = 1.0 / textureSize(image, 0); // gets size of single texel
    vec3 result = texture(image, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(0.0, tex_offset.y * i)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(0.0, tex_offset.y * i)).rgb * weight[i];
        }
    }
    FragColor = vec4(result, 1.0);
}
```

Here we take a relatively small sample of Gaussian weights that we each use to assign a specific weight to the horizontal or vertical samples around the current fragment. You can see that we split the blur filter into a horizontal and vertical section based on whatever value we set the horizontal uniform. We base the offset distance on the exact size of a texel obtained by the division of 1.0 over the size of the texture (a vec2 from textureSize).

这里我们取一个相对较小的高斯权重样本，作为当前片段周围的水平或垂直样本权重。可以看到，我们根据是否设置了 uniform 类型的 horizontal 变量值，将模糊滤波器分为水平和垂直两部分。我们根据 1.0 除以纹理大小（textureSize 返回的一个 vec2）得出一个纹素的精确大小来确定偏移距离。

For blurring an image we create two basic framebuffers, each with only a color buffer texture:

为了模糊图像，我们创建了两个基本帧缓冲，每个帧缓冲只有一个颜色缓冲纹理：

```c++
unsigned int pingpongFBO[2];
unsigned int pingpongBuffer[2];
glGenFramebuffers(2, pingpongFBO);
glGenTextures(2, pingpongBuffer);
for (unsigned int i = 0; i < 2; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[i]);
    glBindTexture(GL_TEXTURE_2D, pingpongBuffer[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, pingpongBuffer[i], 0
    );
}
```

Then after we've obtained an HDR texture and an extracted brightness texture, we first fill one of the ping-pong framebuffers with the brightness texture and then blur the image 10 times (5 times horizontally and 5 times vertically):

然后，在获得 HDR 纹理和提取的亮光纹理后，我们首先用亮光纹理填充其中一个乒乓帧缓冲，然后将图像模糊 10 次（水平方向 5 次，垂直方向 5 次）：

```c++
bool horizontal = true, first_iteration = true;
int amount = 10;
shaderBlur.use();
for (unsigned int i = 0; i < amount; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[horizontal]); 
    shaderBlur.setInt("horizontal", horizontal);
    glBindTexture(
        GL_TEXTURE_2D, first_iteration ? colorBuffers[1] : pingpongBuffers[!horizontal]
    ); 
    RenderQuad();
    horizontal = !horizontal;
    if (first_iteration)
        first_iteration = false;
}
glBindFramebuffer(GL_FRAMEBUFFER, 0); 
```

Each iteration we bind one of the two framebuffers based on whether we want to blur horizontally or vertically and bind the other framebuffer's color buffer as the texture to blur. The first iteration we specifically bind the texture we'd like to blur (brightnessTexture) as both color buffers would else end up empty. By repeating this process 10 times, the brightness image ends up with a complete Gaussian blur that was repeated 5 times. This construct allows us to blur any image as often as we'd like; the more Gaussian blur iterations, the stronger the blur.

每次迭代时，我们都会根据想要进行水平方向模糊还是进行垂直方向模糊绑定两个帧缓冲中的一个，并将另一个帧缓冲的颜色缓冲绑定为要去模糊的纹理。第一次迭代时，我们特地绑定了要模糊的纹理（brightnessTexture），否则两个颜色缓冲区最终都会是空的。重复此过程 10 次后，亮光图像最终将以重复 5 次的完整高斯模糊效果呈现。这种结构允许我们随心所欲地模糊任何图像，高斯模糊迭代次数越多，模糊效果越强。

By blurring the extracted brightness texture 5 times, we get a properly blurred image of all bright regions of a scene.

将提取的亮光纹理模糊 5 次后，我们就能得到场景中所有亮光区域的适当模糊图像。

![Gaussian Blurred](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-GaussianBlurred.png)

The last step to complete the Bloom effect is to combine this blurred brightness texture with the original scene's HDR texture.

完成泛光效果的最后一步是将模糊亮光纹理与原始的场景的 HDR 纹理相结合。

## Blending both textures

With the scene's HDR texture and a blurred brightness texture of the scene we only need to combine the two to achieve the infamous Bloom or glow effect. In the final fragment shader (largely similar to the one we used in the HDR chapter) we additively blend both textures:

有了场景的 HDR 纹理和场景的模糊亮光纹理，我们只需将两者结合起来，就能实现著名的泛光或发光效果。在最终的片段着色器中（与我们在 HDR 章节中使用的着色器基本类似），我们对两种纹理进行相加混合：

```glsl
#version 330 core
out vec4 FragColor;
  
in vec2 TexCoords;

uniform sampler2D scene;
uniform sampler2D bloomBlur;
uniform float exposure;

void main()
{             
    const float gamma = 2.2;
    vec3 hdrColor = texture(scene, TexCoords).rgb;      
    vec3 bloomColor = texture(bloomBlur, TexCoords).rgb;

    // additive blending
    hdrColor += bloomColor; 

    // tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);

    // also gamma correct while we're at it       
    result = pow(result, vec3(1.0 / gamma));

    FragColor = vec4(result, 1.0);
}  
```
Interesting to note here is that we add the Bloom effect before we apply tone mapping. This way, the added brightness of bloom is also softly transformed to LDR range with better relative lighting as a result.

值得注意的是，我们在应用色调映射之前就添加了泛光效果。这样，泛光增加的亮度也会柔和地转换到 LDR 范围，从而可以获得更好的相对光照结果。

With both textures added together, all bright areas of our scene now get a proper glow effect:

将这两种纹理添加到一起后，场景中所有明亮的区域都获得了适当的发光效果：

![Final Bloom Effect](/assets/img/post/LearnOpenGL-AdvancedLighting-Bloom-FinalBloomEffect.png)

The colored cubes now appear much more bright and give a better illusion as light emitting objects. This is a relatively simple scene so the Bloom effect isn't too impressive here, but in well lit scenes it can make a significant difference when properly configured. You can find the source code of this simple demo [here](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/7.bloom/bloom.cpp).

彩色发光立方体现在看起来更亮了，给人一种发光物体的错觉。这是一个相对简单的场景，因此泛光效果在这里并不出众，如果在光线充足的场景中，配置得当的话，效果会大不相同。你可以在[这里](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/7.bloom/bloom.cpp)找到这个简单演示的源代码。

For this chapter we used a relatively simple Gaussian blur filter where we only take 5 samples in each direction. By taking more samples along a larger radius or repeating the blur filter an extra number of times we can improve the blur effect. As the quality of the blur directly correlates to the quality of the Bloom effect, improving the blur step can make a significant improvement. Some of these improvements combine blur filters with varying sized blur kernels or use multiple Gaussian curves to selectively combine weights. The additional resources from Kalogirou and Epic Games discuss how to significantly improve the Bloom effect by improving the Gaussian blur.

在本章中，我们使用了一个相对简单的高斯模糊滤波器，每个方向只采集了 5 个样本。通过沿更大半径采集更多样本或重复更多次数的模糊滤波，我们可以提升模糊的效果。由于模糊效果的质量与泛光效果的质量直接相关，因此改进模糊步骤可以显著提升泛光效果。其中一些改进是将模糊滤波器与不同大小的模糊核相结合，或使用多条高斯曲线有选择性地组合权重。来自 Kalogirou 和 Epic Games 的额外资源讨论了如何通过改进高斯模糊来显著改善泛光效果。


## References
>
> * [Bloom - learnopengl](https://learnopengl.com/Advanced-Lighting/Bloom)
>
> * [Efficient Gaussian Blur with linear sampling - rastergrid](https://www.rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/)
>
> * [Incremental Computation of the Gaussian - GPU Gems 3](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch40.html)