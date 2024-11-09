---
title: 蒙太奇分段
description: 在 UE5.4.4 中为蒙太奇创建分段
date: 2024-11-09 00:00:00 +0800
categories: [Computer Grahics, UE5, Animation]
tags: [ue, animation, montage]     # TAG names should always be lowercase
---

![New Montage Section](/assets/img/post/UE5-Animation-NewMontageSection.gif)

可以为蒙太奇分段重命名，鼠标左键点击选中分段名称，在右侧细节面板中【Section】栏的【Section Name】中为分段重命名。可以在蒙太奇中创建一个新的分段，首先鼠标左键单击选中绿色的动画序列（选中后动画序列变为蓝色），然后鼠标右键单击，在弹出的操作列表中选择【New Montage Section】，再然后在弹出的【Section Name】框中输入分段名称并回车，左右拉动分段名称左侧的拖动条到合适的位置，最后，在右侧的【Montage Sections】属性窗口中每两个分段间点击箭头，选择【Remove Link】，以移除分段间的连接，这样在播放蒙太奇片段后就会停止播放动画，而不是继续播放下一个分段中的动画。

## References
>
> * [UE5.4 角色动画蓝图状态机状态节点调试方法](https://www.bilibili.com/video/BV1CED6YSEn8/?spm_id_from=333.999.0.0&vd_source=0a67abb40c91f2db86ad327ada7ae9df)
