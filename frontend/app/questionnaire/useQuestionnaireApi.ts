import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { QuestionnaireContext } from "./context"
import { scopeOfWorkQuestions, scrubAnswers } from "./definition"

type ActorRef = ReturnType<typeof QuestionnaireContext.useActorRef>

/** Runs an async effect when the machine enters a target state. */
function useOnState(
  stateValue: string,
  targetState: string,
  run: () => Promise<void>
) {
  useEffect(() => {
    if (stateValue !== targetState) return
    run().catch(() => { /* handled by caller */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateValue])
}

/**
 * Bridges the XState machine with the tRPC API layer.
 * Reacts to machine state transitions (submitting, deleting, reopening) by
 * firing API calls, then sends success/error events back to the machine.
 * Also hydrates the machine with existing data on first load.
 */
export function useQuestionnaireApi(projectId: string, actorRef: ActorRef) {
  const queryClient = useQueryClient()
  const loadedRef = useRef(false)

  const stateValue = QuestionnaireContext.useSelector((s) => s.value)
  const answers = QuestionnaireContext.useSelector((s) => s.context.answers)
  const currentIndex = QuestionnaireContext.useSelector((s) => s.context.currentIndex)

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

  // Debounced draft save — fires 1s after last answer/navigation change
  useEffect(() => {
    if (stateValue !== "answering") return
    if (Object.keys(answers).length === 0) return

    const timer = setTimeout(() => {
      draftMutation.mutate({ projectId, answers, currentIndex })
    }, 1000)
    return () => clearTimeout(timer)
  }, [answers, currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit when entering "submitting"
  useOnState(stateValue, "submitting", async () => {
    const snap = actorRef.getSnapshot()
    const scrubbed = scrubAnswers(snap.context.answers, scopeOfWorkQuestions)
    try {
      const result = await submitMutation.mutateAsync({ projectId, answers: scrubbed })
      queryClient.invalidateQueries({ queryKey })
      actorRef.send({ type: "SUBMIT_SUCCESS", permitResult: result.permitResult! })
    } catch {
      actorRef.send({ type: "SUBMIT_ERROR" })
    }
  })

  // Delete when entering "deleting"
  useOnState(stateValue, "deleting", async () => {
    try {
      await deleteMutation.mutateAsync({ projectId })
      queryClient.invalidateQueries({ queryKey })
      loadedRef.current = false
      actorRef.send({ type: "DELETE_SUCCESS" })
    } catch {
      actorRef.send({ type: "DELETE_ERROR" })
    }
  })

  // Reopen draft when entering "reopening"
  useOnState(stateValue, "reopening", async () => {
    try {
      await reopenMutation.mutateAsync({ projectId })
      queryClient.invalidateQueries({ queryKey })
      actorRef.send({ type: "REOPEN_SUCCESS" })
    } catch {
      actorRef.send({ type: "REOPEN_ERROR" })
    }
  })

  return { isLoading }
}
