(() => {
  'use strict';

  const canvas = document.getElementById('ocean');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const G = 9.81;
  const PATCH_SIZE = 200;
  const SPECTRUM_SCALE = 0.00001;
  const state = { size: 64, windSpeed: 12, windDirection: 25, amplitude: 1, speed: 1, playing: true };
  const camera = { x: 0, y: 24, z: 80, yaw: 0, pitch: 0.58, zoom: 1 };
  const view = { sinYaw: 0, cosYaw: 1, sinPitch: 0, cosPitch: 1 };
  const pressedKeys = new Set();
  const nearPlane = 2;
  let W = 1, H = 1, dpr = 1, startTime = performance.now(), frozenTime = 0;
  let noiseRe, noiseIm, h0Re, h0Im, omega, specRe, specIm, heights, cellOrder = [];
  let renderHeights, screenX, screenY, depth, frameCount = 0, lastFpsTime = performance.now();
  let orderDirty = true, lastFrameTime = performance.now(), dragging = false, pointerX = 0, pointerY = 0;
  let randomSeed = 123456789;

  function random() {
    randomSeed = (1664525 * randomSeed + 1013904223) >>> 0;
    return (randomSeed + 1) / 4294967297;
  }

  function gaussian() {
    const u = Math.max(random(), Number.MIN_VALUE);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  }

  function frequency(index, size) {
    return index < size / 2 ? index : index - size;
  }

  function buildSpectrum() {
    const n = state.size;
    const count = n * n;
    if (!noiseRe || noiseRe.length !== count) {
      noiseRe = new Float64Array(count);
      noiseIm = new Float64Array(count);
      for (let i = 0; i < count; i++) {
        noiseRe[i] = gaussian();
        noiseIm[i] = gaussian();
      }
    }
    h0Re = new Float64Array(count);
    h0Im = new Float64Array(count);
    omega = new Float64Array(count);
    specRe = new Float64Array(count);
    specIm = new Float64Array(count);
    heights = new Float64Array(count);
    renderHeights = new Float64Array((n + 1) * (n + 1));
    screenX = new Float64Array((n + 1) * (n + 1));
    screenY = new Float64Array((n + 1) * (n + 1));
    depth = new Float64Array((n + 1) * (n + 1));
    orderDirty = true;

    const angle = state.windDirection * Math.PI / 180;
    const windX = Math.cos(angle), windZ = Math.sin(angle);
    const windLength = state.windSpeed * state.windSpeed / G;
    const deltaK = 2 * Math.PI / PATCH_SIZE;

    for (let z = 0; z < n; z++) {
      const kz = deltaK * frequency(z, n);
      for (let x = 0; x < n; x++) {
        const kx = deltaK * frequency(x, n);
        const k = Math.hypot(kx, kz);
        const index = z * n + x;
        if (k === 0) continue;

        const alignment = kx * windX + kz * windZ;
        const spectrum = SPECTRUM_SCALE
          * Math.exp(-1 / ((k * windLength) ** 2))
          * (alignment ** 2)
          / (k ** 4);
        const magnitude = Math.sqrt(Math.max(0, spectrum) / 2);
        h0Re[index] = noiseRe[index] * magnitude;
        h0Im[index] = noiseIm[index] * magnitude;
        omega[index] = Math.sqrt(G * k);
      }
    }
  }

  function inverseFft1D(re, im, offset, stride, n) {
    let j = 0;
    for (let i = 1; i < n; i++) {
      let bit = n >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      if (i < j) {
        const a = offset + i * stride, b = offset + j * stride;
        let value = re[a]; re[a] = re[b]; re[b] = value;
        value = im[a]; im[a] = im[b]; im[b] = value;
      }
    }

    for (let length = 2; length <= n; length <<= 1) {
      const half = length >> 1;
      const angle = 2 * Math.PI / length;
      const stepRe = Math.cos(angle), stepIm = Math.sin(angle);
      for (let start = 0; start < n; start += length) {
        let twiddleRe = 1, twiddleIm = 0;
        for (let k = 0; k < half; k++) {
          const even = offset + (start + k) * stride;
          const odd = offset + (start + k + half) * stride;
          const oddRe = re[odd] * twiddleRe - im[odd] * twiddleIm;
          const oddIm = re[odd] * twiddleIm + im[odd] * twiddleRe;
          const evenRe = re[even], evenIm = im[even];
          re[even] = evenRe + oddRe;
          im[even] = evenIm + oddIm;
          re[odd] = evenRe - oddRe;
          im[odd] = evenIm - oddIm;
          const nextRe = twiddleRe * stepRe - twiddleIm * stepIm;
          twiddleIm = twiddleRe * stepIm + twiddleIm * stepRe;
          twiddleRe = nextRe;
        }
      }
    }
  }

  function updateHeight(time) {
    const n = state.size;
    for (let z = 0; z < n; z++) {
      for (let x = 0; x < n; x++) {
        const index = z * n + x;
        const opposite = ((n - z) % n) * n + ((n - x) % n);
        const phase = omega[index] * time;
        const cos = Math.cos(phase), sin = Math.sin(phase);
        const ar = h0Re[index], ai = h0Im[index];
        const br = h0Re[opposite], bi = h0Im[opposite];
        specRe[index] = state.amplitude * (ar * cos - ai * sin + br * cos - bi * sin);
        specIm[index] = state.amplitude * (ar * sin + ai * cos - br * sin - bi * cos);
      }
    }

    for (let z = 0; z < n; z++) inverseFft1D(specRe, specIm, z * n, 1, n);
    for (let x = 0; x < n; x++) inverseFft1D(specRe, specIm, x, n, n);

    for (let i = 0; i < heights.length; i++) heights[i] = specRe[i];
  }

  function project(x, z, height, focal, centerX, centerY) {
    const dx = x - camera.x, dy = height - camera.y, dz = z - camera.z;
    const right = dx * view.cosYaw + dz * view.sinYaw;
    const forward = dx * view.sinYaw - dz * view.cosYaw;
    const up = dx * view.sinYaw * view.sinPitch + dy * view.cosPitch - dz * view.cosYaw * view.sinPitch;
    const distance = forward * view.cosPitch - dy * view.sinPitch;
    return [centerX + focal * right / distance, centerY - focal * up / distance, distance];
  }

  function waterColor(height, shade) {
    const level = Math.max(0, Math.min(1, 0.48 + height * 0.25));
    const r = Math.round(8 + 22 * level + shade * 12);
    const g = Math.round(91 + 99 * level + shade * 20);
    const b = Math.round(125 + 100 * level + shade * 18);
    return `rgb(${r},${g},${b})`;
  }

  function buildCellOrder() {
    const n = state.size;
    const spacing = PATCH_SIZE / n;
    const sinYaw = Math.sin(camera.yaw), cosYaw = Math.cos(camera.yaw);
    cellOrder = [];
    for (let z = 0; z < n - 1; z++) {
      for (let x = 0; x < n - 1; x++) {
        const depthFromCamera = x * spacing * sinYaw - z * spacing * cosYaw;
        cellOrder.push({ x, z, depth: depthFromCamera });
      }
    }
    cellOrder.sort((a, b) => a.depth - b.depth);
    orderDirty = false;
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    const n = state.size;
    const spacing = PATCH_SIZE / n;
    const focal = H * 0.9 * camera.zoom;
    const centerX = W / 2;
    const centerY = H * 0.53;
    const stride = Math.max(1, Math.floor(n / 18));
    view.sinYaw = Math.sin(camera.yaw);
    view.cosYaw = Math.cos(camera.yaw);
    view.sinPitch = Math.sin(camera.pitch);
    view.cosPitch = Math.cos(camera.pitch);
    const baseGridX = Math.floor(camera.x / spacing) - (n >> 1);
    const baseGridZ = Math.floor(camera.z / spacing) - (n >> 1);
    const rowSize = n + 1;

    for (let z = 0; z <= n; z++) {
      const worldGridZ = baseGridZ + z;
      const sampleZ = ((worldGridZ % n) + n) % n;
      const worldZ = worldGridZ * spacing;
      for (let x = 0; x <= n; x++) {
        const worldGridX = baseGridX + x;
        const sampleX = ((worldGridX % n) + n) % n;
        const index = z * rowSize + x;
        const point = project(worldGridX * spacing, worldZ,
          heights[sampleZ * n + sampleX], focal, centerX, centerY);
        renderHeights[index] = heights[sampleZ * n + sampleX];
        screenX[index] = point[0];
        screenY[index] = point[1];
        depth[index] = point[2];
      }
    }

    if (orderDirty) buildCellOrder();
    for (const cell of cellOrder) {
      const x = cell.x, z = cell.z;
      const a = z * rowSize + x, b = a + 1, c = a + rowSize, d = c + 1;
      if (depth[a] <= nearPlane || depth[b] <= nearPlane
          || depth[c] <= nearPlane || depth[d] <= nearPlane) continue;
      const ha = renderHeights[a], hb = renderHeights[b], hc = renderHeights[c], hd = renderHeights[d];
      const average = (ha + hb + hc + hd) / 4;
      const slope = Math.max(-1, Math.min(1, (ha - hd) * 0.18));
      ctx.beginPath();
      ctx.moveTo(screenX[a], screenY[a]); ctx.lineTo(screenX[c], screenY[c]); ctx.lineTo(screenX[d], screenY[d]);
      ctx.moveTo(screenX[a], screenY[a]); ctx.lineTo(screenX[d], screenY[d]); ctx.lineTo(screenX[b], screenY[b]);
      ctx.closePath();
      ctx.fillStyle = waterColor(average, slope);
      ctx.fill();
    }

    ctx.beginPath();
    for (let z = 0; z < n; z += stride) {
      let drawing = false;
      for (let x = 0; x <= n; x++) {
        const index = z * rowSize + x;
        if (depth[index] <= nearPlane) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(screenX[index], screenY[index]); drawing = true; }
        else ctx.lineTo(screenX[index], screenY[index]);
      }
    }
    for (let x = 0; x <= n; x += stride) {
      let drawing = false;
      for (let z = 0; z <= n; z++) {
        const index = z * rowSize + x;
        if (depth[index] <= nearPlane) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(screenX[index], screenY[index]); drawing = true; }
        else ctx.lineTo(screenX[index], screenY[index]);
      }
    }
    ctx.strokeStyle = 'rgba(204, 247, 250, 0.2)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    $('time').textContent = `t = ${time.toFixed(1)} s`;
    $('position').textContent = `相机 ${camera.x.toFixed(0)}, ${camera.z.toFixed(0)} · 高 ${camera.y.toFixed(0)} m`;
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
      $('frame').textContent = `${Math.round(frameCount * 1000 / (now - lastFpsTime))} FPS · ${n}²`;
      frameCount = 0;
      lastFpsTime = now;
    }
  }

  function render() {
    const now = performance.now();
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;
    moveCamera(deltaTime);
    const time = state.playing
      ? frozenTime + (now - startTime) / 1000 * state.speed
      : frozenTime;
    updateHeight(time);
    draw(time);
    requestAnimationFrame(render);
  }

  function moveCamera(deltaTime) {
    let forward = Number(pressedKeys.has('w') || pressedKeys.has('arrowup'))
      - Number(pressedKeys.has('s') || pressedKeys.has('arrowdown'));
    let sideways = Number(pressedKeys.has('d') || pressedKeys.has('arrowright'))
      - Number(pressedKeys.has('a') || pressedKeys.has('arrowleft'));
    const length = Math.hypot(forward, sideways);
    if (length > 0) {
      forward /= length;
      sideways /= length;
      const speed = 35 * deltaTime;
      camera.x += (view.sinYaw * forward + view.cosYaw * sideways) * speed;
      camera.z += (-view.cosYaw * forward + view.sinYaw * sideways) * speed;
    }

    if (pressedKeys.has('e')) camera.y += 25 * deltaTime;
    if (pressedKeys.has('q')) camera.y -= 25 * deltaTime;
    camera.y = Math.max(5, Math.min(120, camera.y));
  }

  function isInteractiveTarget(target) {
    return target instanceof HTMLElement
      && target !== canvas
      && ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(target.tagName);
  }

  const navigationKeys = new Set([
    'w', 'a', 's', 'd', 'q', 'e',
    'arrowup', 'arrowdown', 'arrowleft', 'arrowright'
  ]);
  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (!navigationKeys.has(key) || isInteractiveTarget(event.target)) return;
    pressedKeys.add(key);
    event.preventDefault();
  });
  window.addEventListener('keyup', event => pressedKeys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => pressedKeys.clear());

  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.focus();
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging) return;
    const deltaX = event.clientX - pointerX;
    const deltaY = event.clientY - pointerY;
    pointerX = event.clientX;
    pointerY = event.clientY;
    camera.yaw = Math.atan2(Math.sin(camera.yaw + deltaX * 0.004), Math.cos(camera.yaw + deltaX * 0.004));
    camera.pitch = Math.max(-0.2, Math.min(1.15, camera.pitch + deltaY * 0.004));
    orderDirty = true;
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    camera.zoom = Math.max(0.45, Math.min(3, camera.zoom * Math.exp(-event.deltaY * 0.001)));
  }, { passive: false });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || 800;
    H = canvas.clientHeight || 480;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateValue(id, text) {
    $(`${id}-value`).textContent = text;
  }

  $('wind-speed').addEventListener('input', event => {
    state.windSpeed = Number(event.target.value);
    updateValue('wind-speed', `${state.windSpeed} m/s`);
    buildSpectrum();
  });
  $('wind-direction').addEventListener('input', event => {
    state.windDirection = Number(event.target.value);
    updateValue('wind-direction', `${state.windDirection}°`);
    buildSpectrum();
  });
  $('amplitude').addEventListener('input', event => {
    state.amplitude = Number(event.target.value);
    updateValue('amplitude', `${state.amplitude.toFixed(1)}×`);
  });
  $('speed').addEventListener('input', event => {
    const now = performance.now();
    if (state.playing) frozenTime += (now - startTime) / 1000 * state.speed;
    startTime = now;
    state.speed = Number(event.target.value);
    updateValue('speed', `${state.speed.toFixed(1)}×`);
  });
  $('resolution').addEventListener('change', event => {
    state.size = Number(event.target.value);
    updateValue('resolution', `${state.size} × ${state.size}`);
    buildSpectrum();
  });
  $('toggle').addEventListener('click', event => {
    const now = performance.now();
    if (state.playing) {
      frozenTime += (now - startTime) / 1000 * state.speed;
      state.playing = false;
      event.currentTarget.textContent = '▶ 播放';
    } else {
      startTime = now;
      state.playing = true;
      event.currentTarget.textContent = '❚❚ 暂停';
    }
    event.currentTarget.setAttribute('aria-pressed', String(state.playing));
  });
  $('reset').addEventListener('click', () => {
    randomSeed = (randomSeed + 0x9e3779b9) >>> 0;
    noiseRe = null;
    noiseIm = null;
    frozenTime = 0;
    startTime = performance.now();
    buildSpectrum();
  });

  window.addEventListener('resize', resize);
  buildSpectrum();
  resize();
  requestAnimationFrame(render);
})();
