import { BlurFade } from "@/components/magicui/blur-fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

  if (!data) return null

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
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </CardHeader>
      </Card>
    </Link>
  )
}
