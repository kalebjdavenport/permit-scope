import { QUESTION_OPTIONS } from "#app/logic/questionOptions.ts"
import { z } from "zod"

export const SUBMIT_QUESTIONNAIRE_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: z.record(z.string(), z.array(z.string())).refine(
    (answers) => {
      for (const [key, values] of Object.entries(answers)) {
        const allowed = QUESTION_OPTIONS[key as keyof typeof QUESTION_OPTIONS]
        if (!allowed) return false
        if (values.some((v) => !allowed.includes(v as never))) return false
      }
      return true
    },
    { message: "Invalid question IDs or option values" }
  )
})

export type SubmitQuestionnaireSchema = z.infer<typeof SUBMIT_QUESTIONNAIRE_SCHEMA>
