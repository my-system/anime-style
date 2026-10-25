# Portofolio Interaktif Hyouka (Versi 2) ⛩️

Portofolio kreatif berbasis konsep **Visual Novel**, tatapan mata reaktif (*eye tracking* kursor), efek kuas kaligrafi tinta, dan sistem status RPG, mengacu pada **Cetak Biru Portofolio Hyouka**.

---

## 🌟 Fitur Utama yang Telah Diimplementasikan

1. **Scene 0: Gerbang Pembuka (Loading & Izin Audio)**
   - Animasi lingkaran tinta berputar dengan persentase muatan.
   - Pilihan: `[Masuk dengan Suara 🔊]` dan `[Masuk tanpa Suara 🔇]` untuk memenuhi browser *autoplay policy*.

2. **Scene 1: Prolog ("Hi! I'm Hyouka")**
   - Tipografi tulisan tangan dinamis (*Caveat & Outfit*).
   - Tatapan mata karakter mengikuti pergerakan kursor mouse pengunjung secara halus menggunakan SVG `clip-path` overlay.
   - Gelembung dialog gaya visual novel dengan efek ketikan mesin tik dan sapaan waktu otomatis (Pagi, Siang, Sore, Malam, Larut Malam).
   - Widget emoji interaktif (`❤️ 😂 🔥 😮 👏`) dengan efek partikel melayang dan reaksi karakter.

3. **Scene 2: Bab 1 (Who I Am)**
   - Zoom kamera ke area mata dan alis (130%).
   - Alur dialog interaktif visual novel dengan pilihan respon: *"Lanjutkan Cerita"* atau *"Lihat Jurus & Status RPG"*.

4. **Scene 3: Bab 2 (Jurus / Skills)**
   - Kartu status RPG: Kelas *Frontend Alchemist*, Level, dan bar status dinamis (*HP Kafein, MP Kreativitas, Stamina Fokus*).
   - 3 kelompok senjata: **Senjata Utama (Core)**, **Senjata Cadangan (Frameworks & Tools)**, dan **Jurus Rahasia (Eksplorasi Aktif)**.

5. **Scene 4: Bab 3 (Misi / Projects)**
   - Kartu proyek dengan stempel hijau *"Misi Selesai"*.
   - Modal berkas misi rahasia: Misinya, Perlengkapan, Rintangan, Hadiah/Hasil, dan komentar khusus Hyouka.

6. **Scene 5: Bab 4 (Jejak / Timeline)**
   - Garis jalan setapak vertikal dengan simpul bercahaya hijau untuk riwayat karier dan eksplorasi.

7. **Scene 6: Bab 5 (Surat / Contact)**
   - Formulir kontak berbentuk surat, tautan media sosial, tombol unduh CV, dan papan buku tamu *Ofuda* Jepang.

8. **Scene 7: Epilog (Sampai Jumpa)**
   - Penutup hangat, ucapan terima kasih, dan hak cipta.

9. **Sistem Karakter & Interaksi Unik:**
   - **Kedipan Acak:** Berkedip otomatis tiap 3.5 - 6 detik.
   - **Reaksi Klik Wajah:** Klik Hyouka untuk memicu reaksi dialog acak. Klik ke-10 membuka achievement rahasia.
   - **Status Idle:** Diam 10 detik memicu Hyouka mengantuk; 30 detik memicu Hyouka tertidur (*z z z*).
   - **Easter Egg Tatapan Beradu:** Dekatkan kursor di mata Hyouka selama 5 detik untuk membuka achievement.
   - **Konami Code (↑↑↓↓←→←→BA):** Membuka dialog rahasia.

10. **Tiga Suasana (Mood Switcher):**
    - Klik avatar mata bulat di kiri bawah untuk berganti mode:
      - **Terang (Default):** Bersih, putih lembut, aksen hijau mata (`#22c55e`).
      - **Malam:** Gelap bernuansa hijau-hitam dengan lingkar cahaya mata menyala (*emerald glow*).
      - **Hujan:** Latar abu kebiruan dengan kanvas rintik air hujan bergerak.

11. **Efek Kursor Jejak Tinta:**
    - Goresan kuas kaligrafi responsif terhadap kecepatan gerak mouse dengan percikan tinta hijau saat diklik. Dapat dinyalakan/dimatikan melalui tombol *Tinta: ON/OFF*.

12. **Audio Engine Prosedural (Web Audio API):**
    - Sintesis audio lembut (nada piano/chimes ambient, klik mesin tik, jingle pencapaian) tanpa ketergantungan file eksternal besar.

13. **Mode Ringkas (Recruiter View):**
    - Tombol di pojok kanan atas untuk beralih antara alur cerita (*Story Scroll*) dan halaman ringkasan bersih satu layar (*Compact Mode*).

14. **Tool Kalibrasi Mata (Ctrl + Shift + C):**
    - Tekan kombinasi tombol `Ctrl + Shift + C` di browser untuk membuka slider kalibrasi koordinat `cx, cy, rx, ry` bukaan mata secara langsung (*live*).

---

## 🚀 Cara Menjalankan Portofolio

Pastikan Anda berada di direktori proyek:
```bash
cd "d:\VIBE CODING\PORTFOLIO"
```

Jalankan server lokal (Node.js tanpa perlu install dependency tambahan):
```bash
npm start
# atau
node server.js
```

Buka peramban Anda di:
👉 **`http://localhost:3000`**

---

## 📁 Struktur Berkas Proyek

```
PORTFOLIO/
├── index.html                 # Struktur semantik utama dokumen
├── server.js                  # Server lokal zero-dependency
├── package.json               # Konfigurasi proyek & scripts
├── README.md                  # Dokumentasi panduan
├── css/
│   ├── base.css               # Reset, tipografi, variabel, navigasi
│   ├── themes.css             # Tema Terang, Malam, Hujan & filter
│   └── scenes.css             # Tampilan tiap bab & mode ringkas
├── js/
│   ├── main.js                # Orkestrasi alur aplikasi & scene scroll
│   ├── character.js           # Mesin perilaku karakter & reaksi interaktif
│   ├── eyes.js                # Eye tracking kursor & kedipan acak
│   ├── dialog.js              # Efek ketikan mesin tik visual novel
│   ├── audio.js               # Sintesis suara Web Audio API
│   ├── ink.js                 # Kanvas jejak tinta kaligrafi
│   ├── emoji.js               # Widget emoji & partikel apresiasi
│   ├── rain.js                # Kanvas animasi rintik hujan
│   └── achievements.js        # Sistem 9 pencapaian & toast
├── data/
│   ├── config.js              # Konfigurasi profil, nama, & koordinat
│   ├── dialogs.js             # Naskah visual novel, sapaan waktu, & reaksi
│   ├── skills.js              # Daftar skill RPG (3 kelompok senjata)
│   ├── projects.js            # Lembar misi portofolio & rintangan
│   └── timeline.js            # Garis waktu karier & jejak perjalanan
└── img/
    ├── hyouka/
    │   ├── hyouka-original.jpg # Gambar asli dasar
    │   ├── hyouka-clean.png    # Gambar bersih tanpa tulisan "I scream"
    │   └── hyouka-master.png   # Versi resolusi tinggi 2048px
    └── ui/
        └── avatar-eye.png     # Avatar potongan mata untuk tombol suasana
```

---

## ✏️ Cara Mengubah Data & Menyesuaikan dengan Profil Anda

Semua data dipisahkan secara rapi di folder `data/` sehingga Anda tidak perlu menyentuh kode logika:
- **Mengubah Nama, Gelar, Kontak, & Tautan CV:** Edit [data/config.js](file:///d:/VIBE%20CODING/PORTFOLIO/data/config.js)
- **Mengubah Cerita & Dialog:** Edit [data/dialogs.js](file:///d:/VIBE%20CODING/PORTFOLIO/data/dialogs.js)
- **Menambah / Mengubah Skill:** Edit [data/skills.js](file:///d:/VIBE%20CODING/PORTFOLIO/data/skills.js)
- **Menambah Proyek Portofolio Anda:** Edit [data/projects.js](file:///d:/VIBE%20CODING/PORTFOLIO/data/projects.js)
- **Menyesuaikan Riwayat Pengalaman:** Edit [data/timeline.js](file:///d:/VIBE%20CODING/PORTFOLIO/data/timeline.js)

---

## 🚀 Cara Menjalankan Secara Lokal

Portofolio ini murni berbasis web statis standar (*Vanilla JavaScript & CSS3*), tanpa dependensi eksternal yang rumit:

```bash
# Jalankan server lokal bawaan Node.js:
node scripts/dev-server.js

# Atau menggunakan ekstensi VS Code "Live Server", atau python:
python -m http.server 3000
```
Buka browser di `http://localhost:3000` (atau port yang tertera).

---

## 🌐 Deployment (Vercel / GitHub Pages / Netlify)

Proyek ini telah dikonfigurasi untuk zero-config static hosting di Vercel, Netlify, atau GitHub Pages:
- Cukup hubungkan repositori ini ke Vercel atau GitHub Pages.
- Vercel akan otomatis menyajikan seluruh aset statis (`index.html`, `/css`, `/js`, `/img`) melalui CDN global berkecepatan tinggi tanpa memerlukan build step.
