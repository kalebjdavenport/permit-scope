import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { QuestionnaireContext } from "./context"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"

type ActorRef = ReturnType<typeof QuestionnaireContext.useActorRef>

/**
 * Bridges the XState machine with the tRPC API layer.
 * Reacts to machine state transitions (submitting, deleting) by firing
 * API calls, then sends success/error events back to the machine.
 * Also hydrates the machine with existing data on first load.
 */
export function useQuestionnaireApi(projectId: string, actorRef: ActorRef) {
  const queryClient = useQueryClient()
  // Prevents re-dispatching LOAD_EXISTING/LOAD_DRAFT if React Query refetches
  const loadedRef = useRef(false)

  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)
  const currentIndex = QuestionnaireContext.useSelector((s) => s.context.currentIndex)

  // Log XState transitions
  useEffect(() => {
    console.log("[xstate]", stateValue, { answers, currentIndex })
  }, [stateValue, answers, currentIndex])

  const { data: existing, isLoading } = useQuery(
    trpc.questionnaires.getByProject.queryOptions({ projectId })
  )

  const submitMutation = useMutation(trpc.questionnaires.submit.mutationOptions())
  const deleteMutation = useMutation(trpc.questionnaires.delete.mutationOptions())
  const draftMutation = useMutation(trpc.questionnaires.saveDraft.mutationOptions())
  const reopenMutation = useMutation(trpc.questionnaires.reopenDraft.mutationOptions())
  const queryKey = trpc.questionnaires.getByProject.queryOptions({ projectId }).queryKey

  // Hydrate machine with saved questionnaire on first load
  useEffect(() => {
    if (loadedRef.current || isLoading || !existing) return
    loadedRef.current = true

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

  // Auto-save draft with 1s debounce when answering
  useEffect(() => {
    if (stateValue !== "answering") return
    if (Object.keys(answers).length === 0) return

    const timer = setTimeout(() => {
      draftMutation.mutate({ projectId, answers, currentIndex })
    }, 1000)
    return () => clearTimeout(timer)
  }, [answers, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire submit API call when machine enters "submitting" state.
  // Deps intentionally limited to stateValue — we only want to fire once per transition.
  useEffect(() => {
    if (stateValue !== "submitting") return
    let cancelled = false
    const snap = actorRef.getSnapshot()
    const scrubbed = scrubAnswers(snap.context.answers, scopeOfWorkQuestions)
    submitMutation.mutateAsync({ projectId, answers: scrubbed }).then(
      (result) => {
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey })
        actorRef.send({ type: "SUBMIT_SUCCESS", permitResult: result.permitResult! })
      },
      () => {
        if (cancelled) return
        actorRef.send({ type: "SUBMIT_ERROR" })
      }
    )
    return () => { cancelled = true }
  }, [stateValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire delete API call when machine enters "deleting" state
  useEffect(() => {
    if (stateValue !== "deleting") return
    let cancelled = false
    deleteMutation.mutateAsync({ projectId }).then(
      () => {
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey })
        loadedRef.current = false // Allow re-hydration after start over
        actorRef.send({ type: "DELETE_SUCCESS" })
      },
      () => {
        if (cancelled) return
        actorRef.send({ type: "DELETE_ERROR" })
      }
    )
    return () => { cancelled = true }
  }, [stateValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire reopen API call when machine enters "reopening" state
  useEffect(() => {
    if (stateValue !== "reopening") return
    let cancelled = false
    reopenMutation.mutateAsync({ projectId }).then(
      () => {
        if (cancelled) return
        queryClient.invalidateQueries({ queryKey })
        actorRef.send({ type: "REOPEN_SUCCESS" })
      },
      () => {
        if (cancelled) return
        actorRef.send({ type: "REOPEN_ERROR" })
      }
    )
    return () => { cancelled = true }
  }, [stateValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoading }
}
