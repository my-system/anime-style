/**
 * Dialog Data & Naskah Visual Novel
 * Sesuai Cetak Biru Portofolio Hyouka (Versi 2)
 */

export const timeGreetings = [
  { start: 5, end: 11, text: "Ohayou! Pagi yang cerah, ya.", period: "Pagi" },
  { start: 11, end: 15, text: "Konnichiwa. Sudah makan siang?", period: "Siang" },
  { start: 15, end: 18, text: "Sore... sebentar lagi senja.", period: "Sore" },
  { start: 18, end: 23, text: "Konbanwa. Selamat datang.", period: "Malam" },
  { start: 23, end: 5, text: "Belum tidur juga? ...Sama, sih.", period: "Larut Malam" }
];

export const whoAmIDialogues = [
  {
    speaker: "Yusuf",
    text: "Aku Yusuf, seorang Web & Frontend Developer yang merancang antarmuka web tenang namun berkesan.",
    expression: "base"
  },
  {
    speaker: "Yusuf",
    text: "Titik balikku dimulai saat menyadari bahwa baris kode di balik layar bisa dirangkai menjadi ruang cerita yang hidup dan bernyawa.",
    expression: "base"
  },
  {
    speaker: "Yusuf",
    text: "Bagiku, karya terbaik tidak perlu berteriak—cukup presisi di setiap detail, cepat diakses, dan meninggalkan kesan sejak tatapan pertama.",
    expression: "surprised"
  },
  {
    speaker: "Yusuf",
    text: "Di luar jam menulis kode, aku biasanya menyeduh teh hijau hangat, mendengarkan alunan piano saat hujan, atau mengamati ilustrasi.",
    expression: "smile"
  }
];

export const whoAmIExtraDialogues = [
  {
    speaker: "Yusuf",
    text: "Oh, kamu masih ingin mendengar lebih banyak? Jarang ada pengunjung yang sesabar ini.",
    expression: "surprised"
  },
  {
    speaker: "Yusuf",
    text: "Aku percaya setiap produk digital punya ritme. Kalau terlalu ramai, pengunjung lelah; kalau terlalu kosong, terasa dingin. Menemukan titik tengah itulah bagian favoritku.",
    expression: "smile"
  },
  {
    speaker: "Yusuf",
    text: "Sekarang, bagaimana kalau kutunjukkan jurus dan peralatan yang biasa kugunakan?",
    expression: "base"
  }
];

export const clickReactions = [
  { text: "E-eh?! Kaget tahu! Tiba-tiba mencolek...", expression: "surprised", icon: "⚡" },
  { text: "Hehe, geli tahu. Mau kuajak ngobrol tentang kode atau anime?", expression: "smile", icon: "✨" },
  { text: "*tersipu* Jangan usil begitu dong... ada tombol proyek di sebelah tuh!", expression: "surprised", icon: "💖" },
  { text: "*menatap lekat* Kamu sengaja mengujiku ya? Fokus ke portofolio dong.", expression: "base", icon: "👀" },
  { text: "*menguap kecil* Jam segini hawanya santai banget... mau rehat sebentar?", expression: "sleepy", icon: "☕" },
  { text: "Wah, perhatian sekali! Senang kamu mampir ke duniaku.", expression: "smile", icon: "🌸" }
];

export const specialClickReactions = {
  fifth: { text: "*mundur sedikit* Jangan terlalu dekat... aku pemalu.", expression: "surprised" },
  tenth: { text: "...Kamu sengaja ya! Dasar iseng, tapi terima kasih sudah menemani.", expression: "smile" }
};

export const coffeeDialogues = [
  { text: "Kopi hangat di hari seperti ini memang yang terbaik. Wanginya menenangkan, kan? ☕", expression: "smile" },
  { text: "*menghirup aroma kopi* Slurp... ah, kafein membuat logika kodingku makin tajam! ☕✨", expression: "smile" },
  { text: "Mau secangkir juga? Nanti kubuatkan kopi latte dengan seni busa daun. ☕🌿", expression: "smile" }
];

export const rainWipeDialogues = [
  { text: "Oh, jendelanya berembun ya? Makasih sudah membersihkannya, sekarang aku bisa menatapmu lebih jelas. 🌧️✨", expression: "smile" },
  { text: "Suara rintik hujan di luar menenangkan sekali saat kita memandang dari balik kaca hangat. 🌧️💙", expression: "base" }
];

export const idleDialogues = {
  short: { text: "Masih di sana...?", expression: "sleepy" },
  long: { text: "z z z", expression: "blink" },
  wakeUp: { text: "A-aku tidak tidur kok!", expression: "surprised" }
};

export const moodComments = {
  light: "Ganti suasana! Kembali ke ruang terang yang tenang.",
  night: "Ganti suasana! Malam yang sunyi, cocok untuk fokus.",
  rain: "Ganti suasana! Rintik hujan dan piano selalu menenangkan."
};

export const emojiReactions = {
  "❤️": { text: "A-apa sih... makasih.", expression: "smile" },
  "😂": { text: "Ada yang lucu ya?", expression: "base" },
  "🔥": { text: "Semangat banget!", expression: "surprised", zoom: true },
  "😮": { text: "Tunggu, aku juga kaget!", expression: "surprised" },
  "👏": { text: "Terima kasih, terima kasih.", expression: "smile" }
};

export const easterEggDialogues = {
  konami: "Kamu tahu kode rahasia itu juga? ...Jangan bilang siapa-siapa ya.",
  stare: "...Kita sudah saling menatap selama 5 detik penuh. Kamu menang.",
  secretButton: "Kamu menemukan catatan tersembunyi di sudut ruangan: 'Terima kasih sudah memperhatikan hal-hal kecil.'"
};
