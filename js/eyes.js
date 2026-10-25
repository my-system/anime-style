/**
 * Eyes & Expression Cross-Fade System (Bab 5.1 & 5.2 Cetak Biru)
 * - Gerak mata mengikuti kursor via overlay clip-path (2 - 4 px)
 * - Pertukaran ekspresi (base, blink, surprised, sleepy, smile) dengan cross-fade 150ms
 * - Mode kalibrasi visual dengan kotak indikator area mata
 */

import { siteConfig } from '../data/config.js';
import { easterEggDialogues } from '../data/dialogs.js';
import { triggerAchievement } from './achievements.js';

let currentExpression = 'base';
let blinkTimeout = null;
let revertTimeout = null;

export function initEyes(onStareCallback = null) {
  const eyeLayer = document.querySelector('.character-eyes-layer');
  const characterWrap = document.querySelector('.character-wrap');
  if (!eyeLayer || !characterWrap) return;

  const MAX = siteConfig.eyeCalibration.maxOffsetPx || 3.5;
  let stareTimer = null;
  let isHoveringEyes = false;

  // Gerak mata mengikuti kursor (desktop) & sentuhan (HP)
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    const offsetX = Math.max(-MAX, Math.min(MAX, nx * MAX));
    const offsetY = Math.max(-MAX, Math.min(MAX, ny * MAX * 0.75));

    eyeLayer.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;

    // Deteksi Tatapan Beradu (kursor diam di area mata selama 5 detik)
    const rect = characterWrap.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      // Area bukaan mata pada potret 768x1024: X 0.39..0.63, Y 0.28..0.35
      if (relX >= 0.39 && relX <= 0.63 && relY >= 0.28 && relY <= 0.35) {
        if (!isHoveringEyes) {
          isHoveringEyes = true;
          stareTimer = setTimeout(() => {
            setCharacterExpression('surprised', 3200);
            triggerAchievement('eye_contact');
            if (onStareCallback) {
              onStareCallback(easterEggDialogues.stare);
            }
          }, 5000);
        }
      } else {
        cancelStare();
      }
    } else {
      cancelStare();
    }
  });

  function cancelStare() {
    if (stareTimer) {
      clearTimeout(stareTimer);
      stareTimer = null;
    }
    isHoveringEyes = false;
  }

  // Kedip acak tiap 3 sampai 6 detik (120-140ms)
  function triggerNaturalBlink() {
    if (currentExpression === 'base') {
      const blinkImg = document.querySelector('.expr-layer[data-expr="blink"]');
      if (blinkImg) {
        blinkImg.classList.add('active');
        eyeLayer.classList.add('hidden-eye-track');
        setTimeout(() => {
          if (currentExpression === 'base') {
            blinkImg.classList.remove('active');
            eyeLayer.classList.remove('hidden-eye-track');
          }
        }, 135);
      }
    }
    scheduleNextBlink();
  }

  function scheduleNextBlink() {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    const delay = 3200 + Math.random() * 2800;
    blinkTimeout = setTimeout(triggerNaturalBlink, delay);
  }

  scheduleNextBlink();
  setupCalibrationTool();
}

/**
 * Mengubah ekspresi karakter dengan cross-fade 150ms antar layer gambar
 * @param {'base'|'blink'|'surprised'|'sleepy'|'smile'} expr
 * @param {number} durationMs Jika > 0, otomatis kembali ke 'base' setelah durasi
 */
export function setCharacterExpression(expr = 'base', durationMs = 0) {
  if (revertTimeout) {
    clearTimeout(revertTimeout);
    revertTimeout = null;
  }

  currentExpression = expr;
  window.dispatchEvent(new CustomEvent('character-expression-change', { detail: { expr } }));
  const layers = document.querySelectorAll('.expr-layer');
  const eyeLayer = document.querySelector('.character-eyes-layer');
  const badgeEl = document.getElementById('character-expr-badge');

  layers.forEach((img) => {
    const type = img.dataset.expr;
    if (type === 'base') {
      img.classList.add('active');
    } else {
      img.classList.toggle('active', type === expr);
    }
  });

  // Sembunyikan layer geser iris saat mata terpejam / menyipit agar tidak bocor
  if (eyeLayer) {
    const hideTrack = expr === 'blink' || expr === 'sleepy' || expr === 'smile';
    eyeLayer.classList.toggle('hidden-eye-track', hideTrack);
  }

  const labelMap = {
    base: 'Tatapan Tenang',
    blink: 'Terpejam',
    surprised: 'Terkejut',
    sleepy: 'Mengantuk',
    smile: 'Senyum Hangat'
  };
  if (badgeEl && labelMap[expr]) {
    badgeEl.textContent = labelMap[expr];
  }

  if (durationMs > 0 && expr !== 'base') {
    revertTimeout = setTimeout(() => {
      setCharacterExpression('base', 0);
    }, durationMs);
  }
}

/**
 * Mode Kalibrasi Area Mata (Ctrl+Shift+C) dengan Kotak Visual Debug
 */
function setupCalibrationTool() {
  const modal = document.getElementById('calibration-modal');
  const debugOverlay = document.getElementById('eye-debug-boxes');
  const closeBtn = document.getElementById('calib-close-btn');
  if (!modal) return;

  function toggleCalibration() {
    const isActive = modal.classList.toggle('active');
    if (debugOverlay) {
      debugOverlay.classList.toggle('active', isActive);
    }
    syncDebugBoxes();
  }

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      toggleCalibration();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', toggleCalibration);
  }

  const ellipseLeft = document.getElementById('clip-left-eye');
  const ellipseRight = document.getElementById('clip-right-eye');
  const boxLeft = document.getElementById('debug-box-left');
  const boxRight = document.getElementById('debug-box-right');
  if (!ellipseLeft || !ellipseRight) return;

  const inputs = {
    lcx: document.getElementById('calib-lcx'),
    lcy: document.getElementById('calib-lcy'),
    lrx: document.getElementById('calib-lrx'),
    lry: document.getElementById('calib-lry'),
    rcx: document.getElementById('calib-rcx'),
    rcy: document.getElementById('calib-rcy'),
    rrx: document.getElementById('calib-rrx'),
    rry: document.getElementById('calib-rry')
  };

  function syncDebugBoxes() {
    const lcx = parseFloat(inputs.lcx?.value || 0.436);
    const lcy = parseFloat(inputs.lcy?.value || 0.314);
    const lrx = parseFloat(inputs.lrx?.value || 0.025);
    const lry = parseFloat(inputs.lry?.value || 0.015);

    const rcx = parseFloat(inputs.rcx?.value || 0.583);
    const rcy = parseFloat(inputs.rcy?.value || 0.314);
    const rrx = parseFloat(inputs.rrx?.value || 0.025);
    const rry = parseFloat(inputs.rry?.value || 0.015);

    ellipseLeft.setAttribute('cx', lcx);
    ellipseLeft.setAttribute('cy', lcy);
    ellipseLeft.setAttribute('rx', lrx);
    ellipseLeft.setAttribute('ry', lry);

    ellipseRight.setAttribute('cx', rcx);
    ellipseRight.setAttribute('cy', rcy);
    ellipseRight.setAttribute('rx', rrx);
    ellipseRight.setAttribute('ry', rry);

    if (boxLeft) {
      boxLeft.style.left = `${(lcx - lrx) * 100}%`;
      boxLeft.style.top = `${(lcy - lry) * 100}%`;
      boxLeft.style.width = `${lrx * 200}%`;
      boxLeft.style.height = `${lry * 200}%`;
    }
    if (boxRight) {
      boxRight.style.left = `${(rcx - rrx) * 100}%`;
      boxRight.style.top = `${(rcy - rry) * 100}%`;
      boxRight.style.width = `${rrx * 200}%`;
      boxRight.style.height = `${rry * 200}%`;
    }
  }

  Object.values(inputs).forEach((input) => {
    if (input) input.addEventListener('input', syncDebugBoxes);
  });

  syncDebugBoxes();
}
