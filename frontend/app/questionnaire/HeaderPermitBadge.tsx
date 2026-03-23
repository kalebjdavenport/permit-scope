import { determinePermitRequirement } from "@permit-scope/backend/logic"
import { createPortal } from "react-dom"
import { QuestionnaireContext } from "./context"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"
import { OUTCOME_META } from "./outcomeMeta"

type Props = { location: string }

export function HeaderPermitBadge({ location }: Props) {
  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)

  const slot = document.getElementById("permit-badge-slot")
  if (!slot) return null
  if (stateValue !== "answering" && stateValue !== "submitting") return null

  const hasWorkType = (answers.workType?.length ?? 0) > 0
  if (!hasWorkType) return null

  const scrubbed = scrubAnswers(answers, scopeOfWorkQuestions)
  const outcome = determinePermitRequirement(scrubbed, location)

  return createPortal(
    <div
      className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-muted-foreground">Likely outcome</span>
      <span className="font-semibold text-foreground">
        {OUTCOME_META[outcome].shortLabel}
      </span>
    </div>,
    slot
  )
}
