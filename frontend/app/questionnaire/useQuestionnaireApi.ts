import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { QuestionnaireContext } from "./context"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"

type ActorRef = ReturnType<typeof QuestionnaireContext.useActorRef>
const FALLBACK_ERROR = "Something went wrong. Please try again."
const DRAFT_SAVE_DELAY_MS = 1000

const toErrorMessage = (error: unknown) => (error instanceof Error ? error.message : FALLBACK_ERROR)

type MutationEffectArgs<Result> = {
  stateValue: string
  targetState: string
  mutate: () => Promise<Result>
  onSuccess: (result: Result) => void
  onError: (error: unknown) => void
}

function useMachineMutationEffect<Result>({
  stateValue,
  targetState,
  mutate,
  onSuccess,
  onError
}: MutationEffectArgs<Result>) {
  useEffect(() => {
    if (stateValue !== targetState) return
    let cancelled = false

    const run = async () => {
      try {
        const result = await mutate()
        if (cancelled) return
        onSuccess(result)
      } catch (error) {
        if (cancelled) return
        onError(error)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [mutate, onError, onSuccess, stateValue, targetState])
}

/**
 * Bridges the XState machine with the tRPC API layer.
 * Reacts to machine state transitions (submitting, deleting, reopening) by
 * firing API calls, then sends success/error events back to the machine.
 * Also hydrates the machine with existing data on first load.
 */
export function useQuestionnaireApi(projectId: string, actorRef: ActorRef) {
  const queryClient = useQueryClient()
  const hasHydratedRef = useRef(false)

  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)
  const currentIndex = QuestionnaireContext.useSelector((s) => s.context.currentIndex)

  const queryOptions = trpc.questionnaires.getByProject.queryOptions({ projectId })
  const { data: existing, isLoading } = useQuery(queryOptions)
  const queryKey = queryOptions.queryKey

  const submitMutation = useMutation(trpc.questionnaires.submit.mutationOptions())
  const deleteMutation = useMutation(trpc.questionnaires.delete.mutationOptions())
  const draftMutation = useMutation(trpc.questionnaires.saveDraft.mutationOptions())
  const reopenMutation = useMutation(trpc.questionnaires.reopenDraft.mutationOptions())

  // Hydrate machine with saved questionnaire on first load
  useEffect(() => {
    if (hasHydratedRef.current || isLoading || !existing) return
    hasHydratedRef.current = true

    if (existing.status === "draft") {
      actorRef.send({
        type: "LOAD_DRAFT",
        answers: existing.answers,
        currentIndex: existing.currentIndex
      })
    } else {
      actorRef.send({
        type: "LOAD_EXISTING",
        answers: existing.answers,
        permitResult: existing.permitResult!
      })
    }
  }, [existing, isLoading, actorRef])

  // Debounced draft save — fires 1s after last answer/navigation change
  useEffect(() => {
    if (stateValue !== "answering") return
    if (Object.keys(answers).length === 0) return

    const timer = setTimeout(() => {
      draftMutation.mutate({ projectId, answers, currentIndex })
    }, DRAFT_SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [answers, currentIndex, draftMutation, projectId, stateValue])

  const invalidateQuestionnaire = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const submitAnswers = useCallback(async () => {
    const snapshot = actorRef.getSnapshot()
    const submitAnswers = scrubAnswers(snapshot.context.answers, scopeOfWorkQuestions)
    return submitMutation.mutateAsync({ projectId, answers: submitAnswers })
  }, [actorRef, projectId, submitMutation])

  useMachineMutationEffect({
    stateValue,
    targetState: "submitting",
    mutate: submitAnswers,
    onSuccess: (result) => {
      invalidateQuestionnaire()
      actorRef.send({ type: "SUBMIT_SUCCESS", permitResult: result.permitResult! })
    },
    onError: (error) => {
      actorRef.send({ type: "SUBMIT_ERROR", error: toErrorMessage(error) })
    }
  })

  useMachineMutationEffect({
    stateValue,
    targetState: "deleting",
    mutate: () => deleteMutation.mutateAsync({ projectId }),
    onSuccess: () => {
      invalidateQuestionnaire()
      hasHydratedRef.current = false
      actorRef.send({ type: "DELETE_SUCCESS" })
    },
    onError: (error) => {
      actorRef.send({ type: "DELETE_ERROR", error: toErrorMessage(error) })
    }
  })

  useMachineMutationEffect({
    stateValue,
    targetState: "reopening",
    mutate: () => reopenMutation.mutateAsync({ projectId }),
    onSuccess: () => {
      invalidateQuestionnaire()
      actorRef.send({ type: "REOPEN_SUCCESS" })
    },
    onError: (error) => {
      actorRef.send({ type: "REOPEN_ERROR", error: toErrorMessage(error) })
    }
  })

  return { isLoading }
}
