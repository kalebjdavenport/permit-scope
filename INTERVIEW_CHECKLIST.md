# PermitFlow Take-Home Checklist

Use this checklist before submission to confirm both explicit requirements and evaluation signals are covered.

## 1) Functional Requirements (README)

- [ ] Project creation works (already scaffolded; confirm no regressions)
- [ ] Questionnaire is available inside each project page
- [ ] Conditional questions render correctly:
- [ ] Work Type always appears first and allows multi-select
- [ ] Interior details shown only when interior is selected
- [ ] Exterior details shown only when exterior is selected
- [ ] Property addition details shown only when property addition is selected and allows single-select
- [ ] Submit returns one requirement outcome:
- [ ] In-House Review Process
- [ ] Over-the-Counter Submission Process
- [ ] No Permit
- [ ] Permit requirement result persists when leaving and revisiting the project page
- [ ] Optional: questionnaire can be updated and requirements recomputed

## 2) Rules Logic Correctness

- [ ] Priority order is enforced exactly:
- [ ] In-House Review
- [ ] OTC Review
- [ ] No Permit
- [ ] In-House triggers implemented:
- [ ] Any property addition work
- [ ] New bathroom
- [ ] New laundry room
- [ ] San Francisco + structural work (deck construction or garage modifications)
- [ ] Any "Other" option in any category
- [ ] OTC triggers implemented:
- [ ] Bathroom remodel
- [ ] Electrical work
- [ ] Roof modifications/repair
- [ ] Garage door replacement + exterior doors selected together
- [ ] No Permit only when neither In-House nor OTC triggers fire

## 3) Code Quality Signals They Likely Care About

- [ ] Business rules are centralized and readable (not scattered across components)
- [ ] Frontend/backend responsibilities are cleanly separated
- [ ] Data model and persistence are clear and minimal
- [ ] Types and validation are used consistently (tRPC + schema safety)
- [ ] Naming and structure are production-merge quality
- [ ] No unnecessary stack/config changes
- [ ] Edge cases are handled (empty states, mixed selections, revisits)

## 4) Time-Boxed Judgment (1–2 Hours)

- [ ] Scope is right-sized: core requirements complete before polish
- [ ] Implementation is pragmatic (simple, maintainable, and correct)
- [ ] Optional features only attempted after required behavior is stable

## 5) Submission Readiness

- [ ] Backend changes are in `backend/app`
- [ ] Frontend changes are in `frontend/app`
- [ ] Scaffold internal configuration is unchanged
- [ ] Demo walkthrough can clearly explain:
- [ ] Architecture overview
- [ ] Key technical decisions/tradeoffs
- [ ] Challenges and fixes
- [ ] Future improvements
