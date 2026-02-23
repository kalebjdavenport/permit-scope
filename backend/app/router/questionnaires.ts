import { determinePermitRequirement } from "#app/logic/index.ts"
import { SAVE_DRAFT_SCHEMA, SUBMIT_QUESTIONNAIRE_SCHEMA } from "#app/schemas/questionnaire.ts"
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

  saveDraft: procedure
    .input(SAVE_DRAFT_SCHEMA)
    .mutation(({ ctx, input }) => {
      const existing = ctx.cradle.questionnaires.getByProjectId(input.projectId)

      // Don't overwrite a submitted record with a draft (prevents race with trailing debounce)
      if (existing?.status === "submitted") {
        return ctx.cradle.questionnaires.toModel(existing)
      }

      const item = ctx.cradle.questionnaires.upsertByProjectId(input.projectId, {
        answers: input.answers,
        currentIndex: input.currentIndex,
        status: "draft",
        permitResult: null
      })
      return ctx.cradle.questionnaires.toModel(item)
    }),

  submit: procedure
    .input(SUBMIT_QUESTIONNAIRE_SCHEMA)
    .mutation(({ ctx, input }) => {
      const project = ctx.cradle.projects.get(input.projectId)
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." })
      }

      const permitResult = determinePermitRequirement(input.answers, project.location)
      const item = ctx.cradle.questionnaires.upsertByProjectId(input.projectId, {
        answers: input.answers,
        status: "submitted",
        currentIndex: 0,
        permitResult
      })
      return ctx.cradle.questionnaires.toModel(item)
    }),

  reopenDraft: procedure
    .input(z.object({ projectId: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      const existing = ctx.cradle.questionnaires.getByProjectId(input.projectId)
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No questionnaire found." })
      }
      const updated = { ...existing, status: "draft" as const, currentIndex: 0 }
      ctx.cradle.questionnaires.update(existing.id, updated)
      return ctx.cradle.questionnaires.toModel(updated)
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
