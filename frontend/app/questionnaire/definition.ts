import { QUESTION_OPTIONS } from "@permitflow/backend/logic"

export type QuestionDefinition = {
  id: string
  question: string
  type: "multi-select" | "single-select"
  options: { value: string; label: string }[]
  isActive: (answers: Record<string, string[]>) => boolean
}

/** Helper to turn a raw option value array into labeled options */
const opts = (values: readonly string[], labels: Record<string, string>) =>
  values.map((v) => ({ value: v, label: labels[v] ?? v }))

const WORK_TYPE_LABELS: Record<string, string> = {
  interior: "Interior work",
  exterior: "Exterior work",
  additions: "Property additions"
}

const INTERIOR_LABELS: Record<string, string> = {
  flooring: "Flooring",
  bathroom_remodel: "Bathroom remodel",
  new_bathroom: "New bathroom",
  new_laundry_room: "New laundry room",
  electrical_work: "Electrical work",
  other: "Other"
}

const EXTERIOR_LABELS: Record<string, string> = {
  roof_modifications: "Roof modifications/repair",
  garage_door_replacement: "Garage door replacement",
  deck_construction: "Deck construction",
  garage_modifications: "Garage modifications",
  exterior_doors: "Exterior doors",
  fencing: "Fencing",
  other: "Other"
}

const ADDITION_LABELS: Record<string, string> = {
  adu: "ADU (Accessory dwelling unit)",
  garage_conversion: "Garage conversion",
  basement_attic_conversion: "Basement/attic conversion",
  other: "Other"
}

export const scopeOfWorkQuestions: QuestionDefinition[] = [
  {
    id: "workType",
    question: "What type of work are you doing?",
    type: "multi-select",
    options: opts(QUESTION_OPTIONS.workType, WORK_TYPE_LABELS),
    isActive: () => true
  },
  {
    id: "interiorWork",
    question: "What interior work are you doing?",
    type: "multi-select",
    options: opts(QUESTION_OPTIONS.interiorWork, INTERIOR_LABELS),
    isActive: (answers) => answers.workType?.includes("interior") ?? false
  },
  {
    id: "exteriorWork",
    question: "What exterior work are you doing?",
    type: "multi-select",
    options: opts(QUESTION_OPTIONS.exteriorWork, EXTERIOR_LABELS),
    isActive: (answers) => answers.workType?.includes("exterior") ?? false
  },
  {
    id: "propertyAdditions",
    question: "What type of property addition?",
    type: "single-select",
    options: opts(QUESTION_OPTIONS.propertyAdditions, ADDITION_LABELS),
    isActive: (answers) => answers.workType?.includes("additions") ?? false
  }
]

export function getActiveQuestions(
  questions: QuestionDefinition[],
  answers: Record<string, string[]>
) {
  return questions.filter((q) => q.isActive(answers))
}

/**
 * Strips answers for questions that are no longer active. E.g. if the user
 * selected "interior" then answered interior details, then deselected "interior",
 * the interior answers are removed before submitting to the backend.
 */
export function scrubAnswers(
  answers: Record<string, string[]>,
  questions: QuestionDefinition[]
): Record<string, string[]> {
  const activeIds = new Set(getActiveQuestions(questions, answers).map((q) => q.id))
  return Object.fromEntries(Object.entries(answers).filter(([key]) => activeIds.has(key)))
}
