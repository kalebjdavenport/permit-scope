import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { Heading } from "./Heading"

export function ProjectListPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/projects">Projects</Link>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button asChild>
          <Link to="/projects/new">Create Project</Link>
        </Button>
      </div>

      <Heading>Projects</Heading>

      <ProjectList />
    </div>
  )
}

function ProjectList() {
  const { data } = useQuery(trpc.projects.list.queryOptions())

  return (
    <>
      <Alert variant="default">
        <AlertTitle>Assignment Instructions</AlertTitle>
        <AlertDescription>
          Your take-home assignment response will go inside of a project.{" "}
          {data?.length === 0 && "Create a project to get started."}
          {!!data?.length && "Click into a project to get started."}
        </AlertDescription>
      </Alert>
      {data?.map((project) => (
        <Button asChild key={project.id} variant="ghost" className="w-auto justify-start">
          <Link to={`/projects/${project.id}`}>{project.name}</Link>
        </Button>
      ))}
      {data?.length === 0 && (
        <div className="text-sm text-muted-foreground">No projects found!</div>
      )}
    </>
  )
}
