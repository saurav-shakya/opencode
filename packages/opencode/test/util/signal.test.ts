import { describe, expect, test } from "bun:test"
import { signal } from "../../src/util/signal"

describe("signal", () => {
  test("wait() resolves after trigger() is called", async () => {
    const s = signal()
    let resolved = false
    const p = s.wait().then(() => {
      resolved = true
    })
    expect(resolved).toBe(false)
    s.trigger()
    await p
    expect(resolved).toBe(true)
  })

  test("wait() can be called multiple times and all resolve", async () => {
    const s = signal()
    const results: number[] = []
    const p1 = s.wait().then(() => results.push(1))
    const p2 = s.wait().then(() => results.push(2))
    s.trigger()
    await Promise.all([p1, p2])
    expect(results.sort()).toEqual([1, 2])
  })

  test("wait() resolves immediately if trigger() was already called", async () => {
    const s = signal()
    s.trigger()
    let resolved = false
    await s.wait().then(() => {
      resolved = true
    })
    expect(resolved).toBe(true)
  })

  test("trigger() returns a value (resolves the underlying promise)", () => {
    const s = signal()
    // trigger returns the result of resolve(), which is undefined
    const result = s.trigger()
    expect(result).toBeUndefined()
  })
})
