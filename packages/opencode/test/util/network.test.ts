import { describe, expect, test } from "bun:test"
import { online, proxied } from "../../src/util/network"

describe("network", () => {
  describe("online", () => {
    test("returns a boolean", () => {
      expect(typeof online()).toBe("boolean")
    })

    test("returns true when navigator.onLine is not a boolean", () => {
      // In environments without navigator.onLine as a boolean, defaults to true
      const nav = globalThis.navigator
      if (!nav || typeof nav.onLine !== "boolean") {
        expect(online()).toBe(true)
      }
    })
  })

  describe("proxied", () => {
    test("returns false when no proxy env vars are set", () => {
      const vars = ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"]
      const saved: Record<string, string | undefined> = {}
      for (const v of vars) {
        saved[v] = process.env[v]
        delete process.env[v]
      }
      try {
        expect(proxied()).toBe(false)
      } finally {
        for (const v of vars) {
          if (saved[v] !== undefined) process.env[v] = saved[v]
        }
      }
    })

    test("returns true when HTTP_PROXY is set", () => {
      const orig = process.env["HTTP_PROXY"]
      process.env["HTTP_PROXY"] = "http://proxy.example.com"
      try {
        expect(proxied()).toBe(true)
      } finally {
        if (orig === undefined) delete process.env["HTTP_PROXY"]
        else process.env["HTTP_PROXY"] = orig
      }
    })

    test("returns true when HTTPS_PROXY is set", () => {
      const orig = process.env["HTTPS_PROXY"]
      process.env["HTTPS_PROXY"] = "http://proxy.example.com"
      try {
        expect(proxied()).toBe(true)
      } finally {
        if (orig === undefined) delete process.env["HTTPS_PROXY"]
        else process.env["HTTPS_PROXY"] = orig
      }
    })

    test("returns true when lowercase http_proxy is set", () => {
      const orig = process.env["http_proxy"]
      process.env["http_proxy"] = "http://proxy.example.com"
      try {
        expect(proxied()).toBe(true)
      } finally {
        if (orig === undefined) delete process.env["http_proxy"]
        else process.env["http_proxy"] = orig
      }
    })
  })
})
