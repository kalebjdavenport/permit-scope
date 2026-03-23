import { describe, expect, test } from "bun:test"
import { getActiveQuestions, scopeOfWorkQuestions, scrubAnswers } from "./definition"

describe("questionnaire definition", () => {
  test("shows only the first question before any answers are given", () => {
    const activeQuestions = getActiveQuestions(scopeOfWorkQuestions, {})

    expect(activeQuestions.map((question) => question.id)).toEqual(["workType"])
  })

  test("shows dependent questions for each selected work type", () => {
    const activeQuestions = getActiveQuestions(scopeOfWorkQuestions, {
      workType: ["interior", "exterior"]
    })

    expect(activeQuestions.map((question) => question.id)).toEqual([
      "workType",
      "interiorWork",
      "exteriorWork"
    ])
  })

  test("removes answers for questions that are no longer active", () => {
    const scrubbedAnswers = scrubAnswers(
      {
        workType: ["exterior"],
        interiorWork: ["flooring"],
        exteriorWork: ["fencing"]
      },
      scopeOfWorkQuestions
    )

    expect(scrubbedAnswers).toEqual({
      workType: ["exterior"],
      exteriorWork: ["fencing"]
    })
  })
})
