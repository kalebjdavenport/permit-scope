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
        console.log("[saveDraft] skipped — already submitted", input.projectId)
        return ctx.cradle.questionnaires.toModel(existing)
      }

      if (existing) {
        const updated = {
          ...existing,
          answers: input.answers,
          currentIndex: input.currentIndex,
          status: "draft" as const,
          permitResult: null
        }
        ctx.cradle.questionnaires.update(existing.id, updated)
        console.log("[saveDraft] updated", { projectId: input.projectId, currentIndex: input.currentIndex, answers: input.answers })
        return ctx.cradle.questionnaires.toModel(updated)
      }

      const created = ctx.cradle.questionnaires.add({
        projectId: input.projectId,
        answers: input.answers,
        currentIndex: input.currentIndex,
        status: "draft",
        permitResult: null
      })
      console.log("[saveDraft] created", { projectId: input.projectId, currentIndex: input.currentIndex, answers: input.answers })
      return ctx.cradle.questionnaires.toModel(created)
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
        const updated = {
          ...existing,
          answers: input.answers,
          status: "submitted" as const,
          currentIndex: 0,
          permitResult
        }
        ctx.cradle.questionnaires.update(existing.id, updated)
        console.log("[submit] updated", { projectId: input.projectId, permitResult, answers: input.answers })
        return ctx.cradle.questionnaires.toModel(updated)
      }

      const created = ctx.cradle.questionnaires.add({
        projectId: input.projectId,
        answers: input.answers,
        status: "submitted",
        currentIndex: 0,
        permitResult
      })
      console.log("[submit] created", { projectId: input.projectId, permitResult, answers: input.answers })
      return ctx.cradle.questionnaires.toModel(created)
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
      console.log("[reopenDraft]", input.projectId)
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
