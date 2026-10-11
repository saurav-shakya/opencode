import { expect } from "bun:test"
import { Context, Effect, Layer } from "effect"
import { HttpEffect, HttpRouter, HttpServer } from "effect/http"
import { tmpdirScoped } from "../../core/test/fixture/tmpdir"
import { it } from "../../core/test/lib/effect"
import { createRoutes } from "../src/routes"

it.live("path params longer than 100 characters reach their handler", () =>
  Effect.gen(function* () {
    const tmp = yield* tmpdirScoped("opencode-router-")
    const context = yield* Layer.build(
      createRoutes({
        database: { path: ":memory:" },
        models: { fetch: false },
        fs: { filewatcher: false },
        config: { directory: tmp.path, project: false },
      }).pipe(Layer.provide(HttpServer.layerServices)),
    )
    const handler = Context.get(context, HttpRouter.HttpRouter)
      .asHttpEffect()
      .pipe(HttpEffect.toWebHandlerWith(context))
    const id = "p".repeat(300)
    const url = new URL(`/api/provider/${id}`, "http://opencode.local")
    url.searchParams.set("location[directory]", tmp.path)
    const response = yield* Effect.promise((signal) => handler(new Request(url, { signal })))
    expect(response.status).toBe(404)
    expect(yield* Effect.promise(() => response.json())).toMatchObject({
      _tag: "ProviderNotFoundError",
      providerID: id,
    })
  }),
)
