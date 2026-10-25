/**
 * Achievements System Manager
 * Menyimpan status ke localStorage dan memunculkan toast & modal interaktif
 */

import { achievementsList } from '../data/achievements.js';
import { soundEngine } from './audio.js';

class AchievementManager {
  constructor() {
    this.unlocked = new Set();
    this.toastEl = null;
    this.modalEl = null;
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('amine_achievements');
      if (saved) {
        JSON.parse(saved).forEach(id => this.unlocked.add(id));
      }
    } catch (e) {
      console.warn("localStorage unavailable for achievements", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('amine_achievements', JSON.stringify([...this.unlocked]));
    } catch (e) {}
  }

  unlock(id) {
    if (this.unlocked.has(id)) return;
    const item = achievementsList.find(a => a.id === id);
    if (!item) return;

    this.unlocked.add(id);
    this.saveState();
    this.showToast(item);
    this.updateCounterBadges();
    soundEngine.playAchievementJingle();
  }

  showToast(item) {
    if (!this.toastEl) {
      this.toastEl = document.getElementById('achievement-toast');
    }
    if (!this.toastEl) return;

    const iconEl = this.toastEl.querySelector('.achieve-icon');
    const titleEl = this.toastEl.querySelector('.achieve-title');
    const descEl = this.toastEl.querySelector('.achieve-desc');

    if (iconEl) iconEl.textContent = item.icon;
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc;

    this.toastEl.classList.add('show');
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 4500);
  }

  updateCounterBadges() {
    const badgeCountEls = document.querySelectorAll('.achieve-counter-num');
    const count = this.unlocked.size;
    badgeCountEls.forEach(el => {
      el.textContent = count;
    });
  }

  getUnlockedCount() {
    return this.unlocked.size;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  renderModal() {
    const container = document.getElementById('achievements-modal-list');
    const progressFill = document.getElementById('achieve-modal-progress');
    const progressLabel = document.getElementById('achieve-modal-label');
    if (!container) return;

    const total = achievementsList.length;
    const count = this.unlocked.size;
    const pct = Math.round((count / total) * 100);

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `${count} / ${total} Pencapaian Terbuka (${pct}%)`;

    container.innerHTML = achievementsList.map(item => {
      const unlocked = this.isUnlocked(item.id);
      return `
        <div class="achieve-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="achieve-card-icon">${unlocked ? item.icon : '🔒'}</div>
          <div class="achieve-card-info">
            <div class="achieve-card-header">
              <span class="achieve-card-title">${unlocked ? item.title : '??? (Terkunci)'}</span>
              <span class="achieve-status-badge">${unlocked ? 'Terbuka' : 'Misteri'}</span>
            </div>
            <p class="achieve-card-desc">${unlocked ? item.desc : item.hint}</p>
          </div>
        </div>
      `;
    }).join('');
  }
}

export const achievementManager = new AchievementManager();

export function triggerAchievement(id) {
  achievementManager.unlock(id);
}

export function initAchievementsModal() {
  const openBtn = document.getElementById('btn-open-achievements');
  const modal = document.getElementById('achievements-modal');
  const closeBtn = document.getElementById('achievements-modal-close');

  achievementManager.updateCounterBadges();

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      achievementManager.renderModal();
      soundEngine.playClickSound();
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
