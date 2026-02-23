import { determinePermitRequirement } from "#app/logic/index.ts"
import { SAVE_DRAFT_SCHEMA, SUBMIT_QUESTIONNAIRE_SCHEMA } from "#app/schemas/questionnaire.ts"
import { type createContext, procedure, router } from "#core/trpc.ts"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

type TrpcContext = Awaited<ReturnType<typeof createContext>>
const PROJECT_ID_INPUT = z.object({ projectId: z.string().min(1) })

function getProjectOrThrow(ctx: TrpcContext, projectId: string) {
  const project = ctx.cradle.projects.get(projectId)
  if (!project) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." })
  }
  return project
}

const getByProjectId = (ctx: TrpcContext, projectId: string) =>
  ctx.cradle.questionnaires.getByProjectId(projectId)

export const questionnaires = router({
  getByProject: procedure
    .input(PROJECT_ID_INPUT)
    .query(({ ctx, input }) => {
      const item = getByProjectId(ctx, input.projectId)
      return item ? ctx.cradle.questionnaires.toModel(item) : null
    }),

  saveDraft: procedure
    .input(SAVE_DRAFT_SCHEMA)
    .mutation(({ ctx, input }) => {
      getProjectOrThrow(ctx, input.projectId)
      const existing = getByProjectId(ctx, input.projectId)

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
      const project = getProjectOrThrow(ctx, input.projectId)

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
    .input(PROJECT_ID_INPUT)
    .mutation(({ ctx, input }) => {
      const existing = getByProjectId(ctx, input.projectId)
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No questionnaire found." })
      }
      const updated = { ...existing, status: "draft" as const, currentIndex: 0 }
      ctx.cradle.questionnaires.update(existing.id, updated)
      return ctx.cradle.questionnaires.toModel(updated)
    }),

  delete: procedure
    .input(PROJECT_ID_INPUT)
    .mutation(({ ctx, input }) => {
      const existing = getByProjectId(ctx, input.projectId)
      if (existing) {
        ctx.cradle.questionnaires.remove(existing.id)
      }
      return { success: true }
    })
})
