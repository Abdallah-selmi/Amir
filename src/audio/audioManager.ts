type AudioState = 'idle' | 'playing' | 'paused' | 'blocked'

type AudioWindow = Window & {
  webkitAudioContext: typeof AudioContext
}

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private state: AudioState = 'idle'
  private unlockPromise: Promise<void> | null = null
  private scheduleTimer: ReturnType<typeof setTimeout> | null = null
  private nextNoteTime = 0
  private melodyIndex = 0

  private readonly beatDuration = 0.34

  // Melodie "Happy Birthday" en Sol majeur.
  private readonly melody = [
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
    { freq: 523.25, beats: 2.5 },
    { freq: null, beats: 1 }
  ]

  private emitStateChange(): void {
    window.dispatchEvent(new CustomEvent('audio-state-change'))
  }

  // Regle iOS #1 : createContext() seulement ici.
  // Appelle uniquement depuis unlock() ou playEffect(), eux-memes appeles
  // depuis un event handler direct (click/touchstart).
  private initContext(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext ||
        (window as unknown as AudioWindow).webkitAudioContext
      this.ctx = new Ctx()
    }
    return this.ctx
  }

  private createReverb(ctx: AudioContext): ConvolverNode {
    const conv = ctx.createConvolver()
    const sr = ctx.sampleRate
    const len = Math.floor(sr * 1.2)
    const buf = ctx.createBuffer(2, len, sr)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) *
          Math.pow(1 - i / len, 3)
      }
    }
    conv.buffer = buf
    return conv
  }

  private playNote(
    freq: number,
    when: number,
    dur: number,
    vol = 0.15
  ): void {
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, when)
    env.gain.setValueAtTime(0, when)
    env.gain.linearRampToValueAtTime(vol, when + 0.03)
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur)

    osc.connect(env)
    env.connect(this.masterGain)
    osc.start(when)
    osc.stop(when + dur + 0.05)

    // Harmonique douce (octave superieure)
    const osc2 = this.ctx.createOscillator()
    const env2 = this.ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2, when)
    env2.gain.setValueAtTime(0, when)
    env2.gain.linearRampToValueAtTime(vol * 0.25, when + 0.03)
    env2.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.6)
    osc2.connect(env2)
    env2.connect(this.masterGain)
    osc2.start(when)
    osc2.stop(when + dur)
  }

  private scheduleMusic(): void {
    if (this.state !== 'playing' || !this.ctx) return

    const now = this.ctx.currentTime
    const lookahead = 3.5

    while (this.nextNoteTime < now + lookahead) {
      const idx = this.melodyIndex % this.melody.length
      const note = this.melody[idx]
      const duration = note.beats * this.beatDuration

      if (note.freq) {
        this.playNote(note.freq, this.nextNoteTime, duration * 0.9, 0.14)
      }

      if (idx === 0 || idx === 6 || idx === 12 || idx === 19) {
        this.playNote(
          196.00,
          this.nextNoteTime,
          this.beatDuration * 2.4,
          0.055
        )
      }

      this.nextNoteTime += duration
      this.melodyIndex++
    }

    this.scheduleTimer = setTimeout(
      () => this.scheduleMusic(), 1000
    )
  }

  // Point d'entree principal.
  // Doit etre appele depuis onClick ou onTouchStart direct.
  async unlock(): Promise<void> {
    if (this.state === 'playing') return
    if (this.unlockPromise) return this.unlockPromise

    this.unlockPromise = this.startUnlock()
    return this.unlockPromise
  }

  private async startUnlock(): Promise<void> {
    try {
      // Regle iOS #2 : initContext dans le meme call stack que l'event utilisateur.
      const ctx = this.initContext()

      // Regle iOS #3 : toujours resume() avant play.
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      if (ctx.state !== 'running') {
        throw new Error(`AudioContext state: ${ctx.state}`)
      }

      if (!this.masterGain) {
        this.masterGain = ctx.createGain()

        const reverb = this.createReverb(ctx)
        const dry = ctx.createGain()
        const wet = ctx.createGain()
        dry.gain.value = 0.65
        wet.gain.value = 0.35

        this.masterGain.connect(dry)
        this.masterGain.connect(reverb)
        reverb.connect(wet)
        dry.connect(ctx.destination)
        wet.connect(ctx.destination)
      }

      this.masterGain.gain.cancelScheduledValues(ctx.currentTime)
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime)
      this.masterGain.gain.linearRampToValueAtTime(
        0.85, ctx.currentTime + 2.0
      )

      this.state = 'playing'
      this.nextNoteTime = ctx.currentTime + 0.1
      this.melodyIndex = 0
      this.scheduleMusic()
      this.emitStateChange()

      console.log('Audio demarre avec succes')
    } catch (err) {
      console.error('Audio bloque sur iOS:', err)
      this.state = 'blocked'
      this.emitStateChange()
      window.dispatchEvent(
        new CustomEvent('audio-blocked', { detail: String(err) })
      )
    } finally {
      this.unlockPromise = null
    }
  }

  async playEffect(
    createEffect: (ctx: AudioContext, destination: AudioNode) => void
  ): Promise<void> {
    try {
      const ctx = this.initContext()

      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      if (ctx.state !== 'running') {
        throw new Error(`AudioContext state: ${ctx.state}`)
      }

      createEffect(ctx, ctx.destination)
    } catch (err) {
      console.error('Effet audio bloque sur iOS:', err)
      this.state = 'blocked'
      this.emitStateChange()
      window.dispatchEvent(
        new CustomEvent('audio-blocked', { detail: String(err) })
      )
    }
  }

  toggle(): boolean {
    if (!this.ctx || !this.masterGain) return false

    if (this.state === 'playing') {
      this.masterGain.gain.linearRampToValueAtTime(
        0, this.ctx.currentTime + 0.4
      )
      setTimeout(() => {
        if (this.scheduleTimer) clearTimeout(this.scheduleTimer)
        this.state = 'paused'
        this.emitStateChange()
      }, 450)
      return false
    } else {
      this.state = 'playing'
      this.nextNoteTime = this.ctx.currentTime + 0.05
      this.melodyIndex = 0
      this.masterGain.gain.linearRampToValueAtTime(
        0.85, this.ctx.currentTime + 0.8
      )
      this.scheduleMusic()
      this.emitStateChange()
      return true
    }
  }

  getState(): AudioState {
    return this.state
  }

  isPlaying(): boolean {
    return this.state === 'playing'
  }

  // Regle iOS #4 : toujours close() au cleanup.
  destroy(): void {
    if (this.scheduleTimer) clearTimeout(this.scheduleTimer)
    this.scheduleTimer = null
    this.state = 'idle'
    this.emitStateChange()
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        0, this.ctx.currentTime + 0.3
      )
    }
    const ctx = this.ctx
    setTimeout(() => {
      void ctx?.close()
      if (this.ctx === ctx) {
        this.ctx = null
        this.masterGain = null
        this.unlockPromise = null
      }
    }, 400)
  }
}

export const audioManager = new AudioManager()
