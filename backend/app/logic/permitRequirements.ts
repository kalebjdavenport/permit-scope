export type PermitOutcome = "in_house_review" | "otc_review" | "no_permit"

const has = (answers: Record<string, string[]>, key: string, value: string) =>
  answers[key]?.includes(value) ?? false

const hasAny = (answers: Record<string, string[]>, key: string) =>
  (answers[key]?.length ?? 0) > 0

const hasOther = (answers: Record<string, string[]>) =>
  Object.values(answers).some((values) => values.includes("other"))

/**
 * In-house review is the highest-priority permit outcome. Triggered by
 * structural or complex work that requires plan review by city staff.
 * SF has additional structural triggers (deck/garage) due to local codes.
 */
function isInHouseReview(answers: Record<string, string[]>, location: string): boolean {
  if (hasAny(answers, "propertyAdditions")) return true
  if (has(answers, "interiorWork", "new_bathroom")) return true
  if (has(answers, "interiorWork", "new_laundry_room")) return true
  if (hasOther(answers)) return true

  // SF-specific: structural exterior work requires in-house review
  const isSF = location === "San Francisco, CA"
  if (isSF && has(answers, "exteriorWork", "deck_construction")) return true
  if (isSF && has(answers, "exteriorWork", "garage_modifications")) return true

  return false
}

/**
 * Over-the-counter review is mid-priority. Covers permitted work that
 * can be reviewed at the counter without full plan submission.
 * Garage door + exterior doors must BOTH be selected to trigger OTC.
 */
function isOtcReview(answers: Record<string, string[]>): boolean {
  if (has(answers, "interiorWork", "bathroom_remodel")) return true
  if (has(answers, "interiorWork", "electrical_work")) return true
  if (has(answers, "exteriorWork", "roof_modifications")) return true

  // Only triggers when both are selected together
  const hasBoth =
    has(answers, "exteriorWork", "garage_door_replacement") &&
    has(answers, "exteriorWork", "exterior_doors")
  if (hasBoth) return true

  return false
}

/**
 * Determines the permit requirement for a set of questionnaire answers.
 * Priority order: in_house_review > otc_review > no_permit
 */
export function determinePermitRequirement(
  answers: Record<string, string[]>,
  location: string
): PermitOutcome {
  if (isInHouseReview(answers, location)) return "in_house_review"
  if (isOtcReview(answers)) return "otc_review"
  return "no_permit"
}
