import type { PermitOutcome } from "@permitflow/backend/logic"
import { assign, setup } from "xstate"
import { type QuestionDefinition, getActiveQuestions } from "./definition"

type Answers = Record<string, string[]>

type Context = {
  answers: Answers
  currentIndex: number
  permitResult: PermitOutcome | null
  error: string | null
}

export type Events =
  | { type: "START" }
  | { type: "LOAD_EXISTING"; answers: Answers; permitResult: PermitOutcome }
  | { type: "LOAD_DRAFT"; answers: Answers; currentIndex: number }
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

const VALIDATION_ERROR = {
  next: "Please answer this question before continuing.",
  submit: "Please answer all required questions before submitting."
} as const

function createQuestionHelpers(questions: QuestionDefinition[]) {
  const activeQuestions = (answers: Answers) => getActiveQuestions(questions, answers)

  const isQuestionAnswered = (answers: Answers, questionId: string) =>
    (answers[questionId]?.length ?? 0) > 0

  const currentQuestion = (context: Context) =>
    activeQuestions(context.answers)[context.currentIndex]

  const clampIndex = (answers: Answers, currentIndex: number) =>
    Math.max(0, Math.min(currentIndex, activeQuestions(answers).length - 1))

  const canAdvance = (context: Context) => {
    const question = currentQuestion(context)
    if (!question) return false
    const hasNextQuestion = context.currentIndex < activeQuestions(context.answers).length - 1
    return hasNextQuestion && isQuestionAnswered(context.answers, question.id)
  }

  const canSubmit = (context: Context) =>
    activeQuestions(context.answers).every((question) =>
      isQuestionAnswered(context.answers, question.id)
    )

  const nextValidationError = (context: Context) => {
    const question = currentQuestion(context)
    if (!question) return null
    if (isQuestionAnswered(context.answers, question.id)) return null
    return VALIDATION_ERROR.next
  }

  return {
    clampIndex,
    canAdvance,
    canSubmit,
    nextValidationError
  }
}

export const createQuestionnaireMachine = (questions: QuestionDefinition[]) => {
  const questionHelpers = createQuestionHelpers(questions)

  return setup({
    types: {
      context: {} as Context,
      events: {} as Events
    },
    guards: {
      hasPrev: ({ context }) => context.currentIndex > 0,
      canAdvance: ({ context }) => questionHelpers.canAdvance(context),
      canSubmit: ({ context }) => questionHelpers.canSubmit(context)
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
            actions: assign(({ event }) => ({
              answers: event.answers,
              currentIndex: questionHelpers.clampIndex(event.answers, event.currentIndex),
              permitResult: null,
              error: null
            }))
          }
        }
      },
      answering: {
        on: {
          SET_ANSWER: {
            actions: assign(({ context, event }) => {
              const answers = { ...context.answers, [event.questionId]: event.values }
              return {
                answers,
                currentIndex: questionHelpers.clampIndex(answers, context.currentIndex),
                permitResult: context.permitResult,
                error: null
              }
            })
          },
          NEXT: [
            {
              guard: "canAdvance",
              actions: assign(({ context }) => ({
                currentIndex: context.currentIndex + 1,
                error: null
              }))
            },
            {
              actions: assign(({ context }) => {
                const error = questionHelpers.nextValidationError(context)
                return error ? { error } : {}
              })
            }
          ],
          BACK: {
            guard: "hasPrev",
            actions: assign(({ context }) => ({
              currentIndex: context.currentIndex - 1,
              error: null
            }))
          },
          SUBMIT: [
            {
              guard: "canSubmit",
              target: "submitting",
              actions: assign({ error: null })
            },
            { actions: assign({ error: VALIDATION_ERROR.submit }) }
          ]
        }
      },
      submitting: {
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
}
