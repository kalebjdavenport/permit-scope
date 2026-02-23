import { createActorContext } from "@xstate/react"
import { scopeOfWorkQuestions } from "./definition"
import { createQuestionnaireMachine } from "./machine"

const machine = createQuestionnaireMachine(scopeOfWorkQuestions)

export const QuestionnaireContext = createActorContext(machine)
