import { ProjectStore } from "#app/stores/ProjectStore.ts"
import { asValue, createContainer } from "awilix"

type Cradle = {
  projects: ProjectStore
}

const container = createContainer<Cradle>()

container.register({
  projects: asValue(new ProjectStore())
})

export { container }
