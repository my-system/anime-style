/**
 * Water Ripple & Wind Breeze Simulation (Efek Riak Air & Semilir Angin)
 * - Menghasilkan cincin riak air konsentris (water ripples) yang merambat halus saat kursor bergerak
 * - Efek hembusan semilir angin (wind breeze wisps) dan butiran embun berkilau
 * - Tetesan air jatuh (water droplet plop) dengan riak ganda dan percikan air saat klik
 */

export function initInkTrail() {
  const canvas = document.getElementById('ink-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const toggleBtn = document.getElementById('ink-toggle-btn');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let enabled = !reducedMotion && localStorage.getItem('amine_ink') !== 'off';

  // Koleksi objek aktif
  let ripples = [];   // Gelombang riak air konsentris
  let drops = [];     // Butiran cipratan air & partikel angin
  let windStream = [];// Jejak semilir pita angin
  let lastPos = null;
  let lastRippleTime = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Palet warna sesuai suasana (Terang / Malam / Hujan)
  function getWaterPalette() {
    const theme = document.body.dataset.theme;
    if (theme === 'night') {
      return {
        crest: '56, 189, 248',    // Cyan bercahaya bioluminescent
        accent: '52, 211, 153',   // Hijau aurora zamrud
        trough: '14, 116, 144',
        mist: '224, 242, 254'
      };
    }
    // Suasana Terang / Default
    return {
      crest: '2, 132, 199',       // Biru air kristal jernih
      accent: '34, 197, 94',      // Aksen zamrud segar
      trough: '14, 165, 233',
      mist: '186, 230, 253'
    };
  }

  // Tambah cincin riak air
  function addRipple(x, y, maxR = 75, speed = 1.3, strength = 1.0) {
    ripples.push({
      x,
      y,
      r: 3,
      maxR,
      speed,
      strength,
      t: performance.now(),
      duration: 1100 + maxR * 4
    });
    if (ripples.length > 60) ripples.shift();
  }

  // Pointer move handler (Membangkitkan riak & hembusan angin)
  window.addEventListener('pointermove', (e) => {
    if (!enabled || e.pointerType === 'touch') return;
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;

    if (!lastPos) {
      lastPos = { x, y, t: now };
      addRipple(x, y, 45, 1.2, 0.7);
      return;
    }

    const dist = Math.hypot(x - lastPos.x, y - lastPos.y);
    const dt = Math.max(now - lastPos.t, 1);
    const speed = dist / dt; // px per ms

    // Tambahkan riak air saat kursor bergerak dengan jeda jarak lembut
    if (dist > 18 && now - lastRippleTime > 55) {
      const rippleSize = Math.min(40 + speed * 25, 95);
      const strength = Math.min(0.6 + speed * 0.35, 1.2);
      addRipple(x, y, rippleSize, 1.4 + speed * 0.4, strength);
      lastRippleTime = now;
    }

    // Rekam pita semilir angin (Wind Wisps)
    windStream.push({
      x,
      y,
      t: now,
      vx: (x - lastPos.x) / dt,
      vy: (y - lastPos.y) / dt,
      speed
    });
    if (windStream.length > 40) windStream.shift();

    // Hembusan butiran embun halus / wind particles saat gerakan cepat
    if (speed > 1.2 && Math.random() < 0.4) {
      const angle = Math.atan2(y - lastPos.y, x - lastPos.x) + (Math.random() - 0.5) * 1.4;
      const v = 0.5 + Math.random() * 2.0;
      drops.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * v + (Math.random() - 0.5) * 0.5,
        vy: Math.sin(angle) * v - (0.4 + Math.random() * 0.8), // Mengapung sedikit ke atas seperti angin
        r: 1.0 + Math.random() * 2.0,
        t: now,
        lifeTime: 600 + Math.random() * 400,
        isDrop: false
      });
    }

    lastPos = { x, y, t: now };
  });

  window.addEventListener('pointerleave', () => {
    lastPos = null;
  });

  // Pointer down handler (Tetesan air jatuh ke permukaan / Plop Wave)
  window.addEventListener('pointerdown', (e) => {
    if (!enabled || e.pointerType === 'touch') return;
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;

    // 3 Gelombang riak bertingkat (Cascading Triple Ripples)
    addRipple(x, y, 110, 1.8, 1.4);
    setTimeout(() => { if (enabled) addRipple(x, y, 85, 1.5, 1.1); }, 90);
    setTimeout(() => { if (enabled) addRipple(x, y, 60, 1.2, 0.8); }, 180);

    // Percikan butiran air kristal (Water Splashes)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const v = 1.8 + Math.random() * 3.8;
      drops.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - 1.2, // Efek melambung
        r: 1.5 + Math.random() * 2.8,
        t: now,
        lifeTime: 750 + Math.random() * 350,
        isDrop: true
      });
    }
  });

  // Render loop utama
  function frame(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ripples = ripples.filter((r) => now - r.t < r.duration && r.r < r.maxR);
    drops = drops.filter((d) => now - d.t < d.lifeTime);
    windStream = windStream.filter((w) => now - w.t < 480);

    const colors = getWaterPalette();

    // 1. Render Pita Semilir Angin (Wind Streamline Wisps)
    if (windStream.length > 2) {
      for (let i = 1; i < windStream.length; i++) {
        const p0 = windStream[i - 1];
        const p1 = windStream[i];
        const life = 1 - (now - p1.t) / 480;
        if (life <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(${colors.mist}, ${life * 0.45})`;
        ctx.lineWidth = Math.max(1, (12 - i * 0.25) * life);
        ctx.stroke();

        // Garis angin kedua (lebih tipis & aksen hijau zamrud lembut)
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(${colors.accent}, ${life * 0.28})`;
        ctx.lineWidth = Math.max(0.6, (4 - i * 0.1) * life);
        ctx.stroke();
      }
    }

    // 2. Render Cincin Riak Air Konsentris (Concentric Water Ripples)
    for (const rp of ripples) {
      const elapsed = now - rp.t;
      const progress = elapsed / rp.duration; // 0 -> 1
      const life = (1 - progress) * rp.strength;

      // Jari-jari membesar dengan redaman alami
      rp.r += rp.speed * (1 - progress * 0.6);

      // Cincin Luar (Puncak Gelombang Air / Wave Crest)
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colors.crest}, ${life * 0.55})`;
      ctx.lineWidth = Math.max(0.8, 2.8 * (1 - progress));
      ctx.stroke();

      // Cincin Dalam (Lembah Gelombang / Refraction Trough)
      if (rp.r > 6) {
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, Math.max(1, rp.r - 3.5), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${colors.accent}, ${life * 0.32})`;
        ctx.lineWidth = Math.max(0.5, 1.4 * (1 - progress));
        ctx.stroke();
      }

      // Cahaya Lensa Air di Pusat (Water Center Glow)
      if (progress < 0.45) {
        const glowLife = (1 - progress / 0.45) * rp.strength;
        const grad = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, rp.r * 0.7);
        grad.addColorStop(0, `rgba(${colors.mist}, ${glowLife * 0.22})`);
        grad.addColorStop(1, `rgba(${colors.crest}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Render Percikan Air & Butiran Embun Angin
    for (const d of drops) {
      const life = 1 - (now - d.t) / d.lifeTime;
      if (life <= 0) continue;

      d.x += d.vx;
      d.y += d.vy;

      if (d.isDrop) {
        d.vy += 0.12; // Gravitasi untuk percikan air
        d.vx *= 0.96;
        d.vy *= 0.96;
      } else {
        d.vx *= 0.94; // Gesekan udara lembut untuk angin
        d.vy *= 0.94;
      }

      // Kilau butiran air
      const r = Math.max(0.5, d.r * life);
      ctx.fillStyle = d.isDrop
        ? `rgba(${colors.crest}, ${life * 0.75})`
        : `rgba(${colors.mist}, ${life * 0.60})`;

      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Titik putih kilau refleksi cahaya
      if (r > 1.2) {
        ctx.fillStyle = `rgba(255, 255, 255, ${life * 0.9})`;
        ctx.beginPath();
        ctx.arc(d.x - r * 0.3, d.y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Toggle button listener
  if (toggleBtn) {
    toggleBtn.textContent = `Riak: ${enabled ? 'ON' : 'OFF'}`;
    toggleBtn.title = 'Nyalakan atau matikan efek riak air dan angin';
    toggleBtn.addEventListener('click', () => {
      enabled = !enabled;
      ripples = [];
      drops = [];
      windStream = [];
      lastPos = null;
      toggleBtn.textContent = `Riak: ${enabled ? 'ON' : 'OFF'}`;
      try {
        localStorage.setItem('amine_ink', enabled ? 'on' : 'off');
      } catch (err) {
        console.warn('localStorage inaccessible', err);
      }
    });
  }
}