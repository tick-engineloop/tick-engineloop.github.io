---
title: HDR
description: 通过允许片段颜色值超过 1.0，我们可以在更高的色彩值范围内工作，这就是所谓的高动态范围（HDR）。有了高动态范围，亮的东西可以非常亮，暗的东西也可以非常暗，而且明暗区域中都可以看到细节信息。HDR 的原理是我们允许渲染时使用更大范围的色彩值，从而收集场景中大范围的明暗区域细节，最后将所有 HDR 值转换回 [0.0, 1.0] 的低动态范围 (LDR)。
date: 2024-06-15 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess, hdr]     # TAG names should always be lowercase
---

## Introduce

Brightness and color values, by default, are clamped between 0.0 and 1.0 when stored into a framebuffer. This, at first seemingly innocent, statement caused us to always specify light and color values somewhere in this range, trying to make them fit into the scene. This works oké and gives decent results, but what happens if we walk in a really bright area with multiple bright light sources that as a total sum exceed 1.0? The answer is that all fragments that have a brightness or color sum over 1.0 get clamped to 1.0, which isn't pretty to look at:

默认情况下，当存储亮度和色彩值到帧缓冲区时，它们会被限制到 0.0 和 1.0 之间。然后我们总是在这个范围内指定光照亮度和色彩值，并尽力用它们来生动描绘出场景信息。这个方法还可以，效果也不错，搭眼看起来是没什么问题，但如果我们遇上有多个明亮光源的一个非常明亮的区域，区域内某些片段的亮度或色彩值在光照积聚下超过 1.0 的话，会发生什么情况呢？答案是，光照积聚下亮度或色彩值超过 1.0 的所有片段，其亮度或色彩值都会被限制在 1.0 的范围之内，从而导致明亮区域过曝，难以看清细节：

![LDR](/assets/images/LearnOpenGL-AdvancedLighting-HDR-LDR.png)

Due to a large number of fragments' color values getting clamped to 1.0, each of the bright fragments have the exact same white color value in large regions, losing a significant amount of detail and giving it a fake look.

在上图中由于明亮区域内大量片段的颜色值被限制到 1.0，因此大部分片段都表现为完全相同的白色，从而丢失了很多细节，使场景给人一种虚假的感觉。

A solution to this problem would be to reduce the strength of the light sources and ensure no area of fragments in your scene ends up brighter than 1.0; this is not a good solution as this forces you to use unrealistic lighting parameters. A better approach is to allow color values to temporarily exceed 1.0 and transform them back to the original range of 0.0 and 1.0 as a final step, but without losing detail.

解决这个问题的一个方案是降低光源强度，确保场景中没有任何片段区域的亮度超过 1.0；但这并不是一个好的办法，因为这会迫使您使用非真实的光照参数。一个更好的方法是允许色彩值暂时超过 1.0，并在最后一步将其转换回 0.0 和 1.0 的原始范围，从而防止丢失细节。

Monitors (non-HDR) are limited to display colors in the range of 0.0 and 1.0, but there is no such limitation in lighting equations. By allowing fragment colors to exceed 1.0 we have a much higher range of color values available to work in known as high dynamic range (HDR). With high dynamic range, bright things can be really bright, dark things can be really dark, and details can be seen in both.

（非 HDR）显示器只能显示 0.0 和 1.0 范围内的色彩，但光照方程中却没有这样的限制。通过允许片段颜色值超过 1.0，我们可以在更高的色彩值范围内工作，这就是所谓的高动态范围（HDR）。有了高动态范围，亮的东西可以非常亮，暗的东西也可以非常暗，而且明暗区域中都可以看到细节信息。

High dynamic range was originally only used for photography where a photographer takes multiple pictures of the same scene with varying exposure levels, capturing a large range of color values. Combining these forms a HDR image where a large range of details are visible based on the combined exposure levels, or a specific exposure it is viewed with. For instance, the following image (credits to Colin Smith) shows a lot of detail at brightly lit regions with a low exposure (look at the window), but these details are gone with a high exposure. However, a high exposure now reveals a great amount of detail at darker regions that weren't previously visible.

高动态范围最初只用于摄影，摄影师在同一场景中拍摄多张不同曝光水平的照片，从而捕捉到大范围的色彩值。根据曝光级别或观察时的指定曝光，将这些照片组合起来就形成了 HDR 图像，在其中可以看到很大范围的细节。例如，下面这张图片（归功于科林-史密斯）在低曝光时明亮区域显示出了大量的细节（看窗户），逐渐增加曝光时这些细节就消失了。当然，随着曝光增加，在以前低曝光下看不到的较暗区域又会显示出大量细节。

![Different Exposure Level HDR Image.png](/assets/images/LearnOpenGL-AdvancedLighting-HDR-DifferentExposureLevelHDRImage.png)

This is also very similar to how the human eye works and the basis of high dynamic range rendering. When there is little light, the human eye adapts itself so the darker parts become more visible and similarly for bright areas. It's like the human eye has an automatic exposure slider based on the scene's brightness.

这与人眼的工作原理非常相似，也是高动态范围渲染的基础。当光线不足时，人眼会进行自我调整，让暗处可以看得更清晰，同样，亮处也是如此。这就像人眼根据场景亮度自动设置曝光滑动条一样。

High dynamic range rendering works a bit like that. We allow for a much larger range of color values to render to, collecting a large range of dark and bright details of a scene, and at the end we transform all the HDR values back to the low dynamic range (LDR) of [0.0, 1.0]. This process of converting HDR values to LDR values is called tone mapping and a large collection of tone mapping algorithms exist that aim to preserve most HDR details during the conversion process. These tone mapping algorithms often involve an exposure parameter that selectively favors dark or bright regions.

高动态范围渲染的原理与此类似。我们允许渲染时使用更大范围的色彩值，从而收集场景中大范围的明暗区域细节，最后将所有 HDR 值转换回 [0.0, 1.0] 的低动态范围 (LDR)。将 HDR 值转换为 LDR 值的过程称为色调映射，目前有大量的色调映射算法，致力于在转换过程中保留大部分 HDR 细节。这些色调映射算法通常包含一个可选择倾向暗处或亮处的曝光参数。

When it comes to real-time rendering, high dynamic range allows us to not only exceed the LDR range of [0.0, 1.0] and preserve more detail, but also gives us the ability to specify a light source's intensity by their real intensities. For instance, the sun has a much higher intensity than something like a flashlight so why not configure the sun as such (e.g. a diffuse brightness of 100.0). This allows us to more properly configure a scene's lighting with more realistic lighting parameters, something that wouldn't be possible with LDR rendering as they'd then directly get clamped to 1.0.

说到实时渲染，高动态范围不仅能让我们超越低动态范围 [0.0，1.0]，保留更多细节，还能让我们根据实际情况来指定光源的强度。例如，太阳的强度比手电筒的强度要高得多，那么为什么不将太阳强度如此配置呢（例如，太阳漫反射亮度配置为 100.0，手电筒漫反射亮度配置为 10.0，而不是将太阳和手电筒漫反射亮度都设为 1.0）。这样我们就能用更真实的光照参数更合理地配置场景光照，而 LDR 渲染则无法做到这一点，因为它们会被直接限制到 1.0。

As (non-HDR) monitors only display colors in the range between 0.0 and 1.0 we do need to transform the currently high dynamic range of color values back to the monitor's range. Simply re-transforming the colors back with a simple average wouldn't do us much good as brighter areas then become a lot more dominant. What we can do, is use different equations and/or curves to transform the HDR values back to LDR that give us complete control over the scene's brightness. This is the process earlier denoted as tone mapping and the final step of HDR rendering.

由于（非 HDR）显示器只能显示 0.0 至 1.0 范围内的色彩，因此我们需要将当前高动态范围的色彩值转换回显示器要求的范围。如果只是简单地用平均值来重新转换色彩，效果并不好，因为这会使亮度较高的区域会变得更加突出。我们可以做的是使用不同的方程式和/或曲线，将 HDR 值转换回 LDR 值，从而完全控制场景的亮度。这就是之前所说的色调映射过程，也是 HDR 渲染的最后一步。