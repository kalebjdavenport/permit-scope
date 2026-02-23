import type { PermitOutcome } from "@permitflow/backend/logic"
import { assign, setup } from "xstate"
import { type QuestionDefinition, getActiveQuestions } from "./definition"

type Context = {
  answers: Record<string, string[]>
  currentIndex: number
  permitResult: PermitOutcome | null
  error: string | null
}

export type Events =
  | { type: "START" }
  | { type: "LOAD_EXISTING"; answers: Record<string, string[]>; permitResult: PermitOutcome }
  | { type: "LOAD_DRAFT"; answers: Record<string, string[]>; currentIndex: number }
  | { type: "SET_ANSWER"; questionId: string; values: string[] }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMIT" }
  | { type: "SUBMIT_SUCCESS"; permitResult: PermitOutcome }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "START_OVER" }
  | { type: "DELETE_SUCCESS" }
  | { type: "DELETE_ERROR"; error: string }
  | { type: "EDIT" }
  | { type: "REOPEN_SUCCESS" }
  | { type: "REOPEN_ERROR"; error: string }

const initialContext: Context = {
  answers: {},
  currentIndex: 0,
  permitResult: null,
  error: null
}

/** Auto-recover if the network/API never responds (submitting, deleting, reopening) */
const API_TIMEOUT_MS = 30_000

export const createQuestionnaireMachine = (questions: QuestionDefinition[]) =>
  setup({
    types: {
      context: {} as Context,
      events: {} as Events
    },
    guards: {
      hasNext: ({ context }) => {
        const active = getActiveQuestions(questions, context.answers)
        return context.currentIndex < active.length - 1
      },
      hasPrev: ({ context }) => context.currentIndex > 0,
      allAnswered: ({ context }) => {
        const active = getActiveQuestions(questions, context.answers)
        return active.every((q) => (context.answers[q.id]?.length ?? 0) > 0)
      }
    }
  }).createMachine({
    id: "questionnaire",
    initial: "idle",
    context: initialContext,
    states: {
      idle: {
        on: {
          START: { target: "answering", actions: assign(() => initialContext) },
          LOAD_EXISTING: {
            target: "submitted",
            actions: assign(({ event }) => ({
              answers: event.answers,
              currentIndex: 0,
              permitResult: event.permitResult
            }))
          },
          LOAD_DRAFT: {
            target: "answering",
            actions: assign(({ event }) => {
              const active = getActiveQuestions(questions, event.answers)
              return {
                answers: event.answers,
                currentIndex: Math.min(event.currentIndex, Math.max(active.length - 1, 0)),
                permitResult: null
              }
            })
          }
        }
      },
      answering: {
        on: {
          SET_ANSWER: {
            actions: assign(({ context, event }) => {
              const next = { ...context.answers, [event.questionId]: event.values }
              const active = getActiveQuestions(questions, next)
              // Clamp index: if an answer deactivates a later question, the current
              // index might exceed the new active list length
              return {
                answers: next,
                currentIndex: Math.min(context.currentIndex, active.length - 1),
                permitResult: context.permitResult,
                error: null
              }
            })
          },
          NEXT: { guard: "hasNext", actions: assign(({ context }) => ({ currentIndex: context.currentIndex + 1 })) },
          BACK: { guard: "hasPrev", actions: assign(({ context }) => ({ currentIndex: context.currentIndex - 1 })) },
          SUBMIT: {
            guard: "allAnswered",
            target: "submitting",
            actions: assign({ error: null })
          }
        }
      },
      submitting: {
        // Auto-recover if API call never responds
        after: { [API_TIMEOUT_MS]: { target: "answering" } },
        on: {
          SUBMIT_SUCCESS: {
            target: "submitted",
            actions: assign(({ event }) => ({ permitResult: event.permitResult, error: null }))
          },
          SUBMIT_ERROR: {
            target: "answering",
            actions: assign(({ event }) => ({ error: event.error }))
          }
        }
      },
      submitted: {
        on: {
          START_OVER: { target: "deleting", actions: assign({ error: null }) },
          EDIT: { target: "reopening", actions: assign({ error: null }) }
        }
      },
      reopening: {
        after: { [API_TIMEOUT_MS]: { target: "submitted" } },
        on: {
          // Keep existing answers, reset to first question for editing
          REOPEN_SUCCESS: {
            target: "answering",
            actions: assign(({ context }) => ({
              answers: context.answers,
              currentIndex: 0,
              permitResult: context.permitResult,
              error: null
            }))
          },
          REOPEN_ERROR: {
            target: "submitted",
            actions: assign(({ event }) => ({ error: event.error }))
          }
        }
      },
      deleting: {
        // Auto-recover if delete API call never responds
        after: { [API_TIMEOUT_MS]: { target: "submitted" } },
        on: {
          DELETE_SUCCESS: { target: "idle", actions: assign(() => initialContext) },
          DELETE_ERROR: {
            target: "submitted",
            actions: assign(({ event }) => ({ error: event.error }))
          }
        }
      }
    }
  })
