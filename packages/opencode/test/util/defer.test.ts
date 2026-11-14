import { describe, expect, test } from "bun:test"
import { defer } from "../../src/util/defer"

describe("defer", () => {
  test("calls sync function on [Symbol.dispose]", () => {
    let called = false
    const d = defer(() => {
      called = true
    })
    expect(called).toBe(false)
    ;(d as any)[Symbol.dispose]()
    expect(called).toBe(true)
  })

  test("calls function on [Symbol.asyncDispose]", async () => {
    let called = false
    const d = defer(() => {
      called = true
    })
    await (d as any)[Symbol.asyncDispose]()
    expect(called).toBe(true)
  })

  test("works with async using pattern via [Symbol.asyncDispose]", async () => {
    const events: string[] = []
    const d = defer(async () => {
      events.push("disposed")
    })
    events.push("before")
    await (d as any)[Symbol.asyncDispose]()
    events.push("after")
    expect(events).toEqual(["before", "disposed", "after"])
  })

  test("fn is called every time dispose is invoked", () => {
    let count = 0
    const d = defer(() => {
      count++
    })
    ;(d as any)[Symbol.dispose]()
    ;(d as any)[Symbol.dispose]()
    expect(count).toBe(2)
  })
})
