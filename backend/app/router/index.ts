import { projects } from "#app/router/projects.ts"
import { questionnaires } from "#app/router/questionnaires.ts"
import { router } from "#core/trpc.ts"

/**
 * This is the main tRPC router. For more information on tRPC, visit https://trpc.io/.
 */
export const appRouter = router({
  projects: projects,
  questionnaires: questionnaires
})
