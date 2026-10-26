import { expect, test } from "bun:test"
import { fileLineRange, parseFileLineRange, parseSlashHead } from "../../src/prompt/parse"

test("preserves file line-range parsing semantics", () => {
  expect([
    parseFileLineRange("src/app.ts#12-20"),
    parseFileLineRange("src/app.ts#12-"),
    parseFileLineRange("src/app.ts#12-12"),
    parseFileLineRange("src/app.ts#bad"),
    parseFileLineRange("src/app.ts"),
  ]).toEqual([
    { base: "src/app.ts", lineRange: { startLine: 12, endLine: 20 } },
    { base: "src/app.ts", lineRange: { startLine: 12, endLine: undefined } },
    { base: "src/app.ts", lineRange: { startLine: 12, endLine: 12 } },
    { base: "src/app.ts" },
    { base: "src/app.ts" },
  ])
})

test("keeps a single-line range bounded instead of reading to the end of the file", () => {
  expect(fileLineRange(10, 10)).toEqual({ startLine: 10, endLine: 10 })
  expect(fileLineRange(10, 12)).toEqual({ startLine: 10, endLine: 12 })
  expect(fileLineRange(10, 9)).toEqual({ startLine: 10, endLine: undefined })
  expect(fileLineRange(10)).toEqual({ startLine: 10, endLine: undefined })
})

test("keeps frontend-specific slash separators", () => {
  expect(parseSlashHead("/editor\rfirst")).toEqual({ name: "editor\rfirst", arguments: "", end: 13 })
  expect(parseSlashHead("/editor\rfirst", /\s/)).toEqual({ name: "editor", arguments: "first", end: 7 })
  expect(parseSlashHead("editor")).toBeUndefined()
})
