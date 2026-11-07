import MongoRateLimitStore from '../services/MongoRateLimitStore.js'

describe('Mongo-backed rate-limit store', () => {
  test('shares atomic counters across independent store instances', async () => {
    const workerA = new MongoRateLimitStore('multi-worker-test')
    const workerB = new MongoRateLimitStore('multi-worker-test')
    workerA.init({ windowMs: 60_000 })
    workerB.init({ windowMs: 60_000 })

    expect(await workerA.increment('client')).toMatchObject({ totalHits: 1 })
    expect(await workerB.increment('client')).toMatchObject({ totalHits: 2 })
    const burst = await Promise.all(Array.from({ length: 24 }, (_, index) => (index % 2 ? workerA : workerB).increment('parallel-client')))
    expect(burst).toHaveLength(24)
    expect(await workerA.get('parallel-client')).toMatchObject({ totalHits: 24, resetTime: expect.any(Date) })

    await workerB.decrement('client')
    expect(await workerA.get('client')).toMatchObject({ totalHits: 1 })
    await workerA.resetKey('client')
    expect(await workerB.get('client')).toBeUndefined()
    await workerB.resetKey('parallel-client')
  })

  test('resets expired fixed windows', async () => {
    const workerA = new MongoRateLimitStore('expiry-test')
    const workerB = new MongoRateLimitStore('expiry-test')
    workerA.init({ windowMs: 40 })
    workerB.init({ windowMs: 40 })
    const initial = await workerA.increment('client')
    await new Promise(resolve => setTimeout(resolve, 60))
    const nextWindow = await workerB.increment('client')
    expect(initial.totalHits).toBe(1)
    expect(nextWindow.totalHits).toBe(1)
    expect(nextWindow.resetTime.getTime()).toBeGreaterThan(initial.resetTime.getTime())
  })
})
