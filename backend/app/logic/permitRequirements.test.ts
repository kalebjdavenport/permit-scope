import { describe, expect, test } from "bun:test"
import { determinePermitRequirement } from "./permitRequirements"

const SF = "San Francisco, CA"
const OTHER = "Los Angeles, CA"

describe("determinePermitRequirement", () => {
  describe("in-house review", () => {
    test("any property addition triggers in-house", () => {
      const answers = { workType: ["additions"], propertyAdditions: ["adu"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("garage conversion triggers in-house", () => {
      const answers = { workType: ["additions"], propertyAdditions: ["garage_conversion"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("basement/attic conversion triggers in-house", () => {
      const answers = { workType: ["additions"], propertyAdditions: ["basement_attic_conversion"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("new bathroom triggers in-house", () => {
      const answers = { workType: ["interior"], interiorWork: ["new_bathroom"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("new laundry room triggers in-house", () => {
      const answers = { workType: ["interior"], interiorWork: ["new_laundry_room"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("'other' in any category triggers in-house", () => {
      const answers = { workType: ["interior"], interiorWork: ["other"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("'other' in exterior triggers in-house", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["other"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("'other' in property additions triggers in-house", () => {
      const answers = { workType: ["additions"], propertyAdditions: ["other"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("in_house_review")
    })

    test("SF + deck construction triggers in-house", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["deck_construction"] }
      expect(determinePermitRequirement(answers, SF)).toBe("in_house_review")
    })

    test("SF + garage modifications triggers in-house", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["garage_modifications"] }
      expect(determinePermitRequirement(answers, SF)).toBe("in_house_review")
    })

    test("non-SF + deck construction does NOT trigger in-house", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["deck_construction"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })

    test("non-SF + garage modifications does NOT trigger in-house", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["garage_modifications"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })
  })

  describe("OTC review", () => {
    test("bathroom remodel triggers OTC", () => {
      const answers = { workType: ["interior"], interiorWork: ["bathroom_remodel"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("otc_review")
    })

    test("electrical work triggers OTC", () => {
      const answers = { workType: ["interior"], interiorWork: ["electrical_work"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("otc_review")
    })

    test("roof modifications triggers OTC", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["roof_modifications"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("otc_review")
    })

    test("garage door + exterior doors together triggers OTC", () => {
      const answers = {
        workType: ["exterior"],
        exteriorWork: ["garage_door_replacement", "exterior_doors"]
      }
      expect(determinePermitRequirement(answers, OTHER)).toBe("otc_review")
    })

    test("garage door alone does NOT trigger OTC", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["garage_door_replacement"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })

    test("exterior doors alone does NOT trigger OTC", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["exterior_doors"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })
  })

  describe("no permit", () => {
    test("flooring only requires no permit", () => {
      const answers = { workType: ["interior"], interiorWork: ["flooring"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })

    test("fencing only requires no permit", () => {
      const answers = { workType: ["exterior"], exteriorWork: ["fencing"] }
      expect(determinePermitRequirement(answers, OTHER)).toBe("no_permit")
    })

    test("empty answers requires no permit", () => {
      expect(determinePermitRequirement({}, OTHER)).toBe("no_permit")
    })
  })

  describe("priority: in-house > OTC", () => {
    test("in-house takes priority when both triggers present", () => {
      const answers = {
        workType: ["interior", "additions"],
        interiorWork: ["bathroom_remodel"],
        propertyAdditions: ["adu"]
      }
      expect(determinePermitRequirement(answers, SF)).toBe("in_house_review")
    })
  })
})
