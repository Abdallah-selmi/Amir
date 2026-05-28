import { audioManager } from '../audio/audioManager'

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue: number = 0.12,
  endFreq?: number
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), startTime + duration)
  }

  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.connect(gain)
  gain.connect(destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.03)
}

function playNoise(
  ctx: AudioContext,
  destination: AudioNode,
  startTime: number,
  duration: number,
  gainValue: number,
  filterType: BiquadFilterType,
  frequency: number,
  q: number = 1
): void {
  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  noise.buffer = buffer
  filter.type = filterType
  filter.frequency.setValueAtTime(frequency, startTime)
  filter.Q.value = q
  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  noise.start(startTime)
  noise.stop(startTime + duration)
}

function playFilteredTone(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  filterType: BiquadFilterType,
  filterFreq: number,
  q: number,
  endFreq?: number
): void {
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), startTime + duration)
  }

  filter.type = filterType
  filter.frequency.setValueAtTime(filterFreq, startTime)
  filter.Q.value = q

  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.035)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.04)
}

export function playPop(): void {
  void audioManager.playEffect((ctx, destination) => {
    const now = ctx.currentTime
    playTone(ctx, destination, 500, now, 0.12, 'square', 0.4, 80)
  })
}

export function playSparkle(): void {
  void audioManager.playEffect((ctx, destination) => {
    const now = ctx.currentTime
    playTone(ctx, destination, 1200, now, 0.25, 'sine', 0.15, 800)
  })
}

export function playHappy(baseFreq: number = 400): void {
  void audioManager.playEffect((ctx, destination) => {
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.1
      playTone(ctx, destination, freq, start, 0.15, 'sine', 0.12)
    })
  })
}

export function playMagic(): void {
  void audioManager.playEffect((ctx, destination) => {
    const notes = [392, 523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.08
      playTone(ctx, destination, freq, start, 0.2, 'sine', 0.08)
    })
  })
}

export function playWin(): void {
  void audioManager.playEffect((ctx, destination) => {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.12
      playTone(ctx, destination, freq, start, 0.25, 'triangle', 0.18)
    })
  })
}

export function playBlow(): void {
  void audioManager.playEffect((ctx, destination) => {
    const now = ctx.currentTime
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15
    }
    noise.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2000
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(destination)
    noise.start(now)
    noise.stop(now + 0.3)
  })
}

export function playAnimalSound(index: number): void {
  void audioManager.playEffect((ctx, destination) => {
    const now = ctx.currentTime

    switch (index) {
      case 0:
        // Lion: roar grave avec souffle.
        playFilteredTone(ctx, destination, 115, now, 0.95, 'sawtooth', 0.16, 'lowpass', 420, 1.2, 62)
        playFilteredTone(ctx, destination, 76, now + 0.08, 0.75, 'square', 0.08, 'lowpass', 240, 0.8, 52)
        playNoise(ctx, destination, now + 0.02, 0.9, 0.16, 'bandpass', 360, 1.4)
        playNoise(ctx, destination, now + 0.18, 0.65, 0.08, 'lowpass', 850, 0.6)
        break
      case 1:
        // Elephant: trompette montante puis descendante.
        playFilteredTone(ctx, destination, 330, now, 0.34, 'sawtooth', 0.15, 'bandpass', 1050, 5.5, 980)
        playFilteredTone(ctx, destination, 980, now + 0.22, 0.5, 'sawtooth', 0.13, 'bandpass', 1200, 4.5, 420)
        playNoise(ctx, destination, now + 0.04, 0.65, 0.045, 'highpass', 1800, 0.7)
        break
      case 2:
        // Lapin: petits couinements courts.
        playTone(ctx, destination, 1250, now, 0.08, 'sine', 0.09, 1750)
        playTone(ctx, destination, 950, now + 0.11, 0.09, 'triangle', 0.08, 1450)
        playTone(ctx, destination, 1500, now + 0.23, 0.07, 'sine', 0.06, 1180)
        break
      case 3:
        // Canard: coin-coin nasal en deux syllabes.
        playFilteredTone(ctx, destination, 310, now, 0.16, 'square', 0.14, 'bandpass', 820, 7, 190)
        playFilteredTone(ctx, destination, 285, now + 0.18, 0.18, 'square', 0.12, 'bandpass', 760, 7, 170)
        playNoise(ctx, destination, now, 0.35, 0.04, 'bandpass', 1100, 4)
        break
      case 4:
        // Ours: grognement lourd.
        playFilteredTone(ctx, destination, 86, now, 0.75, 'sawtooth', 0.15, 'lowpass', 260, 0.9, 58)
        playFilteredTone(ctx, destination, 65, now + 0.14, 0.55, 'square', 0.08, 'lowpass', 190, 0.7, 48)
        playNoise(ctx, destination, now + 0.05, 0.72, 0.12, 'lowpass', 420, 0.7)
        break
      case 5:
        // Renard: yip-yip aigu.
        playTone(ctx, destination, 620, now, 0.09, 'triangle', 0.11, 1120)
        playTone(ctx, destination, 780, now + 0.13, 0.1, 'triangle', 0.1, 1320)
        playTone(ctx, destination, 520, now + 0.28, 0.12, 'sawtooth', 0.08, 920)
        break
      case 6:
        // Panda: petit bleat/grognement doux.
        playFilteredTone(ctx, destination, 230, now, 0.28, 'triangle', 0.1, 'bandpass', 520, 2.5, 320)
        playFilteredTone(ctx, destination, 190, now + 0.25, 0.34, 'sawtooth', 0.075, 'lowpass', 480, 1.1, 145)
        playNoise(ctx, destination, now + 0.18, 0.32, 0.035, 'lowpass', 700, 0.8)
        break
      case 7:
        // Grenouille: ribbit en deux pulsations.
        playFilteredTone(ctx, destination, 135, now, 0.16, 'square', 0.11, 'bandpass', 420, 5, 96)
        playFilteredTone(ctx, destination, 185, now + 0.2, 0.22, 'square', 0.12, 'bandpass', 520, 5, 118)
        playNoise(ctx, destination, now + 0.02, 0.38, 0.045, 'bandpass', 360, 3)
        break
      default:
        playTone(ctx, destination, 400, now, 0.15, 'sine', 0.12)
        playTone(ctx, destination, 500, now + 0.1, 0.15, 'sine', 0.12)
        playTone(ctx, destination, 600, now + 0.2, 0.15, 'sine', 0.12)
        break
    }
  })
}
