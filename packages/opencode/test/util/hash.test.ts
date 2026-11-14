import { describe, expect, test } from "bun:test"
import { Hash } from "../../src/util/hash"

describe("Hash", () => {
  describe("fast", () => {
    test("returns a hex string", () => {
      const result = Hash.fast("hello")
      expect(typeof result).toBe("string")
      expect(/^[0-9a-f]+$/.test(result)).toBe(true)
    })

    test("returns consistent results for the same input", () => {
      expect(Hash.fast("hello")).toBe(Hash.fast("hello"))
      expect(Hash.fast("world")).toBe(Hash.fast("world"))
    })

    test("returns different hashes for different inputs", () => {
      expect(Hash.fast("hello")).not.toBe(Hash.fast("world"))
      expect(Hash.fast("foo")).not.toBe(Hash.fast("bar"))
    })

    test("returns a 40-character SHA1 hex digest", () => {
      expect(Hash.fast("test").length).toBe(40)
    })

    test("handles empty string", () => {
      const result = Hash.fast("")
      expect(typeof result).toBe("string")
      expect(result.length).toBe(40)
    })

    test("accepts Buffer input", () => {
      const buf = Buffer.from("hello")
      const str = "hello"
      expect(Hash.fast(buf)).toBe(Hash.fast(str))
    })

    test("handles unicode input", () => {
      const result = Hash.fast("こんにちは")
      expect(result.length).toBe(40)
      expect(Hash.fast("こんにちは")).toBe(Hash.fast("こんにちは"))
    })
  })
})
