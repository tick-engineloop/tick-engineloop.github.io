---
title: Simulating Ocean Wave with FFT
description: 使用 FFT 模拟海浪
date: 2024-07-09 00:00:00 +0800
categories: [Math]
tags: [math, fft, ocean, wave]     # TAG names should always be lowercase
math: true
---

## Introduction

首先，约定 $y$ 轴正方向表示垂直向上，$xz$ 平面表示水平面，那么海水表面就是一个连续的高度场，可表示为：

$$
y = H(x, z, t)
$$

其中，$t$ 是时间变量，因为水面在不同时刻是动态变化的，所以它也是一个与时间有关的函数。当然，在计算机中我们需要离散的表示这一高度场。即就是建立一个网格平面，计算出网格平面中每个 $(x, z)$ 坐标处顶点的 $y$ 值。

![Mesh Plane](/assets/img/post/SimulatingOceanWave-MeshPlane.png)

![Wave Plane](/assets/img/post/SimulatingOceanWave-WavePlane.png)

如果将坐标 $(x, z)$ 用位置向量 $\vec{p}$ 代替，高度场表示形式变为：

$$
\begin{aligned}
y
&= H(x, z, t) \\
&= H(\vec{p}, t)
\end{aligned}
$$

可以把高度场看做一种信号，信号通常在**时间域**中给出：一个把时间映射到振幅的函数。傅里叶分析允许我们将时间域上信号表示成不同频率的相移正弦曲线的加权叠加。

## Trigonometric functions

首先来了解一下一维正弦函数，有如下形式：

$$
A \sin(k x + \omega t + \phi)
$$

其中，$A$ 是振幅。$k$ 是波数或空间频率，它决定了波在空间中单位长度内振动的次数，具体来说，$k$ 的大小与波长 $\lambda$ 成反比，即$k = \frac{2 \pi}{\lambda} $。$x$ 是空间位置。$\omega$ 是角频率，表示振动的快慢。$t$ 是时间，没有 $t$ 正弦函数就是一个静止的曲线，加上 $t$ 可使曲线随时间动起来。$\phi$ 是初始相位。

![Period And Amplitude](/assets/img/post/SimulatingOceanWave-PeriodAndAmplitude.svg)

![Phase Shift](/assets/img/post/SimulatingOceanWave-PhaseShift.svg)

一维正弦函数用来描述一条曲线，而二维正弦函数则可以用来描述一个曲面：

$$
A \sin(k_x x + k_z z + \omega t + \phi)
$$

其中，$(k_x, k_y)$ 构成波矢向量 $\vec{k}$，它决定了波的移动方向和长度。$k_x x + k_z z$ 可写成向量 $\vec{k}$ 和 向量 $\vec{p}$ 点积乘的形式，那么上式可写成如下形式：

$$
A \sin(\vec{k} \cdot \vec{p} + \omega t + \phi)
$$

![Sin](/assets/img/post/SimulatingOceanWave-Sin.gif)

## Wave

傅里叶分析允许我们将时间域上信号表示成不同频率的相移正弦曲线的加权叠加。一个复杂波形可以看做由多个不同的简单波形叠加而成。

![Multi Sin](/assets/img/post/SimulatingOceanWave-MultiSin.gif)

首先来看简单子波形的一般表示方式，根据复数的指数表示形式和三角表示形式关系 $e^{ix} = \cos x + i \sin x$，对于三角表示形式的简单子波形，我们可以用复指数形式代替，即

$$
A \big( \cos(\vec{k} \cdot \vec{p} + \omega t + \phi) + i \sin(\vec{k} \cdot \vec{p} + \omega t + \phi) \big)
$$

可写为：

$$
A e^{i(\vec{k} \cdot \vec{p} + \omega t + \phi)}
$$

对上式做变化，可变成：

$$
A e^{i(\omega t + \phi)} e^{i(\vec{k} \cdot \vec{p})}
$$

令 $h = A e^{i(\omega t + \phi)}$，上式可简写成：

$$
h e^{i(\vec{k} \cdot \vec{p})}
$$

这就是一个简单子波形的复指数形式。如果波形模拟的是海浪，那么就要结合海浪的特征，来确定 $h$ 中 $A$ 、$\omega$ 和 $\phi$ 的值，因为 $\phi$ 是常数数值，所以需要确定的就只剩下 $A$ 和 $\omega$。根据 Phillips 的波浪谱模型，$A$ 是关于 $\vec{k}$ 的函数，$\omega$ 是关于 $\vec{k}$ 的幅度的函数，而 $h$ 是关于 $A$ 、$\omega$、$t$ 的函数，所以 $h$ 是关于 $\vec{k}$ 和 $t$ 的函数，海浪子波形的复指数形式就是：

$$
h(\vec{k}, t) e^{i(\vec{k} \cdot \vec{p})}
$$

那么，$\vec{p}$ 点处 $t$ 时刻的 $y$ 值，可由多个这种形式的具有不同 $\vec{k}$ 值的简单子波形叠加求得

$$
y = H(\vec{p}, t) = \sum_{\vec{k} } h(\vec{k},t)e^{ i (\vec{k} \cdot \vec{p})}
$$

有了这个描述高度场的函数，剩下的就是确定 $h(\vec{k}, t)$ 中的 $A$ 、$\omega$ 如何计算。大多数海浪是引力风波，作用于水的干扰力是风，而恢复力是重力。首先来看 $\omega$，$\omega$ 是一种色散关系（dispersion relationship）。色散关系是一个物理学中的概念，特别是在波动理论中，它描述了波的传播速度与波的频率或波长之间的关系。在海洋学和水波理论中，色散关系描述了波浪在介质（如水）中传播时，其速度如何随波长变化。在深水区，有如下的色散关系：

$$
\omega = \omega(k) = \sqrt{g k}
$$

其中，$g$ 是重力加速度，一般是 $9.8 m/sec^2$。$k$ 是向量 $\vec{k}$ 的大小或长度。在浅水区，水底海床对波浪会有阻滞作用，其色散关系是：

$$
\omega = \omega(k) = \sqrt{g k \tanh(kD)}
$$

其中，$D$ 是水深。如果水深足够大，$\tanh$ 函数就会趋近于 1，这个浅水区色散关系就会变得和深水区色散关系相同。对于波长大约在1cm 或更小的小波而言，色散关系中有一个额外的项：

$$
\omega = \omega(k) = \sqrt{g k (1 + k^2 L^2)}
$$

参数 $L$ 的单位是长度。它的大小是表面张力所产生的影响。接下来来看振幅：

$$
A = A(\vec{k}) = \frac{1}{\sqrt{2}}(\xi_r + i \xi_i) \sqrt{P_h(\vec{k})}
$$

这里 $\xi_r$ 和 $\xi_i$ 是高斯随机数生成器的普通独立抽样，高斯分布的随机数往往更符合海浪的实验数据。$P_h(\vec{k})$ 是半经验海洋波谱分析模型，在充分开放的海域，适合风浪波（比毛细波更大的波）的波谱是 Phillips 波谱：

$$
P_h(\vec{k}) = C \frac{e^{\frac{-1}{(kL)^2}}}{k^4} \lvert \vec{k} \cdot \vec{d}_{wind} \lvert ^2
$$

这里 $C$ 是一个数值常量，表示波浪整体的幅度。$k$ 是向量 $\vec{k}$ 的大小或长度。$L = V^2 / g$ 是在一个速度为 $V$ 的持续风中可能升起的最大的波，$g$ 是重力加速度。Phillips 波谱中的余弦因子 $\lvert \hat{k} \cdot \vec{d}_{wind} \lvert ^2$ 消除了垂直于风向移动的波，$\hat{k}$ 是波的方向，$\vec{d}_{wind}$ 是风的方向。

到这里我们就相继确定了 $\omega$ 和 $A$，现在再来回头看看 $h(\vec{k}, t)$。给定一个色散关系 $\omega(k)$，在 $t$ 时刻的傅里叶振幅可实现为：

$$
h(\vec{k}, t) = A(\vec{k}) e^{i\big(\omega(k) t + \phi \big)} + A^*(\vec{-k}) e^{-i\big(\omega(k) t + \phi \big)}
$$

因为初相 $\phi$ 可有可无，无关紧要，在这里进行省略，就有：

$$
h(\vec{k}, t) = A(\vec{k}) e^{i \omega(k) t} + A^*(-\vec{k}) e^{-i \omega(k) t}
$$

为了保证 FFT 的结果是实数，我们在 $h(\vec{k}, t)$ 中添加了一个共轭复数项。

## References
>
> * [振幅、周期、相移和频率 - 数学乐](https://www.shuxuele.com/algebra/amplitude-period-frequency-phase-shift.html)
>
