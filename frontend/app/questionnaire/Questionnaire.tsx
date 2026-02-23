import { BlurFade } from "@/components/magicui/blur-fade"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useMachine } from "@xstate/react"
import { getActiveQuestions, scopeOfWorkQuestions } from "./definition"
import { createQuestionnaireMachine } from "./machine"
import { PermitBadge } from "./PermitBadge"
import { PermitResult } from "./PermitResult"
import { ProgressBar } from "./ProgressBar"
import { QuestionStep } from "./QuestionStep"
import { useQuestionnaireApi } from "./useQuestionnaireApi"

const machine = createQuestionnaireMachine(scopeOfWorkQuestions)

type Props = { projectId: string; location: string }

export function Questionnaire({ projectId, location }: Props) {
  const [state, send] = useMachine(machine)
  const { isLoading } = useQuestionnaireApi(projectId, state, send)

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground" role="status">
        Loading...
      </div>
    )
  }

  if (state.value === "idle") {
    return (
      <BlurFade>
        <Button onClick={() => send({ type: "START" })}>Start Questionnaire</Button>
      </BlurFade>
    )
  }

  if (state.value === "submitted" || state.value === "deleting") {
    return (
      <div className="flex flex-col gap-4">
        <PermitResult permitResult={state.context.permitResult!} />
        <Button
          variant="outline"
          onClick={() => send({ type: "START_OVER" })}
          disabled={state.value === "deleting"}
        >
          {state.value === "deleting" ? "Clearing..." : "Start Over"}
        </Button>
      </div>
    )
  }

  const active = getActiveQuestions(scopeOfWorkQuestions, state.context.answers)
  const current = active[state.context.currentIndex]
  const isLast = state.context.currentIndex === active.length - 1
  const isFirst = state.context.currentIndex === 0
  const progress = ((state.context.currentIndex + 1) / active.length) * 100

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <ProgressBar
          progress={progress}
          current={state.context.currentIndex + 1}
          total={active.length}
        />

        <div className="min-h-[200px]">
          {current && (
            <BlurFade key={current.id} duration={0.3}>
              <QuestionStep
                definition={current}
                values={state.context.answers[current.id] ?? []}
                onChange={(values) =>
                  send({ type: "SET_ANSWER", questionId: current.id, values })
                }
              />
            </BlurFade>
          )}
        </div>

        <PermitBadge answers={state.context.answers} location={location} />

        <div className="flex gap-2">
          {!isFirst && (
            <Button variant="outline" onClick={() => send({ type: "BACK" })}>
              Back
            </Button>
          )}
          {isLast ? (
            <SubmitButton
              onClick={() => send({ type: "SUBMIT" })}
              disabled={state.value === "submitting"}
              submitting={state.value === "submitting"}
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
