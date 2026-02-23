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

export function useQuestionnaireApi(projectId: string, state: StateLike, send: Send) {
  const queryClient = useQueryClient()
  const loadedRef = useRef(false)

  const { data: existing, isLoading } = useQuery(
    trpc.questionnaires.getByProject.queryOptions({ projectId })
  )

  const submitMutation = useMutation(trpc.questionnaires.submit.mutationOptions())
  const deleteMutation = useMutation(trpc.questionnaires.delete.mutationOptions())
  const queryKey = trpc.questionnaires.getByProject.queryOptions({ projectId }).queryKey

  useEffect(() => {
    if (loadedRef.current || isLoading || !existing) return
    loadedRef.current = true
    send({ type: "LOAD_EXISTING", answers: existing.answers, permitResult: existing.permitResult })
  }, [existing, isLoading, send])

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

  useEffect(() => {
    if (state.value !== "deleting") return
    deleteMutation.mutateAsync({ projectId }).then(
      () => {
        queryClient.invalidateQueries({ queryKey })
        loadedRef.current = false
        send({ type: "DELETE_SUCCESS" })
      },
      () => send({ type: "DELETE_ERROR" })
    )
  }, [state.value]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoading }
}
