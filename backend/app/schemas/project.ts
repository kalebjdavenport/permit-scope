import { z } from "zod"

export const CREATE_PROJECT_SCHEMA = z.object({
  name: z.string().min(1),
  location: z.string().min(1)
})

export type CreateProjectSchema = z.infer<typeof CREATE_PROJECT_SCHEMA>
