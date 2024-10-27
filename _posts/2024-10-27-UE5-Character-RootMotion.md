---
title: Root Motion
description: 通过根运动（Root Motion）动画，你可以用动画数据驱动角色的动作，从而在关卡中创建更真实的动作。
date: 2024-10-27 00:00:00 +0800
categories: [Computer Grahics, UE5, Character]
tags: [ue5, character]     # TAG names should always be lowercase
---

## Overview

通过根运动（Root Motion）动画，你可以用动画数据驱动角色的动作，从而在关卡中创建更真实的动作。下面将以如下蓝图视口编辑器中的一个使用了骨骼网格体组件和胶囊体组件的角色为例介绍根运动。

![Character Capsule](/assets/img/post/UE5_5-Character-RootMotion-CharacterCapsule.png)

## Root Bone

动画由骨骼网格体的骨架驱动，而骨架由许多骨骼构成。根骨骼（Root Bone）是骨架的基础骨骼；与其它骨骼不同，根骨骼不是为了显示骨架中的某个骨骼，比如腿或者手臂，而是当作整个骨架结构的一个参考点。以下是一个骨骼网格体示例，高亮黄色框标注出了根骨骼的位置。

![Root Bone](/assets/img/post/UE5_5-Character-RootMotion-RootBone.png)

## Root Motion

一些动画在根骨骼上没有动画数据，那么根骨骼便会静止不动，骨骼和动画将停留在一个点上，另外的一些动画会让根骨骼跟随动画在3D空间中进行移动。如下面动画示例所示，在角色不运动的情况下，根骨骼固定的动画仍然会播放，但是角色不会发生任何实际的运动或位移。

![Root Motion Lock](/assets/img/post/UE5_5-Character-RootMotion-RootMotionLock.gif)

还有一些动画会给根骨骼安排一定位移。以下示例动画中根骨骼上有运动数据。其中红线代表根骨骼的移动轨迹，从起始位置到当前位置。

![Root Bone Displacement](/assets/img/post/UE5_5-Character-RootMotion-RootBoneDisplacement.gif)

然而，根骨骼上的运动数据在默认情况下不会影响角色的移动，必须先启用根运动（Root Motion）属性。如下图所示，启用动画的根运动后，根骨骼的运动数据能够驱动角色的运动，沿着根骨骼的运动方向移动角色。

![Has Root Motion](/assets/img/post/UE5_5-Character-RootMotion-HasRootMotion.gif)

通过用根运动驱动角色的运动，动画能够反复循环，从上一个循环的最后位置开始另一个循环。以下是一个反复循环的动画示例。

![Recursive Root Motion](/assets/img/post/UE5_5-Character-RootMotion-RecursiveRootMotion.gif)

不启用根运动时，动画会将骨骼网格体驱离根骨骼和角色（用线框胶囊表示）。骨骼网格体和角色分离，然后在动画循环结束的时候又回到初始的位置。

![No Root Motion](/assets/img/post/UE5_5-Character-RootMotion-NoRootMotion.gif)

## Enabling Root Motion

要启用并使用根运动功能，你必须先有一个带有根骨骼的骨架，并且在动画序列或者蒙太奇中启用根运动。该属性位于动画序列编辑器的资产细节（Asset Details）面板。

![Root Motion Details](/assets/img/post/UE5_5-Character-RootMotion-RootMotionDetails.png)

勾选其中的 "EnableRootMotion" 和 "Force Root Lock"。

## References
>
> * [Root Motion --- Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/root-motion-in-unreal-engine)