import { QUESTION_OPTIONS } from "#app/logic/questionOptions.ts"
import { z } from "zod"

const ANSWERS_SCHEMA = z
  .object({
    workType: z.array(z.enum(QUESTION_OPTIONS.workType)).optional(),
    interiorWork: z.array(z.enum(QUESTION_OPTIONS.interiorWork)).optional(),
    exteriorWork: z.array(z.enum(QUESTION_OPTIONS.exteriorWork)).optional(),
    propertyAdditions: z.array(z.enum(QUESTION_OPTIONS.propertyAdditions)).optional()
  })
  .strict()

type Answers = z.infer<typeof ANSWERS_SCHEMA>
type AnswerKey = keyof Answers

const hasSelections = (answers: Answers, key: AnswerKey) => (answers[key]?.length ?? 0) > 0

const addIssue = (
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string
) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message })

function validateNoDuplicateSelections(answers: Answers, ctx: z.RefinementCtx) {
  const keys = Object.keys(answers) as AnswerKey[]
  for (const key of keys) {
    const values = answers[key]
    if (!values) continue
    if (new Set(values).size !== values.length) {
      addIssue(ctx, ["answers", key], "Duplicate option values are not allowed")
    }
  }
}

export const SUBMIT_QUESTIONNAIRE_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: ANSWERS_SCHEMA
}).superRefine(({ answers }, ctx) => {
  validateNoDuplicateSelections(answers, ctx)
  const workType = answers.workType ?? []

  if (workType.length === 0) {
    addIssue(ctx, ["answers", "workType"], "Work type is required")
  }

  const wantsInterior = workType.includes("interior")
  const wantsExterior = workType.includes("exterior")
  const wantsAdditions = workType.includes("additions")
  const hasInterior = hasSelections(answers, "interiorWork")
  const hasExterior = hasSelections(answers, "exteriorWork")
  const additionCount = answers.propertyAdditions?.length ?? 0

  if (wantsInterior && !hasInterior) {
    addIssue(ctx, ["answers", "interiorWork"], "Interior details are required")
  }
  if (!wantsInterior && hasInterior) {
    addIssue(ctx, ["answers", "interiorWork"], "Interior details require interior work type")
  }

  if (wantsExterior && !hasExterior) {
    addIssue(ctx, ["answers", "exteriorWork"], "Exterior details are required")
  }
  if (!wantsExterior && hasExterior) {
    addIssue(ctx, ["answers", "exteriorWork"], "Exterior details require exterior work type")
  }

  if (wantsAdditions && additionCount !== 1) {
    addIssue(ctx, ["answers", "propertyAdditions"], "Exactly one property addition is required")
  }
  if (!wantsAdditions && additionCount > 0) {
    addIssue(ctx, ["answers", "propertyAdditions"], "Property additions require additions work type")
  }
})

export type SubmitQuestionnaireSchema = z.infer<typeof SUBMIT_QUESTIONNAIRE_SCHEMA>

export const SAVE_DRAFT_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: ANSWERS_SCHEMA,
  currentIndex: z.number().int().min(0)
}).superRefine(({ answers }, ctx) => {
  validateNoDuplicateSelections(answers, ctx)

  if ((answers.propertyAdditions?.length ?? 0) > 1) {
    addIssue(ctx, ["answers", "propertyAdditions"], "Property additions can only have one value")
  }
})

export type SaveDraftSchema = z.infer<typeof SAVE_DRAFT_SCHEMA>
