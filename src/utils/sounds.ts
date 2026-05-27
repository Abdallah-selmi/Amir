let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue: number = 0.12,
  endFreq?: number
) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), startTime + duration);
  }

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.03);
}

function playNoise(
  startTime: number,
  duration: number,
  gainValue: number,
  filterType: BiquadFilterType,
  frequency: number,
  q: number = 1
) {
  const ctx = getContext();
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  noise.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startTime);
  filter.Q.value = q;
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
  noise.stop(startTime + duration);
}

export function playPop() {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

export function playSparkle() {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.25);
}

export function playHappy(baseFreq: number = 400) {
  const ctx = getContext();
  const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.15);
  });
}

export function playMagic() {
  const ctx = getContext();
  const notes = [392, 523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.2);
  });
}

export function playWin() {
  const ctx = getContext();
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.25);
  });
}

export function playBlow() {
  const ctx = getContext();
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playAnimalSound(index: number) {
  const ctx = getContext();
  const now = ctx.currentTime;

  switch (index) {
    case 0:
      playTone(170, now, 0.38, 'sawtooth', 0.08, 92);
      playNoise(now, 0.42, 0.12, 'lowpass', 520, 0.8);
      break;
    case 1:
      playTone(420, now, 0.16, 'sawtooth', 0.12, 760);
      playTone(760, now + 0.14, 0.22, 'sawtooth', 0.1, 330);
      break;
    case 2:
      playTone(680, now, 0.09, 'sine', 0.1, 920);
      playTone(980, now + 0.11, 0.11, 'sine', 0.09, 740);
      break;
    case 3:
      playTone(280, now, 0.11, 'square', 0.1, 190);
      playTone(300, now + 0.13, 0.12, 'square', 0.09, 210);
      playNoise(now, 0.23, 0.035, 'bandpass', 900, 2);
      break;
    case 4:
      playTone(120, now, 0.28, 'sawtooth', 0.09, 82);
      playNoise(now, 0.32, 0.08, 'lowpass', 360, 0.7);
      break;
    case 5:
      playTone(760, now, 0.08, 'triangle', 0.1, 1040);
      playTone(920, now + 0.1, 0.1, 'triangle', 0.08, 620);
      break;
    case 6:
      playTone(523, now, 0.12, 'sine', 0.08);
      playTone(659, now + 0.1, 0.12, 'sine', 0.08);
      playTone(784, now + 0.2, 0.15, 'sine', 0.07);
      break;
    case 7:
      playTone(190, now, 0.13, 'square', 0.09, 145);
      playTone(240, now + 0.14, 0.16, 'square', 0.085, 170);
      playNoise(now, 0.24, 0.035, 'bandpass', 430, 1.8);
      break;
    default:
      playHappy(400);
      break;
  }
}
