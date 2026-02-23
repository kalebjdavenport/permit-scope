import { BlurFade } from "@/components/magicui/blur-fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PermitOutcome } from "@permitflow/backend/logic"

const RESULTS: Record<PermitOutcome, { title: string; items: string[]; style: string }> = {
  in_house_review: {
    title: "In-House Review Process",
    style: "border-warning/50",
    items: [
      "A building permit is required.",
      "Include plan sets.",
      "Submit application for in-house review."
    ]
  },
  otc_review: {
    title: "Over-the-Counter Submission Process",
    style: "border-info/50",
    items: [
      "A building permit is required.",
      "Submit application for OTC review."
    ]
  },
  no_permit: {
    title: "No Permit",
    style: "border-success/50",
    items: [
      "Nothing is required! You're set to build."
    ]
  }
}

type Props = {
  permitResult: PermitOutcome
}

export function PermitResult({ permitResult }: Props) {
  const result = RESULTS[permitResult]

  return (
    <BlurFade>
      <Card role="alert" aria-live="assertive" className={result.style}>
        <CardHeader>
          <CardTitle>
            <h3 className="text-lg font-semibold">{result.title}</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {result.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
