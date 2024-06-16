---
title: Hessian Normal Form Plane Equations
description: 平面方程的海森法线形式
date: 2024-06-16 00:00:00 +0800
categories: [Math]
tags: [math, plane, hessian, normal]     # TAG names should always be lowercase
math: true
---

## Plane Equations

It is especially convenient to specify planes in so-called Hessian normal form. This is obtained from the general equation of a plane

以所谓的 Hessian 法线形式指定平面尤其方便。这是从平面的一般方程中得到的

$$
ax + by + cz + d = 0    \tag{1}
$$

by defining the components of the unit normal vector $\mathbf{n} = (n_x,\ n_y,\ n_z)$:

通过定义单位法向量的分量 $\mathbf{n} = (n_x,\ n_y,\ n_z)$：

$$
n_x = \frac{a}{\sqrt{a^2+b^2+c^2}}  \tag{2}
$$

$$
n_y = \frac{b}{\sqrt{a^2+b^2+c^2}}  \tag{3}
$$

$$
n_z = \frac{c}{\sqrt{a^2+b^2+c^2}}  \tag{4}
$$

and the constant

和常量

$$
q = \frac{d}{\sqrt{a^2+b^2+c^2}}    \tag{5}
$$

as well as point $\mathbf{p}=(p_x,\ p_y,\ p_z)$ in the plane. Then the Hessian normal form of the plane is

以及平面内的点 $\mathbf{p}=(p_x,\ p_y,\ p_z)$。然后平面的海森法线形式是

$$
\mathbf{n} \cdot \mathbf{p} = -q    \tag{6}
$$

note that $\mathbf{n} \cdot \mathbf{p}$ is dot product of vectors, and $q$ is the distance of the plane from the origin. Here, the sign of $q$ determines the side of the plane on which the origin is located. If $q>0$, it is in the half-space determined by the direction of $\mathbf{n}$, and if $q<0$, it is in the other half-space.

注意 $\mathbf{n} \cdot \mathbf{p}$ 是两向量的点积，并且 $q$ 是从原点到平面的距离。$q$ 的符号决定了原点是位于平面的哪一边。如果 $q>0$，原点是在 $\mathbf{n}$ 的方向确定的一半空间内，如果 $q<0$，原点是在另一半空间内。

The [point-plane distance](https://mathworld.wolfram.com/Point-PlaneDistance.html) from a point $\mathbf{p}_0$ to a plane (6) is given by the simple equation

从一点 $\mathbf{p}_0$ 到平面 (6) 的点-面距离由简单的方程给出

$$
D = \mathbf{n} \cdot \mathbf{p}_0 + q    \tag{7}
$$

If the point $\mathbf{p}_0$ is in the half-space determined by the direction of $\mathbf{n}$, then $D>0$; if it is in the other half-space, then $D<0$.

如果点 $\mathbf{p}_0$ 在 $\mathbf{n}$ 的方向确定的一半空间里，那么 $D>0$；如果它在另一半空间里，那么 $D<0$。

## 涉及的向量与矩阵知识点

![Dot Product as Matrix-Matrix Multiplication](/assets/images/Math-PlaneHessianNormalForm-DotProductasMatrixMatrixMultiplication.png)


## References
>
> * [Plane --- Wolfram Mathworld](https://mathworld.wolfram.com/Plane.html)
>
> * [Hessian Normal Form --- Wolfram Mathworld](https://mathworld.wolfram.com/HessianNormalForm.html)
>
> * [Point-Plane Distance --- Wolfram Mathworld](https://mathworld.wolfram.com/Point-PlaneDistance.html)
>