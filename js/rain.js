/**
 * Rain & Interactive Condensation Window Glass System
 * - Canvas 1 (#rain-canvas): Rintik hujan latar lembut
 * - Canvas 2 (#window-glass-canvas): Lapisan kaca berembun interaktif yang bisa diusap dengan kursor/sentuhan
 * - Tetesan air menetes ke bawah membelah embun
 * - Buka achievement 'rain_wiper' saat pertama kali menyeka kaca
 */

import { triggerAchievement } from './achievements.js';
import { soundEngine } from './audio.js';
import { setCharacterExpression } from './eyes.js';

export function initRainCanvas(dialogPlayer) {
  const rainCanvas = document.getElementById('rain-canvas');
  const glassCanvas = document.getElementById('window-glass-canvas');
  const wipeHint = document.getElementById('rain-wipe-hint');

  if (!rainCanvas && !glassCanvas) return;

  const rainCtx = rainCanvas ? rainCanvas.getContext('2d') : null;
  const glassCtx = glassCanvas ? glassCanvas.getContext('2d') : null;

  let width = window.innerWidth;
  let height = window.innerHeight;

  if (rainCanvas) {
    rainCanvas.width = width;
    rainCanvas.height = height;
  }

  // -------------------------------------------------------------
  // 1. Background Falling Rain (Rintik Hujan Latar)
  // -------------------------------------------------------------
  const drops = [];
  const DROP_COUNT = 65;

  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 14 + Math.random() * 20,
      speed: 12 + Math.random() * 10,
      opacity: 0.18 + Math.random() * 0.32
    });
  }

  // -------------------------------------------------------------
  // 2. Interactive Window Glass Condensation (Kaca Berembun)
  // -------------------------------------------------------------
  const fogCanvas = document.createElement('canvas');
  const fogCtx = fogCanvas.getContext('2d');
  fogCanvas.width = width;
  fogCanvas.height = height;

  function initFogBuffer() {
    fogCanvas.width = width;
    fogCanvas.height = height;
    if (glassCanvas) {
      glassCanvas.width = width;
      glassCanvas.height = height;
    }

    fogCtx.clearRect(0, 0, width, height);

    // Lapisan kabut embun kaca tipis yang lembut & artistik
    fogCtx.fillStyle = 'rgba(200, 222, 240, 0.52)';
    fogCtx.fillRect(0, 0, width, height);

    // Butiran embun mikro statis di permukaan kaca
    const microCount = Math.floor((width * height) / 2200);
    for (let i = 0; i < microCount; i++) {
      const mx = Math.random() * width;
      const my = Math.random() * height;
      const mr = 0.8 + Math.random() * 2.6;
      fogCtx.beginPath();
      fogCtx.arc(mx, my, mr, 0, Math.PI * 2);
      fogCtx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.55)' : 'rgba(180, 210, 235, 0.4)';
      fogCtx.fill();
    }
  }

  initFogBuffer();

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    if (rainCanvas) {
      rainCanvas.width = width;
      rainCanvas.height = height;
    }
    initFogBuffer();
  });

  // Tetesan air hujan yang meluncur lambat di atas kaca
  const glassDrips = [];
  const DRIP_COUNT = 14;

  for (let i = 0; i < DRIP_COUNT; i++) {
    glassDrips.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.8 + Math.random() * 2.2,
      r: 2.2 + Math.random() * 2.4,
      trailTimer: 0
    });
  }

  // Usapan Kursor Pengguna (Wipe Gesture)
  let hasWipedOnce = false;
  let totalWipeDist = 0;
  let lastX = null;
  let lastY = null;
  let hintShown = false;

  function handlePointerWipe(e) {
    if (document.body.dataset.theme !== 'rain') return;

    const x = e.clientX;
    const y = e.clientY;

    if (lastX !== null && lastY !== null) {
      const dist = Math.hypot(x - lastX, y - lastY);
      totalWipeDist += dist;
    }
    lastX = x;
    lastY = y;

    // Hapus embun pada koordinat kursor menggunakan destination-out
    fogCtx.save();
    fogCtx.globalCompositeOperation = 'destination-out';

    const radius = 58;
    const grad = fogCtx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    fogCtx.fillStyle = grad;
    fogCtx.beginPath();
    fogCtx.arc(x, y, radius, 0, Math.PI * 2);
    fogCtx.fill();
    fogCtx.restore();

    // Deteksi usapan pertama
    if (!hasWipedOnce && totalWipeDist > 140) {
      hasWipedOnce = true;
      triggerAchievement('rain_wiper');
      soundEngine.playModalSound();

      if (wipeHint) {
        wipeHint.classList.remove('active');
      }

      if (dialogPlayer) {
        setCharacterExpression('smile', 3500);
        dialogPlayer.typeText('Oh, jendelanya berembun ya? Makasih sudah membersihkannya, sekarang aku bisa menatapmu lebih jelas. 🌧️✨');
      }
    }
  }

  window.addEventListener('pointermove', handlePointerWipe, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    handlePointerWipe(e);
  }, { passive: true });

  // Tampilkan petunjuk usap saat beralih ke mode hujan
  const observer = new MutationObserver(() => {
    if (document.body.dataset.theme === 'rain') {
      if (!hasWipedOnce && !hintShown && wipeHint) {
        hintShown = true;
        wipeHint.classList.add('active');
        setTimeout(() => {
          if (wipeHint) wipeHint.classList.remove('active');
        }, 6000);
      }
    } else {
      if (wipeHint) wipeHint.classList.remove('active');
      lastX = null;
      lastY = null;
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  // -------------------------------------------------------------
  // Render Loop Utama
  // -------------------------------------------------------------
  let slowFogCounter = 0;

  function render() {
    const isRain = document.body.dataset.theme === 'rain';

    if (isRain) {
      // 1. Gambar rintik hujan jatuh di latar belakang
      if (rainCtx) {
        rainCtx.clearRect(0, 0, width, height);
        rainCtx.strokeStyle = 'rgba(160, 195, 220, 0.42)';
        rainCtx.lineWidth = 1.3;
        rainCtx.lineCap = 'round';

        for (let i = 0; i < DROP_COUNT; i++) {
          const d = drops[i];
          rainCtx.beginPath();
          rainCtx.moveTo(d.x, d.y);
          rainCtx.lineTo(d.x + 1.8, d.y + d.length);
          rainCtx.stroke();

          d.y += d.speed;
          d.x += 1.8;

          if (d.y > height) {
            d.y = -d.length;
            d.x = Math.random() * width;
          }
        }
      }

      // 2. Gambar lapisan kaca berembun di depan
      if (glassCtx) {
        glassCtx.clearRect(0, 0, width, height);

        // Rekondensasi embun sangat lambat (mengembun kembali setelah ~25 detik jika tidak disentuh)
        slowFogCounter++;
        if (slowFogCounter % 6 === 0) {
          fogCtx.save();
          fogCtx.globalCompositeOperation = 'source-over';
          fogCtx.fillStyle = 'rgba(215, 232, 245, 0.0022)';
          fogCtx.fillRect(0, 0, width, height);
          fogCtx.restore();
        }

        // Tetesan air yang meluncur di atas kaca membelah embun
        for (let i = 0; i < DRIP_COUNT; i++) {
          const drip = glassDrips[i];
          drip.y += drip.speed;

          // Jejak tetesan membelah kabut tipis
          fogCtx.save();
          fogCtx.globalCompositeOperation = 'destination-out';
          fogCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          fogCtx.beginPath();
          fogCtx.arc(drip.x, drip.y, drip.r * 1.1, 0, Math.PI * 2);
          fogCtx.fill();
          fogCtx.restore();

          if (drip.y > height + 20) {
            drip.y = -20;
            drip.x = Math.random() * width;
            drip.speed = 0.8 + Math.random() * 2.2;
          }
        }

        // Tampilkan buffer kabut ke kanvas kaca utama
        glassCtx.drawImage(fogCanvas, 0, 0);

        // Gambar titik air berkilau di kepala setiap tetesan
        glassCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (let i = 0; i < DRIP_COUNT; i++) {
          const drip = glassDrips[i];
          glassCtx.beginPath();
          glassCtx.arc(drip.x, drip.y, drip.r * 0.8, 0, Math.PI * 2);
          glassCtx.fill();
        }
      }
    } else {
      if (rainCtx) rainCtx.clearRect(0, 0, width, height);
      if (glassCtx) glassCtx.clearRect(0, 0, width, height);
    }

    requestAnimationFrame(render);
  }

  render();
}
