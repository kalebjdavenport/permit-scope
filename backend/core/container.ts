import { ProjectStore } from "#app/stores/ProjectStore.ts"
import { QuestionnaireStore } from "#app/stores/QuestionnaireStore.ts"
import { asValue, createContainer } from "awilix"

type Cradle = {
  projects: ProjectStore
  questionnaires: QuestionnaireStore
}

const container = createContainer<Cradle>()

container.register({
  projects: asValue(new ProjectStore()),
  questionnaires: asValue(new QuestionnaireStore())
})

export { container }
