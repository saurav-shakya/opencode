import { describe, expect, test } from "bun:test"
import { Keybind } from "../../src/util/keybind"

describe("Keybind", () => {
  describe("match", () => {
    test("returns false when first argument is undefined", () => {
      expect(Keybind.match(undefined, { name: "a", ctrl: false, meta: false, shift: false, leader: false })).toBe(false)
    })

    test("returns true for identical keybinds", () => {
      const info: Keybind.Info = { name: "a", ctrl: false, meta: false, shift: false, leader: false }
      expect(Keybind.match(info, info)).toBe(true)
    })

    test("returns false for different key names", () => {
      const a: Keybind.Info = { name: "a", ctrl: false, meta: false, shift: false, leader: false }
      const b: Keybind.Info = { name: "b", ctrl: false, meta: false, shift: false, leader: false }
      expect(Keybind.match(a, b)).toBe(false)
    })

    test("returns false when modifier differs", () => {
      const a: Keybind.Info = { name: "c", ctrl: true, meta: false, shift: false, leader: false }
      const b: Keybind.Info = { name: "c", ctrl: false, meta: false, shift: false, leader: false }
      expect(Keybind.match(a, b)).toBe(false)
    })

    test("normalizes undefined super to false", () => {
      const a: Keybind.Info = { name: "x", ctrl: false, meta: false, shift: false, leader: false }
      const b: Keybind.Info = { name: "x", ctrl: false, meta: false, shift: false, leader: false, super: undefined }
      expect(Keybind.match(a, b)).toBe(true)
    })
  })

  describe("toString", () => {
    test("returns empty string for undefined", () => {
      expect(Keybind.toString(undefined)).toBe("")
    })

    test("returns just the key name for simple keys", () => {
      expect(Keybind.toString({ name: "a", ctrl: false, meta: false, shift: false, leader: false })).toBe("a")
    })

    test("includes ctrl modifier", () => {
      expect(Keybind.toString({ name: "c", ctrl: true, meta: false, shift: false, leader: false })).toBe("ctrl+c")
    })

    test("includes meta/alt modifier", () => {
      expect(Keybind.toString({ name: "b", ctrl: false, meta: true, shift: false, leader: false })).toBe("alt+b")
    })

    test("includes shift modifier", () => {
      expect(Keybind.toString({ name: "s", ctrl: false, meta: false, shift: true, leader: false })).toBe("shift+s")
    })

    test("includes leader prefix", () => {
      expect(Keybind.toString({ name: "p", ctrl: false, meta: false, shift: false, leader: true })).toBe("<leader> p")
    })

    test("returns <leader> alone when name is empty", () => {
      expect(Keybind.toString({ name: "", ctrl: false, meta: false, shift: false, leader: true })).toBe("<leader>")
    })

    test("translates delete to del", () => {
      expect(Keybind.toString({ name: "delete", ctrl: false, meta: false, shift: false, leader: false })).toBe("del")
    })

    test("combines multiple modifiers", () => {
      const result = Keybind.toString({ name: "z", ctrl: true, meta: false, shift: true, leader: false })
      expect(result).toContain("ctrl")
      expect(result).toContain("shift")
      expect(result).toContain("z")
    })
  })

  describe("parse", () => {
    test("returns empty array for 'none'", () => {
      expect(Keybind.parse("none")).toEqual([])
    })

    test("parses simple key", () => {
      const result = Keybind.parse("a")
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("a")
      expect(result[0].ctrl).toBe(false)
      expect(result[0].meta).toBe(false)
    })

    test("parses ctrl modifier", () => {
      const result = Keybind.parse("ctrl+c")
      expect(result).toHaveLength(1)
      expect(result[0].ctrl).toBe(true)
      expect(result[0].name).toBe("c")
    })

    test("parses alt/meta modifier", () => {
      const result = Keybind.parse("alt+b")
      expect(result[0].meta).toBe(true)
      expect(result[0].name).toBe("b")
    })

    test("parses shift modifier", () => {
      const result = Keybind.parse("shift+s")
      expect(result[0].shift).toBe(true)
      expect(result[0].name).toBe("s")
    })

    test("parses leader modifier", () => {
      const result = Keybind.parse("<leader>p")
      expect(result[0].leader).toBe(true)
      expect(result[0].name).toBe("p")
    })

    test("parses esc to escape", () => {
      const result = Keybind.parse("esc")
      expect(result[0].name).toBe("escape")
    })

    test("parses comma-separated combos", () => {
      const result = Keybind.parse("ctrl+c,ctrl+d")
      expect(result).toHaveLength(2)
      expect(result[0].ctrl).toBe(true)
      expect(result[0].name).toBe("c")
      expect(result[1].ctrl).toBe(true)
      expect(result[1].name).toBe("d")
    })

    test("is case-insensitive", () => {
      const result = Keybind.parse("CTRL+C")
      expect(result[0].ctrl).toBe(true)
      expect(result[0].name).toBe("c")
    })
  })
})
