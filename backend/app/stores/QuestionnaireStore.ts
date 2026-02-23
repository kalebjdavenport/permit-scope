import type { PermitOutcome } from "#app/logic/index.ts"
import { Store, type StoreItem } from "#core/Store.ts"

export interface Questionnaire extends StoreItem {
  projectId: string
  answers: Record<string, string[]>
  status: "draft" | "submitted"
  currentIndex: number
  permitResult: PermitOutcome | null
}

export class QuestionnaireStore extends Store<Questionnaire> {
  constructor() {
    super("questionnaires")
  }

  getByProjectId(projectId: string) {
    return this.getAll().find((item) => item.projectId === projectId)
  }

  toModel(item: Questionnaire) {
    const model = super.toModel(item)

    return {
      ...model,
      projectId: item.projectId,
      answers: item.answers,
      status: item.status,
      currentIndex: item.currentIndex,
      permitResult: item.permitResult
    }
  }
}
