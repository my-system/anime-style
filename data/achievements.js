/**
 * Achievements System (Bab 9: Achievement & Easter Egg)
 * Disimpan di localStorage dengan fallback memory
 */

export const achievementsList = [
  {
    id: "welcome",
    title: "Salam Pertama",
    desc: "Melangkah masuk melewati gerbang pembuka.",
    hint: "Buka pintu gerbang utama untuk memulai perjalanan.",
    icon: "⛩️"
  },
  {
    id: "explorer",
    title: "Penjelajah",
    desc: "Menelusuri dan membaca semua bab dalam perjalanan.",
    hint: "Gulir hingga mencapai bab Epilog paling akhir.",
    icon: "🗺️"
  },
  {
    id: "pester",
    title: "Si Iseng",
    desc: "Mengklik Hyouka sebanyak 10 kali.",
    hint: "Coba sentuh atau klik wajah Hyouka berulang kali...",
    icon: "👆"
  },
  {
    id: "mood_changer",
    title: "Penjelajah Suasana",
    desc: "Mencoba ketiga mode suasana: Terang, Malam, dan Hujan.",
    hint: "Sentuh avatar mata di pojok kiri bawah hingga mencoba seluruh suasana.",
    icon: "🌓"
  },
  {
    id: "emoji_fan",
    title: "Pendengar Setia",
    desc: "Mengirimkan 5 apresiasi emoji.",
    hint: "Beri sedikitnya 5 reaksi emoji pada widget sapaan.",
    icon: "❤️"
  },
  {
    id: "night_owl",
    title: "Begadang",
    desc: "Berkunjung di larut malam antara pukul 00.00 dan 04.00.",
    hint: "Kunjungi halaman ini di saat orang lain sudah terlelap tidur.",
    icon: "🦉"
  },
  {
    id: "mission_tracker",
    title: "Pelacak Misi",
    desc: "Membuka seluruh berkas rahasia proyek.",
    hint: "Buka dan baca semua kartu proyek di Bab 3.",
    icon: "📜"
  },
  {
    id: "eye_contact",
    title: "Tatapan Beradu",
    desc: "Mendiamkan kursor tepat di mata Hyouka selama 5 detik.",
    hint: "Tatap matanya tanpa bergerak selama beberapa detik...",
    icon: "👁️"
  },
  {
    id: "secret_found",
    title: "Rahasia Terkuak",
    desc: "Menemukan kode rahasia legendaris Konami.",
    hint: "Ketik kode arkade klasik: ↑ ↑ ↓ ↓ ← → ← → B A",
    icon: "✨"
  },
  {
    id: "coffee_lover",
    title: "Pecinta Kopi",
    desc: "Menikmati secangkir kopi hangat di samping meja Yusuf.",
    hint: "Cari cangkir kopi yang mengepul di meja dekat Yusuf...",
    icon: "☕"
  },
  {
    id: "rain_wiper",
    title: "Menyeka Jendela",
    desc: "Mengusap embun hujan di jendela untuk menatap lebih jelas.",
    hint: "Beralih ke Suasana Hujan, lalu usap kabut embun di layar...",
    icon: "🌧️"
  }
];
