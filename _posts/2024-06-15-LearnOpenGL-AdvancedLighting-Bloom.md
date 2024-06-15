---
title: Bloom
description: 泛光（Bloom）是一种常用的渲染技术，用于给光源加上辉光效果，在视觉上增强光源的亮度。
date: 2024-06-15 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess, bloom]     # TAG names should always be lowercase
---

## Introduce

To implement Bloom, we render a lit scene as usual and extract both the scene's HDR color buffer and an image of the scene with only its bright regions visible. This extracted brightness image is then blurred and the result added on top of the original HDR scene image.

为了实现泛光，我们会像往常一样渲染一个光照场景，提取出场景的 HDR 颜色缓冲和仅有明亮区域可见的场景图像。然后对提取的亮光图像进行模糊处理，并将结果添加到原始 HDR 场景图像之上。

Let's illustrate this process in a step by step fashion. We render a scene filled with 4 bright light sources, visualized as colored cubes. The colored light cubes have a brightness values between 1.5 and 15.0. If we were to render this to an HDR color buffer the scene looks as follows:

让我们来逐步说明这一过程。我们在场景中渲染 4 个明亮的彩色立方体光源。彩色立方体的亮度值在 1.5 和 15.0 之间。如果我们将其渲染到 HDR 颜色缓冲区，场景看起来是下面这样：

![HDR](/assets/images/LearnOpenGL-AdvancedLighting-Bloom-HDR.png)

We take this HDR color buffer texture and extract all the fragments that exceed a certain brightness. This gives us an image that only show the bright colored regions as their fragment intensities exceeded a certain threshold:

我们利用 HDR 颜色缓冲纹理，提取所有亮度超过一定值的片段。这样得到的图像只显示亮光区域，因为它们的片段强度超过了一定的阈值：

![Extracted Bright Regions](/assets/images/LearnOpenGL-AdvancedLighting-Bloom-ExtractedBrightRegions.png)

We then take this thresholded brightness texture and blur the result. The strength of the bloom effect is largely determined by the range and strength of the blur filter used.

然后，我们将这个超过一定亮度阈值的亮光纹理进行模糊处理。泛光效果的强度主要取决于所使用的模糊滤波器的范围和强度。

![Blurred Bright Regions](/assets/images/LearnOpenGL-AdvancedLighting-Bloom-BlurredBrightRegions.png)

The resulting blurred texture is what we use to get the glow or light-bleeding effect. This blurred texture is added on top of the original HDR scene texture. Because the bright regions are extended in both width and height due to the blur filter, the bright regions of the scene appear to glow or bleed light.

产生的模糊纹理被添加到原始 HDR 场景纹理上之后，就形成了发光或渗光效果。由于模糊滤波器的作用，亮光区域的宽度和高度都得到了延伸，因此场景中的亮光区域看起来会发光或渗光。

![Combined HDR With Blurred Bright](/assets/images/LearnOpenGL-AdvancedLighting-Bloom-CombinedHDRWithBlurredBright.png)

Bloom by itself isn't a complicated technique, but difficult to get exactly right. Most of its visual quality is determined by the quality and type of blur filter used for blurring the extracted brightness regions. Simply tweaking the blur filter can drastically change the quality of the Bloom effect.

泛光本身并不是一项复杂的技术，但却很难做到精准。它的视觉效果主要取决于，在对提取的亮光区域进行模糊时，所选择的模糊滤波器的质量和类型。只需调整模糊滤波器，就能大大改变泛光效果的质量。

Following these steps gives us the Bloom post-processing effect. The next image briefly summarizes the required steps for implementing Bloom:

按照这些步骤，我们就能得到泛光后期处理效果。下图简要总结了实现泛光所需的步骤：

![Bloom Steps](/assets/images/LearnOpenGL-AdvancedLighting-Bloom-BloomSteps.png)

The first step requires us to extract all the bright colors of a scene based on some threshold. Let's first delve into that.

第一步要求我们根据某个阈值提取场景中的所有亮色。让我们先深入探讨一下这个问题。