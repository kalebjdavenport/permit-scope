# SWE Take-Home Assignment

Thanks for taking the time to interview with PermitFlow! Here are the details for our take home assignment.

We recommend you take no more than **2 hours** on this assignment.

> You're encouraged to ask clarifying questions! Don't hesitate to reach out to us via email.

## Overview

The goal of this exercise is to create high quality production ready code to build a mini feature for our PermitFlow application on top of provided starter code.

We've built a devcontainer that automatically sets up a development environment for you. **Using the devcontainer is _required_.**

Additionally, we also provided a claude code generated working solution to the problem in the `claude-code-attempt` branch. However, while this solution does work, it would not receive a passing grade for this assignment.

You have the option of improving the claude code generated solution (building on top of the `claude-code-attempt` branch), or ignoring the claude code solution and starting from scratch. You will not be assessed on which option you select, only the quality of the final solution.

### Prerequisites

To run the devcontainer, at minimum you'll need:

- VSCode (or compatible IDE)
- Docker (or compatible backend)
- Git (to submit your response)

### Starting the dev container

1. Clone this repo to your local machine.
1. Open it in VSCode (or compatible IDE).
   - **Make sure that the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) is installed in VSCode.**
1. Your IDE will prompt you to open the repo in the devcontainer. Open it.
1. Wait until the devcontainer is fully setup.
1. Once the devcontainer has launched, you're ready to code!
1. If you ever need to re-build the container, open the VSCode Command Pallete and search for "Dev Containers: Rebuild Container"

The devcontainer will automatically:

- Install all dependencies
- Launch the development server

### Development server

The development server is accessible at http://localhost:6173.

The following is fully setup for you:

- HTTP backend
  - tRPC for type-safe API communication
  - JSON-based temp store
- Vite + React frontend
  - React Router 7
  - Tailwind CSS
  - `<Button />`, `<Input />`, `<Card />`, `<Checkbox />`, `<RadioGroup />` and `<Form />` components (shadcn/ui)

This take home assignment requires no additional tooling other than what's provided out of the box. We've also included a simple CRUD example that shows how tRPC and our data store work end-to-end.

## Prompt

### Goal

Build a scope of work questionnaire that helps contractors determine permit requirements for residential construction projects in San Francisco.

### Expectation

We’re looking for clean, high-quality code that can be merged into the PermitFlow codebase.

### Time

- Recommended time: 1–2 hours
- We recommend doing this in one, uninterrupted session with deep focus.

## Requirements

1. Users are able to create projects (Already completed in the scaffold on the `main` branch)
2. Users are able to fill out a questionnaire inside of the project describing the scope of work.
3. Once the questionnaire is filled out, the permit requirements are shown.
4. Leaving and coming back to the projet page should show the stored permit requirements.
5. (Optional, if time permits) Users should be able to update their questionnaire and show updated permit requirements.

The questionnaire should follow these business requirements:

### Scope of Work Questionnaire

#### Question 1: Work Type

> Always show this question first. Users can select multiple options.

What kind of work are you doing?

1. Interior work
2. Exterior work
3. Property additions

#### Question 2: Interior work details

> Only show if interior work is selected. Users can select multiple options.

What kind of interior work are you doing?

1. Flooring
1. Bathroom remodel
1. New bathroom
1. New laundry room
1. Electrical work
1. Other

#### Question 3: Exterior work details

> Only show if exterior work is selected. Users can select multiple options.

What kind of exterior work are you doing?

1. Roof modifications/repair
1. Garage door replacement
1. Deck construction
1. Garage modifications
1. Exterior doors
1. Fencing
1. Other

#### Question 4: Property addition details

> Only show if property addition is selected. Users can select **one** option.

1. ADU (Accessory dwelling unit)
2. Garage conversion
3. Basement/attic conversion
4. Other

#### Submit

Once the user is finished, they should be able to submit the form and get back the requirements. You'll need to show one of three requirements:

> ✅ **In-House Review Process**
>
> - A building permit is required.
> - Include plan sets.
> - Submit application for in-house review.

> ✅ **Over-the-Counter Submission Process**
>
> - A building permit is required.
> - Submit application for OTC review.

> ❌ **No Permit**
>
> - Nothing is required! You’re set to build.

### Requirements logic

#### In-House Review Required If Any Of:

- Any property addition work is selected (ADU, Garage conversion, etc.)
- New bathroom is selected
- New laundry room is selected
- If location is "San Francisco, CA" AND any structural work is selected (deck construction or garage modifications)
- Any "Other" option is selected in any category

#### OTC Review required If Any Of:

- Bathroom remodel
- Electrical work
- Roof modifications/repair
- If BOTH garage door replacement AND exterior doors are selected together

#### No Permit Required if:

- Not triggering full Review or OTC Review

#### Priority order:

1. Full Review
2. OTC Review
3. No Permit

## Submission Instructions

### Requirements

- **Place backend code in `backend/app`**

- **Place frontend code in `frontend/app`**

- **Do not modify the scaffold's internal configuration**

  - You can add dependencies that you're comfortable using, but do not change the stack

- Authentication/authorization is out of scope. Assume only one user will use this system.

### AI Code Assistants

You are welcome to use an AI code assistant of your choosing (Cursor, Copilot, Claude Code, etc).

### Submitting your response

1. Push the completed code for your solution to this repository
2. Record an up to 5-minute long video (Loom/YouTube unlisted video preferred) about your solution. Feel free to discuss any of the following, or what you feel is most useful for the reviewer to know:
   - Demo of your solution
   - Architecture overview
   - Key technical decisions
   - Challenges and solutions
   - Any AI tooling you used
   - Future improvements
3. Submit via Ashby with the repo URL (this repo) and a link to your video

## Documentation

If you don't have experience using the technology available in this scaffold, here are some links to get you started:

- React: https://react.dev/learn
- tRPC: https://trpc.io/docs
- shadcn/ui: https://ui.shadcn.com/docs/components/radio-group
- Tailwind: https://tailwindcss.com/
