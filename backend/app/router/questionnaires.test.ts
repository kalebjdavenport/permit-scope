import { describe, expect, test } from "bun:test"
import { appRouter } from "./index"
import { createTestCaller } from "./test-helpers"

async function createProject(caller: ReturnType<typeof createTestCaller>) {
  return caller.projects.create({ name: "Test", location: "San Francisco, CA" })
}

describe("questionnaires router", () => {
  test("getByProject returns null when no questionnaire exists", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    const result = await caller.questionnaires.getByProject({ projectId: project.id })
    expect(result).toBeNull()
  })

  test("submit creates a questionnaire and returns permit result", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    const result = await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    expect(result.projectId).toBe(project.id)
    expect(result.permitResult).toBe("no_permit")
    expect(result.createdAt).toBeString()
  })

  test("submit uses project location for permit logic", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    const result = await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["exterior"], exteriorWork: ["deck_construction"] }
    })

    // SF + deck = in-house review
    expect(result.permitResult).toBe("in_house_review")
  })

  test("submit updates existing questionnaire on re-submit", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    const updated = await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["new_bathroom"] }
    })

    expect(updated.permitResult).toBe("in_house_review")

    // Should still be one questionnaire, not two
    const fetched = await caller.questionnaires.getByProject({ projectId: project.id })
    expect(fetched).not.toBeNull()
    expect(fetched!.permitResult).toBe("in_house_review")
  })

  test("submit throws NOT_FOUND for missing project", async () => {
    const caller = createTestCaller(appRouter)

    expect(
      caller.questionnaires.submit({
        projectId: "nonexistent",
        answers: { workType: ["interior"], interiorWork: ["flooring"] }
      })
    ).rejects.toThrow("Project not found")
  })

  test("delete removes questionnaire", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    await caller.questionnaires.delete({ projectId: project.id })

    const result = await caller.questionnaires.getByProject({ projectId: project.id })
    expect(result).toBeNull()
  })

  test("delete is idempotent for nonexistent questionnaire", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    const result = await caller.questionnaires.delete({ projectId: project.id })
    expect(result.success).toBe(true)
  })

  test("saveDraft creates a draft questionnaire", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    const result = await caller.questionnaires.saveDraft({
      projectId: project.id,
      answers: { workType: ["interior"] },
      currentIndex: 1
    })

    expect(result.status).toBe("draft")
    expect(result.currentIndex).toBe(1)
    expect(result.permitResult).toBeNull()
    expect(result.answers).toEqual({ workType: ["interior"] })
  })

  test("saveDraft updates an existing draft", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    await caller.questionnaires.saveDraft({
      projectId: project.id,
      answers: { workType: ["interior"] },
      currentIndex: 0
    })

    const updated = await caller.questionnaires.saveDraft({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] },
      currentIndex: 1
    })

    expect(updated.currentIndex).toBe(1)
    expect(updated.answers).toEqual({ workType: ["interior"], interiorWork: ["flooring"] })
  })

  test("saveDraft does not overwrite a submitted questionnaire", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    const result = await caller.questionnaires.saveDraft({
      projectId: project.id,
      answers: { workType: ["exterior"] },
      currentIndex: 0
    })

    expect(result.status).toBe("submitted")
    expect(result.permitResult).toBe("no_permit")
  })

  test("submit upgrades a draft to submitted", async () => {
    const caller = createTestCaller(appRouter)
    const project = await createProject(caller)

    await caller.questionnaires.saveDraft({
      projectId: project.id,
      answers: { workType: ["interior"] },
      currentIndex: 0
    })

    const result = await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    expect(result.status).toBe("submitted")
    expect(result.permitResult).toBe("no_permit")
  })
})
