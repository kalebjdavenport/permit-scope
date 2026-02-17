import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc"
import { zodResolver } from "@hookform/resolvers/zod"
import { CREATE_PROJECT_SCHEMA, CreateProjectSchema } from "@permitflow/backend/schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { Heading } from "./Heading"

export function CreateProjectPage() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/projects">Projects</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Project</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Heading>Create Project</Heading>
      <ProjectForm />
    </div>
  )
}

function ProjectForm() {
  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(CREATE_PROJECT_SCHEMA),
    defaultValues: {
      name: "",
      location: "San Francisco, CA"
    }
  })

  const navigate = useNavigate()

  const { mutateAsync: createProject } = useMutation(trpc.projects.create.mutationOptions())
  const queryClient = useQueryClient()

  const onSubmit = async (data: CreateProjectSchema) => {
    try {
      const project = await createProject(data)

      // Invalidate the projects query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: trpc.projects.pathKey() })

      navigate(`/projects/${project.id}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="self-start">
          Create Project
        </Button>
      </form>
    </Form>
  )
}
