/**
 * Ofuda Guestbook Interactive System (Bab 5: Surat Kontak & Ofuda)
 * Menyimpan catatan pengunjung di dinding kuil dengan kartu mantra bernuansa Jepang,
 * Cap Segel Hanko Tradisional (Inkan), dan Lonceng Kuil Suzu Bell.
 */

import { soundEngine } from './audio.js';

const STAMP_MAP = {
  kagum: { kanji: "感服", label: "🌸 Kagum", color: "#ef4444" },
  inspirasi: { kanji: "発想", label: "💡 Inspirasi", color: "#f59e0b" },
  kopi: { kanji: "珈琲", label: "☕ Ngopi", color: "#10b981" },
  kolaborasi: { kanji: "協業", label: "🚀 Kolaborasi", color: "#8b5cf6" },
  berkah: { kanji: "祈願", label: "⛩️ Berkah", color: "#ec4899" }
};

const INITIAL_OFUDA = [
  {
    name: "Pengelana Senja",
    message: "Matanya benar-benar menatap kursor... luar biasa detailnya!",
    stamp: "kagum",
    date: "23 Okt",
    rot: -2
  },
  {
    name: "Kuro",
    message: "Suasana hujan dan lo-fi radio-nya sangat menenangkan untuk coding.",
    stamp: "kopi",
    date: "22 Okt",
    rot: 1.5
  },
  {
    name: "Aira",
    message: "Konsep visual novel dan rahasia vibe-nya unik sekali untuk portofolio developer.",
    stamp: "inspirasi",
    date: "21 Okt",
    rot: -1
  }
];

export function initOfudaGuestbook() {
  const wallContainer = document.getElementById('ofuda-wall-notes');
  const form = document.getElementById('ofuda-submit-form');
  const nameInput = document.getElementById('ofuda-name-input');
  const msgInput = document.getElementById('ofuda-msg-input');
  const suzuBellBtn = document.getElementById('btn-suzu-bell');
  const stampChips = document.querySelectorAll('.hanko-chip');

  let activeStampKey = 'kagum';

  let notes = [];
  try {
    const saved = localStorage.getItem('amine_ofuda_notes');
    notes = saved ? JSON.parse(saved) : INITIAL_OFUDA;
  } catch (e) {
    notes = INITIAL_OFUDA;
  }

  function renderOfudaWall() {
    if (!wallContainer) return;
    wallContainer.innerHTML = notes.map((item) => {
      const stampMeta = STAMP_MAP[item.stamp] || STAMP_MAP.kagum;
      return `
        <div class="ofuda-paper-card" style="transform: rotate(${item.rot || 0}deg);">
          <div class="ofuda-hanko-seal" title="Cap Segel: ${stampMeta.label}">
            <span class="hanko-border"></span>
            <span class="hanko-kanji">${stampMeta.kanji}</span>
          </div>
          <div class="ofuda-author">奉納: ${escapeHtml(item.name)}</div>
          <p class="ofuda-body">"${escapeHtml(item.message)}"</p>
          <div class="ofuda-footer-row">
            <span class="ofuda-badge-pill">${stampMeta.label.split(' ')[0]}</span>
            <span class="ofuda-date">${item.date || 'Hari ini'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Bind Hanko Stamp Selector
  stampChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      stampChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeStampKey = chip.dataset.stamp || 'kagum';
      soundEngine.playClickSound();
    });
  });

  // Bind Suzu Bell Interactive Rope
  if (suzuBellBtn) {
    suzuBellBtn.addEventListener('click', () => {
      soundEngine.playSuzuBellSound();
      suzuBellBtn.classList.remove('swinging');
      void suzuBellBtn.offsetWidth; // trigger reflow
      suzuBellBtn.classList.add('swinging');

      const toast = document.getElementById('mood-toast');
      if (toast) {
        toast.textContent = "🔔 Denting lonceng kuil berbunyi... Doa baik menyertai harimu!";
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    });
  }

  renderOfudaWall();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const msg = msgInput.value.trim();
      if (!name || !msg) return;

      const randomRot = (Math.random() * 4 - 2).toFixed(1);
      const newOfuda = {
        name,
        message: msg,
        stamp: activeStampKey,
        date: "Hari ini",
        rot: parseFloat(randomRot)
      };

      notes.unshift(newOfuda);
      if (notes.length > 12) notes.pop();

      try {
        localStorage.setItem('amine_ofuda_notes', JSON.stringify(notes));
        // Simpan nama pengunjung untuk Boarding Pass di Epilog!
        localStorage.setItem('vibe_visitor_name', name);
      } catch (err) {}

      soundEngine.playHankoStampSound();
      renderOfudaWall();

      nameInput.value = '';
      msgInput.value = '';

      // Tampilkan konfirmasi cap stempel
      const toast = document.getElementById('mood-toast');
      if (toast) {
        const stampLabel = STAMP_MAP[activeStampKey]?.label || "🌸 Kagum";
        toast.textContent = `Ofuda berstempel [${stampLabel}] tertempel di dinding kuil ⛩️`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    });
  }
}
