import { CREATE_PROJECT_SCHEMA } from "#app/schemas/project.ts"
import { procedure, router } from "#core/trpc.ts"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const projects = router({
  get: procedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    const project = ctx.cradle.projects.get(input.id)

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found."
      })
    }

    return ctx.cradle.projects.toModel(project)
  }),

  list: procedure.query(({ ctx }) => {
    return ctx.cradle.projects.getAll().map((p) => ctx.cradle.projects.toModel(p))
  }),

  create: procedure.input(CREATE_PROJECT_SCHEMA).mutation(({ ctx, input }) => {
    const project = ctx.cradle.projects.add(input)

    return ctx.cradle.projects.toModel(project)
  }),

  delete: procedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    const project = ctx.cradle.projects.get(input.id)
    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." })
    }

    // Cascade: remove associated questionnaire before deleting project
    const questionnaire = ctx.cradle.questionnaires.getByProjectId(input.id)
    if (questionnaire) {
      ctx.cradle.questionnaires.remove(questionnaire.id)
    }

    ctx.cradle.projects.remove(input.id)
    return { success: true }
  })
})
