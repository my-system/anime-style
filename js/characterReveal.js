/**
 * Character Fluid Reveal Engine (WebGL 2D Navier-Stokes)
 * Mengatur interaksi kursor yang menyibak foto asli pemilik (Yusuf, S.Stat)
 * di balik ilustrasi karakter anime Hyouka hingga maksimal 70% bukaan.
 */

import { config } from './config.js';
import { createFluidHero } from './fluid.js';

let fluidHeroInstance = null;

function loadImage(src, fallbackSrc = null) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (fallbackSrc) {
        const fb = new Image();
        fb.crossOrigin = 'anonymous';
        fb.onload = () => resolve(fb);
        fb.onerror = () => resolve(null);
        fb.src = fallbackSrc;
      } else {
        console.warn('Gagal memuat:', src);
        resolve(null);
      }
    };
    img.src = src;
  });
}

export async function initCharacterFluidReveal() {
  const canvas = document.getElementById('fluid-reveal-canvas');
  if (!canvas) return null;

  // Pastikan batas bukaan maksimal kursor adalah 70% (0.70) dan radius sapuan ramping
  config.fluid.maxReveal = 0.70;
  config.fluid.radius = 0.0065;

  // Muat gambar dasar karakter Hyouka dan foto asli Yusuf
  const [imgAnime, imgFoto] = await Promise.all([
    loadImage(config.images.anime, config.images.fallbackAnime),
    loadImage(config.images.foto, config.images.fallbackFoto)
  ]);

  if (!imgAnime || !imgFoto) {
    console.warn('Karakter atau foto asli tidak dapat dimuat untuk efek fluida.');
    return null;
  }

  // Preload gambar variasi ekspresi karakter untuk pertukaran tekstur instan
  const exprImages = {
    base: imgAnime,
    blink: await loadImage('img/hyouka/hyouka-blink.png'),
    sleepy: await loadImage('img/hyouka/hyouka-sleepy.png'),
    smile: await loadImage('img/hyouka/hyouka-smile.png'),
    surprised: await loadImage('img/hyouka/hyouka-surprised.png')
  };

  // Inisialisasi engine fluida Navier-Stokes WebGL 2D
  fluidHeroInstance = createFluidHero(canvas, imgAnime, imgFoto, config);
  if (!fluidHeroInstance) return null;

  const eyeLayer = document.querySelector('.character-eyes-layer');
  let lastX = null, lastY = null, lastT = performance.now();
  let revealFadeTimer = null;

  function handlePointer(clientX, clientY, isDown = false) {
    // Nonaktifkan efek fluida karakter sepenuhnya saat berada di mode hujan
    if (document.body.dataset.theme === 'rain') return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Hitung koordinat kursor yang dinormalisasi (0..1) terhadap kanvas,
    // kebal terhadap perbesaran/transform CSS scene apapun (scale / translate)
    const normX = (clientX - rect.left) / rect.width;
    const normY = (clientY - rect.top) / rect.height;

    // Jika kursor berada di luar area kanvas karakter
    if (normX < 0 || normX > 1 || normY < 0 || normY > 1) {
      lastX = null;
      lastY = null;
      return;
    }

    const relX = normX * (canvas.clientWidth || rect.width);
    const relY = normY * (canvas.clientHeight || rect.height);

    // Samarkan lapisan iris anime agar mata asli pada foto terlihat jernih
    if (eyeLayer && !config.calibration.enabled) {
      eyeLayer.classList.add('fade-for-reveal');
      if (revealFadeTimer) clearTimeout(revealFadeTimer);
      revealFadeTimer = setTimeout(() => {
        if ((config.calibration.manualPhotoOpacity || 0) < 0.08) {
          eyeLayer.classList.remove('fade-for-reveal');
        }
      }, 1800);
    }

    const now = performance.now();
    if (lastX === null || isDown) {
      lastX = relX;
      lastY = relY;
      lastT = now;
      fluidHeroInstance.addSplat(relX, relY, 2.0, -1.0, 1.0);
      return;
    }

    const dx = relX - lastX;
    const dy = relY - lastY;
    const dt = Math.max(now - lastT, 1);
    const speed = Math.hypot(dx, dy) / dt;
    const radiusMult = Math.min(Math.max(1.0 + speed * 0.35, 1.0), 1.6);

    const dist = Math.hypot(dx, dy);
    const steps = Math.min(Math.ceil(dist / 22), 3);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      fluidHeroInstance.addSplat(
        lastX + dx * t,
        lastY + dy * t,
        (dx / steps) * 1.8,
        (dy / steps) * 1.8,
        radiusMult
      );
    }

    lastX = relX;
    lastY = relY;
    lastT = now;
  }

  // Dengarkan pergerakan kursor di window (tetap terdeteksi meski di atas area klik wajah)
  window.addEventListener('pointermove', (e) => handlePointer(e.clientX, e.clientY), { passive: true });
  canvas.addEventListener('pointerdown', (e) => handlePointer(e.clientX, e.clientY, true));
  window.addEventListener('pointerup', () => { lastX = null; lastY = null; });

  // Sinkronisasi ekspresi karakter dengan tekstur WebGL
  window.addEventListener('character-expression-change', (e) => {
    const expr = e.detail?.expr;
    if (expr && exprImages[expr] && fluidHeroInstance) {
      fluidHeroInstance.updateAnimeTexture(exprImages[expr]);
    }
  });

  // Nonaktifkan efek fluida saat beralih ke mode hujan & bersihkan dye
  const themeObserver = new MutationObserver(() => {
    if (document.body.dataset.theme === 'rain') {
      if (fluidHeroInstance) fluidHeroInstance.setFluidEnabled(false);
      if (eyeLayer) eyeLayer.classList.remove('fade-for-reveal');
    } else {
      if (fluidHeroInstance) fluidHeroInstance.setFluidEnabled(true);
    }
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // Sambungkan kontrol slider HUD Kalibrasi (Pintasan K)
  setupCalibrationHUD(fluidHeroInstance);

  return fluidHeroInstance;
}

function setupCalibrationHUD(fluidHero) {
  const hud = document.getElementById('calibration-hud');
  const closeBtn = document.getElementById('btn-hud-close');
  const overlay = document.getElementById('eye-calibration-overlay');

  function toggle() {
    config.calibration.enabled = !config.calibration.enabled;
    hud?.classList.toggle('hidden', !config.calibration.enabled);
    overlay?.classList.toggle('active', config.calibration.enabled);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'k' || e.key === 'K') {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      e.preventDefault();
      toggle();
    }
  });

  closeBtn?.addEventListener('click', toggle);

  document.getElementById('slider-photo-opacity')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const valEl = document.getElementById('val-photo-opacity');
    if (valEl) valEl.textContent = `${Math.round(val * 100)}%`;
    fluidHero.setPhotoOpacity(val);
  });

  document.getElementById('slider-max-reveal')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.maxReveal = val;
    const el = document.getElementById('val-max-reveal');
    if (el) el.textContent = `${Math.round(val * 100)}%`;
  });

  document.getElementById('slider-fluid-radius')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.radius = val;
    const el = document.getElementById('val-fluid-radius');
    if (el) el.textContent = val.toFixed(4);
  });

  document.getElementById('slider-dissipation')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.dissipation = val;
    const el = document.getElementById('val-dissipation');
    if (el) el.textContent = val.toFixed(3);
  });

  document.getElementById('slider-distortion')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.distortionStrength = val;
    const el = document.getElementById('val-distortion');
    if (el) el.textContent = val.toFixed(3);
  });
}
