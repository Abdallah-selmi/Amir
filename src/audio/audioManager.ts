type BirthdayNote = {
  freq: number | null;
  beats: number;
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isUnlocked = false;
  private unlockPromise: Promise<void> | null = null;
  private scheduleTimer: ReturnType<typeof setTimeout> | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private nextNoteTime = 0;
  private melodyIndex = 0;

  private readonly beatDuration = 0.34;

  private readonly melody: BirthdayNote[] = [
    { freq: 392.00, beats: 0.5 },
    { freq: 392.00, beats: 0.5 },
    { freq: 440.00, beats: 1 },
    { freq: 392.00, beats: 1 },
    { freq: 523.25, beats: 1 },
    { freq: 493.88, beats: 2 },

    { freq: 392.00, beats: 0.5 },
    { freq: 392.00, beats: 0.5 },
    { freq: 440.00, beats: 1 },
    { freq: 392.00, beats: 1 },
    { freq: 587.33, beats: 1 },
    { freq: 523.25, beats: 2 },

    { freq: 392.00, beats: 0.5 },
    { freq: 392.00, beats: 0.5 },
    { freq: 783.99, beats: 1 },
    { freq: 659.25, beats: 1 },
    { freq: 523.25, beats: 1 },
    { freq: 493.88, beats: 1 },
    { freq: 440.00, beats: 2 },

    { freq: 698.46, beats: 0.5 },
    { freq: 698.46, beats: 0.5 },
    { freq: 659.25, beats: 1 },
    { freq: 523.25, beats: 1 },
    { freq: 587.33, beats: 1 },
    { freq: 523.25, beats: 2 },
    { freq: null, beats: 1 },
  ];

  private emitStateChange(): void {
    window.dispatchEvent(new CustomEvent('audio-state-change'));
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const audioWindow = window as unknown as Window & {
        webkitAudioContext: typeof AudioContext;
      };
      const AudioContextCtor = window.AudioContext || audioWindow.webkitAudioContext;
      this.ctx = new AudioContextCtor();
    }
    return this.ctx;
  }

  private primeMobileAudio(ctx: AudioContext): void {
    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  private buildAudioGraph(ctx: AudioContext): void {
    if (this.masterGain) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);

    const reverb = this.createReverb(ctx);
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.value = 0.78;
    wetGain.gain.value = 0.22;

    this.masterGain.connect(dryGain);
    this.masterGain.connect(reverb);
    reverb.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);
  }

  private createReverb(ctx: AudioContext): ConvolverNode {
    const convolver = ctx.createConvolver();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 1.25;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.7);
      }
    }

    convolver.buffer = buffer;
    return convolver;
  }

  private playBirthdayNote(freq: number, startTime: number, duration: number): void {
    const ctx = this.getCtx();
    if (!this.masterGain) return;

    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(freq, startTime);
    bellGain.gain.setValueAtTime(0, startTime);
    bellGain.gain.linearRampToValueAtTime(0.13, startTime + 0.025);
    bellGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(startTime);
    bell.stop(startTime + duration + 0.04);

    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(freq * 2, startTime);
    sparkleGain.gain.setValueAtTime(0, startTime);
    sparkleGain.gain.linearRampToValueAtTime(0.035, startTime + 0.02);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.65);
    sparkle.connect(sparkleGain);
    sparkleGain.connect(this.masterGain);
    sparkle.start(startTime);
    sparkle.stop(startTime + duration * 0.7);
  }

  private playBassNote(startTime: number, duration: number): void {
    const ctx = this.getCtx();
    if (!this.masterGain) return;

    const bass = ctx.createOscillator();
    const gain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(130.81, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.045, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    bass.connect(gain);
    gain.connect(this.masterGain);
    bass.start(startTime);
    bass.stop(startTime + duration + 0.05);
  }

  private stopScheduler(): void {
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }
  }

  private stopFadeTimer(): void {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private startMusic(fadeSeconds = 1.2): void {
    const ctx = this.getCtx();
    if (!this.masterGain) return;

    this.stopScheduler();
    this.stopFadeTimer();
    this.isPlaying = true;
    this.melodyIndex = 0;
    this.nextNoteTime = ctx.currentTime + 0.08;

    this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.72, ctx.currentTime + fadeSeconds);

    this.schedulePattern();
    this.emitStateChange();
  }

  private schedulePattern(): void {
    if (!this.isPlaying || !this.ctx) return;

    const ctx = this.getCtx();
    const lookahead = 3.5;

    while (this.nextNoteTime < ctx.currentTime + lookahead) {
      const note = this.melody[this.melodyIndex];
      const duration = note.beats * this.beatDuration;

      if (note.freq) {
        this.playBirthdayNote(note.freq, this.nextNoteTime, duration * 0.9);
      }

      if (this.melodyIndex === 0 || this.melodyIndex === 6 || this.melodyIndex === 12 || this.melodyIndex === 19) {
        this.playBassNote(this.nextNoteTime, this.beatDuration * 2.4);
      }

      this.nextNoteTime += duration;
      this.melodyIndex = (this.melodyIndex + 1) % this.melody.length;
    }

    this.scheduleTimer = setTimeout(() => this.schedulePattern(), 900);
  }

  async unlock(): Promise<void> {
    if (this.isUnlocked && this.masterGain) {
      if (this.ctx?.state === 'suspended') {
        await this.ctx.resume();
      }
      if (!this.isPlaying) {
        this.startMusic(0.8);
      }
      return;
    }

    if (this.unlockPromise) return this.unlockPromise;

    this.unlockPromise = this.unlockAudio();
    return this.unlockPromise;
  }

  private async unlockAudio(): Promise<void> {
    try {
      const ctx = this.getCtx();
      this.primeMobileAudio(ctx);

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (ctx.state === 'suspended') {
        throw new Error('AudioContext is still suspended');
      }

      this.buildAudioGraph(ctx);
      this.isUnlocked = true;
      this.startMusic(2);
    } catch (error) {
      console.warn('Audio unlock failed:', error);
      this.isUnlocked = false;
      window.dispatchEvent(new CustomEvent('audio-blocked'));
      this.emitStateChange();
    } finally {
      this.unlockPromise = null;
    }
  }

  async toggle(): Promise<boolean> {
    if (!this.ctx || !this.masterGain || !this.isUnlocked) {
      await this.unlock();
      return this.isPlaying;
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stopFadeTimer();
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.45);
      this.fadeTimer = setTimeout(() => {
        this.stopScheduler();
        this.isPlaying = false;
        this.emitStateChange();
      }, 450);
    } else {
      this.startMusic(0.8);
    }

    this.emitStateChange();
    return this.isPlaying;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsUnlocked(): boolean {
    return this.isUnlocked && Boolean(this.masterGain);
  }

  destroy(): void {
    this.stopScheduler();
    this.stopFadeTimer();
    this.isPlaying = false;
    this.emitStateChange();

    if (this.ctx) {
      this.masterGain?.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.45);
      const ctx = this.ctx;
      setTimeout(() => {
        void ctx.close();
        if (this.ctx === ctx) {
          this.ctx = null;
          this.masterGain = null;
          this.isUnlocked = false;
          this.unlockPromise = null;
        }
      }, 550);
    }
  }
}

export const audioManager = new AudioManager();
