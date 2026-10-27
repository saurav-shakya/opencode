import { beforeEach, expect, test } from "bun:test"
import { takeDraft } from "../src/component/prompt/draft-stash"
import { createAppFixture } from "./fixture/app"
import { directory, json } from "./fixture/tui-client"

// Earlier app tests in this process can leave a home draft that the prompt would restore.
beforeEach(() => takeDraft(undefined))

test("a single-line file mention sends only that line", async () => {
  const location = { directory, project: { id: "proj_test", directory, canonical: directory } }
  const submitted = Promise.withResolvers<unknown>()
  let session: unknown
  await using setup = await createAppFixture({
    config: { animations: false, tabs: { mode: "off" } },
    fetch: async (url, request) => {
      if (url.pathname === "/api/location") return json(location)
      if (url.pathname === "/api/fs/find") return json({ location, data: [{ path: "big.txt", type: "file" }] })
      if (url.pathname === "/api/agent")
        return json({ location, data: [{ id: "build", mode: "primary", hidden: false, permissions: [] }] })
      if (url.pathname === "/api/model")
        return json({ location, data: [{ id: "model", providerID: "provider", name: "Remote Model", variants: [] }] })
      if (url.pathname === "/api/provider") return json({ location, data: [{ id: "provider", name: "Provider" }] })
      if (url.pathname === "/api/session" && request.method === "POST") {
        session = {
          ...(await request.json()),
          projectID: "project",
          cost: 0,
          tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
          time: { created: 0, updated: 0 },
        }
        return json({ data: session })
      }
      if (/^\/api\/session\/[^/]+\/prompt$/.test(url.pathname)) {
        submitted.resolve(await request.json())
        return json({ data: {} })
      }
      if (/^\/api\/session\/[^/]+\/(message|inbox|permission)$/.test(url.pathname))
        return json({ data: [], cursor: {} })
      if (session && /^\/api\/session\/[^/]+$/.test(url.pathname)) return json({ data: session })
    },
  })
  await setup.ready
  await setup.waitForFrame((frame) => frame.includes("Build · Remote Model Provider"))
  await setup.mockInput.typeText("@big.txt#10-10")
  // The suggestion row labels the range; the typed "#10-10" stays visible in the input below it.
  await setup.waitForFrame((frame) => /┃ big\.txt#10 /.test(frame))
  setup.mockInput.pressEnter()
  const editor = setup.renderer.currentFocusedEditor!
  await setup.waitFor(() => editor.plainText === "@big.txt#10 ")
  setup.mockInput.pressEnter()
  const body = JSON.stringify(await submitted.promise)
  expect(body).toContain("big.txt?start=10&end=10")
})
