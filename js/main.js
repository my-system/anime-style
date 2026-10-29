/**
 * Main Application Orchestrator (Cetak Biru Portofolio Hyouka Versi 2)
 * Mengatur Gerbang, Urutan Animasi Prolog, Kamera Karakter per Bab,
 * Visual Novel Engine, RPG Skills, Lembar Misi, Timeline, Surat & Mode Ringkas
 */

import { siteConfig } from '../data/config.js';
import {
  moodComments,
  whoAmIDialogues,
  whoAmIExtraDialogues,
  easterEggDialogues,
  timeGreetings
} from '../data/dialogs.js';
import { skillsData } from '../data/skills.js';
import { projectsData } from '../data/projects.js';
import { creativeData } from '../data/creative.js';
import { timelineData } from '../data/timeline.js';
import { achievementsList } from '../data/achievements.js';
import { soundEngine } from './audio.js';
import { initFluidCursor, initMagneticCursor } from './fluidCursor.js';
import { initCharacterFluidReveal } from './characterReveal.js';
import { initEyes, setCharacterExpression } from './eyes.js';
import { initRainCanvas } from './rain.js';
import { DialogPlayer } from './dialog.js';
import { initCharacterBehavior } from './character.js';
import { initEmojiWidget } from './emoji.js';
import {
  achievementManager,
  triggerAchievement,
  initAchievementsModal
} from './achievements.js';
import { initOfudaGuestbook } from './ofuda.js';
import { initLofiRadio } from './lofiRadio.js';

document.addEventListener('DOMContentLoaded', () => {
  const prologTextEl = document.getElementById('prolog-dialog-text');
  const dialogPlayer = new DialogPlayer(prologTextEl);

  // Inisialisasi sistem kanvas fluida Navier-Stokes & kursor magnetik (dari Profil Cafe Cinematic)
  initFluidCursor();
  initMagneticCursor();
  initCharacterFluidReveal();
  initEyes((stareText) => {
    dialogPlayer.typeText(stareText);
  });
  initRainCanvas(dialogPlayer);
  initCharacterBehavior(dialogPlayer);
  initEmojiWidget(dialogPlayer);
  initAchievementsModal();
  initOfudaGuestbook();
  initLofiRadio();

  // Render seluruh konten bab dari folder /data
  renderSkills();
  setupHexagonRadar();
  setupVibeConsoleModal();
  renderProjects();
  renderTimeline();
  renderCompactRecruiterView();
  renderEpilogAchievementsSummary();
  renderBoardingPass();
  setupWhoAmIScene();
  setupCvScrollModal();
  setupSecretEasterEggButton(dialogPlayer);

  // Navigasi antar-bab & koreografi kamera karakter
  setupSceneTransitions();

  // Pengubah Suasana (Terang, Malam, Hujan)
  setupMoodSwitcher(dialogPlayer);

  // Sakelar Mode Cerita / Mode Ringkas (Recruiter 10-detik)
  setupCompactMode();

  // Tombol Mute Audio
  setupAudioToggle();

  // Konami Code Easter Egg
  setupKonamiCode(dialogPlayer);

  // Gerbang Pembuka (Preload aset & izin audio)
  setupGate(dialogPlayer);
});

/**
 * 1. Scene 0: Suzume no Tojimari Cinematic Video Opening (Gerbang Pembuka Hyouka)
 * Durasi Video: 8 Detik
 * 0s - 2s: Kamera meluncur maju melintasi genangan air tenang menuju pintu Suzume di reruntuhan.
 * 2s - 4s: Gagang pintu kuningan berkilau terkena pantulan cahaya, berputar turun ("clack!").
 * 4s - 6s: Pintu mengayun terbuka lebar menyemburkan aurora hijau zamrud, langit bintang Tokoyo & berkas cahaya ilahi.
 * 6s - 8s: Kamera melesat masuk menembus pintu ke dalam inti cahaya yang menyilaukan, lalu layar memutih bersih menyatu ke panggung Hero.
 */
function setupGate(dialogPlayer) {
  const overlay = document.getElementById('gate-overlay');
  if (!overlay) return;

  const idleVideo = document.getElementById('loader-idle-video');
  const introVideo = document.getElementById('loader-intro-video');
  const doorHotspot = document.getElementById('suzume-door-hotspot');
  const doorRipple = document.getElementById('door-click-ripple');
  const whiteoutVeil = document.getElementById('video-whiteout-veil');
  const subText = document.getElementById('loader-sub-text');
  const statusText = document.getElementById('loader-text-status');
  const audioToggle = document.getElementById('loader-audio-toggle');
  const audioIcon = document.getElementById('loader-audio-icon');
  const audioLabel = document.getElementById('loader-audio-label');
  const skipBtn = document.getElementById('loader-skip-btn');

  let isAudioEnabled = false;
  let isOpeningTriggered = false;
  let isSequenceFinished = false;
  let latchSoundPlayed = false;
  let chimeSoundPlayed = false;
  let failsafeTimer = null;

  // Cek preferensi audio tersimpan
  try {
    if (localStorage.getItem('amine_audio') === 'on') {
      isAudioEnabled = true;
      if (audioToggle) audioToggle.classList.add('active');
      if (audioIcon) audioIcon.textContent = '🔊';
      if (audioLabel) audioLabel.textContent = 'Suara: Aktif';
    }
  } catch (e) {}

  function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    soundEngine.init(isAudioEnabled);
    if (isAudioEnabled) soundEngine.playClickSound();

    if (idleVideo && isOpeningTriggered) idleVideo.muted = !isAudioEnabled;
    if (introVideo) introVideo.muted = !isAudioEnabled;

    if (audioToggle) audioToggle.classList.toggle('active', isAudioEnabled);
    if (audioIcon) audioIcon.textContent = isAudioEnabled ? '🔊' : '🔇';
    if (audioLabel) audioLabel.textContent = isAudioEnabled ? 'Suara: Aktif' : 'Suara: Senyap';

    const audioBtn = document.getElementById('audio-mute-btn');
    if (audioBtn) {
      audioBtn.innerHTML = isAudioEnabled ? '<span class="ctrl-icon">🔊</span>' : '<span class="ctrl-icon">🔇</span>';
      audioBtn.title = isAudioEnabled ? 'Audio Latar: Aktif (Klik untuk Matikan)' : 'Audio Latar: Senyap (Klik untuk Nyalakan)';
      audioBtn.classList.toggle('active', isAudioEnabled);
    }
    try {
      localStorage.setItem('amine_audio', isAudioEnabled ? 'on' : 'off');
    } catch (e) {}
  }

  if (audioToggle) {
    audioToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  // Mulai Tahap 1: Video Idle Pintu Hening
  // Kunci autoplay modern browser: Selalu mulai dengan muted=true agar 100% tidak diblokir browser
  if (idleVideo) {
    idleVideo.muted = true;
    idleVideo.defaultMuted = true;
    idleVideo.loop = true;
    idleVideo.playsInline = true;

    const startIdlePlay = () => {
      const p = idleVideo.play();
      if (p !== undefined) {
        p.catch(() => {
          idleVideo.muted = true;
          idleVideo.play().catch(() => {});
        });
      }
    };

    startIdlePlay();

    // Pastikan jika ada interaksi kursor pertama kali, video dipastikan bergerak
    window.addEventListener('pointerdown', () => {
      if (!isOpeningTriggered && idleVideo.paused) {
        startIdlePlay();
      }
    }, { once: true });

    // Jaminan loop mulus tanpa freeze di akhir detik 8
    idleVideo.addEventListener('ended', () => {
      idleVideo.currentTime = 0;
      idleVideo.play().catch(() => {});
    });
  }

  if (subText) subText.classList.add('visible');

  // Transisi Menembus Pintu Menuju Panggung Hero (Tahap Akhir)
  function executeTransitionToHero() {
    if (isSequenceFinished) return;
    isSequenceFinished = true;

    if (failsafeTimer) clearTimeout(failsafeTimer);

    if (statusText) statusText.textContent = 'Melangkah Masuk ke Dunia Hyouka...';
    if (subText) subText.style.opacity = '0';
    if (skipBtn) skipBtn.style.opacity = '0';
    const topControls = document.querySelector('.loader-top-controls');
    if (topControls) {
      topControls.style.opacity = '0';
      topControls.style.pointerEvents = 'none';
    }

    // Aktifkan tabir putih murni untuk transisi tanpa celah
    if (whiteoutVeil) whiteoutVeil.classList.add('active');

    setTimeout(() => {
      overlay.classList.add('fade-out');
      triggerAchievement('welcome');
      playPrologEntranceSequence(dialogPlayer);

      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        // Bebaskan memori GPU & video decoder setelah gerbang dilewati
        if (idleVideo) {
          try {
            idleVideo.pause();
            idleVideo.removeAttribute('src');
            idleVideo.load();
          } catch (e) {}
        }
        if (introVideo) {
          try {
            introVideo.pause();
            introVideo.removeAttribute('src');
            introVideo.load();
          } catch (e) {}
        }
      }, 550);
    }, 280);
  }

  // Mulai Tahap 2: Kamera Mendekati Pintu, Memutar Gagang, dan Membuka ke Tokoyo
  function triggerDoorOpen() {
    if (isOpeningTriggered || isSequenceFinished) return;
    isOpeningTriggered = true;

    // Aktifkan audio jika belum diaktifkan oleh pengguna
    if (!isAudioEnabled) {
      toggleAudio();
    } else {
      soundEngine.init(true);
    }

    // Mainkan suara putaran kunci pintu
    soundEngine.playDoorLatchSound();
    latchSoundPlayed = true;

    // Animasi shockwave riak air di pintu
    if (doorRipple) {
      doorRipple.classList.add('active');
    }

    // Sembunyikan hotspot interaktif
    if (doorHotspot) {
      doorHotspot.style.opacity = '0';
      doorHotspot.style.pointerEvents = 'none';
    }

    if (statusText) statusText.textContent = 'Membuka Kunci Gerbang Suzume...';

    // Munculkan dan putar Video 2 (Membuka Pintu - Dimuat on-demand)
    if (introVideo) {
      if (!introVideo.src && introVideo.dataset.src) {
        introVideo.src = introVideo.dataset.src;
      }
      introVideo.classList.add('playing');
      introVideo.muted = !isAudioEnabled;
      introVideo.currentTime = 0;
      introVideo.play().catch(() => {});

      // Hentikan video 1 setelah transisi cross-fade mulus
      setTimeout(() => {
        if (idleVideo) {
          try { idleVideo.pause(); } catch (e) {}
        }
      }, 600);

      // Failsafe 8.8 detik untuk video 2
      failsafeTimer = setTimeout(() => {
        executeTransitionToHero();
      }, 8800);
    } else {
      executeTransitionToHero();
    }
  }

  // Pasang pendengar klik pada Hotspot Pintu Suzume
  if (doorHotspot) {
    doorHotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerDoorOpen();
    });
    doorHotspot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerDoorOpen();
      }
    });
  }

  // Klik di mana saja pada overlay juga memicu pembukaan gerbang
  overlay.addEventListener('click', (e) => {
    if (e.target.closest('#loader-audio-toggle') || e.target.closest('#loader-skip-btn')) return;
    if (!isOpeningTriggered) {
      triggerDoorOpen();
    }
  });

  // Tombol Lewati langsung menuju ke Hero
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      executeTransitionToHero();
    });
  }

  // Sinkronisasi Cerita & Suara Berdasarkan Waktu Video 2 (8 Detik)
  if (introVideo) {
    introVideo.addEventListener('timeupdate', () => {
      const cur = introVideo.currentTime;

      // 0.0s - 2.0s: Mendekati pintu
      if (cur < 2.0) {
        if (statusText && statusText.textContent !== 'Mendekati Gerbang Suzume...') {
          statusText.textContent = 'Mendekati Gerbang Suzume...';
        }
      }
      // 2.0s - 4.2s: Gagang pintu berkilau & berputar ("clack")
      else if (cur >= 2.0 && cur < 4.2) {
        if (!latchSoundPlayed) {
          latchSoundPlayed = true;
          soundEngine.playDoorLatchSound();
        }
        if (statusText && statusText.textContent !== 'Membuka Kunci Pintu...') {
          statusText.textContent = 'Membuka Kunci Pintu...';
        }
      }
      // 4.2s - 6.8s: Pintu terbuka lebar menyemburkan bintang & aurora Tokoyo
      else if (cur >= 4.2 && cur < 6.8) {
        if (!chimeSoundPlayed) {
          chimeSoundPlayed = true;
          soundEngine.playDoorOpenChime();
        }
        if (statusText && statusText.textContent !== 'Menyibak Cahaya Bintang Tokoyo...') {
          statusText.textContent = 'Menyibak Cahaya Bintang Tokoyo...';
        }
      }
      // 6.8s - 8.0s: Kamera melesat masuk ke dalam cahaya putih
      else if (cur >= 6.8) {
        if (statusText && statusText.textContent !== 'Melangkah Masuk...') {
          statusText.textContent = 'Melangkah Masuk...';
        }
      }

      // Detik 7.6 - 8.0: Pintu telah tembus ke layar putih murni -> transisi mulus ke Hero
      if (cur >= 7.6) {
        executeTransitionToHero();
      }
    });

    introVideo.addEventListener('ended', () => {
      executeTransitionToHero();
    });
  }
}

/**
 * Urutan Animasi Saat Masuk Scene 1 (Sesuai Bagian 4 Cetak Biru):
 * 1. Latar muncul perlahan (0,0 - 1,0 dtk)
 * 2. Wajah Hyouka fade in dengan sedikit zoom-out dari 108% ke 100% (1,0 - 2,2 dtk)
 * 3. Teks judul "Hi! I'm Hyouka" tertulis huruf per huruf seperti ditulis pensil (1,5 - 3,0 dtk)
 * 4. Hyouka berkedip satu kali, lalu bubble dialog muncul dengan sapaan sesuai waktu (3,2 dtk)
 * 5. Tombol muncul terakhir
 */
function playPrologEntranceSequence(dialogPlayer) {
  const prologScene = document.getElementById('scene-prolog');
  const stage = document.getElementById('character-stage');
  const pencilTitle = document.getElementById('hero-pencil-text');
  const dialogBubble = document.getElementById('prolog-vn-bubble');
  const heroActions = document.getElementById('prolog-actions');
  const emojiWidget = document.getElementById('prolog-emoji-widget');

  const fullTitle = `Hi! I'm ${siteConfig.name}`;
  if (pencilTitle) pencilTitle.textContent = '';

  // Reset state awal untuk sekuens masuk
  if (stage) stage.classList.add('entrance-zoom-start');
  if (dialogBubble) dialogBubble.classList.add('seq-hidden');
  if (heroActions) heroActions.classList.add('seq-hidden');
  if (emojiWidget) emojiWidget.classList.add('seq-hidden');

  // Langkah 2 (0.4s -> 1.8s): Wajah Hyouka fade-in & zoom-out 108% -> 100%
  setTimeout(() => {
    if (stage) stage.classList.remove('entrance-zoom-start');
  }, 250);

  // Langkah 3 (0.8s -> 2.1s): Judul ditulis huruf per huruf seperti coretan pensil
  setTimeout(() => {
    if (!pencilTitle) return;
    let idx = 0;
    const writeInterval = setInterval(() => {
      if (idx < fullTitle.length) {
        pencilTitle.textContent += fullTitle.charAt(idx);
        idx++;
      } else {
        clearInterval(writeInterval);
      }
    }, 75);
  }, 750);

  // Langkah 4 (2.2s): Hyouka berkedip satu kali, lalu bubble dialog muncul dengan sapaan waktu
  setTimeout(() => {
    setCharacterExpression('blink', 160);
    setTimeout(() => {
      if (dialogBubble) dialogBubble.classList.remove('seq-hidden');
      const greetingText = getLocalTimeGreeting();
      if (dialogPlayer) dialogPlayer.typeText(greetingText, 26);
    }, 200);
  }, 2000);

  // Langkah 5 (2.8s): Tombol Contact, Who i'm & Widget Emoji muncul terakhir
  setTimeout(() => {
    if (heroActions) heroActions.classList.remove('seq-hidden');
    if (emojiWidget) emojiWidget.classList.remove('seq-hidden');
  }, 2650);

  if (prologScene) prologScene.classList.add('entered');
}

function getLocalTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 4) {
    triggerAchievement('night_owl');
  }
  const found = timeGreetings.find((g) => {
    if (g.start <= g.end) return hour >= g.start && hour < g.end;
    return hour >= g.start || hour < g.end;
  });
  return found ? found.text : 'Selamat datang di perjalananku.';
}

/**
 * 2. Scene 2: Bab 1 ("Who I'm") — Kotak Dialog Visual Novel Interaktif
 * Mendukung klik atau tombol Spasi untuk lanjut, perubahan ekspresi mata, & cabang cerita
 */
function setupWhoAmIScene() {
  const vnBox = document.getElementById('whoami-vn-box');
  const textEl = document.getElementById('whoami-dialog-text');
  const stepBadge = document.getElementById('whoami-step-counter');
  const nextPrompt = document.getElementById('whoami-next-prompt');
  const choicesWrap = document.getElementById('whoami-choices');
  const btnMoreStory = document.getElementById('btn-vn-extra');
  const btnToSkills = document.getElementById('btn-vn-skills');

  if (!textEl) return;
  const vnPlayer = new DialogPlayer(textEl);

  let activeScript = [...whoAmIDialogues];
  let currentIdx = 0;
  let extraUnlocked = false;

  function playCurrentBeat() {
    const item = activeScript[currentIdx];
    if (!item) return;

    if (stepBadge) {
      stepBadge.textContent = `Bagian ${currentIdx + 1} / ${activeScript.length}`;
    }

    setCharacterExpression(item.expression || 'base');

    const isLast = currentIdx >= activeScript.length - 1;
    if (choicesWrap) choicesWrap.classList.toggle('visible', isLast);
    if (nextPrompt) nextPrompt.style.display = isLast ? 'none' : 'inline-flex';

    vnPlayer.typeText(item.text, 24);
  }

  function advanceBeat() {
    if (vnPlayer.isTyping) {
      vnPlayer.instantComplete(activeScript[currentIdx].text);
      return;
    }
    if (currentIdx < activeScript.length - 1) {
      currentIdx++;
      soundEngine.playClickSound();
      playCurrentBeat();
    }
  }

  playCurrentBeat();

  if (vnBox) {
    vnBox.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      advanceBeat();
    });
  }

  // Tekan Spasi untuk lanjut saat berada di Scene 2
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.body.dataset.scene === 'scene-whoami') {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'BUTTON') return;
      e.preventDefault();
      advanceBeat();
    }
  });

  if (btnMoreStory) {
    btnMoreStory.addEventListener('click', () => {
      soundEngine.playClickSound();
      if (!extraUnlocked) {
        extraUnlocked = true;
        activeScript = [...whoAmIDialogues, ...whoAmIExtraDialogues];
        currentIdx = whoAmIDialogues.length;
        btnMoreStory.textContent = 'Ulangi dari Awal ↺';
        playCurrentBeat();
      } else {
        currentIdx = 0;
        playCurrentBeat();
      }
    });
  }

  if (btnToSkills) {
    btnToSkills.addEventListener('click', () => {
      soundEngine.playClickSound();
      document.getElementById('scene-skills')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * 3. Scene 3: Bab 2 (Jurus / Skills) — Status RPG + Bar Hijau Beranimasi + Komentar Klik
 */
function renderSkills() {
  const container = document.getElementById('skills-panel-list');
  const commentEl = document.getElementById('rpg-skill-comment');
  if (!container) return;

  const groups = [
    { key: 'main', title: 'Senjata Utama', subtitle: 'Keahlian Inti', list: skillsData.mainWeapons },
    { key: 'sub', title: 'Senjata Cadangan', subtitle: 'Pustaka & Perkakas', list: skillsData.secondaryWeapons },
    { key: 'secret', title: 'Jurus Rahasia', subtitle: 'Sedang Dipelajari', list: skillsData.secretJutsu }
  ];

  container.innerHTML = groups
    .map(
      (g) => `
      <div class="skill-group-block">
        <div class="skill-group-head">
          <h3 class="skill-category-title">${g.title}</h3>
          <span class="skill-category-sub">${g.subtitle}</span>
        </div>
        <div class="skills-pill-group">
          ${g.list
            .map(
              (s) => `
            <button type="button" class="skill-card" data-comment="${s.comment}" data-tooltip="${s.desc}" data-related='${JSON.stringify(s.relatedProjects || [])}'>
              <div class="skill-header">
                <span class="skill-name"><span class="skill-icon">${s.icon}</span> ${s.name}</span>
                <span class="skill-level-badge">${s.level} · ${s.meta}</span>
              </div>
              <div class="skill-bar-track">
                <div class="skill-bar-fill" data-fill="${s.fill}" style="width: 0%;"></div>
              </div>
              <p class="skill-desc">${s.desc}</p>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('click', () => {
      soundEngine.playClickSound();
      setCharacterExpression('blink', 150);
      container.querySelectorAll('.skill-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      if (commentEl && card.dataset.comment) {
        commentEl.textContent = `"${card.dataset.comment}"`;
      }

      // Fitur Unik #2: Jembatan Jurus ke Bukti Proyek
      const bridgeEl = document.getElementById('rpg-project-bridge');
      const bridgeChips = document.getElementById('rpg-bridge-chips');
      let related = [];
      try {
        related = JSON.parse(card.dataset.related || '[]');
      } catch (e) {}

      if (bridgeEl && bridgeChips) {
        if (related.length > 0) {
          bridgeEl.style.display = 'block';
          bridgeChips.innerHTML = related
            .map(
              (p) => `<button type="button" class="btn-bridge-chip" data-project-id="${p.id}"><span>➔</span> ${p.title}</button>`
            )
            .join('');

          bridgeChips.querySelectorAll('.btn-bridge-chip').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              soundEngine.playClickSound();
              const projId = btn.getAttribute('data-project-id');
              const targetScene = document.getElementById('scene-projects');
              if (targetScene) {
                targetScene.scrollIntoView({ behavior: 'smooth' });
              }
              setTimeout(() => {
                const targetCard = document.querySelector(`.mission-card-3d[data-project-id="${projId}"]`);
                if (targetCard) {
                  targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  targetCard.classList.remove('card-spotlight-pulse');
                  void targetCard.offsetWidth;
                  targetCard.classList.add('card-spotlight-pulse');
                }
              }, 480);
            });
          });
        } else {
          bridgeEl.style.display = 'none';
        }
      }
    });
  });
}

function animateSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  let triggeredSound = false;
  fills.forEach((bar, i) => {
    const target = bar.dataset.fill || 85;
    if (bar.style.width === '0%') {
      if (!triggeredSound) {
        soundEngine.playBarFillSound();
        triggeredSound = true;
      }
      setTimeout(() => {
        bar.style.width = `${target}%`;
      }, i * 65);
    }
  });
}

/**
 * Fitur Unik #1: Diagram Radar Heksagonal RPG di Kartu Status Yusuf
 */
function setupHexagonRadar() {
  const tabMeta = document.getElementById('btn-tab-meta');
  const tabRadar = document.getElementById('btn-tab-radar');
  const panelMeta = document.getElementById('rpg-meta-panel');
  const panelRadar = document.getElementById('rpg-radar-panel');
  const gridLayer = document.getElementById('radar-grid-layer');
  const polygonShape = document.getElementById('radar-polygon-shape');
  const pointsLayer = document.getElementById('radar-points-layer');
  const labelsLayer = document.getElementById('radar-labels-layer');
  const tipEl = document.getElementById('radar-stat-tip');

  if (!tabMeta || !tabRadar || !panelMeta || !panelRadar) return;

  const stats = [
    { label: 'Promptcraft', value: 96, full: 'AI Orchestration & Prompting: 96/100' },
    { label: 'Visual Taste', value: 94, full: 'Layout, CSS & Aesthetic: 94/100' },
    { label: 'Logic Wiring', value: 88, full: 'DOM & API Integration: 88/100' },
    { label: 'Speed', value: 98, full: 'Rapid Prototyping & Delivery: 98/100' },
    { label: 'Data Logic', value: 92, full: 'Statistical Analytics (S.Stat): 92/100' },
    { label: 'Coffee Fuel ☕', value: 100, full: 'Kopi Hangat & Fokus: 100/100 (Max!)' }
  ];

  const cx = 125;
  const cy = 100;
  const maxR = 64;
  const numAxes = stats.length;

  function polarToCart(angleDeg, r) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  // Draw background grid polygons (levels 25%, 50%, 75%, 100%)
  if (gridLayer && labelsLayer && pointsLayer && polygonShape) {
    let gridHTML = '';
    [0.25, 0.5, 0.75, 1.0].forEach((level) => {
      const pts = [];
      for (let i = 0; i < numAxes; i++) {
        const angle = (i * 360) / numAxes;
        const p = polarToCart(angle, maxR * level);
        pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      }
      gridHTML += `<polygon class="radar-grid-polygon" points="${pts.join(' ')}" opacity="${level === 1.0 ? 0.8 : 0.45}"></polygon>`;
    });

    for (let i = 0; i < numAxes; i++) {
      const angle = (i * 360) / numAxes;
      const end = polarToCart(angle, maxR);
      gridHTML += `<line class="radar-axis-line" x1="${cx}" y1="${cy}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"></line>`;
    }
    gridLayer.innerHTML = gridHTML;

    // Draw labels & points
    let pointsHTML = '';
    let labelsHTML = '';
    const polyPoints = [];

    stats.forEach((s, i) => {
      const angle = (i * 360) / numAxes;
      const rVal = (s.value / 100) * maxR;
      const pt = polarToCart(angle, rVal);
      const labelPt = polarToCart(angle, maxR + 17);

      polyPoints.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);

      pointsHTML += `<circle class="radar-point" cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" data-tip="${s.full}"></circle>`;
      labelsHTML += `<text class="radar-label" x="${labelPt.x.toFixed(1)}" y="${labelPt.y.toFixed(1)}">${s.label}</text>`;
    });

    polygonShape.setAttribute('points', polyPoints.join(' '));
    pointsLayer.innerHTML = pointsHTML;
    labelsLayer.innerHTML = labelsHTML;

    pointsLayer.querySelectorAll('.radar-point').forEach((pt) => {
      pt.addEventListener('mouseenter', () => {
        if (tipEl) tipEl.textContent = pt.dataset.tip;
      });
      pt.addEventListener('mouseleave', () => {
        if (tipEl) tipEl.textContent = 'Arahkan kursor ke titik sudut';
      });
    });
  }

  // Tab switching
  tabMeta.addEventListener('click', () => {
    soundEngine.playClickSound();
    tabMeta.classList.add('active');
    tabMeta.setAttribute('aria-selected', 'true');
    tabRadar.classList.remove('active');
    tabRadar.setAttribute('aria-selected', 'false');
    panelMeta.style.display = 'flex';
    panelRadar.style.display = 'none';
  });

  tabRadar.addEventListener('click', () => {
    soundEngine.playClickSound();
    tabRadar.classList.add('active');
    tabRadar.setAttribute('aria-selected', 'true');
    tabMeta.classList.remove('active');
    tabMeta.setAttribute('aria-selected', 'false');
    panelMeta.style.display = 'none';
    panelRadar.style.display = 'flex';
  });
}

/**
 * Fitur Unik #3: Simulasi Vibe Prompt Console Modal (Agent Orchestration Playground)
 */
function setupVibeConsoleModal() {
  const openBtn = document.getElementById('btn-open-vibe-console');
  const modal = document.getElementById('vibe-console-modal');
  const backdrop = document.getElementById('vibe-console-backdrop');
  const closeBtn = document.getElementById('vibe-console-close-btn');
  const dotClose = document.getElementById('vibe-console-dot-close');
  const promptEl = document.getElementById('console-user-prompt');
  const agentLog = document.getElementById('console-agent-log');
  const resultCard = document.getElementById('console-result-card');
  const statusText = document.getElementById('console-status-text');
  const chips = document.querySelectorAll('.prompt-chip');

  if (!modal || !openBtn) return;

  const scenarios = {
    cafe: {
      prompt: 'Rancang landing page kafe dengan simulasi fluida asap 2D Navier-Stokes & video golden hour',
      steps: [
        { tag: '[1/3 ANALISIS]', text: 'Mengidentifikasi solver fluida: Jacobi pressure iteration & adveksi WebGL', ok: 'OK' },
        { tag: '[2/3 ARSITEKTUR]', text: 'Menyusun timeline GSAP, audio cangkir kopi, dan smooth scroll Lenis', ok: 'OK' },
        { tag: '[3/3 GPU STABILITY]', text: 'Benchmarking 60 FPS stabil pada kartu grafis desktop & mobile', ok: 'SELESAI (2.4s)' }
      ],
      title: 'Waroeng Kopi Sedap',
      desc: 'Simulasi fluida asap riil 60 FPS & atmosfer kafe sinematik.',
      projectId: 'mission-cafe'
    },
    rpa: {
      prompt: 'Buatkan Chrome Extension untuk mengotomasi input 500 rekam medis RSB BAZNAS dari Excel',
      steps: [
        { tag: '[1/3 EKSTENSI]', text: 'Menyiapkan arsitektur Manifest V3 & parser SheetJS / XLSX', ok: 'OK' },
        { tag: '[2/3 DOM INJECTION]', text: 'Automasi pengisian formulir multi-tahap dan verifikasi poli', ok: 'OK' },
        { tag: '[3/3 VALIDASI]', text: 'Mengeleminasi typo data rekam medis & memangkas 75% waktu loket', ok: 'SELESAI (1.8s)' }
      ],
      title: 'ProFaskes Auto-Bot RPA',
      desc: 'Solusi otomatisasi riil yang menghemat ribuan ketukan staf klinik harian.',
      projectId: 'mission-profaskes'
    },
    zerohour: {
      prompt: 'Ciptakan infinite zoom continuous shot menembus roda gigi jam tangan mekanik 60 FPS',
      steps: [
        { tag: '[1/3 SPATIAL 3D]', text: 'Membangun kanvas Three.js WebGL satu bidikan tanpa jeda loading', ok: 'OK' },
        { tag: '[2/3 SCRUBBING]', text: 'Sinkronisasi mikro-frame FFmpeg dengan pergerakan gulir mouse', ok: 'OK' },
        { tag: '[3/3 PERFORMA]', text: 'Mengunci frame time 16.6ms: transisi mulus makro ke mikrokosmos', ok: 'SELESAI (2.1s)' }
      ],
      title: 'ZERO HOUR · Chrono Kinematics',
      desc: 'Satu detik abadi dari luar angkasa menembus jantung horologi mekanik.',
      projectId: 'mission-zerohour'
    },
    ccve: {
      prompt: 'Bangun mesin audit inferensial deteksi dini anomali klaim inefisiensi BPJS Healthkathon',
      steps: [
        { tag: '[1/3 STATISTIKA]', text: 'Menjalankan model inferensial & scoring risiko multi-parameter', ok: 'OK' },
        { tag: '[2/3 PRE-PAYMENT]', text: 'Pendeteksian kebocoran klaim 20 subkategori faskes sebelum pembayaran', ok: 'OK' },
        { tag: '[3/3 PENGUJIAN]', text: 'Verifikasi teruji: Dinobatkan sebagai Inovasi BPJS Healthkathon 2026', ok: 'SELESAI (3.0s)' }
      ],
      title: 'CCVE: Cross-Verification Engine',
      desc: 'Mesin audit klaim faskes berbasis statistika inferensial multidimensi.',
      projectId: 'mission-ccve'
    }
  };

  let typeTimer = null;
  let activeScenarioKey = 'cafe';

  function playScenario(key) {
    activeScenarioKey = key;
    const sc = scenarios[key];
    if (!sc) return;

    if (typeTimer) clearTimeout(typeTimer);
    if (promptEl) promptEl.textContent = '';
    if (agentLog) agentLog.innerHTML = '';
    if (resultCard) resultCard.style.display = 'none';
    if (statusText) statusText.textContent = 'ORCHESTRATING PROMPT...';

    let charIdx = 0;
    const fullText = sc.prompt;

    function typeChar() {
      if (charIdx < fullText.length) {
        if (promptEl) promptEl.textContent += fullText.charAt(charIdx);
        charIdx++;
        typeTimer = setTimeout(typeChar, 18);
      } else {
        playSteps(sc);
      }
    }
    typeChar();
  }

  function playSteps(sc) {
    sc.steps.forEach((st, i) => {
      setTimeout(() => {
        soundEngine.playBarFillSound();
        if (agentLog) {
          const row = document.createElement('div');
          row.className = 'agent-step-row';
          row.innerHTML = `<span class="step-tag">${st.tag}</span> <span>${st.text}</span> <strong class="step-ok">[${st.ok}]</strong>`;
          agentLog.appendChild(row);
        }

        if (i === sc.steps.length - 1) {
          showResult(sc);
        }
      }, (i + 1) * 380);
    });
  }

  function showResult(sc) {
    setTimeout(() => {
      try {
        soundEngine.playAchievementJingle();
      } catch (e) {}
      if (statusText) statusText.textContent = 'EKSEKUSI SUKSES · 100% VIBE ACCURACY';
      if (resultCard) {
        resultCard.style.display = 'flex';
        resultCard.innerHTML = `
          <div class="result-meta">
            <span class="result-badge">✨ HASIL PRODUK VIBE CODING:</span>
            <strong style="color: #f8fafc; font-size: 0.95rem;">${sc.title}</strong>
            <span class="result-desc">${sc.desc}</span>
          </div>
          <button type="button" class="btn-console-demo" id="btn-console-goto-project" data-project-id="${sc.projectId}">Lihat Proyek ➔</button>
        `;

        const gotoBtn = document.getElementById('btn-console-goto-project');
        if (gotoBtn) {
          gotoBtn.addEventListener('click', () => {
            closeModal();
            const targetScene = document.getElementById('scene-projects');
            if (targetScene) targetScene.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const card = document.querySelector(`.mission-card-3d[data-project-id="${sc.projectId}"]`);
              if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.remove('card-spotlight-pulse');
                void card.offsetWidth;
                card.classList.add('card-spotlight-pulse');
              }
            }, 480);
          });
        }
      }
    }, 280);
  }

  function openModal() {
    modal.classList.add('active');
    soundEngine.playClickSound();
    playScenario(activeScenarioKey);
  }

  function closeModal() {
    modal.classList.remove('active');
    if (typeTimer) clearTimeout(typeTimer);
    soundEngine.playClickSound();
  }

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (dotClose) dotClose.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const scKey = chip.dataset.scenario;
      playScenario(scKey);
    });
  });
}

/**
 * 4. Scene 4: Bab 3 (Misi / Projects & Studio Creative) — Dual Persona Switcher
 */
function renderProjects() {
  const grid = document.getElementById('projects-cards-grid');
  const filterBar = document.getElementById('projects-filter-bar');
  const codeModal = document.getElementById('project-modal');
  const creativeModal = document.getElementById('creative-modal');
  const spectatorBubble = document.getElementById('spectator-comment-text');
  const spectatorName = document.getElementById('spectator-name-label');
  const chapterBadgeText = document.getElementById('projects-badge-text');
  const sectionTitle = document.getElementById('projects-section-title');
  const sectionSubtitle = document.getElementById('projects-section-subtitle');

  if (!grid) return;

  let currentPersona = 'code'; // 'code' | 'creative'
  let currentFilter = 'all';
  const openedProjects = new Set();
  const openedCreatives = new Set();

  function switchPersona(persona) {
    if (currentPersona === persona) return;
    currentPersona = persona;
    currentFilter = 'all';

    // Update active state in top-nav and section buttons
    document.querySelectorAll('[data-persona]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.persona === persona);
    });

    // Sound effect
    soundEngine.playClickSound();

    if (persona === 'code') {
      if (chapterBadgeText) chapterBadgeText.textContent = 'BAB 03 · LEMBAR MISI D:\\VIBE CODING';
      if (sectionTitle) sectionTitle.textContent = `Koleksi ${projectsData.length} Proyek Pilihan`;
      if (sectionSubtitle) sectionSubtitle.textContent = 'Konvergensi simulasi WebGL 2D/3D, analitika data inferensial, otomatisasi RPA, dan arsitektur web interaktif modern.';
      if (spectatorName) spectatorName.textContent = 'Hyouka (Penonton Misi)';
      if (spectatorBubble) spectatorBubble.textContent = '"Arahkan kursor atau klik kartu misi mana pun untuk membaca catatan di baliknya dan membuka live demo!"';
      setCharacterExpression('base', 0);
    } else {
      if (chapterBadgeText) chapterBadgeText.textContent = 'BAB 03 · ATELIER VISUAL & STUDIO SINEMA';
      if (sectionTitle) sectionTitle.textContent = 'Galeri Desain Grafis & Video Editing';
      if (sectionSubtitle) sectionSubtitle.textContent = 'Eksplorasi ritme sinematik, color grading atmosferik, tipografi presisi, dan identitas visual.';
      if (spectatorName) spectatorName.textContent = 'Hyouka (Studio Director)';
      if (spectatorBubble) spectatorBubble.textContent = '"Selamat datang di studio visualku! Arahkan kursor atau klik karya untuk melihat detail proses, palet warna, dan bedah produksinya."';
      setCharacterExpression('smile', 2500);
    }

    renderFilters();
    renderContent();
  }

  // Bind persona switch buttons
  document.querySelectorAll('[data-persona]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchPersona(btn.dataset.persona);
    });
  });

  function renderFilters() {
    if (!filterBar) return;
    if (currentPersona === 'code') {
      filterBar.innerHTML = `
        <button type="button" class="proj-filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Semua Misi (${projectsData.length})</button>
        <button type="button" class="proj-filter-btn ${currentFilter === 'Cinematic' ? 'active' : ''}" data-filter="Cinematic">Sinematik &amp; 3D WebGL</button>
        <button type="button" class="proj-filter-btn ${currentFilter === 'Engine' ? 'active' : ''}" data-filter="Engine">Sistem &amp; AI / RPA</button>
        <button type="button" class="proj-filter-btn ${currentFilter === 'Creative' ? 'active' : ''}" data-filter="Creative">Statistika &amp; Data</button>
      `;
    } else {
      filterBar.innerHTML = `
        <button type="button" class="proj-filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Semua Karya Studio (10)</button>
        <button type="button" class="proj-filter-btn ${currentFilter === 'video' ? 'active' : ''}" data-filter="video">🎬 Video Editing &amp; Motion (3)</button>
        <button type="button" class="proj-filter-btn ${currentFilter === 'design' ? 'active' : ''}" data-filter="design">🎨 Desain Grafis Institusional (7)</button>
      `;
    }

    filterBar.querySelectorAll('.proj-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.proj-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderContent();
      });
    });
  }

  function renderContent() {
    if (currentPersona === 'code') {
      renderCodeCards();
    } else {
      renderCreativeCards();
    }
    setupCardHolographicTilt(grid.querySelectorAll('.mission-card-3d'));
  }

  function initAutoplayVideos(container) {
    if (!container) return;
    const vids = container.querySelectorAll('video');
    vids.forEach((vid) => {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const kickstart = () => {
            vid.play().catch(() => {});
            window.removeEventListener('click', kickstart);
            window.removeEventListener('touchstart', kickstart);
            window.removeEventListener('keydown', kickstart);
          };
          window.addEventListener('click', kickstart, { once: true });
          window.addEventListener('touchstart', kickstart, { once: true });
          window.addEventListener('keydown', kickstart, { once: true });
        });
      }
    });
  }

  function renderCodeCards() {
    const filtered = currentFilter === 'all'
      ? projectsData
      : projectsData.filter((p) => {
          if (currentFilter === 'Cinematic') return p.category.includes('Cinematic') || p.category.includes('Luxury') || p.category.includes('Motion') || p.tags.includes('Three.js') || p.tags.includes('WebGL');
          if (currentFilter === 'Engine') return p.category.includes('Engine') || p.category.includes('RPA') || p.category.includes('POS') || p.category.includes('AI') || p.tags.includes('Node.js');
          if (currentFilter === 'Creative') return p.category.includes('Data') || p.tags.includes('Statistika') || p.tags.includes('Statistical Audit') || p.tags.includes('Python');
          return true;
        });

    grid.innerHTML = filtered.map((p) => `
      <article class="mission-card-3d" data-project-id="${p.id}" tabindex="0" title="Klik 2x atau klik tombol ↻ untuk membalik kartu">
        <div class="card-flip-inner">
          <!-- SISI DEPAN KARTU -->
          <div class="card-face card-front">
            <div class="card-holo-sheen" aria-hidden="true"></div>
            <div class="mission-thumb-wrap ${p.video ? 'has-video' : ''}">
              ${p.video ? `
                <video src="${p.video}" class="mission-thumb-video" autoplay muted loop playsinline preload="auto" poster="${p.image}"></video>
                <span class="video-indicator-badge" title="Live Video Autoplay">▶ LIVE</span>
              ` : `
                <img src="${p.image}" alt="${p.title}" class="mission-thumb-img" loading="lazy">
              `}
              <span class="mission-badge-code">${p.code}</span>
              <span class="mission-badge-cat">${p.category}</span>
              <button type="button" class="btn-flip-trigger-corner" data-action="flip" title="Balik kartu (atau Klik 2x)" aria-label="Balik kartu">↻</button>
            </div>
            <div class="mission-body">
              <h3>${p.title}</h3>
              <p>${p.tagline}</p>
              <div class="mission-tags">
                ${p.tags.slice(0, 3).map((t) => `<span class="tag-pill">${t}</span>`).join('')}
              </div>
            </div>
            <div class="mission-actions-bar">
              <a href="${p.demoUrl}" target="_blank" rel="noopener" class="btn-card-demo" data-cursor="DEMO">
                ⚡ Demo
              </a>
              <button type="button" class="btn-card-vibe" data-action="vibe" data-project-id="${p.id}" data-cursor="RAHASIA" title="Bedah Prompt AI & Rahasia Vibe Coding">
                🔮 Vibe
              </button>
              <button type="button" class="btn-card-flip-btn" data-action="flip" title="Balik ke Lembar Spek">
                ↻ Balik
              </button>
              <button type="button" class="btn-card-detail" data-action="modal" data-open-id="${p.id}" data-cursor="BERKAS">
                📄 Kasus
              </button>
            </div>
          </div>

          <!-- SISI BELAKANG KARTU (3D FLIP DOSSIER) -->
          <div class="card-face card-back">
            <div class="card-holo-sheen" aria-hidden="true"></div>
            <div class="card-back-header">
              <div class="card-back-header-left">
                <span class="card-back-badge">${p.code} · LEMBAR SPEK TEKNIS</span>
                <h4 class="card-back-title">${p.title}</h4>
              </div>
              <button type="button" class="btn-flip-back-circle" data-action="flip" title="Kembali ke Depan (atau Klik 2x)" aria-label="Kembali ke depan">✕</button>
            </div>
            <div class="card-back-content">
              <div class="card-back-field">
                <span class="card-back-field-label">🎯 Misinya:</span>
                <span class="card-back-field-val">${p.story.mission}</span>
              </div>
              <div class="card-back-field">
                <span class="card-back-field-label">🛠️ Alat &amp; Peran:</span>
                <span class="card-back-field-val">${p.story.equipment}</span>
              </div>
              <div class="card-back-field">
                <span class="card-back-field-label">💡 Rintangan &amp; Solusi:</span>
                <span class="card-back-field-val">${p.story.obstacle}</span>
              </div>
              <div class="card-back-hyouka-quote">
                <span>💬</span>
                <span>"${p.characterComment}"</span>
              </div>
            </div>
            <div class="card-back-actions">
              <a href="${p.demoUrl}" target="_blank" rel="noopener" class="btn-card-demo">
                ⚡ Demo
              </a>
              <button type="button" class="btn-card-vibe" data-action="vibe" data-project-id="${p.id}" title="Bedah Prompt AI & Rahasia Vibe Coding">
                🔮 Vibe
              </button>
              <button type="button" class="btn-card-detail" data-action="modal" data-open-id="${p.id}">
                📄 Kasus
              </button>
              <button type="button" class="btn-card-flip-btn" data-action="flip">
                ↻ Depan
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    initAutoplayVideos(grid);

    grid.querySelectorAll('.mission-card-3d').forEach((card) => {
      const pid = card.dataset.projectId;
      const proj = projectsData.find((x) => x.id === pid);
      if (!proj) return;

      card.addEventListener('pointerenter', () => {
        if (spectatorBubble) spectatorBubble.textContent = `"${proj.characterComment}"`;
        setCharacterExpression('smile', 1800);
      });

      // 1. Double click untuk membalik kartu 3D secara intuitif
      card.addEventListener('dblclick', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        card.classList.toggle('is-flipped');
        soundEngine.playClickSound();
      });

      // 2. Tombol Ikon Balik Kartu (↻ di thumbnail, ↻ Balik di action bar, ✕ di header belakang)
      card.querySelectorAll('[data-action="flip"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          card.classList.toggle('is-flipped');
          soundEngine.playClickSound();
        });
      });

      // 3. Buka Full Modal Kasus
      const openModalHandler = (e) => {
        if (e) e.stopPropagation();
        openedProjects.add(pid);
        if (openedProjects.size === projectsData.length) {
          triggerAchievement('mission_tracker');
        }
        openProjectModal(proj);
      };

      card.querySelectorAll('[data-action="modal"]').forEach((btn) => {
        btn.addEventListener('click', openModalHandler);
      });

      const thumbWrap = card.querySelector('.mission-thumb-wrap');
      if (thumbWrap) {
        thumbWrap.addEventListener('click', (e) => {
          if (e.target.closest('[data-action="flip"]')) return;
          openModalHandler(e);
        });
      }

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (e.target.closest('[data-action="flip"]')) return;
          if (e.target.closest('a')) return;
          openModalHandler(e);
        } else if (e.key.toLowerCase() === 'f') {
          // Tombol 'F' shortcut untuk flip
          card.classList.toggle('is-flipped');
          soundEngine.playClickSound();
        }
      });
    });
  }

  function renderCreativeCards() {
    const filtered = currentFilter === 'all'
      ? creativeData
      : creativeData.filter((c) => c.type === currentFilter);

    grid.innerHTML = filtered.map((item) => {
      const isVideo = item.type === 'video';
      return `
        <article class="mission-card-3d creative-card-3d" data-creative-id="${item.id}" tabindex="0" style="--card-accent: ${item.accent};" title="Klik 2x atau klik tombol ↻ untuk membalik kartu">
          <div class="card-flip-inner">
            <!-- SISI DEPAN KARTU KREATIF -->
            <div class="card-face card-front">
              <div class="card-holo-sheen" aria-hidden="true"></div>
              <div class="creative-thumb-wrap ${item.video ? 'has-video' : ''} ${isVideo && item.format.includes('Vertical') ? 'is-vertical' : ''}">
                ${item.video ? `
                  <video src="${item.video}" class="mission-thumb-video" autoplay muted loop playsinline preload="auto" poster="${item.image}"></video>
                  <span class="video-indicator-badge" style="color: ${item.accent}; border-color: ${item.accent}55;" title="Live Video Autoplay">▶ LIVE</span>
                ` : `
                  <img src="${item.image}" alt="${item.title}" class="creative-thumb-img" loading="lazy">
                `}
                ${isVideo ? `
                  <span class="creative-duration-pill">${item.duration} · ${item.resolution.split('·')[0].trim()}</span>
                ` : `
                  <span class="creative-duration-pill">📐 ${item.dimensions ? item.dimensions.split('·')[0].trim() : '4:5'}</span>
                `}
                <span class="mission-badge-code" style="color: ${item.accent}; border-color: ${item.accent}55;">${item.code}</span>
                <button type="button" class="btn-flip-trigger-corner" data-action="flip" title="Balik kartu (atau Klik 2x)" aria-label="Balik kartu">↻</button>
              </div>

              <div class="mission-body">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-family: var(--font-mono); font-size: 0.7rem; color: ${item.accent}; font-weight: 600;">${item.category}</span>
                  <span style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">${isVideo ? item.format : item.format.split('&')[0].trim()}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.tagline}</p>
                
                ${!isVideo && item.palette ? `
                  <div class="creative-palette-bar" style="margin-top:auto; padding:3px 7px;">
                    <span class="palette-label" style="font-size:0.6rem;">Palet:</span>
                    <div class="palette-dots">
                      ${item.palette.slice(0, 4).map((c) => `<span class="swatch-dot" style="background:${c}; width:11px; height:11px;" title="Warna: ${c}"></span>`).join('')}
                    </div>
                  </div>
                ` : `
                  <div class="mission-tags">
                    ${item.software.slice(0, 3).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
                  </div>
                `}
              </div>

              <div class="mission-actions-bar">
                <button type="button" class="btn-card-demo btn-open-creative" data-id="${item.id}" style="background: ${item.accent}; color: #fff;">
                  ${isVideo ? '🎬 Tonton' : '🔍 Inspect'}
                </button>
                <button type="button" class="btn-card-flip-btn" data-action="flip" title="Balik ke Detail Bedah">
                  ↻ Balik
                </button>
                <button type="button" class="btn-card-detail btn-open-creative" data-id="${item.id}">
                  📄 Detail
                </button>
              </div>
            </div>

            <!-- SISI BELAKANG KARTU KREATIF (3D BEDAH KARYA) -->
            <div class="card-face card-back" style="border-color: ${item.accent}66;">
              <div class="card-holo-sheen" aria-hidden="true"></div>
              <div class="card-back-header">
                <div class="card-back-header-left">
                  <span class="card-back-badge" style="color: ${item.accent};">${item.code} · ${isVideo ? 'BEDAH SINEMA & MOTION' : 'BEDAH DESAIN GRAFIS'}</span>
                  <h4 class="card-back-title">${item.title}</h4>
                </div>
                <button type="button" class="btn-flip-back-circle" data-action="flip" title="Kembali ke Depan (atau Klik 2x)">✕</button>
              </div>

              <div class="card-back-content">
                <div class="card-back-field">
                  <span class="card-back-field-label">🎯 Konsep Visual:</span>
                  <span class="card-back-field-val">${item.story.concept}</span>
                </div>
                <div class="card-back-field">
                  <span class="card-back-field-label">🛠️ Software &amp; Peran:</span>
                  <span class="card-back-field-val">${item.software.join(', ')} · ${item.roles.join(', ')}</span>
                </div>
                ${isVideo ? `
                  <div class="card-back-field">
                    <span class="card-back-field-label">🎨 Color Grading:</span>
                    <span class="card-back-field-val">${item.colorGrade.profile} (${item.colorGrade.mood})</span>
                  </div>
                  <div class="card-back-field">
                    <span class="card-back-field-label">✂️ Teknik Video:</span>
                    <span class="card-back-field-val">${item.story.techniques}</span>
                  </div>
                ` : `
                  <div class="card-back-field">
                    <span class="card-back-field-label">📐 Dimensi &amp; Format:</span>
                    <span class="card-back-field-val">${item.dimensions} · ${item.format}</span>
                  </div>
                  <div class="card-back-field">
                    <span class="card-back-field-label">✒️ Tipografi Utama:</span>
                    <span class="card-back-field-val">${item.typography.join(' · ')}</span>
                  </div>
                `}
                <div class="card-back-hyouka-quote">
                  <span>💬</span>
                  <span>"${item.characterComment}"</span>
                </div>
              </div>

              <div class="card-back-actions">
                <button type="button" class="btn-card-demo btn-open-creative" data-id="${item.id}" style="background: ${item.accent}; color: #fff;">
                  ${isVideo ? '🎬 Tonton' : '🔍 Inspect'}
                </button>
                <button type="button" class="btn-card-detail btn-open-creative" data-id="${item.id}">
                  📄 Full Modal
                </button>
                <button type="button" class="btn-card-flip-btn" data-action="flip">
                  ↻ Depan
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    initAutoplayVideos(grid);

    grid.querySelectorAll('.creative-card-3d').forEach((card) => {
      const cid = card.dataset.creativeId;
      const item = creativeData.find((x) => x.id === cid);
      if (!item) return;

      card.addEventListener('pointerenter', () => {
        if (spectatorBubble) spectatorBubble.textContent = `"${item.characterComment}"`;
        setCharacterExpression('smile', 1800);
      });

      // 1. Double click untuk membalik kartu
      card.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        card.classList.toggle('is-flipped');
        soundEngine.playClickSound();
      });

      // 2. Tombol Ikon Balik Kartu
      card.querySelectorAll('[data-action="flip"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          card.classList.toggle('is-flipped');
          soundEngine.playClickSound();
        });
      });

      // 3. Buka Full Modal Studio Creative
      const openModalHandler = (e) => {
        if (e) e.stopPropagation();
        openedCreatives.add(cid);
        openCreativeModal(item);
      };

      card.querySelectorAll('.btn-open-creative').forEach((btn) => {
        btn.addEventListener('click', openModalHandler);
      });

      const thumbWrap = card.querySelector('.creative-thumb-wrap');
      if (thumbWrap) {
        thumbWrap.addEventListener('click', (e) => {
          if (e.target.closest('[data-action="flip"]')) return;
          openModalHandler(e);
        });
      }

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (e.target.closest('[data-action="flip"]')) return;
          openModalHandler(e);
        } else if (e.key.toLowerCase() === 'f') {
          card.classList.toggle('is-flipped');
          soundEngine.playClickSound();
        }
      });
    });
  }

  // Developer project modal
  function openProjectModal(proj) {
    if (!codeModal) return;
    document.getElementById('modal-code-badge').textContent = `${proj.code} · ${proj.category}`;
    document.getElementById('modal-title').textContent = proj.title;
    document.getElementById('modal-tagline').textContent = proj.tagline;
    document.getElementById('modal-mission').textContent = proj.story.mission;
    document.getElementById('modal-equip').textContent = proj.story.equipment;
    document.getElementById('modal-obstacle').textContent = proj.story.obstacle;
    document.getElementById('modal-reward').textContent = proj.story.reward;
    document.getElementById('modal-comment').textContent = `Catatan Hyouka: "${proj.characterComment}"`;

    const previewBox = document.getElementById('modal-image-preview');
    if (previewBox) {
      if (proj.video) {
        previewBox.style.display = 'block';
        previewBox.innerHTML = `
          <video src="${proj.video}" controls autoplay loop playsinline poster="${proj.image}" style="width: 100%; max-height: 220px; object-fit: cover; display: block; border-radius: 8px; background: #000;"></video>
        `;
      } else if (proj.image) {
        previewBox.style.display = 'block';
        previewBox.innerHTML = `
          <img id="modal-img" src="${proj.image}" alt="${proj.title}" style="width: 100%; height: 200px; object-fit: cover; display: block; border-radius: 8px;">
        `;
      } else {
        previewBox.style.display = 'none';
      }
    }

    const demoBtn = document.getElementById('modal-demo-btn');
    const codeBtn = document.getElementById('modal-code-btn');
    const openVibeBtn = document.getElementById('modal-open-vibe-btn');
    if (demoBtn) demoBtn.href = proj.demoUrl;
    if (codeBtn) codeBtn.href = proj.githubUrl;

    if (openVibeBtn) {
      openVibeBtn.onclick = () => {
        codeModal.classList.remove('active');
        stopModalVideos();
        if (window.openVibeBlueprint) {
          window.openVibeBlueprint(proj);
        }
      };
    }

    soundEngine.playModalSound();
    codeModal.classList.add('active');
  }

  // Creative studio modal
  function openCreativeModal(item) {
    if (!creativeModal) return;
    document.getElementById('cmodal-code-badge').textContent = `${item.code} · ${item.category}`;
    document.getElementById('cmodal-format-badge').textContent = item.format + ' (' + (item.duration || item.dimensions) + ')';
    document.getElementById('cmodal-title').textContent = item.title;
    document.getElementById('cmodal-tagline').textContent = item.tagline;

    const videoContainer = document.getElementById('cmodal-video-container');
    const designContainer = document.getElementById('cmodal-design-container');
    const highlightBox = document.getElementById('cmodal-highlight-box');
    const actionsBox = document.getElementById('cmodal-actions');

    if (item.type === 'video') {
      if (videoContainer) {
        videoContainer.style.display = 'flex';
        if (item.video || (item.videoUrl && item.videoUrl.endsWith('.mp4'))) {
          const vsrc = item.video || item.videoUrl;
          videoContainer.innerHTML = `
            <video src="${vsrc}" controls autoplay loop playsinline poster="${item.image}" style="width:100%; height:100%; object-fit:contain; background:#000; border-radius:8px;"></video>
          `;
        } else {
          videoContainer.innerHTML = `
            <img id="cmodal-video-poster" src="${item.image}" alt="Thumbnail Video" class="cmodal-poster">
            <div class="creative-play-overlay">
              <span class="play-circle-btn">▶</span>
            </div>
          `;
        }
      }
      if (designContainer) designContainer.style.display = 'none';

      if (highlightBox && item.colorGrade) {
        highlightBox.innerHTML = `
          <div class="cmodal-colorgrade-row">
            <strong>🎨 Color Grading &amp; Profil Warna:</strong>
            <div>Profil: <span style="font-family: var(--font-mono); color: ${item.accent};">${item.colorGrade.profile}</span></div>
            <div>Mood Warna: <em>${item.colorGrade.mood}</em></div>
            <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">${item.colorGrade.note}</div>
          </div>
        `;
      }

      if (actionsBox) {
        actionsBox.innerHTML = `
          <a href="${item.video || item.videoUrl}" target="_blank" rel="noopener" class="btn-hero primary" style="background: ${item.accent};">
            ▶ Buka File Video Asli ↗
          </a>
        `;
      }
    } else {
      if (videoContainer) videoContainer.style.display = 'none';
      if (designContainer) designContainer.style.display = 'flex';
      const designImg = document.getElementById('cmodal-design-img');
      if (designImg) designImg.src = item.mockupImage || item.image;

      if (highlightBox && item.palette) {
        highlightBox.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong>🎨 Sistem Palet Warna &amp; Tipografi:</strong>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              ${item.palette.map(c => `
                <div style="display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.76rem;">
                  <span class="swatch-dot" style="background: ${c}; width: 16px; height: 16px;"></span>
                  <span>${c}</span>
                </div>
              `).join('')}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
              Tipografi: <strong>${(item.typography || []).join(' • ')}</strong>
            </div>
          </div>
        `;
      }

      if (actionsBox) {
        actionsBox.innerHTML = `
          <a href="${item.image}" target="_blank" rel="noopener" class="btn-hero primary" style="background: ${item.accent};">
            🔍 Buka Gambar Resolusi Penuh ↗
          </a>
        `;
      }
    }

    document.getElementById('cmodal-concept').textContent = item.story.concept;
    document.getElementById('cmodal-software').textContent = `${item.software.join(', ')} (Peran: ${item.roles.join(', ')})`;
    document.getElementById('cmodal-techniques').textContent = item.story.techniques;
    document.getElementById('cmodal-deliverable').textContent = item.story.deliverable;
    document.getElementById('cmodal-comment').textContent = `Catatan Hyouka: "${item.characterComment}"`;

    soundEngine.playModalSound();
    creativeModal.classList.add('active');
  }

  // Close modals & stop any active modal video playback
  const stopModalVideos = () => {
    document.querySelectorAll('.project-modal video').forEach((v) => {
      v.pause();
    });
  };

  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    codeModal.classList.remove('active');
    stopModalVideos();
  });
  codeModal.addEventListener('click', (e) => {
    if (e.target === codeModal) {
      codeModal.classList.remove('active');
      stopModalVideos();
    }
  });

  document.getElementById('creative-modal-close')?.addEventListener('click', () => {
    creativeModal.classList.remove('active');
    stopModalVideos();
  });
  creativeModal.addEventListener('click', (e) => {
    if (e.target === creativeModal) {
      creativeModal.classList.remove('active');
      stopModalVideos();
    }
  });

  /**
   * Fitur Unik #1: Efek Kartu Holografik 3D Tilt (Holographic Parallax Sheen)
   */
  function setupCardHolographicTilt(cards) {
    if (!cards) cards = grid.querySelectorAll('.mission-card-3d');
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    cards.forEach((card) => {
      if (card._hasTiltHandler) return;
      card._hasTiltHandler = true;

      let rafId = null;

      const handlePointerMove = (e) => {
        const rect = card.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const isFlipped = card.classList.contains('is-flipped');
        const maxTilt = 10;
        const rotX = (0.5 - y) * maxTilt;
        const rotY = (isFlipped ? (0.5 - x) : (x - 0.5)) * maxTilt;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
          card.style.setProperty('--sheen-x', `${(x * 100).toFixed(1)}%`);
          card.style.setProperty('--sheen-y', `${(y * 100).toFixed(1)}%`);
          card.style.setProperty('--sheen-opacity', '1');
        });
      };

      const handlePointerLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
        card.style.setProperty('--sheen-opacity', '0');
      };

      card.addEventListener('pointermove', handlePointerMove);
      card.addEventListener('pointerleave', handlePointerLeave);
    });
  }

  /**
   * Fitur Unik #2: Tombol Bedah Prompt & Rahasia Vibe (The Vibe Blueprint)
   */
  function setupVibeBlueprintModal() {
    const modal = document.getElementById('vibe-blueprint-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('vibe-blueprint-close-btn');
    const footerCloseBtn = document.getElementById('vb-close-footer-btn');
    const copyBtn = document.getElementById('vb-copy-prompt-btn');
    const caseStudyBtn = document.getElementById('vb-case-study-btn');
    const demoBtn = document.getElementById('vb-demo-btn');

    let currentProject = null;

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function openBlueprint(proj) {
      if (!proj || !proj.vibeBlueprint) return;
      currentProject = proj;

      const codeEl = document.getElementById('vb-code-badge');
      const titleEl = document.getElementById('vb-title');
      const summaryEl = document.getElementById('vb-vibe-summary');
      const buildEl = document.getElementById('vb-build-time');
      const promptEl = document.getElementById('vb-prompt-text');
      const secretEl = document.getElementById('vb-secret-sauce');
      const tagsWrap = document.getElementById('vb-tags-wrap');

      if (codeEl) codeEl.textContent = proj.code;
      if (titleEl) titleEl.textContent = proj.title;
      if (summaryEl) summaryEl.textContent = proj.vibeBlueprint.vibeSummary;
      if (buildEl) buildEl.textContent = proj.vibeBlueprint.buildTime;
      if (promptEl) promptEl.textContent = proj.vibeBlueprint.prompt;
      if (secretEl) secretEl.textContent = proj.vibeBlueprint.secretSauce;

      if (demoBtn) {
        demoBtn.href = proj.demoUrl;
      }

      if (tagsWrap) {
        tagsWrap.innerHTML = (proj.tags || []).map((t) => `<span class="vb-tag-pill">${t}</span>`).join('');
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      soundEngine.playModalSound();
      setCharacterExpression('smile', 2000);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        soundEngine.playClickSound();
        const promptText = document.getElementById('vb-prompt-text')?.textContent || '';
        try {
          await navigator.clipboard.writeText(promptText);
          copyBtn.textContent = '✓ Tersalin!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 Salin Prompt';
            copyBtn.classList.remove('copied');
          }, 2200);
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = promptText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.textContent = '✓ Tersalin!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 Salin Prompt';
            copyBtn.classList.remove('copied');
          }, 2200);
        }
      });
    }

    if (caseStudyBtn) {
      caseStudyBtn.addEventListener('click', () => {
        closeModal();
        if (currentProject) {
          openProjectModal(currentProject);
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Delegated click handler pada .btn-card-vibe di seluruh kartu grid
    grid.addEventListener('click', (e) => {
      const vibeBtn = e.target.closest('.btn-card-vibe');
      if (!vibeBtn) return;
      e.stopPropagation();
      e.preventDefault();
      const pid = vibeBtn.dataset.projectId;
      const proj = projectsData.find((x) => x.id === pid);
      if (proj) {
        openBlueprint(proj);
      }
    });

    window.openVibeBlueprint = openBlueprint;
  }

  // Setup Blueprint Modal
  setupVibeBlueprintModal();

  // Initial render
  renderFilters();
  renderContent();
}

/**
 * 5. Scene 5: Bab 4 (Jejak / Timeline) — Peta Rel Stasiun Perjalanan & Tur Autoplay (Fitur Unik #1)
 */
function renderTimeline() {
  const container = document.getElementById('timeline-nodes');
  const thoughtEl = document.getElementById('timeline-thought-text');
  const progressLine = document.getElementById('metro-track-progress');
  const stationDots = document.querySelectorAll('.metro-dot');
  const autoplayBtn = document.getElementById('btn-autoplay-timeline');
  if (!container) return;

  container.innerHTML = timelineData
    .map(
      (item, idx) => `
      <div class="timeline-node ${idx === 0 ? 'expanded active-station' : ''}" data-stop="${item.id}" data-idx="${idx}" tabindex="0">
        <div class="timeline-dot">
          <span class="station-inner-dot"></span>
        </div>
        <div class="timeline-card">
          <div class="timeline-card-head">
            <div class="timeline-head-meta">
              <span class="timeline-station-code">${item.stationCode}</span>
              <span class="timeline-year">${item.year}</span>
            </div>
            <span class="timeline-badge-pill">${item.badge}</span>
          </div>
          <h3 class="timeline-role">${item.role}</h3>
          <div class="timeline-org">${item.organization}</div>
          <div class="timeline-station-sub">🚉 ${item.stationName}</div>
          <p class="timeline-summary">${item.summary}</p>
          <div class="timeline-detail">
            <p>${item.detail}</p>
            <div class="timeline-loot-box">
              <span class="loot-icon">📦</span>
              <span class="loot-title">${item.lootTitle}</span>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  let activeIdx = 0;
  let autoplayInterval = null;

  function selectStation(idx, isAutoplay = false) {
    if (idx < 0 || idx >= timelineData.length) return;
    activeIdx = idx;
    const item = timelineData[idx];

    container.querySelectorAll('.timeline-node').forEach((n, i) => {
      n.classList.toggle('expanded', i === idx);
      n.classList.toggle('active-station', i === idx);
    });

    stationDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });

    if (progressLine) {
      const pct = ((idx + 1) / timelineData.length) * 100;
      progressLine.style.width = `${pct}%`;
    }

    if (thoughtEl && item) {
      thoughtEl.textContent = `Hyouka: "${item.thought}"`;
    }

    if (isAutoplay) {
      soundEngine.playStationChime();
      setCharacterExpression('smile', 2400);
    } else {
      soundEngine.playClickSound();
    }
  }

  container.querySelectorAll('.timeline-node').forEach((node, idx) => {
    node.addEventListener('click', () => {
      stopAutoplay();
      selectStation(idx, false);
    });
  });

  stationDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      const idx = parseInt(dot.dataset.stopIdx, 10);
      selectStation(idx, false);
    });
  });

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
      if (autoplayBtn) {
        autoplayBtn.innerHTML = '<span class="btn-icon">⚡</span><span>Putar Rute Perjalanan</span>';
        autoplayBtn.classList.remove('is-playing');
      }
    }
  }

  function startAutoplay() {
    if (autoplayBtn) {
      autoplayBtn.innerHTML = '<span class="btn-icon">⏸️</span><span>Jeda Rute Perjalanan</span>';
      autoplayBtn.classList.add('is-playing');
    }
    selectStation(activeIdx, true);

    autoplayInterval = setInterval(() => {
      let nextIdx = (activeIdx + 1) % timelineData.length;
      selectStation(nextIdx, true);
      if (nextIdx === timelineData.length - 1) {
        setTimeout(() => stopAutoplay(), 3000);
      }
    }, 3200);
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      if (autoplayInterval) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // Set initial station
  selectStation(0, false);
}

/**
 * 5b. Epilog: Paspor / Tiket Ekspedisi Pengelana Digital (Fitur Unik #4)
 */
function renderBoardingPass() {
  const passCard = document.getElementById('vibe-pass-card');
  if (!passCard) return;

  const visitorNameEl = document.getElementById('pass-visitor-name');
  const scenesCountEl = document.getElementById('pass-scenes-count');
  const missionsCountEl = document.getElementById('pass-missions-count');
  const copyBtn = document.getElementById('btn-copy-pass');

  const visitorName = localStorage.getItem('vibe_visitor_name') || 'Pengelana Senja';
  if (visitorNameEl) visitorNameEl.textContent = visitorName;

  const totalScenes = document.querySelectorAll('.story-scene').length || 6;
  if (scenesCountEl) scenesCountEl.textContent = `${totalScenes} / ${totalScenes} Halte`;
  if (missionsCountEl) missionsCountEl.textContent = `${projectsData.length} / ${projectsData.length} Misi`;

  if (copyBtn) {
    copyBtn.onclick = async () => {
      soundEngine.playClickSound();
      const summaryText = [
        '🎫 --- TIKET EKSPEDISI D:\\VIBE CODING ---',
        `👤 Pengelana : ${visitorName}`,
        '🚀 Kelas     : First Class · Vibe Architect',
        '🚉 Rute      : Prolog ➔ Bab 1 (Siapa Aku) ➔ Bab 2 (Keahlian) ➔ Bab 3 (Karya) ➔ Bab 4 (Jejak) ➔ Epilog',
        `📦 Portofolio: ${projectsData.length} Proyek WebGL, AI & Data S.Stat Terverifikasi`,
        '✨ Status    : Stempel Resmi Terverifikasi 2026',
        '🔗 Jelajahi  : http://localhost:3001/'
      ].join('\n');

      try {
        await navigator.clipboard.writeText(summaryText);
        copyBtn.textContent = '✓ Tiket Tersalin!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Salin Tiket Paspor';
          copyBtn.classList.remove('copied');
        }, 2400);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = summaryText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = '✓ Tiket Tersalin!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Salin Tiket Paspor';
          copyBtn.classList.remove('copied');
        }, 2400);
      }
    };
  }
}

/**
 * 6. Navigasi Scene & Koreografi Crop/Zoom Karakter Sesuai Tabel Bagian 4 Cetak Biru
 */
function setupSceneTransitions() {
  const container = document.getElementById('story-scroll-container');
  const scenes = document.querySelectorAll('.story-scene');
  const dotBtns = document.querySelectorAll('.dot-btn');
  const visitedScenes = new Set(['scene-prolog']);

  function setActiveScene(id) {
    if (!id || document.body.dataset.scene === id) return;
    document.body.dataset.scene = id;
    visitedScenes.add(id);

    dotBtns.forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.target === id);
    });
    const navLinks = document.querySelectorAll('.nav-quick-links a');
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
    const mobileLinks = document.querySelectorAll('.mobile-nav-item');
    mobileLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });

    // Perilaku khusus per scene sesuai cetak biru
    if (id === 'scene-skills') {
      animateSkillBars();
    } else if (id === 'scene-contact') {
      // Bab 5: ekspresi melunak (mata sedikit menyipit)
      setCharacterExpression('smile', 2500);
    } else if (id === 'scene-epilog') {
      // Epilog: mata Hyouka terpejam pelan
      setCharacterExpression('blink');
      renderEpilogAchievementsSummary();
    } else if (id === 'scene-prolog') {
      setCharacterExpression('base');
    }

    // Achievement Penjelajah: jika sudah menelusuri semua bab
    if (visitedScenes.size >= scenes.length) {
      triggerAchievement('explorer');
      renderEpilogAchievementsSummary();
    }
  }

  // Pelacakan scene yang paling dominan di layar saat scrolling
  const sceneRatios = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        sceneRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let maxRatio = 0;
      let dominantSceneId = null;
      sceneRatios.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          dominantSceneId = id;
        }
      });

      if (dominantSceneId && maxRatio >= 0.15) {
        setActiveScene(dominantSceneId);
      }
    },
    {
      root: container || null,
      threshold: [0, 0.15, 0.25, 0.35, 0.5, 0.65, 0.8, 1.0]
    }
  );

  scenes.forEach((scene) => observer.observe(scene));

  // Sambungkan klik tautan navigasi atas ke perpindahan bab
  document.querySelectorAll('.nav-quick-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        soundEngine.playClickSound();
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          setActiveScene(targetId);
        }
      }
    });
  });

  dotBtns.forEach((dot) => {
    dot.addEventListener('click', () => {
      soundEngine.playClickSound();
      const targetId = dot.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        setActiveScene(targetId);
      }
    });
  });

  // Sambungkan menu laci mobile (Bab Selector)
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileCloseBtn = document.getElementById('mobile-nav-close-btn');

  function openMobileNav() {
    mobileDrawer?.classList.add('open');
    mobileBackdrop?.classList.add('open');
  }

  function closeMobileNav() {
    mobileDrawer?.classList.remove('open');
    mobileBackdrop?.classList.remove('open');
  }

  mobileMenuBtn?.addEventListener('click', () => {
    soundEngine.playClickSound();
    if (mobileDrawer?.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  mobileCloseBtn?.addEventListener('click', () => {
    soundEngine.playClickSound();
    closeMobileNav();
  });

  mobileBackdrop?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        soundEngine.playClickSound();
        closeMobileNav();
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          setActiveScene(targetId);
        }
      }
    });
  });
}


/**
 * 7. Ringkasan Achievement & Petunjuk Samar Easter Egg di Epilog
 */
function renderEpilogAchievementsSummary() {
  const grid = document.getElementById('epilog-achievements-preview');
  const hintBox = document.getElementById('epilog-easter-egg-hint');
  if (!grid) return;

  grid.innerHTML = achievementsList
    .map((a) => {
      const unlocked = achievementManager.isUnlocked(a.id);
      return `
        <div class="epilog-badge-pill ${unlocked ? 'unlocked' : 'locked'}" title="${
        unlocked ? a.desc : 'Petunjuk: ' + a.hint
      }">
          <span class="b-icon">${unlocked ? a.icon : '🔒'}</span>
          <span class="b-name">${unlocked ? a.title : '???'}</span>
        </div>
      `;
    })
    .join('');

  if (hintBox) {
    const nextLocked = achievementsList.find((a) => !achievementManager.isUnlocked(a.id));
    if (nextLocked) {
      hintBox.textContent = `Petunjuk rahasia yang belum ditemukan: "${nextLocked.hint}"`;
    } else {
      hintBox.textContent = 'Selamat! Seluruh rahasia dan pencapaian di perjalanan ini telah kamu temukan.';
    }
  }
}

/**
 * 8. Animasi Gulungan CV Terbuka (Bab 5: Unduh CV)
 */
function setupCvScrollModal() {
  const openBtn = document.getElementById('btn-open-cv-scroll');
  const modal = document.getElementById('cv-scroll-modal');
  const closeBtn = document.getElementById('cv-scroll-close');

  if (openBtn && modal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      soundEngine.playModalSound();
      modal.classList.add('active');
    });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/**
 * 9. Tombol Rahasia Tersembunyi di Latar (Easter Egg Bagian 9)
 */
function setupSecretEasterEggButton(dialogPlayer) {
  const secretBtn = document.getElementById('hidden-secret-trigger');
  if (!secretBtn) return;

  secretBtn.addEventListener('click', () => {
    soundEngine.playAchievementJingle();
    triggerAchievement('secret_found');
    setCharacterExpression('smile', 4000);
    if (dialogPlayer) {
      dialogPlayer.typeText(easterEggDialogues.secretButton);
    }
    const toast = document.getElementById('mood-toast');
    if (toast) {
      toast.textContent = easterEggDialogues.secretButton;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 5000);
    }
  });
}

/**
 * 10. Pengubah Suasana (Terang -> Malam -> Hujan)
 */
function setupMoodSwitcher(dialogPlayer) {
  const avatarBtn = document.getElementById('avatar-mood-btn');
  const moodLabel = document.getElementById('mood-current-label');
  const moodToast = document.getElementById('mood-toast');
  const moods = ['light', 'night', 'rain'];
  const moodNames = { light: 'Terang', night: 'Malam', rain: 'Hujan' };

  let currentMoodIdx = 0;
  const visitedMoods = new Set(['light']);

  try {
    const saved = localStorage.getItem('amine_theme');
    if (saved && moods.includes(saved)) {
      currentMoodIdx = moods.indexOf(saved);
      document.body.dataset.theme = saved;
      visitedMoods.add(saved);
      if (moodLabel) moodLabel.textContent = moodNames[saved];
    }
  } catch (e) {}

  if (!avatarBtn) return;

  avatarBtn.addEventListener('click', () => {
    currentMoodIdx = (currentMoodIdx + 1) % moods.length;
    const mood = moods[currentMoodIdx];
    document.body.dataset.theme = mood;
    visitedMoods.add(mood);

    soundEngine.setMood(mood);
    soundEngine.playClickSound();

    if (moodLabel) moodLabel.textContent = moodNames[mood];

    try {
      localStorage.setItem('amine_theme', mood);
    } catch (e) {}

    if (moodToast) {
      moodToast.textContent = moodComments[mood];
      moodToast.classList.add('show');
      setTimeout(() => moodToast.classList.remove('show'), 3200);
    }

    if (dialogPlayer) {
      dialogPlayer.typeText(moodComments[mood]);
    }

    if (visitedMoods.size === 3) {
      triggerAchievement('mood_changer');
    }
  });
}

/**
 * 11. Mode Ringkas (Untuk Recruiter yang Terburu-buru: Info Penting dalam 10 Detik)
 */
function renderCompactRecruiterView() {
  const container = document.getElementById('compact-recruiter-content');
  if (!container) return;

  const allSkills = [
    ...skillsData.mainWeapons,
    ...skillsData.secondaryWeapons,
    ...skillsData.secretJutsu
  ];

  container.innerHTML = `
    <div class="compact-header-card">
      <img src="img/ui/avatar-eye.png" alt="Hyouka" class="compact-avatar">
      <div class="compact-bio">
        <span class="compact-tag">MODE RINGKAS — RINGKASAN EKSEKUTIF 10 DETIK</span>
        <h1>${siteConfig.fullName}</h1>
        <p>${whoAmIDialogues[0].text} ${whoAmIDialogues[2].text}</p>
        <div class="compact-quick-links">
          <a href="mailto:${siteConfig.email}" class="btn-hero primary">${siteConfig.email}</a>
          <a href="${siteConfig.github}" target="_blank" rel="noopener" class="btn-hero secondary">GitHub ↗</a>
          <a href="${siteConfig.linkedin}" target="_blank" rel="noopener" class="btn-hero secondary">LinkedIn ↗</a>
        </div>
      </div>
    </div>

    <div class="compact-grid-two">
      <section class="compact-section">
        <h2>Keahlian & Teknologi</h2>
        <div class="compact-skills-list">
          ${allSkills
            .map(
              (s) => `
            <div class="compact-skill-pill">
              <strong>${s.icon} ${s.name}</strong>
              <span>${s.level} · ${s.meta}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="compact-section">
        <h2>Jejak Pengalaman</h2>
        <div class="compact-timeline-list">
          ${timelineData
            .map(
              (t) => `
            <div class="compact-tl-item">
              <span class="tl-y">${t.year}</span>
              <strong>${t.role}</strong> — <em>${t.organization}</em>
              <p>${t.summary}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    </div>

    <section class="compact-section">
      <h2>Karya & Misi Pilihan</h2>
      <div class="compact-projects-grid">
        ${projectsData
          .map(
            (p) => `
          <div class="compact-proj-card">
            <div class="cp-head">
              <span>${p.code} · ${p.date}</span>
              <span class="cp-cat">${p.category}</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.tagline}</p>
            <p class="cp-reward"><strong>Hasil:</strong> ${p.story.reward}</p>
            <div class="mission-tags">${p.tags
              .map((tag) => `<span class="tag-pill">${tag}</span>`)
              .join('')}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}

function setupCompactMode() {
  const toggleBtn = document.getElementById('compact-toggle-btn');
  const mobilePerfBtn = document.getElementById('mobile-perf-toggle-btn');
  const mobilePerfBadge = document.getElementById('mobile-perf-badge');

  function updatePerfUI(isLite) {
    document.body.classList.toggle('lite-mode', isLite);
    document.body.classList.toggle('mode-compact', isLite);

    if (toggleBtn) {
      toggleBtn.classList.toggle('active', isLite);
      toggleBtn.title = isLite
        ? 'Mode Performa: Aktif (Super Enteng & Hemat Baterai)'
        : 'Mode Performa: Nonaktif (Efek Visual Novel Lengkap)';
    }

    if (mobilePerfBtn) {
      mobilePerfBtn.classList.toggle('active', isLite);
    }
    if (mobilePerfBadge) {
      mobilePerfBadge.textContent = isLite ? 'ON ⚡' : 'OFF';
      mobilePerfBadge.classList.toggle('active', isLite);
    }

    const fluidCanvas = document.querySelector('[data-fluid-cursor]');
    if (fluidCanvas) {
      fluidCanvas.style.display = isLite ? 'none' : 'block';
    }
  }

  // Cek preferensi tersimpan atau auto-detect HP kecil (<= 600px)
  const savedPref = localStorage.getItem('hyouka_lite_mode');
  const isSmallDevice = window.innerWidth <= 600;
  const initialLite = savedPref === 'true' || (savedPref === null && isSmallDevice);

  updatePerfUI(initialLite);

  function togglePerf() {
    soundEngine.playClickSound();
    const currentlyLite = document.body.classList.contains('lite-mode');
    const nextState = !currentlyLite;
    updatePerfUI(nextState);

    try {
      localStorage.setItem('hyouka_lite_mode', nextState ? 'true' : 'false');
    } catch (e) {}

    const toast = document.getElementById('mood-toast');
    if (toast) {
      toast.textContent = nextState
        ? '⚡ Mode Performa Aktif: Efek grafis berat dinonaktifkan agar super enteng & hemat baterai.'
        : '✨ Mode Sinematik Penuh: Efek grafis visual novel lengkap diaktifkan.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', togglePerf);
  }
  if (mobilePerfBtn) {
    mobilePerfBtn.addEventListener('click', togglePerf);
  }
}

/**
 * 12. Tombol Mute Audio
 */
function setupAudioToggle() {
  const btn = document.getElementById('audio-mute-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isMuted = soundEngine.toggleMute();
    btn.innerHTML = isMuted ? '<span class="ctrl-icon">🔇</span>' : '<span class="ctrl-icon">🔊</span>';
    btn.title = isMuted ? 'Audio Latar: Senyap (Klik untuk Nyalakan)' : 'Audio Latar: Aktif (Klik untuk Matikan)';
    btn.classList.toggle('active', !isMuted);
  });
}

/**
 * 13. Konami Code Easter Egg (↑↑↓↓←→←→BA)
 */
function setupKonamiCode(dialogPlayer) {
  const sequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let seqIdx = 0;

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === sequence[seqIdx].toLowerCase()) {
      seqIdx++;
      if (seqIdx === sequence.length) {
        seqIdx = 0;
        triggerAchievement('secret_found');
        setCharacterExpression('smile', 4500);
        if (dialogPlayer) {
          dialogPlayer.typeText(easterEggDialogues.konami);
        }
        const toast = document.getElementById('mood-toast');
        if (toast) {
          toast.textContent = easterEggDialogues.konami;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 4500);
        }
      }
    } else {
      seqIdx = 0;
    }
  });
}
