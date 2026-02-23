export type QuestionDefinition = {
  id: string
  question: string
  type: "multi-select" | "single-select"
  options: { value: string; label: string }[]
  isActive: (answers: Record<string, string[]>) => boolean
}

export const scopeOfWorkQuestions: QuestionDefinition[] = [
  {
    id: "workType",
    question: "What type of work are you doing?",
    type: "multi-select",
    options: [
      { value: "interior", label: "Interior work" },
      { value: "exterior", label: "Exterior work" },
      { value: "additions", label: "Property additions" }
    ],
    isActive: () => true
  },
  {
    id: "interiorWork",
    question: "What interior work are you doing?",
    type: "multi-select",
    options: [
      { value: "flooring", label: "Flooring" },
      { value: "bathroom_remodel", label: "Bathroom remodel" },
      { value: "new_bathroom", label: "New bathroom" },
      { value: "new_laundry_room", label: "New laundry room" },
      { value: "electrical_work", label: "Electrical work" },
      { value: "other", label: "Other" }
    ],
    isActive: (answers) => answers.workType?.includes("interior") ?? false
  },
  {
    id: "exteriorWork",
    question: "What exterior work are you doing?",
    type: "multi-select",
    options: [
      { value: "roof_modifications", label: "Roof modifications/repair" },
      { value: "garage_door_replacement", label: "Garage door replacement" },
      { value: "deck_construction", label: "Deck construction" },
      { value: "garage_modifications", label: "Garage modifications" },
      { value: "exterior_doors", label: "Exterior doors" },
      { value: "fencing", label: "Fencing" },
      { value: "other", label: "Other" }
    ],
    isActive: (answers) => answers.workType?.includes("exterior") ?? false
  },
  {
    id: "propertyAdditions",
    question: "What type of property addition?",
    type: "single-select",
    options: [
      { value: "adu", label: "ADU (Accessory dwelling unit)" },
      { value: "garage_conversion", label: "Garage conversion" },
      { value: "basement_attic_conversion", label: "Basement/attic conversion" },
      { value: "other", label: "Other" }
    ],
    isActive: (answers) => answers.workType?.includes("additions") ?? false
  }
]

export function getActiveQuestions(
  questions: QuestionDefinition[],
  answers: Record<string, string[]>
) {
  return questions.filter((q) => q.isActive(answers))
}

export function scrubAnswers(
  answers: Record<string, string[]>,
  questions: QuestionDefinition[]
): Record<string, string[]> {
  const activeIds = new Set(getActiveQuestions(questions, answers).map((q) => q.id))
  return Object.fromEntries(Object.entries(answers).filter(([key]) => activeIds.has(key)))
}
