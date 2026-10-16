import { describe, expect, test } from "bun:test"
import { Color } from "../../src/util/color"

describe("Color", () => {
  describe("isValidHex", () => {
    test("accepts valid 6-digit hex colors", () => {
      expect(Color.isValidHex("#000000")).toBe(true)
      expect(Color.isValidHex("#ffffff")).toBe(true)
      expect(Color.isValidHex("#FFFFFF")).toBe(true)
      expect(Color.isValidHex("#1a2b3c")).toBe(true)
      expect(Color.isValidHex("#abcdef")).toBe(true)
      expect(Color.isValidHex("#ABCDEF")).toBe(true)
    })

    test("rejects invalid hex strings", () => {
      expect(Color.isValidHex("#12345")).toBe(false)
      expect(Color.isValidHex("#1234567")).toBe(false)
      expect(Color.isValidHex("000000")).toBe(false)
      expect(Color.isValidHex("#gggggg")).toBe(false)
      expect(Color.isValidHex("#xyz123")).toBe(false)
      expect(Color.isValidHex("")).toBe(false)
      expect(Color.isValidHex("#")).toBe(false)
    })

    test("rejects undefined and falsy values", () => {
      expect(Color.isValidHex(undefined)).toBe(false)
      expect(Color.isValidHex("")).toBe(false)
    })
  })

  describe("hexToRgb", () => {
    test("converts black", () => {
      expect(Color.hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 })
    })

    test("converts white", () => {
      expect(Color.hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 })
    })

    test("converts red", () => {
      expect(Color.hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 })
    })

    test("converts green", () => {
      expect(Color.hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 })
    })

    test("converts blue", () => {
      expect(Color.hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 })
    })

    test("converts mixed color", () => {
      expect(Color.hexToRgb("#1a2b3c")).toEqual({ r: 26, g: 43, b: 60 })
    })

    test("handles uppercase hex", () => {
      expect(Color.hexToRgb("#FF8040")).toEqual({ r: 255, g: 128, b: 64 })
    })
  })

  describe("hexToAnsiBold", () => {
    test("returns undefined for invalid hex", () => {
      expect(Color.hexToAnsiBold("#12345")).toBeUndefined()
      expect(Color.hexToAnsiBold(undefined)).toBeUndefined()
      expect(Color.hexToAnsiBold("")).toBeUndefined()
    })

    test("returns ANSI escape sequence for valid hex", () => {
      const result = Color.hexToAnsiBold("#ff0000")
      expect(result).toBeDefined()
      expect(result).toContain("255")
      expect(result).toContain("0")
      expect(result).toContain("\x1b[")
    })

    test("includes bold escape code", () => {
      const result = Color.hexToAnsiBold("#ffffff")
      expect(result).toContain("\x1b[1m")
    })

    test("encodes RGB values correctly", () => {
      const result = Color.hexToAnsiBold("#0080ff")
      expect(result).toBe("\x1b[38;2;0;128;255m\x1b[1m")
    })
  })
})
