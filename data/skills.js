/**
 * Skills Data (Bab 2: Jurus Hyouka)
 * =========================================================================
 * Persona: AI-First Creative Builder & Vibe Technologist
 * Berfokus pada keahlian riil: Kecepatan Eksekusi AI, Estetika Visual,
 * Pemecahan Masalah Praktis, dan Fondasi Logika Statistika (S.Stat).
 * Dilengkapi relasi ke proyek nyata (Skill-to-Project Bridge).
 * =========================================================================
 */

export const skillsData = {
  mainWeapons: [
    {
      name: "AI Prompting & Agents",
      level: "Alur Utama",
      meta: "Harian",
      fill: 96,
      icon: "🔮",
      desc: "Mengarahkan coding agents & LLM (Cursor, Antigravity, Claude) untuk merakit arsitektur kode dan memecahkan bug seketika.",
      comment: "Senjata terkuatku. Kecepatan eksekusi dan pemecahan masalah berlipat ganda saat kita tahu cara memberi instruksi yang tepat.",
      relatedProjects: [
        { id: "mission-cinematicportfolio", title: "Cinematic 3D & AI" },
        { id: "mission-profaskes", title: "ProFaskes RPA" }
      ]
    },
    {
      name: "Visual Layout & Modern CSS",
      level: "Estetika",
      meta: "20+ Proyek",
      fill: 94,
      icon: "🎨",
      desc: "Kepekaan komposisi, tipografi responsif, palet warna sinematik, micro-interactions, dan transisi halus.",
      comment: "AI bisa menulis kode, tapi rasa estetika visual, ritme layout, dan kenyamanan mata tetap harus kita yang mengarahkan.",
      relatedProjects: [
        { id: "mission-cafe", title: "Waroeng Kopi Sedap" },
        { id: "mission-moonwater", title: "LUNARA de Parfum" }
      ]
    },
    {
      name: "JavaScript & Logic Wiring",
      level: "Praktis",
      meta: "16 Proyek",
      fill: 88,
      icon: "⚡",
      desc: "Merangkai logika DOM interaktif, integrasi state, penanganan API asinkron, dan manipulasi data dinamis.",
      comment: "Memahami bagaimana komponen web saling bicara agar interaksi di layar terasa hidup dan tanpa hambatan.",
      relatedProjects: [
        { id: "mission-systemwriter", title: "COPY Coffee POS" },
        { id: "mission-cafe", title: "Waroeng Kopi Sedap" }
      ]
    },
    {
      name: "Statistika & Data Analytics",
      level: "S.Stat",
      meta: "Pondasi Riil",
      fill: 92,
      icon: "📊",
      desc: "Analisis statistik terapan, deteksi anomali data (seperti di proyek BPJS Healthkathon), dan interpretasi kuantitatif.",
      comment: "Latar belakang S.Stat memberiku fondasi logika matematika yang kuat untuk membedah data dan sistem yang rumit.",
      relatedProjects: [
        { id: "mission-ccve", title: "CCVE BPJS Healthkathon" }
      ]
    }
  ],
  secondaryWeapons: [
    {
      name: "GSAP & Canvas Motion",
      level: "Mahir",
      meta: "9 Proyek",
      fill: 86,
      icon: "✨",
      desc: "Koreografi scroll interaktif, partikel halus 60 FPS, dan efek fluida kanvas yang dinamis.",
      comment: "Jejak tinta dan partikel yang mengalir di layar ini lahir dari eksplorasi animasi kanvas.",
      relatedProjects: [
        { id: "mission-zerohour", title: "ZERO HOUR 60FPS" },
        { id: "mission-cafe", title: "Waroeng Kopi Sedap" }
      ]
    },
    {
      name: "Figma to Prototype",
      level: "Cepat & Rapi",
      meta: "15 Proyek",
      fill: 88,
      icon: "📐",
      desc: "Mengubah konsep visual dan sketsa desain menjadi antarmuka web interaktif yang siap dipakai.",
      comment: "Dari sketsa kasar sampai prototipe hidup di browser hanya butuh hitungan jam.",
      relatedProjects: [
        { id: "mission-moonwater", title: "LUNARA de Parfum" },
        { id: "mission-systemwriter", title: "COPY Coffee POS" }
      ]
    },
    {
      name: "Node.js & Backend API",
      level: "Praktis",
      meta: "8 Proyek",
      fill: 82,
      icon: "🔌",
      desc: "Menghubungkan frontend dengan server REST API ringan, database lokal, dan alur sistem POS / KDS.",
      comment: "Cukup untuk menggerakkan alur pemesanan kopi nirsentuh dan otomasi server tanpa kerumitan.",
      relatedProjects: [
        { id: "mission-systemwriter", title: "COPY Coffee POS/KDS" }
      ]
    },
    {
      name: "Browser Extension & RPA",
      level: "Otomasi",
      meta: "Solusi Riil",
      fill: 90,
      icon: "⚙️",
      desc: "Membangun bot ekstensi Chrome Manifest V3 untuk mengotomasi input data ratusan rekam medis faskes dari spreadsheet.",
      comment: "Otomasi yang menghemat ribuan ketukan staf klinik—karena kode terbaik adalah kode yang menghemat waktu manusia.",
      relatedProjects: [
        { id: "mission-profaskes", title: "ProFaskes Auto-Bot RPA" }
      ]
    }
  ],
  secretJutsu: [
    {
      name: "Three.js & WebGL 3D",
      level: "Eksplorasi",
      meta: "4 Proyek",
      fill: 75,
      icon: "🌌",
      desc: "Menghadirkan objek 3D interaktif, pencahayaan spasial, dan animasi exploded-view produk di browser.",
      comment: "Eksperimen 3D yang terus kulatih untuk membawa pengalaman web ke dimensi spasial berikutnya.",
      relatedProjects: [
        { id: "mission-advan", title: "Advan Exploded View" },
        { id: "mission-zerohour", title: "ZERO HOUR" }
      ]
    },
    {
      name: "Web Audio Synthesis",
      level: "Praktis",
      meta: "3 Proyek",
      fill: 74,
      icon: "🎵",
      desc: "Sintesis efek suara foley interaktif dan musik ambient dinamis langsung melalui Web Audio API.",
      comment: "Setiap bunyi klik dan suasana hujan di portofolio ini disintesis langsung lewat kode audio untuk memperkuat nuansa.",
      relatedProjects: [
        { id: "mission-cafe", title: "Waroeng Kopi Sedap" }
      ]
    },
    {
      name: "Cinematic Video & Editing",
      level: "Mahir",
      meta: "10 Karya",
      fill: 90,
      icon: "🎬",
      desc: "Pengolahan video 4K 60fps (DaVinci/Premiere), color grading atmosferik, dan aset grafis sinematik.",
      comment: "Mata visualku berasal dari sini: memahami ritme potongan, pencahayaan, dan bagaimana cerita disampaikan lewat gambar.",
      relatedProjects: [
        { id: "mission-cafe", title: "Waroeng Kopi Sedap" },
        { id: "mission-advan", title: "Advan Exploded View" }
      ]
    }
  ]
};
