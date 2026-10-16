import { describe, expect, test } from "bun:test"
import { isRecord } from "../../src/util/record"

describe("isRecord", () => {
  test("returns true for plain objects", () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord({ nested: { x: 2 } })).toBe(true)
  })

  test("returns false for arrays", () => {
    expect(isRecord([])).toBe(false)
    expect(isRecord([1, 2, 3])).toBe(false)
  })

  test("returns false for null", () => {
    expect(isRecord(null)).toBe(false)
  })

  test("returns false for primitives", () => {
    expect(isRecord("string")).toBe(false)
    expect(isRecord(42)).toBe(false)
    expect(isRecord(true)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
  })

  test("returns true for object with numeric keys", () => {
    expect(isRecord({ 0: "a", 1: "b" })).toBe(true)
  })

  test("returns false for class instances that are arrays", () => {
    class MyArr extends Array {}
    expect(isRecord(new MyArr())).toBe(false)
  })
})
