---
title: HDR
description: 通过允许片段颜色值超过 1.0，我们可以在更高的颜色值范围内工作，这就是所谓的高动态范围（HDR）。有了高动态范围，亮的东西可以非常亮，暗的东西也可以非常暗，而且明暗区域中都可以看到细节信息。HDR 的原理是我们允许渲染时使用更大范围的颜色值，从而收集场景中大范围的明暗区域细节，最后将所有 HDR 值转换回 [0.0, 1.0] 的低动态范围 (LDR)。
date: 2024-06-15 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess, hdr]     # TAG names should always be lowercase
---

## Introduction

Brightness and color values, by default, are clamped between 0.0 and 1.0 when stored into a framebuffer. This, at first seemingly innocent, statement caused us to always specify light and color values somewhere in this range, trying to make them fit into the scene. This works oké and gives decent results, but what happens if we walk in a really bright area with multiple bright light sources that as a total sum exceed 1.0? The answer is that all fragments that have a brightness or color sum over 1.0 get clamped to 1.0, which isn't pretty to look at:

默认情况下，当存储亮度和颜色值到帧缓冲区时，它们会被限制到 0.0 和 1.0 之间。然后我们总是在这个范围内指定光照亮度和颜色值，并尽力用它们来生动描绘出场景信息。这个方法还可以，效果也不错，搭眼看起来是没什么问题，但如果我们遇上有多个明亮光源的一个非常明亮的区域，区域内某些片段的亮度或颜色值在光照积聚下超过 1.0 的话，会发生什么情况呢？答案是，光照积聚下亮度或颜色值超过 1.0 的所有片段，其亮度或颜色值都会被限制在 1.0 的范围之内，从而导致明亮区域过曝，难以看清细节：

![LDR](/assets/img/post/LearnOpenGL-AdvancedLighting-HDR-LDR.png)

Due to a large number of fragments' color values getting clamped to 1.0, each of the bright fragments have the exact same white color value in large regions, losing a significant amount of detail and giving it a fake look.

在上图中由于明亮区域内大量片段的颜色值被限制到 1.0，因此大部分片段都表现为完全相同的白色，从而丢失了很多细节，使场景给人一种虚假的感觉。

A solution to this problem would be to reduce the strength of the light sources and ensure no area of fragments in your scene ends up brighter than 1.0; this is not a good solution as this forces you to use unrealistic lighting parameters. A better approach is to allow color values to temporarily exceed 1.0 and transform them back to the original range of 0.0 and 1.0 as a final step, but without losing detail.

解决这个问题的一个方案是降低光源强度，确保场景中没有任何片段区域的亮度超过 1.0；但这并不是一个好的办法，因为这会迫使您使用非真实的光照参数。一个更好的方法是允许颜色值暂时超过 1.0，并在最后一步将其转换回 0.0 和 1.0 的原始范围，从而防止丢失细节。

Monitors (non-HDR) are limited to display colors in the range of 0.0 and 1.0, but there is no such limitation in lighting equations. By allowing fragment colors to exceed 1.0 we have a much higher range of color values available to work in known as high dynamic range (HDR). With high dynamic range, bright things can be really bright, dark things can be really dark, and details can be seen in both.

（非 HDR）显示器只能显示 0.0 和 1.0 范围内的颜色，但光照方程中却没有这样的限制。通过允许片段颜色值超过 1.0，我们可以在更高的颜色值范围内工作，这就是所谓的高动态范围（HDR）。有了高动态范围，亮的东西可以非常亮，暗的东西也可以非常暗，而且明暗区域中都可以看到细节信息。

High dynamic range was originally only used for photography where a photographer takes multiple pictures of the same scene with varying exposure levels, capturing a large range of color values. Combining these forms a HDR image where a large range of details are visible based on the combined exposure levels, or a specific exposure it is viewed with. For instance, the following image (credits to Colin Smith) shows a lot of detail at brightly lit regions with a low exposure (look at the window), but these details are gone with a high exposure. However, a high exposure now reveals a great amount of detail at darker regions that weren't previously visible.

高动态范围最初只用于摄影，摄影师在同一场景中拍摄多张不同曝光水平的照片，从而捕捉到大范围的颜色值。根据曝光级别或观察时的指定曝光，将这些照片组合起来就形成了 HDR 图像，在其中可以看到很大范围的细节。例如，下面这张图片（归功于科林-史密斯）在低曝光时明亮区域显示出了大量的细节（看窗户），逐渐增加曝光时这些细节就消失了。当然，随着曝光增加，在以前低曝光下看不到的较暗区域又会显示出大量细节。

![Different Exposure Level HDR Image.png](/assets/img/post/LearnOpenGL-AdvancedLighting-HDR-DifferentExposureLevelHDRImage.png)

This is also very similar to how the human eye works and the basis of high dynamic range rendering. When there is little light, the human eye adapts itself so the darker parts become more visible and similarly for bright areas. It's like the human eye has an automatic exposure slider based on the scene's brightness.

这与人眼的工作原理非常相似，也是高动态范围渲染的基础。当光线不足时，人眼会进行自我调整，让暗处可以看得更清晰，同样，亮处也是如此。这就像人眼根据场景亮度自动设置曝光滑动条一样。

High dynamic range rendering works a bit like that. We allow for a much larger range of color values to render to, collecting a large range of dark and bright details of a scene, and at the end we transform all the HDR values back to the low dynamic range (LDR) of [0.0, 1.0]. This process of converting HDR values to LDR values is called tone mapping and a large collection of tone mapping algorithms exist that aim to preserve most HDR details during the conversion process. These tone mapping algorithms often involve an exposure parameter that selectively favors dark or bright regions.

高动态范围渲染的原理与此类似。我们允许渲染时使用更大范围的颜色值，从而收集场景中大范围的明暗区域细节，最后将所有 HDR 值转换回 [0.0, 1.0] 的低动态范围 (LDR)。将 HDR 值转换为 LDR 值的过程称为色调映射，目前有大量的色调映射算法，致力于在转换过程中保留大部分 HDR 细节。这些色调映射算法通常包含一个可选择倾向暗处或亮处的曝光参数。

When it comes to real-time rendering, high dynamic range allows us to not only exceed the LDR range of [0.0, 1.0] and preserve more detail, but also gives us the ability to specify a light source's intensity by their real intensities. For instance, the sun has a much higher intensity than something like a flashlight so why not configure the sun as such (e.g. a diffuse brightness of 100.0). This allows us to more properly configure a scene's lighting with more realistic lighting parameters, something that wouldn't be possible with LDR rendering as they'd then directly get clamped to 1.0.

说到实时渲染，高动态范围不仅能让我们超越低动态范围 [0.0，1.0]，保留更多细节，还能让我们根据实际情况来指定光源的强度。例如，太阳的强度比手电筒的强度要高得多，那么为什么不将太阳强度如此配置呢（例如，太阳漫反射亮度配置为 100.0，手电筒漫反射亮度配置为 10.0，而不是将太阳和手电筒漫反射亮度都设为 1.0）。这样我们就能用更真实的光照参数更合理地配置场景光照，而 LDR 渲染则无法做到这一点，因为它们会被直接限制到 1.0。

As (non-HDR) monitors only display colors in the range between 0.0 and 1.0 we do need to transform the currently high dynamic range of color values back to the monitor's range. Simply re-transforming the colors back with a simple average wouldn't do us much good as brighter areas then become a lot more dominant. What we can do, is use different equations and/or curves to transform the HDR values back to LDR that give us complete control over the scene's brightness. This is the process earlier denoted as tone mapping and the final step of HDR rendering.

由于（非 HDR）显示器只能显示 0.0 至 1.0 范围内的颜色，因此我们需要将当前高动态范围的颜色值转换回显示器要求的范围。如果只是简单地用平均值来重新转换颜色，效果并不好，因为这会使亮度较高的区域会变得更加突出。我们可以做的是使用不同的方程式和/或曲线，将 HDR 值转换回 LDR 值，从而完全控制场景的亮度。这就是之前所说的色调映射过程，也是 HDR 渲染的最后一步。

## Floating point framebuffers

To implement high dynamic range rendering we need some way to prevent color values getting clamped after each fragment shader run. When framebuffers use a normalized fixed-point color format (like GL_RGB) as their color buffer's internal format, OpenGL automatically clamps the values between 0.0 and 1.0 before storing them in the framebuffer. This operation holds for most types of framebuffer formats, except for floating point formats.

要实现高动态范围渲染，在每次片段着色器运行后，我们需要一些方法来防止对颜色值范围的限制。当帧缓冲使用归一化定点颜色格式（如 GL_RGB）作为其颜色缓冲的内部格式时，在将数值存储到帧缓冲之前 OpenGL 会自动将其限制在 0.0 和 1.0 之间。这一操作适用于大多数类型的帧缓冲颜色格式，但浮点颜色格式除外。

When the internal format of a framebuffer's color buffer is specified as GL_RGB16F, GL_RGBA16F, GL_RGB32F, or GL_RGBA32F the framebuffer is known as a floating point framebuffer that can store floating point values outside the default range of 0.0 and 1.0. This is perfect for rendering in high dynamic range!

当帧缓冲的颜色缓冲的内部格式被指定为 GL_RGB16F、GL_RGBA16F、GL_RGB32F 或 GL_RGBA32F 时，帧缓冲被称为浮点帧缓冲，可以存储默认范围 0.0 和 1.0 以外的浮点数值。这对于高动态范围内渲染是非常合适的！

To create a floating point framebuffer the only thing we need to change is its color buffer's internal format parameter:

要创建浮点帧缓冲，我们唯一需要更改的是其颜色缓冲的内部格式参数：

```c++
glBindTexture(GL_TEXTURE_2D, colorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
```

The default framebuffer of OpenGL (by default) only takes up 8 bits per color component. With a floating point framebuffer with 32 bits per color component (when using GL_RGB32F or GL_RGBA32F) we're using 4 times more memory for storing color values. As 32 bits isn't really necessary (unless you need a high level of precision) using GL_RGBA16F will suffice.

OpenGL 的默认帧缓冲（默认情况下）每个颜色分量只占用 8 个二进制位。而对于每个颜色分量占 32 位（使用 GL_RGB32F 或 GL_RGBA32F）的浮点帧缓冲，我们存储颜色值所需的内存要多出 4 倍。由于 32 位实际上并不是必需的（除非您需要高精度），所以通常情况下使用 GL_RGBA16F 就足够了。

With a floating point color buffer attached to a framebuffer we can now render the scene into this framebuffer knowing color values won't get clamped between 0.0 and 1.0. In this chapter's example demo we first render a lit scene into the floating point framebuffer and then display the framebuffer's color buffer on a screen-filled quad; it'll look a bit like this:

因为我们使用了浮点帧缓冲，所以颜色值不会被限制在 0.0 和 1.0 之间，将浮点颜色缓冲连接到帧缓冲后，我们就可以将场景渲染到该帧缓冲中。在本章的示例演示中，我们首先将一个灯光场景渲染到浮点帧缓冲中，然后将帧缓冲的颜色缓冲显示在一个填充窗口屏幕的四边形上，看起来有点像这样：

```c++
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);  
    // [...] render (lit) scene 
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// now render hdr color buffer to 2D screen-filling quad with tone mapping shader
hdrShader.use();
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, hdrColorBufferTexture);
RenderQuad();
```

Here a scene's color values are filled into a floating point color buffer which can contain any arbitrary color value, possibly exceeding 1.0. For this chapter, a simple demo scene was created with a large stretched cube acting as a tunnel with four point lights, one being extremely bright positioned at the tunnel's end:

在这里，场景的颜色值被填充到一个浮点颜色缓冲中，该缓冲可以包含任意大小的颜色值，甚至于超过 1.0 的颜色值。在本章中，我们创建了一个简单的演示场景，一个大的拉伸的立方体通道，通道内有四个点光源，其中一个位于通道尽头，拥有极高的亮度：

```c++
std::vector<glm::vec3> lightColors;
lightColors.push_back(glm::vec3(200.0f, 200.0f, 200.0f));
lightColors.push_back(glm::vec3(0.1f, 0.0f, 0.0f));
lightColors.push_back(glm::vec3(0.0f, 0.0f, 0.2f));
lightColors.push_back(glm::vec3(0.0f, 0.1f, 0.0f));
```

Rendering to a floating point framebuffer is exactly the same as we would normally render into a framebuffer. What is new is hdrShader's fragment shader that renders the final 2D quad with the floating point color buffer texture attached. Let's first define a simple pass-through fragment shader:

渲染到浮点帧缓冲的过程与我们平常渲染到帧缓冲的过程完全相同。不同之处在于 hdrShader 这个片段着色器，它可以用浮点颜色缓冲纹理渲染最终的 2D 四边形。让我们先定义一个简单的直通片段着色器：

```glsl
#version 330 core
out vec4 FragColor;
  
in vec2 TexCoords;

uniform sampler2D hdrBuffer;

void main()
{             
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;
    FragColor = vec4(hdrColor, 1.0);
}  
```

Here we directly sample the floating point color buffer and use its color value as the fragment shader's output. However, as the 2D quad's output is directly rendered into the default framebuffer, all the fragment shader's output values will still end up clamped between 0.0 and 1.0 even though we have several values in the floating point color texture exceeding 1.0.

在这里，我们直接对浮点颜色缓冲进行采样，并使用其颜色值作为片段着色器的输出。不过，由于 2D 四边形的输出是直接渲染到默认帧缓冲区中的，因此即使浮点颜色纹理中有多个值超过 1.0，片段着色器的所有输出值最终仍会被限制在 0.0 和 1.0 之间。

![Direct](/assets/img/post/LearnOpenGL-AdvancedLighting-HDR-Direct.png)

It becomes clear the intense light values at the end of the tunnel are clamped to 1.0 as a large portion of it is completely white, effectively losing all lighting details in the process. As we directly write HDR values to an LDR output buffer it is as if we have no HDR enabled in the first place. What we need to do is transform all the floating point color values into the 0.0 - 1.0 range without losing any of its details. We need to apply a process called tone mapping.

很明显，通道尽头很大一部分完全是白色的，这些白色区域发出的高强度光线的值被限制为了 1.0，在这个过程中实际上丢失了所有光照细节。当我们直接将 HDR 值写入 LDR 输出缓冲区时，就好像我们一开始就没有启用 HDR。我们需要做的是将所有浮点颜色值转换到 0.0 - 1.0 范围，同时不丢失任何细节。所以我们需要应用一个名为色调映射的处理。

## Tone mapping

Tone mapping is the process of transforming floating point color values to the expected [0.0, 1.0] range known as low dynamic range without losing too much detail, often accompanied with a specific stylistic color balance.

色调映射是在不损失太多细节的情况下，将浮点颜色值转换到期望的 [0.0, 1.0] 范围（即低动态范围）内的过程，通常会伴随特定风格的色彩平衡。

### Reinhard

One of the more simple tone mapping algorithms is Reinhard tone mapping that involves dividing the entire HDR color values to LDR color values. The Reinhard tone mapping algorithm evenly balances out all brightness values onto LDR. We include Reinhard tone mapping into the previous fragment shader and also add a gamma correction filter for good measure (including the use of sRGB textures):

一种较为简单的色调映射算法是 Reinhard 色调映射，它将所有 HDR 颜色值划分到 LDR 颜色值。Reinhard 色调映射算法将所有 HDR 亮度值均匀地分布到 LDR 上。我们在之前的片段着色器中加入了 Reinhard 色调映射，并且为了更好的观测还添加了伽玛校正滤波（包括使用 sRGB 纹理）：

```glsl
uniform sampler2D hdrBuffer;

in vec2 TexCoords;

out vec4 FragColor;

// Converts a color from RGB space to linear space.
vec4 gammaCorrect(vec4 color) {
    const float gamma = 2.2;
    color.rgb = pow(color.rgb, vec3(gamma));
    return color;
}

// Converts a color in linear space to RGB space.
vec3 inverseGamma(vec3 color) {
    const float gamma = 2.2;
    return pow(color, vec3(1.0 / gamma));
}

// See equation 3:
//    http://www.cs.utah.edu/~reinhard/cdrom/tonemap.pdf
void main()
{
    vec3 color = texture2D(hdrBuffer, TexCoords).rgb;
    color = color / (1.0 + color);
    color = inverseGamma(color);
    FragColor = vec4(color, 1.0);
}
```

With Reinhard tone mapping applied we no longer lose any detail at the bright areas of our scene. It does tend to slightly favor brighter areas, making darker regions seem less detailed and distinct:

使用 Reinhard 色调映射后，在场景的明亮区域我们不再丢失任何细节。它善于处理明亮区域，但不善于处理黑暗区域，会削弱黑暗区域细节：

![Reinhard](/assets/img/post/LearnOpenGL-AdvancedLighting-HDR-Reinhard.png)

Here you can again see details at the end of the tunnel as the wood texture pattern becomes visible again. With this relatively simple tone mapping algorithm we can properly see the entire range of HDR values stored in the floating point framebuffer, giving us precise control over the scene's lighting without losing details.

现在，你可以再次看到通道尽头的细节了，木质纹理图案清晰可见。通过这种相对简单的色调映射算法，我们可以正确地看到存储在浮点帧缓冲中的整个 HDR 值范围，从而在不丢失细节的情况下精确控制场景的光照。

> Note that we could also directly tone map at the end of our lighting shader, not needing any floating point framebuffer at all! However, as scenes get more complex you'll frequently find the need to store intermediate HDR results as floating point buffers so this is a good exercise. <br> <br> 请注意，我们也可以不需要任何浮点帧缓冲，在光照着色器结束时直接进行色调映射！不过，随着场景变得越来越复杂，你会经常发现需要将中间 HDR 结果存储为浮点缓冲，因此这是一个很好的练习。
{: .prompt-tip }

### ModifiedReinhard

```glsl
uniform sampler2D hdrBuffer;

in vec2 TexCoords;

out vec4 FragColor;

// Converts a color from RGB space to linear space.
vec4 gammaCorrect(vec4 color) {
    const float gamma = 2.2;
    color.rgb = pow(color.rgb, vec3(gamma));
    return color;
}

// Converts a color in linear space to RGB space.
vec3 inverseGamma(vec3 color) {
    const float gamma = 2.2;
    return pow(color, vec3(1.0 / gamma));
}

// See equation 4:
//    http://www.cs.utah.edu/~reinhard/cdrom/tonemap.pdf
void main()
{
    vec3 color = texture2D(hdrBuffer, TexCoords).rgb;
    vec3 white = vec3(1.0);
    color = (color * (1.0 + color / white)) / (1.0 + color);
    color = inverseGamma(color);
    FragColor = vec4(color, 1.0);
}
```

### Exposure

Another interesting use of tone mapping is to allow the use of an exposure parameter. You probably remember from the introduction that HDR images contain a lot of details visible at different exposure levels. If we have a scene that features a day and night cycle it makes sense to use a lower exposure at daylight and a higher exposure at night time, similar to how the human eye adapts. With such an exposure parameter it allows us to configure lighting parameters that work both at day and night under different lighting conditions as we only have to change the exposure parameter.

色调映射的另一个有趣用法是允许使用曝光参数。你可能还记得，HDR 图像包含大量在不同曝光层级下可见的细节。如果我们有一个昼夜循环的场景，那么可以在白天使用较低的曝光，而在夜晚使用较高的曝光，这与人眼的适应方式类似。有了这样一个曝光参数，我们只需改变曝光参数，就能配置出在白天和夜晚不同光照条件下都有效的光照参数。

A relatively simple exposure tone mapping algorithm looks as follows:

一个相对简单的曝光色调映射算法如下：

```glsl
uniform float exposure;
uniform sampler2D hdrBuffer;

in vec2 TexCoords;

out vec4 FragColor;

// Converts a color from RGB space to linear space.
vec4 gammaCorrect(vec4 color) {
    const float gamma = 2.2;
    color.rgb = pow(color.rgb, vec3(gamma));
    return color;
}

// Converts a color in linear space to RGB space.
vec3 inverseGamma(vec3 color) {
    const float gamma = 2.2;
    return pow(color, vec3(1.0 / gamma));
}

void main()
{             
    vec3 color = texture(hdrBuffer, TexCoords).rgb;
  
    // exposure tone mapping
    color = vec3(1.0) - exp(-color * exposure);

    // gamma correction 
    color = inverseGamma(color);
  
    FragColor = vec4(color, 1.0);
}  
```

Here we defined an exposure uniform that defaults at 1.0 and allows us to more precisely specify whether we'd like to focus more on dark or bright regions of the HDR color values. For instance, with high exposure values the darker areas of the tunnel show significantly more detail. In contrast, a low exposure largely removes the dark region details, but allows us to see more detail in the bright areas of a scene. Take a look at the image below to see the tunnel at multiple exposure levels:

在这里，我们定义了一个曝光 uniform，默认值为 1.0，这样就可以更精确地指定我们是更关注 HDR 颜色值的暗处还是亮处。例如，如果曝光值较高，通道的暗处就会显示出更多细节。与此相反，低曝光值在很大程度上会消除暗处细节，但却能让我们看到场景亮处的更多细节。请看下图，了解通道在多种曝光层级下的情况：

![Exposure](/assets/img/post/LearnOpenGL-AdvancedLighting-HDR-Exposure.png)

This image clearly shows the benefit of high dynamic range rendering. By changing the exposure level we get to see a lot of details of our scene, that would've been otherwise lost with low dynamic range rendering. Take the end of the tunnel for example. With a normal exposure the wood structure is barely visible, but with a low exposure the detailed wooden patterns are clearly visible. The same holds for the wooden patterns close by that are more visible with a high exposure.

这张图片清晰地展示了高动态范围渲染的优势。通过改变曝光层级，我们可以看到场景中的许多细节，而如果采用低动态范围渲染，这些细节就会丢失。以通道尽头为例。在正常曝光下，木质结构几乎不可见，但在低曝光下，木质图案的细节清晰可见。同样，在高曝光下，近处的木质花纹也更加清晰可见。

You can find the source code of the demo [here](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/6.hdr/hdr.cpp).

你可以在[这里](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/6.hdr/hdr.cpp)找到示例的代码。

### Filmic

```glsl
uniform sampler2D hdrBuffer;

in vec2 TexCoords;

out vec4 FragColor;

// Converts a color from RGB space to linear space.
vec4 gammaCorrect(vec4 color) {
    const float gamma = 2.2;
    color.rgb = pow(color.rgb, vec3(gamma));
    return color;
}

// Converts a color in linear space to RGB space.
vec3 inverseGamma(vec3 color) {
    const float gamma = 2.2;
    return pow(color, vec3(1.0 / gamma));
}

// See slides 142 and 143:
//     http://www.gdcvault.com/play/1012459/Uncharted_2__HDR_Lighting
void main()
{
    vec3 color = texture2D(hdrBuffer, TexCoords).rgb;

	const float A = 0.22; // shoulder strength
	const float B = 0.30; // linear strength
	const float C = 0.10; // linear angle
	const float D = 0.20; // toe strength
	const float E = 0.01; // toe numerator
	const float F = 0.30; // toe denominator

	const float white = 11.2; // linear white point value

	vec3 c = ((color * (A * color + C * B) + D * E) / (color * ( A * color + B) + D * F)) - E / F;
	float w = ((white * (A * white + C * B) + D * E) / (white * ( A * white + B) + D * F)) - E / F;

    c = inverseGamma(c / w);
    FragColor = vec4(c, 1.0);
}
```

### ACES

```glsl
uniform sampler2D hdrBuffer;

in vec2 TexCoords;

out vec4 FragColor;

// Converts a color from RGB space to linear space.
vec4 gammaCorrect(vec4 color) {
    const float gamma = 2.2;
    color.rgb = pow(color.rgb, vec3(gamma));
    return color;
}

// Converts a color in linear space to RGB space.
vec3 inverseGamma(vec3 color) {
    const float gamma = 2.2;
    return pow(color, vec3(1.0 / gamma));
}

// See:
//    https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
void main()
{
    vec3 color = texture2D(hdrBuffer, TexCoords).rgb;

    float g = 0.985;

    float a = 0.065;
    float b = 0.0001;
    float c = 0.433;
    float d = 0.238;

    color = (color * (color + a) - b) / (color * (g * color + c) + d);

    color = clamp(color, 0.0, 1.0);

    color = inverseGamma(color);
    FragColor = vec4(color, 1.0);
}
```