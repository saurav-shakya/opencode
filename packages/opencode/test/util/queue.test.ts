import { describe, expect, test } from "bun:test"
import { AsyncQueue, work } from "../../src/util/queue"

describe("AsyncQueue", () => {
  test("returns items in FIFO order", async () => {
    const q = new AsyncQueue<number>()
    q.push(1)
    q.push(2)
    q.push(3)
    expect(await q.next()).toBe(1)
    expect(await q.next()).toBe(2)
    expect(await q.next()).toBe(3)
  })

  test("resolves pending next() when item is pushed", async () => {
    const q = new AsyncQueue<string>()
    const p = q.next()
    q.push("hello")
    expect(await p).toBe("hello")
  })

  test("handles mixed push-before and push-after patterns", async () => {
    const q = new AsyncQueue<number>()
    q.push(10)
    // p resolves immediately with 10 since it was already queued
    const p = q.next()
    q.push(20)
    // now only 20 remains in the queue
    expect(await p).toBe(10)
    expect(await q.next()).toBe(20)
  })

  test("asyncIterator yields pushed values", async () => {
    const q = new AsyncQueue<number>()
    const results: number[] = []

    q.push(1)
    q.push(2)
    q.push(3)

    let count = 0
    for await (const val of q) {
      results.push(val)
      count++
      if (count === 3) break
    }

    expect(results).toEqual([1, 2, 3])
  })

  test("multiple consumers each get distinct items", async () => {
    const q = new AsyncQueue<number>()
    const p1 = q.next()
    const p2 = q.next()
    q.push(100)
    q.push(200)
    const [v1, v2] = await Promise.all([p1, p2])
    expect(new Set([v1, v2])).toEqual(new Set([100, 200]))
  })
})

describe("work", () => {
  test("processes all items", async () => {
    const processed: number[] = []
    await work(2, [1, 2, 3, 4, 5], async (item) => {
      processed.push(item)
    })
    expect(processed.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  test("respects concurrency limit", async () => {
    let active = 0
    let maxActive = 0
    await work(2, [1, 2, 3, 4], async () => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise((r) => setTimeout(r, 10))
      active--
    })
    expect(maxActive).toBeLessThanOrEqual(2)
  })

  test("handles empty items", async () => {
    let called = false
    await work(4, [], async () => {
      called = true
    })
    expect(called).toBe(false)
  })

  test("handles single concurrency", async () => {
    const processed: number[] = []
    await work(1, [1, 2, 3], async (item) => {
      processed.push(item)
    })
    expect(processed.length).toBe(3)
    expect(processed.sort((a, b) => a - b)).toEqual([1, 2, 3])
  })
})
