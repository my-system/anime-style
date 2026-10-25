/**
 * Character Interactive Behavior & State Machine (Bab 5.3 Cetak Biru)
 * - Reaksi klik tanpa pengulangan berturut-turut
 * - Klik ke-5: Wajah mundur sedikit + "Jangan terlalu dekat."
 * - Klik ke-10: "...Kamu sengaja ya." + Achievement Si Iseng
 * - Idle 10s: sleepy + "Masih di sana...?"
 * - Idle 30s: mata terpejam + "z z z"
 * - Kembali aktif: surprised + "A-aku tidak tidur kok!"
 */

import { clickReactions, specialClickReactions, idleDialogues, coffeeDialogues } from '../data/dialogs.js';
import { triggerAchievement } from './achievements.js';
import { soundEngine } from './audio.js';
import { setCharacterExpression } from './eyes.js';

export function initCharacterBehavior(dialogPlayer) {
  const clickArea = document.querySelector('.character-click-area');
  const characterWrap = document.querySelector('.character-wrap');
  const zzzBadge = document.getElementById('character-zzz-floating');
  const touchEffects = document.getElementById('character-touch-effects');
  const coffeeCup = document.getElementById('interactive-desk-cup');

  let clickCount = 0;
  let lastReactionIndex = -1;
  let idleTimer10s = null;
  let idleTimer30s = null;
  let isIdleShort = false;
  let isSleeping = false;

  // Fungsi membuat partikel reaksi visual mengambang di titik sentuhan
  function spawnTouchEmote(clientX, clientY, icon = '✨') {
    if (!characterWrap) return;
    const rect = characterWrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const el = document.createElement('span');
    el.className = 'touch-reaction-pop';
    el.textContent = icon;
    el.style.left = `${Math.max(20, Math.min(rect.width - 20, x))}px`;
    el.style.top = `${Math.max(20, Math.min(rect.height - 20, y))}px`;

    const container = touchEffects || characterWrap;
    container.appendChild(el);

    setTimeout(() => {
      try { el.remove(); } catch (e) {}
    }, 950);
  }

  // Interaksi Cangkir Kopi Hangat di Meja
  if (coffeeCup) {
    coffeeCup.addEventListener('click', (e) => {
      e.stopPropagation();
      resetIdleTimers(false);
      soundEngine.playClickSound();

      // Animasi getar cangkir
      coffeeCup.style.transform = 'translateY(2px) scale(0.92)';
      setTimeout(() => {
        coffeeCup.style.transform = '';
      }, 200);

      // Partikel uap hati kopi
      spawnTouchEmote(e.clientX, e.clientY - 25, '☕');
      setTimeout(() => spawnTouchEmote(e.clientX + 10, e.clientY - 40, '✨'), 120);

      // Buka pencapaian Pecinta Kopi
      triggerAchievement('coffee_lover');

      // Reaksi senyum hangat Yusuf
      setCharacterExpression('smile', 3400);

      // Pilih dialog kopi acak
      const randomCoffee = coffeeDialogues[Math.floor(Math.random() * coffeeDialogues.length)];
      if (dialogPlayer) {
        dialogPlayer.typeText(randomCoffee.text);
      }

      // Tambah counter emoji kopi di widget reaksi
      const coffeeBtn = document.querySelector('.emoji-btn[data-emoji="☕"] .emoji-count');
      if (coffeeBtn) {
        const curCount = parseInt(coffeeBtn.textContent.replace(/\./g, ''), 10) || 412;
        coffeeBtn.textContent = (curCount + 1).toLocaleString('id-ID');
      }
    });
  }

  if (clickArea) {
    clickArea.addEventListener('click', (e) => {
      e.stopPropagation();
      resetIdleTimers(false);
      clickCount++;
      soundEngine.playClickSound();

      // Animasi hentakan halus pada karakter (recoil)
      if (characterWrap) {
        characterWrap.classList.remove('poke-recoil');
        void characterWrap.offsetWidth; // trigger reflow
        characterWrap.classList.add('poke-recoil');
      }

      // Klik ke-5: Mundur sedikit + "Jangan terlalu dekat."
      if (clickCount === 5) {
        spawnTouchEmote(e.clientX, e.clientY, '💦');
        if (characterWrap) {
          characterWrap.classList.add('step-back');
          setTimeout(() => characterWrap.classList.remove('step-back'), 1400);
        }
        setCharacterExpression(specialClickReactions.fifth.expression, 2800);
        if (dialogPlayer) dialogPlayer.typeText(specialClickReactions.fifth.text);
        return;
      }

      // Klik ke-10: "...Kamu sengaja ya." + Buka Achievement
      if (clickCount === 10) {
        spawnTouchEmote(e.clientX, e.clientY, '💖');
        triggerAchievement('pester');
        setCharacterExpression(specialClickReactions.tenth.expression, 3500);
        if (dialogPlayer) dialogPlayer.typeText(specialClickReactions.tenth.text);
        return;
      }

      // Pilih reaksi acak tanpa pengulangan berturut-turut
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * clickReactions.length);
      } while (nextIndex === lastReactionIndex && clickReactions.length > 1);

      lastReactionIndex = nextIndex;
      const reaction = clickReactions[nextIndex];

      // Tampilkan partikel ikon sesuai ekspresi
      spawnTouchEmote(e.clientX, e.clientY, reaction.icon || '✨');

      setCharacterExpression(reaction.expression, 2800);
      if (dialogPlayer) {
        dialogPlayer.typeText(reaction.text);
      }
    });
  }

  function resetIdleTimers(triggerWakeUp = true) {
    if (idleTimer10s) clearTimeout(idleTimer10s);
    if (idleTimer30s) clearTimeout(idleTimer30s);

    if (zzzBadge) zzzBadge.classList.remove('active');

    if ((isSleeping || isIdleShort) && triggerWakeUp) {
      const wasAsleep = isSleeping;
      isSleeping = false;
      isIdleShort = false;

      if (wasAsleep) {
        setCharacterExpression(idleDialogues.wakeUp.expression, 2600);
        if (dialogPlayer) {
          dialogPlayer.typeText(idleDialogues.wakeUp.text);
        }
      } else {
        setCharacterExpression('base');
      }
    } else {
      isSleeping = false;
      isIdleShort = false;
    }

    // Idle 10 detik: sleepy + "Masih di sana...?"
    idleTimer10s = setTimeout(() => {
      isIdleShort = true;
      setCharacterExpression(idleDialogues.short.expression);
      if (dialogPlayer) {
        dialogPlayer.typeText(idleDialogues.short.text);
      }
    }, 10000);

    // Idle 30 detik: mata terpejam + "z z z"
    idleTimer30s = setTimeout(() => {
      isSleeping = true;
      setCharacterExpression(idleDialogues.long.expression);
      if (zzzBadge) zzzBadge.classList.add('active');
      if (dialogPlayer) {
        dialogPlayer.typeText(idleDialogues.long.text);
      }
    }, 30000);
  }

  window.addEventListener('pointermove', () => resetIdleTimers(true), { passive: true });
  window.addEventListener('keydown', () => resetIdleTimers(true));
  resetIdleTimers(false);
}
