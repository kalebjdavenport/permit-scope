import { initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { container } from "./container"

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const cradle = container.cradle

  return {
    req: opts.req,
    cradle
  }
}

const trpc = initTRPC.context<typeof createContext>().create()

export const router = trpc.router
export const procedure = trpc.procedure
