export type PermitOutcome = "in_house_review" | "otc_review" | "no_permit"

const has = (answers: Record<string, string[]>, key: string, value: string) =>
  answers[key]?.includes(value) ?? false

const hasAny = (answers: Record<string, string[]>, key: string) =>
  (answers[key]?.length ?? 0) > 0

const hasOther = (answers: Record<string, string[]>) =>
  Object.values(answers).some((values) => values.includes("other"))

function isInHouseReview(answers: Record<string, string[]>, location: string): boolean {
  if (hasAny(answers, "propertyAdditions")) return true
  if (has(answers, "interiorWork", "new_bathroom")) return true
  if (has(answers, "interiorWork", "new_laundry_room")) return true
  if (hasOther(answers)) return true

  const isSF = location === "San Francisco, CA"
  if (isSF && has(answers, "exteriorWork", "deck_construction")) return true
  if (isSF && has(answers, "exteriorWork", "garage_modifications")) return true

  return false
}

function isOtcReview(answers: Record<string, string[]>): boolean {
  if (has(answers, "interiorWork", "bathroom_remodel")) return true
  if (has(answers, "interiorWork", "electrical_work")) return true
  if (has(answers, "exteriorWork", "roof_modifications")) return true

  const hasBoth =
    has(answers, "exteriorWork", "garage_door_replacement") &&
    has(answers, "exteriorWork", "exterior_doors")
  if (hasBoth) return true

  return false
}

export function determinePermitRequirement(
  answers: Record<string, string[]>,
  location: string
): PermitOutcome {
  if (isInHouseReview(answers, location)) return "in_house_review"
  if (isOtcReview(answers)) return "otc_review"
  return "no_permit"
}
