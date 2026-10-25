/**
 * Visual Novel Dialogue System
 * Menghadirkan efek mesin tik huruf demi huruf, riwayat dialog, dan navigasi pilihan
 */

import { soundEngine } from './audio.js';

export class DialogPlayer {
  constructor(containerEl, onComplete = null) {
    this.container = containerEl;
    this.onComplete = onComplete;
    this.isTyping = false;
    this.currentTimeout = null;
  }

  typeText(text, speed = 28) {
    return new Promise((resolve) => {
      this.clear();
      this.isTyping = true;
      let index = 0;

      const typeNextChar = () => {
        if (index < text.length) {
          this.container.textContent += text.charAt(index);
          if (index % 2 === 0 && text.charAt(index) !== ' ') {
            soundEngine.playTypeSound();
          }
          index++;
          this.currentTimeout = setTimeout(typeNextChar, speed);
        } else {
          this.isTyping = false;
          resolve();
          if (this.onComplete) this.onComplete();
        }
      };

      typeNextChar();
    });
  }

  instantComplete(fullText) {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.container.textContent = fullText;
    this.isTyping = false;
  }

  clear() {
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.container.textContent = '';
    this.isTyping = false;
  }
}
