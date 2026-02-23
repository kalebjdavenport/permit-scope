import { ProjectStore } from "#app/stores/ProjectStore.ts"
import { QuestionnaireStore } from "#app/stores/QuestionnaireStore.ts"

type AppRouter = typeof import("./index")["appRouter"]

export function createTestCaller(router: AppRouter) {
  const projects = new ProjectStore()
  const questionnaires = new QuestionnaireStore()

  return router.createCaller({
    req: new Request("http://test"),
    cradle: { projects, questionnaires }
  })
}
