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
  const loadedRef = useRef(false)

  const stateValue = QuestionnaireContext.useSelector((s) => s.value)

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
    actorRef.send({
      type: "LOAD_EXISTING",
      answers: existing.answers,
      permitResult: existing.permitResult
    })
  }, [existing, isLoading, actorRef])

  // Fire submit API call when machine enters "submitting" state
  useEffect(() => {
    if (stateValue !== "submitting") return
    const snap = actorRef.getSnapshot()
    const scrubbed = scrubAnswers(snap.context.answers, scopeOfWorkQuestions)
    submitMutation.mutateAsync({ projectId, answers: scrubbed }).then(
      (result) => {
        queryClient.invalidateQueries({ queryKey })
        actorRef.send({ type: "SUBMIT_SUCCESS", permitResult: result.permitResult })
      },
      () => actorRef.send({ type: "SUBMIT_ERROR" })
    )
  }, [stateValue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire delete API call when machine enters "deleting" state
  useEffect(() => {
    if (stateValue !== "deleting") return
    deleteMutation.mutateAsync({ projectId }).then(
      () => {
        queryClient.invalidateQueries({ queryKey })
        loadedRef.current = false
        actorRef.send({ type: "DELETE_SUCCESS" })
      },
      () => actorRef.send({ type: "DELETE_ERROR" })
    )
  }, [stateValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoading }
}
