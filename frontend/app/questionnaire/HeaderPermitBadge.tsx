import { createPortal } from "react-dom"
import { QuestionnaireContext } from "./context"
import { PermitBadge } from "./PermitBadge"

type Props = { location: string }

export function HeaderPermitBadge({ location }: Props) {
  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)

  const slot = document.getElementById("permit-badge-slot")
  if (!slot) return null
  if (stateValue !== "answering" && stateValue !== "submitting") return null

  return createPortal(<PermitBadge answers={answers} location={location} />, slot)
}
