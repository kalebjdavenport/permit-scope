import { appRouter } from "#app/router/index.ts"
import { createContext } from "#core/trpc.ts"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()
  .use(cors())
  .get("/", (c) => c.text("OK"))
  .use("/trpc/*", trpcServer({ router: appRouter, createContext }))

const port = import.meta.env.PORT ? parseInt(import.meta.env.PORT) : 3333
const host = import.meta.env.HOST || "0.0.0.0"

export default { fetch: app.fetch, port, hostname: host }
