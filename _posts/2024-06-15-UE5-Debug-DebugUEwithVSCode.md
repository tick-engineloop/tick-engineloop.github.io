---
title: 在 VS Code 中调试 UE
description: 介绍如何在 ubuntu 系统环境下搭建 UE 调试环境
date: 2024-06-15 00:00:00 +0800
categories: [Computer Grahics, UE5, Debug]
tags: [vscode, ue]     # TAG names should always be lowercase
---

Ubuntu 22.04.4、UE5.3.1

1.打开编辑器，创建一个 C++ 工程项目：

![Create Project](/assets/img/post/DebugUEInVSCode-1-CreateProject.png)

选择一个模版工程，以 Third Person 为例，默认创建【BLUEPRINT】蓝图工程，点击【C++】改为创建 C++ 工程。点击【Create】后成功创建工程，编辑器退出。若已安装 vscode，在创建工程成功后会自动打开 vscode 软件，vscode 首次打开 UE 工程项目会提示安装一些扩展插件和 .NET8 等工具。

2.再次用编辑器打开创建的 C++ 工程项目，配置打包时二进制程序构建类型为【Debug】：

![Binary Configuration](/assets/img/post/DebugUEInVSCode-2-BinaryConfiguration.png)

3.点击【PackageProject】开始打包：

![Package Project](/assets/img/post/DebugUEInVSCode-3-PackageProject.png)

4.选择打包路径为项目根目录：

![Set Package Path](/assets/img/post/DebugUEInVSCode-4-SetPackagePath.png)

打包成功后将在项目根目录下生成一个【Linux】文件夹，存放的是打包后的项目各种资产、配置和程序文件：

![Package Path](/assets/img/post/DebugUEInVSCode-5-PackagePath.png)

项目应用程序二进制文件生成位置是：

![Binary Path](/assets/img/post/DebugUEInVSCode-6-BinaryPath.png)

5.在 vscode 中更改【Run and Debug】程序。在项目工程管理文件中将 Launch program 替换成我们上一步打包后生成的程序：

![Before Set Launch](/assets/img/post/DebugUEInVSCode-7-BeforeSetLaunch.png)

具体来说就是将上图中标示程序替换成下图中标示程序：

![After Set Launch](/assets/img/post/DebugUEInVSCode-8-AfterSetLaunch.png)

因为我们在UE中配置的打包构建类型是 Debug，所以在这里我们修改的也是 Launch ThirdPerson (Debug) 这一项的 program。

6.在 vscode 中选择【Run and Debug】程序。选择我们刚刚配置的 Launch ThirdPerson (Debug) 开始调试。

![Select Launch Program](/assets/img/post/DebugUEInVSCode-9-SelectLaunchProgram.png)