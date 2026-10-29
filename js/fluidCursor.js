/**
 * WebGL Fluid Simulation & Cinematic Magnetic Cursor
 * Diadaptasi dari arsitektur "PROFIL CAFE CINEMATIC" (Waroeng Kopi Sedap)
 * 
 * Terdiri dari 2 komponen sinematik:
 * 1. WebGL Navier-Stokes Fluid Dynamics (Asap / Uap Cair / Pusaran Fluida Fisik GPU)
 * 2. Magnetic Follower Cursor (Dot + Circle + Label Interaktif Melayang)
 */

import * as THREE from './vendor/three.module.js';

/**
 * 1. SIMULASI FLUIDA WEBGL DARI PROFIL CAFE CINEMATIC
 */
export async function initFluidCursor() {
  const canvas = document.querySelector('[data-fluid-cursor]');
  if (!canvas) return;

  // Optimasi Mobile & Layar Sentuh:
  // Pada HP / layar sentuh, matikan WebGL fluida kursor agar GPU tetap dingin & baterai awet
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
  const isLiteMode = document.body.classList.contains('lite-mode') || localStorage.getItem('hyouka_lite_mode') === 'true';

  if (isTouchDevice || isLiteMode) {
    canvas.style.display = 'none';
    return;
  }

  // Cek dukungan WebGL
  try {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;
  } catch (err) {
    console.warn('WebGL not supported for fluid cursor', err);
    return;
  }

  // Parameter simulasi dari proyek Cafe Cinematic (Disesuaikan agar ramping, halus, dan tidak terlalu besar)
  const intensity = 0.55;
  const simRes = 128;
  const dyeRes = 512;
  const iter = 3;
  const densityDissipation = 0.955;
  const velocityDissipation = 0.965;
  const pressureVal = 0.5;
  const radius = 0.0012;
  const speedMult = 2.6;
  const dt = 0.016;

  // Warna fluida dinamis sesuai suasana (Terang / Malam / Hujan)
  function getThemeFluidColor() {
    const theme = document.body.dataset.theme;
    if (theme === 'night') {
      return new THREE.Vector3(52 / 255, 230 / 255, 160 / 255); // Hijau aurora zamrud Tokoyo bercahaya
    }
    if (theme === 'rain') {
      return new THREE.Vector3(56 / 255, 189 / 255, 248 / 255); // Uap embun cyan
    }
    // Terang: Arang sumi-e pekat elegan yang artistik
    return new THREE.Vector3(35 / 255, 42 / 255, 50 / 255);
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: true
  });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const camera = new THREE.Camera();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mesh = new THREE.Mesh(geometry);
  mesh.frustumCulled = false;

  const createRT = (size, format, filter) =>
    new THREE.WebGLRenderTarget(size, size, {
      type: THREE.HalfFloatType,
      format,
      minFilter: filter,
      magFilter: filter,
      depthBuffer: false
    });

  const createDoubleRT = (...args) => ({
    read: createRT(...args),
    write: createRT(...args),
    swap() {
      const tmp = this.read;
      this.read = this.write;
      this.write = tmp;
    }
  });

  const dye = createDoubleRT(dyeRes, THREE.RGBAFormat, THREE.LinearFilter);
  const velocity = createDoubleRT(simRes, THREE.RGFormat, THREE.LinearFilter);
  const pressure = createDoubleRT(simRes, THREE.RedFormat, THREE.NearestFilter);
  const divergence = createRT(simRes, THREE.RedFormat, THREE.NearestFilter);

  // Vertex Shader dasar (Layar Penuh)
  const baseVertexShader = `
    precision highp float;
    in vec3 position;
    uniform vec2 texelSize;
    out vec2 vUv;
    out vec2 vL;
    out vec2 vR;
    out vec2 vT;
    out vec2 vB;
    void main() {
      vUv = position.xy * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const texelSize = { value: new THREE.Vector2(1 / simRes, 1 / simRes) };

  const createMaterial = (fragmentShader, uniforms = {}) =>
    new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: baseVertexShader,
      fragmentShader: `
        precision highp float;
        precision highp sampler2D;
        uniform vec2 texelSize;
        in vec2 vUv;
        in vec2 vL;
        in vec2 vR;
        in vec2 vT;
        in vec2 vB;
        out vec4 fragColor;
        ${fragmentShader}
      `,
      uniforms: { texelSize, ...uniforms },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false
    });

  // Splat shader (menciptakan dorongan gaya dan warna)
  const splatMat = createMaterial(
    `
    uniform sampler2D uTarget;
    uniform float uAspect;
    uniform vec3 uColor;
    uniform vec2 uPoint;
    uniform float uRadius;
    void main() {
      vec2 p = vUv - uPoint;
      p.x *= uAspect;
      fragColor = vec4(texture(uTarget, vUv).xyz + exp(-dot(p, p) / uRadius) * uColor, 1.0);
    }
    `,
    {
      uTarget: { value: null },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uColor: { value: new THREE.Vector3() },
      uPoint: { value: new THREE.Vector2() },
      uRadius: { value: radius }
    }
  );

  // Advection shader
  const advectionMat = createMaterial(
    `
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform float uDt;
    uniform float uDissipation;
    void main() {
      vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * texelSize;
      fragColor = vec4(uDissipation * texture(uSource, coord).xyz, 1.0);
    }
    `,
    {
      uVelocity: { value: null },
      uSource: { value: null },
      uDt: { value: dt },
      uDissipation: { value: 1.0 }
    }
  );

  // Divergence shader
  const divergenceMat = createMaterial(
    `
    uniform sampler2D uVelocity;
    void main() {
      float L = texture(uVelocity, vL).x;
      float R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y;
      float B = texture(uVelocity, vB).y;
      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }
    `,
    { uVelocity: { value: null } }
  );

  // Clear / pressure decay shader
  const clearMat = createMaterial(
    `
    uniform sampler2D uTexture;
    uniform float uValue;
    void main() {
      fragColor = uValue * texture(uTexture, vUv);
    }
    `,
    { uTexture: { value: null }, uValue: { value: pressureVal } }
  );

  // Pressure Jacobi solve shader
  const pressureMat = createMaterial(
    `
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      float div = texture(uDivergence, vUv).x;
      fragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
    }
    `,
    { uPressure: { value: null }, uDivergence: { value: divergence.texture } }
  );

  // Gradient subtraction shader
  const gradientSubMat = createMaterial(
    `
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      fragColor = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
    }
    `,
    { uPressure: { value: null }, uVelocity: { value: null } }
  );

  // Final density output shader (Warna Tinta / Aurora Sinematik)
  const displayMat = createMaterial(
    `
    uniform sampler2D uDensity;
    uniform vec3 uColor;
    uniform float uIntensity;
    void main() {
      float density = texture(uDensity, vUv).b;
      float a = clamp(density * uIntensity * 1.6, 0.0, 0.90);
      fragColor = vec4(uColor * a, a);
    }
    `,
    {
      uDensity: { value: null },
      uColor: { value: getThemeFluidColor() },
      uIntensity: { value: intensity }
    }
  );

  function renderPass(mat, target) {
    mesh.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(mesh, camera);
  }

  const pointerSplats = [];
  let idleFrames = 0;
  let lastX = null;
  let lastY = null;

  function onMove(x, y) {
    // Nonaktifkan efek fluida kursor di mode hujan
    if (document.body.dataset.theme === 'rain') return;

    if (lastX === null) {
      lastX = x;
      lastY = y;
      return;
    }
    const dx = (x - lastX) * speedMult;
    const dy = (lastY - y) * speedMult;

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      pointerSplats.push({
        x: x / window.innerWidth,
        y: 1.0 - y / window.innerHeight,
        dx,
        dy
      });
      idleFrames = 0;
      triggerFluidLoop();
    }
    lastX = x;
    lastY = y;
  }

  window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    splatMat.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
  });

  let isFluidLoopRunning = false;
  function triggerFluidLoop() {
    if (!isFluidLoopRunning && enabled && !document.hidden && document.body.dataset.theme !== 'rain' && !document.body.classList.contains('lite-mode')) {
      isFluidLoopRunning = true;
      requestAnimationFrame(updateFluid);
    }
  }

  // Loop simulasi fluida dengan Smart Sleep (hanya merender saat kursor bergerak)
  function updateFluid() {
    if (!enabled || document.hidden || document.body.dataset.theme === 'rain' || document.body.classList.contains('lite-mode')) {
      isFluidLoopRunning = false;
      if (document.body.dataset.theme === 'rain') {
        renderer.clear();
        pointerSplats.length = 0;
      }
      return;
    }

    if (idleFrames++ > 120 && pointerSplats.length === 0) {
      isFluidLoopRunning = false;
      return;
    }

    // Perbarui warna fluida jika berganti tema
    displayMat.uniforms.uColor.value = getThemeFluidColor();

    // 1. Terapkan dorongan kecepatan dan tinta dari gerakan mouse (dibatasi agar ramping & elegan)
    pointerSplats.splice(0).forEach(({ x, y, dx, dy }) => {
      splatMat.uniforms.uPoint.value.set(x, y);
      splatMat.uniforms.uColor.value.set(dx, dy, 1.0);
      splatMat.uniforms.uTarget.value = velocity.read.texture;
      renderPass(splatMat, velocity.write);
      velocity.swap();

      splatMat.uniforms.uColor.value.set(dx * 0.35, dy * 0.35, 0.22);
      splatMat.uniforms.uTarget.value = dye.read.texture;
      renderPass(splatMat, dye.write);
      dye.swap();
    });

    // 2. Divergensi
    divergenceMat.uniforms.uVelocity.value = velocity.read.texture;
    renderPass(divergenceMat, divergence);

    // 3. Clear pressure
    clearMat.uniforms.uTexture.value = pressure.read.texture;
    renderPass(clearMat, pressure.write);
    pressure.swap();

    // 4. Jacobi solve pressure
    for (let i = 0; i < iter; i++) {
      pressureMat.uniforms.uPressure.value = pressure.read.texture;
      renderPass(pressureMat, pressure.write);
      pressure.swap();
    }

    // 5. Kurangi gradien tekanan dari kecepatan
    gradientSubMat.uniforms.uPressure.value = pressure.read.texture;
    gradientSubMat.uniforms.uVelocity.value = velocity.read.texture;
    renderPass(gradientSubMat, velocity.write);
    velocity.swap();

    // 6. Adveksi kecepatan
    advectionMat.uniforms.uVelocity.value = velocity.read.texture;
    advectionMat.uniforms.uSource.value = velocity.read.texture;
    advectionMat.uniforms.uDissipation.value = velocityDissipation;
    renderPass(advectionMat, velocity.write);
    velocity.swap();

    // 7. Adveksi densitas (dye)
    advectionMat.uniforms.uVelocity.value = velocity.read.texture;
    advectionMat.uniforms.uSource.value = dye.read.texture;
    advectionMat.uniforms.uDissipation.value = densityDissipation;
    renderPass(advectionMat, dye.write);
    dye.swap();

    // 8. Tampilkan densitas akhir ke layar kanvas
    displayMat.uniforms.uDensity.value = dye.read.texture;
    renderPass(displayMat, null);

    requestAnimationFrame(updateFluid);
  }

  triggerFluidLoop();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      idleFrames = 0;
      triggerFluidLoop();
    }
  });

  // Reaktif terhadap pergantian suasana: reset posisi kursor & bangunkan simulasi saat kembali ke Terang/Malam
  const themeObserver = new MutationObserver(() => {
    lastX = null;
    lastY = null;
    idleFrames = 0;
    if (document.body.dataset.theme === 'rain') {
      renderer.clear();
      pointerSplats.length = 0;
    }
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // Migrasi preferensi: pulihkan jika sebelumnya pengguna tak sengaja mematikan saat mengira ikon tetesan air adalah tombol hujan
  if (localStorage.getItem('amine_fluid_migrated_v3') !== 'true') {
    localStorage.setItem('amine_fluid', 'on');
    localStorage.setItem('hyouka_fluid', 'on');
    localStorage.setItem('amine_fluid_migrated_v3', 'true');
  }

  // Sakelar Nyala/Mati Fluida di Top Nav
  const toggleBtn = document.getElementById('ink-toggle-btn');
  let enabled = localStorage.getItem('hyouka_fluid') !== 'off' && localStorage.getItem('amine_fluid') !== 'off';
  if (!enabled && canvas) {
    canvas.style.display = 'none';
    if (toggleBtn) toggleBtn.classList.remove('active');
  }
  if (toggleBtn) {
    toggleBtn.innerHTML = '<span class="ctrl-icon">🖌️</span>';
    toggleBtn.title = `Efek Tinta Fluida: ${enabled ? 'Aktif (Klik untuk Matikan)' : 'Nonaktif (Klik untuk Nyalakan)'}`;
    toggleBtn.classList.toggle('active', enabled);
    toggleBtn.addEventListener('click', () => {
      enabled = !enabled;
      canvas.style.display = enabled ? 'block' : 'none';
      toggleBtn.classList.toggle('active', enabled);
      toggleBtn.title = `Efek Tinta Fluida: ${enabled ? 'Aktif (Klik untuk Matikan)' : 'Nonaktif (Klik untuk Nyalakan)'}`;
      if (enabled) {
        idleFrames = 0;
        triggerFluidLoop();
      }
      try {
        localStorage.setItem('hyouka_fluid', enabled ? 'on' : 'off');
        localStorage.setItem('amine_fluid', enabled ? 'on' : 'off');
      } catch (e) {}
    });
  }
}

/**
 * 2. CUSTOM MAGNETIC CURSOR DARI PROFIL CAFE CINEMATIC
 * Dot Hijau Zamrud + Trailing Circle Magnetik + Label Interaktif Melayang
 */
export function initMagneticCursor() {
  const dot = document.getElementById('cursorDot');
  const circle = document.getElementById('cursorCircle');
  const text = document.getElementById('cursorText');

  if (!circle) return;

  // Di perangkat sentuh (HP/Tablet) atau layar <= 768px: sembunyikan kursor magnetik & jangan jalankan loop
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
  if (isTouchDevice) {
    if (dot) dot.style.display = 'none';
    circle.style.display = 'none';
    return;
  }

  circle.style.opacity = '1';

  let mouseX = -100;
  let mouseY = -100;
  let circleX = -100;
  let circleY = -100;
  let hasMoved = false;
  let isCursorLoopRunning = false;

  function triggerCursorLoop() {
    if (!isCursorLoopRunning && !document.hidden) {
      isCursorLoopRunning = true;
      requestAnimationFrame(renderCursor);
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!hasMoved) {
      hasMoved = true;
      circleX = mouseX;
      circleY = mouseY;
      circle.style.opacity = '1';
    }
    triggerCursorLoop();
  }, { passive: true });

  window.addEventListener('mouseenter', () => {
    circle.style.opacity = '1';
    triggerCursorLoop();
  });

  window.addEventListener('mouseleave', () => {
    circle.style.opacity = '0';
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasMoved) triggerCursorLoop();
  });

  function renderCursor() {
    if (document.hidden) {
      isCursorLoopRunning = false;
      return;
    }

    const dx = mouseX - circleX;
    const dy = mouseY - circleY;

    // Tidurkan render loop jika kursor sudah mencapai posisi tenang
    if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
      isCursorLoopRunning = false;
      return;
    }

    // Interpolasi pegas lembut (Lerp 0.18)
    circleX += dx * 0.18;
    circleY += dy * 0.18;
    circle.style.transform = `translate3d(${circleX.toFixed(1)}px, ${circleY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }

  // Daftarkan target interaktif untuk memunculkan lingkaran magnetik & label
  function attachHoverListeners() {
    const targets = document.querySelectorAll(
      '[data-cursor], a, button, .project-card, .timeline-node, .vn-card, .emoji-btn, .avatar-mood-btn'
    );

    targets.forEach((el) => {
      if (el._cursorAttached) return;
      el._cursorAttached = true;

      el.addEventListener('mouseenter', () => {
        let label = el.getAttribute('data-cursor');
        if (!label) {
          if (el.classList.contains('project-card')) label = 'MISI';
          else if (el.classList.contains('timeline-node')) label = 'JEJAK';
          else if (el.classList.contains('vn-card')) label = 'LANJUT';
          else if (el.classList.contains('avatar-mood-btn')) label = 'SUASANA';
          else if (el.tagName === 'A' || el.tagName === 'BUTTON') label = 'PILIH';
          else label = 'VIEW';
        }
        if (text) text.textContent = label;
        circle.classList.add('active');
      });

      el.addEventListener('mouseleave', () => {
        circle.classList.remove('active');
      });
    });
  }

  attachHoverListeners();

  // Re-attach saat konten dinamis termuat
  const observer = new MutationObserver(() => {
    attachHoverListeners();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
