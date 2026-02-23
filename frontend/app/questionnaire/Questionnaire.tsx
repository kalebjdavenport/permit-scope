import { BlurFade } from "@/components/magicui/blur-fade"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PermitOutcome } from "@permitflow/backend/logic"
import { Link } from "react-router"
import { QuestionnaireContext } from "./context"
import { getActiveQuestions, scopeOfWorkQuestions } from "./definition"
import { PermitResult } from "./PermitResult"
import { ProgressBar } from "./ProgressBar"
import { QuestionStep } from "./QuestionStep"
import { useQuestionnaireApi } from "./useQuestionnaireApi"

type Props = { projectId: string }
type Answers = Record<string, string[]>
type StateValue = "idle" | "answering" | "submitting" | "submitted" | "deleting" | "reopening"

const isResultState = (stateValue: StateValue) =>
  stateValue === "submitted" || stateValue === "deleting" || stateValue === "reopening"

function buildAnsweringState(answers: Answers, currentIndex: number, stateValue: StateValue) {
  const activeQuestions = getActiveQuestions(scopeOfWorkQuestions, answers)
  const currentQuestion = activeQuestions[currentIndex]
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === activeQuestions.length - 1
  const isSubmitting = stateValue === "submitting"
  const currentAnswered = currentQuestion ? (answers[currentQuestion.id]?.length ?? 0) > 0 : false
  const allAnswered = activeQuestions.every((question) => (answers[question.id]?.length ?? 0) > 0)

  const helperText = isLastQuestion
    ? !allAnswered
      ? "Answer all required questions to submit."
      : null
    : !currentAnswered
      ? "Select at least one option to continue."
      : null

  return {
    activeQuestions,
    currentQuestion,
    isFirstQuestion,
    isLastQuestion,
    isSubmitting,
    canGoNext: currentAnswered && !isLastQuestion,
    canSubmit: allAnswered && !isSubmitting,
    helperText,
    progress: ((currentIndex + 1) / activeQuestions.length) * 100
  }
}

export function Questionnaire({ projectId }: Props) {
  const actorRef = QuestionnaireContext.useActorRef()
  const stateValue = QuestionnaireContext.useSelector((s) => s.value as StateValue)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)
  const currentIndex = QuestionnaireContext.useSelector((s) => s.context.currentIndex)
  const permitResult = QuestionnaireContext.useSelector((s) => s.context.permitResult)
  const error = QuestionnaireContext.useSelector((s) => s.context.error)
  const send = actorRef.send

  const { isLoading } = useQuestionnaireApi(projectId, actorRef)

  if (isLoading) {
    return <LoadingStatus message="Loading..." />
  }

  if (stateValue === "idle") {
    return <IdleView onStart={() => send({ type: "START" })} />
  }

  if (isResultState(stateValue)) {
    if (!permitResult) {
      return <LoadingStatus message="Loading result..." />
    }

    return (
      <ResultView
        stateValue={stateValue}
        error={error}
        permitResult={permitResult}
        onEdit={() => send({ type: "EDIT" })}
        onStartOver={() => send({ type: "START_OVER" })}
      />
    )
  }

  const view = buildAnsweringState(answers, currentIndex, stateValue)

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        {!view.isFirstQuestion && <ProgressBar progress={view.progress} />}

        <div className="min-h-[200px]">
          {view.currentQuestion && (
            <BlurFade key={view.currentQuestion.id} duration={0.3}>
              <QuestionStep
                definition={view.currentQuestion}
                values={answers[view.currentQuestion.id] ?? []}
                onChange={(values) =>
                  send({ type: "SET_ANSWER", questionId: view.currentQuestion.id, values })
                }
              />
            </BlurFade>
          )}
        </div>

        <ErrorAlert error={error} />
        {view.helperText && <div className="text-xs text-muted-foreground">{view.helperText}</div>}

        <div className="flex gap-2">
          {!view.isFirstQuestion && (
            <Button variant="outline" onClick={() => send({ type: "BACK" })}>
              Back
            </Button>
          )}
          {view.isLastQuestion ? (
            <SubmitButton
              onClick={() => send({ type: "SUBMIT" })}
              disabled={!view.canSubmit}
              submitting={view.isSubmitting}
            />
          ) : (
            <Button onClick={() => send({ type: "NEXT" })} disabled={!view.canGoNext}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingStatus({ message }: { message: string }) {
  return (
    <div className="text-sm text-muted-foreground" role="status">
      {message}
    </div>
  )
}

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <BlurFade>
      <Button onClick={onStart}>Start Questionnaire</Button>
    </BlurFade>
  )
}

function ResultView({
  stateValue,
  error,
  permitResult,
  onEdit,
  onStartOver
}: {
  stateValue: "submitted" | "deleting" | "reopening"
  error: string | null
  permitResult: PermitOutcome
  onEdit: () => void
  onStartOver: () => void
}) {
  const busy = stateValue === "deleting" || stateValue === "reopening"

  return (
    <div className="flex flex-col gap-4">
      <PermitResult permitResult={permitResult} />
      <ErrorAlert error={error} />
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
        <Button variant="outline" onClick={onEdit} disabled={busy}>
          {stateValue === "reopening" ? "Reopening..." : "Edit Answers"}
        </Button>
        <Button variant="outline" onClick={onStartOver} disabled={busy}>
          {stateValue === "deleting" ? "Clearing..." : "Start Over"}
        </Button>
      </div>
    </div>
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
