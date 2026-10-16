import { describe, expect, test } from "bun:test"
import { z } from "zod"
import { fn } from "../../src/util/fn"

describe("fn", () => {
  test("calls callback with parsed input", () => {
    const greet = fn(z.object({ name: z.string() }), (input) => `Hello, ${input.name}!`)
    expect(greet({ name: "Alice" })).toBe("Hello, Alice!")
  })

  test("throws ZodError on invalid input", () => {
    const add = fn(z.object({ a: z.number(), b: z.number() }), (input) => input.a + input.b)
    expect(() => add({ a: "not a number" as any, b: 2 })).toThrow()
  })

  test("coerces and transforms input according to schema", () => {
    const schema = z.object({ value: z.string().transform((s) => s.toUpperCase()) })
    const identity = fn(schema, (input) => input.value)
    expect(identity({ value: "hello" })).toBe("HELLO")
  })

  test("force skips schema parsing", () => {
    const schema = z.object({ n: z.number() })
    const double = fn(schema, (input) => input.n * 2)
    // force bypasses validation so invalid data passes through
    expect(double.force({ n: "not a number" as any })).toBeNaN()
  })

  test("exposes the schema on the returned function", () => {
    const schema = z.object({ x: z.string() })
    const wrapped = fn(schema, (input) => input.x)
    expect(wrapped.schema).toBe(schema)
  })

  test("handles array schemas", () => {
    const sum = fn(z.array(z.number()), (nums) => nums.reduce((a, b) => a + b, 0))
    expect(sum([1, 2, 3])).toBe(6)
    expect(sum([])).toBe(0)
  })

  test("handles optional fields", () => {
    const wrapped = fn(z.object({ msg: z.string(), tag: z.string().optional() }), (input) => input.tag ?? input.msg)
    expect(wrapped({ msg: "hello" })).toBe("hello")
    expect(wrapped({ msg: "hello", tag: "world" })).toBe("world")
  })
})
