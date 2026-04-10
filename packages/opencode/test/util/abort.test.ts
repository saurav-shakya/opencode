import { describe, expect, test } from "bun:test"
import { abortAfter, abortAfterAny } from "../../src/util/abort"

describe("abortAfter", () => {
  test("returns controller, signal and clearTimeout", () => {
    const { controller, signal, clearTimeout } = abortAfter(1000)
    expect(controller).toBeInstanceOf(AbortController)
    expect(signal).toBe(controller.signal)
    expect(typeof clearTimeout).toBe("function")
    clearTimeout()
  })

  test("signal is not aborted immediately", () => {
    const { signal, clearTimeout } = abortAfter(1000)
    expect(signal.aborted).toBe(false)
    clearTimeout()
  })

  test("signal aborts after timeout", async () => {
    const { signal } = abortAfter(20)
    expect(signal.aborted).toBe(false)
    await new Promise((r) => setTimeout(r, 40))
    expect(signal.aborted).toBe(true)
  })

  test("clearTimeout prevents abort", async () => {
    const { signal, clearTimeout } = abortAfter(20)
    clearTimeout()
    await new Promise((r) => setTimeout(r, 40))
    expect(signal.aborted).toBe(false)
  })
})

describe("abortAfterAny", () => {
  test("returns signal and clearTimeout", () => {
    const { signal, clearTimeout } = abortAfterAny(1000)
    expect(signal).toBeInstanceOf(AbortSignal)
    expect(typeof clearTimeout).toBe("function")
    clearTimeout()
  })

  test("aborts when external signal aborts", async () => {
    const external = new AbortController()
    const { signal, clearTimeout } = abortAfterAny(10000, external.signal)
    expect(signal.aborted).toBe(false)
    external.abort()
    await new Promise((r) => setTimeout(r, 5))
    expect(signal.aborted).toBe(true)
    clearTimeout()
  })

  test("aborts after timeout", async () => {
    const { signal } = abortAfterAny(20)
    expect(signal.aborted).toBe(false)
    await new Promise((r) => setTimeout(r, 40))
    expect(signal.aborted).toBe(true)
  })

  test("aborts when any of multiple signals aborts", async () => {
    const c1 = new AbortController()
    const c2 = new AbortController()
    const { signal, clearTimeout } = abortAfterAny(10000, c1.signal, c2.signal)
    c2.abort()
    await new Promise((r) => setTimeout(r, 5))
    expect(signal.aborted).toBe(true)
    clearTimeout()
  })
})
