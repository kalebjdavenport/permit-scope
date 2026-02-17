import { CREATE_PROJECT_SCHEMA } from "#app/schemas/project.ts"
import { procedure, router } from "#core/trpc.ts"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const projects = router({
  get: procedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const project = ctx.cradle.projects.get(input.id)

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found."
      })
    }

    return project
  }),

  list: procedure.query(async ({ ctx }) => {
    const records = ctx.cradle.projects.getAll()
    return records.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      name: record.name
    }))
  }),

  create: procedure.input(CREATE_PROJECT_SCHEMA).mutation(({ ctx, input }) => {
    const project = ctx.cradle.projects.add(input)

    return ctx.cradle.projects.toModel(project)
  })
})
