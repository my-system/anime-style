/**
 * Parameter Konfigurasi & Hasil Kalibrasi Hero Portofolio
 * Bagian ini sudah dikalibrasi secara presisi (mata, wajah, jam tangan, dan fluida)
 * namun tetap dapat disetel ulang kapan saja melalui Mode Kalibrasi (tekan tombol 'K').
 */

export const config = {
  // Jalur Berkas Gambar (Rasio 3:4 — sudah diselaraskan 1:1 antara anime & foto asli)
  images: {
    anime: 'img/hyouka/hyouka-master.png',
    foto: 'img/foto-clean.png',
    blink: 'img/hyouka/hyouka-blink.png',
    fallbackAnime: 'img/hyouka.png',
    fallbackFoto: 'img/foto.png'
  },

  // Parameter Simulasi Fluida WebGL 2D — Halus, Tenang & Sinematik ala PROFIL CAFE CINEMATIC
  fluid: {
    velocityRes: 128,          // Resolusi kecepatan (128 - identik Cafe Cinematic)
    dyeRes: 512,               // Resolusi tekstur mask (512 - identik Cafe Cinematic)
    dissipation: 0.978,        // Laju memudar (0.978 - halus menutup kembali dalam 2.5 - 3 detik)
    velocityDissipation: 0.985,// Redaman momentum kecepatan fluida (0.985)
    curl: 0.0,                 // 0.0 - Mengalir tenang tanpa turbulensi kasar
    pressure: 0.50,            // Relaksasi tekanan (0.50 - identik Cafe Cinematic)
    iterations: 3,             // 3 iterasi solver Jacobi (lembut, tidak kaku/meledak)
    radius: 0.0055,            // Radius kuas halus dan presisi
    speedMultiplier: 2.8,      // Pengaruh kecepatan kursor yang proporsional
    distortionStrength: 0.002, // Refraksi air sangat halus di bibir pembukaan
    maxReveal: 0.70,           // Terbuka hingga 70% penuh (sesuai permintaan: hanya terlihat 70 persen saja)
    smoothMin: 0.01,           // Titik mulai bukaan
    smoothMax: 0.48            // Gesekan awal responsif, geser 2-3x mencapai 70% bukaan penuh foto asli
  },

  // Koordinat Mata & Kalibrasi (Dalam satuan persen % terhadap bingkai 3:4)
  calibration: {
    enabled: false,
    manualPhotoOpacity: 0.0,
    eyeShiftMaxPx: 3.5,
    leftEye:  { x: 43.4, y: 31.2, w: 6.2, h: 2.8 },
    rightEye: { x: 58.4, y: 31.2, w: 6.2, h: 2.8 }
  },

  // Profil Pemilik Portofolio (untuk modal Who I'm & Contact)
  profile: {
    name: 'Yusuf, S.Stat',
    nickname: 'Hyouka',
    role: 'Creative Frontend Developer & Data Enthusiast',
    bio: 'Lulusan Statistika (S.Stat) yang memadukan ketelitian analisis data dengan seni interaktif web modern—mulai dari simulasi fisika WebGL hingga antarmuka bergaya visual novel yang hangat.',
    email: 'yusufdarwis097@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yusuf-s-stat-41420931a/',
    github: 'https://github.com/my-system/',
    instagram: 'https://www.instagram.com/m._.systm/',
    instagramHandle: '@m._.systm'
  },

  // Audio Latar (Opsional, tidak berputar sebelum ada klik pada tombol mute)
  audio: {
    enabled: false,
    volume: 0.35
  }
};
