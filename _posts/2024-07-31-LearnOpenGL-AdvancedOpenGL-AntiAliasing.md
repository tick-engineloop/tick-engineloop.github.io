---
title: Anti Aliasing
description: 抗锯齿（Anti-Aliasing，简称AA）是一种图形处理技术，用于减少图像中出现的锯齿状边缘。锯齿通常因为光栅化而产生，可通过 SSAA、MSAA、FXAA 等方法减少、柔化或消除。
date: 2024-07-31 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedOpenGL]
tags: [anti-aliasing, learnopengl]     # TAG names should always be lowercase
---

## Introduction

在渲染图形或模型时，时不时会出现渲染目标边缘存在锯齿的情况，这些锯齿边缘(Jagged Edges)的出现和光栅器将顶点数据转化为片段的方式有关。光栅化是根据图元的样本覆盖率将每个单独的基元分解为称为片段的离散元素的过程，由光栅器执行。因为顶点坐标是连续的，但显示器屏幕由一个个独立的像素排列组合而成，要将一组顶点描述的图元显示在屏幕上，就需要使特定区域的像素显示指定的颜色来呈现出图元的形状。光栅器以一个图元的所有顶点作为输入，并根据顶点构成的图元类型及位置确定覆盖了屏幕上哪些像素，然后将这些像素传入渲染管线的下一个阶段。

![Rasterization](/assets/img/post/LearnOpenGL-AdvancedOpenGL-AntiAliasing-Rasterization.png)

上图是由屏幕像素构成的一个网格，其上有一个待显示三角形的范围。网格中每个像素的中心包含有一个采样点(Sample Point)，它会被用来确定其所属的这个像素是否被三角形所覆盖。图中红色的采样点被三角形所覆盖，在每一个被覆盖的像素处都会生成一个片段着色器调用。对于某些屏幕像素，虽然三角形的边缘也遮住了它的一部分，但是这些像素的采样点并没有被三角形所遮盖，所以它们不会触发片段着色器的调用。

你现在可能已经清楚走样或锯齿出现的原因了。完整渲染后的三角形在屏幕上会是这样的：

![Rasterization Filled](/assets/img/post/LearnOpenGL-AdvancedOpenGL-AntiAliasing-RasterizationFilled.png)

## SSAA

SSAA(Super Sample Anti-aliasing) 全称是超采样抗锯齿，它会暂时使用更高分辨率的渲染缓冲来渲染场景（即超采样），然后当渲染到窗口的默认帧缓冲时，场景的分辨率会被下采样(Downsample)至正常的屏幕窗口分辨率。超高的分辨率被用来防止锯齿边缘的产生。虽然它确实能够解决走样问题，但由于这样比平时要绘制更多的片段，所以会有很大的性能开销。

## MSAA

MSAA(Multisampling Anti-aliasing) 全称是多重采样抗锯齿，多重采样所做的是将单一的采样点变为多个采样点。我们不再使用像素中心的单一采样点，取而代之的是以特定模式排列的多个子采样点(Subsample Points，通常是 2、4、8 个子采样点)。我们将用这些子采样点来确定图元对像素的覆盖范围。

![Subsample Points](/assets/img/post/LearnOpenGL-AdvancedOpenGL-AntiAliasing-SubsamplePoints.png)

上图的左侧展示了正常情况下判定三角形是否对像素形成遮盖的方式。这个例子中因为三角形未覆盖像素的中心采样点，所以不算覆盖该像素，在该像素上不会调用片段着色器（所以它会保持默认颜色）。上图的右侧展示的是实施多重采样之后的版本，每个像素包含有 4 个子采样点。可以看到三角形覆盖住了其中两个采样点。

MSAA 的工作方式是，无论三角形遮盖了多少个子采样点，（每个图元中）每个像素只运行一次片段着色器。片段着色器在运行时会使用插值到像素中心的顶点数据，所得到的结果颜色会被储存在每个被遮盖住的子采样点中。被覆盖的子样本的数量决定了像素颜色，像素颜色将由对像素内部子样本颜色求均值来计算获得。因为上图的 4 个采样点中只有 2 个被遮盖住了，所以这个像素的颜色将会是被赋予了三角形颜色的两个采样点与其他两个保持默认值的采样点的颜色（在这里是无色）的平均值，最终形成一种淡蓝色。

这样子做了之后，相当于颜色缓冲拥有了更高的分辨率，并且其中所有图元的边缘将会形成一种更平滑的样式。让我们来看看前面三角形的多重采样会是什么样子：

![Rasterization Subsamples](/assets/img/post/LearnOpenGL-AdvancedOpenGL-AntiAliasing-RasterizationSubsamples.png)

这里，每个像素包含 4 个子采样点（不相关的采样点都没有标注），蓝色采样点表示的是被三角形所遮盖的采样点，而灰色的则表示没有被遮盖的采样点。对于三角形内部的像素，片段着色器运行一次，颜色输出被存储到全部的 4 个子样本中。而在三角形的边缘，并不是所有的子采样点都被遮盖，所以片段着色器的结果将只会储存到部分的子样本中。根据被遮盖的子样本的数量，最终的像素颜色将由被遮盖的采样点中存储的颜色与其它未被遮盖的子样本中所储存的颜色来共同决定。

简单来说，一个像素中如果有更多的采样点被三角形遮盖，那么这个像素的颜色就会更接近于三角形的颜色。如果我们给上面的三角形填充颜色，就能得到以下的效果：

![Rasterization Subsamples Filled](/assets/img/post/LearnOpenGL-AdvancedOpenGL-AntiAliasing-RasterizationSubsamplesFilled.png)

对于每个像素来说，越少的子采样点被三角形所覆盖，那么它受到三角形的影响就越小。三角形的不平滑边缘被稍浅的颜色所包围后，从远处观察时就会显得更加平滑了。

不仅仅是颜色值会受到多重采样的影响，深度和模板测试也能够使用多个采样点。对深度测试来说，每个顶点的深度值会在运行深度测试之前被插值到各个子样本中。对模板测试来说，我们对每个子样本，而不是每个像素，存储一个模板值。当然，这也意味着深度和模板缓冲的大小会乘以子采样点的个数。

## References
>
> * [Anti-Aliasing - learnopengl](https://learnopengl.com/Advanced-OpenGL/Anti-Aliasing)
>