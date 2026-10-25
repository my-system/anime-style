/**
 * WebGL 2D Navier-Stokes Fluid Reveal Engine + Canvas 2D Fallback
 *
 * Atribusi:
 * Pendekatan matematis simulasi fluida 2D (velocity, curl, vorticity confinement,
 * divergence, Jacobi pressure solver, gradient subtraction, advection) diadaptasi dari:
 * "WebGL-Fluid-Simulation" oleh PavelDoGreat (Lisensi MIT - https://github.com/PavelDoGreat/WebGL-Fluid-Simulation).
 * Dimodifikasi untuk efek "Fluida Membuka Foto" (Composite Mask Reveal) dengan refraksi tepi.
 */

export function createFluidHero(canvas, imgAnime, imgFoto, config) {
  // Coba inisialisasi WebGL2 atau WebGL1
  const gl =
    canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true, depth: false, stencil: false }) ||
    canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true, depth: false, stencil: false });

  if (!gl) {
    console.info('WebGL tidak tersedia, menggunakan fallback Canvas 2D radial-gradient.');
    return createCanvas2DFallback(canvas, imgAnime, imgFoto, config);
  }

  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

  // Deteksi dukungan ekstensi tekstur floating-point
  let halfFloatExt = null;
  let supportLinearFiltering = false;

  if (isWebGL2) {
    gl.getExtension('EXT_color_buffer_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
  } else {
    halfFloatExt = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
  }

  const texType = isWebGL2
    ? gl.HALF_FLOAT
    : (halfFloatExt ? halfFloatExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE);

  // Gunakan RGBA16F (WebGL2) atau RGBA (WebGL1) agar kompatibel di semua GPU
  const internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
  const format = gl.RGBA;
  const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  // Pastikan FBO menggunakan orientasi standar
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  function createFBO(w, h, paramFiltering) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, paramFiltering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, paramFiltering);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, texType, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Fallback ke UNSIGNED_BYTE bila GPU tidak mendukung framebuffer float
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      fbo,
      texture,
      width: w,
      height: h,
      attach(unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return unit;
      }
    };
  }

  function createDoubleFBO(w, h, paramFiltering) {
    let fbo1 = createFBO(w, h, paramFiltering);
    let fbo2 = createFBO(w, h, paramFiltering);
    return {
      width: w,
      height: h,
      get read() { return fbo1; },
      get write() { return fbo2; },
      swap() {
        const tmp = fbo1;
        fbo1 = fbo2;
        fbo2 = tmp;
      },
      clear() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1.fbo);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    };
  }

  const simRes = config.fluid.velocityRes || 128;
  const dyeRes = config.fluid.dyeRes || 512;

  const velocity = createDoubleFBO(simRes, simRes, filtering);
  const dye = createDoubleFBO(dyeRes, dyeRes, filtering);
  const divergence = createFBO(simRes, simRes, gl.NEAREST);
  const curlFBO = createFBO(simRes, simRes, gl.NEAREST);
  const pressure = createDoubleFBO(simRes, simRes, gl.NEAREST);

  // Fullscreen Quad Geometry
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

  function createProgram(vertSrc, fragSrc) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex Shader Error:', gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment Shader Error:', gl.getShaderInfoLog(fs));
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPosition');
    gl.linkProgram(prog);

    const uniforms = {};
    const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(prog, i);
      uniforms[info.name] = gl.getUniformLocation(prog, info.name);
    }
    return { program: prog, uniforms };
  }

  const baseVS = isWebGL2
    ? `#version 300 es
      precision highp float;
      in vec2 aPosition;
      out vec2 vUv;
      out vec2 vL;
      out vec2 vR;
      out vec2 vT;
      out vec2 vB;
      uniform vec2 uTexelSize;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(uTexelSize.x, 0.0);
        vR = vUv + vec2(uTexelSize.x, 0.0);
        vT = vUv + vec2(0.0, uTexelSize.y);
        vB = vUv - vec2(0.0, uTexelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`
    : `precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 uTexelSize;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(uTexelSize.x, 0.0);
        vR = vUv + vec2(uTexelSize.x, 0.0);
        vT = vUv + vec2(0.0, uTexelSize.y);
        vB = vUv - vec2(0.0, uTexelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }`;

  const fragHeader = isWebGL2
    ? `#version 300 es
      precision highp float;
      precision highp sampler2D;
      in vec2 vUv;
      in vec2 vL;
      in vec2 vR;
      in vec2 vT;
      in vec2 vB;
      out vec4 fragColor;
      #define gl_FragColor fragColor
      #define texture2D texture`
    : `precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;`;

  // 1. Splat Shader (Menyuntikkan gaya & mask dye pada posisi kursor)
  const splatShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uTarget;
    uniform float uAspect;
    uniform vec3 uColor;
    uniform vec2 uPoint;
    uniform float uRadius;
    void main() {
      vec2 p = vUv - uPoint;
      p.x *= uAspect;
      float d = exp(-dot(p, p) / max(uRadius, 0.0001));
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + d * uColor, 1.0);
    }
  `);

  // 2. Curl Shader (Menghitung rotasi mikro fluida)
  const curlShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `);

  // 3. Vorticity Confinement Shader (Memberi efek pusaran organik seperti tinta/air)
  const vorticityShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uCurlStrength;
    uniform float uDt;
    void main() {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= uCurlStrength * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      vel += force * uDt;
      vel = clamp(vel, -1000.0, 1000.0);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }
  `);

  // 4. Divergence Shader
  const divergenceShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `);

  // 5. Jacobi Pressure Solver Shader
  const pressureShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float div = texture2D(uDivergence, vUv).x;
      float p = (L + R + B + T - div) * 0.25;
      gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
    }
  `);

  // 6. Gradient Subtract Shader
  const gradientSubtractShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 v = texture2D(uVelocity, vUv).xy;
      v -= vec2(R - L, T - B);
      gl_FragColor = vec4(v, 0.0, 1.0);
    }
  `);

  // 7. Advection Shader
  const advectionShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;
    uniform bool uClampMask;
    void main() {
      vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
      vec4 result = uDissipation * texture2D(uSource, coord);
      if (uClampMask) {
        // Pastikan mask berangsur benar-benar kembali ke 0 (menutup rapat)
        result = max(result - 0.0012, 0.0);
        result = min(result, 1.35);
      }
      gl_FragColor = result;
    }
  `);

  // 8. Composite Shader: mix(textureIlustrasi, textureFoto, smoothstep(0.05, 0.6, mask))
  const compositeShader = createProgram(baseVS, `${fragHeader}
    uniform sampler2D uDye;
    uniform sampler2D uTexAnime;
    uniform sampler2D uTexFoto;
    uniform vec2 uCanvasRes;
    uniform vec2 uImageRes;
    uniform float uDistortion;
    uniform float uSmoothMin;
    uniform float uSmoothMax;
    uniform float uPhotoOpacity;
    uniform float uMaxReveal;

    // Menghitung UV object-fit: cover dengan titik fokus di area wajah/atas tengah
    vec2 getCoverUV(vec2 uv, vec2 canvasRes, vec2 imageRes) {
      float canvasAspect = canvasRes.x / max(canvasRes.y, 1.0);
      float imageAspect = imageRes.x / max(imageRes.y, 1.0);
      vec2 scale = vec2(1.0);
      if (canvasAspect > imageAspect) {
        scale.y = imageAspect / canvasAspect;
      } else {
        scale.x = canvasAspect / imageAspect;
      }
      // Titik fokus sedikit di atas tengah (fokus wajah: y = 0.56 dalam koordinat WebGL)
      vec2 focal = vec2(0.5, 0.56);
      return (uv - focal) * scale + focal;
    }

    void main() {
      vec2 coverUv = getCoverUV(vUv, uCanvasRes, uImageRes);

      // Balik sumbu Y untuk sampling gambar HTML (baris 0 gambar = bagian atas layar)
      vec2 imgUv = vec2(coverUv.x, 1.0 - coverUv.y);

      if (imgUv.x < 0.0 || imgUv.x > 1.0 || imgUv.y < 0.0 || imgUv.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }

      // Baca nilai mask dari simulasi fluida (0.0 sampai 1.0)
      float mask = clamp(texture2D(uDye, vUv).r, 0.0, 1.0);

      // Hitung gradien tepi mask untuk efek refraksi/riak air & tinta
      vec2 texel = 2.0 / max(uCanvasRes, vec2(1.0));
      float mL = texture2D(uDye, vUv - vec2(texel.x, 0.0)).r;
      float mR = texture2D(uDye, vUv + vec2(texel.x, 0.0)).r;
      float mT = texture2D(uDye, vUv + vec2(0.0, texel.y)).r;
      float mB = texture2D(uDye, vUv - vec2(0.0, texel.y)).r;
      vec2 edgeGrad = vec2(mR - mL, mB - mT);

      // Faktor area tepi bukaan
      float edgeBand = smoothstep(0.02, 0.22, mask) * (1.0 - smoothstep(0.35, 0.72, mask));
      // Distorsi tepi air halus & sinematik ala Cafe Cinematic
      vec2 distortOffset = edgeGrad * edgeBand * uDistortion;

      // Sample kedua gambar
      vec4 rawAnime = texture2D(uTexAnime, clamp(imgUv + distortOffset, 0.0, 1.0));
      vec4 rawFoto  = texture2D(uTexFoto,  clamp(imgUv - distortOffset * 0.25, 0.0, 1.0));

      // Akumulasi sapuan kuas seperti Photoshop:
      // Gesekan awal (1 kali lewati) membuka ~50% (masih tertutup 50% oleh ilustrasi anime)
      // Geser 3-4 kali di sekitar area karakter membuka bertahap hingga 100% penuh
      // Ketika kursor berhenti / ditinggalkan, fluida dissipation memudarkan kembali ke 0% semula
      float fluidReveal = clamp(smoothstep(uSmoothMin, uSmoothMax, mask) * uMaxReveal, 0.0, 1.0);
      float finalBlend = clamp(max(fluidReveal, uPhotoOpacity), 0.0, 1.0);

      // Transparansi murni: hitung alpha gabungan anime dan foto
      float charAlpha = mix(rawAnime.a, rawFoto.a, finalBlend);
      if (charAlpha <= 0.01) {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec3 colorAnime = rawAnime.rgb;
      vec3 colorFoto  = rawFoto.rgb;

      // Efek cincin tinta/air tipis di bibir perbatasan pembukaan
      float inkRim = edgeBand * length(edgeGrad) * 0.35 * (1.0 - uPhotoOpacity);
      vec3 composited = mix(colorAnime, colorFoto, finalBlend);
      composited = mix(composited, composited * vec3(0.90, 0.94, 0.92), clamp(inkRim, 0.0, 0.22));

      gl_FragColor = vec4(composited, charAlpha);
    }
  `);

  function loadImageTexture(image) {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return tex;
  }

  let texAnime = loadImageTexture(imgAnime);
  const texFoto = loadImageTexture(imgFoto);

  function renderQuad(target) {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  const splats = [];
  let fluidEnabled = true;

  function addSplat(x, y, dx, dy, radiusMult = 1.0) {
    if (!fluidEnabled) return;
    const w = Math.max(canvas.clientWidth, 1);
    const h = Math.max(canvas.clientHeight, 1);
    splats.push({
      x: x / w,
      y: 1.0 - y / h,
      dx: dx * (config.fluid.speedMultiplier || 4.0),
      dy: -dy * (config.fluid.speedMultiplier || 4.0),
      radius: (config.fluid.radius || 0.0065) * radiusMult
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  // Menghitung pemetaan koordinat gambar ke dalam kanvas (untuk sinkronisasi overlay mata)
  function getCoverTransform() {
    const cw = canvas.clientWidth || 1;
    const ch = canvas.clientHeight || 1;
    const iw = imgAnime.naturalWidth || 768;
    const ih = imgAnime.naturalHeight || 1024;
    const canvasAspect = cw / ch;
    const imageAspect = iw / ih;
    let scaleX = 1.0;
    let scaleY = 1.0;
    if (canvasAspect > imageAspect) {
      scaleY = imageAspect / canvasAspect;
    } else {
      scaleX = canvasAspect / imageAspect;
    }
    return { scaleX, scaleY, focalX: 0.5, focalY: 0.44 };
  }

  let lastTime = performance.now();

  function step() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.025);
    lastTime = now;

    resize();

    if (fluidEnabled) {
      // 1. Proses antrean splat kursor
      if (splats.length > 0) {
        gl.useProgram(splatShader.program);
        gl.uniform1f(splatShader.uniforms.uAspect, canvas.width / Math.max(canvas.height, 1));

        while (splats.length > 0) {
          const s = splats.pop();

          // Tambahkan gaya ke velocity secara lembut (ala Cafe Cinematic)
          gl.uniform1i(splatShader.uniforms.uTarget, velocity.read.attach(0));
          gl.uniform2f(splatShader.uniforms.uPoint, s.x, s.y);
          gl.uniform3f(splatShader.uniforms.uColor, s.dx * 0.45, s.dy * 0.45, 0.0);
          gl.uniform1f(splatShader.uniforms.uRadius, s.radius);
          renderQuad(velocity.write);
          velocity.swap();

          // Tambahkan mask dye seperti Photoshop brush: akumulatif bertahap (+0.25 per sapuan)
          // 1 sapuan awal = ~50% terbuka, 3-4 sapuan di area yang sama = 100% terbuka penuh
          gl.uniform1i(splatShader.uniforms.uTarget, dye.read.attach(0));
          gl.uniform3f(splatShader.uniforms.uColor, 0.25, 0.25, 0.25);
          gl.uniform1f(splatShader.uniforms.uRadius, s.radius * 1.15);
          renderQuad(dye.write);
          dye.swap();
        }
      }

      // 2. Curl & Vorticity Confinement (Hanya jika curl diaktifkan)
      if (config.fluid.curl && config.fluid.curl > 0.05) {
        gl.useProgram(curlShader.program);
        gl.uniform2f(curlShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
        gl.uniform1i(curlShader.uniforms.uVelocity, velocity.read.attach(0));
        renderQuad(curlFBO);

        gl.useProgram(vorticityShader.program);
        gl.uniform2f(vorticityShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
        gl.uniform1i(vorticityShader.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityShader.uniforms.uCurl, curlFBO.attach(1));
        gl.uniform1f(vorticityShader.uniforms.uCurlStrength, config.fluid.curl);
        gl.uniform1f(vorticityShader.uniforms.uDt, dt);
        renderQuad(velocity.write);
        velocity.swap();
      }

      // 3. Divergence
      gl.useProgram(divergenceShader.program);
      gl.uniform2f(divergenceShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
      gl.uniform1i(divergenceShader.uniforms.uVelocity, velocity.read.attach(0));
      renderQuad(divergence);

      // 4. Jacobi Pressure Solver (Hanya 3 iterasi lembut sesuai Cafe Cinematic)
      gl.useProgram(pressureShader.program);
      gl.uniform2f(pressureShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
      gl.uniform1i(pressureShader.uniforms.uDivergence, divergence.attach(1));
      const iters = config.fluid.iterations || 3;
      for (let i = 0; i < iters; i++) {
        gl.uniform1i(pressureShader.uniforms.uPressure, pressure.read.attach(0));
        renderQuad(pressure.write);
        pressure.swap();
      }

      // 5. Gradient Subtraction
      gl.useProgram(gradientSubtractShader.program);
      gl.uniform2f(gradientSubtractShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
      gl.uniform1i(gradientSubtractShader.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientSubtractShader.uniforms.uVelocity, velocity.read.attach(1));
      renderQuad(velocity.write);
      velocity.swap();

      // 6. Advection Velocity
      gl.useProgram(advectionShader.program);
      gl.uniform2f(advectionShader.uniforms.uTexelSize, 1.0 / simRes, 1.0 / simRes);
      gl.uniform1i(advectionShader.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionShader.uniforms.uSource, velocity.read.attach(0));
      gl.uniform1f(advectionShader.uniforms.uDt, dt);
      gl.uniform1f(advectionShader.uniforms.uDissipation, config.fluid.velocityDissipation || 0.984);
      gl.uniform1i(advectionShader.uniforms.uClampMask, 0);
      renderQuad(velocity.write);
      velocity.swap();

      // 7. Advection Mask Dye (Memudar perlahan dalam 2-3 detik)
      gl.uniform2f(advectionShader.uniforms.uTexelSize, 1.0 / dyeRes, 1.0 / dyeRes);
      gl.uniform1i(advectionShader.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionShader.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advectionShader.uniforms.uDissipation, config.fluid.dissipation || 0.978);
      gl.uniform1i(advectionShader.uniforms.uClampMask, 1);
      renderQuad(dye.write);
      dye.swap();
    }

    // 8. Render Komposit ke Layar Utama (Latar Transparan)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(compositeShader.program);
    gl.uniform1i(compositeShader.uniforms.uDye, dye.read.attach(0));

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texAnime);
    gl.uniform1i(compositeShader.uniforms.uTexAnime, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texFoto);
    gl.uniform1i(compositeShader.uniforms.uTexFoto, 2);

    gl.uniform2f(compositeShader.uniforms.uCanvasRes, canvas.width, canvas.height);
    gl.uniform2f(
      compositeShader.uniforms.uImageRes,
      imgAnime.naturalWidth || 768,
      imgAnime.naturalHeight || 1024
    );
    gl.uniform1f(compositeShader.uniforms.uDistortion, config.fluid.distortionStrength ?? 0.002);
    gl.uniform1f(compositeShader.uniforms.uSmoothMin, config.fluid.smoothMin ?? 0.02);
    gl.uniform1f(compositeShader.uniforms.uSmoothMax, config.fluid.smoothMax ?? 0.72);
    gl.uniform1f(compositeShader.uniforms.uMaxReveal, config.fluid.maxReveal ?? 1.0);
    gl.uniform1f(compositeShader.uniforms.uPhotoOpacity, config.calibration.manualPhotoOpacity ?? 0.0);

    renderQuad(null);

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  return {
    isWebGL: true,
    addSplat,
    getCoverTransform,
    setFluidEnabled(enabled) {
      fluidEnabled = enabled;
      if (!enabled) {
        dye.clear();
        velocity.clear();
      }
    },
    updateAnimeTexture(newImg) {
      if (!newImg) return;
      gl.activeTexture(gl.TEXTURE7);
      gl.bindTexture(gl.TEXTURE_2D, texAnime);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newImg);
    },
    setPhotoOpacity(val) {
      config.calibration.manualPhotoOpacity = val;
    }
  };
}

/**
 * Fallback Canvas 2D (Bila WebGL tidak tersedia pada perangkat pengunjung)
 * Menggunakan jejak radial-gradient mask yang memudar perlahan mengikuti kursor.
 */
function createCanvas2DFallback(canvas, imgAnime, imgFoto, config) {
  const ctx = canvas.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  const maskCtx = maskCanvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  let currentAnimeImg = imgAnime;
  let fluidEnabled = true;
  const trails = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;
      tempCanvas.width = w;
      tempCanvas.height = h;
    }
  }

  function addSplat(x, y, dx, dy, radiusMult = 1.0) {
    if (!fluidEnabled) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = Math.max(canvas.width, canvas.height) * 0.09 * radiusMult;
    trails.push({ x: x * dpr, y: y * dpr, r, alpha: 0.50 });
  }

  function drawCover(targetCtx, img, w, h) {
    const iw = img.naturalWidth || 768;
    const ih = img.naturalHeight || 1024;
    const scale = Math.max(w / iw, h / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const ox = (w - sw) * 0.5;
    const oy = (h - sh) * 0.44;
    targetCtx.drawImage(img, ox, oy, sw, sh);
  }

  function render() {
    resize();
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Gambar lapisan ilustrasi di atas
    drawCover(ctx, currentAnimeImg, w, h);

    // Update jejak radial-gradient
    maskCtx.clearRect(0, 0, w, h);
    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i];
      t.alpha *= config.fluid.dissipation || 0.975;
      if (t.alpha < 0.02) {
        trails.splice(i, 1);
        continue;
      }
      const maxR = config.fluid.maxReveal ?? 1.0;
      const grad = maskCtx.createRadialGradient(t.x, t.y, t.r * 0.15, t.x, t.y, t.r);
      grad.addColorStop(0, `rgba(0, 0, 0, ${Math.min(maxR, t.alpha)})`);
      grad.addColorStop(0.7, `rgba(0, 0, 0, ${Math.min(maxR, t.alpha * 0.5)})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      maskCtx.fillStyle = grad;
      maskCtx.beginPath();
      maskCtx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      maskCtx.fill();
    }

    const manualOpacity = config.calibration.manualPhotoOpacity || 0;
    if (trails.length > 0 || manualOpacity > 0.005) {
      tempCtx.clearRect(0, 0, w, h);
      drawCover(tempCtx, imgFoto, w, h);

      if (manualOpacity < 0.99) {
        if (manualOpacity > 0) {
          maskCtx.fillStyle = `rgba(0, 0, 0, ${manualOpacity})`;
          maskCtx.fillRect(0, 0, w, h);
        }
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskCanvas, 0, 0);
        tempCtx.globalCompositeOperation = 'source-over';
      }
      ctx.drawImage(tempCanvas, 0, 0);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  return {
    isWebGL: false,
    addSplat,
    getCoverTransform() {
      return { scaleX: 1, scaleY: 1, focalX: 0.5, focalY: 0.44 };
    },
    setFluidEnabled(enabled) {
      fluidEnabled = enabled;
      if (!enabled) trails.length = 0;
    },
    updateAnimeTexture(newImg) {
      if (newImg) currentAnimeImg = newImg;
    },
    setPhotoOpacity(val) {
      config.calibration.manualPhotoOpacity = val;
    }
  };
}
