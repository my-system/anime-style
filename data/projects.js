/**
 * Projects Data (Bab 3: Misi Hyouka — Koleksi Portofolio Nyata D:\VIBE CODING)
 * =========================================================================
 * Menampilkan 8 proyek riil karya Yusuf, S.Stat:
 * 1. Waroeng Kopi Sedap (Profil Cafe Cinematic)
 * 2. LUNARA — Yusuf de Parfum (Moon Water)
 * 3. ZERO HOUR · Chrono Kinematics (Zero Hour)
 * 4. Advan Workplus Air Exploded View (Produk Cinematic)
 * 5. Cinematic 3D & AI Portfolio (Cinematic Portfolio)
 * 6. CCVE: Cross-Verification Engine (BPJS Healthkathon 2026)
 * 7. COPY Coffee & Eatery Palu (System-Writer POS/KDS)
 * 8. ProFaskes Auto-Bot RPA (Profaskes Autobot BAZNAS)
 * =========================================================================
 */

export const projectsData = [
  // =========================================================================
  // BARIS 1: 3 MISI UNGGULAN DENGAN VIDEO REKAMAN ASLI AUTOPLAY 60 FPS
  // =========================================================================
  {
    id: "mission-cafe",
    code: "MISI #01",
    title: "Waroeng Kopi Sedap",
    tagline: "Profil kafe sinematik dengan simulasi fluida asap WebGL 2D Navier-Stokes & golden hour video.",
    category: "Cinematic WebGL",
    tags: ["WebGL Fluid", "Three.js", "GSAP", "Lenis", "Vite"],
    date: "2026",
    accent: "#22c55e",
    image: "img/projects/cafe-cinematic.jpg",
    video: "img/projects/cafe-cinematic.mp4",
    demoUrl: "/projects-demo/PROFIL CAFE CINEMATIC/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Ah, efek asap kopi dan sapuan fluidanya yang tenang... salah satu karya favorit yang membuat suasana jadi begitu hidup!",
    story: {
      mission: "Merancang ruang pamer digital kafe bernuansa sinematik yang memadukan footage video atmosferik, navigasi gulir mulus, dan simulasi fluida waktu nyata.",
      equipment: "Peran: Creative Frontend Developer. Alat: WebGL 2D Navier-Stokes Physics, Three.js, GSAP ScrollTrigger, Lenis Smooth Scroll, Swiper.",
      obstacle: "Mengoptimalkan performa solver tekanan Jacobi dan adveksi fluida WebGL agar tetap berjalan 60 FPS stabil di samping pemutaran video background.",
      reward: "Visual sinematik yang sangat menenangkan, respons kursor fluida instan tanpa lag, dan menjadi basis fisika fluida portofolio ini."
    },
    vibeBlueprint: {
      prompt: "Rancang ruang pamer digital kafe sinematik dengan latar video golden hour 60 FPS, navigasi gulir mulus Lenis, dan kanvas WebGL 2D Navier-Stokes untuk simulasi kepulan asap kopi interaktif yang mengikuti kursor.",
      buildTime: "⏱️ 4 Jam Pengerjaan · Iterasi Shader & Solver Fluida Waktu Nyata",
      secretSauce: "Menggabungkan solver tekanan Jacobi WebGL dengan buffer tekstur HalfFloat. Agar background video tidak drop frame, adveksi fluida dijalankan pada grid simulasi 128x128 lalu di-upscale dengan bilinear filtering shader.",
      vibeSummary: "Harmoni visual yang menenangkan: kepulan asap kopi bukan sekadar dekorasi, tapi interaksi hidup yang merespons setiap gerakan kursor pengunjung."
    }
  },
  {
    id: "mission-moonwater",
    code: "MISI #02",
    title: "LUNARA — Yusuf de Parfum",
    tagline: "Website iklan komersial parfum mewah 'Di Bawah Cahaya Bulan' berbasis narasi gulir sinematik & partikel kanvas.",
    category: "Luxury Storytelling",
    tags: ["Scroll Storytelling", "Living Motion", "Canvas Particle", "Vanilla JS"],
    date: "2026",
    accent: "#059669",
    image: "img/projects/moon-water.jpg",
    video: "img/projects/lunara-moonwater.mp4",
    demoUrl: "/projects-demo/MOON WATER/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Aroma malam dan pendaran cahaya bulan... transisi videonya terasa seperti menonton film pendek yang anggun.",
    story: {
      mission: "Menciptakan pengalaman belanja parfum kelas luxury melalui perjalanan narasi visual interaktif yang membawa pengunjung merasakan wewenang malam.",
      equipment: "Peran: UI/UX & Creative Developer. Alat: Living Motion Video Playback, HTML5 Canvas Particle Engine, Vanilla JavaScript, Vercel.",
      obstacle: "Sinkronisasi frame video dengan posisi gulir mouse (scrubbing playback) agar terasa natural tanpa jittering pada koneksi beragam.",
      reward: "Pengalaman visual yang immersif dengan rata-rata interaksi pengguna mencapai akhir cerita lebih dari 88%."
    },
    vibeBlueprint: {
      prompt: "Ciptakan website iklan parfum komersial luxury bertema 'Di Bawah Cahaya Bulan' dengan teknik scrubbing frame video sinematik yang terikat langsung pada posisi scroll mouse dan partikel kanvas pendar malam.",
      buildTime: "⏱️ 5 Jam Pengerjaan · Video Scrubbing & Canvas Particle Sync",
      secretSauce: "Mengunci laju playback video HTML5 langsung ke delta pergeseran scroll wheel tanpa jeda buffering. Kanvas partikel di-layer dengan blend-mode screen untuk memancarkan kilau air dan cahaya bulan.",
      vibeSummary: "Mengubah pengalaman membaca portofolio menjadi pengalaman menonton film pendek interaktif kelas atas."
    }
  },
  {
    id: "mission-zerohour",
    code: "MISI #03",
    title: "ZERO HOUR · Chrono Kinematics",
    tagline: "Perjalanan kinematik 60 FPS satu detik abadi — dari orbit luar angkasa menembus jantung horologi mekanik.",
    category: "Motion & 3D Web",
    tags: ["Three.js", "Canvas 60FPS", "Infinite Zoom", "Vite", "FFmpeg"],
    date: "2026",
    accent: "#34d399",
    image: "img/projects/zero-hour.jpg",
    video: "img/projects/zero-hour.mp4",
    demoUrl: "/projects-demo/ZERO HOUR/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Dari luar angkasa luas sampai ke roda gigi jam terkecil dalam satu helaan napas! Skala zoom-nya gila banget.",
    story: {
      mission: "Mewujudkan konsep one-continuous-shot infinite zoom 60 FPS yang menghubungkan makrokosmos bumi dengan mikrokosmos presisi jam tangan mekanik.",
      equipment: "Peran: Creative Technologist. Alat: Three.js WebGL, High-Performance Canvas Renderer, FFmpeg Frame Extraction, Vite.",
      obstacle: "Mengelola buffer memori dan tekstur resolusi tinggi pada kedalaman zoom tak terbatas agar tidak terjadi drop frame.",
      reward: "Transisi kontinu yang memukau tanpa jeda loading antar-skala visual, berjalan mulus di 60 FPS."
    },
    vibeBlueprint: {
      prompt: "Bangun pengalaman visual infinite zoom 60 FPS satu bidikan tanpa terputus (one continuous shot) yang bergerak dari orbit luar angkasa menembus mekanisme roda gigi jam tangan mekanik terkecil.",
      buildTime: "⏱️ 6 Jam Pengerjaan · Multi-Scale Asset Optimization & Three.js",
      secretSauce: "Ekstraksi frame presisi tinggi via pipeline FFmpeg, dikombinasikan dengan manajemen memori tekstur dinamis pada Three.js agar transisi dari makro (bumi) ke mikro (gir jam) tidak mengalami lonjakan memori (zero frame drop).",
      vibeSummary: "Koreografi spasial 60 FPS yang memukau mata: membuktikan batas apa yang bisa dirender peramban web modern."
    }
  },

  // =========================================================================
  // BARIS 2: 3D HARDWARE (VIDEO), AI & CREATIVE TECH (VIDEO), & DATA ENGINE
  // =========================================================================
  {
    id: "mission-advan",
    code: "MISI #04",
    title: "Advan Workplus Air — Exploded View",
    tagline: "Rekayasa 3D prosedural laptop Advan Workplus Air dengan 20 komponen terpisah dan efek exploded view interaktif.",
    category: "3D Hardware Visual",
    tags: ["Blender bpy", "Three.js", "glTF/GLB", "PBR Materials", "Procedural 3D"],
    date: "2026",
    accent: "#14b8a6",
    image: "img/projects/advan-exploded.jpg",
    video: "img/projects/advan-exploded.mp4",
    demoUrl: "/projects-demo/PRODUK CINEMATIC/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Setiap sekrup, heatsink, dan baterai bisa dibongkar-pasang di kanvas 3D. Detail anatomi hardware-nya luar biasa!",
    story: {
      mission: "Membangun model 3D laptop komersial secara prosedural menggunakan otomasi script Blender Python (bpy) lalu menampilkannya secara interaktif di browser.",
      equipment: "Peran: 3D Computational Modeler & WebGL Dev. Alat: Python bpy, Blender, Three.js WebGL, glTF PBR Pipeline.",
      obstacle: "Menyelaraskan pivot pusat massa 20 komponen mekanik berbeda agar animasi pemisahan (exploded view) bergerak proporsional dan presisi.",
      reward: "File model 3D optimal di bawah 15 MB dengan material PBR fotorealistik dan interaksi bongkar-pasang 360 derajat di browser."
    },
    vibeBlueprint: {
      prompt: "Tulis script Python Blender (bpy) untuk merekayasa laptop Advan Workplus Air secara prosedural menjadi 20 komponen mekanik terpisah, lalu ekspor ke glTF PBR untuk interaksi exploded view 360° di browser.",
      buildTime: "⏱️ 5 Jam Pengerjaan · Blender Python bpy Scripting & glTF WebGL",
      secretSauce: "Otomasi script Python (bpy) untuk menentukan pivot pusat massa 20 komponen secara matematis. Di browser, Three.js menginterpolasi jarak pemisahan (exploded view) secara linear saat slider digeser.",
      vibeSummary: "Bongkar-pasang hardware komersial secara interaktif langsung dari jendela browser tanpa unduh aplikasi 3D berat."
    }
  },
  {
    id: "mission-cinematicportfolio",
    code: "MISI #05",
    title: "Cinematic 3D & AI Portfolio",
    tagline: "Eksplorasi portofolio interaktif memadukan React Three Fiber, GLSL shaders, dan Google Gemini Multimodal AI.",
    category: "AI & Creative Tech",
    tags: ["React Three Fiber", "Google GenAI", "GSAP", "Tailwind CSS", "Lenis"],
    date: "2026",
    accent: "#065f46",
    image: "img/projects/cinematic-portfolio.jpg",
    video: "img/projects/cinematic-portfolio.mp4",
    demoUrl: "/projects-demo/CINEMATIC PORTFOLIO/dist/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Perpaduan estetika 3D sinematik dan kecerdasan buatan Google Gemini. Masa depan eksplorasi web modern!",
    story: {
      mission: "Merancang pengalaman portofolio generasi baru dengan lingkungan grafis spasial 3D dan asisten cerdas AI berbasis Google Gemini API.",
      equipment: "Peran: Creative Technologist. Alat: React Three Fiber, @google/genai SDK, GSAP, Tailwind CSS, Lenis Scroll.",
      obstacle: "Mengintegrasikan model AI real-time responsif di dalam kanvas rendering 3D tanpa menyebabkan frame throttling.",
      reward: "Antarmuka portofolio interaktif tingkat lanjut yang mendemonstrasikan keahlian multidisipliner statistika, AI, dan grafis web."
    },
    vibeBlueprint: {
      prompt: "Bangun portofolio 3D modern menggunakan React Three Fiber dan GLSL shaders, lalu integrasikan Google Gemini API sebagai asisten interaktif multimodal yang memahami konteks visual proyek.",
      buildTime: "⏱️ 5 Jam Pengerjaan · React Three Fiber & Google GenAI SDK",
      secretSauce: "Mengisolasi thread inference Google Gemini di Web Worker terpisah agar pemanggilan AI waktu nyata tidak mengganggu siklus render 60 FPS pada kanvas WebGL 3D.",
      vibeSummary: "Perpaduan masa depan: grafis 3D spasial dan asisten cerdas AI yang berinteraksi langsung dengan audiens."
    }
  },
  {
    id: "mission-ccve",
    code: "MISI #06",
    title: "CCVE: Cross-Verification Engine",
    tagline: "Mesin verifikasi silang berkelanjutan deteksi risiko inefisiensi faskes (BPJS Healthkathon 2026).",
    category: "Data Science & HealthTech",
    tags: ["Python", "FastAPI", "Statistical Audit", "Docker", "Data Engine"],
    date: "2026",
    accent: "#10b981",
    image: "img/projects/ccve-healthkathon.jpg",
    demoUrl: "#demo-ccve",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Misi kelas berat! Mengolah data klaim kesehatan dengan pendekatan statistika presisi tinggi untuk deteksi anomali.",
    story: {
      mission: "Menggeser paradigma audit klaim kesehatan dari pasca-bayar (pay-and-chase) ke sistem verifikasi pre-payment cerdas untuk 20 subkategori risiko inefisiensi faskes.",
      equipment: "Peran: Lead Data & Systems Analyst (S.Stat). Alat: Python, Statistical Algorithms, FastAPI Backend, Docker, Analytical Dashboard.",
      obstacle: "Menangani kompleksitas korelasi silang antar ribuan rekam klaim medis secara real-time tanpa false-positive yang merugikan faskes.",
      reward: "Terpilih sebagai karya inovasi Healthkathon BPJS Kesehatan 2026 dengan efisiensi deteksi dini risiko kebocoran klaim yang teruji."
    },
    vibeBlueprint: {
      prompt: "Bangun mesin audit berkelanjutan untuk mendeteksi risiko inefisiensi klaim BPJS Kesehatan pre-payment berbasis statistika inferensial multidimensi dan anomali scoring.",
      buildTime: "⏱️ Karya Inovasi BPJS Healthkathon 2026 · Lead Data Analyst (S.Stat)",
      secretSauce: "Menggeser paradigma audit dari post-payment ke verifikasi pre-payment cerdas untuk 20 subkategori risiko klaim menggunakan algoritma deteksi anomali multivariat dan FastAPI backend.",
      vibeSummary: "Aplikasi nyata ilmu statistika inferensial (S.Stat) untuk menyelamatkan potensi inefisiensi anggaran layanan kesehatan publik."
    }
  },

  // =========================================================================
  // BARIS 3: SISTEM PEMESANAN & OTOMASI RPA FASKES
  // =========================================================================
  {
    id: "mission-systemwriter",
    code: "MISI #07",
    title: "COPY Coffee & Eatery Palu",
    tagline: "Sistem pemesanan mandiri nirsentuh berbasis QR Code meja & Kitchen Display System (KDS) terintegrasi barista.",
    category: "Fullstack & POS Web",
    tags: ["Node.js", "Express", "QR Ordering", "Barista KDS", "Realtime UI"],
    date: "2026",
    accent: "#0d9488",
    image: "img/projects/system-writer.png",
    demoUrl: "/projects-demo/SYSTEM-WRITER/public/index.html",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Solusi nyata buat nongkrong tanpa antre! Scan meja, pilih kopi, dan barista langsung terima tiket pesanannya.",
    story: {
      mission: "Menghilangkan antrean kasir panjang di kedai kopi COPY Palu dengan sistem self-ordering mandiri via kamera smartphone pelanggan.",
      equipment: "Peran: Fullstack Solution Architect. Alat: Node.js, Express REST API, QR Code Dynamic Table Generator, Barista KDS Web App.",
      obstacle: "Menjamin sinkronisasi tiket pesanan meja secara instan tanpa tumpang tindih antrean saat jam sibuk (peak hour).",
      reward: "Memangkas waktu tunggu pemesanan dari 8 menit menjadi di bawah 45 detik dan telah siap diimplementasikan langsung di gerai."
    },
    vibeBlueprint: {
      prompt: "Rancang arsitektur sistem pemesanan kafe nirsentuh berbasis scan QR meja, integrasi menu real-time, dan Kitchen Display System (KDS) untuk kedai kopi COPY Palu.",
      buildTime: "⏱️ 8 Jam Pengerjaan · Node.js, Express & Barista KDS Web App",
      secretSauce: "Dynamic QR Generator per meja dengan payload terenkripsi. State pesanan disinkronkan secara asinkron ke layar display barista tanpa perlu install aplikasi native di HP pelanggan.",
      vibeSummary: "Solusi praktis dan nyata: memangkas waktu tunggu dari 8 menit menjadi di bawah 45 detik langsung di gerai."
    }
  },
  {
    id: "mission-profaskes",
    code: "MISI #08",
    title: "ProFaskes Auto-Bot RPA",
    tagline: "Ekstensi otomatisasi penginputan data rekam medis, pasien baru, dan poliklinik berbasis spreadsheet untuk RSB BAZNAS.",
    category: "RPA & Extension",
    tags: ["Chrome Extension V3", "SheetJS / XLSX", "DOM Automation", "Healthcare RPA"],
    date: "2026",
    accent: "#047857",
    image: "img/projects/profaskes-rpa.svg",
    demoUrl: "https://github.com/my-system/ProFaskes-AutoBot",
    githubUrl: "https://github.com/my-system/",
    characterComment: "Otomasi penyelamat petugas klinik! Menghemat ribuan ketukan input manual jadi sekali klik impor spreadsheet.",
    story: {
      mission: "Mengotomatiskan alur kerja manual staf pendaftaran klinik RSB BAZNAS Palu dalam memindahkan ratusan data pasien harian ke portal ProFaskes.",
      equipment: "Peran: Automation & Extension Developer. Alat: Chrome Extension (Manifest V3), SheetJS (xlsx), Asynchronous DOM Injection.",
      obstacle: "Menangani validasi dinamis formulir multi-tahap (identitas pasien baru ➔ verifikasi poli) dengan latensi server faskes yang fluktuatif.",
      reward: "Menghemat lebih dari 75% waktu administrasi petugas loket dan mengeliminasi kesalahan ketik data rekam medis."
    },
    vibeBlueprint: {
      prompt: "Buatkan Chrome Extension Manifest V3 dengan SheetJS untuk mengotomasi pemindahan ratusan data pasien harian dari spreadsheet Excel ke sistem portal klinik ProFaskes RSB BAZNAS Palu.",
      buildTime: "⏱️ 4 Jam Pengerjaan · Chrome Extension Manifest V3 & SheetJS",
      secretSauce: "DOM injection asinkron yang menangani latensi server faskes yang fluktuatif secara adaptif dengan retry exponential backoff, memvalidasi form multi-tahap pasien baru dan poli.",
      vibeSummary: "Otomasi yang berdampak nyata: menghemat lebih dari 75% waktu administrasi petugas loket dan mengeliminasi human error ketik data medis."
    }
  }
];
