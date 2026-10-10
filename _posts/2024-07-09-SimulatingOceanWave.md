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

其中，$(k_x, k_z)$ 构成波矢向量 $\vec{k}$：它的模 $k = \lvert \vec{k} \rvert$ 决定空间频率（与波长成反比），方向则决定波的朝向。$k_x x + k_z z$ 可写成向量 $\vec{k}$ 和 向量 $\vec{p}$ 点积乘的形式，那么上式可写成如下形式：

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

这就是一个简单子波形的复指数形式。需要说明的是，引入复指数只是为了便于运算，单条波的真正波高取它的实部即可。如果波形模拟的是海浪，那么就要结合海浪的特征，来确定 $h$ 中 $A$、$\omega$ 和 $\phi$ 的取值：$\omega$ 由水波的色散关系给出，是 $k = \lvert \vec{k} \rvert$ 的函数；$A$ 由半经验的海浪功率谱（例如 Phillips 谱）给出，是 $\vec{k}$ 的函数；而初相 $\phi$ 取随机值，由随机振幅一并给出（见下文）。于是 $h$ 是关于 $\vec{k}$ 和 $t$ 的函数，海浪子波形的复指数形式就是：

$$
h(\vec{k}, t) e^{i(\vec{k} \cdot \vec{p})}
$$

那么，$\vec{p}$ 点处 $t$ 时刻的 $y$ 值，可由多个这种形式的具有不同 $\vec{k}$ 值的简单子波形叠加求得

$$
y = H(\vec{p}, t) = \sum_{\vec{k} } h(\vec{k},t)e^{ i (\vec{k} \cdot \vec{p})}
$$

有了这个描述高度场的函数，剩下的就是确定 $h(\vec{k}, t)$ 中的 $A$ 、$\omega$ 如何计算。大多数海浪是重力波（即风浪），作用于水的干扰力是风，而恢复力是重力。首先来看 $\omega$，$\omega$ 是一种色散关系（dispersion relationship）。色散关系是一个物理学中的概念，特别是在波动理论中，它描述了波的传播速度与波的频率或波长之间的关系。在海洋学和水波理论中，色散关系描述了波浪在介质（如水）中传播时，其速度如何随波长变化。在深水区，有如下的色散关系：

$$
\omega = \omega(k) = \sqrt{g k}
$$

其中，$g$ 是重力加速度，一般是 $9.8 m/sec^2$。$k$ 是向量 $\vec{k}$ 的大小或长度。在浅水区，水底海床对波浪会有阻滞作用，其色散关系是：

$$
\omega = \omega(k) = \sqrt{g k \tanh(kD)}
$$

其中，$D$ 是水深。如果水深足够大，$\tanh$ 函数就会趋近于 1，这个浅水区色散关系就会变得和深水区色散关系相同。对于波长大约在1cm 或更小的小波而言，色散关系中有一个额外的项：

$$
\omega = \omega(k) = \sqrt{g k (1 + k^2 \ell^2)}
$$

其中 $\ell = \sqrt{\gamma / (\rho g)}$ 是只与液体性质有关的长度尺度（水的毛细长度约为 $2.7\ \text{mm}$），$\gamma$ 是表面张力系数，$\rho$ 是水的密度。当波长远大于毛细波长时 $\ell$ 的影响可以忽略，上式退化为深水色散关系。接下来来看振幅：

$$
A = A(\vec{k}) = \frac{1}{\sqrt{2}}(\xi_r + i \xi_i) \sqrt{P_h(\vec{k})}
$$

这里 $\xi_r$ 和 $\xi_i$ 是高斯随机数生成器的普通独立抽样，高斯分布的随机数往往更符合海浪的实验数据。$P_h(\vec{k})$ 是半经验的波浪功率谱（power spectrum），它给出每个波矢 $\vec{k}$ 上波动的能量密度。

系数 $\frac{1}{\sqrt{2}}$ 的来历也不难看出：$\xi_r$、$\xi_i$ 是两个独立的标准正态随机数，$\lvert \xi_r + i \xi_i \rvert^2$ 的期望为 2，于是

$$
\mathbb{E}\big[ \lvert A(\vec{k}) \rvert^2 \big] = \frac{1}{2} \cdot 2 \cdot P_h(\vec{k}) = P_h(\vec{k})
$$

即振幅的期望功率恰好等于功率谱在 $\vec{k}$ 处的取值。在充分开放的海域，适合风浪波（比毛细波更大的波）的波谱是 Phillips 波谱：

$$
P_h(\vec{k}) = C \frac{e^{\frac{-1}{(k L_{\text{wind}})^2}}}{k^4} \lvert \vec{k} \cdot \vec{d}_{wind} \rvert ^2
$$

这里 $C$ 是一个数值常量，用来整体缩放波浪的幅度；$k$ 是向量 $\vec{k}$ 的大小或长度。$L_{\text{wind}} = V^2 / g$ 是在一个速度为 $V$ 的持续风中可能升起的最大的波长，$g$ 是重力加速度。$\vec d_{wind}$ 是表示风向的**单位向量**（$\lvert \vec d_{wind} \rvert = 1$），这一点需要注意：若传入未归一化的风向，谱值会整体差一个 $\lvert \vec d_{wind} \rvert^2$ 因子。Phillips 波谱中的余弦因子 $\lvert \vec{k} \cdot \vec d_{wind} \rvert ^2$ 消除了垂直于风向移动的波：只有当波矢 $\vec{k}$ 平行于风向时该因子才取到最大值，$\vec{k}$ 越偏离风向，谱值越小。

到这里我们就相继确定了 $\omega$ 和 $A$，现在再来回头看看 $h(\vec{k}, t)$。给定一个色散关系 $\omega(k)$，在 $t$ 时刻的傅里叶振幅可实现为：

$$
h(\vec{k}, t) = A(\vec{k}) e^{i \omega(k) t} + A^*(-\vec{k}) e^{-i \omega(k) t}
$$

> 随机初相是让海面显得自然、不重复的关键，但它其实已经包含在随机振幅 $A(\vec{k})$ 里了，$\xi_r + i \xi_i$ 本身就带一个均匀随机的相位，所以这里不再单列 $\phi$。
{: .prompt-tip }

式中的第二项 $A^*(-\vec{k}) e^{-i \omega(k) t}$ 是振幅的共轭项，它让 $h(\vec{k}, t)$ 具有**共轭对称性**（Hermitian 对称）：

$$
h(-\vec{k}, t) = A(-\vec{k}) e^{i \omega t} + A^*(\vec{k}) e^{-i \omega t} = \overline{A(\vec{k}) e^{i \omega t} + A^*(-\vec{k}) e^{-i \omega t}} = \overline{h(\vec{k}, t)}
$$

> 这里用到了 $\lvert -\vec{k} \rvert = \lvert \vec{k} \rvert$，所以 $-\vec{k}$ 与 $\vec{k}$ 对应的 $\omega$ 相同。
{: .prompt-tip }

有了这个对称性，高度场

$$
H(\vec{p}, t) = \sum_{\vec{k}} h(\vec{k}, t) e^{i \vec{k} \cdot \vec{p}}
$$

就必然是实数：把求和变量 $\vec{k}$ 换成 $-\vec{k}$，可得 $H^* = H$。这正是前面所说"为了保证 FFT 的结果是实数，需要加一个共轭项"的原因。

## Accelerating Waveform Calculations with FFT

假定水面大小为 $L_x$ 和 $L_z$，水面网格大小为 $N_x$ 和 $N_z$。为了简化计算，一般约定 $L_x = L_z = L$，$N_x = N_z = N$。对于 $N$ 而言，可以是 16 和 2048 之间的值，大多数情况下 128 到 512 范围内的值就足够了。如果使用 $(n, m)$ 表示网格上的点，那么对于 $\vec{k} = (k_x, k_z)$, 我们定义 $k_x = 2 \pi n / L_x = 2 \pi n / L$ 和 $k_z = 2 \pi m / L_z = 2 \pi m / L$，这里 $n$ 和 $m$ 是整数且有边界 $-N/2 = -N_x/2 \le n \lt N_x/2 = N/2$ 和 $-N/2 = -N_z/2 \le m \lt N_z/2 = N/2$。FFT 处理生成高度场在离散点 $\vec{p} = (x, z) = (n L_x / N_x, m L_z/ N_z) = (n L / N, m L/ N)$ 处的值。将 $\vec{k}$ 和 $\vec{p}$ 代入高度场函数：

$$
\begin{aligned}
H(\vec{p}, t) 
&= \sum_{\vec{k} } h(\vec{k},t)e^{ i (\vec{k} \cdot \vec{p})} \\
&= \sum_{n = -N/2}^{N/2 - 1} \sum_{m = -N/2}^{N/2 - 1} h(\vec{k},t) e^{i(2 \pi \frac{n}{L} x + 2 \pi \frac{m}{L} z)} \\
&= \sum_{n = -N/2}^{N/2 - 1} \sum_{m = -N/2}^{N/2 - 1} h(\vec{k},t) e^{i(2 \pi \frac{n}{L} x)} e^{i(2 \pi \frac{m}{L} z)} \\
&= \sum_{n = -N/2}^{N/2 - 1} e^{i(2 \pi \frac{n}{L} x)} \sum_{m = -N/2}^{N/2 - 1} h(\vec{k},t) e^{i(2 \pi \frac{m}{L} z)} \\
&= \sum_{n = -N/2}^{N/2 - 1} e^{2 \pi n x i / L} \sum_{m = -N/2}^{N/2 - 1} h(\vec{k},t) e^{2 \pi m z i / L}
\end{aligned}
$$

为了便于化成 FFT 的形式，我们需要将 $\sum$ 的下界和上界之间的范围转换到 $0, 1, ... , N-1$，定义 $n'$ 和 $m'$：

$$
0 \le n' \lt N \\

0 \le m' \lt N
$$

因此，$n$ 和 $m$ 可以被写成 $n'$ 和 $m'$ 的形式：

$$
n = n' - \frac{N}{2} \\

m = m' - \frac{N}{2}
$$

代入高度场函数：

$$
\begin{aligned}
H(\vec{p}, t) 
&= \sum_{n = -N/2}^{N/2 - 1} e^{2 \pi n x i / L} \sum_{m = -N/2}^{N/2 - 1} h(\vec{k},t) e^{2 \pi m z i / L} \\
&= \sum_{n' = 0}^{N-1} \sum_{m' = 0}^{N-1} h(\vec{k}, t) \, e^{2 \pi (n' - \frac{N}{2}) x i / L} \, e^{2 \pi (m' - \frac{N}{2}) z i / L} \\
&= \sum_{n' = 0}^{N-1} \sum_{m' = 0}^{N-1} h(\vec{k}, t) \, e^{2 \pi n' x i / L} e^{- \pi N x i / L} \, e^{2 \pi m' z i / L} e^{- \pi N z i / L}
\end{aligned}
$$

其中波矢 $\vec{k} = \big( 2 \pi (n' - \frac{N}{2}) / L, \ 2 \pi (m' - \frac{N}{2}) / L \big)$。令高度场在离散网格点 $\vec{p} = (x_p, z_q) = (p L / N, \ q L / N)$（$p, q = 0, 1, \dots, N - 1$）处取值，则有 $e^{- \pi N x_p i / L} = e^{- \pi p i} = (-1)^p$ 和 $e^{- \pi N z_q i / L} = (-1)^q$，代入可得：

$$
H(x_p, z_q, t) = (-1)^{p + q} \sum_{n' = 0}^{N-1} \sum_{m' = 0}^{N-1} h(\vec{k}, t) \, e^{2 \pi i (n' p + m' q) / N}
$$

等号右端的二重求和正是**二维离散傅里叶逆变换**（Inverse DFT）的标准形式，只是频率索引相对于数组下标平移了 $N/2$（即 $n = n' - N/2$），由此多出的 $(-1)^{p+q}$ 是一个只与输出网格点下标有关的棋盘格符号。这样一来，就能借助 FFT 在 $O(N^2 \log N)$ 的时间内求出整张网格上的高度值，而不必按原始定义做 $O(N^4)$ 的二重求和。

实现时需要注意频谱数组的下标顺序。FFT 程序通常要求频谱按「自然顺序」存放，即下标 $0, 1, \dots, N/2 - 1$ 对应频率 $0, 1, \dots, N/2 - 1$，下标 $N/2, \dots, N - 1$ 对应频率 $-N/2, \dots, -1$（相当于对频谱数组做一次循环移位）；若直接沿用上面 $n' = n + N/2$ 的下标，则只需在逆 FFT 之后再对结果乘上 $(-1)^{p+q}$，两者是等价的。

### 算法流程

综合以上推导，基于 FFT 的海浪模拟可以分为两步：

1. **初始化**（只执行一次）：对每一个波矢 $\vec{k}$，用独立的标准正态随机数 $\xi_r$、$\xi_i$ 与 Phillips 波谱 $P_h(\vec{k})$ 计算 $A(\vec{k}) = \frac{1}{\sqrt{2}}(\xi_r + i \xi_i) \sqrt{P_h(\vec{k})}$，即 $t = 0$ 时刻的频谱；同时预计算色散关系 $\omega(k) = \sqrt{gk}$。

2. **逐帧更新**（每帧执行）：用 $h(\vec{k}, t) = A(\vec{k}) e^{i \omega(k) t} + A^*(-\vec{k}) e^{-i \omega(k) t}$ 更新频谱，再对其做一次二维逆 FFT，取实部即可得到当前时刻高度场 $H(x_p, z_q, t)$ 的全部顶点。

```c++
// N 为网格边长，L 为水面尺寸，G 为重力加速度
// 数组下标 i 对应的频率为 i（i < N/2）或 i - N（i >= N/2），即 FFT 的自然顺序
auto freq = [N](int i) { return (i < N / 2) ? i : i - N; };

// ---- 初始化：只执行一次 ----
for (int m = 0; m < N; ++m)
for (int n = 0; n < N; ++n) {
    float kx = 2.0f * PI * freq(n) / L;
    float kz = 2.0f * PI * freq(m) / L;
    float k  = std::sqrt(kx * kx + kz * kz);
    h0[n][m]    = {gauss(), gauss()};                  // 两个独立的标准正态随机数
    h0[n][m]   *= std::sqrt(Phillips(kx, kz) / 2.0f);
    omega[n][m] = std::sqrt(G * k);                    // 深水色散关系
}

// ---- 更新：每帧执行 ----
for (int m = 0; m < N; ++m)
for (int n = 0; n < N; ++n) {
    auto e = std::exp(Complex{0.0f, omega[n][m] * t});
    // 共轭项 A*(-k)：-k 对应的数组下标为 (N - n) % N 与 (N - m) % N
    spec[n][m] = h0[n][m] * e
               + std::conj(h0[(N - n) % N][(N - m) % N]) * std::conj(e);
}
IFFT2(spec);                                           // 二维逆 FFT
for (int m = 0; m < N; ++m)
for (int n = 0; n < N; ++n)
    height[n][m] = spec[n][m].real();                  // 取实部，得到高度场
```

### 参数选取与 Nyquist 上限

高度场定义在一块 $L \times L$ 的网格上，网格间距为 $\Delta = L / N$，因此它可以表示的空间频率存在上限（Nyquist 频率）：

$$
k_{\max} = \frac{\pi}{\Delta} = \frac{\pi N}{L}, \qquad \lambda_{\min} = \frac{2 \pi}{k_{\max}} = \frac{2 L}{N}
$$

- $\Delta$ 决定最小可分辨的波纹尺度。比 $2L/N$ 更短的波无法被网格表示，只会以走样（混叠）的形式混进来，所以 $N$ 不能取得太小。
- $L$ 决定海面的空间重复周期。水面在水平方向上是循环重复的，$L$ 取大一些可以减弱「一眼就看出在平铺」的感觉。
- $N$ 决定计算量。二维逆 FFT 的复杂度是 $O(N^2 \log N)$，$N$ 翻倍时计算量约变为原来的 4 倍多。

此外，谱中 $k > k_{\max}$ 的那部分能量在离散化时被丢掉了，因此实际波高还需要靠 Phillips 谱里的常量 $C$ 整体缩放来调节。

### 数值细节

实现时还有几个容易踩的坑：

1. **$\vec{k} = 0$ 处要特判**。$P_h(\vec{k})$ 在 $k \to 0$ 时的极限是 $0$（指数项 $e^{-1/(k L_{\text{wind}})^2}$ 衰减得比任何幂次都快），但直接代入会得到 $0 / 0$ 从而算出 NaN。把 $\vec{k} = 0$ 处的谱值直接置 $0$ 即可，这同时也避免了高度场出现一个常数偏移。

2. **注意 FFT 库的归一化约定**。不少库的逆变换自带 $1/N^2$ 系数，也有不带系数的。若前后搞混，整片海面的波高会整体差 $N^2$ 倍——表现出来就是要么平如镜面，要么高得离谱。

3. **固定随机种子即可复现同一片海**。$\xi_r$、$\xi_i$ 一般在初始化时生成一次即可；如果希望每次运行都得到完全相同的海面（例如离线烘焙法线贴图），在初始化之前固定随机数种子就行。

4. **$t$ 是解析代入的，不需要时间积分**。每一帧只是把新的 $t$ 代进 $e^{\pm i \omega t}$ 重算一次频谱，而不在上一步的结果上做数值积分，因此不会累积误差，也可以任意跳帧（暂停、快进、倒放都行）。

## References
>
> * [振幅、周期、相移和频率 - 数学乐](https://www.shuxuele.com/algebra/amplitude-period-frequency-phase-shift.html)
>
> * [Simulating Ocean Water - J. Tessendorf](https://people.computing.clemson.edu/~jtessen/reports/papers_files/coursenotes2004.pdf)
>
> * [复数 - OI Wiki](https://oi-wiki.org/math/complex/)
>
> * [共轭复数 - wikiwand](https://www.wikiwand.com/zh-cn/%E5%85%B1%E8%BD%AD%E5%A4%8D%E6%95%B0)
