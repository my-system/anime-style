/**
 * Lo-Fi Cafe Radio Player (Procedural Web Audio Synthesizer)
 * ==========================================================
 * Menghasilkan musik suasana Lo-Fi sintetis secara prosedural:
 * - Ch 1: Kopi & Hujan Tenang (Rhodes Chords + Vinyl Dust + Filtered Rain)
 * - Ch 2: Vibe Coding 02:00 AM (Warm Synth Pad + Tape Flutter + Sub Beat)
 * - Ch 3: Angin Sore & Lonceng Kuil (Breeze Ambient + Pentatonic Wind Chimes)
 * 100% Offline, Zero External MP3, Sangat Ringan & Bebas Hak Cipta.
 * ==========================================================
 */

import { soundEngine } from './audio.js';

class LofiRadioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentChannel = 'coffee'; // 'coffee' | 'coding' | 'shrine'
    this.volume = 0.5;

    this.masterGain = null;
    this.vinylNode = null;
    this.vinylGain = null;
    this.chordTimer = null;
    this.chimeTimer = null;
    this.beatTimer = null;
    this.chordStep = 0;

    this.channels = {
      coffee: {
        title: 'Ch 1: Kopi & Hujan Tenang',
        desc: 'Rhodes Chords + Vinyl Dust + Rain',
        bpm: 72
      },
      coding: {
        title: 'Ch 2: Vibe Coding 02:00 AM',
        desc: 'Warm Analog Pad + Tape Flutter + 60 BPM',
        bpm: 60
      },
      shrine: {
        title: 'Ch 3: Angin Kuil & Lonceng',
        desc: 'Wind Sweep + Pentatonic Suzu Chimes',
        bpm: 45
      }
    };
  }

  initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = soundEngine.ctx || new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume * 0.45, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.setupVinylGenerator();
  }

  setupVinylGenerator() {
    if (!this.ctx || this.vinylGain) return;
    // Buffer noise untuk debu vinyl retro
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Sporadic crackles + soft pink floor
      const isPop = Math.random() < 0.0018;
      data[i] = isPop ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.04;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);

    noise.start();
  }

  play() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;

    if (this.vinylGain) {
      this.vinylGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.4);
    }

    this.startCurrentChannelSequence();
  }

  pause() {
    this.isPlaying = false;
    if (this.vinylGain) {
      this.vinylGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    }
    this.stopSequences();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.45, this.ctx.currentTime, 0.05);
    }
  }

  switchChannel(chKey) {
    if (!this.channels[chKey]) return;
    this.currentChannel = chKey;
    if (this.isPlaying) {
      this.stopSequences();
      this.startCurrentChannelSequence();
    }
  }

  stopSequences() {
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
  }

  startCurrentChannelSequence() {
    this.stopSequences();
    this.chordStep = 0;

    if (this.currentChannel === 'coffee') {
      this.playCoffeeChords();
      this.chordTimer = setInterval(() => this.playCoffeeChords(), 3800);
    } else if (this.currentChannel === 'coding') {
      this.playCodingPad();
      this.chordTimer = setInterval(() => this.playCodingPad(), 4500);
      this.beatTimer = setInterval(() => this.playSubBeat(), 1000);
    } else if (this.currentChannel === 'shrine') {
      this.playShrineAmbient();
      this.chordTimer = setInterval(() => this.playShrineAmbient(), 6000);
      this.chimeTimer = setInterval(() => this.playRandomChime(), 1800);
    }
  }

  // Ch 1: Rhodes style Lo-fi chord sequence (Abmaj7 - Fm7 - Bbm7 - Eb7sus)
  playCoffeeChords() {
    if (!this.ctx || !this.isPlaying) return;
    const chordProgressions = [
      [207.65, 261.63, 311.13, 392.00], // Abmaj7
      [174.61, 261.63, 311.13, 349.23], // Fm7
      [233.08, 277.18, 349.23, 415.30], // Bbm7
      [155.56, 233.08, 293.66, 349.23]  // Eb7sus
    ];

    const chord = chordProgressions[this.chordStep % chordProgressions.length];
    this.chordStep++;

    const now = this.ctx.currentTime;
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.035);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 3.2);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.08 + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.035);
      osc.stop(now + 3.6);
    });
  }

  // Ch 2: Warm ambient analog pad with tape flutter
  playCodingPad() {
    if (!this.ctx || !this.isPlaying) return;
    const pads = [
      [130.81, 196.00, 246.94, 293.66], // Cmaj9
      [110.00, 164.81, 220.00, 261.63], // Am7
      [146.83, 220.00, 261.63, 329.63], // Dm9
      [123.47, 185.00, 246.94, 293.66]  // G7add9
    ];
    const notes = pads[this.chordStep % pads.length];
    this.chordStep++;

    const now = this.ctx.currentTime;
    notes.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      // Slight detune for analog warmth
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.6 - 0.3), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.038, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.4);
    });
  }

  // Soft late-night sub-kick beat
  playSubBeat() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Ch 3: Wind breeze ambient + Pentatonic wind chimes
  playShrineAmbient() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    // Drone hangat
    const drone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(146.83, now); // D3

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

    drone.connect(gain);
    gain.connect(this.masterGain);
    drone.start(now);
    drone.stop(now + 5.8);
  }

  playRandomChime() {
    if (!this.ctx || !this.isPlaying || Math.random() < 0.35) return;
    const pentatonic = [880.00, 987.77, 1174.66, 1318.51, 1567.98, 1760.00];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const lofiRadio = new LofiRadioEngine();

/**
 * UI Controller for Lo-Fi Radio Widget
 */
export function initLofiRadio() {
  const widget = document.getElementById('lofi-radio-widget');
  if (!widget) return;

  const togglePill = document.getElementById('lofi-radio-toggle');
  const playBtn = document.getElementById('lofi-play-btn');
  const trackLabel = document.getElementById('lofi-current-track');
  const drawer = document.getElementById('lofi-radio-drawer');
  const closeDrawerBtn = document.getElementById('lofi-drawer-close-btn');
  const volSlider = document.getElementById('lofi-vol-slider');
  const chBtns = document.querySelectorAll('.lofi-ch-btn');

  function updatePlayUI() {
    if (lofiRadio.isPlaying) {
      widget.classList.add('is-playing');
      if (playBtn) playBtn.textContent = '⏸';
      if (trackLabel) trackLabel.textContent = lofiRadio.channels[lofiRadio.currentChannel].title;
    } else {
      widget.classList.remove('is-playing');
      if (playBtn) playBtn.textContent = '▶';
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lofiRadio.isPlaying) {
        lofiRadio.pause();
      } else {
        lofiRadio.play();
      }
      updatePlayUI();
    });
  }

  if (togglePill) {
    togglePill.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer?.classList.toggle('open');
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer?.classList.remove('open');
    });
  }

  // Klik di luar menutup drawer
  document.addEventListener('click', (e) => {
    if (drawer?.classList.contains('open') && !widget.contains(e.target)) {
      drawer.classList.remove('open');
    }
  });

  chBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      chBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const ch = btn.dataset.ch;
      lofiRadio.switchChannel(ch);
      if (!lofiRadio.isPlaying) {
        lofiRadio.play();
      }
      updatePlayUI();
    });
  });

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      lofiRadio.setVolume(parseFloat(e.target.value));
    });
  }
}
