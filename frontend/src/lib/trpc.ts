import type { AppRouter } from "@permit-scope/backend"
import { QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        "type" in opts ? opts.type === "mutation" : true,
      logger(opts) {
        const { direction, path, input } = opts
        if (direction === "up") {
          console.log(`>> ${path}`, input ?? "")
          return
        }
        const { elapsedMs, result } = opts
        if (result instanceof Error) {
          console.error(`<< ${path} (${elapsedMs}ms)`, result.message)
          return
        }
        const inner = result.result as { data?: unknown; error?: unknown }
        if (inner.error) {
          console.error(`<< ${path} (${elapsedMs}ms)`, inner.error)
        } else {
          console.log(`<< ${path} (${elapsedMs}ms)`, inner.data ?? "")
        }
      }
    }),
    httpBatchLink({
      url: "http://localhost:3333/trpc"
    })
  ]
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient
})
