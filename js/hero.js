/**
 * Standalone Hero Application Orchestrator (hero.html)
 * Mengatur pemuatan gambar, fluida WebGL 2D Navier-Stokes, dan HUD Kalibrasi
 */

import { config } from './config.js';
import { createFluidHero } from './fluid.js';

document.addEventListener('DOMContentLoaded', async () => {
  const preloader = document.getElementById('preloader');
  const canvas = document.getElementById('fluid-reveal-canvas');
  const stage = document.getElementById('fluid-stage');
  const eyeWrapper = document.getElementById('eye-layer-wrapper');
  const eyeImg = document.getElementById('eye-layer-img');

  function loadImage(src, fallbackSrc = null) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (fallbackSrc) {
          const fb = new Image();
          fb.onload = () => resolve(fb);
          fb.onerror = () => resolve(null);
          fb.src = fallbackSrc;
        } else resolve(null);
      };
      img.src = src;
    });
  }

  const [imgAnime, imgFoto, imgBlink] = await Promise.all([
    loadImage(config.images.anime, config.images.fallbackAnime),
    loadImage(config.images.foto, config.images.fallbackFoto),
    loadImage(config.images.blink, null)
  ]);

  if (preloader) preloader.classList.add('hidden');
  if (!imgAnime || !imgFoto) return;

  const fluidHero = createFluidHero(canvas, imgAnime, imgFoto, config);
  if (!fluidHero) return;

  // Sapaan Waktu
  setupTimeGreeting();

  // Tatapan Mata (2 - 4 px)
  let targetEyeX = 0, targetEyeY = 0, currentEyeX = 0, currentEyeY = 0;
  function updateEyeLoop() {
    currentEyeX += (targetEyeX - currentEyeX) * 0.14;
    currentEyeY += (targetEyeY - currentEyeY) * 0.14;
    if (eyeWrapper) {
      eyeWrapper.style.transform = `translate3d(${currentEyeX.toFixed(2)}px, ${currentEyeY.toFixed(2)}px, 0)`;
    }
    requestAnimationFrame(updateEyeLoop);
  }
  requestAnimationFrame(updateEyeLoop);

  // Pointer tracking
  let lastX = null, lastY = null, lastT = performance.now();
  let revealFadeTimer = null;

  function handlePointer(clientX, clientY, isDown = false) {
    const rect = canvas.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width * 0.51;
    const eyeCenterY = rect.top + rect.height * 0.312;
    const dxEye = clientX - eyeCenterX;
    const dyEye = clientY - eyeCenterY;
    const distEye = Math.hypot(dxEye, dyEye) || 1;
    const maxShift = config.calibration.eyeShiftMaxPx || 3.5;
    const factor = Math.min(distEye / 260, 1.0);

    targetEyeX = (dxEye / distEye) * maxShift * factor;
    targetEyeY = (dyEye / distEye) * (maxShift * 0.7) * factor;

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (relX < 0 || relX > rect.width || relY < 0 || relY > rect.height) {
      lastX = null; lastY = null; return;
    }

    if (eyeWrapper && !config.calibration.enabled) {
      eyeWrapper.classList.add('fade-for-reveal');
      if (revealFadeTimer) clearTimeout(revealFadeTimer);
      revealFadeTimer = setTimeout(() => {
        if ((config.calibration.manualPhotoOpacity || 0) < 0.08) {
          eyeWrapper.classList.remove('fade-for-reveal');
        }
      }, 1800);
    }

    const now = performance.now();
    if (lastX === null || isDown) {
      lastX = relX; lastY = relY; lastT = now;
      fluidHero.addSplat(relX, relY, 2.0, -1.0, 1.0);
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
      fluidHero.addSplat(lastX + dx * t, lastY + dy * t, (dx / steps) * 1.8, (dy / steps) * 1.8, radiusMult);
    }

    lastX = relX; lastY = relY; lastT = now;
  }

  window.addEventListener('pointermove', (e) => handlePointer(e.clientX, e.clientY), { passive: true });
  canvas.addEventListener('pointerdown', (e) => handlePointer(e.clientX, e.clientY, true));
  window.addEventListener('pointerup', () => { lastX = null; lastY = null; });

  // Kedip
  if (imgBlink) {
    function scheduleBlink() {
      setTimeout(() => {
        fluidHero.updateAnimeTexture(imgBlink);
        if (eyeImg) eyeImg.src = config.images.blink;
        setTimeout(() => {
          fluidHero.updateAnimeTexture(imgAnime);
          if (eyeImg) eyeImg.src = config.images.anime;
          scheduleBlink();
        }, 120);
      }, 3500 + Math.random() * 3000);
    }
    scheduleBlink();
  }

  // Crossfade button
  const btnToggle = document.getElementById('btn-toggle-photo');
  let photoShown = false;
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      photoShown = !photoShown;
      fluidHero.setPhotoOpacity(photoShown ? 1.0 : 0.0);
      btnToggle.setAttribute('aria-pressed', String(photoShown));
      const lbl = document.getElementById('label-toggle-photo');
      if (lbl) lbl.textContent = photoShown ? 'Tampilkan ilustrasi' : 'Lihat foto';
    });
  }

  // Modals
  setupModals();

  // Mode Kalibrasi
  setupCalibration(fluidHero, stage);
});

function setupTimeGreeting() {
  const lbl = document.getElementById('vn-time-label');
  const title = document.getElementById('vn-greeting-text');
  const now = new Date();
  const h = now.getHours();
  let p = 'Malam', g = 'Konbanwa';
  if (h >= 5 && h < 11) { p = 'Pagi'; g = 'Ohayou!'; }
  else if (h >= 11 && h < 15) { p = 'Siang'; g = 'Konnichiwa'; }
  else if (h >= 15 && h < 18) { p = 'Sore'; g = 'Sore...'; }
  else if (h < 5) { p = 'Dini Hari'; g = 'Belum tidur juga?'; }

  if (lbl) lbl.textContent = `${p} • ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  if (title) title.textContent = g;
}

function setupModals() {
  const openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
  const closeModal = (id) => document.getElementById(id)?.classList.add('hidden');

  document.getElementById('btn-whoim')?.addEventListener('click', () => openModal('modal-whoim'));
  document.getElementById('btn-contact')?.addEventListener('click', () => openModal('modal-contact'));
  document.getElementById('btn-switch-to-contact')?.addEventListener('click', () => {
    closeModal('modal-whoim');
    openModal('modal-contact');
  });
  document.querySelectorAll('[data-close-modal]').forEach((b) => {
    b.addEventListener('click', () => closeModal(b.getAttribute('data-close-modal')));
  });
}

function setupCalibration(fluidHero, stage) {
  const hud = document.getElementById('calibration-hud');
  const toggleBtn = document.getElementById('btn-calibration-toggle');
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

  toggleBtn?.addEventListener('click', toggle);
  closeBtn?.addEventListener('click', toggle);

  document.getElementById('slider-photo-opacity')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-photo-opacity').textContent = `${Math.round(val * 100)}%`;
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
    document.getElementById('val-fluid-radius').textContent = val.toFixed(4);
  });
  document.getElementById('slider-dissipation')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.dissipation = val;
    document.getElementById('val-dissipation').textContent = val.toFixed(3);
  });
  document.getElementById('slider-distortion')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    config.fluid.distortionStrength = val;
    document.getElementById('val-distortion').textContent = val.toFixed(3);
  });
}
