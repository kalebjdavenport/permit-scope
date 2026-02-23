import { determinePermitRequirement } from "#app/logic/index.ts"
import { SUBMIT_QUESTIONNAIRE_SCHEMA } from "#app/schemas/questionnaire.ts"
import { procedure, router } from "#core/trpc.ts"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const questionnaires = router({
  getByProject: procedure
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => {
      const item = ctx.cradle.questionnaires.getByProjectId(input.projectId)
      return item ? ctx.cradle.questionnaires.toModel(item) : null
    }),

  submit: procedure
    .input(SUBMIT_QUESTIONNAIRE_SCHEMA)
    .mutation(({ ctx, input }) => {
      const project = ctx.cradle.projects.get(input.projectId)
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." })
      }

      const permitResult = determinePermitRequirement(input.answers, project.location)
      const existing = ctx.cradle.questionnaires.getByProjectId(input.projectId)

      if (existing) {
        ctx.cradle.questionnaires.update(existing.id, {
          answers: input.answers,
          permitResult
        })
        return ctx.cradle.questionnaires.toModel(ctx.cradle.questionnaires.get(existing.id)!)
      }

      const created = ctx.cradle.questionnaires.add({
        projectId: input.projectId,
        answers: input.answers,
        permitResult
      })
      return ctx.cradle.questionnaires.toModel(created)
    }),

  delete: procedure
    .input(z.object({ projectId: z.string() }))
    .mutation(({ ctx, input }) => {
      const existing = ctx.cradle.questionnaires.getByProjectId(input.projectId)
      if (existing) {
        ctx.cradle.questionnaires.remove(existing.id)
      }
      return { success: true }
    })
})
