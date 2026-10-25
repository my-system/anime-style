/**
 * Emoji Widget System (Bab 7 Cetak Biru)
 * - Pilihan: ❤️ 😂 🔥 😮 👏
 * - Anti-spam: maksimal 5 klik per 10 detik per pengunjung
 * - Penyimpanan hitungan di localStorage dengan format ribuan (mis. 1.284)
 */

import { emojiReactions } from '../data/dialogs.js';
import { triggerAchievement } from './achievements.js';
import { soundEngine } from './audio.js';
import { setCharacterExpression } from './eyes.js';

const DEFAULT_COUNTS = {
  "❤️": 1284,
  "😂": 412,
  "🔥": 896,
  "😮": 238,
  "👏": 645
};

export function initEmojiWidget(dialogPlayer) {
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  const characterWrap = document.querySelector('.character-wrap');
  let sessionClicks = 0;
  let clickTimestamps = [];

  let counts = { ...DEFAULT_COUNTS };
  try {
    const saved = localStorage.getItem('amine_emoji_counts');
    if (saved) counts = { ...counts, ...JSON.parse(saved) };
  } catch (e) {}

  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  emojiButtons.forEach((btn) => {
    const emojiChar = btn.dataset.emoji;
    const countEl = btn.querySelector('.emoji-count');
    if (countEl && counts[emojiChar] !== undefined) {
      countEl.textContent = formatNumber(counts[emojiChar]);
    }

    btn.addEventListener('click', (e) => {
      const now = Date.now();
      clickTimestamps = clickTimestamps.filter((t) => now - t < 10000);

      // Anti-spam: maksimal 5 klik per 10 detik
      if (clickTimestamps.length >= 5) {
        if (dialogPlayer) {
          dialogPlayer.typeText("Pelan-pelan... jarimu cepat sekali (maksimal 5 emoji tiap 10 detik).");
        }
        return;
      }
      clickTimestamps.push(now);

      counts[emojiChar] = (counts[emojiChar] || 100) + 1;
      if (countEl) {
        countEl.textContent = formatNumber(counts[emojiChar]);
      }

      try {
        localStorage.setItem('amine_emoji_counts', JSON.stringify(counts));
      } catch (err) {}

      sessionClicks++;
      soundEngine.playClickSound();

      createFloatingEmoji(emojiChar, e.clientX, e.clientY);

      const reaction = emojiReactions[emojiChar];
      if (reaction) {
        setCharacterExpression(reaction.expression || 'base', 2600);
        if (reaction.zoom && characterWrap) {
          characterWrap.classList.add('clicked-pulse');
          setTimeout(() => characterWrap.classList.remove('clicked-pulse'), 280);
        }
        if (dialogPlayer) {
          dialogPlayer.typeText(reaction.text);
        }
      }

      if (sessionClicks >= 5) {
        triggerAchievement('emoji_fan');
      }
    });
  });

  function createFloatingEmoji(char, x, y) {
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = char;
    const rx = Math.random() * 26 - 13;
    el.style.left = `${x - 14 + rx}px`;
    el.style.top = `${y - 16}px`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1500);
  }
}
