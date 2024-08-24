---
title: HBAO
description: 图像空间水平基准环境光遮蔽(Image-Space Horizon-Based Ambient Occlusion)是一种环境光遮蔽技术，用于增强实时渲染场景中的光照效果和深度感。
date: 2024-08-24 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting, AO]
tags: [computergraphics, learnopengl, postprocess, ao]     # TAG names should always be lowercase
---

下面我们参照 Cesium 中后处理阶段的 HBAO 处理，来看看 HBAO 的计算过程。首先是遮挡因子的生成，摘自 [AmbientOcclusionGenerate](https://github.com/CesiumGS/cesium/blob/1.52/Source/Shaders/PostProcessStages/AmbientOcclusionGenerate.glsl) 文件：

```glsl
uniform sampler2D randomTexture;
uniform sampler2D depthTexture;
uniform float intensity;            // = 3.0
uniform float bias;                 // = 0.1
uniform float lengthCap;            // = 0.26
uniform float stepSize;             // = 1.95
uniform float frustumLength;        // = 1000.0

varying vec2 v_textureCoordinates;

vec4 clipToEye(vec2 uv, float depth)
{
    // =====================================================================
    // 将像素的屏幕空间坐标 uv.xy 两个分量转换到 NDC 空间
    // =====================================================================
    // 因本 AO 的 GLSL 代码摘自 Cesium，所以使用的 GL API 是 WebGL，在 Web 
    // 浏览器上，canvas 窗口的原点在左上角，X 轴正轴指向右侧，Y 轴正轴指向下方，
    // 与 NDC 的 X 轴向右 Y 轴向上有一点差异，在 Y 轴上正轴方向相反，所以此处在
    // 转换到 NDC 空间时需要翻转 Y 轴使用 1.0 - uv.y。如果在桌面 OpenGL 程序中，
    // 则不存在这种差异，其窗口原点在左下角，X 轴正轴指向右侧，Y 轴正轴指向上方。
    // 与 NDC 的 X 轴向右 Y 轴向上保持一致，在转换到 NDC 空间时是直接使用 uv.y。
    // =====================================================================
    // WebGL 与 OpenGL 在 NDC 空间中原点以及轴朝向上是一致的，gl.viewport 以及 
    // glViewport 指定的也都是视口的左下角坐标和宽高，只是在屏幕画布的 Y 轴上有方向差异。
    // =====================================================================
    vec2 xy = vec2((uv.x * 2.0 - 1.0), ((1.0 - uv.y) * 2.0 - 1.0));     

    // =====================================================================
    // 将像素的 NDC 空间坐标转换为摄像机空间坐标
    // =====================================================================
    // 转换推理过程可见：
    // https://tick-engineloop.github.io/posts/LearnOpenGL-Basics-CoordinateSystems/#backword
    // =====================================================================
    vec4 posEC = czm_inverseProjection * vec4(xy, depth, 1.0);          // czm_inverseProjection 是投影变换矩阵， vec4(xy, depth, 1.0) 是像素在 NDC 空间的坐标
    posEC = posEC / posEC.w;
    
    return posEC;
}

// Reconstruct Normal Without Edge Removation
// 在没有边缘检测的情况下，利用相邻像素的深度值，计算相机空间中给定位置（posInCamera）处的表面法线向量，特别适合于无法直接从几何数据获取法线向量的情况
vec3 getNormalXEdge(vec3 posInCamera, float depthU, float depthD, float depthL, float depthR, vec2 pixelSize)
{
    vec4 posInCameraUp = clipToEye(v_textureCoordinates - vec2(0.0, pixelSize.y), depthU);
    vec4 posInCameraDown = clipToEye(v_textureCoordinates + vec2(0.0, pixelSize.y), depthD);
    vec4 posInCameraLeft = clipToEye(v_textureCoordinates - vec2(pixelSize.x, 0.0), depthL);
    vec4 posInCameraRight = clipToEye(v_textureCoordinates + vec2(pixelSize.x, 0.0), depthR);

    // 计算屏幕空间中与当前像素紧邻的上、下、左、右四个像素，在摄像机空间中与当前像素形成的四个方向量
    vec3 up = posInCamera.xyz - posInCameraUp.xyz;
    vec3 down = posInCameraDown.xyz - posInCamera.xyz;
    vec3 left = posInCamera.xyz - posInCameraLeft.xyz;
    vec3 right = posInCameraRight.xyz - posInCamera.xyz;

    // 对于每个方向（水平和垂直），选择长度较小的差向量。这通常是为了减少由于深度不连续（如物体边缘）或噪声引起的误差。
    vec3 DX = length(left) < length(right) ? left : right;
    vec3 DY = length(up) < length(down) ? up : down;

    // 求出与 DX 和 DY 均垂直的法线，并将其归一化
    return normalize(cross(DY, DX));
}

void main(void)
{
    float depth = czm_readDepth(depthTexture, v_textureCoordinates);    // 利用屏幕空间的 xy 坐标获取当前像素的深度
    vec4 posInCamera = clipToEye(v_textureCoordinates, depth);          // 获取当前像素在摄像机空间中的位置坐标，其中 v_textureCoordinates 和 depth 构成当前像素在屏幕空间（或视口中）的 xyz 坐标

    if (posInCamera.z > frustumLength)
    {
        gl_FragColor = vec4(1.0);
        return;
    }

    vec2 pixelSize = 1.0 / czm_viewport.zw;                                                     // 计算单个像素大小，在 GL 中视口 viewport.xyzw 的 xy 代表视口左下角坐标，zw 代表视口的宽高
    float depthU = czm_readDepth(depthTexture, v_textureCoordinates- vec2(0.0, pixelSize.y));   // 向上偏移一个像素的深度
    float depthD = czm_readDepth(depthTexture, v_textureCoordinates+ vec2(0.0, pixelSize.y));   // 向下偏移一个像素的深度
    float depthL = czm_readDepth(depthTexture, v_textureCoordinates- vec2(pixelSize.x, 0.0));   // 向左偏移一个像素的深度
    float depthR = czm_readDepth(depthTexture, v_textureCoordinates+ vec2(pixelSize.x, 0.0));   // 向右偏移一个像素的深度
    vec3 normalInCamera = getNormalXEdge(posInCamera.xyz, depthU, depthD, depthL, depthR, pixelSize);

    float ao = 0.0;
    vec2 sampleDirection = vec2(1.0, 0.0);
    float gapAngle = 90.0 * czm_radiansPerDegree;                           // = PI / 2

    // RandomNoise
    float randomVal = texture2D(randomTexture, v_textureCoordinates).x;     // 直接从预生成的随机噪声纹理中获取随机值，而不是在着色器中计算随机值，这样做可节省算力

    float inverseViewportWidth = 1.0 / czm_viewport.z;                      // 单个像素的宽度
    float inverseViewportHeight = 1.0 / czm_viewport.w;                     // 单个像素的高度

    // Loop for each direction
    // 取带偏转角度的十字形的 4 个边作为采样方向，每个采样方向取 6 个采样点，即 4 个方向，每个方向前进 6 步
    for (int i = 0; i < 4; i++)
    {
        float newGapAngle = gapAngle * (float(i) + randomVal);              // randomVal 使得在该着色器计算屏幕上每个像素的 AO 值时，采样方向上有不同的偏转，可以增加采样的随机性，减少模式化噪声。
        float cosVal = cos(newGapAngle);
        float sinVal = sin(newGapAngle);

        // Rotate Sampling Direction
        // 由 sampleDirection、cosVal、sinVal 共同控制生成采样方向
        vec2 rotatedSampleDirection = vec2(cosVal * sampleDirection.x - sinVal * sampleDirection.y, sinVal * sampleDirection.x + cosVal * sampleDirection.y);
        float localAO = 0.0;
        float localStepSize = stepSize;

        //Loop for each step
        for (int j = 0; j < 6; j++)                           
        {
            // 使用 (localStepSize * inverseViewportWidth, localStepSize * inverseViewportHeight) 对 rotatedSampleDirection 进行缩放，形成步进向量
            vec2 directionWithStep = vec2(rotatedSampleDirection.x * localStepSize * inverseViewportWidth, rotatedSampleDirection.y * localStepSize * inverseViewportHeight);
            vec2 newCoords = directionWithStep + v_textureCoordinates;  // 以 v_textureCoordinates 为起点，沿 directionWithStep 方向前进 |directionWithStep| 长度，形成新的屏幕空间样本点坐标

            //Exception Handling
            if(newCoords.x > 1.0 || newCoords.y > 1.0 || newCoords.x < 0.0 || newCoords.y < 0.0)
            {
                break;
            }

            float stepDepthInfo = czm_readDepth(depthTexture, newCoords);               // 获取屏幕空间样本点的深度
            vec4 stepPosInCamera = clipToEye(newCoords, stepDepthInfo);                 // 计算样本点在摄像机空间中的位置
            vec3 diffVec = stepPosInCamera.xyz - posInCamera.xyz;                       // 计算样本点和当前像素在摄像机空间中对应点之间的差向量
            float len = length(diffVec);                                                // 计算样本点和当前像素在摄像机空间中对应点之间的差向量长度

            // 如果这个差向量长度超过了设定的最大长度（lengthCap），则认为这个采样点太远了，不考虑其遮挡效果。
            if (len > lengthCap)
            {
                break;
            }

            // 计算样本点对当前像素点的遮挡程度，这通常是通过计算当前像素在摄像机空间中法线（normalInCamera）和上述差向量 diffVec 之间的点积（dotVal），
            // 并应用一个权重（weight）来实现的。权重通常与摄像机空间中样本点和当前像素点它们的对应点之间的距离成反比，以模拟距离越远遮挡效果越弱的效果。
            float dotVal = clamp(dot(normalInCamera, normalize(diffVec)), 0.0, 1.0 );   // 计算两个向量的夹角余弦值，余弦值越大，夹角越小，样本点对当前像素形成更强的遮挡
            float r = len / lengthCap;                                                  // 对样本点和当前像素在摄像机空间中对应点之间的距离进行归一化，r 大于 0 小于 1
            float weight = 1.0 - r * r;                                                 // 以 1 - pow(r, 2) 作为权重，模拟距离越远遮挡效果越弱的效果

            if (dotVal < bias)  // 应用偏置（bias）来避免自遮挡。
            {
                dotVal = 0.0;
            }

            localAO = max(localAO, dotVal * weight);                                    // 求出该采样方向上最大的 localAO，localAO 越大，说明遮挡效果越强
            localStepSize += stepSize;                                                  // 增加步进距离
        }
        ao += localAO;
    }

    ao /= 4.0;
    ao = 1.0 - clamp(ao, 0.0, 1.0);         // 生成 ao 因子，遮挡多的地方应该越暗，遮挡少的地方应该越亮
    ao = pow(ao, intensity);
    gl_FragColor = vec4(vec3(ao), 1.0);
}
```

对上一步生成的图像进行高斯模糊后，再是利用遮挡因子调整场景图像，摘自 [AmbientOcclusionModulate](https://github.com/CesiumGS/cesium/blob/1.52/Source/Shaders/PostProcessStages/AmbientOcclusionModulate.glsl)：

```
uniform sampler2D colorTexture;
uniform sampler2D ambientOcclusionTexture;
uniform bool ambientOcclusionOnly;
varying vec2 v_textureCoordinates;

void main(void)
{
    vec3 color = texture2D(colorTexture, v_textureCoordinates).rgb;
    vec3 ao = texture2D(ambientOcclusionTexture, v_textureCoordinates).rgb;
    gl_FragColor.rgb = ambientOcclusionOnly ? ao : ao * color;
}
```