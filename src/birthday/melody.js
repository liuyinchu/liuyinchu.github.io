const MELODY_DURATION = 8.8;

// An original, unhurried D-pentatonic phrase, measured in seconds.
const MELODY = [
  [0, 74],
  [0.66, 78],
  [1.32, 81],
  [2.12, 83],
  [2.88, 81],
  [3.58, 78],
  [4.28, 76],
  [5.02, 78],
  [5.72, 81],
  [6.42, 78],
  [7.14, 74],
];
const HARMONY = [[0, 50], [2.88, 57], [5.02, 55], [7.14, 50]];

/** No audio resources are created until play() is called from a user gesture. */
export function createBirthdayMelody() {
  let session = null;
  let disposed = false;

  function stop() {
    const previous = session;
    session = null;
    if (!previous) return;

    clearTimeout(previous.timer);
    previous.playing = false;
    for (const { oscillator, envelope } of previous.voices) {
      oscillator.stop();
      oscillator.disconnect();
      envelope.disconnect();
    }
    previous.voices.length = 0;
    previous.output?.disconnect();
    if (previous.context.state !== 'closed') {
      // Closing also releases a context whose resume() is still pending.
      void previous.context.close().catch(() => {});
    }
  }

  async function play() {
    if (disposed) return false;
    stop();

    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return false;

    let current = null;
    try {
      // Create and resume synchronously within the caller's click gesture.
      const context = new AudioContextClass();
      current = { context, voices: [], output: null, timer: null, playing: false };
      session = current;
      await context.resume();

      // A later click, stop(), or dispose() may have invalidated this resume.
      if (disposed || session !== current) return false;
      if (context.state !== 'running') {
        stop();
        return false;
      }

      const start = context.currentTime + 0.02;
      const output = context.createGain();
      current.output = output;
      output.gain.setValueAtTime(0.42, start);
      output.gain.setValueAtTime(0.42, start + 8.45);
      output.gain.linearRampToValueAtTime(0, start + 8.72);
      output.connect(context.destination);

      function addNote(offset, midi, volume, type) {
        const at = start + offset;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), at);
        envelope.gain.setValueAtTime(0, at);
        envelope.gain.linearRampToValueAtTime(volume, at + 0.018);
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + 1.52);
        envelope.gain.linearRampToValueAtTime(0, at + 1.55);
        oscillator.connect(envelope);
        envelope.connect(output);
        oscillator.start(at);
        oscillator.stop(at + 1.56);
        current.voices.push({ oscillator, envelope });
      }

      // Fifteen scheduled voices total; no more than four overlap.
      for (const [offset, midi] of MELODY) addNote(offset, midi, 0.12, 'triangle');
      for (const [offset, midi] of HARMONY) addNote(offset, midi, 0.065, 'sine');
      current.playing = true;
      current.timer = setTimeout(() => {
        if (session === current) stop();
      }, MELODY_DURATION * 1000);
      return true;
    } catch {
      if (session === current) stop();
      return false;
    }
  }

  function dispose() {
    disposed = true;
    stop();
  }

  return {
    play,
    stop,
    dispose,
    duration: MELODY_DURATION,
    get isPlaying() {
      return Boolean(session?.playing);
    },
  };
}
