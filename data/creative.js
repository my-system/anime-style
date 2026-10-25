/**
 * Data Karya Desain Grafis & Video Editing (Studio Sinema & Atelier Visual)
 * =========================================================================
 * Koleksi Portofolio Visual & Sinematik Nyata Karya Yusuf, S.Stat
 * Mencakup 3 Proyek Video Editing & Motion Graphic serta
 * 7 Karya Desain Grafis Institusional (Klinik Rumah Sehat BAZNAS Palu).
 * =========================================================================
 */

export const creativeData = [
  // ==========================================
  // BAGIAN 1: VIDEO EDITING & MOTION (3 KARYA)
  // ==========================================
  {
    id: "creative-video-cafe",
    code: "CINEMA #01",
    type: "video",
    category: "Video Editing & Motion",
    title: "Cinematic Cafe Commercial · Waroeng Kopi Sedap",
    tagline: "Iklan komersial sinematik bernuansa golden hour dengan foley audio cangkir kopi dan ritme potongan dinamis.",
    format: "16:9 Landscape",
    duration: "01:24",
    resolution: "4K · 60 FPS",
    accent: "#f59e0b",
    image: "img/projects/cafe-cinematic.jpg",
    video: "img/projects/cafe-cinematic.mp4",
    videoUrl: "img/projects/cafe-cinematic.mp4",
    software: ["DaVinci Resolve", "Adobe Premiere Pro", "After Effects"],
    roles: ["Video Editor", "Colorist", "Sound Designer"],
    colorGrade: {
      profile: "Sony S-Log3 to Rec.709 Cinematic",
      mood: "Warm Amber & Coffee Brown",
      note: "Footage mentah S-Log yang flat dikalibrasi dengan highlight lembut dan bayangan hijau lumut hangat untuk menghadirkan atmosfer tenang."
    },
    characterComment: "Ritme potongan dan denting cangkir kopinya benar-benar pas dengan tempo musik latar. Suasananya hangat dan menenangkan!",
    story: {
      concept: "Merangkai visual kafe tradisional berkelas modern melalui teknik slow-motion b-roll, pergerakan kamera halus, dan penekanan pada aroma uap kopi.",
      techniques: "Speed-ramping halus pada tuangan pour-over, match cut transisi sendok kopi, serta sound design multi-layer (suara biji kopi digiling, uap espresso, dan obrolan samar kafe).",
      deliverable: "Master 4K 60fps untuk YouTube, versi cutdown 30 detik untuk Instagram Reels, dan master audio stereo 24-bit 48kHz."
    }
  },
  {
    id: "creative-video-tech",
    code: "CINEMA #02",
    type: "video",
    category: "Video Editing & Motion",
    title: "Advan Workplus Exploded View · Kinetic 3D Showcase",
    tagline: "Video showcase produk berkecepatan tinggi dengan motion graphic mekanis dan sound design glitch futuristik.",
    format: "16:9 Cinematic",
    duration: "00:48",
    resolution: "4K · 60 FPS",
    accent: "#38bdf8",
    image: "img/projects/advan-exploded.jpg",
    video: "img/projects/advan-exploded.mp4",
    videoUrl: "img/projects/advan-exploded.mp4",
    software: ["After Effects", "Blender 3D", "Premiere Pro"],
    roles: ["Motion Designer", "3D Compositor", "Sound Editor"],
    colorGrade: {
      profile: "Linear ACES to Rec.709 High Contrast",
      mood: "Cyber Blue & Neon Emerald",
      note: "Pencahayaan rim-light biru dingin pada sasis aluminium laptop dipertegas dengan flare anamorphic tipis."
    },
    characterComment: "Efek animasi perakitan komponennya tajam dan presisi! Setiap serpihan sekrup dan heatsink punya bobot gerak yang pas.",
    story: {
      concept: "Visualisasi exploded-view yang membongkar laptop lapis demi lapis untuk menonjolkan arsitektur pendingin dan motherboard tipis.",
      techniques: "Kinetic typography dengan keyframe easing kurva presisi, animasi partikel debu cahaya 3D, serta integrasi HUD tech overlay.",
      deliverable: "Video promo komersial produk untuk kampanye peluncuran digital dan display toko ritel."
    }
  },
  {
    id: "creative-video-reels",
    code: "CINEMA #03",
    type: "video",
    category: "Video Editing & Motion",
    title: "Moon Water · Atmospheric Fragrance Reel",
    tagline: "Video pendek format vertikal (9:16) bertema parfum malam di bawah cahaya rembulan dengan transisi air mulus.",
    format: "9:16 Vertical Reel",
    duration: "00:30",
    resolution: "1080x1920 · 60 FPS",
    accent: "#a855f7",
    image: "img/projects/moon-water.jpg",
    video: "img/projects/lunara-moonwater.mp4",
    videoUrl: "img/projects/lunara-moonwater.mp4",
    software: ["CapCut Pro", "Premiere Pro", "DaVinci Resolve"],
    roles: ["Short-form Editor", "Colorist", "Audio Mixing"],
    colorGrade: {
      profile: "Deep Midnight Blue & Pearlescent Silver",
      mood: "Mistik & Mewah",
      note: "Grading malam hari yang bersih tanpa noise berlebih, menonjolkan bias cahaya bulan pada kaca botol parfum."
    },
    characterComment: "Pacing 30 detiknya cepat tapi tidak buru-buru, hook visual di 3 detik pertama langsung mencuri perhatian!",
    story: {
      concept: "Format vertikal untuk TikTok dan Instagram Reels dengan retensi penonton tinggi melalui hook visual cipratan air dan ritme musik lo-fi.",
      techniques: "Beat-sync cut pada ketukan drum lo-fi, efek ripple gelombang air, dan tipografi judul elegan yang mudah dibaca di layar HP.",
      deliverable: "Reel 9:16 siap posting lengkap dengan cover frame statis dan variasi teks thumbnail."
    }
  },

  // ==========================================
  // BAGIAN 2: DESAIN GRAFIS RIIL YUSUF (7 KARYA)
  // ==========================================
  {
    id: "creative-design-santri",
    code: "DESIGN #01",
    type: "design",
    category: "Graphic Design & Editorial",
    title: "Hari Santri Nasional 2026 · Santri Sehat, Indonesia Kuat",
    tagline: "Desain poster peringatan Hari Santri Nasional untuk Klinik Rumah Sehat BAZNAS Sitti Masyithah Palu bernuansa agamis dan berwibawa.",
    format: "Feed Media Sosial (4:5)",
    dimensions: "1080 x 1350 px · 300 DPI",
    accent: "#15803d",
    image: "img/creative/hari-santri-2026.jpg",
    mockupImage: "img/creative/hari-santri-2026.jpg",
    software: ["Adobe Photoshop", "Illustrator"],
    roles: ["Lead Graphic Designer", "Visual Compositor"],
    palette: ["#15803d", "#eab308", "#14532d", "#38bdf8", "#ffffff"],
    typography: ["Cinzel Decorative / Serif (Heading)", "Outfit (Body Text)"],
    characterComment: "Gradasi hijau zamrud dan kubah masjid keemasannya menghadirkan ketenangan spiritual yang dalam. Sangat selaras dengan tema kesehatan!",
    story: {
      concept: "Menggabungkan nilai religiusitas santri dengan komitmen pelayanan kesehatan klinik BAZNAS melalui simbol stetoskop pada santri dan bendera merah putih.",
      techniques: "Komposisi cahaya ilahi (divine sunburst) di balik kubah emas, penataan siluet santri berlapis dengan kedalaman kabut halus, dan tipografi judul 3D bevel timbul.",
      deliverable: "Master file PSD layer terorganisir, file JPG resolusi tinggi untuk feed Instagram & Facebook, serta materi publikasi WhatsApp blast."
    }
  },
  {
    id: "creative-design-maulid",
    code: "DESIGN #02",
    type: "design",
    category: "Graphic Design & Typography",
    title: "Maulid Nabi Muhammad SAW 1448 H · Keteladanan Sosial",
    tagline: "Poster peringatan Maulid Nabi dengan kaligrafi emas timbul, arsitektur masjid megah, dan kutipan ayat Al-Qur'an.",
    format: "Poster Feed & Story (4:5)",
    dimensions: "1080 x 1350 px · 300 DPI",
    accent: "#d97706",
    image: "img/creative/maulid-nabi-1448h.jpg",
    mockupImage: "img/creative/maulid-nabi-1448h.jpg",
    software: ["Adobe Illustrator", "Photoshop"],
    roles: ["Graphic Designer", "Arabic Typographer"],
    palette: ["#d97706", "#fbbf24", "#78350f", "#fef3c7", "#ffffff"],
    typography: ["Arabic Calligraphy (Tsuluts)", "Trajan / Serif Luxury", "Outfit"],
    characterComment: "Pendaran emas pada lafadz kaligrafi 'Muhammad' berpadu sangat mewah dengan marmer putih masjid. Tata letaknya bersih dan anggun!",
    story: {
      concept: "Menghadirkan pesan keteladanan sosial Nabi Muhammad SAW dalam wujud visual yang bersih, bercahaya, dan memancarkan kemuliaan akhlak.",
      techniques: "Tekstur daun emas melayang (floating gold foil), kaligrafi vektor beresolusi tajam, pencahayaan refleksi lantai marmer, dan border ornamen Islami simetris.",
      deliverable: "Desain siap tayang untuk Instagram Feed, Story broadcast, dan display banner monitor klinik."
    }
  },
  {
    id: "creative-design-adha",
    code: "DESIGN #03",
    type: "design",
    category: "Graphic Design & Illustration",
    title: "Selamat Hari Raya Idul Adha 1447 H · Kebaikan Berkurban",
    tagline: "Karya visual ucapan Idul Adha dengan padang rumput hijau subur, hewan kurban sehat, dan latar kemegahan masjid kubah emas.",
    format: "Feed Media Sosial (4:5)",
    dimensions: "1080 x 1350 px · 300 DPI",
    accent: "#16a34a",
    image: "img/creative/idul-adha-1447h.jpg",
    mockupImage: "img/creative/idul-adha-1447h.jpg",
    software: ["Adobe Photoshop", "Illustrator"],
    roles: ["Graphic Designer", "Digital Artist"],
    palette: ["#16a34a", "#22c55e", "#f59e0b", "#60a5fa", "#ffffff"],
    typography: ["Brush Calligraphy Script", "Baskerville", "Inter"],
    characterComment: "Pencahayaan rumput hijau dan dedaunan di depan memberikan efek kedalaman kamera (depth-of-field) yang hidup!",
    story: {
      concept: "Menggambarkan berkah dan kesegaran hari raya kurban dengan visual alam yang asri, hewan kurban yang sehat dan terawat, serta ajakan berbagi kebaikan.",
      techniques: "Manipulasi foto multi-layer (hewan kurban, rumput, dedaunan foreground berbayang blur), font script kaligrafi hijau bercahaya, dan grading langit biru cerah.",
      deliverable: "Output feed Instagram & status WhatsApp klinik, serta materi baliho ucapan hari raya."
    }
  },
  {
    id: "creative-design-fitri",
    code: "DESIGN #04",
    type: "design",
    category: "Graphic Design & Concept Art",
    title: "Selamat Hari Raya Idul Fitri 1 Syawal 1447 H",
    tagline: "Desain visual bertema pulau terapung (floating sanctuary) dengan masjid megah kubah hijau zamrud dan air terjun awan.",
    format: "Feed Media Sosial (4:5)",
    dimensions: "1080 x 1350 px · 300 DPI",
    accent: "#059669",
    image: "img/creative/idul-fitri-1447h.jpg",
    mockupImage: "img/creative/idul-fitri-1447h.jpg",
    software: ["Adobe Photoshop", "Illustrator"],
    roles: ["Concept Artist", "Graphic Designer"],
    palette: ["#059669", "#34d399", "#f59e0b", "#38bdf8", "#ffffff"],
    typography: ["Modern Arabic-Latin Display", "Homemade Apple / Handwriting", "Outfit"],
    characterComment: "Konsep pulau terapung dengan air terjun di atas awan ini sangat imajinatif dan bernuansa khayangan yang damai!",
    story: {
      concept: "Visualisasi kesucian hati setelah sebulan berpuasa Ramadhan diibaratkan surga terapung di atas awan yang sejuk dan menentramkan.",
      techniques: "Matte painting pulau batu karang, efek partikel tetesan air terjun, tipografi Idul Fitri dengan guratan gradasi hijau lumut berpendar kilau bintang.",
      deliverable: "Materi kampanye media sosial BAZNAS Palu untuk menyambut momen kemenangan Idul Fitri."
    }
  },
  {
    id: "creative-design-hutri",
    code: "DESIGN #05",
    type: "design",
    category: "Graphic Design & National Poster",
    title: "Dirgahayu Republik Indonesia Ke-80 · Bersatu Berdaulat",
    tagline: "Poster peringatan HUT Kemerdekaan RI ke-80 beresolusi ultra-tinggi (5000x6250) dengan Garuda Merah Putih megah dan pita dinamis.",
    format: "Poster Cetak Ultra-HD & Baliho",
    dimensions: "5000 x 6250 px · 300 DPI (Ultra-HD)",
    accent: "#dc2626",
    image: "img/creative/hut-ri-80.jpg",
    mockupImage: "img/creative/hut-ri-80.jpg",
    software: ["Adobe Illustrator", "Photoshop"],
    roles: ["Poster Designer", "Vector Artist"],
    palette: ["#dc2626", "#991b1b", "#eab308", "#94a3b8", "#ffffff"],
    typography: ["Montserrat Black (Bold Display)", "Brush Script (Dirgahayu)", "Inter"],
    characterComment: "Gagah sekali! Siluet Garuda merah di atas kepulauan Indonesia dan lekukan pita merah putihnya memberi energi kemerdekaan yang membara.",
    story: {
      concept: "Menyalakan semangat nasionalisme 80 tahun kemerdekaan Republik Indonesia dengan komposisi vertikal yang kokoh dan pergerakan pita yang dinamis.",
      techniques: "Vektorisasi siluet Garuda Pancasila, pembuatan tekstur pita merah putih 3D dengan shading bayangan tajam, dan siluet Monas serta gedung kota di bagian kaki poster.",
      deliverable: "File master siap cetak baliho ukuran besar (hingga 4x6 meter tanpa pecah) dan format digital media sosial."
    }
  },
  {
    id: "creative-design-gigi",
    code: "DESIGN #06",
    type: "design",
    category: "Healthcare Campaign & Poster",
    title: "Layanan Poli Gigi & Scaling Gratis · Klinik BAZNAS Palu",
    tagline: "Poster edukasi dan promosi layanan poli gigi gratis untuk pasien member dan BPJS dengan maskot gigi 3D yang ramah.",
    format: "Poster Edukasi & Banner Display",
    dimensions: "2160 x 2700 px · 300 DPI",
    accent: "#16a34a",
    image: "img/creative/poster-scaling-gigi.jpg",
    mockupImage: "img/creative/poster-scaling-gigi.jpg",
    software: ["Adobe Illustrator", "Photoshop"],
    roles: ["Healthcare Graphic Designer", "UI Information Designer"],
    palette: ["#16a34a", "#4ade80", "#047857", "#64748b", "#ffffff"],
    typography: ["Poppins ExtraBold (Heading)", "Open Sans (Info Cards)"],
    characterComment: "Maskot giginya lucu dan ramah! Tata letak jadwal dan syarat pasiennya sangat mudah dibaca orang awam dalam sekali lirik.",
    story: {
      concept: "Menghilangkan stigma menakutkan tentang dokter gigi dengan menghadirkan maskot gigi lucu bercelemek cermin dokter dan informasi layanan yang transparan.",
      techniques: "Struktur informasi hierarki dua kolom (kategori pasien vs layanan poli gigi), rendering 3D maskot gigi berkilau, dan card UI rounded dengan drop-shadow lembut.",
      deliverable: "Poster cetak dinding ruang tunggu klinik A2, x-banner display poli gigi, serta poster promosi digital."
    }
  },
  {
    id: "creative-design-rokok",
    code: "DESIGN #07",
    type: "design",
    category: "Medical Infographic & Poster",
    title: "Ayo Berhenti Merokok! · Kenali Bahaya & Lawan Kebiasaan",
    tagline: "Poster infografis edukasi kesehatan publik berskala cetak A3 (3508x4961) yang merangkum bahaya rokok dan alternatif aktivitas positif.",
    format: "Poster Infografis Cetak A3",
    dimensions: "3508 x 4961 px · 300 DPI (A3 Print)",
    accent: "#ef4444",
    image: "img/creative/poster-bahaya-merokok.jpg",
    mockupImage: "img/creative/poster-bahaya-merokok.jpg",
    software: ["Adobe Illustrator", "Photoshop"],
    roles: ["Infographic Specialist", "Visual Communicator"],
    palette: ["#ef4444", "#15803d", "#facc15", "#0d9488", "#f7fee7"],
    typography: ["Bebas Neue / Heavy Sans", "Ubuntu Bold", "Outfit"],
    characterComment: "Infografis yang sangat komprehensif! Diagram lingkaran bahaya organ di atas dan pilihan aktivitas positif di bawahnya tersusun sangat logis.",
    story: {
      concept: "Membantu masyarakat memahami dampak nyata merokok pada 6 organ tubuh vital, sekaligus memberikan solusi konkret pengganti kebiasaan merokok.",
      techniques: "Diagram visual simetris dengan ikon anatomi organ manusia (otak, paru, laring, tulang), semiotika rambu larangan rokok, serta ilustrasi flat aktivitas sehat.",
      deliverable: "File cetak poster A3 resolusi tinggi untuk puskesmas, klinik, dan sekolah, serta infografis carousel media sosial."
    }
  }
];
