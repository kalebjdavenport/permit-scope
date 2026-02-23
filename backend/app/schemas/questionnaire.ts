import { QUESTION_OPTIONS } from "#app/logic/questionOptions.ts"
import { z } from "zod"

type Answers = Record<string, string[]>

const QUESTION_KEY = {
  workType: "workType",
  interiorWork: "interiorWork",
  exteriorWork: "exteriorWork",
  propertyAdditions: "propertyAdditions"
} as const

const WORK_TYPE = {
  interior: "interior",
  exterior: "exterior",
  additions: "additions"
} as const

const ANSWERS_SCHEMA = z.record(z.string(), z.array(z.string()))

const hasSelections = (answers: Answers, key: string) => (answers[key]?.length ?? 0) > 0

const addIssue = (ctx: z.RefinementCtx, path: (string | number)[], message: string) =>
  ctx.addIssue({ code: z.ZodIssueCode.custom, path, message })

function hasKnownQuestionIdsAndValues(answers: Answers): boolean {
  for (const [key, values] of Object.entries(answers)) {
    const allowed = QUESTION_OPTIONS[key as keyof typeof QUESTION_OPTIONS]
    if (!allowed) return false
    if (values.some((value) => !allowed.includes(value as never))) return false
  }
  return true
}

function hasUniqueSelections(answers: Answers): boolean {
  return Object.values(answers).every((values) => new Set(values).size === values.length)
}

function validateSharedAnswerRules(answers: Answers, ctx: z.RefinementCtx) {
  if (!hasKnownQuestionIdsAndValues(answers)) {
    addIssue(ctx, ["answers"], "Invalid question IDs or option values")
  }
  if (!hasUniqueSelections(answers)) {
    addIssue(ctx, ["answers"], "Duplicate option values are not allowed")
  }
}

export const SUBMIT_QUESTIONNAIRE_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: ANSWERS_SCHEMA
}).superRefine(({ answers }, ctx) => {
  validateSharedAnswerRules(answers, ctx)

  const workType = answers[QUESTION_KEY.workType] ?? []

  if (workType.length === 0) {
    addIssue(ctx, ["answers", QUESTION_KEY.workType], "Work type is required")
  }

  const wantsInterior = workType.includes(WORK_TYPE.interior)
  const wantsExterior = workType.includes(WORK_TYPE.exterior)
  const wantsAdditions = workType.includes(WORK_TYPE.additions)
  const hasInterior = hasSelections(answers, QUESTION_KEY.interiorWork)
  const hasExterior = hasSelections(answers, QUESTION_KEY.exteriorWork)
  const additionCount = answers[QUESTION_KEY.propertyAdditions]?.length ?? 0

  if (wantsInterior && !hasInterior) {
    addIssue(ctx, ["answers", QUESTION_KEY.interiorWork], "Interior details are required")
  }
  if (!wantsInterior && hasInterior) {
    addIssue(
      ctx,
      ["answers", QUESTION_KEY.interiorWork],
      "Interior details require interior work type"
    )
  }

  if (wantsExterior && !hasExterior) {
    addIssue(ctx, ["answers", QUESTION_KEY.exteriorWork], "Exterior details are required")
  }
  if (!wantsExterior && hasExterior) {
    addIssue(
      ctx,
      ["answers", QUESTION_KEY.exteriorWork],
      "Exterior details require exterior work type"
    )
  }

  if (wantsAdditions && additionCount !== 1) {
    addIssue(
      ctx,
      ["answers", QUESTION_KEY.propertyAdditions],
      "Exactly one property addition is required"
    )
  }
  if (!wantsAdditions && additionCount > 0) {
    addIssue(
      ctx,
      ["answers", QUESTION_KEY.propertyAdditions],
      "Property additions require additions work type"
    )
  }
})

export type SubmitQuestionnaireSchema = z.infer<typeof SUBMIT_QUESTIONNAIRE_SCHEMA>

export const SAVE_DRAFT_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: ANSWERS_SCHEMA,
  currentIndex: z.number().int().min(0)
}).superRefine(({ answers }, ctx) => {
  validateSharedAnswerRules(answers, ctx)

  if ((answers[QUESTION_KEY.propertyAdditions]?.length ?? 0) > 1) {
    addIssue(
      ctx,
      ["answers", QUESTION_KEY.propertyAdditions],
      "Property additions can only have one value"
    )
  }
})

export type SaveDraftSchema = z.infer<typeof SAVE_DRAFT_SCHEMA>
