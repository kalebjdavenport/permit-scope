import { describe, expect, test } from "bun:test"
import { createActor } from "xstate"
import { scopeOfWorkQuestions } from "./definition"
import { createQuestionnaireMachine } from "./machine"

function createQuestionnaireActor() {
  const actor = createActor(createQuestionnaireMachine(scopeOfWorkQuestions))
  actor.start()
  return actor
}

describe("questionnaire machine", () => {
  test("blocks next until the current question has an answer", () => {
    const actor = createQuestionnaireActor()

    actor.send({ type: "START" })
    actor.send({ type: "NEXT" })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe("answering")
    expect(snapshot.context.currentIndex).toBe(0)
    expect(snapshot.context.error).toBe("Please answer this question before continuing.")
  })

  test("clamps the current index when branching answers remove later questions", () => {
    const actor = createQuestionnaireActor()

    actor.send({ type: "START" })
    actor.send({ type: "SET_ANSWER", questionId: "workType", values: ["interior", "exterior"] })
    actor.send({ type: "NEXT" })
    actor.send({ type: "SET_ANSWER", questionId: "interiorWork", values: ["flooring"] })
    actor.send({ type: "NEXT" })
    actor.send({ type: "SET_ANSWER", questionId: "workType", values: ["interior"] })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe("answering")
    expect(snapshot.context.currentIndex).toBe(1)
    expect(snapshot.context.answers.workType).toEqual(["interior"])
  })

  test("blocks submit until every active question is answered", () => {
    const actor = createQuestionnaireActor()

    actor.send({ type: "START" })
    actor.send({ type: "SET_ANSWER", questionId: "workType", values: ["interior"] })
    actor.send({ type: "SUBMIT" })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe("answering")
    expect(snapshot.context.error).toBe("Please answer all required questions before submitting.")
  })

  test("restores a draft to the last valid step", () => {
    const actor = createQuestionnaireActor()

    actor.send({
      type: "LOAD_DRAFT",
      answers: { workType: ["interior"] },
      currentIndex: 9
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe("answering")
    expect(snapshot.context.currentIndex).toBe(1)
  })

  test("stores the permit result after a successful submission", () => {
    const actor = createQuestionnaireActor()

    actor.send({ type: "START" })
    actor.send({ type: "SET_ANSWER", questionId: "workType", values: ["interior"] })
    actor.send({ type: "SET_ANSWER", questionId: "interiorWork", values: ["flooring"] })
    actor.send({ type: "SUBMIT" })
    actor.send({ type: "SUBMIT_SUCCESS", permitResult: "no_permit" })

    const snapshot = actor.getSnapshot()
    expect(snapshot.value).toBe("submitted")
    expect(snapshot.context.permitResult).toBe("no_permit")
    expect(snapshot.context.error).toBeNull()
  })
})
