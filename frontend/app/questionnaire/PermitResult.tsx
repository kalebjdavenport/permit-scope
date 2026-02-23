import { BlurFade } from "@/components/magicui/blur-fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PermitOutcome } from "@permitflow/backend/logic"
import { OUTCOME_META } from "./outcomeMeta"

const RESULT_ITEMS: Record<PermitOutcome, string[]> = {
  in_house_review: [
    "A building permit is required.",
    "Include plan sets.",
    "Submit application for in-house review."
  ],
  otc_review: [
    "A building permit is required.",
    "Submit application for OTC review."
  ],
  no_permit: [
    "Nothing is required! You're set to build."
  ]
}

type Props = { permitResult: PermitOutcome }

export function PermitResult({ permitResult }: Props) {
  const meta = OUTCOME_META[permitResult]

  return (
    <BlurFade>
      <Card role="alert" aria-live="assertive" className={meta.borderStyle}>
        <CardHeader>
          <CardTitle className="text-lg">{meta.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {RESULT_ITEMS[permitResult].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
