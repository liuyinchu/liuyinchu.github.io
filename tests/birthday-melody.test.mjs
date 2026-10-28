import test from 'node:test';
import assert from 'node:assert/strict';
import { createBirthdayMelody } from '../src/birthday/melody.js';

function audioHarness(t) {
  const contexts = [];
  const timers = new Map();
  let timerId = 0;
  const parameter = () => ({
    events: [],
    setValueAtTime(value, time) { this.events.push({ value, time }); },
    linearRampToValueAtTime(value, time) { this.events.push({ value, time }); },
    exponentialRampToValueAtTime(value, time) { this.events.push({ value, time }); },
  });
  class AudioContextStub {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = {};
      this.nodes = [];
      this.sampleValue = 0;
      this.closeCalls = 0;
      this.resumeCalls = 0;
      this.pendingResume = new Promise((resolve, reject) => {
        this.resolveResume = resolve;
        this.rejectResume = reject;
      });
      contexts.push(this);
    }
    resume() { this.resumeCalls++; return this.pendingResume; }
    activate() { this.state = 'running'; this.resolveResume(); }
    close() { this.closeCalls++; this.state = 'closed'; return Promise.resolve(); }
    node(kind, properties) {
      const node = {
        kind, connections: [], disconnected: false,
        connect(target) { this.connections.push(target); },
        disconnect() { this.disconnected = true; this.connections.length = 0; },
        ...properties,
      };
      this.nodes.push(node);
      return node;
    }
    createGain() { return this.node('gain', { gain: parameter() }); }
    createDelay() { return this.node('delay', { delayTime: parameter() }); }
    createBiquadFilter() { return this.node('filter', { frequency: parameter(), Q: parameter() }); }
    createOscillator() {
      return this.node('oscillator', {
        frequency: parameter(),
        start(at) { this.startAt = at; },
        stop(at) { if (at === undefined) this.cancelled = true; else this.stopAt = at; },
      });
    }
    createAnalyser() {
      const context = this;
      return this.node('analyser', {
        buffers: [],
        getFloatTimeDomainData(buffer) {
          this.buffers.push(buffer);
          for (let i = 0; i < buffer.length; i++) buffer[i] = context.sampleValue * (i % 2 ? -1 : 1);
        },
      });
    }
  }
  for (const key of ['AudioContext', 'webkitAudioContext']) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key === 'AudioContext' ? AudioContextStub : undefined });
    t.after(() => { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; });
  }
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    timers.set(++timerId, { callback, delay });
    return timerId;
  });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  return {
    contexts, timers,
    fireNext() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
    },
  };
}

function assertReleased(context) {
  assert.equal(context.closeCalls, 1);
  assert(context.nodes.every((node) => node.disconnected), 'all graph nodes must disconnect');
  assert(context.nodes.filter((node) => node.kind === 'oscillator').every((node) => node.cancelled), 'all scheduled sources must stop');
}

async function start(melody, harness) {
  const pending = melody.play();
  const context = harness.contexts.at(-1);
  context.activate();
  assert.equal(await pending, true);
  return context;
}

test('factory is silent; play creates and resumes audio before yielding', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  assert.equal(harness.contexts.length, 0);
  assert.deepEqual(melody.readFrame(), { progress: 0, level: 0 });
  assert(melody.duration >= 15 && melody.duration <= 18);
  const pending = melody.play();
  const context = harness.contexts[0];
  assert.equal(context.resumeCalls, 1);
  assert.equal(context.nodes.length, 0, 'pending resume must not schedule notes');
  context.activate();
  assert.equal(await pending, true);
  assert.equal(melody.isPlaying, true);
  melody.dispose();
});

test('feedback follows audio time and actual samples while reusing its buffer', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  const context = await start(melody, harness);
  context.currentTime = 1;
  const quiet = melody.readFrame();
  assert.equal(quiet.level, 0);
  context.sampleValue = 0.025;
  context.currentTime += melody.duration / 2;
  const bright = melody.readFrame();
  assert(Math.abs(bright.progress - quiet.progress - 0.5) < 1e-12);
  assert(bright.level > 0.39 && bright.level < 0.41);
  assert.deepEqual(melody.readFrame(), bright, 'unchanged audio time must not advance feedback');
  context.sampleValue = 0;
  context.currentTime += 1;
  assert(melody.readFrame().level < 0.001, 'silent samples must let the measured envelope settle');
  const analyser = context.nodes.find((node) => node.kind === 'analyser');
  assert(analyser.buffers.length >= 4);
  assert(analyser.buffers.every((buffer) => buffer === analyser.buffers[0]));
  assert(analyser.connections.includes(context.destination), 'analyser must measure the delivered output');
  melody.stop();
  assert.deepEqual(melody.readFrame(), { progress: 0, level: 0 });
});

test('replay and stop release sources, the echo graph, and timers', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  const first = await start(melody, harness);
  const replay = melody.play();
  assertReleased(first);
  assert.equal(harness.timers.size, 0);
  const second = harness.contexts[1];
  second.activate();
  assert.equal(await replay, true);
  melody.stop();
  assertReleased(second);
  assert.equal(melody.isPlaying, false);
  assert.equal(harness.timers.size, 0);
  const third = await start(melody, harness);
  melody.dispose();
  assertReleased(third);
});

test('stop and dispose settle pending play without waiting for resume', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  const stopped = melody.play();
  melody.stop();
  assert.equal(await stopped, false);
  assertReleased(harness.contexts[0]);
  harness.contexts[0].resolveResume();
  const disposed = melody.play();
  melody.dispose();
  assert.equal(await disposed, false);
  harness.contexts[1].rejectResume(new Error('late resume failure'));
  await Promise.resolve();
  assertReleased(harness.contexts[1]);
  assert(harness.contexts.every((context) => context.nodes.length === 0));
  assert.equal(await melody.play(), false);
  assert.equal(harness.contexts.length, 2);
  assert.equal(harness.timers.size, 0);
  assert.deepEqual(melody.readFrame(), { progress: 0, level: 0 });
});

test('completion preserves the full audio-clock tail and then releases the graph', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  const context = await start(melody, harness);
  const deadline = [...harness.timers.values()][0].delay / 1000;
  const voices = context.nodes.filter((node) => node.kind === 'oscillator');
  assert(voices.length > 0 && voices.every((voice) => voice.stopAt < deadline));
  assert(context.nodes.some((node) => node.gain?.events.some((event) => event.value === 0 && event.time === deadline)), 'output must fade fully by the declared end');
  context.currentTime = 3;
  harness.fireNext();
  assert.equal(melody.isPlaying, true, 'wall-clock expiry alone must not truncate audio');
  assert.equal(harness.timers.size, 1);
  context.currentTime = deadline;
  harness.fireNext();
  assertReleased(context);
  assert.equal(melody.isPlaying, false);
  assert.equal(harness.timers.size, 0);
  assert.deepEqual(melody.readFrame(), { progress: 0, level: 0 });
});

test('unsupported audio and a rejected resume return false without leaking resources', async (t) => {
  const harness = audioHarness(t);
  const melody = createBirthdayMelody();
  const pending = melody.play();
  harness.contexts[0].rejectResume(new Error('audio unavailable'));
  assert.equal(await pending, false);
  assertReleased(harness.contexts[0]);
  assert.equal(harness.timers.size, 0);
  globalThis.AudioContext = undefined;
  assert.equal(await melody.play(), false);
});
