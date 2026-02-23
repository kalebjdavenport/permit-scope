import { BlurFade } from "@/components/magicui/blur-fade"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { Link } from "react-router"
import { Heading } from "./Heading"

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
  const { data } = useQuery(trpc.projects.list.queryOptions())

  if (!data) {
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

  if (data.length === 0) {
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
      {data.map((project, i) => (
        <BlurFade key={project.id} delay={0.05 * i}>
          <ProjectCard project={project} />
        </BlurFade>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: { id: string; name: string; createdAt: string } }) {
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
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="transition-colors hover:border-primary/30 hover:shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive cursor-pointer"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label="Delete project"
            >
              <Trash2 className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}
