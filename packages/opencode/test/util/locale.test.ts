import { describe, expect, test } from "bun:test"
import { Locale } from "../../src/util/locale"

describe("Locale", () => {
  describe("titlecase", () => {
    test("capitalizes first letter of each word", () => {
      expect(Locale.titlecase("hello world")).toBe("Hello World")
      expect(Locale.titlecase("foo bar baz")).toBe("Foo Bar Baz")
    })

    test("handles already-capitalized words", () => {
      expect(Locale.titlecase("Hello World")).toBe("Hello World")
    })

    test("handles single word", () => {
      expect(Locale.titlecase("hello")).toBe("Hello")
    })

    test("handles empty string", () => {
      expect(Locale.titlecase("")).toBe("")
    })
  })

  describe("number", () => {
    test("formats numbers under 1000 as-is", () => {
      expect(Locale.number(0)).toBe("0")
      expect(Locale.number(999)).toBe("999")
      expect(Locale.number(500)).toBe("500")
    })

    test("formats thousands with K suffix", () => {
      expect(Locale.number(1000)).toBe("1.0K")
      expect(Locale.number(1500)).toBe("1.5K")
      expect(Locale.number(999999)).toBe("1000.0K")
    })

    test("formats millions with M suffix", () => {
      expect(Locale.number(1000000)).toBe("1.0M")
      expect(Locale.number(2500000)).toBe("2.5M")
    })
  })

  describe("truncate", () => {
    test("returns string unchanged if short enough", () => {
      expect(Locale.truncate("hello", 10)).toBe("hello")
      expect(Locale.truncate("hello", 5)).toBe("hello")
    })

    test("truncates long strings with ellipsis", () => {
      const result = Locale.truncate("hello world", 8)
      expect(result.length).toBe(8)
      expect(result.endsWith("…")).toBe(true)
    })
  })

  describe("truncateMiddle", () => {
    test("returns string unchanged if short enough", () => {
      expect(Locale.truncateMiddle("hello", 10)).toBe("hello")
    })

    test("truncates from middle with ellipsis", () => {
      const result = Locale.truncateMiddle("abcdefghijklmnopqrstuvwxyz", 10)
      expect(result.length).toBeLessThanOrEqual(10)
      expect(result).toContain("…")
    })
  })

  describe("pluralize", () => {
    test("returns singular for count 1", () => {
      expect(Locale.pluralize(1, "{} item", "{} items")).toBe("1 item")
    })

    test("returns plural for count 0", () => {
      expect(Locale.pluralize(0, "{} item", "{} items")).toBe("0 items")
    })

    test("returns plural for count > 1", () => {
      expect(Locale.pluralize(5, "{} item", "{} items")).toBe("5 items")
    })
  })

  describe("duration", () => {
    test("formats milliseconds", () => {
      expect(Locale.duration(500)).toBe("500ms")
      expect(Locale.duration(999)).toBe("999ms")
    })

    test("formats seconds", () => {
      expect(Locale.duration(1000)).toBe("1.0s")
      expect(Locale.duration(1500)).toBe("1.5s")
      expect(Locale.duration(59999)).toBe("60.0s")
    })

    test("formats minutes and seconds", () => {
      expect(Locale.duration(60000)).toBe("1m 0s")
      expect(Locale.duration(90000)).toBe("1m 30s")
    })

    test("formats hours and minutes", () => {
      expect(Locale.duration(3600000)).toBe("1h 0m")
      expect(Locale.duration(5400000)).toBe("1h 30m")
    })
  })
})
