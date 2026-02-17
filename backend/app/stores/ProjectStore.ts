import { Store, type StoreItem } from "#core/Store.ts"

interface Project extends StoreItem {
  name: string
  location: string
}

export class ProjectStore extends Store<Project> {
  constructor() {
    super("projects")
  }

  toModel(item: Project) {
    const model = super.toModel(item)

    return {
      ...model,
      name: item.name,
      location: item.location
    }
  }
}
