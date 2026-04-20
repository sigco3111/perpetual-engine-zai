import { describe, it, expect, beforeEach } from 'vitest';
import { ConcurrencyLimiter } from '../../../src/core/session/concurrency-limiter.js';

function deferred<T = void>() {
  let resolve: (v?: T) => void;
  let reject: (err?: any) => void;
  const p = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise: p, resolve: resolve!, reject: reject! };
}

function tick() {
  return new Promise<void>((res) => setImmediate(res));
}

describe('ConcurrencyLimiter', () => {
  let limiter: ConcurrencyLimiter;

  beforeEach(() => {
    limiter = new ConcurrencyLimiter();
  });

  it('acquire() + release() basic lifecycle works', async () => {
    let ran = false;
    const p = limiter.acquire('prov', 'model-a', 'role', async () => { ran = true; });

    // after enqueue/process, running count should be 1
    expect(limiter.getRunningCount('prov', 'model-a')).toBe(1);

    await p;
    await tick();
    expect(ran).toBe(true);
    expect(limiter.getRunningCount('prov', 'model-a')).toBe(0);
  });

  it('acquire() blocks when limit is reached and queued acquire resolves after release()', async () => {
    // set rule: provider 'zai' model 'glm-5-turbo' has limit 1
    limiter.loadRules({ zai: { 'glm-5-turbo': 1 } });

    // First task controlled; will stay running until we resolve
    const t1 = deferred<void>();
    const exec1 = () => t1.promise;

    const started1 = limiter.acquire('zai', 'glm-5-turbo', 'cto', exec1);
    // first started -> running count 1
    expect(limiter.getRunningCount('zai', 'glm-5-turbo')).toBe(1);

    // second task will be queued because limit is 1
    let ran2 = false;
    const exec2 = async () => { ran2 = true; };
    const p2 = limiter.acquire('zai', 'glm-5-turbo', 'cto', exec2);

    // still only one running, queue should hold 1
    expect(limiter.getRunningCount('zai', 'glm-5-turbo')).toBe(1);
    const statusBefore = limiter.getStatus();
    expect(statusBefore.queued).toBeGreaterThanOrEqual(1);

    // resolve first task -> it will release and allow second to run
    t1.resolve();
    await started1; // first completes

    // wait for second to finish (note: task.resolve happens before final release),
    await p2;
    await tick();
    expect(ran2).toBe(true);
    expect(limiter.getRunningCount('zai', 'glm-5-turbo')).toBe(0);
  });

  it('getRunningCount() returns correct values for multiple concurrent tasks', async () => {
    limiter.loadRules({ p: { 'm': 3 } });

    const controls = Array.from({ length: 4 }, () => deferred<void>());
    const promises = controls.map((d, i) => limiter.acquire('p', 'm', `r${i}`, () => d.promise));

    // three should be running (limit 3), one queued
    expect(limiter.getRunningCount('p', 'm')).toBe(3);
    expect(limiter.getAvailableSlots('p', 'm')).toBe(0);

    // release one by resolving its deferred
    controls[0].resolve();
    await promises[0];

    // now one queued task should have started, running remains 3
    expect(limiter.getRunningCount('p', 'm')).toBe(3);

    // resolve remaining to clean up
    controls.slice(1).forEach(c => c.resolve());
    await Promise.all(promises);
    await tick();
    expect(limiter.getRunningCount('p', 'm')).toBe(0);
  });

  it('model-level limits work (glm-5-turbo=1, glm-4.5=10)', () => {
    limiter.loadRules({ zai: { 'glm-5-turbo': 1, 'glm-4.5': 10 } });
    expect(limiter.getMaxConcurrency('zai', 'glm-5-turbo')).toBe(1);
    expect(limiter.getMaxConcurrency('zai', 'glm-4.5')).toBe(10);
    // default for unknown model
    expect(limiter.getMaxConcurrency('zai', 'something-else')).toBe(1);
  });

  it('multiple providers with different limits work independently', async () => {
    limiter.loadRules({ a: { 'm': 1 }, b: { 'm': 2 } });

    const dA = deferred<void>();
    const pA = limiter.acquire('a', 'm', 'ra', () => dA.promise);
    expect(limiter.getRunningCount('a', 'm')).toBe(1);

    // provider b can run up to 2 concurrently even while a is saturated
    const dB1 = deferred<void>();
    const dB2 = deferred<void>();
    const pb1 = limiter.acquire('b', 'm', 'rb1', () => dB1.promise);
    const pb2 = limiter.acquire('b', 'm', 'rb2', () => dB2.promise);
    expect(limiter.getRunningCount('b', 'm')).toBe(2);

    // clean up
    dA.resolve();
    dB1.resolve();
    dB2.resolve();
    await Promise.all([pA, pb1, pb2]);
    await tick();
    expect(limiter.getRunningCount('a', 'm')).toBe(0);
    expect(limiter.getRunningCount('b', 'm')).toBe(0);
  });

  it("acquire() for different models don't interfere with each other", async () => {
    limiter.loadRules({ p: { 'alpha': 1, 'beta': 2 } });

    const da = deferred<void>();
    const db1 = deferred<void>();
    const db2 = deferred<void>();

    const pa = limiter.acquire('p', 'alpha', 'ra', () => da.promise);
    const pb1 = limiter.acquire('p', 'beta', 'rb1', () => db1.promise);
    const pb2 = limiter.acquire('p', 'beta', 'rb2', () => db2.promise);

    expect(limiter.getRunningCount('p', 'alpha')).toBe(1);
    expect(limiter.getRunningCount('p', 'beta')).toBe(2);

    da.resolve();
    db1.resolve();
    db2.resolve();
    await Promise.all([pa, pb1, pb2]);
    await tick();
    expect(limiter.getRunningCount('p', 'alpha')).toBe(0);
    expect(limiter.getRunningCount('p', 'beta')).toBe(0);
  });

  it('edge case: acquire/release same key multiple times and repeated release does not go negative', async () => {
    // default limit 1
    const d1 = deferred<void>();
    const p1 = limiter.acquire('x', 'y', 'r', () => d1.promise);
    expect(limiter.getRunningCount('x', 'y')).toBe(1);

    // manual extra release (should clamp to 0)
    limiter.release('x', 'y');
    limiter.release('x', 'y');
    // still 0 or non-negative
    expect(limiter.getRunningCount('x', 'y')).toBe(0);

    d1.resolve();
    await p1;
    await tick();
    expect(limiter.getRunningCount('x', 'y')).toBe(0);
  });
});
