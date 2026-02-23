import { describe, expect, test } from "bun:test"
import { appRouter } from "./index"
import { createTestCaller } from "./test-helpers"

describe("projects router", () => {
  test("create returns serialized model with ISO string dates", async () => {
    const caller = createTestCaller(appRouter)
    const project = await caller.projects.create({
      name: "Test Project",
      location: "San Francisco, CA"
    })

    expect(project.id).toBeString()
    expect(project.name).toBe("Test Project")
    expect(project.location).toBe("San Francisco, CA")
    expect(project.createdAt).toBeString()
    expect(() => new Date(project.createdAt).toISOString()).not.toThrow()
  })

  test("get returns serialized model with ISO string dates", async () => {
    const caller = createTestCaller(appRouter)
    const created = await caller.projects.create({
      name: "Test",
      location: "San Francisco, CA"
    })

    const fetched = await caller.projects.get({ id: created.id })

    expect(fetched.createdAt).toBeString()
    expect(fetched.createdAt).toBe(created.createdAt)
    expect(fetched.name).toBe("Test")
    expect(fetched.location).toBe("San Francisco, CA")
  })

  test("list returns serialized models with ISO string dates", async () => {
    const caller = createTestCaller(appRouter)
    await caller.projects.create({ name: "A", location: "SF" })
    await caller.projects.create({ name: "B", location: "LA" })

    const list = await caller.projects.list()

    expect(list.length).toBeGreaterThanOrEqual(2)
    for (const project of list) {
      expect(project.createdAt).toBeString()
      expect(() => new Date(project.createdAt).toISOString()).not.toThrow()
    }
  })

  test("list includes location", async () => {
    const caller = createTestCaller(appRouter)
    await caller.projects.create({ name: "Proj", location: "San Francisco, CA" })

    const list = await caller.projects.list()
    const proj = list.find((p) => p.name === "Proj")

    expect(proj).toBeDefined()
    expect(proj!.location).toBe("San Francisco, CA")
  })

  test("get throws NOT_FOUND for missing project", async () => {
    const caller = createTestCaller(appRouter)

    expect(caller.projects.get({ id: "nonexistent" })).rejects.toThrow("Project not found")
  })

  test("delete removes project", async () => {
    const caller = createTestCaller(appRouter)
    const project = await caller.projects.create({ name: "ToDelete", location: "SF" })

    await caller.projects.delete({ id: project.id })

    expect(caller.projects.get({ id: project.id })).rejects.toThrow("Project not found")
  })

  test("delete cascades to questionnaire", async () => {
    const caller = createTestCaller(appRouter)
    const project = await caller.projects.create({ name: "Cascade", location: "San Francisco, CA" })

    await caller.questionnaires.submit({
      projectId: project.id,
      answers: { workType: ["interior"], interiorWork: ["flooring"] }
    })

    await caller.projects.delete({ id: project.id })

    const q = await caller.questionnaires.getByProject({ projectId: project.id })
    expect(q).toBeNull()
  })

  test("delete throws NOT_FOUND for missing project", async () => {
    const caller = createTestCaller(appRouter)

    expect(caller.projects.delete({ id: "nonexistent" })).rejects.toThrow("Project not found")
  })
})
