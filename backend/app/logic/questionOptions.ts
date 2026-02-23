/**
 * Single source of truth for valid question IDs and their accepted option values.
 * Imported by both:
 *   - backend schema validation (app/schemas/questionnaire.ts)
 *   - frontend question definitions (frontend/app/questionnaire/definition.ts)
 * Any changes here automatically propagate to both.
 */
export const QUESTION_OPTIONS = {
  workType: ["interior", "exterior", "additions"],
  interiorWork: [
    "flooring",
    "bathroom_remodel",
    "new_bathroom",
    "new_laundry_room",
    "electrical_work",
    "other"
  ],
  exteriorWork: [
    "roof_modifications",
    "garage_door_replacement",
    "deck_construction",
    "garage_modifications",
    "exterior_doors",
    "fencing",
    "other"
  ],
  propertyAdditions: ["adu", "garage_conversion", "basement_attic_conversion", "other"]
} as const

export type QuestionId = keyof typeof QUESTION_OPTIONS
export type OptionValue<K extends QuestionId> = (typeof QUESTION_OPTIONS)[K][number]
