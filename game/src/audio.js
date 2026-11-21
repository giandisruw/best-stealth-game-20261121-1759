// All sound is generated with WebAudio — no audio files, no network.
// Footsteps are soft filtered-noise taps, the alert sting is a rising
// two-note figure, and pickups and wins are small chimes.

export function createAudio() {
  const audio = {
    context: null,
    muted: false,
    master: null,
  };

  /** Create (or resume) the context on the first user gesture. */
  audio.ensure = () => {
    if (audio.context) {
      if (audio.context.state === 'suspended') audio.context.resume();
      return;
    }
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return;
    try {
      audio.context = new Ctor();
    } catch {
      // No audio on this browser; the game plays on silently.
      return;
    }
    audio.master = audio.context.createGain();
    audio.master.gain.value = 0.5;
    audio.master.connect(audio.context.destination);
  };

  function tone(frequency, seconds, type, volume, when = 0) {
    if (!audio.context || audio.muted) return;
    const start = audio.context.currentTime + when;
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  function noiseTap(seconds, volume, filterFrequency) {
    if (!audio.context || audio.muted) return;
    const start = audio.context.currentTime;
    const length = Math.max(1, Math.floor(audio.context.sampleRate * seconds));
    const buffer = audio.context.createBuffer(1, length, audio.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = audio.context.createBufferSource();
    source.buffer = buffer;
    const filter = audio.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency;
    const gain = audio.context.createGain();
    gain.gain.value = volume;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    source.start(start);
  }

  /** A soft tap, alternating pitch so walking has a left-right feel. */
  audio.footstep = (sneaking) => {
    audio.ensure();
    if (sneaking) {
      noiseTap(0.05, 0.08, 500);
    } else {
      noiseTap(0.07, 0.16, 900);
    }
  };

  /** The sting when a guard starts the chase: two rising notes. */
  audio.sting = () => {
    audio.ensure();
    tone(196, 0.22, 'sawtooth', 0.16);
    tone(311, 0.34, 'sawtooth', 0.16, 0.14);
  };

  /** A short warning blip when suspicion first passes halfway. */
  audio.warning = () => {
    audio.ensure();
    tone(440, 0.12, 'triangle', 0.14);
  };

  /** A paper-rustle chime when a letter is collected. */
  audio.pickup = () => {
    audio.ensure();
    tone(660, 0.12, 'sine', 0.15);
    tone(880, 0.18, 'sine', 0.12, 0.07);
  };

  /** The pebble's soft clatter. */
  audio.pebble = () => {
    audio.ensure();
    noiseTap(0.09, 0.2, 1600);
  };

  /** A small rising arpeggio when a wing is cleared. */
  audio.win = () => {
    audio.ensure();
    [523, 659, 784, 1047].forEach((frequency, index) => {
      tone(frequency, 0.3, 'sine', 0.14, index * 0.11);
    });
  };

  /** A low falling note when the courier is caught. */
  audio.caught = () => {
    audio.ensure();
    tone(220, 0.5, 'sawtooth', 0.15);
    tone(110, 0.7, 'sawtooth', 0.15, 0.2);
  };

  return audio;
}
