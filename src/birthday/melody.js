const MELODY_DURATION = 16.8;

// Two original phrases, with room for the first phrase's bells to settle.
// Each note is [onset in seconds, MIDI pitch, decay, relative strength].
const MELODY = [
  [0.1, 74, 1.35, 0.9],
  [0.8, 78, 1.1, 0.8],
  [1.55, 81, 1.25, 0.9],
  [2.35, 83, 0.95, 0.75],
  [2.95, 81, 1.15, 0.85],
  [3.8, 78, 1.1, 0.8],
  [4.6, 76, 1.15, 0.75],
  [5.45, 74, 1.4, 0.85],
  [8.05, 69, 1.1, 0.75],
  [8.75, 74, 1.15, 0.85],
  [9.45, 76, 1.1, 0.8],
  [10.15, 78, 1.2, 0.9],
  [10.95, 83, 1.15, 0.8],
  [11.7, 81, 1.2, 0.85],
  [12.45, 78, 1.15, 0.8],
  [13.15, 76, 1.05, 0.7],
  [13.85, 74, 1.65, 0.85],
];
const HARMONY = [
  [0.1, 50, 2.1],
  [2.95, 57, 1.9],
  [5.45, 50, 1.7],
  [8.05, 50, 2.1],
  [10.95, 55, 1.6],
  [12.45, 57, 1.2],
  [13.85, 50, 1.7],
];

/** No audio resources are created until play() is called from a user gesture. */
export function createBirthdayMelody() {
  let session = null;
  let disposed = false;

  function stop() {
    const previous = session;
    session = null;
    if (!previous) return;

    previous.playing = false;
    previous.cancelResume?.();
    previous.cancelResume = null;
    clearTimeout(previous.timer);
    previous.timer = null;
    for (const oscillator of previous.voices) oscillator.stop();
    for (const node of previous.graph) node.disconnect();
    previous.voices.length = 0;
    previous.graph.length = 0;
    previous.samples = null;
    previous.analyser = null;
    if (previous.context.state !== 'closed') {
      void previous.context.close().catch(() => {});
    }
  }

  function finishWhenDue(current) {
    if (session !== current) return;
    const remaining = current.endAt - current.context.currentTime;
    if (remaining <= 0) {
      stop();
      return;
    }
    // A suspended audio clock must not lose its tail to a wall-clock timer.
    current.timer = setTimeout(() => finishWhenDue(current), Math.max(20, remaining * 1000));
  }

  async function play() {
    if (disposed) return false;
    stop();

    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return false;

    let current = null;
    try {
      // Both calls happen synchronously within the caller's click gesture.
      const context = new AudioContextClass();
      current = {
        context, voices: [], graph: [], timer: null, cancelResume: null,
        playing: false, analyser: null, samples: null, level: 0, levelAt: 0,
      };
      session = current;
      const resumed = await Promise.race([
        context.resume().then(() => true, () => false),
        new Promise((resolve) => { current.cancelResume = () => resolve(false); }),
      ]);
      current.cancelResume = null;
      if (disposed || session !== current) return false;
      if (!resumed || context.state !== 'running') {
        stop();
        return false;
      }

      const start = context.currentTime + 0.025;
      current.startAt = start;
      current.endAt = start + MELODY_DURATION;
      current.levelAt = start;
      const track = (node) => {
        current.graph.push(node);
        return node;
      };
      const tone = track(context.createBiquadFilter());
      tone.type = 'lowpass';
      tone.frequency.setValueAtTime(3600, start);
      tone.Q.setValueAtTime(0.35, start);

      const output = track(context.createGain());
      output.gain.setValueAtTime(0, start);
      output.gain.linearRampToValueAtTime(0.48, start + 0.28);
      output.gain.setValueAtTime(0.48, start + 15.65);
      output.gain.linearRampToValueAtTime(0, current.endAt);

      const delay = track(context.createDelay(0.5));
      const feedback = track(context.createGain());
      const echo = track(context.createGain());
      delay.delayTime.setValueAtTime(0.235, start);
      feedback.gain.setValueAtTime(0.12, start);
      echo.gain.setValueAtTime(0.13, start);
      tone.connect(output);
      tone.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(echo);
      echo.connect(output);

      const analyser = track(context.createAnalyser());
      analyser.fftSize = 256;
      current.analyser = analyser;
      current.samples = new Float32Array(analyser.fftSize);
      output.connect(analyser);
      analyser.connect(context.destination);

      function addTone(offset, midi, decay, volume, ratio = 1) {
        const at = start + offset;
        const oscillator = track(context.createOscillator());
        const envelope = track(context.createGain());
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12) * ratio, at);
        envelope.gain.setValueAtTime(0, at);
        envelope.gain.linearRampToValueAtTime(volume, at + 0.018);
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        envelope.gain.linearRampToValueAtTime(0, at + decay + 0.025);
        oscillator.connect(envelope);
        envelope.connect(tone);
        oscillator.start(at);
        current.voices.push(oscillator);
        oscillator.stop(at + decay + 0.03);
      }

      for (const [offset, midi, decay, strength] of MELODY) {
        addTone(offset, midi, decay, 0.13 * strength);
        // A quiet, short inharmonic partial gives the sine a soft bell attack.
        addTone(offset, midi, decay * 0.42, 0.024 * strength, 2.76);
      }
      for (const [offset, midi, decay] of HARMONY) addTone(offset, midi, decay, 0.045);
      current.playing = true;
      finishWhenDue(current);
      return true;
    } catch {
      if (session === current) stop();
      return false;
    }
  }

  function readFrame() {
    const current = session;
    if (!current?.playing) return { progress: 0, level: 0 };
    const now = current.context.currentTime;
    if (now >= current.endAt) {
      stop();
      return { progress: 0, level: 0 };
    }
    if (current.context.state !== 'running' || now < current.startAt) {
      return { progress: 0, level: 0 };
    }

    // Reuse the sample buffer; measure the complete output, including echoes.
    current.analyser.getFloatTimeDomainData(current.samples);
    let power = 0;
    for (const sample of current.samples) power += sample * sample;
    const target = Math.min(1, Math.sqrt(power / current.samples.length) * 16);
    const elapsed = Math.max(0, now - current.levelAt);
    const response = target > current.level ? 0.03 : 0.16;
    current.level += (target - current.level) * (1 - Math.exp(-elapsed / response));
    current.levelAt = now;
    return {
      progress: Math.min(1, Math.max(0, (now - current.startAt) / MELODY_DURATION)),
      level: current.level,
    };
  }

  function dispose() {
    disposed = true;
    stop();
  }

  return {
    play,
    stop,
    dispose,
    readFrame,
    duration: MELODY_DURATION,
    get isPlaying() {
      return Boolean(session?.playing);
    },
  };
}
