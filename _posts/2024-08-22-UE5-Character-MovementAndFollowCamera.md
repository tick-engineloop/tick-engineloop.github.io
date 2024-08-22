---
title: Character's Camera Controls and Movement Settings
description: 设置角色的相机控制和移动，使其与官方第三人称示例保持一致。
date: 2024-08-22 00:00:00 +0800
categories: [Computer Grahics, UE5, Character]
tags: [ue5, character]     # TAG names should always be lowercase
---

在创建了自己的角色，添加输入映射、移动输入、摄像机输入事件后，想要使自己的角色移动行为以及相机控制保持与官方第三人称示例一致，需要做以下几步设置。

首先，选中蓝图编辑器左侧组件概览面板中的角色蓝图类：

![Components Outliner BP_TPCharacter](/assets/img/post/UE5_3_1-Character-ComponentsOutliner-BP_TPCharacter.png)

在其编辑器右侧细节面板中【Pawn】栏下取消对【Use Controller Rotation Yaw】的勾选，不使用控制器的偏航旋转：

![ComponentsDetails BP_TPCharacter Pawn](/assets/img/post/UE5_3_1-Character-ComponentsDetails-BP_TPCharacter-Pawn.png)

如果在操纵角色时需要使角色始终朝向前方，则在【Character Movement(Rotation Setting)】下取消对【Orient Rotation to Movement】的勾选。如果勾选【Orient Rotation to Movement】，则会朝向加速方向旋转角色，表示在操纵角色时使角色朝向移动方向。

![ComponentsDetails BP_TPCharacter CharacterMovement](/assets/img/post/UE5_3_1-Character-ComponentsDetails-BP_TPCharacter-CharacterMovement.png)

然后，在蓝图编辑器左侧组件概览面板中选中弹簧臂组件【CameraBoom】：

![ComponentsOutliner CameraBloom](/assets/img/post/UE5_3_1-Character-ComponentsOutliner-CameraBloom.png)

在其编辑器右侧细节面板中【Camera Settings】栏下勾选【Use Pawn Control Rotation】，使用 Pawn 的旋转：

![ComponentsDetails CameraBloom CameraSettings](/assets/img/post/UE5_3_1-Character-ComponentsDetails-CameraBloom-CameraSettings.png)
