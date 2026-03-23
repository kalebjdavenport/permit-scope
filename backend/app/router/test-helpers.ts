import { ProjectStore } from "#app/stores/ProjectStore.ts"
import { QuestionnaireStore } from "#app/stores/QuestionnaireStore.ts"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

type AppRouter = typeof import("./index")["appRouter"]

class TestProjectStore extends ProjectStore {
  constructor(baseDir: string) {
    super()
    this.storePath = path.join(baseDir, "projects.json")
  }

  protected async load() {
    // Tests should start from empty state instead of loading persisted JSON.
  }
}

class TestQuestionnaireStore extends QuestionnaireStore {
  constructor(baseDir: string) {
    super()
    this.storePath = path.join(baseDir, "questionnaires.json")
  }

  protected async load() {
    // Tests should start from empty state instead of loading persisted JSON.
  }
}

function createIsolatedStores() {
  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), "permit-scope-router-tests-"))
  return {
    projects: new TestProjectStore(sandboxDir),
    questionnaires: new TestQuestionnaireStore(sandboxDir)
  }
}

export function createTestCaller(router: AppRouter) {
  const { projects, questionnaires } = createIsolatedStores()

  return router.createCaller({
    req: new Request("http://test"),
    cradle: { projects, questionnaires }
  })
}
