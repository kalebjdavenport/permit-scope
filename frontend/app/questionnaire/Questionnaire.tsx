import { BlurFade } from "@/components/magicui/blur-fade"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router"
import { QuestionnaireContext } from "./context"
import { getActiveQuestions, scopeOfWorkQuestions } from "./definition"
import { PermitResult } from "./PermitResult"
import { ProgressBar } from "./ProgressBar"
import { QuestionStep } from "./QuestionStep"
import { useQuestionnaireApi } from "./useQuestionnaireApi"

type Props = { projectId: string }

export function Questionnaire({ projectId }: Props) {
  const actorRef = QuestionnaireContext.useActorRef()
  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)
  const currentIndex = QuestionnaireContext.useSelector((s) => s.context.currentIndex)
  const permitResult = QuestionnaireContext.useSelector((s) => s.context.permitResult)
  const error = QuestionnaireContext.useSelector((s) => s.context.error)
  const send = actorRef.send

  const { isLoading } = useQuestionnaireApi(projectId, actorRef)

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground" role="status">
        Loading...
      </div>
    )
  }

  if (stateValue === "idle") {
    return (
      <BlurFade>
        <Button onClick={() => send({ type: "START" })}>Start Questionnaire</Button>
      </BlurFade>
    )
  }

  // Submitted state: result + actions
  const showResult = stateValue === "submitted" || stateValue === "deleting" || stateValue === "reopening"
  if (showResult) {
    const busy = stateValue === "deleting" || stateValue === "reopening"
    return (
      <div className="flex flex-col gap-4">
        <PermitResult permitResult={permitResult!} />
        <ErrorAlert error={error} />
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/projects">Back to Projects</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => send({ type: "EDIT" })}
            disabled={busy}
          >
            {stateValue === "reopening" ? "Reopening..." : "Edit Answers"}
          </Button>
          <Button
            variant="outline"
            onClick={() => send({ type: "START_OVER" })}
            disabled={busy}
          >
            {stateValue === "deleting" ? "Clearing..." : "Start Over"}
          </Button>
        </div>
      </div>
    )
  }

  const active = getActiveQuestions(scopeOfWorkQuestions, answers)
  const current = active[currentIndex]
  const isLast = currentIndex === active.length - 1
  const isFirst = currentIndex === 0
  const progress = ((currentIndex + 1) / active.length) * 100

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        {!isFirst && <ProgressBar progress={progress} />}

        <div className="min-h-[200px]">
          {current && (
            <BlurFade key={current.id} duration={0.3}>
              <QuestionStep
                definition={current}
                values={answers[current.id] ?? []}
                onChange={(values) =>
                  send({ type: "SET_ANSWER", questionId: current.id, values })
                }
              />
            </BlurFade>
          )}
        </div>

        <ErrorAlert error={error} />

        <div className="flex gap-2">
          {!isFirst && (
            <Button variant="outline" onClick={() => send({ type: "BACK" })}>
              Back
            </Button>
          )}
          {isLast ? (
            <SubmitButton
              onClick={() => send({ type: "SUBMIT" })}
              disabled={stateValue === "submitting"}
              submitting={stateValue === "submitting"}
            />
          ) : (
            <Button onClick={() => send({ type: "NEXT" })}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SubmitButton({
  onClick,
  disabled,
  submitting
}: {
  onClick: () => void
  disabled: boolean
  submitting: boolean
}) {
  if (submitting) {
    return <Button disabled>Submitting...</Button>
  }

  return (
    <ShimmerButton
      onClick={onClick}
      disabled={disabled}
      className="text-sm font-medium"
      shimmerSize="0.05em"
      background="oklch(0.205 0 0)"
    >
      Submit
    </ShimmerButton>
  )
}

function ErrorAlert({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
