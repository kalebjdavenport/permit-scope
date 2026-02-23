import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"
import type { Events } from "./machine"

type StateLike = {
  value: string
  context: { answers: Record<string, string[]> }
}

type Send = (event: Events) => void

/**
 * Bridges the XState machine with the tRPC API layer.
 * Reacts to machine state transitions (submitting, deleting) by firing
 * API calls, then sends success/error events back to the machine.
 * Also hydrates the machine with existing data on first load.
 */
export function useQuestionnaireApi(projectId: string, state: StateLike, send: Send) {
  const queryClient = useQueryClient()
  // Prevents re-dispatching LOAD_EXISTING if React Query refetches
  const loadedRef = useRef(false)

  const { data: existing, isLoading } = useQuery(
    trpc.questionnaires.getByProject.queryOptions({ projectId })
  )

  const submitMutation = useMutation(trpc.questionnaires.submit.mutationOptions())
  const deleteMutation = useMutation(trpc.questionnaires.delete.mutationOptions())
  const queryKey = trpc.questionnaires.getByProject.queryOptions({ projectId }).queryKey

  // Hydrate machine with saved questionnaire on first load
  useEffect(() => {
    if (loadedRef.current || isLoading || !existing) return
    loadedRef.current = true
    send({ type: "LOAD_EXISTING", answers: existing.answers, permitResult: existing.permitResult })
  }, [existing, isLoading, send])

  // Fire submit API call when machine enters "submitting" state.
  // Deps intentionally limited to state.value — we only want to fire once per transition.
  useEffect(() => {
    if (state.value !== "submitting") return
    const scrubbed = scrubAnswers(state.context.answers, scopeOfWorkQuestions)
    submitMutation.mutateAsync({ projectId, answers: scrubbed }).then(
      (result) => {
        queryClient.invalidateQueries({ queryKey })
        send({ type: "SUBMIT_SUCCESS", permitResult: result.permitResult })
      },
      () => send({ type: "SUBMIT_ERROR" })
    )
  }, [state.value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire delete API call when machine enters "deleting" state
  useEffect(() => {
    if (state.value !== "deleting") return
    deleteMutation.mutateAsync({ projectId }).then(
      () => {
        queryClient.invalidateQueries({ queryKey })
        loadedRef.current = false // Allow re-hydration after start over
        send({ type: "DELETE_SUCCESS" })
      },
      () => send({ type: "DELETE_ERROR" })
    )
  }, [state.value]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoading }
}
