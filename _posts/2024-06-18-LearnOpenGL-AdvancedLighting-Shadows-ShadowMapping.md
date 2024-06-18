---
title: Shadow Mapping
description: 介绍阴影映射基础过程
date: 2024-06-18 00:00:00 +0800
categories: [Computer Grahics, LearnOpenGL, AdvancedLighting]
tags: [computergraphics, learnopengl, postprocess，shadow]     # TAG names should always be lowercase
---

## Improving shadow maps

We managed to get the basics of shadow mapping working, but as you can we're not there yet due to several (clearly visible) artifacts related to shadow mapping we need to fix. We'll focus on fixing these artifacts in the next sections.

### Shadow acne

It is obvious something is wrong from the previous image. A closer zoom shows us a very obvious Moiré-like pattern:

![Acne](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-Acne.png)

We can see a large part of the floor quad rendered with obvious black lines in an alternating fashion. This shadow mapping artifact is called shadow acne and can be explained by the following image:

![Acne Diagram](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-AcneDiagram.png)

Because the shadow map is limited by resolution, multiple fragments can sample the same value from the depth map when they're relatively far away from the light source. The image shows the floor where each yellow tilted panel represents a single texel of the depth map. As you can see, several fragments sample the same depth sample.

While this is generally okay, it becomes an issue when the light source looks at an angle towards the surface as in that case the depth map is also rendered from an angle. Several fragments then access the same tilted depth texel while some are above and some below the floor; we get a shadow discrepancy. Because of this, some fragments are considered to be in shadow and some are not, giving the striped pattern from the image.

We can solve this issue with a small little hack called a shadow bias where we simply offset the depth of the surface (or the shadow map) by a small bias amount such that the fragments are not incorrectly considered above the surface.

![Acne Bias](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-AcneBias.png)

With the bias applied, all the samples get a depth smaller than the surface's depth and thus the entire surface is correctly lit without any shadows. We can implement such a bias as follows:

```glsl
float bias = 0.005;
float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0; 
```

A shadow bias of 0.005 solves the issues of our scene by a large extent, but you can imagine the bias value is highly dependent on the angle between the light source and the surface. If the surface would have a steep angle to the light source, the shadows may still display shadow acne. A more solid approach would be to change the amount of bias based on the surface angle towards the light: something we can solve with the dot product:

```glsl
float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005); 
```

Here we have a maximum bias of 0.05 and a minimum of 0.005 based on the surface's normal and light direction. This way, surfaces like the floor that are almost perpendicular to the light source get a small bias, while surfaces like the cube's side-faces get a much larger bias. The following image shows the same scene but now with a shadow bias:

![With Bias](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithBias.png)

Choosing the correct bias value(s) requires some tweaking as this will be different for each scene, but most of the time it's simply a matter of slowly incrementing the bias until all acne is removed.

### Peter panning

A disadvantage of using a shadow bias is that you're applying an offset to the actual depth of objects. As a result, the bias may become large enough to see a visible offset of shadows compared to the actual object locations as you can see below (with an exaggerated bias value):

![Peter Panning](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-PeterPanning.png)

This shadow artifact is called peter panning since objects seem slightly detached from their shadows. We can use a little trick to solve most of the peter panning issue by using front face culling when rendering the depth map. You may remember from the [face culling](https://learnopengl.com/Advanced-OpenGL/Face-Culling) chapter that OpenGL by default culls back-faces. By telling OpenGL we want to cull front faces during the shadow map stage we're switching that order around.

Because we only need depth values for the depth map it shouldn't matter for solid objects whether we take the depth of their front faces or their back faces. Using their back face depths doesn't give wrong results as it doesn't matter if we have shadows inside objects; we can't see there anyways.

![Without Culling](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithoutCulling.png)

![With Culling](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-WithCulling.png)

To fix peter panning we cull all front faces during the shadow map generation. Note that you need to enable GL_CULL_FACE first.

```glsl
glCullFace(GL_FRONT);
RenderSceneToDepthMap();
glCullFace(GL_BACK); // don't forget to reset original culling face
```

This effectively solves the peter panning issues, but only for solid objects that actually have an inside without openings. In our scene for example, this works perfectly fine on the cubes. However, on the floor it won't work as well as culling the front face completely removes the floor from the equation. The floor is a single plane and would thus be completely culled. If one wants to solve peter panning with this trick, care has to be taken to only cull the front faces of objects where it makes sense.

Another consideration is that objects that are close to the shadow receiver (like the distant cube) may still give incorrect results. However, with normal bias values you can generally avoid peter panning.

### Over sampling

Another visual discrepancy which you may like or dislike is that regions outside the light's visible frustum are considered to be in shadow while they're (usually) not. This happens because projected coordinates outside the light's frustum are higher than 1.0 and will thus sample the depth texture outside its default range of [0,1]. Based on the texture's wrapping method, we will get incorrect depth results not based on the real depth values from the light source.

![Outside Frustum](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-OutsideFrustum.png)

You can see in the image that there is some sort of imaginary region of light, and a large part outside this area is in shadow; this area represents the size of the depth map projected onto the floor. The reason this happens is that we earlier set the depth map's wrapping options to GL_REPEAT.

What we'd rather have is that all coordinates outside the depth map's range have a depth of 1.0 which as a result means these coordinates will never be in shadow (as no object will have a depth larger than 1.0). We can do this by configuring a texture border color and set the depth map's texture wrap options to GL_CLAMP_TO_BORDER:

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);
float borderColor[] = { 1.0f, 1.0f, 1.0f, 1.0f };
glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);
```

Now whenever we sample outside the depth map's [0,1] coordinate range, the texture function will always return a depth of 1.0, producing a shadow value of 0.0. The result now looks more plausible:

![Clamp Edge](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-ClampEdge.png)

> 在计算片段是否是阴影点时，若该片段是以光源为视角的视图体范围之外的场景片段，那么其在光源视图体内裁剪坐标是超出 [-w, w] 范围之外的（正射视图 w = 1.0），从光源视角的场景深度图采样深度值的时候，裁剪坐标转换到纹理坐标会超出 [0.0, 1.0] 范围之外，超出纹理范围之外 OpenGL 默认的行为是重复这个纹理图像进行采样，光源视图体区域外就会有一些地方显示阴影不正确的情况。其实在以光源为视角的视图体范围之外的片段应该处理为非阴影点，所以我们更希望所有超出深度图范围的坐标的采样返回值是 1.0，因此可以设置纹理边框颜色 z 分量为 1.0，并设置纹理环绕方式为超出坐标为用户指定的边缘颜色 GL_CLAMP_TO_BORDER。这一步限制的是采样深度图后返回的深度值。
{: .prompt-tip }

There seems to still be one part showing a dark region. Those are the coordinates outside the far plane of the light's orthographic frustum. You can see that this dark region always occurs at the far end of the light source's frustum by looking at the shadow directions.

A light-space projected fragment coordinate is further than the light's far plane when its z coordinate is larger than 1.0. In that case the GL_CLAMP_TO_BORDER wrapping method doesn't work anymore as we compare the coordinate's z component with the depth map values; this always returns true for z larger than 1.0.

The fix for this is also relatively easy as we simply force the shadow value to 0.0 whenever the projected vector's z coordinate is larger than 1.0:

```c
float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
    if(projCoords.z > 1.0)
        shadow = 0.0;
    
    return shadow;
}  
```

Checking the far plane and clamping the depth map to a manually specified border color solves the over-sampling of the depth map. This finally gives us the result we are looking for:

![OverSampling Fixed](/assets/img/post/LearnOpenGL-AdvancedLighting-Shadows-ShadowMapping-OverSamplingFixed.png)

The result of all this does mean that we only have shadows where the projected fragment coordinates sit inside the depth map range so anything outside the light frustum will have no visible shadows.

> 在计算片段是否是阴影点时，若该片段是以光源为视角的视图体范围之外的场景片段，那么其在光源视图体内裁剪坐标是超出 [-w, w] 范围之外的（正射视图 w = 1.0），归一化深度值也是大于 1.0 的。其实在以光源为视角的视图体范围之外的片段应该处理为非阴影点，所以我们在光源视图体内片段的裁剪坐标深度值大于 w.0 时直接认定为非阴影点。这一步限制的是片段在光源视图体内深度值。
{: .prompt-tip }