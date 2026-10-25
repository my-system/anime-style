/**
 * Audio Engine (Bab 6 & 8: Musik Latar 3 Suasana & Efek Suara)
 * - Mode Terang: Piano Tenang
 * - Mode Malam: Lo-fi Hangat
 * - Mode Hujan: Rintik Hujan Berkelanjutan + Piano Lembut
 * - Otomatis jeda saat tab browser tidak aktif (visibilitychange)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.isMuted = false;
    this.currentMood = 'light';
    this.masterGain = null;
    this.rainNode = null;
    this.rainGain = null;
    this.loopTimer = null;
    this.stepIdx = 0;

    // Otomatis hentikan/lanjutkan saat tab pindah
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this.enabled) return;
      if (document.hidden) {
        this.ctx.suspend().catch(() => {});
      } else if (!this.isMuted) {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  init(enableSound = true) {
    if (!enableSound) {
      this.enabled = false;
      this.isMuted = true;
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.enabled = true;
      this.isMuted = false;
      this.setupRainGenerator();
      this.startMoodMusicLoop();
    } catch (e) {
      console.warn('Web Audio API tidak didukung:', e);
      this.enabled = false;
    }
  }

  setMood(mood) {
    this.currentMood = mood;
    if (!this.enabled || !this.ctx || !this.rainGain) return;
    const now = this.ctx.currentTime;
    // Aktifkan desau hujan lembut hanya pada mode 'rain'
    if (mood === 'rain' && !this.isMuted) {
      this.rainGain.gain.setTargetAtTime(0.055, now, 0.8);
    } else {
      this.rainGain.gain.setTargetAtTime(0.0001, now, 0.5);
    }
  }

  toggleMute() {
    if (!this.enabled) {
      this.init(true);
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0001 : 0.24, now, 0.15);
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(
          !this.isMuted && this.currentMood === 'rain' ? 0.055 : 0.0001,
          now,
          0.3
        );
      }
    }
    return this.isMuted;
  }

  // Generator desau hujan alami dari Brown/Pink Noise
  setupRainGenerator() {
    if (!this.ctx || this.rainNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 1.8;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 950;
      filter.Q.value = 0.6;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      noise.start();
      this.rainNode = noise;
    } catch (e) {}
  }

  // Musik latar sesuai suasana (Piano tenang, Lo-fi, Hujan & Piano)
  startMoodMusicLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);

    const progressions = {
      light: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ],
      night: [
        [207.65, 261.63, 311.13, 392.00], // Abmaj7 lo-fi
        [196.00, 233.08, 293.66, 349.23], // Gm7
        [174.61, 207.65, 261.63, 311.13], // Fm7
        [155.56, 207.65, 246.94, 311.13]  // Ebmaj7
      ],
      rain: [
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [233.08, 293.66, 349.23, 440.00], // Bbmaj7
        [220.00, 261.63, 329.63, 440.00]  // Am
      ]
    };

    const playChordStep = () => {
      if (!this.enabled || this.isMuted || !this.ctx || document.hidden) return;
      const set = progressions[this.currentMood] || progressions.light;
      const chord = set[this.stepIdx % set.length];
      this.stepIdx++;

      chord.forEach((freq, i) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = this.ctx.currentTime + i * (this.currentMood === 'night' ? 0.14 : 0.28);

          osc.type = this.currentMood === 'night' ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, start);

          const peak = this.currentMood === 'night' ? 0.018 : 0.016;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(peak, start + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.2);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(start);
          osc.stop(start + 3.25);
        } catch (e) {}
      });
    };

    playChordStep();
    this.loopTimer = setInterval(playChordStep, 4800);
  }

  // Efek suara ketikan dialog
  playTypeSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 + Math.random() * 140, now);

      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Efek klik tombol
  playClickSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.055);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {}
  }

  // Efek buka modal / whoosh lembut
  playModalSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.21);
    } catch (e) {}
  }

  // Efek bar skill terisi
  playBarFillSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const notes = [329.63, 392.00, 523.25];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch (e) {}
  }

  // Jingle Achievement terbuka
  playAchievementJingle() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.045, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.42);
      });
    } catch (e) {}
  }

  // Efek mekanis gagang pintu kuningan berputar ("clack")
  playDoorLatchSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Klik metalik gagang
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(920, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.045);
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.055);

      // 2. Ketukan kunci kedua ("clack")
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(420, now + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.13);
      gain2.gain.setValueAtTime(0.07, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.15);
    } catch (e) {}
  }

  // Efek magis saat pintu Suzume terbuka & cahaya Tokoyo memancar
  playDoorOpenChime() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      // Kord kristal mengawang ala Radwimps / Suzume (Fmaj9 / Em7 shimmer)
      const notes = [293.66, 440.00, 554.37, 659.25, 880.00, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.11;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.032, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.45);
      });
    } catch (e) {}
  }

  // 1. Denting Kedatangan Stasiun Kereta Shinkansen (Bab 4: Jejak / Metro Trail)
  playStationChime() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 659.25, t: 0.00, d: 0.6 }, // E5
        { f: 880.00, t: 0.14, d: 0.7 }, // A5
        { f: 1108.73, t: 0.28, d: 0.9 }, // C#6
        { f: 1318.51, t: 0.44, d: 1.2 }  // E6
      ];
      notes.forEach((n) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + n.t;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, st);
        gain.gain.setValueAtTime(0.0001, st);
        gain.gain.linearRampToValueAtTime(0.045, st + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + n.d);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(st);
        osc.stop(st + n.d + 0.05);
      });
    } catch (e) {}
  }

  // 2. Denting Lonceng Kuil Jepang (Suzu Bell - Bab 5: Surat & Dinding Ofuda)
  playSuzuBellSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Resonansi ganda kuningan (brass) Suzu
      const harmonics = [1174.66, 1760.0, 2349.32, 3520.0];
      harmonics.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 8 - 4), now);
        const amp = 0.038 / (idx + 1);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.65);
      });

      // Shimmer rattle dari biji logam di dalam lonceng Suzu
      for (let i = 0; i < 3; i++) {
        const t = now + 0.04 * (i + 1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2800 + i * 200, t);
        gain.gain.setValueAtTime(0.015, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.18);
      }
    } catch (e) {}
  }

  // 3. Ketukan Cap Segel Hanko Merah (Inkan Stamp - Bab 5: Surat & Dinding Ofuda)
  playHankoStampSound() {
    if (!this.enabled || this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Hentakan kayu padat stempel ("thump")
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);

      // 2. Tekanan kertas washi ("pap")
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'sine';
      snap.frequency.setValueAtTime(800, now + 0.01);
      snap.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      snapGain.gain.setValueAtTime(0.045, now + 0.01);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      snap.connect(snapGain);
      snapGain.connect(this.masterGain);
      snap.start(now + 0.01);
      snap.stop(now + 0.07);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
