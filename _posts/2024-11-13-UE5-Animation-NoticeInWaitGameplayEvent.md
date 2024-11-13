---
title: 在动画中添加 AnimNotify 时的注意事项
description: 在动画中添加 AnimNotify 时需要注意，如果太靠近动画结尾，则不会触发某些事件，导致你的程序逻辑没有完全执行
date: 2024-11-13 00:00:00 +0800
categories: [Computer Grahics, UE5, Animation]
tags: [ue, animation, notify]     # TAG names should always be lowercase
---

在制作基于 GAS 的连招时，遇到在某些情况下 WaitGameplayEvent 函数的 EventReceived 回调函数无法触发之问题。在做了一些实验后发现，若在动画中添加 AnimNotify 时，如果通知触发的点离开动画结尾（动画序列或动画蒙太奇片段的结尾）一些，会正常执行 WaitGameplayEvent 函数的 EventReceived 回调函数，如果通知触发的点太靠近动画结尾（动画序列或蒙太奇片段的结尾），则不会执行 WaitGameplayEvent 函数的 EventReceived 回调函数。

{% include embed/bilibili.html id='BV1NqUKYXEb5' %}

如上所示，开始时我的名为 Attack_01_04 的动画蒙太奇片段中有一个名为 AN_ComboEnd 的动画通知，它离 Attack_01_04 片段结尾还有一些距离，当角色身上播放 Attack_01_04 蒙太奇片段时，在到达其中的 AN_ComboEnd 动画通知点后，AN_ComboEnd 的 ReceivedNotify 函数会向角色发送带有 `Ability.Event.ComboEnd` 标记的事件，角色的 GA_Attack_01_04 技能会在播放蒙太奇的同时等待带有 `Ability.Event.ComboEnd` 标记的事件，在收到 AN_ComboEnd 发出的带有 `Ability.Event.ComboEnd` 标记的事件后，就会执行 WaitGameplayEvent 函数的 EventReceived 回调函数，去移除一个 Loose 类型的标记 `Ability.Action.Attack.Combo.NextAttack.0104`。我在 RemoveLooseGameplayTags 上添加的断点正常触发了，印证了 WaitGameplayEvent 函数的 EventReceived 回调函数正常执行了，`Ability.Action.Attack.Combo.NextAttack.0104` 这个标记将会被从角色身上移除。而当我将 AN_ComboEnd 移到 Attack_01_04 片段结尾后，当角色身上播放 Attack_01_04 蒙太奇片段时，在到达其中的 AN_ComboEnd 动画通知点后，AN_ComboEnd 的 ReceivedNotify 函数向角色发送了带有 `Ability.Event.ComboEnd` 标记的事件，但是 WaitGameplayEvent 函数的 EventReceived 回调函数中 RemoveLooseGameplayTags 上的断点并没有触发，而且技能结束后 `Ability.Action.Attack.Combo.NextAttack.0104` 也没有被从角色身上移除，说明 WaitGameplayEvent 函数的 EventReceived 回调函数没有被正常执行。