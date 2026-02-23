import { Alert, AlertDescription } from "@/components/ui/alert"
// Reuses backend logic to show a live preview of the permit outcome as
// the user answers questions. The backend remains authoritative on submit.
import { determinePermitRequirement, type PermitOutcome } from "@permitflow/backend/logic"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"

const STYLES: Record<PermitOutcome, string> = {
  in_house_review: "border-warning/50 bg-warning/10 text-warning-foreground",
  otc_review: "border-info/50 bg-info/10 text-info-foreground",
  no_permit: "border-success/50 bg-success/10 text-success-foreground"
}

const LABELS: Record<PermitOutcome, string> = {
  in_house_review: "In-House Review",
  otc_review: "Over-the-Counter Review",
  no_permit: "No Permit Required"
}

type Props = {
  answers: Record<string, string[]>
  location: string
}

export function PermitBadge({ answers, location }: Props) {
  const hasWorkType = (answers.workType?.length ?? 0) > 0
  if (!hasWorkType) return null

  const scrubbed = scrubAnswers(answers, scopeOfWorkQuestions)
  const outcome = determinePermitRequirement(scrubbed, location)

  return (
    <Alert className={STYLES[outcome]} aria-live="polite" aria-atomic="true">
      <AlertDescription>
        Likely outcome: <span className="font-semibold">{LABELS[outcome]}</span>
      </AlertDescription>
    </Alert>
  )
}
