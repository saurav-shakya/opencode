import { describe, expect, test } from "bun:test"
import { Token } from "../../src/util/token"

describe("Token", () => {
  describe("estimate", () => {
    test("returns 0 for empty string", () => {
      expect(Token.estimate("")).toBe(0)
    })

    test("estimates tokens based on character count divided by 4", () => {
      expect(Token.estimate("abcd")).toBe(1)
      expect(Token.estimate("abcdefgh")).toBe(2)
      expect(Token.estimate("a".repeat(100))).toBe(25)
    })

    test("rounds to nearest integer", () => {
      // 5 chars / 4 = 1.25, rounds to 1
      expect(Token.estimate("hello")).toBe(1)
      // 6 chars / 4 = 1.5, rounds to 2
      expect(Token.estimate("hello!")).toBe(2)
    })

    test("returns at least 0 (non-negative)", () => {
      expect(Token.estimate("")).toBeGreaterThanOrEqual(0)
      expect(Token.estimate("x")).toBeGreaterThanOrEqual(0)
    })

    test("handles longer text", () => {
      const text = "The quick brown fox jumps over the lazy dog"
      const expected = Math.max(0, Math.round(text.length / 4))
      expect(Token.estimate(text)).toBe(expected)
    })

    test("handles whitespace", () => {
      expect(Token.estimate("    ")).toBe(1)
      expect(Token.estimate(" ")).toBe(0)
    })
  })
})
