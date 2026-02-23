import { z } from "zod"

const VALID_QUESTION_OPTIONS: Record<string, string[]> = {
  workType: ["interior", "exterior", "additions"],
  interiorWork: [
    "flooring", "bathroom_remodel", "new_bathroom",
    "new_laundry_room", "electrical_work", "other"
  ],
  exteriorWork: [
    "roof_modifications", "garage_door_replacement", "deck_construction",
    "garage_modifications", "exterior_doors", "fencing", "other"
  ],
  propertyAdditions: ["adu", "garage_conversion", "basement_attic_conversion", "other"]
}

export const SUBMIT_QUESTIONNAIRE_SCHEMA = z.object({
  projectId: z.string().min(1),
  answers: z.record(z.string(), z.array(z.string())).refine(
    (answers) => {
      for (const [key, values] of Object.entries(answers)) {
        const allowed = VALID_QUESTION_OPTIONS[key]
        if (!allowed) return false
        if (values.some((v) => !allowed.includes(v))) return false
      }
      return true
    },
    { message: "Invalid question IDs or option values" }
  )
})

export type SubmitQuestionnaireSchema = z.infer<typeof SUBMIT_QUESTIONNAIRE_SCHEMA>
