import { BlurFade } from "@/components/magicui/blur-fade"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { Link } from "react-router"
import { Heading } from "./Heading"

type ProjectSummary = {
  id: string
  name: string
  location: string
  createdAt: string
}

export function ProjectListPage() {
  return (
    <div className="flex flex-col gap-6">
      <BlurFade>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Heading>Projects</Heading>
            <p className="text-muted-foreground text-sm -mt-1">
              Manage your construction permit applications
            </p>
          </div>
          <Button asChild>
            <Link to="/projects/new">New Project</Link>
          </Button>
        </div>
      </BlurFade>

      <ProjectList />
    </div>
  )
}

function ProjectList() {
  const projectsQuery = useQuery(trpc.projects.list.queryOptions())

  if (projectsQuery.isPending) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <BlurFade key={i} delay={0.05 * i}>
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              </CardHeader>
            </Card>
          </BlurFade>
        ))}
      </div>
    )
  }

  if (projectsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Could not load projects. Please refresh and try again.</AlertDescription>
      </Alert>
    )
  }

  if (projectsQuery.data.length === 0) {
    return (
      <BlurFade delay={0.1}>
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No projects yet. Create one to get started.
            </p>
            <Button asChild className="mt-4">
              <Link to="/projects/new">Create Your First Project</Link>
            </Button>
          </CardContent>
        </Card>
      </BlurFade>
    )
  }

  return (
    <div className="grid gap-3">
      {projectsQuery.data.map((project: ProjectSummary, i: number) => (
        <BlurFade key={project.id} delay={0.05 * i}>
          <ProjectCard project={project} />
        </BlurFade>
      ))}
    </div>
  )
}

function ProjectCard({
  project
}: {
  project: ProjectSummary
}) {
  const queryClient = useQueryClient()
  const deleteMutation = useMutation(trpc.projects.delete.mutationOptions())

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!window.confirm("Delete this project? This will also remove its questionnaire.")) return

    await deleteMutation.mutateAsync({ id: project.id })
    queryClient.invalidateQueries({ queryKey: trpc.projects.pathKey() })
  }

  return (
    <Card className="transition-colors hover:border-primary/30 hover:shadow-md">
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <Link
          to={`/projects/${project.id}`}
          className="block flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CardTitle>{project.name}</CardTitle>
          <CardDescription className="mt-1">
            {project.location}
          </CardDescription>
          <CardDescription>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </CardDescription>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          aria-label={`Delete ${project.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
    </Card>
  )
}
