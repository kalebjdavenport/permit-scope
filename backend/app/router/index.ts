import { projects } from "#app/router/projects.ts"
import { router } from "#core/trpc.ts"

/**
 * This is the main tRPC router. For more information on tRPC, visit https://trpc.io/.
 */
export const appRouter = router({
  projects: projects
})
