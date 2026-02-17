import type { AppRouter } from "@permitflow/backend"
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
    loggerLink(),
    httpBatchLink({
      url: "http://localhost:3333/trpc"
    })
  ]
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient
})
